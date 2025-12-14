const { prisma } = require('../config/db');

const list = async (query) => {
  const items = await prisma.donMuaHang.findMany({
    include: {
      nhaCungCap: true,
      chiTiet: { include: { nguyenVatLieu: true } },
      phieuNhap: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return { items, query };
};

const create = async (payload) => {
  const { nhaCungCapId, items } = payload;
  return prisma.$transaction(async (tx) => {
    const po = await tx.donMuaHang.create({
      data: {
        nhaCungCapId,
        trangThai: 'MOITAO',
      },
    });
    if (items?.length) {
      await tx.chiTietDonMuaHang.createMany({
        data: items.map((i) => ({
          donMuaHangId: po.id,
          nguyenVatLieuId: i.nguyenVatLieuId,
          soLuong: i.soLuong,
          donGia: i.donGia,
        })),
      });
    }
    const full = await tx.donMuaHang.findUnique({
      where: { id: po.id },
      include: { chiTiet: true },
    });
    return full;
  });
};

const updateStatus = async (id, status) => {
  const po = await prisma.donMuaHang.update({ where: { id }, data: { trangThai: status } });
  return po;
};

const createReceipt = async (payload) => {
  const { donMuaHangId, nhanVienId = null, items } = payload;
  return prisma.$transaction(async (tx) => {
    const receipt = await tx.phieuNhapKho.create({
      data: {
        donMuaHangId,
        nhanVienId,
      },
    });
    for (const item of items) {
      await tx.chiTietNhapKho.create({
        data: {
          phieuNhapKhoId: receipt.id,
          nguyenVatLieuId: item.nguyenVatLieuId,
          soLuong: item.soLuong,
          donGia: item.donGia,
        },
      });
      const current = await tx.nguyenVatLieu.findUnique({ where: { id: item.nguyenVatLieuId } });
      await tx.nguyenVatLieu.update({
        where: { id: item.nguyenVatLieuId },
        data: {
          soLuongTon: Number(current.soLuongTon) + Number(item.soLuong),
          giaNhapGanNhat: item.donGia,
        },
      });
    }

    // Update PO status based on received quantities
    if (donMuaHangId) {
      const poLines = await tx.chiTietDonMuaHang.findMany({ where: { donMuaHangId } });
      const received = await tx.chiTietNhapKho.findMany({
        where: { phieuNhapKho: { donMuaHangId } },
      });
      const receivedMap = new Map();
      received.forEach((r) => {
        const total = receivedMap.get(r.nguyenVatLieuId) || 0;
        receivedMap.set(r.nguyenVatLieuId, total + Number(r.soLuong));
      });
      let full = true;
      poLines.forEach((l) => {
        const rec = receivedMap.get(l.nguyenVatLieuId) || 0;
        if (rec < Number(l.soLuong)) full = false;
      });
      await tx.donMuaHang.update({
        where: { id: donMuaHangId },
        data: { trangThai: full ? 'DANHANDU' : 'DANHANMOTPHAN' },
      });
    }

    return { message: 'Phiếu nhập tạo thành công', receiptId: receipt.id };
  });
};

const listSuppliers = async () => {
  const items = await prisma.nhaCungCap.findMany({ orderBy: { ten: 'asc' } });
  return { items };
};

module.exports = { list, create, updateStatus, createReceipt, listSuppliers };

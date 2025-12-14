const { prisma } = require('../config/db');
const { TABLE_STATUS } = require('../utils/constants');
const { broadcastTables } = require('../utils/tableStream');

const list = async (query) => {
  const where = {};
  if (query?.startDate && query?.endDate) {
    // Date range query for week view
    const start = new Date(query.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(query.endDate);
    end.setHours(23, 59, 59, 999);
    where.thoiGianDen = { gte: start, lte: end };
  } else if (query?.date) {
    const start = new Date(query.date);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    where.thoiGianDen = { gte: start, lt: end };
  }
  const items = await prisma.datBan.findMany({
    where,
    include: { ban: true, khachHang: true },
    orderBy: { thoiGianDen: 'asc' },
  });
  return { items, query };
};

const create = async (payload) => {
  const { khachHangId, tenKhach, soDienThoai, banId = null, soKhach, thoiGianDen, ghiChu } = payload;
  return prisma.$transaction(async (tx) => {
    let customerId = khachHangId;
    if (!customerId) {
      if (!tenKhach || !soDienThoai) throw Object.assign(new Error('Cần tên và số điện thoại khách'), { status: 400 });
      const customer = await tx.khachHang.upsert({
        where: { soDienThoai },
        update: { hoTen: tenKhach },
        create: { hoTen: tenKhach, soDienThoai },
      });
      customerId = customer.id;
    }
    const resv = await tx.datBan.create({
      data: { khachHangId: customerId, banId, soKhach, thoiGianDen: new Date(thoiGianDen), ghiChu },
    });
    if (banId) {
      await tx.ban.update({
        where: { id: banId },
        data: { trangThai: TABLE_STATUS.DADAT },
      });
    }
    return resv;
  }).then((resv) => {
    broadcastTables().catch(() => {});
    return resv;
  });
};

const updateStatus = async (id, payload) => {
  const { status, banId } = payload;
  const result = await prisma.$transaction(async (tx) => {
    const resv = await tx.datBan.update({ where: { id }, data: { trangThai: status, banId: banId || undefined } });
    const targetBan = banId || resv.banId;
    if (targetBan) {
      if (status === 'DANHANBAN') {
        await tx.ban.update({ where: { id: targetBan }, data: { trangThai: TABLE_STATUS.COKHACH } });
      }
      if (status === 'HUY' || status === 'KHONGDEN') {
        await tx.ban.update({ where: { id: targetBan }, data: { trangThai: TABLE_STATUS.TRONG } });
      }
    }
    return resv;
  });
  await broadcastTables().catch(() => {});
  return result;
};

module.exports = { list, create, updateStatus };

const { prisma } = require('../config/db');

const buildDateFilter = (query) => {
  const where = {};
  if (query?.from || query?.to) {
    where.createdAt = {};
    if (query.from) where.createdAt.gte = new Date(query.from);
    if (query.to) where.createdAt.lte = new Date(query.to);
  }
  return where;
};

const dashboard = async (query = {}) => {
  const where = buildDateFilter(query);
  const revenueAgg = await prisma.hoaDon.aggregate({ where, _sum: { tongThanhToan: true }, _count: true });
  const revenue = Number(revenueAgg._sum.tongThanhToan || 0);
  const bills = revenueAgg._count;
  const avgBill = bills ? revenue / bills : 0;

  // guest approximation: total servings sold in period
  const guestAgg = await prisma.chiTietDonHang.aggregate({
    where: {
      donHang: where,
      trangThai: { not: 'DAHUY' },
    },
    _sum: { soLuong: true },
  });
  const guests = Number(guestAgg._sum.soLuong || 0);

  const bestSellers = await prisma.chiTietDonHang.groupBy({
    by: ['monAnId'],
    where: { donHang: where, trangThai: { not: 'DAHUY' } },
    _sum: { soLuong: true, donGia: true },
    orderBy: { _sum: { soLuong: 'desc' } },
    take: 5,
  });
  const worstSellers = await prisma.chiTietDonHang.groupBy({
    by: ['monAnId'],
    where: { donHang: where, trangThai: { not: 'DAHUY' } },
    _sum: { soLuong: true, donGia: true },
    orderBy: { _sum: { soLuong: 'asc' } },
    take: 5,
  });
  const stockAlerts = (await prisma.nguyenVatLieu.findMany()).filter(
    (i) => Number(i.soLuongTon) < Number(i.mucTonToiThieu),
  );
  return { revenue, bills, avgBill, guests, bestSellers, worstSellers, stockAlerts };
};

const sales = async (query) => {
  const where = buildDateFilter(query);
  const items = await prisma.hoaDon.findMany({
    where,
    include: { donHang: true, thanhToan: true },
    orderBy: { createdAt: 'desc' },
  });
  return { items, query };
};

const menuPerformance = async (query) => {
  const where = buildDateFilter(query);
  const rows = await prisma.chiTietDonHang.groupBy({
    by: ['monAnId'],
    where: { donHang: where, trangThai: { not: 'DAHUY' } },
    _sum: { soLuong: true, donGia: true },
  });
  const totalRevenue = rows.reduce((sum, r) => sum + Number(r._sum.donGia || 0) * Number(r._sum.soLuong || 0), 0);
  const items = await Promise.all(
    rows.map(async (r) => {
      const dish = await prisma.monAn.findUnique({ where: { id: r.monAnId } });
      const qty = Number(r._sum.soLuong || 0);
      const revenue = Number(r._sum.donGia || 0) * qty;
      return {
        monAnId: r.monAnId,
        ten: dish?.ten || r.monAnId,
        soLuong: qty,
        doanhThu: revenue,
        tyTrong: totalRevenue ? (revenue / totalRevenue) * 100 : 0,
      };
    }),
  );
  return { items, query };
};

const inventory = async (query) => {
  const items = await prisma.nguyenVatLieu.findMany();
  return { items, query };
};

const attendance = async (query) => {
  const items = await prisma.chamCong.findMany({
    include: { lichPhanCa: { include: { nhanVien: true, caLamViec: true } } },
    orderBy: { thoiGianVao: 'desc' },
  });
  const mapped = items.map((i) => {
    const hours =
      i.thoiGianRa && i.thoiGianVao
        ? (new Date(i.thoiGianRa).getTime() - new Date(i.thoiGianVao).getTime()) / 3600000
        : 0;
    return { ...i, hours };
  });
  return { items: mapped, query };
};

module.exports = { dashboard, sales, menuPerformance, inventory, attendance };

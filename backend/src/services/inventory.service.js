const { prisma } = require('../config/db');
const { sendLowStockAlert } = require('./email.service');

// ==================== MATERIALS ====================

const listMaterials = async () => {
  const items = await prisma.nguyenVatLieu.findMany({
    orderBy: { ten: 'asc' },
  });
  return { 
    items: items.map((m) => ({
      id: m.id,
      ten: m.ten,
      donViTinh: m.donViTinh,
      soLuongTon: Number(m.soLuongTon),
      mucTonToiThieu: Number(m.mucTonToiThieu),
      giaNhapGanNhat: m.giaNhapGanNhat ? Number(m.giaNhapGanNhat) : null,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    })),
  };
};

const getMaterial = async (id) => {
  const mat = await prisma.nguyenVatLieu.findUnique({ where: { id } });
  if (!mat) throw Object.assign(new Error('Nguyên vật liệu không tồn tại'), { status: 404 });
  return mat;
};

const createMaterial = async (payload) => {
  const { ten, donViTinh, soLuongTon = 0, mucTonToiThieu = 0, giaNhapGanNhat = null } = payload;
  if (!ten || !donViTinh) {
    throw Object.assign(new Error('Thiếu thông tin nguyên vật liệu'), { status: 400 });
  }
  const mat = await prisma.nguyenVatLieu.create({
    data: { ten, donViTinh, soLuongTon, mucTonToiThieu, giaNhapGanNhat },
  });
  return { message: 'Tạo nguyên vật liệu thành công', material: mat };
};

const updateMaterial = async (id, payload) => {
  const { ten, donViTinh, mucTonToiThieu, giaNhapGanNhat } = payload;
  const existing = await prisma.nguyenVatLieu.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Nguyên vật liệu không tồn tại'), { status: 404 });
  
  const mat = await prisma.nguyenVatLieu.update({
    where: { id },
    data: {
      ...(ten && { ten }),
      ...(donViTinh && { donViTinh }),
      ...(mucTonToiThieu !== undefined && { mucTonToiThieu }),
      ...(giaNhapGanNhat !== undefined && { giaNhapGanNhat }),
    },
  });
  return { message: 'Cập nhật nguyên vật liệu thành công', material: mat };
};

const deleteMaterial = async (id) => {
  // Check if used in recipes
  const recipeCount = await prisma.congThucMon.count({ where: { nguyenVatLieuId: id } });
  if (recipeCount > 0) {
    throw Object.assign(new Error('Không thể xóa nguyên vật liệu đang sử dụng trong công thức'), { status: 400 });
  }
  await prisma.nguyenVatLieu.delete({ where: { id } }).catch(() => null);
  return { message: 'Xóa nguyên vật liệu thành công' };
};

// ==================== ALERTS ====================

const listAlerts = async () => {
  const all = await prisma.nguyenVatLieu.findMany();
  const alerts = all.filter((i) => Number(i.soLuongTon) <= Number(i.mucTonToiThieu));
  return { 
    alerts: alerts.map((m) => ({
      id: m.id,
      ten: m.ten,
      donViTinh: m.donViTinh,
      soLuongTon: Number(m.soLuongTon),
      mucTonToiThieu: Number(m.mucTonToiThieu),
    })),
  };
};

// Check and send email alert for low stock items
const checkAndSendLowStockAlert = async () => {
  const { alerts } = await listAlerts();
  if (alerts.length > 0) {
    const result = await sendLowStockAlert(alerts);
    return { alertCount: alerts.length, emailResult: result };
  }
  return { alertCount: 0, message: 'No low stock items' };
};

// ==================== STOCK ADJUSTMENTS ====================

const ADJUSTMENT_TYPES = {
  NHAP: 'NHAP',      // Add stock
  XUAT: 'XUAT',      // Remove stock (usage)
  HUYHANG: 'HUYHANG', // Waste/disposal
  DIEUCHINH: 'DIEUCHINH', // Manual adjustment
};

const listAdjustments = async (query = {}) => {
  const where = {};
  if (query.nguyenVatLieuId) where.nguyenVatLieuId = query.nguyenVatLieuId;
  if (query.loai) where.loai = query.loai;
  if (query.startDate || query.endDate) {
    where.createdAt = {};
    if (query.startDate) where.createdAt.gte = new Date(query.startDate);
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  const items = await prisma.nhatKyXuatKho.findMany({
    where,
    include: { nguyenVatLieu: true },
    orderBy: { createdAt: 'desc' },
  });
  return { 
    items: items.map((a) => ({
      id: a.id,
      loai: a.loai,
      soLuong: Number(a.soLuong),
      ghiChu: a.ghiChu,
      createdAt: a.createdAt,
      nguyenVatLieu: a.nguyenVatLieu ? {
        id: a.nguyenVatLieu.id,
        ten: a.nguyenVatLieu.ten,
        donViTinh: a.nguyenVatLieu.donViTinh,
      } : null,
    })),
  };
};

const createAdjustment = async (payload, user = null) => {
  const { nguyenVatLieuId, loai, soLuong, ghiChu } = payload;

  if (!nguyenVatLieuId || !loai || soLuong === undefined) {
    throw Object.assign(new Error('Thiếu thông tin điều chỉnh'), { status: 400 });
  }
  if (!Object.values(ADJUSTMENT_TYPES).includes(loai)) {
    throw Object.assign(new Error('Loại điều chỉnh không hợp lệ'), { status: 400 });
  }

  const mat = await prisma.nguyenVatLieu.findUnique({ where: { id: nguyenVatLieuId } });
  if (!mat) throw Object.assign(new Error('Nguyên vật liệu không tồn tại'), { status: 404 });

  const quantity = Number(soLuong);
  let newStock = Number(mat.soLuongTon);

  // Calculate new stock based on adjustment type
  if (loai === ADJUSTMENT_TYPES.NHAP) {
    newStock += quantity;
  } else if (loai === ADJUSTMENT_TYPES.XUAT || loai === ADJUSTMENT_TYPES.HUYHANG) {
    newStock -= quantity;
    if (newStock < 0) {
      throw Object.assign(new Error('Số lượng tồn không đủ'), { status: 400 });
    }
  } else if (loai === ADJUSTMENT_TYPES.DIEUCHINH) {
    // Direct set to the quantity
    newStock = quantity;
  }

  // Create adjustment record and update stock
  const [adjustment] = await prisma.$transaction([
    prisma.nhatKyXuatKho.create({
      data: { nguyenVatLieuId, loai, soLuong: quantity, ghiChu: ghiChu || null },
    }),
    prisma.nguyenVatLieu.update({
      where: { id: nguyenVatLieuId },
      data: { soLuongTon: newStock },
    }),
  ]);

  // Audit log for critical inventory adjustment
  await prisma.nhatKyHeThong.create({
    data: {
      hanhDong: 'INVENTORY_ADJUST',
      thongTinBoSung: JSON.stringify({
        nguyenVatLieuId,
        tenNVL: mat.ten,
        loai,
        soLuong: quantity,
        soLuongTruoc: Number(mat.soLuongTon),
        soLuongSau: newStock,
        ghiChu,
        userId: user?.id || null,
        username: user?.username || null,
      }),
    },
  });

  return { message: 'Điều chỉnh tồn kho thành công', adjustment, newStock };
};

// Bulk adjustment for multiple materials
const createBulkAdjustment = async (payload, user = null) => {
  const { items, loai, ghiChu } = payload;

  if (!items || items.length === 0) {
    throw Object.assign(new Error('Danh sách nguyên vật liệu trống'), { status: 400 });
  }

  const results = [];
  for (const item of items) {
    try {
      const result = await createAdjustment({
        nguyenVatLieuId: item.nguyenVatLieuId,
        loai,
        soLuong: item.soLuong,
        ghiChu,
      }, user);
      results.push({ ...item, success: true, newStock: result.newStock });
    } catch (err) {
      results.push({ ...item, success: false, error: err.message });
    }
  }

  return { message: `Đã xử lý ${results.filter((r) => r.success).length}/${results.length} mục`, results };
};

// ==================== RECIPES ====================

const computeCost = (lines) =>
  lines.reduce(
    (sum, line) => sum + Number(line.soLuong) * Number(line.nguyenVatLieu?.giaNhapGanNhat || 0),
    0,
  );

const upsertRecipe = async (payload) => {
  const { monAnId, ingredients } = payload;
  const recipe = await prisma.$transaction(async (tx) => {
    await tx.congThucMon.deleteMany({ where: { monAnId } });
    if (ingredients?.length) {
      await tx.congThucMon.createMany({
        data: ingredients.map((i) => ({
          monAnId,
          nguyenVatLieuId: i.nguyenVatLieuId,
          soLuong: i.soLuong,
        })),
      });
    }
    const recipe = await tx.congThucMon.findMany({
      where: { monAnId },
      include: { nguyenVatLieu: true },
    });
    return recipe;
  });
  const foodCost = computeCost(recipe);
  return { monAnId, recipe, foodCost };
};

const getRecipe = async (monAnId) => {
  const recipe = await prisma.congThucMon.findMany({
    where: { monAnId },
    include: { nguyenVatLieu: true },
  });
  const foodCost = computeCost(recipe);
  return { monAnId, recipe, foodCost };
};

module.exports = { 
  listMaterials, 
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  listAlerts,
  checkAndSendLowStockAlert,
  listAdjustments,
  createAdjustment,
  createBulkAdjustment,
  upsertRecipe, 
  getRecipe,
};

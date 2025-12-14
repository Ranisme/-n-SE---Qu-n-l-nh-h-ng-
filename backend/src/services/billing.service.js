const bcrypt = require('bcryptjs');

const { prisma } = require('../config/db');
const { TABLE_STATUS } = require('../utils/constants');
const { broadcastTables } = require('../utils/tableStream');
const { checkAndSendLowStockAlert } = require('./inventory.service');
const customersService = require('./customers.service');

const listOpen = async () => {
  const invoices = await prisma.hoaDon.findMany({
    where: { trangThai: { not: 'PAID' } },
    include: { donHang: { include: { ban: true, nhanVien: true, chiTiet: { include: { monAn: true } } } }, thanhToan: true },
  });
  return { invoices };
};

/**
 * List pending orders that don't have invoices yet (ready for checkout)
 */
const listPendingOrders = async () => {
  const orders = await prisma.donHang.findMany({
    where: {
      hoaDon: { none: {} },
      trangThai: { notIn: ['CLOSED', 'CANCELLED'] },
    },
    include: {
      ban: { include: { khuVuc: true } },
      nhanVien: true,
      chiTiet: {
        where: { trangThai: { not: 'DAHUY' } },
        include: { monAn: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate totals for each order
  const vatConfig = await prisma.cauHinhHeThong.findUnique({ where: { key: 'VAT' } });
  const vatRate = vatConfig ? Number(vatConfig.value) : 10;

  const ordersWithTotals = orders.map((order) => {
    let subtotal = 0;
    order.chiTiet.forEach((ct) => {
      subtotal += Number(ct.donGia) * ct.soLuong;
    });
    const vat = (subtotal * vatRate) / 100;
    const total = subtotal + vat;

    return {
      id: order.id,
      table: order.ban,
      staff: order.nhanVien,
      status: order.trangThai,
      items: order.chiTiet,
      itemCount: order.chiTiet.length,
      subtotal,
      vat,
      total,
      createdAt: order.createdAt,
    };
  });

  return { orders: ordersWithTotals };
};

// Verify manager PIN for discount approval
const verifyManagerPinForDiscount = async (managerPin, managerUsername) => {
  if (!managerPin) throw Object.assign(new Error('Cần mã PIN của quản lý để áp dụng giảm giá'), { status: 400 });

  const managerAccounts = await prisma.taiKhoanNguoiDung.findMany({
    where: {
      ...(managerUsername ? { username: managerUsername } : {}),
      nhanVien: {
        vaiTro: {
          quyen: {
            some: { quyen: { ma: 'DISCOUNT' } },
          },
        },
      },
    },
    include: { nhanVien: true },
  });

  for (const acc of managerAccounts) {
    const ok = await bcrypt.compare(managerPin, acc.passwordHash);
    if (ok) return acc;
  }
  throw Object.assign(new Error('PIN không hợp lệ hoặc không có quyền giảm giá'), { status: 401 });
};

const computeTotals = (order, discount) => {
  let tongTienHang = 0;
  order.chiTiet
    .filter((ct) => ct.trangThai !== 'DAHUY')
    .forEach((ct) => {
      // donGia đã bao gồm giá tùy chọn ở bước tạo đơn
      tongTienHang += Number(ct.donGia) * ct.soLuong;
    });
  const giamGia = discount || 0;
  const vatConfig = order.vatConfig;
  const vatRate = vatConfig ? Number(vatConfig.value) : 0;
  const thueVAT = ((tongTienHang - giamGia) * vatRate) / 100;
  const tongThanhToan = tongTienHang - giamGia + thueVAT;
  return { tongTienHang, giamGia, thueVAT, tongThanhToan };
};

const createFromOrder = async (orderId, payload, user = null) => {
  const discountAmount = Number(payload.discount || 0);
  
  // If discount is applied, require manager approval
  let approver = null;
  if (discountAmount > 0) {
    approver = await verifyManagerPinForDiscount(payload.managerPin, payload.managerUsername);
  }

  return prisma.$transaction(async (tx) => {
    const order = await tx.donHang.findUnique({
      where: { id: orderId },
      include: {
        chiTiet: { include: { tuyChon: { include: { tuyChonMon: true } } } },
      },
    });
    if (!order) throw Object.assign(new Error('Đơn hàng không tồn tại'), { status: 404 });
    const vatConfig = await tx.cauHinhHeThong.findUnique({ where: { key: 'VAT' } });
    order.vatConfig = vatConfig;

    const { tongTienHang, giamGia, thueVAT, tongThanhToan } = computeTotals(order, discountAmount);

    const invoice = await tx.hoaDon.create({
      data: {
        donHangId: orderId,
        tongTienHang,
        giamGia,
        thueVAT,
        tongThanhToan,
        trangThai: 'OPEN',
      },
    });

    // Audit log if discount is applied (with approver info)
    if (giamGia > 0) {
      await tx.nhatKyHeThong.create({
        data: {
          hanhDong: 'APPLY_DISCOUNT',
          thongTinBoSung: JSON.stringify({
            invoiceId: invoice.id,
            orderId,
            tongTienHang,
            giamGia,
            tongThanhToan,
            requestedBy: user?.id || null,
            requestedByUsername: user?.username || null,
            approvedBy: approver?.nhanVienId || null,
            approvedByUsername: approver?.username || null,
          }),
        },
      });
    }

    return invoice;
  });
};

const deductStockForOrder = async (tx, orderId) => {
  const lines = await tx.chiTietDonHang.findMany({
    where: { donHangId: orderId, trangThai: { not: 'DAHUY' } },
    include: { monAn: { include: { congThuc: true } } },
  });
  const need = new Map();
  lines.forEach((line) => {
    line.monAn.congThuc.forEach((ct) => {
      const required = (need.get(ct.nguyenVatLieuId) || 0) + Number(ct.soLuong) * line.soLuong;
      need.set(ct.nguyenVatLieuId, required);
    });
  });
  const nvlList = await tx.nguyenVatLieu.findMany({ where: { id: { in: Array.from(need.keys()) } } });
  for (const nvl of nvlList) {
    const required = need.get(nvl.id) || 0;
    const newQty = Number(nvl.soLuongTon) - required;
    await tx.nguyenVatLieu.update({
      where: { id: nvl.id },
      data: { soLuongTon: newQty },
    });
    await tx.nhatKyXuatKho.create({
      data: {
        loai: 'BANHANG',
        nguyenVatLieuId: nvl.id,
        soLuong: required,
        ghiChu: `Auto deduct for order ${orderId}`,
      },
    });
  }
};

const pay = async (invoiceId, payload, user) => {
  const { payments, usePoints = 0, khachHangId = null } = payload;
  
  // QĐ-LOYALTY: Validate and apply points redemption before transaction
  let pointsDiscount = 0;
  if (usePoints > 0 && khachHangId) {
    const customer = await prisma.khachHang.findUnique({ where: { id: khachHangId } });
    if (!customer) throw Object.assign(new Error('Khách hàng không tồn tại'), { status: 404 });
    if (customer.diemTichLuy < usePoints) {
      throw Object.assign(new Error(`Không đủ điểm. Hiện có: ${customer.diemTichLuy}`), { status: 400 });
    }
    pointsDiscount = usePoints * 1000; // 1 point = 1,000 VND
  }

  const result = await prisma.$transaction(async (tx) => {
    const invoice = await tx.hoaDon.findUnique({
      where: { id: invoiceId },
      include: { donHang: true, thanhToan: true },
    });
    if (!invoice) throw Object.assign(new Error('Hóa đơn không tồn tại'), { status: 404 });
    if (invoice.trangThai === 'PAID') throw Object.assign(new Error('Hóa đơn đã thanh toán'), { status: 400 });

    const shift = user?.id ? await tx.caThuNgan.findFirst({ where: { nhanVienId: user.id, trangThai: 'HOATDONG' } }) : null;

    // Apply points discount to remaining amount
    let remaining = Math.max(0, Number(invoice.tongThanhToan) - pointsDiscount);
    let changeDue = 0;
    let totalPaid = pointsDiscount;

    for (const p of payments) {
      const amount = Number(p.amount);
      if (p.method !== 'TienMat' && amount > remaining) {
        throw Object.assign(new Error('Thanh toán không tiền mặt phải bằng hoặc nhỏ hơn số còn lại'), { status: 400 });
      }
      const applied = Math.min(amount, remaining);
      const changeForPayment = p.method === 'TienMat' ? Math.max(0, amount - remaining) : 0;
      remaining -= applied;
      changeDue += changeForPayment;
      totalPaid += amount;

      await tx.thanhToan.create({
        data: {
          hoaDonId: invoiceId,
          phuongThuc: p.method,
          soTien: amount,
          ghiChu: JSON.stringify({
            note: p.note || null,
            appliedAmount: applied,
            changeReturned: changeForPayment,
            shiftId: shift?.id || null,
            cashierId: user?.id || null,
          }),
        },
      });
    }

    if (remaining > 0) {
      throw Object.assign(new Error('Số tiền thanh toán chưa đủ'), { status: 400 });
    }

    // QĐ-LOYALTY: Deduct points used for payment
    if (usePoints > 0 && khachHangId) {
      await tx.lichSuTichDiem.create({
        data: {
          khachHangId,
          diemCong: 0,
          diemTru: usePoints,
          moTa: `Đổi ${usePoints} điểm - HĐ ${invoiceId.slice(0, 8)}`,
        },
      });
      await tx.khachHang.update({
        where: { id: khachHangId },
        data: { diemTichLuy: { decrement: usePoints } },
      });
    }

    await deductStockForOrder(tx, invoice.donHangId);

    await tx.hoaDon.update({
      where: { id: invoiceId },
      data: { trangThai: 'PAID' },
    });

    // QĐ-ALERT: Schedule low stock alert check after transaction
    setImmediate(() => checkAndSendLowStockAlert().catch(() => {}));
    await tx.donHang.update({
      where: { id: invoice.donHangId },
      data: { trangThai: 'CLOSED' },
    });
    await tx.ban.update({
      where: { id: invoice.donHang.banId },
      data: { trangThai: TABLE_STATUS.TRONG },
    }).catch(() => {});

    return { 
      message: 'Thanh toán thành công', 
      invoiceId, 
      changeDue, 
      totalPaid, 
      pointsUsed: usePoints,
      pointsDiscount,
      shiftId: shift?.id || null, 
      banId: invoice.donHang.banId,
      tongThanhToan: invoice.tongThanhToan,
      khachHangId,
    };
  });

  await broadcastTables().catch(() => {});
  
  // QĐ-LOYALTY: Earn points for customer after successful payment (outside transaction)
  if (khachHangId && result.tongThanhToan > 0) {
    try {
      const earnResult = await customersService.addPoints(
        khachHangId,
        Number(result.tongThanhToan),
        `Tích điểm từ HĐ ${invoiceId.slice(0, 8)}`
      );
      result.pointsEarned = earnResult.added;
      result.newPointsTotal = earnResult.newTotal;
      result.memberTier = earnResult.newTier;
    } catch (e) {
      // Log but don't fail payment if points earning fails
      console.error('Failed to add loyalty points:', e.message);
    }
  }
  
  return result;
};

const findOpenShift = async (userId) =>
  prisma.caThuNgan.findFirst({
    where: { nhanVienId: userId, trangThai: 'HOATDONG' },
    orderBy: { thoiGianMo: 'desc' },
  });

const openShift = async (user, payload) => {
  if (!user?.id) throw Object.assign(new Error('Thiếu thông tin nhân viên'), { status: 400 });
  const existing = await findOpenShift(user.id);
  if (existing) throw Object.assign(new Error('Đang có ca mở'), { status: 400 });

  const shift = await prisma.caThuNgan.create({
    data: {
      nhanVienId: user.id,
      thoiGianMo: new Date(),
      tienMatDauCa: payload.openingCash,
      trangThai: 'HOATDONG',
    },
  });
  return { shift };
};

const summarizeShiftPayments = (payments, shiftId) => {
  const byMethod = {};
  payments.forEach((p) => {
    const meta = (() => {
      try {
        return JSON.parse(p.ghiChu || '{}');
      } catch (_) {
        return {};
      }
    })();
    if (shiftId && meta.shiftId && meta.shiftId !== shiftId) return;
    const applied = Number(meta.appliedAmount ?? p.soTien);
    if (!byMethod[p.phuongThuc]) {
      byMethod[p.phuongThuc] = { total: 0, count: 0 };
    }
    byMethod[p.phuongThuc].total += applied;
    byMethod[p.phuongThuc].count += 1;
  });
  return byMethod;
};

const closeShift = async (user, shiftId, payload) => {
  const shift = await prisma.caThuNgan.findUnique({ where: { id: shiftId } });
  if (!shift) throw Object.assign(new Error('Ca thu ngân không tồn tại'), { status: 404 });
  if (shift.trangThai === 'DADONG') throw Object.assign(new Error('Ca đã đóng'), { status: 400 });
  if (shift.nhanVienId !== user?.id) throw Object.assign(new Error('Không thể đóng ca của người khác'), { status: 403 });

  const endTime = new Date();
  const payments = await prisma.thanhToan.findMany({
    where: { createdAt: { gte: shift.thoiGianMo, lte: endTime } },
  });
  const summary = summarizeShiftPayments(payments, shift.id);
  const cashIn = summary.TienMat?.total || 0;
  const expectedCash = Number(shift.tienMatDauCa || 0) + cashIn;
  const actualCash = Number(payload.actualCash);
  const variance = actualCash - expectedCash;

  const closed = await prisma.caThuNgan.update({
    where: { id: shiftId },
    data: { thoiGianDong: endTime, tienMatThuc: actualCash, trangThai: 'DADONG' },
  });
  return { shift: closed, summary, expectedCash, variance };
};

const getCurrentShift = async (user) => {
  if (!user?.id) throw Object.assign(new Error('Thiếu thông tin nhân viên'), { status: 400 });
  const shift = await findOpenShift(user.id);
  if (!shift) return { shift: null, summary: null };
  const payments = await prisma.thanhToan.findMany({
    where: { createdAt: { gte: shift.thoiGianMo } },
  });
  const summary = summarizeShiftPayments(payments, shift.id);
  return { shift, summary };
};

/**
 * Split bill by items - create new invoice with selected items
 * @param {string} invoiceId - Original invoice ID
 * @param {Array} itemIds - Array of ChiTietDonHang IDs to split
 * @returns {Object} New invoice
 */
const splitBillByItems = async (invoiceId, itemIds) => {
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.hoaDon.findUnique({
      where: { id: invoiceId },
      include: { 
        donHang: { 
          include: { 
            chiTiet: { include: { tuyChon: { include: { tuyChonMon: true } } } },
            ban: true 
          } 
        } 
      },
    });
    if (!invoice) throw Object.assign(new Error('Hóa đơn không tồn tại'), { status: 404 });
    if (invoice.trangThai === 'PAID') throw Object.assign(new Error('Hóa đơn đã thanh toán'), { status: 400 });

    const selectedItems = invoice.donHang.chiTiet.filter(
      (ct) => itemIds.includes(ct.id) && ct.trangThai !== 'DAHUY'
    );
    if (!selectedItems.length) throw Object.assign(new Error('Không có món nào được chọn'), { status: 400 });

    // Create new order for split items
    const newOrder = await tx.donHang.create({
      data: {
        banId: invoice.donHang.banId,
        nhanVienId: invoice.donHang.nhanVienId,
        trangThai: 'open',
        ghiChu: `Tách từ đơn ${invoice.donHangId}`,
      },
    });

    // Copy selected items to new order
    let tongTienMoi = 0;
    for (const item of selectedItems) {
      const newItem = await tx.chiTietDonHang.create({
        data: {
          donHangId: newOrder.id,
          monAnId: item.monAnId,
          soLuong: item.soLuong,
          donGia: item.donGia,
          trangThai: item.trangThai,
          ghiChu: item.ghiChu,
        },
      });
      // Copy modifiers
      for (const opt of item.tuyChon) {
        await tx.chiTietTuyChonMon.create({
          data: {
            chiTietDonHangId: newItem.id,
            tuyChonMonId: opt.tuyChonMonId,
            monAnId: opt.monAnId,
          },
        });
      }
      tongTienMoi += Number(item.donGia) * item.soLuong;
      
      // Remove from original order
      await tx.chiTietDonHang.delete({ where: { id: item.id } });
    }

    // Calculate VAT for new invoice
    const vatConfig = await tx.cauHinhHeThong.findUnique({ where: { key: 'VAT' } });
    const vatRate = vatConfig ? Number(vatConfig.value) : 0;
    const thueVATMoi = (tongTienMoi * vatRate) / 100;

    // Create new invoice
    const newInvoice = await tx.hoaDon.create({
      data: {
        donHangId: newOrder.id,
        tongTienHang: tongTienMoi,
        giamGia: 0,
        thueVAT: thueVATMoi,
        tongThanhToan: tongTienMoi + thueVATMoi,
        trangThai: 'OPEN',
      },
    });

    // Recalculate original invoice
    const remainingItems = invoice.donHang.chiTiet.filter(
      (ct) => !itemIds.includes(ct.id) && ct.trangThai !== 'DAHUY'
    );
    let tongTienCu = 0;
    remainingItems.forEach((ct) => {
      tongTienCu += Number(ct.donGia) * ct.soLuong;
    });
    const thueVATCu = (tongTienCu * vatRate) / 100;

    await tx.hoaDon.update({
      where: { id: invoiceId },
      data: {
        tongTienHang: tongTienCu,
        thueVAT: thueVATCu,
        tongThanhToan: tongTienCu - Number(invoice.giamGia || 0) + thueVATCu,
      },
    });

    return { 
      message: 'Tách hóa đơn thành công', 
      newInvoice,
      originalInvoiceId: invoiceId,
    };
  });
};

/**
 * Split bill equally by number of people
 * @param {string} invoiceId - Original invoice ID
 * @param {number} numPeople - Number of people to split
 * @returns {Array} Array of new invoices
 */
const splitBillByPeople = async (invoiceId, numPeople) => {
  if (numPeople < 2) throw Object.assign(new Error('Số người phải >= 2'), { status: 400 });

  return prisma.$transaction(async (tx) => {
    const invoice = await tx.hoaDon.findUnique({
      where: { id: invoiceId },
      include: { donHang: { include: { ban: true } } },
    });
    if (!invoice) throw Object.assign(new Error('Hóa đơn không tồn tại'), { status: 404 });
    if (invoice.trangThai === 'PAID') throw Object.assign(new Error('Hóa đơn đã thanh toán'), { status: 400 });

    const totalAmount = Number(invoice.tongThanhToan);
    const amountPerPerson = Math.floor(totalAmount / numPeople);
    const remainder = totalAmount - (amountPerPerson * numPeople);

    const newInvoices = [];
    
    // Create (numPeople - 1) new invoices with equal amounts
    for (let i = 0; i < numPeople - 1; i++) {
      // Create placeholder order for split invoice
      const newOrder = await tx.donHang.create({
        data: {
          banId: invoice.donHang.banId,
          nhanVienId: invoice.donHang.nhanVienId,
          trangThai: 'open',
          ghiChu: `Chia ${numPeople} người từ HĐ ${invoiceId} - Phần ${i + 1}`,
        },
      });

      const newInv = await tx.hoaDon.create({
        data: {
          donHangId: newOrder.id,
          tongTienHang: amountPerPerson,
          giamGia: 0,
          thueVAT: 0,
          tongThanhToan: amountPerPerson,
          trangThai: 'OPEN',
        },
      });
      newInvoices.push(newInv);
    }

    // Update original invoice with remaining amount (includes remainder)
    const remainingAmount = amountPerPerson + remainder;
    await tx.hoaDon.update({
      where: { id: invoiceId },
      data: {
        tongTienHang: remainingAmount,
        giamGia: 0,
        thueVAT: 0,
        tongThanhToan: remainingAmount,
      },
    });

    return {
      message: `Tách hóa đơn cho ${numPeople} người thành công`,
      amountPerPerson,
      remainder,
      newInvoices,
      originalInvoiceId: invoiceId,
    };
  });
};

/**
 * Get invoice details with items for splitting
 */
const getInvoiceDetails = async (invoiceId) => {
  const invoice = await prisma.hoaDon.findUnique({
    where: { id: invoiceId },
    include: {
      donHang: {
        include: {
          ban: true,
          chiTiet: {
            where: { trangThai: { not: 'DAHUY' } },
            include: {
              monAn: true,
              tuyChon: { include: { tuyChonMon: true } },
            },
          },
        },
      },
      thanhToan: true,
    },
  });
  if (!invoice) throw Object.assign(new Error('Hóa đơn không tồn tại'), { status: 404 });
  return invoice;
};

/**
 * Generate invoice/receipt data for printing/export
 */
const getInvoicePrintData = async (invoiceId) => {
  const invoice = await prisma.hoaDon.findUnique({
    where: { id: invoiceId },
    include: {
      donHang: {
        include: {
          ban: { include: { khuVuc: true } },
          nhanVien: true,
          chiTiet: {
            where: { trangThai: { not: 'DAHUY' } },
            include: {
              monAn: true,
              tuyChon: { include: { tuyChonMon: true } },
            },
          },
        },
      },
      thanhToan: true,
    },
  });
  if (!invoice) throw Object.assign(new Error('Hóa đơn không tồn tại'), { status: 404 });

  // Get restaurant info from config
  const configs = await prisma.cauHinhHeThong.findMany({
    where: {
      key: { in: ['RESTAURANT_NAME', 'RESTAURANT_ADDRESS', 'RESTAURANT_PHONE', 'RESTAURANT_TAX_ID', 'VAT'] },
    },
  });
  const configMap = configs.reduce((m, c) => ({ ...m, [c.key]: c.value }), {});

  // Format items for print
  const items = invoice.donHang.chiTiet.map((ct) => {
    const optionNames = ct.tuyChon?.map((t) => t.tuyChonMon?.ten).filter(Boolean).join(', ');
    const optionPrice = ct.tuyChon?.reduce((sum, t) => sum + Number(t.tuyChonMon?.giaThem || 0), 0) || 0;
    return {
      name: ct.monAn?.ten || 'Món không xác định',
      quantity: ct.soLuong,
      unitPrice: Number(ct.donGia),
      options: optionNames || null,
      optionPrice,
      lineTotal: Number(ct.donGia) * ct.soLuong,
      note: ct.ghiChu || null,
    };
  });

  // Format payments
  const payments = invoice.thanhToan?.map((p) => {
    let meta = {};
    try { meta = JSON.parse(p.ghiChu || '{}'); } catch (_) {}
    return {
      method: p.phuongThuc,
      amount: Number(p.soTien),
      appliedAmount: meta.appliedAmount || Number(p.soTien),
      change: meta.changeReturned || 0,
    };
  }) || [];

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const changeDue = payments.reduce((s, p) => s + p.change, 0);

  return {
    invoice: {
      id: invoice.id,
      createdAt: invoice.createdAt,
      status: invoice.trangThai,
      subtotal: Number(invoice.tongTienHang),
      discount: Number(invoice.giamGia),
      vat: Number(invoice.thueVAT),
      vatRate: configMap.VAT ? Number(configMap.VAT) : 10,
      total: Number(invoice.tongThanhToan),
    },
    order: {
      id: invoice.donHang.id,
      orderNumber: invoice.donHang.maDonHang,
      createdAt: invoice.donHang.createdAt,
    },
    table: {
      name: invoice.donHang.ban?.ten || 'Mang đi',
      area: invoice.donHang.ban?.khuVuc?.ten || '',
    },
    server: {
      name: invoice.donHang.nhanVien?.ten || 'Không xác định',
    },
    restaurant: {
      name: configMap.RESTAURANT_NAME || 'L\'Ami Restaurant',
      address: configMap.RESTAURANT_ADDRESS || '',
      phone: configMap.RESTAURANT_PHONE || '',
      taxId: configMap.RESTAURANT_TAX_ID || '',
    },
    items,
    payments,
    summary: {
      totalPaid,
      changeDue,
    },
    printedAt: new Date(),
  };
};

/**
 * Export invoices to JSON/CSV
 */
const exportInvoices = async (filters = {}) => {
  const { startDate, endDate, status, format = 'json' } = filters;

  const where = {};
  if (status) where.trangThai = status;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const invoices = await prisma.hoaDon.findMany({
    where,
    include: {
      donHang: {
        include: {
          ban: true,
          chiTiet: {
            include: { monAn: true },
          },
        },
      },
      thanhToan: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (format === 'csv') {
    // Generate CSV string
    const headers = ['Invoice ID', 'Date', 'Table', 'Subtotal', 'Discount', 'VAT', 'Total', 'Status', 'Payment Methods'];
    const rows = invoices.map((inv) => {
      const paymentMethods = inv.thanhToan?.map((p) => p.phuongThuc).join('; ') || '';
      return [
        inv.id,
        inv.createdAt.toISOString(),
        inv.donHang?.ban?.ten || 'Mang đi',
        Number(inv.tongTienHang),
        Number(inv.giamGia),
        Number(inv.thueVAT),
        Number(inv.tongThanhToan),
        inv.trangThai,
        paymentMethods,
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    return { format: 'csv', data: csv, filename: `invoices_${Date.now()}.csv` };
  }

  // JSON format
  return {
    format: 'json',
    data: invoices.map((inv) => ({
      id: inv.id,
      createdAt: inv.createdAt,
      table: inv.donHang?.ban?.ten || 'Mang đi',
      subtotal: Number(inv.tongTienHang),
      discount: Number(inv.giamGia),
      vat: Number(inv.thueVAT),
      total: Number(inv.tongThanhToan),
      status: inv.trangThai,
      items: inv.donHang?.chiTiet?.map((ct) => ({
        name: ct.monAn?.ten,
        quantity: ct.soLuong,
        unitPrice: Number(ct.donGia),
      })),
      payments: inv.thanhToan?.map((p) => ({
        method: p.phuongThuc,
        amount: Number(p.soTien),
      })),
    })),
    filename: `invoices_${Date.now()}.json`,
  };
};

/**
 * Get daily sales summary for end-of-day report
 */
const getDailySalesReport = async (date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const invoices = await prisma.hoaDon.findMany({
    where: {
      trangThai: 'PAID',
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
    include: { thanhToan: true },
  });

  const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.tongThanhToan), 0);
  const totalDiscount = invoices.reduce((sum, inv) => sum + Number(inv.giamGia), 0);
  const totalVAT = invoices.reduce((sum, inv) => sum + Number(inv.thueVAT), 0);

  // Payment breakdown
  const paymentBreakdown = {};
  invoices.forEach((inv) => {
    inv.thanhToan?.forEach((p) => {
      if (!paymentBreakdown[p.phuongThuc]) {
        paymentBreakdown[p.phuongThuc] = { count: 0, total: 0 };
      }
      paymentBreakdown[p.phuongThuc].count += 1;
      paymentBreakdown[p.phuongThuc].total += Number(p.soTien);
    });
  });

  return {
    date: date,
    invoiceCount: invoices.length,
    totalRevenue,
    totalDiscount,
    totalVAT,
    netRevenue: totalRevenue - totalVAT,
    paymentBreakdown,
  };
};

module.exports = { 
  listOpen,
  listPendingOrders,
  createFromOrder, 
  pay, 
  openShift, 
  closeShift, 
  getCurrentShift,
  splitBillByItems,
  splitBillByPeople,
  getInvoiceDetails,
  getInvoicePrintData,
  exportInvoices,
  getDailySalesReport,
};

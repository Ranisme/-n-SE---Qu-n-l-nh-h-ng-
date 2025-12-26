import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import {
  Paper,
  Typography,
  Stack,
  Button,
  TextField,
  MenuItem,
  Divider,
  Alert,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  IconButton,
  Tabs,
  Tab,
  InputAdornment,
  Tooltip,
  Badge,
  LinearProgress,
  Fade,
  Collapse,
  ToggleButton,
  ToggleButtonGroup,
  Snackbar,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CallSplit,
  People,
  Print,
  Download,
  Search,
  FilterList,
  AccessTime,
  TableRestaurant,
  AttachMoney,
  CreditCard,
  QrCode2,
  Receipt,
  Warning,
  CheckCircle,
  Schedule,
  TrendingUp,
  ExpandMore,
  ExpandLess,
  Person,
  LocalOffer,
  Percent,
  History,
  Today,
  Sort,
  KeyboardArrowUp,
  KeyboardArrowDown,
  PointOfSale,
  Close,
  Add,
  Remove,
  Lock,
  Star,
  CardGiftcard,
} from '@mui/icons-material';
import { 
  useOpenInvoices,
  usePendingOrders,
  usePayInvoice, 
  useCheckoutOrder,
  useInvoiceDetails,
  useSplitBillByItems,
  useSplitBillByPeople,
  useExportInvoices,
  useMergeInvoices,
} from '../../hooks/useBilling';
import { useCustomers, useCustomerPoints } from '../../hooks/useCustomers';

// ==================== PREMIUM BILLING COLORS ====================
const COLORS = {
  // Main theme
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  
  // Accent colors
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  
  // Payment method colors
  cash: { main: '#10B981', light: '#D1FAE5', icon: '💵' },
  card: { main: '#3B82F6', light: '#DBEAFE', icon: '💳' },
  qr: { main: '#8B5CF6', light: '#EDE9FE', icon: '📱' },
  
  // Status colors
  pending: { main: '#F59E0B', light: '#FEF3C7', text: '#92400E' },
  processing: { main: '#3B82F6', light: '#DBEAFE', text: '#1E40AF' },
  paid: { main: '#10B981', light: '#D1FAE5', text: '#047857' },
  overdue: { main: '#EF4444', light: '#FEE2E2', text: '#B91C1C' },
  
  // Backgrounds
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  surfaceHover: '#F1F5F9',
  
  // Text
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  
  // Borders
  border: '#E2E8F0',
  borderHover: '#CBD5E1',
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

const formatTime = (date) => {
  if (!date) return '--:--';
  return new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const getTimeSince = (date) => {
  if (!date) return 0;
  return Math.floor((Date.now() - new Date(date).getTime()) / 60000);
};

// ==================== INVOICE CARD COMPONENT ====================
const InvoiceCard = ({ invoice, isSelected, onClick, isOverdue, selectable = false, isChecked = false, onSelect = () => {} }) => {
  const tableName = invoice.donHang?.ban?.ten || `Bàn ${invoice.donHang?.banId?.slice(0, 4) || '?'}`;
  const itemCount = invoice.donHang?.chiTiet?.length || 0;
  const timeSince = getTimeSince(invoice.createdAt);
  const staffName = invoice.donHang?.nhanVien?.hoTen || 'Nhân viên';
  
  const getStatusConfig = () => {
    if (isOverdue) return COLORS.overdue;
    if (invoice.trangThai === 'paid' || invoice.trangThai === 'DaThanhToan') return COLORS.paid;
    if (invoice.trangThai === 'processing') return COLORS.processing;
    return COLORS.pending;
  };
  
  const statusConfig = getStatusConfig();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Paper
        onClick={onClick}
        sx={{
          p: 2,
          cursor: 'pointer',
          borderRadius: 3,
          border: `2px solid ${isSelected ? COLORS.primary : 'transparent'}`,
          background: isSelected 
            ? `linear-gradient(135deg, ${COLORS.primary}08, ${COLORS.primaryLight}08)` 
            : COLORS.cardBg,
          boxShadow: isSelected 
            ? `0 4px 20px ${COLORS.primary}30` 
            : '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'all 0.2s ease',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            borderColor: isSelected ? COLORS.primary : COLORS.border,
          },
        }}
      >
        {/* Overdue indicator */}
        {isOverdue && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '0 40px 40px 0',
              borderColor: `transparent ${COLORS.error} transparent transparent`,
            }}
          />
        )}
        
        <Stack spacing={1.5}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TableRestaurant sx={{ color: '#fff', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} color={COLORS.textPrimary}>
                  {tableName}
                </Typography>
                <Typography variant="caption" color={COLORS.textSecondary}>
                  {itemCount} món • {staffName}
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              {selectable && (
                <Checkbox size="small" checked={isChecked} onClick={(e) => { e.stopPropagation(); onSelect(); }} />
              )}
              <Chip
                size="small"
                label={
                  isOverdue ? 'Quá hạn' :
                  invoice.trangThai === 'paid' || invoice.trangThai === 'DaThanhToan' ? 'Đã TT' :
                  invoice.trangThai === 'processing' ? 'Đang xử lý' : 'Chờ TT'
                }
                sx={{
                  background: statusConfig.light,
                  color: statusConfig.text,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                }}
              />
            </Stack>
          </Stack>
          
          {/* Amount */}
          <Typography variant="h6" fontWeight={700} color={COLORS.primary}>
            {formatCurrency(invoice.tongThanhToan)}
          </Typography>
          
          {/* Footer */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTime sx={{ fontSize: 14, color: isOverdue ? COLORS.error : COLORS.textMuted }} />
              <Typography 
                variant="caption" 
                color={isOverdue ? COLORS.error : COLORS.textSecondary}
                fontWeight={isOverdue ? 600 : 400}
              >
                {formatTime(invoice.createdAt)} ({timeSince} phút)
              </Typography>
            </Box>
            <Typography variant="caption" color={COLORS.textMuted}>
              #{invoice.id?.slice(0, 6)}
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </motion.div>
  );
};

// ==================== PAYMENT METHOD BUTTON ====================
const PaymentMethodButton = ({ method, label, icon, color, isActive, onClick, amount }) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ flex: 1 }}>
    <Paper
      onClick={onClick}
      sx={{
        p: 2,
        cursor: 'pointer',
        borderRadius: 3,
        border: `2px solid ${isActive ? color.main : COLORS.border}`,
        background: isActive ? color.light : COLORS.cardBg,
        transition: 'all 0.2s ease',
        textAlign: 'center',
        '&:hover': {
          borderColor: color.main,
          background: `${color.light}80`,
        },
      }}
    >
      <Typography fontSize={28} mb={0.5}>{icon}</Typography>
      <Typography variant="subtitle2" fontWeight={600} color={isActive ? color.main : COLORS.textPrimary}>
        {label}
      </Typography>
      {amount > 0 && (
        <Typography variant="caption" color={color.main} fontWeight={600}>
          {formatCurrency(amount)}
        </Typography>
      )}
    </Paper>
  </motion.div>
);

// ==================== STATS CARD ====================
const StatsCard = ({ icon, label, value, color, trend }) => (
  <Paper
    sx={{
      p: 2,
      borderRadius: 3,
      background: `linear-gradient(135deg, ${color}10, ${color}05)`,
      border: `1px solid ${color}30`,
    }}
  >
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          background: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color={COLORS.textSecondary}>
          {label}
        </Typography>
        <Typography variant="h6" fontWeight={700} color={COLORS.textPrimary}>
          {value}
        </Typography>
      </Box>
      {trend && (
        <Chip
          size="small"
          icon={trend > 0 ? <TrendingUp sx={{ fontSize: 14 }} /> : null}
          label={`${trend > 0 ? '+' : ''}${trend}%`}
          sx={{
            background: trend > 0 ? COLORS.successLight : COLORS.errorLight,
            color: trend > 0 ? COLORS.success : COLORS.error,
            fontWeight: 600,
          }}
        />
      )}
    </Stack>
  </Paper>
);

// ==================== QR CODE COMPONENT ====================
const QRCodeDisplay = ({ amount, invoiceId }) => {
  // Generate a simple VietQR-style payment string
  const qrData = `VIETQR|L'AMI RESTAURANT|${amount}|HD${invoiceId?.slice(0, 8)}`;
  
  return (
    <Box sx={{ textAlign: 'center', py: 2 }}>
      <Paper
        elevation={0}
        sx={{
          width: 200,
          height: 200,
          mx: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${COLORS.qr.light}, #fff)`,
          border: `2px solid ${COLORS.qr.main}`,
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Simple QR pattern simulation - in production use react-qr-code */}
        <Box sx={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '2px', p: 2 }}>
          {Array(100).fill(0).map((_, i) => (
            <Box
              key={i}
              sx={{
                bgcolor: Math.random() > 0.5 ? COLORS.qr.main : 'transparent',
                borderRadius: 0.5,
              }}
            />
          ))}
        </Box>
        <QrCode2 sx={{ fontSize: 60, color: COLORS.qr.main, position: 'relative', zIndex: 1 }} />
      </Paper>
      <Typography variant="caption" color={COLORS.textSecondary} sx={{ mt: 1, display: 'block' }}>
        Quét mã để thanh toán
      </Typography>
      <Chip
        label={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
        sx={{ mt: 1, bgcolor: COLORS.qr.light, color: COLORS.qr.main, fontWeight: 700, fontSize: '1rem' }}
      />
    </Box>
  );
};

// ==================== MAIN COMPONENT ====================
const OpenBills = () => {
  const { data: invoices = [], isLoading, refetch } = useOpenInvoices();
  const { data: pendingOrders = [], isLoading: loadingPending, refetch: refetchPending } = usePendingOrders();
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState('invoice'); // 'invoice' or 'order'
  const [viewTab, setViewTab] = useState(0); // 0 = invoices, 1 = pending orders
  
  const selected = useMemo(() => {
    if (selectedType === 'invoice') {
      return invoices.find((inv) => inv.id === selectedId);
    }
    return null;
  }, [invoices, selectedId, selectedType]);
  
  const selectedOrder = useMemo(() => {
    if (selectedType === 'order') {
      return pendingOrders.find((o) => o.id === selectedId);
    }
    return null;
  }, [pendingOrders, selectedId, selectedType]);
  
  useEffect(() => {
    if (!selectedId) {
      if (viewTab === 0 && invoices.length) {
        setSelectedId(invoices[0].id);
        setSelectedType('invoice');
      } else if (viewTab === 1 && pendingOrders.length) {
        setSelectedId(pendingOrders[0].id);
        setSelectedType('order');
      }
    }
  }, [invoices, pendingOrders, selectedId, viewTab]);

  const { data: invoiceDetails } = useInvoiceDetails(selectedType === 'invoice' ? selectedId : null);

  // Multi-payment state
  const [payments, setPayments] = useState([]);
  const [currentMethod, setCurrentMethod] = useState('TienMat');
  const [currentAmount, setCurrentAmount] = useState('');
  
  // Legacy single payment state (for backward compatibility)
  const [paymentMethod, setPaymentMethod] = useState('TienMat');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [orderIdInput, setOrderIdInput] = useState('');
  const [discountType, setDiscountType] = useState('amount');
  const [discountValue, setDiscountValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('time');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showHistory, setShowHistory] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null });
  const [showQR, setShowQR] = useState(false);
  
  // Discount approval dialog
  const [discountApprovalDialog, setDiscountApprovalDialog] = useState({ open: false, pendingDiscount: 0 });
  const [managerPin, setManagerPin] = useState('');
  const [managerUsername, setManagerUsername] = useState('');
  
  // QĐ-LOYALTY: Customer and points state
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const [usePoints, setUsePoints] = useState(0);
  const { data: customersData } = useCustomers();
  const customers = customersData?.items || [];
  const { data: customerPointsData } = useCustomerPoints(selectedCustomerId);
  const customerPoints = customerPointsData?.points || 0;
  
  // Mutations
  const payInvoice = usePayInvoice();
  const checkoutOrder = useCheckoutOrder();
  const splitByItems = useSplitBillByItems();
  const splitByPeople = useSplitBillByPeople();
  const exportInvoices = useExportInvoices();
  const mergeInvoices = useMergeInvoices();
  const [selectedIds, setSelectedIds] = useState([]);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  // Derived: selected invoices and validation
  const selectedInvoicesList = selectedIds.map((id) => invoices.find((i) => i.id === id) || {});
  const tableMismatch = new Set(selectedInvoicesList.map((inv) => inv.donHang?.banId || inv.donHang?.ban?.id || '')).size > 1;
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Split dialog states
  const [splitDialogOpen, setSplitDialogOpen] = useState(false);
  const [splitTab, setSplitTab] = useState(0);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [numPeople, setNumPeople] = useState(2);

  // Calculations - fallback to selected invoice if details not available
  const invoiceData = invoiceDetails || selected;
  const orderItems = invoiceData?.donHang?.chiTiet || selected?.donHang?.chiTiet || [];
  const subtotal = Number(invoiceData?.tongTienHang || selected?.tongTienHang || 0);
  const tax = Number(invoiceData?.thueVAT || selected?.thueVAT || 0);
  const serviceFee = Number(invoiceData?.phiPhucVu || selected?.phiPhucVu || 0);
  const existingDiscount = Number(invoiceData?.giamGia || selected?.giamGia || 0);
  const totalDue = Number(selected?.tongThanhToan || 0);
  const paymentAmountNum = Number(paymentAmount) || 0;
  
  // QĐ-LOYALTY: Points discount (1 point = 1,000 VND)
  const pointsDiscount = usePoints * 1000;
  const effectiveTotalDue = Math.max(0, totalDue - pointsDiscount);
  
  // Multi-payment calculations
  const totalPaidMulti = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const remainingDue = effectiveTotalDue - totalPaidMulti;
  const changeDue = paymentAmountNum > 0 
    ? Math.max(0, paymentAmountNum - effectiveTotalDue) 
    : Math.max(0, totalPaidMulti - effectiveTotalDue);

  // Reset payments when selecting new invoice
  useEffect(() => {
    setPayments([]);
    setCurrentAmount('');
    setShowQR(false);
    setSelectedCustomerId(null);
    setCustomerPhone('');
    setUsePoints(0);
  }, [selectedId]);

  // Add payment to list
  const handleAddPayment = () => {
    const amount = Number(currentAmount);
    if (!amount || amount <= 0) return;
    
    setPayments(prev => [...prev, { method: currentMethod, amount }]);
    setCurrentAmount('');
    
    if (currentMethod === 'QR') {
      setShowQR(false);
    }
  };

  // Remove payment from list
  const handleRemovePayment = (index) => {
    setPayments(prev => prev.filter((_, i) => i !== index));
  };

  // Filter and sort invoices
  const filteredInvoices = useMemo(() => {
    let result = [...invoices];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(inv => 
        inv.donHang?.ban?.ten?.toLowerCase().includes(query) ||
        inv.id?.toLowerCase().includes(query) ||
        inv.donHang?.nhanVien?.hoTen?.toLowerCase().includes(query)
      );
    }
    
    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'time':
          comparison = new Date(b.createdAt) - new Date(a.createdAt);
          break;
        case 'amount':
          comparison = Number(b.tongThanhToan) - Number(a.tongThanhToan);
          break;
        case 'table':
          comparison = (a.donHang?.ban?.ten || '').localeCompare(b.donHang?.ban?.ten || '');
          break;
        default:
          break;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });
    
    return result;
  }, [invoices, searchQuery, sortBy, sortOrder]);

  // Stats
  const stats = useMemo(() => {
    const openBills = invoices.filter(inv => inv.trangThai !== 'DaThanhToan' && inv.trangThai !== 'paid');
    const totalOpen = openBills.reduce((sum, inv) => sum + Number(inv.tongThanhToan || 0), 0);
    const overdue = openBills.filter(inv => getTimeSince(inv.createdAt) > 60).length;
    const pendingTotal = pendingOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    return {
      count: openBills.length,
      total: totalOpen,
      overdue,
      pendingCount: pendingOrders.length,
      pendingTotal,
    };
  }, [invoices, pendingOrders]);
  
  // Handle quick checkout from pending order
  const handleQuickCheckout = (orderId) => {
    checkoutOrder
      .mutateAsync({ orderId, payload: { discount: 0 } })
      .then((invoice) => {
        setSnackbar({ open: true, message: '✅ Tạo hóa đơn thành công!', severity: 'success' });
        setSelectedId(invoice.id);
        setSelectedType('invoice');
        setViewTab(0);
        refetch();
        refetchPending();
      })
      .catch((err) => {
        const apiMsg = err?.response?.data?.message;
        const detailMsg = err?.response?.data?.details?.[0]?.message;
        setSnackbar({ 
          open: true, 
          message: `❌ ${detailMsg || apiMsg || 'Không thể tạo hóa đơn'}`,
          severity: 'error'
        });
      });
  };

  // Handlers
  const handlePay = () => {
    if (!selected) return;
    
    // Use multi-payment if available, otherwise single payment
    const paymentList = payments.length > 0 
      ? payments.map(p => ({ method: p.method, amount: p.amount, note: '' }))
      : [{ method: paymentMethod, amount: paymentAmountNum || totalDue, note: '' }];
    
    // QĐ-LOYALTY: Include customer and points in payload
    const payload = { 
      payments: paymentList,
      khachHangId: selectedCustomerId || null,
      usePoints: usePoints > 0 ? usePoints : 0,
    };
    
    payInvoice
      .mutateAsync({ invoiceId: selected.id, payload })
      .then((res) => {
        let message = `✅ Thanh toán thành công! Tiền thối: ${formatCurrency(res.changeDue || changeDue)}`;
        if (res.pointsEarned > 0) {
          message += ` | +${res.pointsEarned} điểm`;
        }
        if (res.pointsUsed > 0) {
          message += ` | Đã dùng ${res.pointsUsed} điểm`;
        }
        setSnackbar({ 
          open: true, 
          message,
          severity: 'success'
        });
        setPaymentAmount('');
        setPayments([]);
        setSelectedCustomerId(null);
        setCustomerPhone('');
        setUsePoints(0);
        setConfirmDialog({ open: false, type: null });
        refetch();
      })
      .catch((err) => {
        const apiMsg = err?.response?.data?.message;
        const detailMsg = err?.response?.data?.details?.[0]?.message;
        setSnackbar({ 
          open: true, 
          message: `❌ ${detailMsg || apiMsg || 'Thanh toán thất bại'}`,
          severity: 'error'
        });
      });
  };

  const handleCheckout = () => {
    if (!orderIdInput) {
      setSnackbar({ open: true, message: '❌ Vui lòng nhập Order ID', severity: 'error' });
      return;
    }
    const discountAmount = discountType === 'percent' 
      ? 0 // Backend will calculate
      : Number(discountValue) || 0;
    
    // If discount is applied, require manager approval
    if (discountAmount > 0) {
      setDiscountApprovalDialog({ open: true, pendingDiscount: discountAmount });
      return;
    }
    
    // No discount - proceed directly
    executeCheckout(discountAmount, null, null);
  };

  const executeCheckout = (discountAmount, pin, username) => {
    checkoutOrder
      .mutateAsync({ 
        orderId: orderIdInput, 
        payload: { 
          discount: discountAmount,
          managerPin: pin,
          managerUsername: username,
        } 
      })
      .then(() => {
        setSnackbar({ open: true, message: '✅ Tạo hóa đơn thành công!', severity: 'success' });
        refetch();
        setOrderIdInput('');
        setDiscountValue('');
        setManagerPin('');
        setManagerUsername('');
        setDiscountApprovalDialog({ open: false, pendingDiscount: 0 });
      })
      .catch((err) => {
        const apiMsg = err?.response?.data?.message;
        const detailMsg = err?.response?.data?.details?.[0]?.message;
        setSnackbar({ 
          open: true, 
          message: `❌ ${detailMsg || apiMsg || 'Không thể tạo hóa đơn'}`,
          severity: 'error'
        });
      });
  };

  const handleDiscountApproval = () => {
    if (!managerPin) {
      setSnackbar({ open: true, message: '❌ Vui lòng nhập mã PIN quản lý', severity: 'error' });
      return;
    }
    executeCheckout(discountApprovalDialog.pendingDiscount, managerPin, managerUsername);
  };

  const handleExportCSV = () => {
    exportInvoices.mutateAsync({ format: 'csv' })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setSnackbar({ open: true, message: '✅ Xuất CSV thành công!', severity: 'success' });
      })
      .catch(() => {
        setSnackbar({ open: true, message: '❌ Xuất file thất bại', severity: 'error' });
      });
  };

  const handleSplitByItems = () => {
    if (!selectedId || selectedItemIds.length === 0) return;
    splitByItems
      .mutateAsync({ invoiceId: selectedId, itemIds: selectedItemIds })
      .then((res) => {
        setSnackbar({ open: true, message: `✅ ${res.message || 'Tách hóa đơn thành công'}`, severity: 'success' });
        setSplitDialogOpen(false);
        refetch();
      })
      .catch((err) => {
        setSnackbar({ open: true, message: `❌ ${err?.response?.data?.message || 'Tách thất bại'}`, severity: 'error' });
      });
  };

  const handleSplitByPeople = () => {
    if (!selectedId || numPeople < 2) return;
    splitByPeople
      .mutateAsync({ invoiceId: selectedId, numPeople })
      .then((res) => {
        setSnackbar({ 
          open: true, 
          message: `✅ ${res.message}. Mỗi người: ${formatCurrency(res.amountPerPerson)}`,
          severity: 'success'
        });
        setSplitDialogOpen(false);
        refetch();
      })
      .catch((err) => {
        setSnackbar({ open: true, message: `❌ ${err?.response?.data?.message || 'Tách thất bại'}`, severity: 'error' });
      });
  };

  const handlePrint = () => {
    if (!invoiceDetails) return;
    const printWindow = window.open('', '_blank');
    const items = invoiceDetails.donHang?.chiTiet || [];
    printWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn - ${invoiceDetails.id}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 20px; max-width: 300px; margin: 0 auto; }
            h2 { text-align: center; margin-bottom: 5px; color: #6366F1; }
            .header { text-align: center; margin-bottom: 15px; color: #64748B; }
            table { width: 100%; border-collapse: collapse; }
            td, th { padding: 8px 0; text-align: left; border-bottom: 1px solid #E2E8F0; }
            .right { text-align: right; }
            .divider { border-top: 2px dashed #E2E8F0; margin: 15px 0; }
            .total { font-weight: bold; font-size: 1.3em; color: #6366F1; }
            .footer { text-align: center; margin-top: 20px; color: #94A3B8; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <h2>🍽️ L'AMI RESTAURANT</h2>
          <div class="header">
            <div>Hóa đơn thanh toán</div>
            <div>Bàn: ${invoiceDetails.donHang?.ban?.ten || 'N/A'}</div>
            <div>${new Date().toLocaleString('vi-VN')}</div>
          </div>
          <div class="divider"></div>
          <table>
            <tr><th>Món</th><th class="right">SL</th><th class="right">Thành tiền</th></tr>
            ${items.map(item => `
              <tr>
                <td>${item.monAn?.ten || 'N/A'}</td>
                <td class="right">${item.soLuong}</td>
                <td class="right">${formatCurrency(Number(item.donGia) * item.soLuong)}</td>
              </tr>
            `).join('')}
          </table>
          <div class="divider"></div>
          <table>
            <tr><td>Tạm tính:</td><td class="right">${formatCurrency(invoiceDetails.tongTienHang)}</td></tr>
            <tr><td>Thuế VAT:</td><td class="right">${formatCurrency(invoiceDetails.thueVAT)}</td></tr>
            <tr><td>Giảm giá:</td><td class="right">-${formatCurrency(invoiceDetails.giamGia)}</td></tr>
            <tr class="total"><td>TỔNG CỘNG:</td><td class="right">${formatCurrency(invoiceDetails.tongThanhToan)}</td></tr>
          </table>
          <div class="divider"></div>
          <div class="footer">
            <div>✨ Cảm ơn quý khách!</div>
            <div>Hẹn gặp lại 🙏</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const setQuickAmount = (amount) => {
    setPaymentAmount(String(amount));
  };

  return (
    <MainLayout title="Hóa đơn & Thanh toán">
      <Box sx={{ background: COLORS.background, minHeight: '100vh', mx: -3, mt: -2, px: 3, py: 2 }}>
        {/* ==================== HEADER STATS ==================== */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <StatsCard
            icon={<Receipt sx={{ color: COLORS.primary }} />}
            label="Hóa đơn chờ"
            value={stats.count}
            color={COLORS.primary}
          />
          <StatsCard
            icon={<TableRestaurant sx={{ color: COLORS.warning }} />}
            label="Đơn chờ checkout"
            value={stats.pendingCount}
            color={COLORS.warning}
          />
          <StatsCard
            icon={<AttachMoney sx={{ color: COLORS.success }} />}
            label="Tổng chờ thu"
            value={formatCurrency(stats.total + stats.pendingTotal)}
            color={COLORS.success}
          />
          <StatsCard
            icon={<Warning sx={{ color: COLORS.error }} />}
            label="Quá hạn (>60p)"
            value={stats.overdue}
            color={COLORS.error}
          />
        </Stack>

        {/* ==================== MAIN 3-COLUMN LAYOUT ==================== */}
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
          {/* ==================== COLUMN 1: INVOICE/ORDER LIST ==================== */}
          <Paper
            sx={{
              width: { xs: '100%', lg: 360 },
              minWidth: { lg: 360 },
              borderRadius: 4,
              overflow: 'hidden',
              border: `1px solid ${COLORS.border}`,
            }}
          >
            {/* Tabs for switching between Invoices and Pending Orders */}
            <Tabs
              value={viewTab}
              onChange={(e, v) => {
                setViewTab(v);
                setSelectedId(null);
                setSelectedType(v === 0 ? 'invoice' : 'order');
              }}
              sx={{
                borderBottom: `1px solid ${COLORS.border}`,
                '& .MuiTab-root': {
                  fontWeight: 600,
                  textTransform: 'none',
                  minHeight: 48,
                },
              }}
            >
              <Tab 
                icon={<Badge badgeContent={stats.count} color="primary"><Receipt sx={{ fontSize: 20 }} /></Badge>}
                iconPosition="start"
                label="Hóa đơn chờ" 
              />
              <Tab 
                icon={<Badge badgeContent={stats.pendingCount} color="warning"><TableRestaurant sx={{ fontSize: 20 }} /></Badge>}
                iconPosition="start"
                label="Đơn chờ checkout" 
              />
            </Tabs>
            
            {/* Search & Filter Header */}
            <Box sx={{ p: 2, background: `linear-gradient(135deg, ${COLORS.primary}08, ${COLORS.primaryLight}05)` }}>
              <Stack spacing={2}>
                <TextField
                  size="small"
                  placeholder={viewTab === 0 ? "Tìm theo bàn, mã HĐ..." : "Tìm theo bàn..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ color: COLORS.textMuted, mr: 1 }} />,
                  }}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: COLORS.cardBg,
                    },
                  }}
                />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" color={COLORS.textSecondary}>Sắp xếp:</Typography>
                  <ToggleButtonGroup
                    size="small"
                    value={sortBy}
                    exclusive
                    onChange={(e, v) => v && setSortBy(v)}
                  >
                    <ToggleButton value="time" sx={{ px: 1.5, py: 0.5 }}>
                      <Tooltip title="Theo thời gian"><AccessTime sx={{ fontSize: 16 }} /></Tooltip>
                    </ToggleButton>
                    <ToggleButton value="amount" sx={{ px: 1.5, py: 0.5 }}>
                      <Tooltip title="Theo số tiền"><AttachMoney sx={{ fontSize: 16 }} /></Tooltip>
                    </ToggleButton>
                    <ToggleButton value="table" sx={{ px: 1.5, py: 0.5 }}>
                      <Tooltip title="Theo bàn"><TableRestaurant sx={{ fontSize: 16 }} /></Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <IconButton size="small" onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}>
                    {sortOrder === 'asc' ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  </IconButton>
                  <Box sx={{ flex: 1 }} />
                  {viewTab === 0 && (
                    <>
                      <Button variant="contained" size="small" disabled={selectedIds.length < 2} onClick={() => setMergeDialogOpen(true)} sx={{ mr: 1 }}>
                        Gộp ({selectedIds.length})
                      </Button>
                      <Tooltip title="Xuất CSV">
                        <IconButton size="small" onClick={handleExportCSV}>
                          <Download sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Stack>
              </Stack>
            </Box>

            {/* Tab Content */}
            <Box sx={{ p: 2, maxHeight: 'calc(100vh - 420px)', overflow: 'auto' }}>
              {/* Invoices Tab */}
              {viewTab === 0 && (
                <>
                  {isLoading && <LinearProgress sx={{ mb: 2 }} />}
                  <Stack spacing={1.5}>
                    <AnimatePresence>
                      {filteredInvoices.map((inv) => (
                        <InvoiceCard
                          key={inv.id}
                          invoice={inv}
                          isSelected={inv.id === selectedId && selectedType === 'invoice'}
                          isOverdue={getTimeSince(inv.createdAt) > 60}
                          onClick={() => { setSelectedId(inv.id); setSelectedType('invoice'); }}
                          selectable={!['paid', 'DaThanhToan'].includes(String(inv.trangThai))}
                          isChecked={selectedIds.includes(inv.id)}
                          onSelect={() => setSelectedIds(prev => prev.includes(inv.id) ? prev.filter(x => x !== inv.id) : [...prev, inv.id])}
                        />
                      ))}
                    </AnimatePresence>
                  </Stack>
                  {!isLoading && filteredInvoices.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <Receipt sx={{ fontSize: 60, color: COLORS.textMuted, opacity: 0.3, mb: 2 }} />
                      <Typography color={COLORS.textSecondary}>
                        {searchQuery ? 'Không tìm thấy hóa đơn' : 'Chưa có hóa đơn chờ thanh toán'}
                      </Typography>
                      {stats.pendingCount > 0 && (
                        <Button 
                          size="small" 
                          onClick={() => setViewTab(1)}
                          sx={{ mt: 2, textTransform: 'none' }}
                        >
                          Xem {stats.pendingCount} đơn chờ checkout →
                        </Button>
                      )}
                    </Box>
                  )}
                </>
              )}
              
              {/* Pending Orders Tab */}
              {viewTab === 1 && (
                <>
                  {loadingPending && <LinearProgress sx={{ mb: 2 }} />}
                  <Stack spacing={1.5}>
                    <AnimatePresence>
                      {pendingOrders
                        .filter(order => !searchQuery || order.table?.ten?.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((order) => (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Paper
                              sx={{
                                p: 2,
                                cursor: 'pointer',
                                borderRadius: 3,
                                border: `2px solid ${order.id === selectedId && selectedType === 'order' ? COLORS.warning : 'transparent'}`,
                                background: order.id === selectedId && selectedType === 'order'
                                  ? `linear-gradient(135deg, ${COLORS.warning}08, ${COLORS.warningLight}08)`
                                  : COLORS.cardBg,
                                boxShadow: order.id === selectedId && selectedType === 'order'
                                  ? `0 4px 20px ${COLORS.warning}30`
                                  : '0 2px 8px rgba(0,0,0,0.04)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                },
                              }}
                              onClick={() => { setSelectedId(order.id); setSelectedType('order'); }}
                            >
                              <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 2,
                                        background: `linear-gradient(135deg, ${COLORS.warning}, ${COLORS.warningLight})`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      <TableRestaurant sx={{ color: '#fff', fontSize: 20 }} />
                                    </Box>
                                    <Box>
                                      <Typography variant="subtitle1" fontWeight={700} color={COLORS.textPrimary}>
                                        {order.table?.ten || 'Bàn'}
                                      </Typography>
                                      <Typography variant="caption" color={COLORS.textSecondary}>
                                        {order.itemCount} món • {order.staff?.hoTen || 'NV'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Chip
                                    size="small"
                                    label="Chờ checkout"
                                    sx={{
                                      background: COLORS.warningLight,
                                      color: COLORS.warning,
                                      fontWeight: 600,
                                      fontSize: '0.7rem',
                                    }}
                                  />
                                </Stack>
                                
                                <Typography variant="h6" fontWeight={700} color={COLORS.warning}>
                                  {formatCurrency(order.total)}
                                </Typography>
                                
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <AccessTime sx={{ fontSize: 14, color: COLORS.textMuted }} />
                                    <Typography variant="caption" color={COLORS.textSecondary}>
                                      {formatTime(order.createdAt)} ({getTimeSince(order.createdAt)} phút)
                                    </Typography>
                                  </Box>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={(e) => { e.stopPropagation(); handleQuickCheckout(order.id); }}
                                    disabled={checkoutOrder.isPending}
                                    sx={{
                                      borderRadius: 2,
                                      textTransform: 'none',
                                      fontWeight: 600,
                                      background: `linear-gradient(135deg, ${COLORS.success}, #059669)`,
                                      px: 2,
                                      py: 0.5,
                                      fontSize: '0.75rem',
                                    }}
                                  >
                                    Tạo HĐ
                                  </Button>
                                </Stack>
                              </Stack>
                            </Paper>
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </Stack>
                  {!loadingPending && pendingOrders.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <TableRestaurant sx={{ fontSize: 60, color: COLORS.textMuted, opacity: 0.3, mb: 2 }} />
                      <Typography color={COLORS.textSecondary}>
                        Không có đơn hàng chờ checkout
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Paper>

          {/* ==================== COLUMN 2: ORDER DETAILS ==================== */}
          <Paper
            sx={{
              flex: 1,
              borderRadius: 4,
              overflow: 'hidden',
              border: `1px solid ${COLORS.border}`,
            }}
          >
            {/* Show Invoice Details */}
            {selected && selectedType === 'invoice' ? (
              <>
                {/* Header */}
                <Box sx={{ p: 2, background: `linear-gradient(135deg, ${COLORS.primary}08, ${COLORS.primaryLight}05)`, borderBottom: `1px solid ${COLORS.border}` }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" fontWeight={700} color={COLORS.textPrimary}>
                        Chi tiết hóa đơn
                      </Typography>
                      <Typography variant="body2" color={COLORS.textSecondary}>
                        {selected.donHang?.ban?.ten || 'Bàn'} • #{selected.id?.slice(0, 8)}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Tách hóa đơn">
                        <IconButton 
                          onClick={() => { setSelectedItemIds([]); setNumPeople(2); setSplitDialogOpen(true); }}
                          sx={{ background: `${COLORS.info}15`, '&:hover': { background: `${COLORS.info}25` } }}
                        >
                          <CallSplit sx={{ color: COLORS.info }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="In hóa đơn">
                        <IconButton 
                          onClick={handlePrint}
                          sx={{ background: `${COLORS.success}15`, '&:hover': { background: `${COLORS.success}25` } }}
                        >
                          <Print sx={{ color: COLORS.success }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Box>

                {/* Order Items */}
                <Box sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                  <Stack spacing={1}>
                    {orderItems.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Paper
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            background: COLORS.surfaceHover,
                            border: `1px solid ${COLORS.border}`,
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" fontWeight={600} color={COLORS.textPrimary}>
                                {item.monAn?.ten || 'N/A'}
                              </Typography>
                              {item.ghiChu && (
                                <Typography variant="caption" color={COLORS.textMuted}>
                                  📝 {item.ghiChu}
                                </Typography>
                              )}
                            </Box>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Chip 
                                label={`×${item.soLuong}`} 
                                size="small" 
                                sx={{ 
                                  background: `${COLORS.primary}15`,
                                  color: COLORS.primary,
                                  fontWeight: 600,
                                }} 
                              />
                              <Typography variant="subtitle2" fontWeight={600} color={COLORS.textPrimary}>
                                {formatCurrency(Number(item.donGia) * item.soLuong)}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Paper>
                      </motion.div>
                    ))}
                    {orderItems.length === 0 && (
                      <Typography color={COLORS.textSecondary} textAlign="center" py={4}>
                        Không có món trong hóa đơn
                      </Typography>
                    )}
                  </Stack>
                </Box>

                {/* Summary */}
                <Box sx={{ p: 2, background: COLORS.surfaceHover, borderTop: `1px solid ${COLORS.border}` }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color={COLORS.textSecondary}>Tạm tính</Typography>
                      <Typography fontWeight={500}>{formatCurrency(subtotal)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color={COLORS.textSecondary}>Thuế VAT</Typography>
                      <Typography fontWeight={500}>{formatCurrency(tax)}</Typography>
                    </Stack>
                    {serviceFee > 0 && (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography color={COLORS.textSecondary}>Phí phục vụ</Typography>
                        <Typography fontWeight={500}>{formatCurrency(serviceFee)}</Typography>
                      </Stack>
                    )}
                    {existingDiscount > 0 && (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography color={COLORS.success}>Giảm giá</Typography>
                        <Typography fontWeight={500} color={COLORS.success}>-{formatCurrency(existingDiscount)}</Typography>
                      </Stack>
                    )}
                    {/* QĐ-LOYALTY: Show points discount */}
                    {pointsDiscount > 0 && (
                      <Stack direction="row" justifyContent="space-between">
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Star sx={{ fontSize: 16, color: COLORS.warning }} />
                          <Typography color={COLORS.warning}>Điểm thưởng ({usePoints} điểm)</Typography>
                        </Stack>
                        <Typography fontWeight={500} color={COLORS.warning}>-{formatCurrency(pointsDiscount)}</Typography>
                      </Stack>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="h6" fontWeight={700} color={COLORS.textPrimary}>
                        TỔNG CỘNG
                      </Typography>
                      <Stack alignItems="flex-end">
                        {pointsDiscount > 0 && (
                          <Typography variant="body2" sx={{ textDecoration: 'line-through', color: COLORS.textMuted }}>
                            {formatCurrency(totalDue)}
                          </Typography>
                        )}
                        <Typography variant="h5" fontWeight={700} color={COLORS.primary}>
                          {formatCurrency(effectiveTotalDue)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Box>
              </>
            ) : selectedOrder && selectedType === 'order' ? (
              /* Show Pending Order Details */
              <>
                <Box sx={{ p: 2, background: `linear-gradient(135deg, ${COLORS.warning}08, ${COLORS.warningLight}05)`, borderBottom: `1px solid ${COLORS.border}` }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" fontWeight={700} color={COLORS.textPrimary}>
                        Đơn hàng chờ checkout
                      </Typography>
                      <Typography variant="body2" color={COLORS.textSecondary}>
                        {selectedOrder.table?.ten || 'Bàn'} • #{selectedOrder.id?.slice(0, 8)}
                      </Typography>
                    </Box>
                    <Chip
                      label="Chờ tạo hóa đơn"
                      sx={{
                        background: COLORS.warningLight,
                        color: COLORS.warning,
                        fontWeight: 600,
                      }}
                    />
                  </Stack>
                </Box>

                {/* Order Items */}
                <Box sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                  <Stack spacing={1}>
                    {selectedOrder.items?.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Paper
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            background: COLORS.surfaceHover,
                            border: `1px solid ${COLORS.border}`,
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" fontWeight={600} color={COLORS.textPrimary}>
                                {item.monAn?.ten || 'N/A'}
                              </Typography>
                              {item.ghiChu && (
                                <Typography variant="caption" color={COLORS.textMuted}>
                                  📝 {item.ghiChu}
                                </Typography>
                              )}
                            </Box>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Chip 
                                label={`×${item.soLuong}`} 
                                size="small" 
                                sx={{ 
                                  background: `${COLORS.warning}15`,
                                  color: COLORS.warning,
                                  fontWeight: 600,
                                }} 
                              />
                              <Typography variant="subtitle2" fontWeight={600} color={COLORS.textPrimary}>
                                {formatCurrency(Number(item.donGia) * item.soLuong)}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Paper>
                      </motion.div>
                    ))}
                    {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                      <Typography color={COLORS.textSecondary} textAlign="center" py={4}>
                        Không có món trong đơn hàng
                      </Typography>
                    )}
                  </Stack>
                </Box>

                {/* Summary */}
                <Box sx={{ p: 2, background: COLORS.surfaceHover, borderTop: `1px solid ${COLORS.border}` }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color={COLORS.textSecondary}>Tạm tính</Typography>
                      <Typography fontWeight={500}>{formatCurrency(selectedOrder.subtotal)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color={COLORS.textSecondary}>Thuế VAT (ước tính)</Typography>
                      <Typography fontWeight={500}>{formatCurrency(selectedOrder.vat)}</Typography>
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="h6" fontWeight={700} color={COLORS.textPrimary}>
                        TỔNG CỘNG
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color={COLORS.warning}>
                        {formatCurrency(selectedOrder.total)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                {/* Checkout Button */}
                <Box sx={{ p: 2, borderTop: `1px solid ${COLORS.border}` }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => handleQuickCheckout(selectedOrder.id)}
                    disabled={checkoutOrder.isPending}
                    startIcon={<Receipt />}
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${COLORS.warning}, #D97706)`,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      boxShadow: `0 4px 20px ${COLORS.warning}40`,
                    }}
                  >
                    {checkoutOrder.isPending ? 'Đang tạo...' : 'Tạo hóa đơn & Thanh toán'}
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 10 }}>
                <Receipt sx={{ fontSize: 80, color: COLORS.textMuted, opacity: 0.3, mb: 2 }} />
                <Typography variant="h6" color={COLORS.textSecondary}>
                  Chọn hóa đơn hoặc đơn hàng để xem chi tiết
                </Typography>
              </Box>
            )}
          </Paper>

          {/* ==================== COLUMN 3: PAYMENT ==================== */}
          <Paper
            sx={{
              width: { xs: '100%', lg: 360 },
              minWidth: { lg: 360 },
              borderRadius: 4,
              overflow: 'hidden',
              border: `1px solid ${COLORS.border}`,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {selected && selectedType === 'invoice' ? (
              <>
                {/* Header */}
                <Box sx={{ p: 2, background: `linear-gradient(135deg, ${COLORS.success}10, ${COLORS.success}05)`, borderBottom: `1px solid ${COLORS.border}` }}>
                  <Typography variant="h6" fontWeight={700} color={COLORS.textPrimary}>
                    💳 Thanh toán đa phương thức
                  </Typography>
                  <Typography variant="body2" color={COLORS.textSecondary}>
                    Chọn một hoặc nhiều phương thức thanh toán
                  </Typography>
                </Box>

                {/* Payment Methods */}
                <Box sx={{ p: 2 }}>
                  {/* QĐ-LOYALTY: Customer Selection */}
                  <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: `${COLORS.warning}08`, border: `1px solid ${COLORS.warning}20` }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <CardGiftcard sx={{ color: COLORS.warning, fontSize: 20 }} />
                      <Typography variant="subtitle2" fontWeight={600}>
                        Khách hàng thành viên
                      </Typography>
                    </Stack>
                    <TextField
                      select
                      size="small"
                      fullWidth
                      placeholder="Chọn hoặc nhập SĐT khách hàng"
                      value={selectedCustomerId || ''}
                      onChange={(e) => {
                        setSelectedCustomerId(e.target.value || null);
                        setUsePoints(0);
                      }}
                      sx={{ 
                        mb: 1,
                        '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' },
                      }}
                    >
                      <MenuItem value="">-- Khách vãng lai --</MenuItem>
                      {customers.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.hoTen} - {c.soDienThoai} ({c.diemTichLuy} điểm)
                        </MenuItem>
                      ))}
                    </TextField>
                    
                    {/* Points Redemption */}
                    {selectedCustomerId && customerPoints > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color={COLORS.textSecondary}>
                            Điểm khả dụng: <strong style={{ color: COLORS.success }}>{customerPoints}</strong> (= {formatCurrency(customerPoints * 1000)})
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                          <TextField
                            size="small"
                            type="number"
                            label="Sử dụng điểm"
                            value={usePoints}
                            onChange={(e) => setUsePoints(Math.min(Math.max(0, Number(e.target.value)), customerPoints, Math.floor(totalDue / 1000)))}
                            sx={{ width: 120, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            inputProps={{ min: 0, max: Math.min(customerPoints, Math.floor(totalDue / 1000)) }}
                          />
                          <Button 
                            size="small" 
                            onClick={() => setUsePoints(Math.min(customerPoints, Math.floor(totalDue / 1000)))}
                            sx={{ textTransform: 'none' }}
                          >
                            Dùng tối đa
                          </Button>
                          {usePoints > 0 && (
                            <Chip 
                              label={`Giảm ${formatCurrency(usePoints * 1000)}`} 
                              color="success" 
                              size="small" 
                              icon={<Star />}
                            />
                          )}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                  
                  <Typography variant="subtitle2" color={COLORS.textSecondary} sx={{ mb: 1.5 }}>
                    Chọn phương thức
                  </Typography>
                  <Stack direction="row" spacing={1.5}>
                    <PaymentMethodButton
                      method="TienMat"
                      label="Tiền mặt"
                      icon={COLORS.cash.icon}
                      color={COLORS.cash}
                      isActive={currentMethod === 'TienMat'}
                      onClick={() => { setCurrentMethod('TienMat'); setShowQR(false); }}
                      amount={payments.filter(p => p.method === 'TienMat').reduce((s, p) => s + p.amount, 0)}
                    />
                    <PaymentMethodButton
                      method="The"
                      label="Thẻ"
                      icon={COLORS.card.icon}
                      color={COLORS.card}
                      isActive={currentMethod === 'The'}
                      onClick={() => { setCurrentMethod('The'); setShowQR(false); }}
                      amount={payments.filter(p => p.method === 'The').reduce((s, p) => s + p.amount, 0)}
                    />
                    <PaymentMethodButton
                      method="QR"
                      label="QR"
                      icon={COLORS.qr.icon}
                      color={COLORS.qr}
                      isActive={currentMethod === 'QR'}
                      onClick={() => { setCurrentMethod('QR'); setShowQR(true); }}
                      amount={payments.filter(p => p.method === 'QR').reduce((s, p) => s + p.amount, 0)}
                    />
                  </Stack>
                </Box>

                {/* QR Code Display */}
                {showQR && currentMethod === 'QR' && (
                  <Collapse in={showQR}>
                    <QRCodeDisplay amount={remainingDue > 0 ? remainingDue : totalDue} invoiceId={selected?.id} />
                  </Collapse>
                )}

                {/* Amount Input */}
                <Box sx={{ p: 2, pt: 0 }}>
                  <Typography variant="subtitle2" color={COLORS.textSecondary} sx={{ mb: 1.5 }}>
                    Số tiền thanh toán
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      type="number"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value)}
                      placeholder={formatCurrency(remainingDue > 0 ? remainingDue : totalDue)}
                      InputProps={{
                        startAdornment: <AttachMoney sx={{ color: COLORS.textMuted, mr: 1 }} />,
                        sx: { fontSize: '1.1rem', fontWeight: 600 },
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: COLORS.surfaceHover,
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddPayment}
                      disabled={!currentAmount || Number(currentAmount) <= 0}
                      sx={{
                        minWidth: 80,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
                      }}
                    >
                      <Add />
                    </Button>
                  </Stack>
                  
                  {/* Quick Amount Buttons */}
                  <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    {[remainingDue > 0 ? remainingDue : totalDue, 100000, 200000, 500000].map((amount, idx) => (
                      <Chip
                        key={idx}
                        label={idx === 0 ? 'Còn lại' : formatCurrency(amount)}
                        onClick={() => setCurrentAmount(String(amount))}
                        sx={{
                          cursor: 'pointer',
                          background: Number(currentAmount) === amount ? `${COLORS.primary}20` : COLORS.surfaceHover,
                          color: Number(currentAmount) === amount ? COLORS.primary : COLORS.textSecondary,
                          fontWeight: 600,
                          '&:hover': { background: `${COLORS.primary}15` },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Added Payments List */}
                {payments.length > 0 && (
                  <Box sx={{ px: 2, pb: 1 }}>
                    <Typography variant="subtitle2" color={COLORS.textSecondary} sx={{ mb: 1 }}>
                      Đã thêm ({payments.length})
                    </Typography>
                    <Stack spacing={0.5}>
                      {payments.map((p, idx) => (
                        <Paper
                          key={idx}
                          elevation={0}
                          sx={{
                            p: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderRadius: 2,
                            bgcolor: p.method === 'TienMat' ? COLORS.cash.light : p.method === 'The' ? COLORS.card.light : COLORS.qr.light,
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography>
                              {p.method === 'TienMat' ? '💵' : p.method === 'The' ? '💳' : '📱'}
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {formatCurrency(p.amount)}
                            </Typography>
                          </Stack>
                          <IconButton size="small" onClick={() => handleRemovePayment(idx)} sx={{ color: COLORS.error }}>
                            <Close fontSize="small" />
                          </IconButton>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Change Calculation */}
                <Box sx={{ p: 2, background: COLORS.surfaceHover, mx: 2, borderRadius: 2, mb: 2 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color={COLORS.textSecondary}>Cần thu:</Typography>
                      <Typography fontWeight={600}>{formatCurrency(totalDue)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color={COLORS.textSecondary}>Đã thanh toán:</Typography>
                      <Typography fontWeight={600} color={COLORS.success}>{formatCurrency(totalPaidMulti)}</Typography>
                    </Stack>
                    <Divider />
                    {remainingDue > 0 ? (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontWeight={600} color={COLORS.warning}>Còn thiếu:</Typography>
                        <Typography variant="h6" fontWeight={700} color={COLORS.warning}>
                          {formatCurrency(remainingDue)}
                        </Typography>
                      </Stack>
                    ) : (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontWeight={600} color={COLORS.success}>Tiền thối:</Typography>
                        <Typography variant="h6" fontWeight={700} color={COLORS.success}>
                          {formatCurrency(Math.abs(remainingDue))}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => setConfirmDialog({ open: true, type: 'pay' })}
                    disabled={payInvoice.isLoading || (payments.length === 0 && remainingDue > 0)}
                    startIcon={<CheckCircle />}
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${COLORS.success}, #059669)`,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      boxShadow: `0 4px 20px ${COLORS.success}40`,
                      '&:hover': {
                        boxShadow: `0 6px 30px ${COLORS.success}50`,
                      },
                    }}
                  >
                    {remainingDue > 0 && payments.length > 0 
                      ? `Còn thiếu ${formatCurrency(remainingDue)}`
                      : 'Xác nhận thanh toán'}
                  </Button>
                </Box>
              </>
            ) : selectedOrder && selectedType === 'order' ? (
              /* Show message for pending orders */
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 10, px: 3 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${COLORS.warning}20, ${COLORS.warningLight})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <Receipt sx={{ fontSize: 40, color: COLORS.warning }} />
                </Box>
                <Typography variant="h6" color={COLORS.textPrimary} fontWeight={600} textAlign="center" sx={{ mb: 1 }}>
                  Đơn hàng chưa có hóa đơn
                </Typography>
                <Typography color={COLORS.textSecondary} textAlign="center" sx={{ mb: 3 }}>
                  Vui lòng tạo hóa đơn trước khi thanh toán
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleQuickCheckout(selectedOrder.id)}
                  disabled={checkoutOrder.isPending}
                  startIcon={<Receipt />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${COLORS.warning}, #D97706)`,
                    fontWeight: 700,
                    textTransform: 'none',
                  }}
                >
                  {checkoutOrder.isPending ? 'Đang tạo...' : 'Tạo hóa đơn ngay'}
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 10 }}>
                <PointOfSale sx={{ fontSize: 80, color: COLORS.textMuted, opacity: 0.3, mb: 2 }} />
                <Typography variant="h6" color={COLORS.textSecondary}>
                  Chọn hóa đơn để thanh toán
                </Typography>
              </Box>
            )}
          </Paper>
        </Stack>

        {/* ==================== CONFIRM PAYMENT DIALOG ==================== */}
        <Dialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, type: null })}
          PaperProps={{
            sx: {
              borderRadius: 4,
              minWidth: 400,
            },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CheckCircle sx={{ color: COLORS.success }} />
              <Typography variant="h6" fontWeight={700}>Xác nhận thanh toán</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ py: 2 }}>
              <Paper sx={{ p: 2, background: COLORS.surfaceHover, borderRadius: 2, mb: 2 }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color={COLORS.textSecondary}>Hóa đơn:</Typography>
                    <Typography fontWeight={600}>#{selected?.id?.slice(0, 8)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color={COLORS.textSecondary}>Bàn:</Typography>
                    <Typography fontWeight={600}>{selected?.donHang?.ban?.ten || 'N/A'}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color={COLORS.textSecondary}>Phương thức:</Typography>
                    <Typography fontWeight={600}>
                      {paymentMethod === 'TienMat' ? '💵 Tiền mặt' : paymentMethod === 'The' ? '💳 Thẻ' : '📱 QR'}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Tổng thanh toán:</Typography>
                <Typography variant="h4" fontWeight={700} color={COLORS.primary}>
                  {formatCurrency(totalDue)}
                </Typography>
              </Stack>
              {changeDue > 0 && (
                <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                  Tiền thối lại khách: <strong>{formatCurrency(changeDue)}</strong>
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setConfirmDialog({ open: false, type: null })}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handlePay}
              disabled={payInvoice.isLoading}
              sx={{
                borderRadius: 2,
                px: 4,
                background: `linear-gradient(135deg, ${COLORS.success}, #059669)`,
              }}
            >
              {payInvoice.isLoading ? 'Đang xử lý...' : 'Thanh toán ngay'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ==================== DISCOUNT APPROVAL DIALOG ==================== */}
        <Dialog
          open={discountApprovalDialog.open}
          onClose={() => {
            setDiscountApprovalDialog({ open: false, pendingDiscount: 0 });
            setManagerPin('');
            setManagerUsername('');
          }}
          PaperProps={{ sx: { borderRadius: 4, minWidth: 400 } }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Lock sx={{ color: COLORS.warning }} />
              <Typography variant="h6" fontWeight={700}>Xác thực giảm giá</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              Áp dụng giảm giá <strong>{formatCurrency(discountApprovalDialog.pendingDiscount)}</strong> cần có sự phê duyệt của Quản lý.
            </Alert>
            <Stack spacing={2}>
              <TextField
                label="Tên đăng nhập Quản lý (tùy chọn)"
                value={managerUsername}
                onChange={(e) => setManagerUsername(e.target.value)}
                fullWidth
                placeholder="Để trống để tìm bất kỳ quản lý nào"
              />
              <TextField
                label="Mã PIN của Quản lý"
                type="password"
                value={managerPin}
                onChange={(e) => setManagerPin(e.target.value)}
                fullWidth
                required
                autoFocus
                inputProps={{ maxLength: 20 }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => {
                setDiscountApprovalDialog({ open: false, pendingDiscount: 0 });
                setManagerPin('');
                setManagerUsername('');
              }}
            >
              Hủy
            </Button>
            <Button 
              variant="contained" 
              onClick={handleDiscountApproval}
              disabled={!managerPin || checkoutOrder.isLoading}
              sx={{ background: `linear-gradient(135deg, ${COLORS.warning}, #D97706)` }}
            >
              {checkoutOrder.isLoading ? 'Đang xác thực...' : 'Xác nhận giảm giá'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ==================== SPLIT BILL DIALOG ==================== */}
        <Dialog
          open={splitDialogOpen}
          onClose={() => setSplitDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 4 } }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CallSplit sx={{ color: COLORS.info }} />
              <Typography variant="h6" fontWeight={700}>Tách hóa đơn</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Tabs 
              value={splitTab} 
              onChange={(e, v) => setSplitTab(v)} 
              sx={{ mb: 3, borderBottom: `1px solid ${COLORS.border}` }}
            >
              <Tab icon={<CallSplit />} label="Theo món" iconPosition="start" />
              <Tab icon={<People />} label="Chia đều" iconPosition="start" />
            </Tabs>

            {splitTab === 0 && (
              <Box>
                <Typography variant="body2" color={COLORS.textSecondary} sx={{ mb: 2 }}>
                  Chọn các món muốn tách sang hóa đơn mới:
                </Typography>
                <Stack spacing={1}>
                  {orderItems.map((item) => (
                    <Paper
                      key={item.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: `2px solid ${selectedItemIds.includes(item.id) ? COLORS.primary : COLORS.border}`,
                        background: selectedItemIds.includes(item.id) ? `${COLORS.primary}08` : COLORS.cardBg,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => toggleItemSelection(item.id)}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Checkbox
                          checked={selectedItemIds.includes(item.id)}
                          sx={{ p: 0 }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography fontWeight={600}>{item.monAn?.ten || 'N/A'}</Typography>
                          <Typography variant="caption" color={COLORS.textSecondary}>
                            ×{item.soLuong} • {formatCurrency(Number(item.donGia) * item.soLuong)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
                {orderItems.length === 0 && (
                  <Typography color={COLORS.textSecondary} textAlign="center" py={4}>
                    Không có món nào để tách.
                  </Typography>
                )}
              </Box>
            )}

            {splitTab === 1 && (
              <Box>
                <Typography variant="body2" color={COLORS.textSecondary} sx={{ mb: 2 }}>
                  Chia đều hóa đơn cho số người:
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <IconButton 
                    onClick={() => setNumPeople(Math.max(2, numPeople - 1))}
                    sx={{ background: COLORS.surfaceHover }}
                  >
                    <Remove />
                  </IconButton>
                  <TextField
                    type="number"
                    value={numPeople}
                    onChange={(e) => setNumPeople(Math.max(2, parseInt(e.target.value) || 2))}
                    inputProps={{ min: 2, max: 50, style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 700 } }}
                    sx={{ width: 100 }}
                  />
                  <IconButton 
                    onClick={() => setNumPeople(numPeople + 1)}
                    sx={{ background: COLORS.surfaceHover }}
                  >
                    <Add />
                  </IconButton>
                  <Typography color={COLORS.textSecondary}>người</Typography>
                </Stack>
                
                <Paper sx={{ p: 2, background: `${COLORS.info}10`, borderRadius: 2 }}>
                  <Typography variant="h6" color={COLORS.info}>
                    💰 Mỗi người trả: <strong>{formatCurrency(Math.floor(totalDue / numPeople))}</strong>
                  </Typography>
                  {totalDue % numPeople > 0 && (
                    <Typography variant="body2" color={COLORS.textSecondary} sx={{ mt: 0.5 }}>
                      (Số dư {formatCurrency(totalDue % numPeople)} giữ lại hóa đơn gốc)
                    </Typography>
                  )}
                </Paper>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setSplitDialogOpen(false)} sx={{ borderRadius: 2 }}>
              Hủy
            </Button>
            {splitTab === 0 && (
              <Button
                variant="contained"
                onClick={handleSplitByItems}
                disabled={selectedItemIds.length === 0 || splitByItems.isLoading}
                sx={{ borderRadius: 2, background: `linear-gradient(135deg, ${COLORS.info}, ${COLORS.primary})` }}
              >
                Tách {selectedItemIds.length} món
              </Button>
            )}
            {splitTab === 1 && (
              <Button
                variant="contained"
                onClick={handleSplitByPeople}
                disabled={numPeople < 2 || splitByPeople.isLoading}
                sx={{ borderRadius: 2, background: `linear-gradient(135deg, ${COLORS.info}, ${COLORS.primary})` }}
              >
                Chia cho {numPeople} người
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* ==================== MERGE INVOICES DIALOG ==================== */}
        <Dialog open={mergeDialogOpen} onClose={() => setMergeDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
          <DialogTitle sx={{ pb: 1 }}>Gộp hóa đơn</DialogTitle>
          <DialogContent>
            {(() => {
              const selectedInvoices = selectedIds.map((id) => invoices.find((i) => i.id === id) || {});
              const tableIds = new Set(selectedInvoices.map((inv) => inv.donHang?.banId || inv.donHang?.ban?.id || ''));
              const tableMismatch = tableIds.size > 1;
              return (
                <>
                  <Typography>Bạn sắp gộp <strong>{selectedIds.length}</strong> hóa đơn:</Typography>

                  {tableMismatch && (
                    <Alert severity="warning" sx={{ my: 2 }}>Các hóa đơn phải thuộc cùng một bàn để có thể gộp.</Alert>
                  )}

                  <Stack spacing={1} sx={{ mt: 2 }}>
                    {selectedInvoices.map((inv) => (
                      <Paper key={inv.id || Math.random()} sx={{ p: 1 }}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography>{inv.donHang?.ban?.ten || `#${inv.id?.slice(0,6) || '---'}`}</Typography>
                          <Typography>{formatCurrency(Number(inv.tongThanhToan || 0))}</Typography>
                        </Stack>
                      </Paper>
                    ))}
                    <Divider />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={700}>Tổng</Typography>
                      <Typography fontWeight={700}>{formatCurrency(selectedIds.reduce((s, id) => s + Number(invoices.find(i => i.id === id)?.tongThanhToan || 0), 0))}</Typography>
                    </Stack>
                  </Stack>
                </>
              );
            })()}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setMergeDialogOpen(false)}>Hủy</Button>
            <Button variant="contained"
              disabled={mergeInvoices.isLoading || selectedIds.length < 2 || tableMismatch}
              onClick={async () => {
                try {
                  await mergeInvoices.mutateAsync({ invoiceIds: selectedIds });
                  setSnackbar({ open: true, message: '✅ Gộp thành công', severity: 'success' });
                  setSelectedIds([]);
                  setMergeDialogOpen(false);
                  refetch();
                } catch (err) {
                  // Show server message if available
                  const msg = err?.response?.data?.message || err?.message || 'Gộp thất bại';
                  setSnackbar({ open: true, message: msg, severity: 'error' });
                }
              }}
              sx={{ borderRadius: 2, background: `linear-gradient(135deg, ${COLORS.info}, ${COLORS.primary})` }}
            >
              Xác nhận gộp
            </Button>
          </DialogActions>
        </Dialog>

        {/* ==================== SNACKBAR ==================== */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{
              borderRadius: 3,
              fontWeight: 600,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
};

export default OpenBills;

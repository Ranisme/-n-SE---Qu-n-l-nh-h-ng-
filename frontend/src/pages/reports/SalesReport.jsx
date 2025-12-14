import React, { useState, useMemo } from 'react';
import MainLayout from '../../layouts/MainLayout';
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  TextField,
  Button,
  Chip,
  Box,
  alpha,
  Grid,
  Card,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { Receipt, AttachMoney, TrendingUp, Today } from '@mui/icons-material';
import { useSalesReport } from '../../hooks/useReports';

const COLORS = {
  primary: '#0EA5E9',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  bg: '#F8FAFC',
};

// Get date range presets
const getDateRange = (period) => {
  const now = new Date();
  const end = now.toISOString().split('T')[0];
  let start;
  
  switch (period) {
    case 'today':
      start = end;
      break;
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      start = weekStart.toISOString().split('T')[0];
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  }
  
  return { from: start, to: end };
};

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <Card
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 3,
      border: `1px solid ${COLORS.border}`,
      background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.02)} 100%)`,
    }}
  >
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: alpha(color, 0.15),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon sx={{ color, fontSize: 24 }} />
      </Box>
      <Box>
        <Typography variant="body2" color={COLORS.textSecondary}>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={700} color={COLORS.text}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color={COLORS.textSecondary}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  </Card>
);

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const SalesReport = () => {
  const [period, setPeriod] = useState('month');
  const [filters, setFilters] = useState(() => getDateRange('month'));
  const { data: bills = [], isLoading, refetch } = useSalesReport(filters);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRevenue = bills.reduce((sum, bill) => sum + (Number(bill.tongThanhToan) || 0), 0);
    const totalBills = bills.length;
    const avgBill = totalBills > 0 ? totalRevenue / totalBills : 0;
    
    // Group by date
    const byDate = bills.reduce((acc, bill) => {
      const date = new Date(bill.createdAt).toLocaleDateString('vi-VN');
      if (!acc[date]) acc[date] = { count: 0, total: 0 };
      acc[date].count += 1;
      acc[date].total += Number(bill.tongThanhToan) || 0;
      return acc;
    }, {});
    
    return {
      totalRevenue,
      totalBills,
      avgBill,
      daysWithSales: Object.keys(byDate).length,
      byDate,
    };
  }, [bills]);

  const handlePeriodChange = (_, newPeriod) => {
    if (newPeriod) {
      setPeriod(newPeriod);
      const range = getDateRange(newPeriod);
      setFilters(range);
    }
  };

  const handleFilter = () => refetch();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <MainLayout title="Báo cáo doanh thu">
      <Stack spacing={3}>
        {/* Filter Section */}
        <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${COLORS.border}` }}>
          <Typography variant="h6" fontWeight={700} color={COLORS.text} sx={{ mb: 2 }}>
            📊 Chọn kỳ báo cáo
          </Typography>
          
          <Stack spacing={2}>
            <ToggleButtonGroup
              value={period}
              exclusive
              onChange={handlePeriodChange}
              size="small"
            >
              <ToggleButton value="today">Hôm nay</ToggleButton>
              <ToggleButton value="week">7 ngày</ToggleButton>
              <ToggleButton value="month">Tháng này</ToggleButton>
              <ToggleButton value="custom">Tùy chọn</ToggleButton>
            </ToggleButtonGroup>
            
            {period === 'custom' && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <TextField
                  label="Từ ngày"
                  type="date"
                  value={filters.from}
                  onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <TextField
                  label="Đến ngày"
                  type="date"
                  value={filters.to}
                  onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <Button variant="contained" onClick={handleFilter}>
                  Xem báo cáo
                </Button>
              </Stack>
            )}
          </Stack>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <StatCard
              title="Tổng doanh thu"
              value={formatCurrency(stats.totalRevenue)}
              subtitle={`từ ${filters.from} đến ${filters.to}`}
              icon={AttachMoney}
              color={COLORS.success}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard
              title="Số hóa đơn"
              value={stats.totalBills}
              subtitle="đã thanh toán"
              icon={Receipt}
              color={COLORS.primary}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard
              title="Trung bình/đơn"
              value={formatCurrency(stats.avgBill)}
              subtitle="giá trị TB mỗi hóa đơn"
              icon={TrendingUp}
              color={COLORS.warning}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard
              title="Số ngày có doanh thu"
              value={stats.daysWithSales}
              subtitle="trong kỳ"
              icon={Today}
              color={COLORS.danger}
            />
          </Grid>
        </Grid>

        {/* Bills List */}
        <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${COLORS.border}` }}>
          <Typography variant="h6" fontWeight={700} color={COLORS.text} sx={{ mb: 2 }}>
            📋 Danh sách hóa đơn
          </Typography>
          
          {isLoading ? (
            <Typography color={COLORS.textSecondary}>Đang tải...</Typography>
          ) : bills.length === 0 ? (
            <Typography color={COLORS.textSecondary} sx={{ py: 4, textAlign: 'center' }}>
              Không có dữ liệu trong kỳ này
            </Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: COLORS.bg }}>
                  <TableCell sx={{ fontWeight: 600 }}>Mã HĐ</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Ngày giờ</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Bàn</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Tổng tiền</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill.id} hover>
                    <TableCell>
                      <Typography fontWeight={600} color={COLORS.primary}>
                        #{bill.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(bill.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={bill.donHang?.ban?.ten || `Bàn ${bill.donHang?.banId || '---'}`}
                        size="small"
                        sx={{ bgcolor: alpha(COLORS.primary, 0.1), color: COLORS.primary }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={700} color={COLORS.success}>
                        {formatCurrency(bill.tongThanhToan)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="Đã thanh toán"
                        size="small"
                        sx={{ bgcolor: alpha(COLORS.success, 0.1), color: COLORS.success }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Stack>
    </MainLayout>
  );
};

export default SalesReport;

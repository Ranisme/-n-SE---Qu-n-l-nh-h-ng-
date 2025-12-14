import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import {
  Paper,
  Typography,
  Stack,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Divider,
  TextField,
  MenuItem,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Restaurant,
  Inventory2,
  People,
  AttachMoney,
  CalendarMonth,
  Assessment,
  PieChart,
  BarChart,
  ShowChart,
  ArrowForward,
  Download,
  DateRange,
  Today,
  Schedule,
} from '@mui/icons-material';

// ==================== PREMIUM COLORS ====================
const COLORS = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  purple: '#8B5CF6',
  purpleLight: '#EDE9FE',
  pink: '#EC4899',
  pinkLight: '#FCE7F3',
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  surfaceHover: '#F1F5F9',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
};

// ==================== REPORT CARD ====================
const ReportCard = ({ title, description, icon, color, path, stats, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -4 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.2 }}
  >
    <Card
      sx={{
        borderRadius: 4,
        border: `1px solid ${COLORS.border}`,
        overflow: 'hidden',
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: color,
          boxShadow: `0 8px 30px ${color}25`,
        },
      }}
      onClick={onClick}
    >
      <CardActionArea sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${color}, ${color}CC)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 14px ${color}40`,
              }}
            >
              {icon}
            </Box>
            <Chip
              size="small"
              icon={<ArrowForward sx={{ fontSize: 14 }} />}
              label="Xem"
              sx={{
                background: `${color}15`,
                color: color,
                fontWeight: 600,
                '& .MuiChip-icon': { color: color },
              }}
            />
          </Stack>

          {/* Content */}
          <Typography variant="h6" fontWeight={700} color={COLORS.textPrimary} sx={{ mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" color={COLORS.textSecondary} sx={{ mb: 2, flex: 1 }}>
            {description}
          </Typography>

          {/* Stats Preview */}
          {stats && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                background: `${color}08`,
                border: `1px solid ${color}20`,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color={COLORS.textSecondary}>
                  {stats.label}
                </Typography>
                <Typography variant="subtitle2" fontWeight={700} color={color}>
                  {stats.value}
                </Typography>
              </Stack>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  </motion.div>
);

// ==================== QUICK STAT CARD ====================
const QuickStatCard = ({ icon, label, value, change, color }) => (
  <Paper
    sx={{
      p: 2.5,
      borderRadius: 3,
      background: `linear-gradient(135deg, ${color}08, ${color}03)`,
      border: `1px solid ${color}20`,
    }}
  >
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          background: `${color}15`,
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
      {change && (
        <Chip
          size="small"
          icon={<TrendingUp sx={{ fontSize: 14 }} />}
          label={change}
          sx={{
            background: COLORS.successLight,
            color: COLORS.success,
            fontWeight: 600,
            '& .MuiChip-icon': { color: COLORS.success },
          }}
        />
      )}
    </Stack>
  </Paper>
);

// ==================== MAIN COMPONENT ====================
const ReportsDashboard = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('today');

  const reportCards = [
    {
      title: 'Báo cáo Doanh thu',
      description: 'Thống kê doanh thu theo ngày, tuần, tháng. Biểu đồ xu hướng và so sánh.',
      icon: <AttachMoney sx={{ color: '#fff', fontSize: 28 }} />,
      color: COLORS.success,
      path: '/reports/sales',
      stats: { label: 'Hôm nay', value: '-- VNĐ' },
    },
    {
      title: 'Hiệu suất Thực đơn',
      description: 'Phân tích món bán chạy, tỷ lệ lợi nhuận, xu hướng đặt món.',
      icon: <Restaurant sx={{ color: '#fff', fontSize: 28 }} />,
      color: COLORS.primary,
      path: '/reports/menu',
      stats: { label: 'Món bán chạy nhất', value: '--' },
    },
    {
      title: 'Báo cáo Tồn kho',
      description: 'Tình trạng kho, nguyên liệu sắp hết, giá trị tồn kho.',
      icon: <Inventory2 sx={{ color: '#fff', fontSize: 28 }} />,
      color: COLORS.warning,
      path: '/reports/inventory',
      stats: { label: 'Cảnh báo', value: '-- mặt hàng' },
    },
    {
      title: 'Chấm công Nhân viên',
      description: 'Thống kê giờ làm, ngày nghỉ, hiệu suất làm việc.',
      icon: <People sx={{ color: '#fff', fontSize: 28 }} />,
      color: COLORS.info,
      path: '/reports/attendance',
      stats: { label: 'Nhân viên hôm nay', value: '--' },
    },
  ];

  const quickStats = [
    {
      icon: <AttachMoney sx={{ color: COLORS.success, fontSize: 24 }} />,
      label: 'Doanh thu hôm nay',
      value: '-- VNĐ',
      change: '+---%',
      color: COLORS.success,
    },
    {
      icon: <Restaurant sx={{ color: COLORS.primary, fontSize: 24 }} />,
      label: 'Đơn hàng hôm nay',
      value: '--',
      change: '+---%',
      color: COLORS.primary,
    },
    {
      icon: <People sx={{ color: COLORS.info, fontSize: 24 }} />,
      label: 'Khách hàng mới',
      value: '--',
      change: '+---%',
      color: COLORS.info,
    },
    {
      icon: <TrendingUp sx={{ color: COLORS.purple, fontSize: 24 }} />,
      label: 'Giá trị TB/đơn',
      value: '-- VNĐ',
      change: '+---%',
      color: COLORS.purple,
    },
  ];

  return (
    <MainLayout title="Báo cáo & Thống kê">
      <Box sx={{ background: COLORS.background, minHeight: '100vh', mx: -3, mt: -2, px: 3, py: 2 }}>
        {/* ==================== HEADER ==================== */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ md: 'center' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h4" fontWeight={800} color={COLORS.textPrimary}>
              📊 Trung tâm Báo cáo
            </Typography>
            <Typography variant="body1" color={COLORS.textSecondary}>
              Tổng quan hoạt động kinh doanh và phân tích dữ liệu
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <TextField
              select
              size="small"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              sx={{
                minWidth: 160,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  background: COLORS.cardBg,
                },
              }}
              InputProps={{
                startAdornment: <CalendarMonth sx={{ color: COLORS.textMuted, mr: 1, fontSize: 20 }} />,
              }}
            >
              <MenuItem value="today">Hôm nay</MenuItem>
              <MenuItem value="yesterday">Hôm qua</MenuItem>
              <MenuItem value="week">7 ngày qua</MenuItem>
              <MenuItem value="month">30 ngày qua</MenuItem>
              <MenuItem value="quarter">Quý này</MenuItem>
              <MenuItem value="year">Năm nay</MenuItem>
            </TextField>
            <Button
              variant="outlined"
              startIcon={<Download />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Xuất báo cáo
            </Button>
          </Stack>
        </Stack>

        {/* ==================== QUICK STATS ==================== */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {quickStats.map((stat, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <QuickStatCard {...stat} />
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* ==================== REPORT CARDS ==================== */}
        <Typography variant="h6" fontWeight={700} color={COLORS.textPrimary} sx={{ mb: 2 }}>
          📈 Báo cáo chi tiết
        </Typography>
        <Grid container spacing={3}>
          {reportCards.map((card, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
              >
                <ReportCard {...card} onClick={() => navigate(card.path)} />
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* ==================== CHART PLACEHOLDERS ==================== */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: `1px solid ${COLORS.border}`,
                  height: 350,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={700} color={COLORS.textPrimary}>
                    📈 Xu hướng Doanh thu
                  </Typography>
                  <Chip
                    size="small"
                    icon={<ShowChart sx={{ fontSize: 16 }} />}
                    label="7 ngày qua"
                    sx={{ background: `${COLORS.primary}15`, color: COLORS.primary }}
                  />
                </Stack>
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${COLORS.primary}05, ${COLORS.primaryLight}03)`,
                    borderRadius: 3,
                    border: `2px dashed ${COLORS.border}`,
                  }}
                >
                  <Stack alignItems="center" spacing={1}>
                    <BarChart sx={{ fontSize: 60, color: COLORS.textMuted, opacity: 0.4 }} />
                    <Typography color={COLORS.textSecondary}>
                      Biểu đồ doanh thu sẽ hiển thị ở đây
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => navigate('/reports/sales')}
                      sx={{ textTransform: 'none' }}
                    >
                      Xem chi tiết →
                    </Button>
                  </Stack>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: `1px solid ${COLORS.border}`,
                  height: 350,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={700} color={COLORS.textPrimary}>
                    🍽️ Top Món bán chạy
                  </Typography>
                  <Chip
                    size="small"
                    icon={<PieChart sx={{ fontSize: 16 }} />}
                    label="Hôm nay"
                    sx={{ background: `${COLORS.warning}15`, color: COLORS.warning }}
                  />
                </Stack>
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${COLORS.warning}05, ${COLORS.warningLight}03)`,
                    borderRadius: 3,
                    border: `2px dashed ${COLORS.border}`,
                  }}
                >
                  <Stack alignItems="center" spacing={1}>
                    <PieChart sx={{ fontSize: 60, color: COLORS.textMuted, opacity: 0.4 }} />
                    <Typography color={COLORS.textSecondary} textAlign="center">
                      Biểu đồ món ăn sẽ hiển thị ở đây
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => navigate('/reports/menu')}
                      sx={{ textTransform: 'none' }}
                    >
                      Xem chi tiết →
                    </Button>
                  </Stack>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* ==================== QUICK LINKS ==================== */}
        <Paper
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 4,
            border: `1px solid ${COLORS.border}`,
            background: `linear-gradient(135deg, ${COLORS.primary}05, ${COLORS.primaryLight}03)`,
          }}
        >
          <Typography variant="h6" fontWeight={700} color={COLORS.textPrimary} sx={{ mb: 2 }}>
            ⚡ Truy cập nhanh
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<Today />}
              onClick={() => navigate('/reports/sales')}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Doanh thu hôm nay
            </Button>
            <Button
              variant="outlined"
              startIcon={<DateRange />}
              onClick={() => navigate('/reports/sales')}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Báo cáo tuần
            </Button>
            <Button
              variant="outlined"
              startIcon={<Assessment />}
              onClick={() => navigate('/reports/menu')}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Phân tích thực đơn
            </Button>
            <Button
              variant="outlined"
              startIcon={<Schedule />}
              onClick={() => navigate('/reports/attendance')}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Bảng chấm công
            </Button>
          </Stack>
        </Paper>
      </Box>
    </MainLayout>
  );
};

export default ReportsDashboard;

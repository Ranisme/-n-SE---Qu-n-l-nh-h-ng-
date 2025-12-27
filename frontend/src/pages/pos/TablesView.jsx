import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Button,
  Stack,
  Chip,
  Tooltip,
  Divider,
  Avatar,
  alpha,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  Popover,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from '@mui/material';
import {
  Add,
  Remove,
  Search,
  Restaurant,
  LocalDining,
  AccessTime,
  DeleteOutline,
  TableRestaurant,
  MeetingRoom,
  Lock,
  LockOpen,
  Groups,
  LocalFireDepartment,
  ShoppingCart,
  Receipt,
  KeyboardArrowRight,
  Star,
  Close,
  NoteAdd,
  Tune,
  Cancel,
  Warning,
  Key,
  Edit,
  NotificationsActive,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import PosLayout from '../../layouts/PosLayout';
import { useTables } from '../../hooks/useTables';
import { useMenuDishes, useMenuCategories, useMenuOptions } from '../../hooks/useMenu';
import { useCreateOrder, useVoidOrderItem, usePosNotifications, useOrders, useCreateVoidRequest } from '../../hooks/useOrders';

// ============================================
// 🎨 PREMIUM POS COLOR SYSTEM
// ============================================
const POS_COLORS = {
  primary: {
    main: '#0284C7',
    light: '#0EA5E9',
    dark: '#0369A1',
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
  },
  secondary: {
    main: '#22C55E',
    light: '#4ADE80',
    dark: '#16A34A',
    gradient: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)',
  },
  status: {
    available: '#86EFAC',
    occupied: '#FDA4AF',
    reserved: '#93C5FD',
    pending: '#FDE68A',
    cleaning: '#C4B5FD',
  },
  background: {
    main: '#F8FAFC',
    paper: '#FFFFFF',
    subtle: '#F1F5F9',
  },
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    muted: '#94A3B8',
  },
  danger: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
};

// ============================================
// 🍽 PREMIUM TABLE ITEM COMPONENT
// ============================================
const TableItem = ({ table, isSelected, onClick }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const getStatusConfig = (status) => {
    const configs = {
      'TRONG': {
        color: POS_COLORS.status.available,
        bgColor: alpha(POS_COLORS.status.available, 0.15),
        icon: <LockOpen sx={{ fontSize: 12 }} />,
        label: 'Sẵn sàng'
      },
      'COKHACH': {
        color: POS_COLORS.status.occupied,
        bgColor: alpha(POS_COLORS.status.occupied, 0.15),
        icon: <Groups sx={{ fontSize: 12 }} />,
        label: 'Có khách'
      },
      'DADAT': {
        color: POS_COLORS.status.reserved,
        bgColor: alpha(POS_COLORS.status.reserved, 0.15),
        icon: <Lock sx={{ fontSize: 12 }} />,
        label: 'Đặt trước'
      },
      'CHOTHANHTOAN': {
        color: POS_COLORS.status.pending,
        bgColor: alpha(POS_COLORS.status.pending, 0.15),
        icon: <Receipt sx={{ fontSize: 12 }} />,
        label: 'Chờ thanh toán'
      },
      'CANDON': {
        color: POS_COLORS.status.cleaning,
        bgColor: alpha(POS_COLORS.status.cleaning, 0.15),
        icon: <AccessTime sx={{ fontSize: 12 }} />,
        label: 'Cần dọn'
      },
    };
    return configs[status] || configs['TRONG'];
  };

  const statusConfig = getStatusConfig(table.trangThai);
  const handlePopoverOpen = (event) => setAnchorEl(event.currentTarget);
  const handlePopoverClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.06, y: -4 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <Paper
          onClick={() => onClick(table)}
          onMouseEnter={handlePopoverOpen}
          onMouseLeave={handlePopoverClose}
          elevation={0}
          sx={{
            width: 95,
            height: 95,
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: `2px solid ${statusConfig.color}`,
            bgcolor: isSelected ? statusConfig.bgColor : 'background.paper',
            position: 'relative',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isSelected
              ? `0 8px 24px ${alpha(statusConfig.color, 0.35)}, 0 0 0 3px ${alpha(statusConfig.color, 0.2)}`
              : `0 2px 8px ${alpha('#000', 0.06)}`,
            '&:hover': {
              boxShadow: `0 12px 28px ${alpha(statusConfig.color, 0.25)}`,
            },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -6,
              right: -6,
              width: 26,
              height: 26,
              borderRadius: '50%',
              bgcolor: statusConfig.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: `0 2px 8px ${alpha(statusConfig.color, 0.5)}`,
            }}
          >
            {statusConfig.icon}
          </Box>
          <Typography variant="subtitle2" fontWeight="700" sx={{ color: POS_COLORS.text.primary, fontSize: '1rem' }}>
            {table.ten}
          </Typography>
          <Typography variant="caption" sx={{ color: POS_COLORS.text.muted, fontSize: '0.8rem' }}>
            {table.soGhe} ghế
          </Typography>
        </Paper>
      </motion.div>

      <Popover
        sx={{ pointerEvents: 'none' }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={handlePopoverClose}
        disableRestoreFocus
        TransitionComponent={Fade}
      >
        <Box sx={{ p: 1.5, minWidth: 130 }}>
          <Typography variant="subtitle2" fontWeight="600">{table.ten}</Typography>
          <Stack spacing={0.5} mt={0.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: statusConfig.color }} />
              <Typography variant="caption" color="text.secondary">{statusConfig.label}</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">Sức chứa: {table.soGhe} người</Typography>
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

// ============================================
// 🍱 FOOD IMAGE MAPPING - Different images for variety
// ============================================
const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', // Salad
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', // Pancakes
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', // Pizza
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400', // Veggie bowl
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400', // Dessert
  'https://images.unsplash.com/photo-1482049016gy-f10b10d8bd7f?w=400', // Fresh food
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', // Meat dish
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', // Healthy bowl
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400', // Pasta
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400', // Breakfast
  'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400', // Asian food
  'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400', // French toast
  'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400', // Noodles
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400', // Seafood
  'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400', // Steak
  'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=400', // Burger
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', // Fine dining
  'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400', // Asian cuisine
  'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400', // Restaurant food
  'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?w=400', // BBQ
];

const getDishImage = (dish) => {
  // If dish has its own image, use it
  if (dish.hinhAnh && dish.hinhAnh.length > 0) return dish.hinhAnh;
  // Otherwise, use a consistent image based on dish ID
  const index = dish.id ? (typeof dish.id === 'number' ? dish.id : dish.id.charCodeAt(0)) % FOOD_IMAGES.length : 0;
  return FOOD_IMAGES[index];
};

// ============================================
// 🍱 PREMIUM MENU CARD COMPONENT
// ============================================
const MenuCard = ({ dish, onAdd }) => {
  const [isHovered, setIsHovered] = useState(false);

  const dishImage = useMemo(() => getDishImage(dish), [dish]);

  const badges = useMemo(() => {
    const result = [];
    if (dish.ten?.toLowerCase().includes('combo')) result.push({ label: 'Hot', color: '#EF4444', icon: <LocalFireDepartment sx={{ fontSize: 12 }} /> });
    if (dish.giaBan > 200000) result.push({ label: 'Premium', color: '#8B5CF6' });
    if (dish.ten?.toLowerCase().includes('đặc biệt')) result.push({ label: 'Mới', color: '#0EA5E9' });
    return result;
  }, [dish]);

  const handleAddItem = (e) => {
    // Prevent any form submission or navigation
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent?.stopImmediatePropagation?.();
    }
    // Call the add handler
    if (typeof onAdd === 'function') {
      onAdd(dish);
    }
    return false;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      <Box
        onClick={handleAddItem}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') handleAddItem(e); }}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          overflow: 'hidden',
          bgcolor: 'white',
          border: '1px solid',
          borderColor: alpha('#000', 0.06),
          boxShadow: isHovered
            ? `0 12px 28px ${alpha('#000', 0.12)}`
            : `0 2px 8px ${alpha('#000', 0.04)}`,
          transform: isHovered ? 'translateY(-2px)' : 'none',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
        }}
      >
        <Box sx={{ position: 'relative', pt: '100%' }}>
          <CardMedia
            component="img"
            image={dishImage}
            alt={dish.ten}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {badges.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 8, left: 8 }}>
              {badges.map((badge, idx) => (
                <Chip
                  key={idx}
                  label={badge.label}
                  icon={badge.icon}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    bgcolor: badge.color,
                    color: 'white',
                    '& .MuiChip-icon': { color: 'white', ml: 0.3 },
                    '& .MuiChip-label': { px: 0.75 },
                  }}
                />
              ))}
            </Stack>
          )}

          <motion.div
            style={{ position: 'absolute', bottom: 8, right: 8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <IconButton
              onClick={handleAddItem}
              sx={{
                width: 38,
                height: 38,
                background: POS_COLORS.primary.gradient,
                color: 'white',
                boxShadow: `0 4px 12px ${alpha(POS_COLORS.primary.main, 0.4)}`,
                '&:hover': {
                  background: POS_COLORS.primary.gradient,
                  boxShadow: `0 6px 16px ${alpha(POS_COLORS.primary.main, 0.5)}`,
                },
              }}
            >
              <Add sx={{ fontSize: 22 }} />
            </IconButton>
          </motion.div>
        </Box>

        <CardContent sx={{ p: 1.25, pt: 1 }}>
          <Typography
            variant="body2"
            fontWeight="600"
            noWrap
            title={dish.ten}
            sx={{ color: POS_COLORS.text.primary, fontSize: '0.9rem', mb: 0.25 }}
          >
            {dish.ten}
          </Typography>
          <Typography
            variant="body2"
            fontWeight="700"
            sx={{ color: POS_COLORS.primary.main, fontSize: '0.95rem' }}
          >
            {(dish.giaBan || 0).toLocaleString()}₫
          </Typography>
        </CardContent>
      </Box>
    </motion.div>
  );
};

// ============================================
// 🛒 PREMIUM CART ITEM COMPONENT
// ============================================
const CartItem = ({ item, options = [], onUpdate, onRemove, onVoid }) => {
  // Calculate item total with options
  const getItemTotal = () => {
    let price = Number(item.giaBan || 0);
    (item.selectedOptions || []).forEach(optId => {
      const opt = options.find(o => o.id === optId);
      if (opt) price += Number(opt.giaThem || 0);
    });
    return price * item.quantity;
  };

  // Get option names
  const getOptionNames = () => {
    return (item.selectedOptions || [])
      .map(optId => options.find(o => o.id === optId)?.ten)
      .filter(Boolean)
      .join(', ');
  };

  const optionNames = getOptionNames();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          p: 1,
          mb: 0.75,
          bgcolor: POS_COLORS.background.subtle,
          borderRadius: '10px',
          border: '1px solid',
          borderColor: alpha('#000', 0.04),
        }}
      >
        <Avatar
          src={item.hinhAnh || getDishImage(item)}
          variant="rounded"
          sx={{ width: 52, height: 52, borderRadius: '10px', boxShadow: `0 2px 8px ${alpha('#000', 0.08)}` }}
        >
          <LocalDining />
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight="600" noWrap sx={{ color: POS_COLORS.text.primary, fontSize: '0.9rem' }}>
            {item.ten}
          </Typography>

          {/* Show options */}
          {optionNames && (
            <Typography variant="caption" sx={{ color: POS_COLORS.text.muted, display: 'block', fontSize: '0.75rem' }}>
              <Tune sx={{ fontSize: 12, mr: 0.3, verticalAlign: 'middle' }} />
              {optionNames}
            </Typography>
          )}

          {/* Show note */}
          {item.note && (
            <Typography variant="caption" sx={{ color: POS_COLORS.warning, display: 'block', fontSize: '0.75rem', fontStyle: 'italic' }}>
              <Edit sx={{ fontSize: 12, mr: 0.3, verticalAlign: 'middle' }} />
              {item.note}
            </Typography>
          )}

          <Typography variant="caption" sx={{ color: POS_COLORS.primary.main, fontWeight: 600, fontSize: '0.85rem' }}>
            {getItemTotal().toLocaleString()}₫
          </Typography>
        </Box>

        <Stack direction="column" spacing={0.5} alignItems="flex-end">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'white', borderRadius: '10px', p: 0.5, boxShadow: `0 1px 4px ${alpha('#000', 0.06)}` }}>
            <IconButton
              size="small"
              onClick={() => item.quantity > 1 ? onUpdate(item.cartKey, -1) : onRemove(item.cartKey)}
              sx={{ width: 26, height: 26, color: item.quantity === 1 ? POS_COLORS.danger : POS_COLORS.text.secondary }}
            >
              {item.quantity === 1 ? <DeleteOutline sx={{ fontSize: 16 }} /> : <Remove sx={{ fontSize: 16 }} />}
            </IconButton>

            <Typography variant="body2" fontWeight="700" sx={{ minWidth: 24, textAlign: 'center', color: POS_COLORS.text.primary, fontSize: '0.9rem' }}>
              {item.quantity}
            </Typography>

            <IconButton
              size="small"
              onClick={() => onUpdate(item.cartKey, 1)}
              sx={{ width: 26, height: 26, bgcolor: POS_COLORS.primary.main, color: 'white', '&:hover': { bgcolor: POS_COLORS.primary.dark } }}
            >
              <Add sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          {/* Void button */}
          <Tooltip title="Hủy món (cần PIN quản lý)">
            <IconButton
              size="small"
              onClick={() => onVoid(item)}
              sx={{
                width: 26,
                height: 26,
                color: POS_COLORS.danger,
                bgcolor: alpha(POS_COLORS.danger, 0.1),
                '&:hover': { bgcolor: alpha(POS_COLORS.danger, 0.2) },
              }}
            >
              <Cancel sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </motion.div>
  );
};

// ============================================
// 🏷 CATEGORY CAPSULE TAB
// ============================================
const CategoryTab = ({ category, isSelected, onClick }) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <Box
      onClick={onClick}
      sx={{
        height: 36,
        px: 2,
        borderRadius: '18px',
        fontSize: '0.9rem',
        fontWeight: isSelected ? 700 : 500,
        backgroundColor: isSelected ? '#1565C0' : 'white',
        color: isSelected ? '#FFFFFF' : '#64748B',
        border: '1px solid',
        borderColor: isSelected ? '#1565C0' : alpha('#000', 0.08),
        boxShadow: isSelected ? '0 4px 12px rgba(21, 101, 192, 0.4)' : 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        '&:hover': {
          backgroundColor: isSelected ? '#0D47A1' : alpha('#1565C0', 0.08),
        },
      }}
    >
      {category.label}
    </Box>
  </motion.div>
);

// ============================================
// 🔧 ADD ITEM DIALOG - Modifiers & Notes
// ============================================
const AddItemDialog = ({ open, dish, options, onClose, onConfirm }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [note, setNote] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Reset when dish changes
  React.useEffect(() => {
    if (open && dish) {
      setSelectedOptions([]);
      setNote('');
      setQuantity(1);
    }
  }, [open, dish]);

  const handleToggleOption = (optionId) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const calculateTotal = () => {
    let total = Number(dish?.giaBan || 0);
    selectedOptions.forEach(optId => {
      const opt = options.find(o => o.id === optId);
      if (opt) total += Number(opt.giaThem || 0);
    });
    return total * quantity;
  };

  if (!dish) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: POS_COLORS.primary.gradient,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Tune />
          <Typography variant="h6" fontWeight="700">Tùy chọn món ăn</Typography>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Dish Info */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Avatar
            src={dish.hinhAnh || getDishImage(dish)}
            variant="rounded"
            sx={{ width: 80, height: 80, borderRadius: '12px' }}
          />
          <Box>
            <Typography variant="h6" fontWeight="700">{dish.ten}</Typography>
            <Typography variant="body1" color="primary" fontWeight="600">
              {(dish.giaBan || 0).toLocaleString()}₫
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Quantity */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
            Số lượng
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <Remove />
            </IconButton>
            <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>
              {quantity}
            </Typography>
            <IconButton
              onClick={() => setQuantity(q => q + 1)}
              sx={{ bgcolor: POS_COLORS.primary.main, color: 'white', '&:hover': { bgcolor: POS_COLORS.primary.dark } }}
            >
              <Add />
            </IconButton>
          </Stack>
        </Box>

        {/* Modifiers/Options */}
        {options.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
              Tùy chọn (modifiers)
            </Typography>
            <FormGroup>
              {options.map(opt => (
                <FormControlLabel
                  key={opt.id}
                  control={
                    <Checkbox
                      checked={selectedOptions.includes(opt.id)}
                      onChange={() => handleToggleOption(opt.id)}
                      sx={{ color: POS_COLORS.primary.main }}
                    />
                  }
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography>{opt.ten}</Typography>
                      {Number(opt.giaThem) > 0 && (
                        <Chip
                          label={`+${Number(opt.giaThem).toLocaleString()}₫`}
                          size="small"
                          sx={{ bgcolor: alpha(POS_COLORS.success, 0.1), color: POS_COLORS.success, fontWeight: 600 }}
                        />
                      )}
                    </Stack>
                  }
                />
              ))}
            </FormGroup>
          </Box>
        )}

        {/* Note */}
        <Box>
          <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
            <NoteAdd sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
            Ghi chú cho món
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="VD: Ít cay, không hành, chín kỹ..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="700" sx={{ color: POS_COLORS.primary.main }}>
            Tổng: {calculateTotal().toLocaleString()}₫
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={onClose} startIcon={<Close />}>
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={() => onConfirm({ dish, quantity, options: selectedOptions, note })}
              startIcon={<Add />}
              sx={{
                background: POS_COLORS.primary.gradient,
                fontWeight: 600,
              }}
            >
              Thêm vào đơn
            </Button>
          </Stack>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

// ============================================
// 🔐 VOID REQUEST DIALOG - Waiter Request (No PIN)
// ============================================
const VoidRequestDialog = ({ open, item, onClose, onConfirm, isLoading }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (open) {
      setReason('');
      setError('');
    }
  }, [open]);

  const handleConfirm = () => {
    if (!reason || reason.trim().length < 5) {
      setError('Vui lòng nhập lý do hủy món (tối thiểu 5 ký tự)');
      return;
    }
    onConfirm({ reason: reason.trim() });
  };

  if (!item) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '16px' },
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${POS_COLORS.warning} 0%, #F59E0B 100%)`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Warning />
          <Typography variant="h6" fontWeight="700">Yêu cầu hủy món</Typography>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Item to void */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: alpha(POS_COLORS.warning, 0.05),
            borderRadius: '12px',
            border: '1px solid',
            borderColor: alpha(POS_COLORS.warning, 0.2),
          }}
        >
          <Typography variant="subtitle1" fontWeight="600">{item.ten}</Typography>
          <Typography variant="body2" color="text.secondary">
            Số lượng: {item.quantity} | Giá: {((item.giaBan || 0) * item.quantity).toLocaleString()}₫
          </Typography>
          {item.note && (
            <Typography variant="caption" color="text.secondary">
              Ghi chú: {item.note}
            </Typography>
          )}
        </Paper>

        <Alert severity="info" sx={{ mb: 2, borderRadius: '10px' }}>
          Yêu cầu sẽ được gửi đến quản lý để xét duyệt
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
            {error}
          </Alert>
        )}

        {/* Reason */}
        <TextField
          fullWidth
          label="Lý do hủy món *"
          placeholder="VD: Khách đổi ý, hết nguyên liệu, món bị lỗi..."
          value={reason}
          onChange={(e) => { setReason(e.target.value); setError(''); }}
          multiline
          rows={3}
          autoFocus
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
            },
          }}
        />

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          * Quản lý sẽ xem xét và phê duyệt yêu cầu của bạn
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button variant="outlined" onClick={onClose} disabled={isLoading}>
          Hủy bỏ
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={handleConfirm}
          disabled={isLoading}
          startIcon={<Cancel />}
          sx={{ fontWeight: 600 }}
        >
          {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================
// 🎯 MAIN TABLES VIEW COMPONENT
// ============================================
const TablesView = () => {
  // Data Hooks
  const { data: tablesData, isLoading: tablesLoading, isError: tablesError, error: tablesErrorObj, refetch: refetchTables } = useTables();
  const { data: dishesData } = useMenuDishes();
  const { data: categoriesData } = useMenuCategories();
  const { data: optionsData } = useMenuOptions();
  const createOrder = useCreateOrder();
  const voidOrderItem = useVoidOrderItem();
  const createVoidRequestMutation = useCreateVoidRequest();

  // If tables API failed, show a helpful message instead of blank screen
  if (tablesError) {
    return (
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>❌ Không thể tải dữ liệu bàn</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>{tablesErrorObj?.message || 'Lỗi kết nối hoặc server không trả lời'}</Typography>
        <Button variant="contained" onClick={() => refetchTables()}>Thử lại</Button>
      </Box>
    );
  }

  // POS Notifications from Kitchen (SSE)
  const { notifications: kitchenNotifications, connected: sseConnected, removeNotification } = usePosNotifications();

  // State
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Dialog states
  const [addItemDialog, setAddItemDialog] = useState({ open: false, dish: null });
  const [voidDialog, setVoidDialog] = useState({ open: false, item: null });

  // Orders for selected table (sent orders) - exclude paid/closed orders
  const { data: sentOrders = [], isLoading: sentOrdersLoading, refetch: refetchOrders } = useOrders(
    selectedTable ? { tableId: selectedTable.id } : {},
    { enabled: !!selectedTable }
  );

  // Filter out paid/closed orders
  const activeOrders = sentOrders.filter(order =>
    order.trangThai !== 'CLOSED' && order.trangThai !== 'CANCELLED'
  );

  // Auto-refresh orders when KDS updates (includes void approvals)
  useEffect(() => {
    if (selectedTable) {
      refetchOrders();
    }
  }, [sentOrders?.length, selectedTable, refetchOrders]);

  // Flatten sent items for current table (only from active orders)
  const sentItems = (activeOrders || []).flatMap(o => (o.chiTiet || [])
    .filter(i => i.trangThai !== 'DAHUY') // Also exclude voided items
    .map(i => ({
      ...i,
      ten: i.monAn?.ten,
      quantity: i.soLuong,
      giaBan: i.donGia,
      note: i.ghiChu,
      orderId: o.id,
      orderItemId: i.id,
    })));

  // Derived Data
  const tables = tablesData?.items || [];
  const dishes = dishesData || [];
  const categories = categoriesData || [];
  const options = optionsData || [];

  const filteredDishes = useMemo(() => {
    return dishes.filter(dish => {
      const matchCategory = selectedCategory === 'all' || dish.danhMuc?.id === selectedCategory;
      const matchSearch = dish.ten.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [dishes, selectedCategory, searchQuery]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      let itemPrice = Number(item.giaBan || 0);
      // Add option prices
      (item.selectedOptions || []).forEach(optId => {
        const opt = options.find(o => o.id === optId);
        if (opt) itemPrice += Number(opt.giaThem || 0);
      });
      return total + (itemPrice * item.quantity);
    }, 0);
  }, [cart, options]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  // Handlers
  const handleTableSelect = (table) => setSelectedTable(table);

  // Open dialog when clicking menu item
  const handleOpenAddDialog = (dish) => {
    try {
      if (!selectedTable) {
        setSnackbar({ open: true, message: '⚠️ Vui lòng chọn bàn trước khi thêm món!', severity: 'warning' });
        return;
      }
      console.log('Opening add dialog for dish:', dish?.ten);
      setAddItemDialog({ open: true, dish });
    } catch (error) {
      console.error('Error opening add dialog:', error);
      setSnackbar({ open: true, message: '❌ Có lỗi xảy ra!', severity: 'error' });
    }
  };

  // Confirm add from dialog
  const handleConfirmAdd = ({ dish, quantity, options: selectedOpts, note }) => {
    const cartKey = `${dish.id}-${selectedOpts.sort().join('-')}-${note}`;

    setCart(prev => {
      const existing = prev.find(item => item.cartKey === cartKey);
      if (existing) {
        return prev.map(item =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        ...dish,
        cartKey,
        quantity,
        selectedOptions: selectedOpts,
        note,
      }];
    });

    setAddItemDialog({ open: false, dish: null });
    setSnackbar({ open: true, message: `✅ Đã thêm ${quantity}x ${dish.ten}`, severity: 'success' });
  };

  const handleUpdateQuantity = (cartKey, delta) => {
    setCart(prev => prev.map(item =>
      item.cartKey === cartKey
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    ));
  };

  const handleRemoveFromCart = (cartKey) => {
    setCart(prev => prev.filter(item => item.cartKey !== cartKey));
  };

  // Open void dialog
  const handleOpenVoidDialog = (item) => {
    setVoidDialog({ open: true, item });
  };

  // Confirm void request (waiter creates request, no PIN needed)
  const handleConfirmVoid = async ({ reason }) => {
    const item = voidDialog.item;
    if (!item) return;

    // For items already sent to kitchen (have orderItemId) - create void request
    if (item.orderItemId) {
      try {
        await createVoidRequestMutation.mutateAsync({
          orderId: item.orderId,
          orderItemId: item.orderItemId,
          reason,
        });
        setSnackbar({ open: true, message: `✅ Đã gửi yêu cầu hủy món ${item.ten}, chờ quản lý duyệt`, severity: 'success' });
        setVoidDialog({ open: false, item: null });
      } catch (error) {
        setSnackbar({ open: true, message: `❌ ${error.response?.data?.message || error.message || 'Lỗi khi gửi yêu cầu'}`, severity: 'error' });
        return;
      }
    } else {
      // For items not yet sent (still in cart) - just remove from cart
      setCart(prev => prev.filter(i => i.cartKey !== item.cartKey));
      setSnackbar({ open: true, message: `✅ Đã xóa ${item.ten} khỏi đơn tạm`, severity: 'success' });
      setVoidDialog({ open: false, item: null });
    }
  };

  const handleSendOrder = () => {
    if (!selectedTable || cart.length === 0) return;

    const orderData = {
      tableId: selectedTable.id,
      items: cart.map(item => ({
        monAnId: item.id,
        quantity: item.quantity,
        options: item.selectedOptions || [],
        note: item.note || null,
      })),
    };

    createOrder.mutate(orderData, {
      onSuccess: () => {
        setCart([]);
        setSnackbar({ open: true, message: `✅ Đã gửi bếp thành công cho bàn ${selectedTable.ten}!`, severity: 'success' });
      },
      onError: (error) => {
        setSnackbar({ open: true, message: `❌ Lỗi: ${error.message || 'Đã có lỗi xảy ra'}`, severity: 'error' });
      }
    });
  };

  // Category tabs with deduplication
  const uniqueCategories = useMemo(() => {
    const seen = new Set();
    return categories.filter(cat => {
      if (seen.has(cat.id)) return false;
      seen.add(cat.id);
      return true;
    });
  }, [categories]);

  const categoryTabs = [
    { id: 'all', label: 'Tất cả' },
    ...uniqueCategories.map(cat => ({ id: cat.id, label: cat.ten }))
  ];

  return (
    <PosLayout>
      <Box sx={{ height: 'calc(100vh - 64px)', bgcolor: POS_COLORS.background.main, display: 'flex', overflow: 'hidden' }}>

        {/* ========== LEFT PANEL: TABLES ========== */}
        <Box sx={{ width: 340, minWidth: 340, display: 'flex', flexDirection: 'column', bgcolor: 'white', borderRight: '1px solid', borderColor: alpha('#000', 0.06) }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: alpha('#000', 0.06) }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: POS_COLORS.primary.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${alpha(POS_COLORS.primary.main, 0.3)}` }}>
                <TableRestaurant sx={{ color: 'white', fontSize: 22 }} />
              </Box>
              <Typography variant="h6" fontWeight="700" color={POS_COLORS.text.primary} sx={{ fontSize: '1.1rem' }}>Sơ đồ bàn</Typography>
            </Stack>
          </Box>

          <Box sx={{ flex: 1, p: 1.5, overflowY: 'auto' }}>
            {tables.length === 0 ? (
              <Box sx={{ textAlign: 'center', mt: 4, opacity: 0.5 }}>
                <MeetingRoom sx={{ fontSize: 40, mb: 1, color: POS_COLORS.text.muted }} />
                <Typography variant="body2" color="text.secondary">Chưa có bàn nào</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.25, justifyItems: 'center' }}>
                {tables.map(table => (
                  <TableItem key={table.id} table={table} isSelected={selectedTable?.id === table.id} onClick={handleTableSelect} />
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: alpha('#000', 0.06), bgcolor: POS_COLORS.background.subtle }}>
            <Grid container spacing={0.75}>
              {[
                { color: POS_COLORS.status.available, label: 'Trống' },
                { color: POS_COLORS.status.occupied, label: 'Có khách' },
                { color: POS_COLORS.status.reserved, label: 'Đặt trước' },
              ].map((item, idx) => (
                <Grid item xs={4} key={idx}>
                  <Stack direction="row" alignItems="center" spacing={0.75} justifyContent="center">
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{item.label}</Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* ========== MIDDLE PANEL: MENU ========== */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Box sx={{ p: 1.5, pb: 1, bgcolor: 'white', borderBottom: '1px solid', borderColor: alpha('#000', 0.06) }}>
            <TextField
              placeholder="Tìm món ăn..."
              size="small"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: POS_COLORS.text.muted }} /></InputAdornment> }}
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px', bgcolor: POS_COLORS.background.subtle, height: 40,
                  '& fieldset': { border: 'none' },
                  '&:hover': { bgcolor: alpha(POS_COLORS.primary.main, 0.04) },
                  '&.Mui-focused': { bgcolor: 'white', boxShadow: `0 0 0 2px ${alpha(POS_COLORS.primary.main, 0.2)}` },
                },
              }}
            />

            <Box sx={{ display: 'flex', gap: 0.75, overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
              {categoryTabs.map(cat => (
                <CategoryTab key={cat.id} category={cat} isSelected={selectedCategory === cat.id} onClick={() => setSelectedCategory(cat.id)} />
              ))}
            </Box>
          </Box>

          <Box sx={{ flex: 1, p: 1.5, overflowY: 'auto', bgcolor: POS_COLORS.background.main }}>
            <Grid container spacing={1.25}>
              {filteredDishes.map(dish => (
                <Grid item xs={6} sm={4} md={3} lg={2.4} xl={2} key={dish.id}>
                  <MenuCard dish={dish} onAdd={handleOpenAddDialog} />
                </Grid>
              ))}
            </Grid>

            {filteredDishes.length === 0 && (
              <Box sx={{ textAlign: 'center', mt: 8, opacity: 0.5 }}>
                <Restaurant sx={{ fontSize: 56, mb: 2, color: POS_COLORS.text.muted }} />
                <Typography color="text.secondary">Không tìm thấy món ăn</Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* ========== RIGHT PANEL: ORDER ========== */}
        <Box sx={{ width: 340, minWidth: 340, p: 1.5, pl: 0.75, display: 'flex', flexDirection: 'column' }}>
          <Paper
            elevation={0}
            sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '16px', bgcolor: 'white', border: '1px solid', borderColor: alpha('#000', 0.06), boxShadow: `0 4px 24px ${alpha('#000', 0.06)}`, overflow: 'hidden' }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: alpha('#000', 0.06) }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: POS_COLORS.secondary.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${alpha(POS_COLORS.secondary.main, 0.3)}` }}>
                    <ShoppingCart sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="700" color={POS_COLORS.text.primary} sx={{ fontSize: '1rem' }}>Đơn tạm</Typography>
                    {selectedTable ? (
                      <Typography variant="body2" color={POS_COLORS.primary.main} fontWeight="600" sx={{ fontSize: '0.9rem' }}>Bàn: {selectedTable.ten}</Typography>
                    ) : (
                      <Typography variant="body2" color="error.main" fontStyle="italic" sx={{ fontSize: '0.85rem' }}>Vui lòng chọn bàn</Typography>
                    )}
                  </Box>
                </Stack>
                {cartItemCount > 0 && (
                  <Chip label={`${cartItemCount} món`} size="small" sx={{ bgcolor: alpha(POS_COLORS.primary.main, 0.1), color: POS_COLORS.primary.main, fontWeight: 600, fontSize: '0.8rem', height: 26 }} />
                )}
              </Stack>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', p: 1.25 }}>
              {/* Sent items from kitchen (orders already created and sent) */}
              {sentItems.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Đã gửi đến bếp</Typography>
                  <Stack spacing={1}>
                    {sentItems.map(si => (
                      <Paper key={si.orderItemId} sx={{ p: 1, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid', borderColor: alpha('#000', 0.04) }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', minWidth: 0 }}>
                          <Avatar src={si.monAn?.hinhAnh || getDishImage(si)} variant="rounded" sx={{ width: 44, height: 44, borderRadius: '8px' }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={700} noWrap sx={{ color: POS_COLORS.text.primary }}>{si.ten}</Typography>
                            <Typography variant="caption" sx={{ color: POS_COLORS.text.muted }}>{si.quantity} × {Number(si.giaBan || 0).toLocaleString()}₫</Typography>
                          </Box>
                        </Box>

                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip label={si.trangThai || 'CHOCHEBIEN'} size="small" sx={{ fontWeight: 700 }} />
                          <IconButton size="small" onClick={() => handleOpenVoidDialog(si)} sx={{ color: POS_COLORS.danger }}>
                            <Cancel />
                          </IconButton>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}

              {cart.length === 0 ? (
                <Box sx={{ textAlign: 'center', mt: 5, opacity: 0.5 }}>
                  <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: POS_COLORS.background.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
                    <Restaurant sx={{ fontSize: 28, color: POS_COLORS.text.muted }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">Chưa có món nào</Typography>
                  <Typography variant="caption" color="text.disabled">Chọn món từ menu</Typography>
                </Box>
              ) : (
                <AnimatePresence mode="popLayout">
                  {cart.map(item => (
                    <CartItem
                      key={item.cartKey}
                      item={item}
                      options={options}
                      onUpdate={handleUpdateQuantity}
                      onRemove={handleRemoveFromCart}
                      onVoid={handleOpenVoidDialog}
                    />
                  ))}
                </AnimatePresence>
              )}
            </Box>

            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: alpha('#000', 0.06), bgcolor: POS_COLORS.background.subtle }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>Tạm tính</Typography>
                <Typography variant="h5" fontWeight="800" sx={{ color: POS_COLORS.text.primary, letterSpacing: '-0.02em', fontSize: '1.4rem' }}>
                  {cartTotal.toLocaleString()}₫
                </Typography>
              </Box>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  endIcon={<KeyboardArrowRight />}
                  disabled={!selectedTable || cart.length === 0 || createOrder.isPending}
                  onClick={handleSendOrder}
                  sx={{
                    height: 54,
                    borderRadius: '14px',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    textTransform: 'none',
                    background: (!selectedTable || cart.length === 0) ? undefined : POS_COLORS.secondary.gradient,
                    boxShadow: (!selectedTable || cart.length === 0) ? 'none' : `0 8px 24px ${alpha(POS_COLORS.secondary.main, 0.4)}`,
                    '&:hover': { boxShadow: `0 12px 32px ${alpha(POS_COLORS.secondary.main, 0.5)}` },
                    '&.Mui-disabled': { bgcolor: alpha('#000', 0.08), color: alpha('#000', 0.26) },
                  }}
                >
                  {createOrder.isPending ? 'Đang gửi...' : 'Gửi bếp'}
                </Button>
              </motion.div>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* ADD ITEM DIALOG */}
      <AddItemDialog
        open={addItemDialog.open}
        dish={addItemDialog.dish}
        options={options}
        onClose={() => setAddItemDialog({ open: false, dish: null })}
        onConfirm={handleConfirmAdd}
      />

      {/* VOID REQUEST DIALOG */}
      <VoidRequestDialog
        open={voidDialog.open}
        item={voidDialog.item}
        onClose={() => setVoidDialog({ open: false, item: null })}
        onConfirm={handleConfirmVoid}
        isLoading={createVoidRequestMutation.isPending}
      />

      {/* Kitchen Notifications (SSE) */}
      <Box
        sx={{
          position: 'fixed',
          top: 80,
          right: 16,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          maxWidth: 360,
        }}
      >
        <AnimatePresence>
          {kitchenNotifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Paper
                elevation={8}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
                  cursor: 'pointer',
                }}
                onClick={() => removeNotification(notif.id)}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <NotificationsActive sx={{ fontSize: 22 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Bếp thông báo
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {notif.message}
                  </Typography>
                </Box>
                <Close sx={{ fontSize: 18, opacity: 0.7 }} />
              </Paper>
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>

      {/* SSE Connection Indicator */}
      {sseConnected && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            bgcolor: alpha('#10B981', 0.1),
            border: '1px solid',
            borderColor: alpha('#10B981', 0.3),
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#10B981',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.5 },
                '100%': { opacity: 1 },
              },
            }}
          />
          <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600 }}>
            Live
          </Typography>
        </Box>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: '100%', fontSize: '0.9rem', borderRadius: '10px', boxShadow: `0 8px 32px ${alpha('#000', 0.2)}` }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PosLayout>
  );
};

export default TablesView;

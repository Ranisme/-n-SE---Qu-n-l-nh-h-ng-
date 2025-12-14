import React, { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import {
  Paper,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  Autocomplete,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, TrendingUp, TrendingDown, Delete, Edit } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import {
  useMaterials,
  useAdjustments,
  useCreateAdjustment,
} from '../../hooks/useInventory';

const ADJUSTMENT_TYPES = {
  NHAP: { label: 'Nhập kho', color: 'success', icon: <TrendingUp /> },
  XUAT: { label: 'Xuất kho', color: 'warning', icon: <TrendingDown /> },
  HUYHANG: { label: 'Hủy hàng', color: 'error', icon: <Delete /> },
  DIEUCHINH: { label: 'Điều chỉnh', color: 'info', icon: <Edit /> },
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('vi-VN');
};

const Adjustments = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [filterType, setFilterType] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    nguyenVatLieuId: '',
    loai: 'NHAP',
    soLuong: 0,
    ghiChu: '',
  });

  const { data: materials = [] } = useMaterials();
  const { data: adjustments = [], isLoading } = useAdjustments({
    loai: filterType || undefined,
    nguyenVatLieuId: filterMaterial || undefined,
    startDate: filterStartDate || undefined,
    endDate: filterEndDate || undefined,
  });
  const createMutation = useCreateAdjustment();

  const openDialog = (type = 'NHAP') => {
    setForm({ nguyenVatLieuId: '', loai: type, soLuong: 0, ghiChu: '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nguyenVatLieuId) {
      enqueueSnackbar('Vui lòng chọn nguyên vật liệu', { variant: 'warning' });
      return;
    }
    if (form.soLuong <= 0 && form.loai !== 'DIEUCHINH') {
      enqueueSnackbar('Số lượng phải lớn hơn 0', { variant: 'warning' });
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        nguyenVatLieuId: form.nguyenVatLieuId,
        loai: form.loai,
        soLuong: Number(form.soLuong),
        ghiChu: form.ghiChu || null,
      });
      enqueueSnackbar(result.message, { variant: 'success' });
      setDialogOpen(false);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Có lỗi xảy ra', { variant: 'error' });
    }
  };

  const selectedMaterial = materials.find((m) => m.id === form.nguyenVatLieuId);

  const columns = [
    {
      field: 'createdAt',
      headerName: 'Thời gian',
      width: 180,
      valueFormatter: (value) => formatDate(value),
    },
    {
      field: 'loai',
      headerName: 'Loại',
      width: 130,
      renderCell: (params) => {
        const type = ADJUSTMENT_TYPES[params.value];
        return type ? (
          <Chip label={type.label} color={type.color} size="small" />
        ) : (
          params.value
        );
      },
    },
    {
      field: 'nguyenVatLieu',
      headerName: 'Nguyên vật liệu',
      flex: 1,
      valueGetter: (value) => value?.ten || '—',
    },
    {
      field: 'soLuong',
      headerName: 'Số lượng',
      width: 120,
      renderCell: (params) => {
        const type = params.row.loai;
        const isNegative = type === 'XUAT' || type === 'HUYHANG';
        return (
          <Typography color={isNegative ? 'error' : 'success.main'}>
            {isNegative ? '-' : '+'}
            {params.value} {params.row.nguyenVatLieu?.donViTinh || ''}
          </Typography>
        );
      },
    },
    { field: 'ghiChu', headerName: 'Ghi chú', flex: 1, valueGetter: (value) => value || '—' },
  ];

  return (
    <MainLayout title="Điều chỉnh kho">
      <Paper sx={{ p: 2 }}>
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<TrendingUp />}
            onClick={() => openDialog('NHAP')}
          >
            Nhập kho
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<TrendingDown />}
            onClick={() => openDialog('XUAT')}
          >
            Xuất kho
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<Delete />}
            onClick={() => openDialog('HUYHANG')}
          >
            Hủy hàng
          </Button>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => openDialog('DIEUCHINH')}
          >
            Điều chỉnh
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Loại</InputLabel>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="Loại">
              <MenuItem value="">Tất cả</MenuItem>
              {Object.entries(ADJUSTMENT_TYPES).map(([key, val]) => (
                <MenuItem key={key} value={key}>
                  {val.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Nguyên vật liệu</InputLabel>
            <Select
              value={filterMaterial}
              onChange={(e) => setFilterMaterial(e.target.value)}
              label="Nguyên vật liệu"
            >
              <MenuItem value="">Tất cả</MenuItem>
              {materials.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.ten}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            type="date"
            label="Từ ngày"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            type="date"
            label="Đến ngày"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {/* Data Grid */}
        <DataGrid
          rows={adjustments}
          columns={columns}
          loading={isLoading}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Adjustment Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {ADJUSTMENT_TYPES[form.loai]?.label || 'Điều chỉnh tồn kho'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Autocomplete
              options={materials}
              getOptionLabel={(opt) => opt.ten || ''}
              value={materials.find((m) => m.id === form.nguyenVatLieuId) || null}
              onChange={(_, val) => setForm((p) => ({ ...p, nguyenVatLieuId: val?.id || '' }))}
              renderInput={(params) => (
                <TextField {...params} label="Nguyên vật liệu *" />
              )}
              renderOption={(props, opt) => (
                <Box component="li" {...props} key={opt.id}>
                  <Box>
                    <Typography>{opt.ten}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tồn: {opt.soLuongTon} {opt.donViTinh}
                    </Typography>
                  </Box>
                </Box>
              )}
            />

            {selectedMaterial && (
              <Box sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Tồn kho hiện tại:</strong> {selectedMaterial.soLuongTon} {selectedMaterial.donViTinh}
                </Typography>
              </Box>
            )}

            <TextField
              label={form.loai === 'DIEUCHINH' ? 'Số lượng mới *' : 'Số lượng *'}
              type="number"
              value={form.soLuong}
              onChange={(e) => setForm((p) => ({ ...p, soLuong: e.target.value }))}
              fullWidth
              InputProps={{
                endAdornment: selectedMaterial ? (
                  <Typography color="text.secondary">{selectedMaterial.donViTinh}</Typography>
                ) : null,
              }}
              helperText={
                form.loai === 'DIEUCHINH'
                  ? 'Số lượng này sẽ được đặt làm tồn kho mới'
                  : form.loai === 'NHAP'
                  ? 'Số lượng sẽ được cộng vào tồn kho'
                  : 'Số lượng sẽ được trừ khỏi tồn kho'
              }
            />

            <TextField
              label="Ghi chú"
              value={form.ghiChu}
              onChange={(e) => setForm((p) => ({ ...p, ghiChu: e.target.value }))}
              fullWidth
              multiline
              rows={2}
              placeholder={
                form.loai === 'HUYHANG'
                  ? 'Lý do hủy hàng...'
                  : form.loai === 'DIEUCHINH'
                  ? 'Lý do điều chỉnh...'
                  : 'Ghi chú thêm...'
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            color={ADJUSTMENT_TYPES[form.loai]?.color || 'primary'}
            onClick={handleSave}
            disabled={createMutation.isPending}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default Adjustments;

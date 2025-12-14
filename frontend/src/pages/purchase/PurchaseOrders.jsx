import React, { useMemo, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useMaterials } from '../../hooks/useInventory';
import { usePOs, useCreatePO, useUpdatePOStatus, useSuppliers } from '../../hooks/usePurchase';

const PurchaseOrders = () => {
  const { data: pos = [], isLoading, refetch } = usePOs();
  const { data: materials = [] } = useMaterials();
  const { data: suppliers = [] } = useSuppliers();
  const createPO = useCreatePO();
  const updateStatus = useUpdatePOStatus();
  const [supplierId, setSupplierId] = useState('');
  const [lines, setLines] = useState([{ nguyenVatLieuId: '', soLuong: 0, donGia: 0 }]);
  const [feedback, setFeedback] = useState('');

  const pendingPOs = useMemo(() => pos || [], [pos]);

  const addLine = () => setLines((prev) => [...prev, { nguyenVatLieuId: '', soLuong: 0, donGia: 0 }]);
  const updateLine = (idx, patch) => setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  const removeLine = (idx) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const handleCreate = () => {
    setFeedback('');
    const items = lines.filter((l) => l.nguyenVatLieuId && Number(l.soLuong) > 0);
    if (!supplierId || !items.length) {
      setFeedback('Chọn nhà cung cấp và thêm ít nhất một dòng');
      return;
    }
    createPO
      .mutateAsync({ nhaCungCapId: supplierId, items })
      .then(() => {
        setFeedback('Đã tạo PO');
        setLines([{ nguyenVatLieuId: '', soLuong: 0, donGia: 0 }]);
        refetch();
      })
      .catch((err) => setFeedback(err?.response?.data?.message || 'Không thể tạo PO'));
  };

  const handleStatus = (id, status) => {
    setFeedback('');
    updateStatus
      .mutateAsync({ id, status })
      .then(() => refetch())
      .catch((err) => setFeedback(err?.response?.data?.message || 'Cập nhật trạng thái thất bại'));
  };

  return (
    <MainLayout title="Đơn mua hàng">
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Tạo PO mới</Typography>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                select
                label="Nhà cung cấp"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                fullWidth
              >
                {suppliers.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.ten}
                  </MenuItem>
                ))}
              </TextField>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nguyên liệu</TableCell>
                    <TableCell>Số lượng</TableCell>
                    <TableCell>Đơn giá</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lines.map((l, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <TextField
                          select
                          fullWidth
                          value={l.nguyenVatLieuId}
                          onChange={(e) => updateLine(idx, { nguyenVatLieuId: e.target.value })}
                        >
                          {materials.map((m) => (
                            <MenuItem key={m.id} value={m.id}>
                              {m.ten}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={l.soLuong}
                          onChange={(e) => updateLine(idx, { soLuong: Number(e.target.value) || 0 })}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={l.donGia}
                          onChange={(e) => updateLine(idx, { donGia: Number(e.target.value) || 0 })}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => removeLine(idx)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button variant="outlined" onClick={addLine} startIcon={<Add />}>
                Thêm dòng
              </Button>
              <Button variant="contained" onClick={handleCreate} disabled={createPO.isLoading}>
                Lưu PO
              </Button>
              {feedback && <Alert severity="info">{feedback}</Alert>}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Danh sách PO</Typography>
            {isLoading && <Typography>Đang tải...</Typography>}
            <List>
              {pendingPOs.map((po) => (
                <ListItem key={po.id} divider>
                  <ListItemText
                    primary={`PO ${po.id} - ${po.nhaCungCap?.ten || ''}`}
                    secondary={`Trạng thái: ${po.trangThai}`}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button size="small" onClick={() => handleStatus(po.id, 'DAGUI')}>
                      Gửi
                    </Button>
                    <Button size="small" onClick={() => handleStatus(po.id, 'DAHUY')} color="error">
                      Hủy
                    </Button>
                  </Stack>
                </ListItem>
              ))}
              {!pendingPOs.length && <Typography color="text.secondary">Chưa có PO.</Typography>}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default PurchaseOrders;

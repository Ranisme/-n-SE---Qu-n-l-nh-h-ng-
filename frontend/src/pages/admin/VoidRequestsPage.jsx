import React, { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import {
    Box,
    Paper,
    Typography,
    Stack,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Card,
    CardContent,
    Grid,
    Divider,
    IconButton,
    Tooltip,
    alpha,
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    HourglassEmpty,
    Restaurant,
    Person,
    AccessTime,
    TableBar,
    Close,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoidRequests, useApproveVoidRequest, useRejectVoidRequest } from '../../hooks/useOrders';
import { useSnackbar } from 'notistack';

const COLORS = {
    primary: '#6366F1',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    pending: '#F59E0B',
    approved: '#10B981',
    rejected: '#EF4444',
};

const formatTime = (date) => {
    if (!date) return '--:--';
    return new Date(date).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
    });
};

// Status badge component
const StatusBadge = ({ status }) => {
    const config = {
        CHO_DUYET: { label: 'Chờ duyệt', color: COLORS.pending, icon: <HourglassEmpty fontSize="small" /> },
        DA_DUYET: { label: 'Đã duyệt', color: COLORS.approved, icon: <CheckCircle fontSize="small" /> },
        TU_CHOI: { label: 'Từ chối', color: COLORS.rejected, icon: <Cancel fontSize="small" /> },
    };

    const { label, color, icon } = config[status] || config.CHO_DUYET;

    return (
        <Chip
            icon={icon}
            label={label}
            size="small"
            sx={{
                bgcolor: alpha(color, 0.1),
                color: color,
                fontWeight: 600,
                border: `1px solid ${alpha(color, 0.3)}`,
            }}
        />
    );
};

// Void request card component
const VoidRequestCard = ({ request, onApprove, onReject }) => {
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const handleApprove = () => {
        onApprove(request.id);
    };

    const handleReject = () => {
        onReject(request.id, rejectReason);
        setRejectDialogOpen(false);
        setRejectReason('');
    };

    const isPending = request.trangThai === 'CHO_DUYET';

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
            >
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        border: `1px solid ${alpha(isPending ? COLORS.pending : '#E5E7EB', 0.3)}`,
                        bgcolor: isPending ? alpha(COLORS.pending, 0.02) : 'background.paper',
                        transition: 'all 0.2s',
                        '&:hover': {
                            boxShadow: `0 4px 20px ${alpha(COLORS.primary, 0.1)}`,
                            transform: 'translateY(-2px)',
                        },
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Stack spacing={2}>
                            {/* Header */}
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Stack spacing={1}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Restaurant sx={{ color: COLORS.primary, fontSize: 20 }} />
                                        <Typography variant="h6" fontWeight={700}>
                                            {request.orderItem?.monAn?.ten || 'Món ăn'}
                                        </Typography>
                                    </Stack>
                                    <StatusBadge status={request.trangThai} />
                                </Stack>
                                <Stack direction="row" spacing={1}>
                                    {isPending && (
                                        <>
                                            <Tooltip title="Duyệt yêu cầu">
                                                <IconButton
                                                    size="small"
                                                    onClick={handleApprove}
                                                    sx={{
                                                        bgcolor: alpha(COLORS.success, 0.1),
                                                        color: COLORS.success,
                                                        '&:hover': { bgcolor: alpha(COLORS.success, 0.2) },
                                                    }}
                                                >
                                                    <CheckCircle />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Từ chối yêu cầu">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setRejectDialogOpen(true)}
                                                    sx={{
                                                        bgcolor: alpha(COLORS.error, 0.1),
                                                        color: COLORS.error,
                                                        '&:hover': { bgcolor: alpha(COLORS.error, 0.2) },
                                                    }}
                                                >
                                                    <Cancel />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    )}
                                </Stack>
                            </Stack>

                            <Divider />

                            {/* Details */}
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <TableBar sx={{ color: 'text.secondary', fontSize: 18 }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Bàn
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {request.donHang?.ban?.ten || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Person sx={{ color: 'text.secondary', fontSize: 18 }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Người yêu cầu
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {request.nguoiYeuCau?.hoTen || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <AccessTime sx={{ color: 'text.secondary', fontSize: 18 }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Thời gian
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {formatTime(request.createdAt)}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                                {request.nguoiDuyet && (
                                    <Grid item xs={12} sm={6}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Person sx={{ color: 'text.secondary', fontSize: 18 }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Người duyệt
                                                </Typography>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {request.nguoiDuyet?.hoTen || 'N/A'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                )}
                            </Grid>

                            {/* Reason */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    bgcolor: alpha(COLORS.primary, 0.05),
                                    borderRadius: 2,
                                    border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
                                }}
                            >
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                    Lý do hủy:
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {request.lyDo || 'Không có lý do'}
                                </Typography>
                            </Paper>
                        </Stack>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Reject Dialog */}
            <Dialog
                open={rejectDialogOpen}
                onClose={() => setRejectDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={700}>
                            Từ chối yêu cầu hủy món
                        </Typography>
                        <IconButton size="small" onClick={() => setRejectDialogOpen(false)}>
                            <Close />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Alert severity="warning">
                            Bạn có chắc muốn từ chối yêu cầu hủy món <strong>{request.orderItem?.monAn?.ten}</strong>?
                        </Alert>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Lý do từ chối (tùy chọn)"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Ví dụ: Món đã bắt đầu chế biến, không thể hủy"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setRejectDialogOpen(false)}>Hủy</Button>
                    <Button variant="contained" color="error" onClick={handleReject}>
                        Xác nhận từ chối
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

// Main component
const VoidRequestsPage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [filter, setFilter] = useState('CHO_DUYET');

    const { data: requests = [], isLoading, refetch } = useVoidRequests({ trangThai: filter });
    const approveMutation = useApproveVoidRequest();
    const rejectMutation = useRejectVoidRequest();

    const handleApprove = async (requestId) => {
        try {
            await approveMutation.mutateAsync(requestId);
            enqueueSnackbar('✅ Đã duyệt yêu cầu hủy món', { variant: 'success' });
            refetch();
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.message || '❌ Không thể duyệt yêu cầu', { variant: 'error' });
        }
    };

    const handleReject = async (requestId, lyDoTuChoi) => {
        try {
            await rejectMutation.mutateAsync({ requestId, lyDoTuChoi });
            enqueueSnackbar('✅ Đã từ chối yêu cầu hủy món', { variant: 'success' });
            refetch();
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.message || '❌ Không thể từ chối yêu cầu', { variant: 'error' });
        }
    };

    const pendingCount = requests.filter((r) => r.trangThai === 'CHO_DUYET').length;

    return (
        <MainLayout title="Yêu cầu hủy món">
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} color="text.primary">
                            🍽️ Yêu cầu hủy món
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Duyệt hoặc từ chối yêu cầu hủy món từ phục vụ
                        </Typography>
                    </Box>
                    {pendingCount > 0 && (
                        <Chip
                            label={`${pendingCount} chờ duyệt`}
                            color="warning"
                            sx={{ fontWeight: 700, fontSize: '1rem', px: 2, py: 3 }}
                        />
                    )}
                </Stack>

                {/* Filter tabs */}
                <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                    {[
                        { value: 'CHO_DUYET', label: 'Chờ duyệt', color: COLORS.pending },
                        { value: 'DA_DUYET', label: 'Đã duyệt', color: COLORS.approved },
                        { value: 'TU_CHOI', label: 'Từ chối', color: COLORS.rejected },
                    ].map((tab) => (
                        <Button
                            key={tab.value}
                            variant={filter === tab.value ? 'contained' : 'outlined'}
                            onClick={() => setFilter(tab.value)}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                ...(filter === tab.value && {
                                    bgcolor: tab.color,
                                    '&:hover': { bgcolor: alpha(tab.color, 0.8) },
                                }),
                            }}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </Stack>

                {/* Content */}
                {isLoading ? (
                    <Typography>Đang tải...</Typography>
                ) : requests.length === 0 ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 6,
                            textAlign: 'center',
                            borderRadius: 4,
                            border: '1px dashed #E5E7EB',
                            bgcolor: alpha(COLORS.primary, 0.02),
                        }}
                    >
                        <HourglassEmpty sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" fontWeight={600} color="text.secondary">
                            Không có yêu cầu hủy món nào
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {filter === 'CHO_DUYET'
                                ? 'Chưa có yêu cầu nào đang chờ duyệt'
                                : filter === 'DA_DUYET'
                                    ? 'Chưa có yêu cầu nào được duyệt'
                                    : 'Chưa có yêu cầu nào bị từ chối'}
                        </Typography>
                    </Paper>
                ) : (
                    <Stack spacing={2}>
                        <AnimatePresence>
                            {requests.map((request) => (
                                <VoidRequestCard
                                    key={request.id}
                                    request={request}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                />
                            ))}
                        </AnimatePresence>
                    </Stack>
                )}
            </Box>
        </MainLayout>
    );
};

export default VoidRequestsPage;

const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const { requirePermissions } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { PERMISSIONS } = require('../utils/permissions');
const {
  createOrder,
  updateOrder,
  listOrders,
  sendToKitchen,
  createVoidRequest,
  listVoidRequests,
  approveVoidRequest,
  rejectVoidRequest,
  streamNotifications,
} = require('../controllers/orders.controller');
const {
  createOrderSchema,
  updateOrderSchema,
  sendOrderSchema,
  createVoidRequestSchema,
  voidRequestActionSchema,
} = require('../validation/orders.validation');

router.use(authMiddleware);

// List orders: ORDER_VIEW
router.get('/', requirePermissions([PERMISSIONS.ORDER_VIEW]), listOrders);

// Create/Update orders: ORDER_CREATE, ORDER_UPDATE
router.post('/', validate(createOrderSchema), requirePermissions([PERMISSIONS.ORDER_CREATE]), createOrder);
router.patch('/:id', validate(updateOrderSchema), requirePermissions([PERMISSIONS.ORDER_UPDATE]), updateOrder);
router.post('/:id/send', validate(sendOrderSchema), requirePermissions([PERMISSIONS.ORDER_CREATE, PERMISSIONS.ORDER_UPDATE]), sendToKitchen);

// Void request workflow
// Waiter creates void request: ORDER_VOID permission
router.post('/:id/void-request', validate(createVoidRequestSchema), requirePermissions([PERMISSIONS.ORDER_VOID]), createVoidRequest);

// Manager lists void requests: ORDER_VOID_APPROVE permission
router.get('/void-requests', requirePermissions([PERMISSIONS.ORDER_VOID_APPROVE]), listVoidRequests);

// Manager approves/rejects void request: ORDER_VOID_APPROVE permission
router.post('/void-requests/:requestId/approve', requirePermissions([PERMISSIONS.ORDER_VOID_APPROVE]), approveVoidRequest);
router.post('/void-requests/:requestId/reject', validate(voidRequestActionSchema), requirePermissions([PERMISSIONS.ORDER_VOID_APPROVE]), rejectVoidRequest);

// Notifications stream: ORDER_VIEW
router.get('/notifications/stream', requirePermissions([PERMISSIONS.ORDER_VIEW]), streamNotifications);

module.exports = router;


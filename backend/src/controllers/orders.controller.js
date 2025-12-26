const ordersService = require('../services/orders.service');
const { registerPosClient, removePosClient } = require('../utils/posStream');

const listOrders = async (req, res, next) => {
  try {
    const data = await ordersService.list(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const data = await ordersService.create(req.user, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const data = await ordersService.update(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const sendToKitchen = async (req, res, next) => {
  try {
    const data = await ordersService.sendToKitchen(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createVoidRequest = async (req, res, next) => {
  try {
    const data = await ordersService.createVoidRequest(req.params.id, req.body, req.user);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const listVoidRequests = async (req, res, next) => {
  try {
    const data = await ordersService.listVoidRequests(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const approveVoidRequest = async (req, res, next) => {
  try {
    const data = await ordersService.approveVoidRequest(req.params.requestId, req.user);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const rejectVoidRequest = async (req, res, next) => {
  try {
    const data = await ordersService.rejectVoidRequest(req.params.requestId, req.body, req.user);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const streamNotifications = async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');
  const id = registerPosClient(res);
  req.on('close', () => removePosClient(id));
};

module.exports = {
  listOrders,
  createOrder,
  updateOrder,
  sendToKitchen,
  createVoidRequest,
  listVoidRequests,
  approveVoidRequest,
  rejectVoidRequest,
  streamNotifications
};


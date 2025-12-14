import api from './client';

export const listOrders = async (params = {}) => {
  const { data } = await api.get('/orders', { params });
  return data.items || [];
};

export const createOrder = async (payload) => {
  const { data } = await api.post('/orders', payload);
  return data;
};

export const sendOrder = async (orderId) => {
  const { data } = await api.post(`/orders/${orderId}/send`);
  return data;
};

export const voidOrderItem = async (orderId, payload) => {
  const { data } = await api.post(`/orders/${orderId}/void-item`, payload);
  return data;
};

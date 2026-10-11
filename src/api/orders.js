import { api } from './client';
export function createOrder(payload) {
    return api.post('/api/orders', payload);
}
export function getMyOrders() {
    return api.get('/api/orders/mine');
}
export function getOrder(id) {
    return api.get(`/api/orders/${id}`);
}
export function updateOrderStatus(id, status) {
    return api.patch(`/api/orders/${id}/status`, { status });
}

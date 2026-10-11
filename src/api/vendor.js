import { api } from './client';
export function getVendorInventory() {
    return api.get('/api/vendor/inventory');
}
export function createProduct(payload) {
    return api.post('/api/products', payload);
}
export function scanFreshness(payload) {
    return api.post('/api/products/freshness-scan', payload);
}
export function updateProduct(id, payload) {
    return api.patch(`/api/products/${id}`, payload);
}
export function deleteProduct(id) {
    return api.delete(`/api/products/${id}`);
}

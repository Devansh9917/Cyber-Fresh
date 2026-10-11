import { api } from './client';
export function getAdminStats() {
    return api.get('/api/admin/stats');
}
export function getAllCustomers() {
    return api.get('/api/admin/users');
}
export function getAllVendors() {
    return api.get('/api/admin/vendors');
}
export function setUserStatus(id, status) {
    return api.patch(`/api/admin/users/${id}/status`, { status });
}
export function setVendorVerified(id, verified) {
    return api.patch(`/api/admin/vendors/${id}/verify`, { verified });
}

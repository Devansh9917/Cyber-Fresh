import { api, setAuthToken } from './client';
export async function login(email, password, role) {
    const data = await api.post('/api/auth/login', { email, password, role });
    setAuthToken(data.token);
    return data.user;
}
export async function adminLogin(email, password) {
    const data = await api.post('/api/auth/admin-login', { identifier: email, password });
    setAuthToken(data.token);
    return data.user;
}
export async function register(payload) {
    const data = await api.post('/api/auth/register', payload);
    setAuthToken(data.token);
    return data.user;
}
export async function googleAuth(credential, role) {
    const data = await api.post('/api/auth/google', { credential, role });
    setAuthToken(data.token);
    return data.user;
}
export function forgotPassword(email) {
    return api.post('/api/auth/forgot-password', { email });
}
export function resetPasswordWithOtp(email, otp, password) {
    return api.post('/api/auth/reset-password-otp', { email, otp, password });
}
export function resetPassword(token, password) {
    return api.post(`/api/auth/reset-password/${encodeURIComponent(token)}`, { password });
}
export function logout() {
    setAuthToken(null);
}

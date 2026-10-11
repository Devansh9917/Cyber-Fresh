const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
let authToken = sessionStorage.getItem('cf_token');
export function setAuthToken(token) {
    authToken = token;
    if (token)
        sessionStorage.setItem('cf_token', token);
    else
        sessionStorage.removeItem('cf_token');
}
export function getAuthToken() {
    return authToken;
}
async function request(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            ...(options.headers || {}),
        },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
        throw new Error(data.message || `Request failed: ${res.status}`);
    return data;
}
export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
    patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (path) => request(path, { method: 'DELETE' }),
};

import { api } from './client';
export function getProducts(params) {
    const qs = new URLSearchParams();
    if (params?.category)
        qs.set('category', params.category);
    if (params?.search)
        qs.set('search', params.search);
    if (params?.organic)
        qs.set('organic', 'true');
    const query = qs.toString();
    return api.get(`/api/products${query ? `?${query}` : ''}`);
}
export function getProduct(id) {
    return api.get(`/api/products/${id}`);
}

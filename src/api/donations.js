import { api } from './client';
// vendor: list of things I've offered
export function getMyDonations() {
    return api.get('/api/donations/mine');
}
// vendor: create a new donation offer
export function createDonation(payload) {
    return api.post('/api/donations', payload);
}
// ngo: donations still awaiting pickup
export function getAvailableDonations() {
    return api.get('/api/donations/available');
}
// ngo: accept a pending donation
export function acceptDonation(id) {
    return api.patch(`/api/donations/${id}/accept`, {});
}
// ngo: donations this NGO has accepted/received
export function getDonationHistory() {
    return api.get('/api/donations/history');
}

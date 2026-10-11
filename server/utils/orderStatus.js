const ORDER_STATUS_MAP = {
  'ORDER PLACED': 'PENDING',
  'PENDING': 'PENDING',
  'CONFIRMED': 'PENDING',
  'PACKED': 'ASSIGNED',
  'ASSIGNED': 'ASSIGNED',
  'ACCEPTED': 'ACCEPTED',
  'PICKED UP': 'PICKED_UP',
  'PICKED_UP': 'PICKED_UP',
  'OUT FOR DELIVERY': 'OUT_FOR_DELIVERY',
  'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
  'DELIVERED': 'DELIVERED',
  'CANCELLED': 'CANCELLED',
  'REJECTED': 'REJECTED',
}

const DISPLAY_STATUS_MAP = {
  PENDING: 'Pending',
  ASSIGNED: 'Packed',
  ACCEPTED: 'Accepted',
  PICKED_UP: 'Picked Up',
  OUT_FOR_DELIVERY: 'Out For Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
}

const PARTNER_STATUS_MAP = {
  PENDING: 'Pending',
  ASSIGNED: 'Assigned',
  ACCEPTED: 'Accepted',
  PICKED_UP: 'Picked Up',
  OUT_FOR_DELIVERY: 'Out For Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
}

export function normalizeOrderStatus(status) {
  if (typeof status !== 'string') return status
  const trimmed = status.trim()
  if (!trimmed) return status
  const normalized = ORDER_STATUS_MAP[trimmed.toUpperCase()] || ORDER_STATUS_MAP[trimmed]
  if (normalized) return normalized
  const upper = trimmed.toUpperCase()
  if (Object.hasOwn(DISPLAY_STATUS_MAP, upper)) return upper
  return upper
}

export function displayOrderStatus(status) {
  const normalized = normalizeOrderStatus(status)
  return DISPLAY_STATUS_MAP[normalized] || String(status ?? '')
}

export function displayPartnerStatus(status) {
  const normalized = normalizeOrderStatus(status)
  return PARTNER_STATUS_MAP[normalized] || String(status ?? '')
}

export function normalizeDeliveryAction(action) {
  if (typeof action !== 'string') return action
  const normalized = action.trim().toLowerCase()
  if (normalized === 'start' || normalized === 'pickup') return 'picked_up'
  return normalized
}

export function serializeOrderForClient(order) {
  if (!order) return order
  const value = typeof order.toObject === 'function' ? order.toObject() : { ...order }
  delete value.deliveryVerificationCode
  value.status = displayOrderStatus(value.status)
  if (value.deliveryPartner) {
    const partner = { ...value.deliveryPartner }
    if (partner.status) partner.status = displayPartnerStatus(partner.status)
    value.deliveryPartner = partner
  }
  return value
}

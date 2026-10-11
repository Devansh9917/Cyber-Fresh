export function isSmsConfigured() {
  return false
}

export async function sendSMS() {
  return {
    sent: false,
    configured: false,
    message: 'Automatic SMS is disabled. Use in-app notifications or email.',
  }
}

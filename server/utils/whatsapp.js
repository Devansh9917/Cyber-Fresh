export function isWhatsAppConfigured() {
  return false
}

export async function sendWhatsApp() {
  return {
    sent: false,
    configured: false,
    message: 'Automatic WhatsApp messages are disabled. Use the app WhatsApp links to message manually.',
  }
}

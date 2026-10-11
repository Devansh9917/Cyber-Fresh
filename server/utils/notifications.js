import Notification from '../models/Notification.js'

export async function createNotification({ userId, type, title, message, link = '' }) {
  try {
    if (!userId || !title || !message) return null
    return await Notification.create({
      user: userId,
      type: type || 'system',
      title,
      message,
      link,
      read: false,
    })
  } catch (err) {
    console.error('[Notification] Error creating notification:', err.message)
    return null
  }
}

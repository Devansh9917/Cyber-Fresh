import Reminder from '../models/Reminder.js'
import User from '../models/User.js'
import { createNotification } from './notifications.js'
import { isEmailConfigured, sendEmail } from './email.js'

export async function notifyWaitingCustomers(product) {
  const reminders = await Reminder.find({ product: product._id, status: 'Waiting' }).select('_id user')

  for (const reminder of reminders) {
    const claimed = await Reminder.findOneAndUpdate(
      { _id: reminder._id, status: 'Waiting' },
      { $set: { status: 'Back In Stock' } },
      { new: true }
    )
    if (!claimed) continue

    const user = await User.findById(claimed.user)
    if (!user) continue

    const notification = await createNotification({
      userId: user._id,
      type: 'stock',
      title: 'Product back in stock',
      message: `${product.name} is available again.`,
      link: 'browse',
    })

    if (!notification) continue

    const deliveryResults = []
    if (isEmailConfigured() && user.email) {
      deliveryResults.push(sendEmail({
        to: user.email,
        subject: `${product.name} is back in stock`,
        text: `${product.name} is available again on CyberFresh.`,
      }))
    }
    await Promise.allSettled(deliveryResults)
    await Reminder.updateOne(
      { _id: claimed._id, status: 'Back In Stock' },
      { $set: { status: 'Notification Sent' } }
    )
  }
}

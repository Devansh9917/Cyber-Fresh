import nodemailer from 'nodemailer'

function hasSmtpConfig() {
  return Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)
}

function getBrevoSender() {
  const configuredFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER
  if (!configuredFrom) return null

  const match = configuredFrom.match(/^\s*(.*?)\s*<([^<>]+)>\s*$/)
  const email = (match ? match[2] : configuredFrom).trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null

  const name = match?.[1].trim().replace(/^["']|["']$/g, '') || 'Cyber Fresh'
  return { name, email }
}

export function isEmailConfigured() {
  return Boolean(process.env.BREVO_API_KEY || hasSmtpConfig())
}

export function getEmailTransporter() {
  if (!hasSmtpConfig()) return null

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })
}

export async function sendEmail({ to, subject, html, text }) {
  if (!isEmailConfigured()) {
    console.warn('[Email Service] Cannot send email: configure BREVO_API_KEY or EMAIL_HOST/USER/PASSWORD.')
    return {
      sent: false,
      configured: false,
      message: 'Email service is not configured on the server.',
    }
  }

  if (process.env.BREVO_API_KEY) {
    const sender = getBrevoSender()
    if (!sender) {
      return {
        sent: false,
        configured: true,
        error: 'EMAIL_FROM must contain a valid verified sender email address.',
        message: 'Set EMAIL_FROM to a valid sender address verified in Brevo.',
      }
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender,
          to: [{ email: to }],
          subject,
          ...(text || html ? { textContent: text || html.replace(/<[^>]*>?/gm, '') } : {}),
          ...(html ? { htmlContent: html } : {}),
        }),
        signal: AbortSignal.timeout(15000),
      })

      const responseBody = await response.text()
      let result = {}
      if (responseBody) {
        try {
          result = JSON.parse(responseBody)
        } catch {
          result = { message: responseBody }
        }
      }

      if (!response.ok) {
        const errorMessage = result.message || result.code || `Brevo API returned HTTP ${response.status}.`
        console.error('[Email Service] Brevo API error:', errorMessage)
        return {
          sent: false,
          configured: true,
          error: errorMessage,
          message: `Failed to send email: ${errorMessage}`,
        }
      }

      return {
        sent: true,
        configured: true,
        messageId: result.messageId,
        message: 'Email sent successfully.',
      }
    } catch (err) {
      console.error('[Email Service] Brevo API request failed:', err.message)
      return {
        sent: false,
        configured: true,
        error: err.message,
        message: `Failed to send email: ${err.message}`,
      }
    }
  }

  try {
    const transporter = getEmailTransporter()
    const from = process.env.EMAIL_FROM || `Cyber Fresh <${process.env.EMAIL_USER}>`
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || html?.replace(/<[^>]*>?/gm, ''),
      html,
    })

    return {
      sent: true,
      configured: true,
      messageId: info.messageId,
      message: 'Email sent successfully.',
    }
  } catch (err) {
    console.error('[Email Service] Error sending email:', err.message)
    return {
      sent: false,
      configured: true,
      error: err.message,
      message: `Failed to send email: ${err.message}`,
    }
  }
}

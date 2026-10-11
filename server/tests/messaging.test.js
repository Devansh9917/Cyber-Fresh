import test from 'node:test'
import assert from 'node:assert/strict'

import { isSmsConfigured, sendSMS } from '../utils/sms.js'
import { isWhatsAppConfigured, sendWhatsApp } from '../utils/whatsapp.js'
import { isPhoneMessagingConfigured, sendUserMessage } from '../utils/messageDispatch.js'

test('automatic SMS and WhatsApp remain disabled even when provider credentials exist', () => {
  const previousValues = {
    twilioSid: process.env.TWILIO_ACCOUNT_SID,
    twilioToken: process.env.TWILIO_AUTH_TOKEN,
    brevoKey: process.env.BREVO_API_KEY,
  }
  process.env.TWILIO_ACCOUNT_SID = 'AC-test'
  process.env.TWILIO_AUTH_TOKEN = 'test-token'
  process.env.BREVO_API_KEY = 'test-key'

  try {
    assert.equal(isSmsConfigured(), false)
    assert.equal(isWhatsAppConfigured(), false)
    assert.equal(isPhoneMessagingConfigured(), false)
  } finally {
    if (previousValues.twilioSid === undefined) delete process.env.TWILIO_ACCOUNT_SID
    else process.env.TWILIO_ACCOUNT_SID = previousValues.twilioSid
    if (previousValues.twilioToken === undefined) delete process.env.TWILIO_AUTH_TOKEN
    else process.env.TWILIO_AUTH_TOKEN = previousValues.twilioToken
    if (previousValues.brevoKey === undefined) delete process.env.BREVO_API_KEY
    else process.env.BREVO_API_KEY = previousValues.brevoKey
  }
})

test('legacy send functions report disabled delivery without making network requests', async () => {
  const originalFetch = global.fetch
  let fetchCalled = false
  global.fetch = async () => {
    fetchCalled = true
    throw new Error('Network sending must stay disabled in this test.')
  }

  try {
    const [sms, whatsapp] = await Promise.all([
      sendSMS({ to: '+14155550123', message: 'Do not send' }),
      sendWhatsApp({ to: '+14155550123', message: 'Do not send' }),
    ])

    assert.equal(sms.sent, false)
    assert.equal(sms.configured, false)
    assert.match(sms.message, /disabled/i)
    assert.equal(whatsapp.sent, false)
    assert.equal(whatsapp.configured, false)
    assert.match(whatsapp.message, /disabled/i)
    assert.equal(fetchCalled, false)
  } finally {
    global.fetch = originalFetch
  }
})

test('legacy message dispatch no longer sends automated phone messages', async () => {
  const result = await sendUserMessage(
    { phone: '+14155550123', communicationSettings: { smsNotifications: true, whatsappUpdates: true } },
    'Do not send',
  )

  assert.deepEqual(result, [])
})

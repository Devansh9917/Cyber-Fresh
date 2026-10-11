import assert from "node:assert/strict"
import test from "node:test"
import { translate } from "./useLanguage.js"

test("tracking translation keys resolve in English, Hindi, and Tamil", () => {
  assert.equal(translate("en", "orderNumber"), "Order")
  assert.equal(translate("hi", "liveLocationUnavailable"), "लाइव लोकेशन अभी उपलब्ध नहीं है।")
  assert.equal(translate("ta", "lastUpdate"), "கடைசி புதுப்பிப்பு")
  assert.equal(translate("hi", "noPartner"), "डिलीवरी पार्टनर अभी असाइन नहीं किया गया है।")
  assert.equal(translate("ta", "loadingOrder"), "ஆர்டர் நிலை ஏற்றப்படுகிறது...")
})

test("customer dashboard and browse actions are translated", () => {
  assert.equal(translate("hi", "Your CyberFresh account"), "आपका CyberFresh खाता")
  assert.equal(translate("ta", "Use address"), "முகவரியைப் பயன்படுத்தவும்")
  assert.equal(translate("ta", "⚠ Low"), "⚠ குறைவு")
})

test("order confirmation notifications preserve dynamic order and amount", () => {
  assert.equal(
    translate("ta", "Your order CF-X for ₹160 has been placed and is now pending dispatch."),
    "உங்கள் ஆர்டர் CF-X (₹160) பதிவு செய்யப்பட்டது; அனுப்புவதற்காகக் காத்திருக்கிறது.",
  )
})

test("NGO donation status, impact, and handoff labels are translated", () => {
  assert.equal(translate("hi", "Accepted"), "स्वीकार किया गया")
  assert.equal(translate("ta", "Meals distributed"), "விநியோகிக்கப்பட்ட உணவுகள்")
  assert.equal(
    translate("hi", "NGO handoff code for the delivery partner:"),
    "डिलीवरी पार्टनर के लिए NGO हैंडऑफ कोड:",
  )
})

test("cyan accent label is available in English, Hindi, and Tamil", () => {
  assert.equal(translate("en", "cyan"), "Cyan")
  assert.equal(translate("hi", "cyan"), "सियान")
  assert.equal(translate("ta", "cyan"), "சியான்")
  assert.equal(translate("hi", "Delivery Partners"), "डिलीवरी पार्टनर")
  assert.equal(translate("ta", "Delivery payouts"), "டெலிவரி கொடுப்பனவுகள்")
})

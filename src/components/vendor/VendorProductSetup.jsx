import { useEffect, useState } from 'react'
import { api } from '../../api/client'

const requiredAddressFields = ['businessName', 'phone', 'address', 'city', 'state', 'pincode']
const labels = {
  businessName: 'Business name',
  phone: 'Contact phone',
  address: 'Pickup street address',
  city: 'Pickup city',
  state: 'Pickup state',
  pincode: 'Pickup PIN code',
  upiId: 'UPI ID',
}

export default function VendorProductSetup({ onComplete }) {
  const [details, setDetails] = useState({
    businessName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    upiId: '',
  })
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [qrFile, setQrFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/api/auth/me')
      .then(({ user }) => {
        if (!active) return
        const initialDetails = {
          businessName: user.businessName || '',
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          pincode: user.pincode || '',
          upiId: user.paymentDetails?.upiId || '',
        }
        const initialQrCodeUrl = user.paymentDetails?.qrCodeUrl || ''
        setDetails(initialDetails)
        setQrCodeUrl(initialQrCodeUrl)
        const addressComplete = requiredAddressFields.every((field) => initialDetails[field].trim())
        const paymentComplete = /^[\w.-]{2,256}@[A-Za-z0-9.-]{2,64}$/.test(initialDetails.upiId) && initialQrCodeUrl
        if (addressComplete && paymentComplete) onComplete()
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load vendor details.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [onComplete])

  const handleQrFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError('Choose a JPG, PNG, or WEBP QR image no larger than 5 MB.')
      return
    }
    setError('')
    setQrFile(file)
    setQrCodeUrl(URL.createObjectURL(file))
  }

  const saveDetails = async (event) => {
    event.preventDefault()
    setError('')
    const upiId = details.upiId.trim()
    if (!requiredAddressFields.every((field) => details[field].trim())) {
      setError('Complete your business name, contact phone, pickup address, city, state, and PIN code.')
      return
    }
    if (!/^[\w.-]{2,256}@[A-Za-z0-9.-]{2,64}$/.test(upiId)) {
      setError('Enter a valid UPI ID, such as name@bank.')
      return
    }
    if (!qrCodeUrl) {
      setError('Upload your UPI payment QR code before adding products.')
      return
    }

    setSaving(true)
    try {
      await api.patch('/api/auth/profile', {
        businessName: details.businessName.trim(),
        phone: details.phone.trim(),
        address: details.address.trim(),
        city: details.city.trim(),
        state: details.state.trim(),
        pincode: details.pincode.trim(),
      })
      await api.patch('/api/auth/vendor-payment-details', { upiId })
      if (qrFile) {
        const imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = () => reject(new Error('Could not read the selected QR image.'))
          reader.readAsDataURL(qrFile)
        })
        const upload = await api.post('/api/upload/vendor-payment-qr', {
          imageBase64,
          mimeType: qrFile.type,
        })
        setQrCodeUrl(upload.qrCodeUrl)
        setQrFile(null)
      }
      onComplete()
    } catch (requestError) {
      setError(requestError.message || 'Could not save vendor setup details.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="p-6 text-gray-500">Checking required vendor setup...</p>

  return (
    <section className="mx-auto max-w-3xl p-6">
      <form onSubmit={saveDetails} className="glass space-y-5 rounded-2xl p-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Complete vendor setup</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Add your full pickup address and UPI payout details before listing products. Customer checkouts are collected by the platform through Razorpay; this QR is saved for vendor settlement records.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {requiredAddressFields.map((field) => (
            <label key={field} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              {labels[field]} *
              <input
                required
                value={details[field]}
                onChange={(event) => setDetails((current) => ({ ...current, [field]: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </label>
          ))}
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            {labels.upiId} *
            <input
              required
              value={details.upiId}
              onChange={(event) => setDetails((current) => ({ ...current, upiId: event.target.value }))}
              placeholder="name@bank"
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
        </div>
        <label className="block rounded-xl border-2 border-dashed border-orange-300 p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Upload UPI QR code * (JPG, PNG, or WEBP; up to 5 MB)
          <input required={!qrCodeUrl} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleQrFile} className="mt-2 block w-full text-sm" />
        </label>
        {qrCodeUrl && <img src={qrCodeUrl} alt="Vendor UPI QR code preview" className="h-40 w-40 rounded-lg border bg-white object-contain p-2" />}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={saving} className="btn-orange rounded-xl px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
          {saving ? 'Saving required details...' : 'Save details and continue'}
        </button>
      </form>
    </section>
  )
}

import crypto from 'node:crypto'

export async function uploadImageToCloudinary(buffer, { folder, publicId }) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Image storage is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.')
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const signatureInput = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
  const signature = crypto.createHash('sha1').update(signatureInput).digest('hex')
  const form = new FormData()

  form.set('file', new Blob([buffer]), publicId)
  form.set('api_key', apiKey)
  form.set('timestamp', String(timestamp))
  form.set('folder', folder)
  form.set('public_id', publicId)
  form.set('signature', signature)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  })
  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error?.message || `Cloudinary upload failed with status ${response.status}`)
  }

  if (!result.secure_url) {
    throw new Error('Cloudinary upload succeeded without returning a secure image URL.')
  }

  return result.secure_url
}

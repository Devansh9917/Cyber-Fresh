import { useState } from 'react'
import { api } from '../../api/client'
import useLanguage from './useLanguage'

export default function ProfilePhotoUpload({ avatar, name, onUploaded }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { t } = useLanguage()

  const handleChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError(t('Choose a JPG, PNG, or WEBP image no larger than 5 MB.'))
      return
    }

    setError('')
    setLoading(true)
    try {
      const imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error(t('Could not read the selected image.')))
        reader.readAsDataURL(file)
      })
      const result = await api.post('/api/upload/profile-photo', {
        imageBase64,
        mimeType: file.type,
      })
      onUploaded(result.avatarUrl)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? t(uploadError.message) : t('Profile image upload failed.'))
    } finally {
      setLoading(false)
      event.target.value = ''
    }
  }

  return (
    <div className="space-y-2">
      {avatar ? (
        <img src={avatar} alt={`${name || 'Profile'} avatar`} className="h-20 w-20 rounded-xl object-cover" />
      ) : (
        <div aria-label={t('No profile image')} className="h-20 w-20 rounded-xl bg-green-100 text-green-700 flex items-center justify-center text-2xl font-bold">
          {(name || '?').slice(0, 1).toUpperCase()}
        </div>
      )}
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-green-700">
        <span>{loading ? t('Uploading...') : t('Upload profile image')}</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" disabled={loading} onChange={handleChange} className="sr-only" />
      </label>
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
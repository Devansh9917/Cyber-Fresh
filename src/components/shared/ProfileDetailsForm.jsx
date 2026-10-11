import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import useLanguage from './useLanguage'

export default function ProfileDetailsForm({ user, fields, onSaved }) {
  const { t } = useLanguage()
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    setValues(Object.fromEntries(fields.map(({ key }) => [key, user[key] || ''])))
  }, [fields, user])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)
    try {
      const result = await api.patch('/api/auth/profile', values)
      onSaved(result.user)
      setNotice(t('Profile updated.'))
    } catch (requestError) {
      setError(requestError instanceof Error ? t(requestError.message) : t('Profile update failed.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {fields.map(({ key, label }) => (
        <label key={key} className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
          {t(label)}
          <input
            value={values[key] || ''}
            onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
            maxLength={500}
            className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 font-normal text-gray-900 placeholder-gray-400 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100 dark:placeholder-gray-500"
          />
        </label>
      ))}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {notice && <p role="status" className="text-sm text-green-700">{notice}</p>}
      <button type="submit" disabled={loading} className="btn-primary rounded-xl px-4 py-2.5 font-semibold text-white disabled:opacity-60">
        {loading ? t('Saving...') : t('Save profile')}
      </button>
    </form>
  )
}
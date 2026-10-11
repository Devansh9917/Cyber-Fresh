import { useState } from 'react'
import { resetPassword } from '../../api/auth'
import useLanguage from '../shared/useLanguage'

export default function PasswordResetPage({ token, onDone }) {
  const { t } = useLanguage()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (password !== confirmation) {
      setError(t('Passwords do not match.'))
      return
    }

    setLoading(true)
    try {
      await resetPassword(token, password)
      setComplete(true)
    } catch (requestError) {
      setError(t(requestError instanceof Error ? requestError.message : 'Password reset failed.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <section className="glass w-full max-w-md rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('Reset your password')}</h1>
        {complete ? (
          <div className="mt-5 space-y-4">
            <p role="status" className="text-green-700">{t('Your password has been updated.')}</p>
            <button onClick={onDone} className="btn-primary w-full rounded-xl py-3 font-semibold text-white">{t('Return to sign in')}</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <label className="block text-sm font-semibold text-gray-700">
              {t('New password')}
              <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3" />
            </label>
            <label className="block text-sm font-semibold text-gray-700">
              {t('Confirm password')}
              <input type="password" required minLength={8} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3" />
            </label>
            <button type="submit" disabled={loading} className="btn-primary w-full rounded-xl py-3 font-semibold text-white disabled:opacity-60">
              {loading ? t('Updating...') : t('Update password')}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}
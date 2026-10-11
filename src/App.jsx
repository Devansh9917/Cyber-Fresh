import { lazy, Suspense, useEffect, useState } from 'react'
import { logout as apiLogout } from './api/auth'
import { api, getAuthToken } from './api/client'

const LandingPage = lazy(() => import('./components/LandingPage'))
const AuthLayout = lazy(() => import('./components/auth/AuthLayout'))
const CustomerPortal = lazy(() => import('./components/customer/CustomerPortal'))
const VendorPortal = lazy(() => import('./components/vendor/VendorPortal'))
const NGOPortal = lazy(() => import('./components/ngo/NGOPortal'))
const AdminPortal = lazy(() => import('./components/admin/AdminPortal'))
const DeliveryPartnerPortal = lazy(() => import('./components/delivery/DeliveryPartnerPortal'))
const PasswordResetPage = lazy(() => import('./components/auth/PasswordResetPage'))

function AppContent() {
  const [state, setState] = useState(() =>
    window.location.pathname.startsWith('/reset-password/')
      ? 'password-reset'
      : window.location.pathname === '/private-admin'
        ? 'admin-auth'
        : getAuthToken()
          ? 'restoring-session'
          : 'landing',
  )
  const [, setUser] = useState(null)
  const [restoreAttempt, setRestoreAttempt] = useState(0)
  const [restoreError, setRestoreError] = useState('')

  useEffect(() => {
    if (window.location.pathname.startsWith('/reset-password/') || !getAuthToken()) return

    let active = true
    api.get('/api/auth/me')
      .then(({ user }) => {
        const appState = {
          customer: 'customer-app',
          vendor: 'vendor-app',
          ngo: 'ngo-app',
          admin: 'admin-app',
          delivery_partner: 'delivery-app',
        }[user.role]

        if (!appState) throw new Error(`Unsupported account role: ${user.role}`)
        if (!active) return
        setUser(user)
        setRestoreError('')
        setState(appState)
      })
      .catch(error => {
        if (!active) return
        setRestoreError(error.message || 'Could not restore your session.')
        setState('session-restore-error')
      })

    return () => {
      active = false
    }
  }, [restoreAttempt])

  const handleLogout = () => {
    apiLogout()
    setUser(null)
    setState(window.location.pathname === '/private-admin' ? 'admin-auth' : 'landing')
  }

  const leavePrivateAdmin = () => {
    window.history.replaceState(null, '', '/')
    setState('landing')
  }

  const finishPasswordReset = () => {
    window.history.replaceState(null, '', '/')
    setState('landing')
  }

  if (state === 'restoring-session') {
    return <main className="flex min-h-screen items-center justify-center text-gray-600">Restoring your session...</main>
  }

  if (state === 'session-restore-error') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-gray-700">{restoreError}</p>
        <div className="flex gap-3">
          <button
            className="rounded-lg bg-green-700 px-4 py-2 font-medium text-white"
            onClick={() => {
              setState('restoring-session')
              setRestoreAttempt(attempt => attempt + 1)
            }}
          >
            Try again
          </button>
          <button
            className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700"
            onClick={handleLogout}
          >
            Back to sign in
          </button>
        </div>
      </main>
    )
  }

  if (state === 'password-reset') {
    const token = decodeURIComponent(window.location.pathname.split('/').pop() || '')
    return <PasswordResetPage token={token} onDone={finishPasswordReset} />
  }

  if (state === 'landing') return <LandingPage onPortalSelect={p => setState(p)} />

  if (state === 'customer-auth') return (
    <AuthLayout
      role="Customer"
      color="#2E7D32"
      icon="🛒"
      onLogin={u => { setUser(u); setState('customer-app') }}
      onRoleChange={setState}
      onBack={() => setState('landing')}
    />
  )
  if (state === 'customer-app') return <CustomerPortal onLogout={handleLogout} />

  if (state === 'vendor-auth') return (
    <AuthLayout
      role="Vendor"
      color="#FF9800"
      icon="🏪"
      onLogin={u => { setUser(u); setState('vendor-app') }}
      onRoleChange={setState}
      onBack={() => setState('landing')}
    />
  )
  if (state === 'vendor-app') return <VendorPortal onLogout={handleLogout} />

  if (state === 'ngo-auth') return (
    <AuthLayout
      role="NGO"
      color="#00897B"
      icon="🤝"
      onLogin={u => { setUser(u); setState('ngo-app') }}
      onRoleChange={setState}
      onBack={() => setState('landing')}
    />
  )
  if (state === 'ngo-app') return <NGOPortal onLogout={handleLogout} />

  if (state === 'admin-auth') return (
    <AuthLayout
      role="Admin"
      color="#3949AB"
      icon="⚡"
      onLogin={u => { setUser(u); setState('admin-app') }}
      onBack={leavePrivateAdmin}
    />
  )
  if (state === 'admin-app') return <AdminPortal onLogout={handleLogout} />
  if (state === 'delivery-auth') return (
    <AuthLayout
      role="Delivery Partner"
      color="#00897B"
      icon="🛵"
      onLogin={u => { setUser(u); setState('delivery-app') }}
      onRoleChange={setState}
      onBack={() => setState('landing')}
    />
  )
  if (state === 'delivery-app') return <DeliveryPartnerPortal onLogout={handleLogout} />

  return null
}

export default function App() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center text-gray-600">Loading Cyber Fresh...</main>}>
      <AppContent />
    </Suspense>
  )
}

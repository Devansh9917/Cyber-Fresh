import { useEffect, useRef, useState } from 'react'
import { Eye, EyeOff, Leaf, ArrowLeft } from 'lucide-react'
import { Input } from '../shared/ui'
import { login as apiLogin, adminLogin as apiAdminLogin, register as apiRegister, googleAuth as apiGoogleAuth, forgotPassword as apiForgotPassword, resetPasswordWithOtp as apiResetPasswordWithOtp } from '../../api/auth'
import useLanguage from '../shared/useLanguage'
import usePortalTheme from '../shared/usePortalTheme'
import PreferenceControls from '../shared/PreferenceControls'

const roleKeyMap = { Customer: 'customer', Vendor: 'vendor', NGO: 'ngo', Admin: 'admin', 'Delivery Partner': 'delivery_partner' }
const roleConfig = {
  Customer: { tagline: 'Shop fresh, save money', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&h=800&fit=crop&auto=format' },
  Vendor: { tagline: 'Sell more, waste less', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=800&fit=crop&auto=format' },
  NGO: { tagline: 'Feed communities, fight waste', image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&h=800&fit=crop&auto=format' },
  Admin: { tagline: 'Manage the ecosystem', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=800&fit=crop&auto=format' },
  'Delivery Partner': { tagline: 'Deliver fresh, earn fairly', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=800&fit=crop&auto=format' },
}

// Loads the Google Identity Services script once, on demand, instead of a
// static <script> tag in index.html that every portal would pay for.
let googleScriptPromise = null
let googleInitializedClientId = null
let activeGoogleCredentialHandler = null

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (googleScriptPromise) return googleScriptPromise
  googleScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Sign-In'))
    document.head.appendChild(script)
  })
  return googleScriptPromise
}

export default function AuthLayout({ role, icon, onLogin, onBack, onRoleChange }) {
  const { dark, toggleDark, accent, setAccent } = usePortalTheme()
  const { language, setLanguage, t } = useLanguage()
  const [screen, setScreen] = useState('login')
  const [showPass, setShowPass] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [otpStep, setOtpStep] = useState(false)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const cfg = roleConfig[role]
  const translateAuthError = (message) => {
    const roleMismatch = message.match(/^This account is registered as ([\w-]+), not ([\w-]+)\.$/)
    if (roleMismatch) {
      return `${t('This account is registered as')} ${t(roleMismatch[1])}, ${t('not')} ${t(roleMismatch[2])}.`
    }
    return t(message)
  }

  const handleForgotSubmit = async () => {
    setError('')
    setNotice('')
    setLoading(true)
    try {
      const result = await apiForgotPassword(email)
      setNotice(t(result.message))
      setOtpStep(true)
    } catch (err) {
      setError(translateAuthError(err instanceof Error ? err.message : 'Could not request a password reset'))
    } finally {
      setLoading(false)
    }
  }

  const handleOtpResetSubmit = async () => {
    setError('')
    if (newPassword !== passwordConfirmation) {
      setError(t('Passwords do not match.'))
      return
    }
    setLoading(true)
    try {
      const result = await apiResetPasswordWithOtp(email, otp, newPassword)
      setNotice(t(result.message))
      setScreen('login')
      setOtpStep(false)
    } catch (err) {
      setError(translateAuthError(err instanceof Error ? err.message : 'Password reset failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleLoginSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const user = role === 'Admin'
        ? await apiAdminLogin(email, password)
        : await apiLogin(email, password, roleKeyMap[role])
      if (user.role !== roleKeyMap[role]) {
        setError(`${t('This account is registered as')} ${t(user.role)}, ${t('not')} ${t(role.toLowerCase())}.`)
        return
      }
      onLogin(user)
    } catch (err) {
      setError(translateAuthError(err instanceof Error ? err.message : 'Login failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const user = await apiRegister({
        name, email, password, phone,
        role: roleKeyMap[role],
        businessName: role === 'Vendor' ? businessName : undefined,
        ngoName: role === 'NGO' ? businessName : undefined,
      })
      onLogin(user)
    } catch (err) {
      setError(translateAuthError(err instanceof Error ? err.message : 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleCredential = async (response) => {
    setError('')
    setLoading(true)
    try {
      const user = await apiGoogleAuth(response.credential, roleKeyMap[role])
      onLogin(user)
    } catch (err) {
      setError(translateAuthError(err instanceof Error ? err.message : 'Google sign-in failed'))
    } finally {
      setLoading(false)
    }
  }

  const googleCredentialHandlerRef = useRef(handleGoogleCredential)
  googleCredentialHandlerRef.current = handleGoogleCredential

  // Mount the real Google button whenever the login screen for this role is showing.
  useEffect(() => {
    if (screen !== 'login' || role === 'Admin' || role === 'Delivery Partner') return
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) return

    let cancelled = false
    const currentHandler = googleCredentialHandlerRef.current
    activeGoogleCredentialHandler = currentHandler
    loadGoogleScript()
      .then(() => {
        if (cancelled) return
        if (googleInitializedClientId !== clientId) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => activeGoogleCredentialHandler?.(response),
          })
          googleInitializedClientId = clientId
        }
        const el = document.getElementById(`google-btn-${role}`)
        if (el) {
          el.innerHTML = ''
          window.google.accounts.id.renderButton(el, {
            theme: 'outline',
            size: 'large',
            width: 320,
            text: 'continue_with',
            locale: language,
          })
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
      if (activeGoogleCredentialHandler === currentHandler) {
        activeGoogleCredentialHandler = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, role, language])

  const accentBtn = 'btn-primary'
  const accentText = 'text-green-600'

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 hero-pattern" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Leaf size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold font-display text-white">
              CyberFresh
            </span>
          </div>
        </div>
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-6 float-anim">{icon}</div>
            <h2 className="text-3xl font-black text-white font-display mb-3">{t(role)} {t('Portal')}</h2>
            <p className="text-white/90 text-lg font-semibold">{t(cfg.tagline)}</p>
            <img src={cfg.image} alt={t('Fresh produce')} className="w-64 h-48 object-cover rounded-2xl mx-auto mt-8 shadow-2xl opacity-80" />
          </div>
        </div>
        <div className="relative z-10">
          <div className="grid grid-cols-3 gap-4">
            {[['🥬', 'Fresh', 'Listings'], ['📦', 'Stock', 'Checked'], ['♻️', 'Food', 'Recovery']].map(([emoji, l1, l2]) => (
              <div key={l1} className="text-center glass-green rounded-xl p-3">
                <p className="text-xl">{emoji}</p>
                <p className="text-white text-xs font-semibold font-display">{t(l1)}</p>
                  <p className="text-white/60 text-xs">{t(l2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="flex justify-end mb-4">
            <PreferenceControls
              dark={dark}
              onToggleDark={toggleDark}
              accent={accent}
              onAccentChange={setAccent}
              language={language}
              onLanguageChange={setLanguage}
              t={t}
              compact
            />
          </div>
          <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium mb-8 transition-colors">
            <ArrowLeft size={16} /> {t('Back to Home')}
          </button>

          {screen === 'login' && (
            <div className="slide-in">
              {role !== 'Admin' && (
                <div role="tablist" aria-label={t('Account type')} className="grid grid-cols-4 gap-1 rounded-xl bg-gray-200 p-1 mb-5">
                  {[
                    ['Customer', 'customer-auth'],
                    ['Vendor', 'vendor-auth'],
                    ['NGO', 'ngo-auth'],
                    ['Delivery Partner', 'delivery-auth'],
                  ].map(([label, target]) => (
                    <button
                      key={target}
                      type="button"
                      role="tab"
                      aria-selected={role.toLowerCase() === label.toLowerCase()}
                      onClick={() => onRoleChange(target)}
                      className={`rounded-lg px-1 py-2 text-xs font-semibold sm:px-2 sm:text-sm ${role.toLowerCase() === label.toLowerCase() ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600'}`}
                    >
                      {t(label)}
                    </button>
                  ))}
                </div>
              )}
              <div className="mb-8">
                <div className="text-4xl mb-3">{icon}</div>
                <h1 className="text-3xl font-black text-gray-900 font-display">{t(role)} {t('Login')}</h1>
                <p className="text-gray-500 mt-1">{t('Welcome back! Please sign in to continue.')}</p>
              </div>
              <div className="glass rounded-2xl p-6 space-y-4">
                {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5">{error}</div>}
                {notice && <div role="status" className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-2.5">{notice}</div>}
                <Input label={t('Email Address')} type="email" placeholder={t('your@email.com')} value={email} onChange={setEmail} />
                <Input
                  label={t('Password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder={t('Enter password')}
                  value={password}
                  onChange={setPassword}
                  rightIcon={showPass ? <Eye size={16} onClick={() => setShowPass(false)} /> : <EyeOff size={16} onClick={() => setShowPass(true)} />}
                />
                <div className="flex items-center justify-between">
                  <button onClick={() => setScreen('forgot')} className={`text-sm font-semibold ${accentText} hover:underline`}>{t('Forgot Password?')}</button>
                </div>
                <button onClick={handleLoginSubmit} disabled={loading} className={`w-full ${accentBtn} text-white font-bold py-3.5 rounded-xl transition-all shadow-lg text-sm disabled:opacity-60`}>
                  {loading ? t('Signing in...') : `${t('Sign In to')} ${t(role)} ${t('Portal')}`}
                </button>

                {role !== 'Admin' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setScreen('register')}
                      className={`w-full rounded-xl border border-green-200 bg-white py-3 text-sm font-semibold ${accentText} transition-colors hover:bg-green-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700`}
                    >
                      {role === 'Delivery Partner'
                        ? <>{t('New delivery person?')} <span className="underline">{t('Sign up')}</span></>
                        : <>{t('New to Cyber Fresh?')} <span className="underline">{t('Create an account')}</span></>}
                    </button>
                    <div className="relative flex items-center gap-4">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-gray-400">{t('or continue with')}</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <div id={`google-btn-${role}`} className="w-full flex justify-center min-h-[44px]" />
                    {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                      <p className="text-center text-xs text-gray-400">
                        {t("Google sign-in isn't configured — set VITE_GOOGLE_CLIENT_ID in your frontend .env.")}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {screen === 'register' && (
            <div className="slide-in">
              <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 font-display">{t('Create Account')}</h1>
                <p className="text-gray-500 mt-1">{t('Join Cyber Fresh as a')} {t(role)}</p>
              </div>
              <div className="glass rounded-2xl p-6 space-y-4">
                {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5">{error}</div>}
                <Input label={t('Full Name')} placeholder={t('Your full name')} value={name} onChange={setName} />
                <Input label={t('Email Address')} type="email" placeholder={t('your@email.com')} value={email} onChange={setEmail} />
                <Input label={t('Phone Number')} placeholder={t('Your phone number')} value={phone} onChange={setPhone} />
                {role === 'Vendor' && <Input label={t('Business Name')} placeholder={t('Your business name')} value={businessName} onChange={setBusinessName} />}
                {role === 'NGO' && <Input label={t('NGO Name')} placeholder={t('Your organization name')} value={businessName} onChange={setBusinessName} />}
                <Input
                  label={t('Password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder={t('Create password')}
                  value={password}
                  onChange={setPassword}
                  rightIcon={showPass ? <Eye size={16} onClick={() => setShowPass(false)} /> : <EyeOff size={16} onClick={() => setShowPass(true)} />}
                />
                <button onClick={handleRegisterSubmit} disabled={loading} className={`w-full ${accentBtn} text-white font-bold py-3.5 rounded-xl transition-all shadow-lg text-sm disabled:opacity-60`}>
                  {loading ? t('Creating account...') : t('Create Account')}
                </button>
              </div>
              <p className="text-center text-sm text-gray-500 mt-6">
                {t('Already have an account?')} <button onClick={() => setScreen('login')} className={`font-bold ${accentText}`}>{t('Sign In')}</button>
              </p>
            </div>
          )}

          {screen === 'forgot' && (
            <div className="slide-in">
              <div className="mb-8">
                <div className="text-4xl mb-3">🔐</div>
                <h1 className="text-3xl font-black text-gray-900 font-display">{t('Forgot Password?')}</h1>
                <p className="text-gray-500 mt-1">{t('Enter your email to reset your password')}</p>
              </div>
              <div className="glass rounded-2xl p-6 space-y-4">
                {error && <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5">{error}</div>}
                {notice && <div role="status" className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-2.5">{notice}</div>}
                {!otpStep ? (
                  <>
                    <Input label={t('Email Address')} type="email" placeholder={t('your@email.com')} value={email} onChange={setEmail} />
                    <button onClick={handleForgotSubmit} disabled={loading || !email.trim()} className={`w-full ${accentBtn} text-white font-bold py-3.5 rounded-xl transition-all shadow-lg text-sm disabled:opacity-60`}>{loading ? t('Sending...') : t('Send reset instructions')}</button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">{t('Enter the six-digit code sent to your email. It expires in 10 minutes. You can also use the secure password reset link in the same email.')}</p>
                    <Input label={t('Six-digit code')} inputMode="numeric" maxLength={6} placeholder="000000" value={otp} onChange={setOtp} />
                    <Input label={t('New password')} type="password" placeholder={t('Create password')} value={newPassword} onChange={setNewPassword} />
                    <Input label={t('Confirm password')} type="password" placeholder={t('Confirm password')} value={passwordConfirmation} onChange={setPasswordConfirmation} />
                    <button onClick={handleOtpResetSubmit} disabled={loading || otp.length !== 6 || !newPassword || !passwordConfirmation} className={`w-full ${accentBtn} text-white font-bold py-3.5 rounded-xl transition-all shadow-lg text-sm disabled:opacity-60`}>{loading ? t('Updating...') : t('Verify code and update password')}</button>
                  </>
                )}
              </div>
              <p className="text-center text-sm text-gray-500 mt-6">
                {t('Remembered?')} <button onClick={() => setScreen('login')} className={`font-bold ${accentText}`}>{t('Sign In')}</button>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

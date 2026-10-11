// Validates password according to Requirement 9:
// Minimum 8 characters, Uppercase, Lowercase, Number, Special character
export function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      score: 0,
      strength: 'WEAK',
      message: 'Password is required',
      checks: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      },
    }
  }

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
  }

  const passedCount = Object.values(checks).filter(Boolean).length

  let strength = 'WEAK'
  if (passedCount === 5 && password.length >= 12) strength = 'VERY STRONG'
  else if (passedCount === 5) strength = 'STRONG'
  else if (passedCount >= 3) strength = 'MEDIUM'
  else strength = 'WEAK'

  const isValid = checks.length && checks.uppercase && checks.lowercase && checks.number && checks.special

  let message = ''
  if (!isValid) {
    const missing = []
    if (!checks.length) missing.push('at least 8 characters')
    if (!checks.uppercase) missing.push('an uppercase letter')
    if (!checks.lowercase) missing.push('a lowercase letter')
    if (!checks.number) missing.push('a number')
    if (!checks.special) missing.push('a special character')
    message = `Password must include: ${missing.join(', ')}.`
  }

  return { isValid, score: passedCount, strength, checks, message }
}

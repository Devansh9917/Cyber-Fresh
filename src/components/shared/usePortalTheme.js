import { useEffect, useState } from 'react'

export default function usePortalTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const savedTheme = window.localStorage.getItem('cf-dark-mode')
    return savedTheme === null
      ? window.localStorage.getItem('cf-customer-dark') === 'true'
      : savedTheme === 'true'
  })
  const [accent, setAccent] = useState(() => {
    if (typeof window === 'undefined') return 'green'
    const savedAccent = window.localStorage.getItem('cf-color-theme')
    return ['green', 'ocean', 'violet', 'sunset', 'cyan'].includes(savedAccent)
      ? savedAccent
      : 'green'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    window.localStorage.setItem('cf-dark-mode', String(dark))
  }, [dark])

  useEffect(() => {
    document.documentElement.dataset.colorTheme = accent
    window.localStorage.setItem('cf-color-theme', accent)
  }, [accent])

  const toggleDark = () => {
    setDark((current) => !current)
  }

  const changeAccent = (nextAccent) => {
    if (['green', 'ocean', 'violet', 'sunset', 'cyan'].includes(nextAccent)) {
      setAccent(nextAccent)
    }
  }

  return { dark, toggleDark, accent, setAccent: changeAccent }
}

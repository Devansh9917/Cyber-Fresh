import { Moon, Sun } from 'lucide-react'

export default function PortalThemeButton({ dark, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
    >
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}

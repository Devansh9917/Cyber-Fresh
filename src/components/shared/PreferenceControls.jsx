import { useId } from "react"
import { Moon, Sun } from "lucide-react"

const accentLabels = {
  green: "Green",
  ocean: "Ocean",
  violet: "Violet",
  sunset: "Sunset",
  cyan: "Cyan",
}

export function LanguageSelector({ language, onLanguageChange, t = (value) => value }) {
  const id = useId()
  return (
    <>
      <label className="sr-only" htmlFor={`language-preference-${id}`}>{t("language")}</label>
      <select
        id={`language-preference-${id}`}
        value={language}
        onChange={(event) => onLanguageChange(event.target.value)}
        className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-200"
      >
        <option value="en" translate="no">English</option>
        <option value="hi" translate="no">Hindi</option>
        <option value="ta" translate="no">Tamil</option>
      </select>
    </>
  )
}

export default function PreferenceControls({
  dark,
  onToggleDark,
  accent,
  onAccentChange,
  language,
  onLanguageChange,
  t = (value) => value,
  compact = false,
}) {
  const id = useId()
  return (
    <div className={`flex items-center gap-2 ${compact ? "flex-wrap" : ""}`}>
      <button
        type="button"
        onClick={onToggleDark}
        aria-label={dark ? t("Switch to light mode") : t("Switch to dark mode")}
        title={dark ? t("Switch to light mode") : t("Switch to dark mode")}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <LanguageSelector language={language} onLanguageChange={onLanguageChange} t={t} />
      <label className="sr-only" htmlFor={`accent-preference-${id}`}>{t("colorTheme")}</label>
      <select
        id={`accent-preference-${id}`}
        value={accent}
        onChange={(event) => onAccentChange(event.target.value)}
        className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-200"
      >
        {Object.entries(accentLabels).map(([value, label]) => (
          <option key={value} value={value}>{t(value) || label}</option>
        ))}
      </select>
    </div>
  )
}

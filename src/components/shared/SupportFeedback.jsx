import { useEffect, useState } from "react"
import { api } from "../../api/client"
import useLanguage from "./useLanguage"

const categories = ["Order", "Product", "Payment", "Delivery", "Account", "App", "Other"]

export default function SupportFeedback() {
  const { t } = useLanguage()
  const [type, setType] = useState("Feedback")
  const [category, setCategory] = useState("Other")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [orderId, setOrderId] = useState("")
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    let active = true
    api.get("/api/support/mine")
      .then((items) => {
        if (active) setTickets(items)
      })
      .catch((requestError) => {
        if (active) setError(t(requestError.message || "Could not load your support history."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError("")
    setNotice("")
    try {
      const result = await api.post("/api/support", { type, category, subject, message, orderId })
      setTickets((current) => [result.ticket, ...current])
      setSubject("")
      setMessage("")
      setOrderId("")
      setNotice(t(result.message))
    } catch (requestError) {
      setError(t(requestError.message || "Could not submit to support."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="glass space-y-5 rounded-2xl p-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t("Feedback & complaints")}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("Send a note to the CyberFresh support team and follow its status here.")}</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {t("Submission type")}
            <select value={type} onChange={(event) => setType(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800">
              <option value="Feedback">{t("Feedback")}</option>
              <option value="Complaint">{t("Complaint")}</option>
            </select>
          </label>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {t("Topic")}
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800">
              {categories.map((item) => <option key={item} value={item}>{t(item)}</option>)}
            </select>
          </label>
        </div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t("Subject")}
          <input required minLength={3} maxLength={120} value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800" />
        </label>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t("Details")}
          <textarea required minLength={10} maxLength={4000} rows={4} value={message} onChange={(event) => setMessage(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800" />
        </label>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t("Order reference (optional)")}
          <input maxLength={100} value={orderId} onChange={(event) => setOrderId(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800" />
        </label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {notice && <p role="status" className="text-sm text-green-700">{notice}</p>}
        <button type="submit" disabled={saving} className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {saving ? t("Sending...") : `${t("Send")} ${t(type)}`}
        </button>
      </form>
      <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-slate-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t("Your recent submissions")}</h3>
        {loading && <p className="text-sm text-gray-500">{t("Loading submissions...")}</p>}
        {!loading && tickets.length === 0 && <p className="text-sm text-gray-500">{t("You have not sent any feedback or complaints yet.")}</p>}
        {tickets.map((ticket) => (
          <article key={ticket._id} className="rounded-xl border border-gray-200 p-3 dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{ticket.subject}</p>
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">{ticket.status}</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">{t(ticket.type)} · {t(ticket.category)} · {new Date(ticket.createdAt).toLocaleDateString()}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{ticket.message}</p>
            {ticket.adminNote && <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">{t("Support note")}: {ticket.adminNote}</p>}
          </article>
        ))}
      </div>
    </section>
  )
}

import { useCallback, useEffect, useState } from "react"
import { api } from "../../api/client"

const statuses = ["Open", "In Progress", "Resolved"]

export default function AdminComplaints() {
  const [tickets, setTickets] = useState([])
  const [filter, setFilter] = useState("All")
  const [notes, setNotes] = useState({})
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState("")
  const [error, setError] = useState("")

  const refresh = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const query = filter === "All" ? "" : `?status=${encodeURIComponent(filter)}`
      setTickets(await api.get(`/api/admin/support-tickets${query}`))
    } catch (requestError) {
      setError(requestError.message || "Could not load support submissions.")
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    refresh()
  }, [refresh])

  const updateTicket = async (ticket, status) => {
    setBusyId(ticket._id)
    setError("")
    try {
      const result = await api.patch(`/api/admin/support-tickets/${ticket._id}`, {
        status,
        adminNote: notes[ticket._id] ?? ticket.adminNote ?? "",
      })
      setTickets((current) => current.map((item) => item._id === ticket._id ? result.ticket : item))
    } catch (requestError) {
      setError(requestError.message || "Could not update this submission.")
    } finally {
      setBusyId("")
    }
  }

  return (
    <section className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">Real feedback and complaints submitted by signed-in customers, vendors, NGOs, and delivery partners.</p>
        <select aria-label="Filter support submissions by status" value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
          <option>All</option>
          {statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="text-gray-500">Loading support submissions...</p>}
      {!loading && tickets.length === 0 && <p className="glass rounded-xl p-5 text-gray-500">No support submissions found.</p>}
      {tickets.map((ticket) => (
        <article key={ticket._id} className="glass space-y-3 rounded-2xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">{ticket.type}</span>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-slate-700 dark:text-gray-200">{ticket.category}</span>
                <span className="text-xs text-gray-500">{ticket.reporterRole.replace("_", " ")}</span>
              </div>
              <h2 className="mt-2 font-bold text-gray-900 dark:text-gray-100">{ticket.subject}</h2>
              <p className="mt-1 text-xs text-gray-500">{ticket.reporterName} · {ticket.reporterEmail} · {new Date(ticket.createdAt).toLocaleString()}</p>
              {ticket.orderId && <p className="mt-1 text-xs text-gray-500">Order: {ticket.orderId}</p>}
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200">{ticket.status}</span>
          </div>
          <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{ticket.message}</p>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input aria-label="Internal support note" maxLength={1000} placeholder="Internal support note (optional)" value={notes[ticket._id] ?? ticket.adminNote ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [ticket._id]: event.target.value }))} className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <div className="flex flex-wrap gap-2">
              {statuses.filter((status) => status !== ticket.status).map((status) => (
                <button key={status} disabled={busyId === ticket._id} onClick={() => updateTicket(ticket, status)} className="rounded-xl border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50 dark:border-slate-600 dark:text-indigo-200">
                  {busyId === ticket._id ? "Saving..." : `Mark ${status}`}
                </button>
              ))}
            </div>
          </div>
          {ticket.adminNote && <p className="text-xs text-gray-500">Saved support note: {ticket.adminNote}</p>}
        </article>
      ))}
    </section>
  )
}

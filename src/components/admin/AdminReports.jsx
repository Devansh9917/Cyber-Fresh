import { useEffect, useState } from "react"
import { api } from "../../api/client"

function downloadCsv(report) {
  const rows = [
    ["CyberFresh live platform report", `Generated ${new Date(report.generatedAt).toLocaleString()}`],
    [],
    ["Metric", "Value"],
    ...Object.entries(report.summary),
    [],
    ["Monthly Orders", "Order Count", "Paid Revenue INR"],
    ...report.monthlyOrders.map((row) => [row.period, row.orders, row.paidRevenue]),
    [],
    ["Order Status", "Count"],
    ...report.orderStatuses.map((row) => [row.label, row.count]),
    [],
    ["Product Category", "Count"],
    ...report.productCategories.map((row) => [row.label, row.count]),
    [],
    ["Donation Status", "Count"],
    ...report.donationStatuses.map((row) => [row.label, row.count]),
    [],
    ["Support Status", "Count"],
    ...report.ticketStatuses.map((row) => [row.label, row.count]),
  ]
  const csv = rows.map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n")
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
  const link = document.createElement("a")
  link.href = url
  link.download = `cyberfresh-report-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function Breakdown({ title, rows }) {
  return (
    <section className="glass rounded-2xl p-5">
      <h2 className="mb-3 font-bold text-gray-900 dark:text-gray-100">{title}</h2>
      {rows.length === 0 && <p className="text-sm text-gray-500">No data available.</p>}
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-3 border-b border-gray-100 py-2 text-sm last:border-0 dark:border-slate-700">
            <span className="text-gray-600 dark:text-gray-300">{row.label}</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{row.count}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function AdminReports() {
  const [report, setReport] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api.get("/api/admin/reports")
      .then((data) => {
        if (active) setReport(data)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Could not load platform reports.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading) return <p className="p-6 text-gray-500">Generating reports from live platform data...</p>
  if (error) return <p role="alert" className="p-6 text-red-600">{error}</p>
  if (!report) return <p className="p-6 text-gray-500">No report data is available.</p>

  const metrics = [
    ["Customers", report.summary.customers],
    ["Vendors", report.summary.vendors],
    ["NGOs", report.summary.ngos],
    ["Delivery partners", report.summary.deliveryPartners],
    ["Products", report.summary.products],
    ["Orders", report.summary.orders],
    ["Paid orders", report.summary.paidOrders],
    ["Paid revenue", `₹${report.summary.paidRevenue}`],
    ["Donations", report.summary.donations],
    ["Meals saved", report.summary.mealsSaved],
    ["CO₂ saved (kg)", report.summary.co2Saved],
    ["Support submissions", report.summary.supportTickets],
  ]
  const orderRows = report.monthlyOrders.map((row) => ({ label: `${row.period} · ${row.orders} orders · ₹${row.paidRevenue} paid revenue`, count: row.orders }))

  return (
    <section className="space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Live platform reports</h2>
          <p className="text-sm text-gray-500">Generated {new Date(report.generatedAt).toLocaleString()} from MongoDB records.</p>
        </div>
        <button onClick={() => downloadCsv(report)} className="rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800">Download CSV</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map(([label, value]) => (
          <article key={label} className="glass rounded-2xl p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-black text-gray-900 dark:text-gray-100">{value}</p>
          </article>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Breakdown title="Monthly order activity" rows={orderRows} />
        <Breakdown title="Orders by status" rows={report.orderStatuses} />
        <Breakdown title="Products by category" rows={report.productCategories} />
        <Breakdown title="Donations by status" rows={report.donationStatuses} />
        <Breakdown title="Support submissions by status" rows={report.ticketStatuses} />
      </div>
    </section>
  )
}

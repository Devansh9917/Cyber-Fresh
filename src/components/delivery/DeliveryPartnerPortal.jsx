import { useCallback, useEffect, useState } from "react"
import { CheckCircle, Clock, LogOut, MapPin, MessageCircle, Package, Phone, Radio, Truck, UserRound } from "lucide-react"
import { api } from "../../api/client"
import ProfilePhotoUpload from "../shared/ProfilePhotoUpload"
import usePortalTheme from "../shared/usePortalTheme"
import PreferenceControls from "../shared/PreferenceControls"
import useLanguage from "../shared/useLanguage"
import TranslatedContent from "../shared/TranslatedContent"
import CommunicationPreferences from "../shared/CommunicationPreferences"
import SupportFeedback from "../shared/SupportFeedback"

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("This device does not support location sharing."))
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      (error) => reject(new Error(error.message || "Allow location access to go online.")),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    )
  })
}

export default function DeliveryPartnerPortal({ onLogout }) {
  const [profile, setProfile] = useState(null)
  const [jobs, setJobs] = useState([])
  const [availableJobs, setAvailableJobs] = useState([])
  const [donationJobs, setDonationJobs] = useState([])
  const [availableDonationJobs, setAvailableDonationJobs] = useState([])
  const [earnings, setEarnings] = useState({ payable: 0, paid: 0, history: [] })
  const [online, setOnline] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [profileOpen, setProfileOpen] = useState(false)
  const [deliveryCodes, setDeliveryCodes] = useState({})
  const { dark, toggleDark, accent, setAccent } = usePortalTheme()
  const { language, setLanguage, t } = useLanguage()

  const refreshJobs = useCallback(async () => {
    const latestJobs = await api.get("/api/delivery/jobs")
    setJobs(latestJobs)
  }, [])

  const refreshAvailableJobs = useCallback(async () => {
    const latestJobs = await api.get("/api/delivery/available-jobs")
    setAvailableJobs(latestJobs)
  }, [])

  const refreshDonationJobs = useCallback(async () => {
    const latestJobs = await api.get("/api/delivery/donation-jobs")
    setDonationJobs(latestJobs)
  }, [])

  const refreshAvailableDonationJobs = useCallback(async () => {
    const latestJobs = await api.get("/api/delivery/available-donation-jobs")
    setAvailableDonationJobs(latestJobs)
  }, [])

  const refreshEarnings = useCallback(async () => {
    const latestEarnings = await api.get("/api/delivery/earnings")
    setEarnings(latestEarnings)
  }, [])

  useEffect(() => {
    api.get("/api/auth/me")
      .then(async (result) => {
        setProfile(result.user)
        setOnline(Boolean(result.user.deliveryPartnerProfile?.online))
        if (result.user.status === "Active") {
          await Promise.all([
            refreshJobs(),
            refreshAvailableJobs(),
            refreshDonationJobs(),
            refreshAvailableDonationJobs(),
            refreshEarnings(),
          ])
        }
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [refreshAvailableDonationJobs, refreshAvailableJobs, refreshDonationJobs, refreshEarnings, refreshJobs])

  useEffect(() => {
    const timer = window.setInterval(() => {
      Promise.all([refreshJobs(), refreshAvailableJobs(), refreshDonationJobs(), refreshAvailableDonationJobs(), refreshEarnings()])
        .catch((requestError) => setError(requestError.message))
    }, 15000)
    return () => window.clearInterval(timer)
  }, [refreshAvailableDonationJobs, refreshAvailableJobs, refreshDonationJobs, refreshEarnings, refreshJobs])

  useEffect(() => {
    if (!online || !navigator.geolocation) return undefined
    let active = true
    const updateLocation = async () => {
      try {
        const location = await getCurrentLocation()
        if (active) {
        api.patch("/api/delivery/location", {
            location,
        }).catch((requestError) => setError(requestError.message))
        }
      } catch (locationError) {
        if (active) setError(locationError.message || "Location sharing was interrupted.")
      }
    }
    updateLocation()
    const timer = window.setInterval(updateLocation, 15000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [online])

  const toggleAvailability = async () => {
    setError("")
    setNotice("")
    setBusy(true)
    try {
      if (online) {
        await api.patch("/api/delivery/availability", { online: false })
        setOnline(false)
        setNotice("You are offline.")
      } else {
        const location = await getCurrentLocation()
        await api.patch("/api/delivery/availability", { online: true, location })
        setOnline(true)
        setNotice("You are online. Choose a packed order from available deliveries.")
        await Promise.all([refreshJobs(), refreshAvailableJobs(), refreshDonationJobs(), refreshAvailableDonationJobs()])
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  const claimJob = async (orderId) => {
    setBusy(true)
    setError("")
    setNotice("")
    try {
      await api.post(`/api/delivery/jobs/${orderId}/claim`)
      await Promise.all([refreshJobs(), refreshAvailableJobs(), refreshDonationJobs(), refreshAvailableDonationJobs()])
      setNotice("Delivery selected. Accept it below when you are ready to start.")
    } catch (requestError) {
      setError(requestError.message)
      await refreshAvailableJobs().catch((refreshError) => setError(refreshError.message))
    } finally {
      setBusy(false)
    }
  }

  const updateJob = async (orderId, action) => {
    setBusy(true)
    setError("")
    setNotice("")
    try {
      const verificationCode = deliveryCodes[orderId] || ""
      const result = await api.patch(`/api/delivery/jobs/${orderId}`, {
        action,
        ...(action === "delivered" ? { verificationCode } : {}),
      })
      await Promise.all([refreshJobs(), refreshAvailableJobs(), refreshDonationJobs(), refreshAvailableDonationJobs(), refreshEarnings()])
      if (action === "reject") {
        setNotice("The delivery is available for another partner to select.")
      } else {
        setNotice(action === "delivered" ? "Delivery marked complete. Earnings are now payable." : "Delivery status updated.")
      }
      if (action === "delivered") {
        setDeliveryCodes((codes) => {
          const next = { ...codes }
          delete next[orderId]
          return next
        })
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  const claimDonationJob = async (donationId) => {
    setBusy(true)
    setError("")
    setNotice("")
    try {
      await api.post(`/api/delivery/donation-jobs/${donationId}/claim`)
      await Promise.all([refreshDonationJobs(), refreshAvailableDonationJobs()])
      setNotice("NGO pickup selected. Accept it below when you are ready to start.")
    } catch (requestError) {
      setError(requestError.message)
      await refreshAvailableDonationJobs().catch((refreshError) => setError(refreshError.message))
    } finally {
      setBusy(false)
    }
  }

  const updateDonationJob = async (donationId, action) => {
    setBusy(true)
    setError("")
    setNotice("")
    try {
      const verificationCode = deliveryCodes[donationId] || ""
      await api.patch(`/api/delivery/donation-jobs/${donationId}`, {
        action,
        ...(action === "delivered" ? { verificationCode } : {}),
      })
      await Promise.all([refreshDonationJobs(), refreshAvailableDonationJobs()])
      setNotice(action === "delivered" ? "Donation handoff verified and completed." : "NGO pickup status updated.")
      if (action === "delivered") {
        setDeliveryCodes((codes) => {
          const next = { ...codes }
          delete next[donationId]
          return next
        })
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <p className="p-8 text-gray-500">Loading delivery partner portal...</p>
  if (error && !profile) return <p role="alert" className="p-8 text-red-600">{error}</p>
  if (profile?.status !== "Active" || profile.deliveryPartnerProfile?.approvalStatus !== "APPROVED") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-slate-950">
        <section className="glass max-w-md rounded-2xl p-8 text-center">
          <Clock className="mx-auto mb-4 text-amber-500" size={36} />
          <h1 className="text-xl font-bold">Application awaiting approval</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">An administrator must approve your delivery partner account before you can go online.</p>
          <div className="my-5 flex justify-center">
            <PreferenceControls dark={dark} onToggleDark={toggleDark} accent={accent} onAccentChange={setAccent} language={language} onLanguageChange={setLanguage} t={t} compact />
          </div>
          <div className="mb-5 flex justify-center">
            <ProfilePhotoUpload avatar={profile?.avatar} name={profile?.name} onUploaded={(avatar) => setProfile((current) => ({ ...current, avatar }))} />
          </div>
          <div className="mt-5 text-left">
            <SupportFeedback />
          </div>
          <button onClick={onLogout} className="mt-6 rounded-lg border px-4 py-2 text-sm font-semibold">Sign out</button>
        </section>
      </main>
    )
  }

  const payable = earnings.payable
  const paid = earnings.paid
  const completedJobs = earnings.history
  const activeJob = jobs.find((job) => ["Packed", "Accepted", "Picked Up", "Out For Delivery"].includes(job.status))
  const activeDonationJob = donationJobs.find((job) => job.deliveryPartner?.status !== "DELIVERED")
  const hasActiveDelivery = Boolean(activeJob || activeDonationJob)
  const openJobs = jobs.filter((job) => job.status !== "Delivered" && job.status !== "Cancelled")
  const liveLocation = online && profile?.deliveryPartnerProfile?.location
  const partnerLocationText = liveLocation ? `${liveLocation.latitude.toFixed(5)}, ${liveLocation.longitude.toFixed(5)}` : ""

  return (
    <TranslatedContent language={language}>
    <div className={dark ? "dark" : ""}>
      <main className="h-dvh overflow-y-auto overscroll-contain bg-gray-50 p-4 text-gray-900 dark:bg-slate-950 dark:text-gray-100 sm:p-8">
        <div className="mx-auto max-w-3xl space-y-5">
          <header className="glass sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">CyberFresh Delivery</p>
              <h1 className="text-2xl font-bold">{profile?.name}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">{profile?.phone}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
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
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                aria-expanded={profileOpen}
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"
              >
                {profile?.avatar
                  ? <img src={profile.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                  : <UserRound size={16} />}
                {t("Profile")}
              </button>
              <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold">
                <LogOut size={16} /> {t("Sign out")}
              </button>
            </div>
          </header>

          {profileOpen && (
            <section className="glass flex flex-wrap items-center gap-5 rounded-2xl p-5">
              <div>
                <h2 className="font-bold">{t("Delivery partner profile")}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">{profile?.name} · {profile?.email}</p>
              </div>
              <ProfilePhotoUpload
                avatar={profile?.avatar}
                name={profile?.name}
                onUploaded={(avatar) => setProfile((current) => ({ ...current, avatar }))}
              />
            </section>
          )}

          <CommunicationPreferences />
          <SupportFeedback />

          <section className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <Radio className={online ? "text-emerald-600" : "text-gray-400"} size={22} />
              <div>
                <h2 className="font-bold">{online ? "You are online" : "You are offline"}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">GPS is shared only while online. Keep this page open to receive offers.</p>
              </div>
            </div>
            <button
              onClick={toggleAvailability}
              disabled={busy || hasActiveDelivery}
              className={`rounded-xl px-5 py-3 text-sm font-bold text-white disabled:opacity-50 ${online ? "bg-gray-600" : "bg-emerald-600 hover:bg-emerald-700"}`}
            >
              {busy ? "Please wait..." : online ? "Go offline" : "Share GPS and go online"}
            </button>
          </section>

          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}

          {liveLocation && (
            <section className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-700">Live location is active</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Your customer can see your real-time location while you are on an active delivery.</p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${liveLocation.latitude},${liveLocation.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  <MapPin size={16} /> Open live map
                </a>
              </div>
              <p className="mt-3 text-xs text-gray-600 dark:text-gray-300">Current coordinates: {partnerLocationText}</p>
            </section>
          )}

          <section className="glass flex items-center justify-between rounded-2xl p-5">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Awaiting payout</p>
              <p className="text-2xl font-black">₹{payable}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Recorded as paid</p>
              <p className="text-2xl font-black">₹{paid}</p>
            </div>
          </section>

          {completedJobs.length > 0 && (
            <section className="glass space-y-3 rounded-2xl p-5">
              <h2 className="font-bold">Delivery earnings history</h2>
              {completedJobs.map((job) => (
                <div key={job._id} className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-3 text-sm dark:border-slate-700">
                  <div>
                    <p className="font-semibold">{job.orderId} · ₹{job.earnings || 0}</p>
                    {job.paidAt && <p className="text-xs text-gray-500">Paid {new Date(job.paidAt).toLocaleDateString()}{job.payoutReference ? ` · Ref: ${job.payoutReference}` : ""}</p>}
                  </div>
                  <span className={job.earningsStatus === "Paid" ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700" : "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"}>
                    {job.earningsStatus === "Paid" ? "Paid" : "Awaiting payout"}
                  </span>
                </div>
              ))}
            </section>
          )}

          <section className="glass space-y-3 rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold">Available deliveries</h2>
                <p className="text-sm text-gray-500">Choose which packed order you want to deliver. Admins do not assign these orders.</p>
              </div>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">{availableJobs.length} available</span>
            </div>
            {!availableJobs.length && <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500 dark:bg-slate-800 dark:text-gray-400">No packed orders are waiting for a delivery partner right now.</p>}
            {availableJobs.map((job) => (
              <article key={job._id} className="rounded-xl border border-gray-200 p-4 dark:border-slate-700">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{job.orderId}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{job.user?.name || "Customer"}</p>
                    <p className="mt-1 text-sm text-gray-500">{job.address || "Delivery address unavailable"}</p>
                    <p className="mt-1 text-xs text-gray-500">{job.items?.map((item) => item.name).join(", ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{job.deliveryFee || 0} estimated</p>
                    <p className="text-xs text-gray-500">{job.deliveryDistanceKm || 0} km</p>
                  </div>
                </div>
                <button
                  disabled={busy || !online || hasActiveDelivery}
                  onClick={() => claimJob(job._id)}
                  className="btn-primary mt-3 w-full rounded-lg px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {!online ? "Go online to select this order" : hasActiveDelivery ? "Finish your active delivery first" : busy ? "Selecting..." : "Select this delivery"}
                </button>
              </article>
            ))}
          </section>

          <section className="glass space-y-3 rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold">Available NGO donation pickups</h2>
                <p className="text-sm text-gray-500">Collect accepted food donations from vendors and deliver them to the NGO.</p>
              </div>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">{availableDonationJobs.length} available</span>
            </div>
            {!availableDonationJobs.length && <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500 dark:bg-slate-800 dark:text-gray-400">No NGO donation pickups are waiting right now.</p>}
            {availableDonationJobs.map((donation) => (
              <article key={donation._id} className="rounded-xl border border-gray-200 p-4 dark:border-slate-700">
                <h3 className="font-semibold">{donation.product} · {donation.quantity}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Pickup: {donation.vendor?.businessName || donation.vendor?.name || "Vendor"}</p>
                <p className="text-sm text-gray-500">{[donation.vendor?.address, donation.vendor?.city, donation.vendor?.state, donation.vendor?.pincode].filter(Boolean).join(", ") || "Vendor pickup address unavailable"}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Deliver to: {donation.ngo?.ngoName || donation.ngo?.name || donation.ngoName || "NGO"}</p>
                <p className="text-sm text-gray-500">{[donation.ngo?.address, donation.ngo?.city, donation.ngo?.state, donation.ngo?.pincode].filter(Boolean).join(", ") || "NGO delivery address unavailable"}</p>
                <button
                  disabled={busy || !online || hasActiveDelivery}
                  onClick={() => claimDonationJob(donation._id)}
                  className="btn-primary mt-3 w-full rounded-lg px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {!online ? "Go online to select this pickup" : hasActiveDelivery ? "Finish your active delivery first" : busy ? "Selecting..." : "Select this NGO pickup"}
                </button>
              </article>
            ))}
          </section>

          {!openJobs.length && !activeDonationJob && (
            <section className="glass rounded-2xl p-8 text-center">
              <Package className="mx-auto mb-3 text-gray-400" size={34} />
              <p className="font-semibold">No active delivery</p>
              <p className="mt-1 text-sm text-gray-500">Select an available packed order or NGO pickup when you are ready to deliver.</p>
            </section>
          )}

          {openJobs.map((job) => {
            const pickups = [...new Map(
              (job.items || [])
                .filter((item) => item.vendor && typeof item.vendor === "object")
                .map((item) => [item.vendor._id, item.vendor]),
            ).values()]
            return (
            <article key={job._id} className="glass space-y-4 rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold">{job.orderId}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{job.user?.name || "Customer"}</p>
                  {job.user?.phone && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <a href={`tel:${job.user.phone}`} className="inline-flex items-center gap-1 text-sm text-teal-700 hover:underline"><Phone size={14} />{job.user.phone}</a>
                      <a href={`https://wa.me/${job.user.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${job.user.name || "Customer"}, I am on my way for order ${job.orderId}.`)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"><MessageCircle size={12} /> WhatsApp</a>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{job.deliveryPartner?.earnings || 0}</p>
                  <p className="text-xs text-gray-500">{job.deliveryPartner?.distanceKm || 0} km estimated · {job.status}</p>
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 text-sm dark:bg-slate-800">
                <p className="mb-1 inline-flex items-center gap-1 font-semibold"><MapPin size={14} /> Delivery address</p>
                <p className="text-gray-600 dark:text-gray-300">{job.address}</p>
                <div className="mt-3 space-y-2">
                  <p className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300"><Truck size={13} /> Vendor pickup{pickups.length > 1 ? "s" : ""}</p>
                  {pickups.length
                    ? pickups.map((vendor) => (
                      <div key={vendor._id} className="rounded-lg border border-gray-200 p-2 text-xs dark:border-slate-700">
                        <p className="font-semibold">{vendor.businessName || vendor.name}</p>
                        <p className="text-gray-600 dark:text-gray-300">{[vendor.address, vendor.city, vendor.state, vendor.pincode].filter(Boolean).join(", ") || "Pickup address missing"}</p>
                        {vendor.phone && <a href={`tel:${vendor.phone}`} className="text-teal-700 hover:underline">{vendor.phone}</a>}
                      </div>
                    ))
                    : <p className="text-xs text-gray-500">{job.items?.map((item) => item.vendorName).filter(Boolean).join(", ") || "Pickup details unavailable"}</p>}
                </div>
              </div>
              {job.status === "Packed" && job.deliveryPartner?.status === "Assigned" && (
                <div className="flex gap-2">
                  <button disabled={busy} onClick={() => updateJob(job._id, "accept")} className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">Accept delivery</button>
                  <button disabled={busy} onClick={() => updateJob(job._id, "reject")} className="rounded-lg border px-4 py-2.5 text-sm font-semibold disabled:opacity-50">Decline</button>
                </div>
              )}
              {job.status === "Accepted" && job.deliveryPartner?.status === "Accepted" && (
                <button disabled={busy} onClick={() => updateJob(job._id, "picked_up")} className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">Picked up · Start delivery</button>
              )}
              {job.status === "Picked Up" && (
                <button disabled={busy} onClick={() => updateJob(job._id, "out_for_delivery")} className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">Out for delivery</button>
              )}
              {job.status === "Out For Delivery" && (
                <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                  <label htmlFor={`customer-code-${job._id}`} className="block text-sm font-semibold text-gray-800 dark:text-gray-100">Ask the customer for their six-digit handoff code</label>
                  <input
                    id={`customer-code-${job._id}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={deliveryCodes[job._id] || ""}
                    onChange={(event) => setDeliveryCodes((codes) => ({ ...codes, [job._id]: event.target.value.replace(/\D/g, "").slice(0, 6) }))}
                    placeholder="6-digit customer code"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600"
                  />
                  <button disabled={busy || !/^\d{6}$/.test(deliveryCodes[job._id] || "")} onClick={() => updateJob(job._id, "delivered")} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                    <CheckCircle size={17} /> Verify code and mark delivered
                  </button>
                </div>
              )}
            </article>
          )})}

          {activeDonationJob && (
            <article className="glass space-y-4 rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">NGO donation pickup</p>
                  <h2 className="font-bold">{activeDonationJob.product} · {activeDonationJob.quantity}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Status: {activeDonationJob.deliveryPartner?.status?.replaceAll("_", " ")}</p>
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 text-sm dark:bg-slate-800">
                <p className="font-semibold">Vendor pickup</p>
                <p>{activeDonationJob.vendor?.businessName || activeDonationJob.vendor?.name}</p>
                <p className="text-gray-600 dark:text-gray-300">{[activeDonationJob.vendor?.address, activeDonationJob.vendor?.city, activeDonationJob.vendor?.state, activeDonationJob.vendor?.pincode].filter(Boolean).join(", ") || "Vendor pickup address unavailable"}</p>
                {activeDonationJob.vendor?.phone && <a href={`tel:${activeDonationJob.vendor.phone}`} className="text-teal-700 hover:underline">{activeDonationJob.vendor.phone}</a>}
                <p className="mt-3 font-semibold">NGO delivery</p>
                <p>{activeDonationJob.ngo?.ngoName || activeDonationJob.ngo?.name || activeDonationJob.ngoName}</p>
                <p className="text-gray-600 dark:text-gray-300">{[activeDonationJob.ngo?.address, activeDonationJob.ngo?.city, activeDonationJob.ngo?.state, activeDonationJob.ngo?.pincode].filter(Boolean).join(", ") || "NGO delivery address unavailable"}</p>
                {activeDonationJob.ngo?.phone && <a href={`tel:${activeDonationJob.ngo.phone}`} className="text-teal-700 hover:underline">{activeDonationJob.ngo.phone}</a>}
              </div>
              {activeDonationJob.deliveryPartner?.status === "ASSIGNED" && (
                <div className="flex gap-2">
                  <button disabled={busy} onClick={() => updateDonationJob(activeDonationJob._id, "accept")} className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">Accept pickup</button>
                  <button disabled={busy} onClick={() => updateDonationJob(activeDonationJob._id, "reject")} className="rounded-lg border px-4 py-2.5 text-sm font-semibold disabled:opacity-50">Decline</button>
                </div>
              )}
              {activeDonationJob.deliveryPartner?.status === "ACCEPTED" && <button disabled={busy} onClick={() => updateDonationJob(activeDonationJob._id, "picked_up")} className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">Picked up from vendor</button>}
              {activeDonationJob.deliveryPartner?.status === "PICKED_UP" && <button disabled={busy} onClick={() => updateDonationJob(activeDonationJob._id, "out_for_delivery")} className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">Start delivery to NGO</button>}
              {activeDonationJob.deliveryPartner?.status === "OUT_FOR_DELIVERY" && (
                <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                  <label htmlFor={`ngo-code-${activeDonationJob._id}`} className="block text-sm font-semibold text-gray-800 dark:text-gray-100">Ask an authorized NGO recipient for their six-digit code</label>
                  <input
                    id={`ngo-code-${activeDonationJob._id}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={deliveryCodes[activeDonationJob._id] || ""}
                    onChange={(event) => setDeliveryCodes((codes) => ({ ...codes, [activeDonationJob._id]: event.target.value.replace(/\D/g, "").slice(0, 6) }))}
                    placeholder="6-digit NGO code"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600"
                  />
                  <button disabled={busy || !/^\d{6}$/.test(deliveryCodes[activeDonationJob._id] || "")} onClick={() => updateDonationJob(activeDonationJob._id, "delivered")} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                    <CheckCircle size={17} /> Verify NGO code and complete pickup
                  </button>
                </div>
              )}
            </article>
          )}
        </div>
      </main>
    </div>
    </TranslatedContent>
  )
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime"
import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import {
  Home,
  Package,
  Clock,
  CheckCircle,
  BarChart2,
  Settings,
  LogOut,
  Bell,
  Heart,
  ChevronRight,
  Calendar,
} from "lucide-react"
import { Badge, StatCard, SectionTitle } from "../shared/ui"
import { getAvailableDonations, acceptDonation, getDonationHistory } from "../../api/donations"
import { api } from "../../api/client"
import ProfilePhotoUpload from "../shared/ProfilePhotoUpload"
import ProfileDetailsForm from "../shared/ProfileDetailsForm"
import usePortalTheme from "../shared/usePortalTheme"
import PreferenceControls from "../shared/PreferenceControls"
import useLanguage from "../shared/useLanguage"
import TranslatedContent from "../shared/TranslatedContent"
import CommunicationPreferences from "../shared/CommunicationPreferences"
import SupportFeedback from "../shared/SupportFeedback"
function Sidebar({ page, setPage, onLogout, t }) {
  const links = [
    { id: "dashboard", icon: _jsx(Home, { size: 18 }), label: "Dashboard" },
    {
      id: "available",
      icon: _jsx(Package, { size: 18 }),
      label: "Available Donations",
    },
    {
      id: "schedule",
      icon: _jsx(Calendar, { size: 18 }),
      label: "Pickup Schedule",
    },
    {
      id: "history",
      icon: _jsx(Clock, { size: 18 }),
      label: "Donation History",
    },
    {
      id: "impact",
      icon: _jsx(BarChart2, { size: 18 }),
      label: "Impact Dashboard",
    },
    { id: "profile", icon: _jsx(Heart, { size: 18 }), label: "Profile" },
    { id: "settings", icon: _jsx(Settings, { size: 18 }), label: "Settings" },
  ]
  return _jsxs("aside", {
    className: "vendor-sidebar w-60 h-full min-h-0 flex-shrink-0 overflow-hidden p-5 flex flex-col",
    children: [
      _jsxs("div", {
        className: "flex items-center gap-2.5 mb-8",
        children: [
          _jsx("div", {
            className:
              "w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white text-lg",
            children: "\uD83E\uDD1D",
          }),
          _jsx("span", {
            className: "text-lg font-bold font-display text-white",
            children: "NGO Portal",
          }),
        ],
      }),
      _jsx("div", {
        className: "min-h-0 flex-1 overflow-y-auto overscroll-contain space-y-1",
        children: links.map((l) =>
          _jsxs(
            "button",
            {
              onClick: () => setPage(l.id),
              className: `sidebar-link w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm font-medium transition-all ${
                page === l.id
                  ? "active text-white"
                  : "text-teal-100 hover:text-white"
              }`,
              children: [l.icon, _jsx("span", { children: t(l.label) })],
            },
            l.id,
          ),
        ),
      }),
      _jsxs("div", {
        className: "flex-shrink-0 pt-4 border-t border-teal-500",
        children: [
          _jsxs("div", {
            className: "flex items-center gap-3 mb-3 px-2",
            children: [
              _jsx("div", {
                className:
                  "w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold font-display",
                children: "N",
              }),
              _jsxs("div", {
                children: [
                  _jsx("p", {
                    className: "text-white text-sm font-semibold font-display",
                    children: t("NGO account"),
                  }),
                  _jsx("p", {
                    className: "text-teal-100 font-semibold text-xs",
                    children: t("NGO Partner"),
                  }),
                ],
              }),
            ],
          }),
          _jsxs("button", {
            onClick: onLogout,
            className:
              "sidebar-link w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-300 hover:text-red-200",
            children: [_jsx(LogOut, { size: 16 }), ` ${t("Logout")}`],
          }),
        ],
      }),
    ],
  })
}
function TopNav({ page, dark, onToggleDark, accent, setAccent, language, setLanguage, t, setPage }) {
  const titles = {
    dashboard: "NGO Dashboard",
    available: "Available Donations",
    schedule: "Pickup Schedule",
    history: "Donation History",
    impact: "Impact Dashboard",
    profile: "Profile",
    settings: "Settings",
  }
  return _jsxs("header", {
    className:
      "glass sticky top-0 z-30 px-6 py-4 flex items-center justify-between border-b border-white/60",
    children: [
      _jsxs("div", {
        children: [
          _jsx("h1", {
            className: "text-lg font-bold text-gray-900 font-display",
            children: t(titles[page]),
          }),
          _jsx("p", {
            className: "text-xs text-gray-600 font-medium",
            children: new Date().toLocaleDateString(),
          }),
        ],
      }),
      _jsxs("div", {
        className: "flex items-center gap-3",
        children: [
          _jsx(PreferenceControls, {
            dark,
            onToggleDark,
            accent,
            onAccentChange: setAccent,
            language,
            onLanguageChange: setLanguage,
            t,
            compact: true,
          }),
          _jsx("button", {
            type: "button",
            onClick: () => setPage("profile"),
            "aria-label": t("Open profile"),
            className: "w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center font-bold text-teal-600 font-display",
            children: "N",
          }),
        ],
      }),
    ],
  })
}
function Dashboard({ setPage }) {
  return _jsxs("div", {
    className: "p-6 space-y-8",
    children: [
      _jsxs("div", {
        style: { background: "linear-gradient(135deg, #00695C, #26A69A)" },
        className: "rounded-2xl p-6 hero-pattern",
        children: [
          _jsx("p", {
            className: "text-teal-100 font-semibold text-sm mb-1",
            children: "Good Morning \uD83C\uDF3F",
          }),
          _jsx("h2", {
            className: "text-2xl font-black text-white font-display",
            children: "Welcome, HelpFood NGO! \uD83E\uDD1D",
          }),
          _jsx("p", {
            className: "text-teal-100 font-semibold text-sm mt-1",
            children: "2 new donations available for pickup today",
          }),
          _jsxs("div", {
            className: "flex gap-3 mt-4",
            children: [
              _jsx("button", {
                onClick: () => setPage("available"),
                className:
                  "bg-white text-teal-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-teal-50 transition-all",
                children: "View Donations",
              }),
              _jsx("button", {
                onClick: () => setPage("schedule"),
                className:
                  "bg-white/20 text-white text-sm px-4 py-2 rounded-xl font-medium",
                children: "Pickup Schedule",
              }),
            ],
          }),
        ],
      }),
      _jsxs("div", {
        className: "grid grid-cols-2 md:grid-cols-4 gap-4",
        children: [
          _jsx(StatCard, {
            icon: _jsx(Heart, { size: 22 }),
            label: "Meals Distributed",
            value: "2,480",
            sub: "This month",
            color: "#00897B",
            bg: "#E0F2F1",
          }),
          _jsx(StatCard, {
            icon: _jsx(Package, { size: 22 }),
            label: "Food Received",
            value: "826 kg",
            sub: "This month",
            color: "#00897B",
            bg: "#E0F2F1",
          }),
          _jsx(StatCard, {
            icon: _jsx(CheckCircle, { size: 22 }),
            label: "Pickups Done",
            value: "48",
            sub: "This month",
            color: "#00897B",
            bg: "#E0F2F1",
          }),
          _jsx(StatCard, {
            icon: _jsx("span", {
              className: "text-lg",
              children: "\uD83C\uDF0D",
            }),
            label: "CO\u2082 Saved",
            value: "215 kg",
            sub: "Carbon offset",
            color: "#00897B",
            bg: "#E0F2F1",
          }),
        ],
      }),
      _jsxs("div", {
        className: "grid md:grid-cols-2 gap-5",
        children: [
          _jsxs("div", {
            className: "glass rounded-2xl p-5",
            children: [
              _jsx(SectionTitle, {
                sub: "Meals distributed monthly",
                children: "Monthly Impact",
              }),
              _jsx(ResponsiveContainer, {
                width: "100%",
                height: 180,
                children: _jsxs(AreaChart, {
                  data: impactData,
                  children: [
                    _jsx("defs", {
                      children: _jsxs("linearGradient", {
                        id: "ngoMeals",
                        x1: "0",
                        y1: "0",
                        x2: "0",
                        y2: "1",
                        children: [
                          _jsx("stop", {
                            offset: "5%",
                            stopColor: "#00897B",
                            stopOpacity: 0.3,
                          }),
                          _jsx("stop", {
                            offset: "95%",
                            stopColor: "#00897B",
                            stopOpacity: 0,
                          }),
                        ],
                      }),
                    }),
                    _jsx(XAxis, {
                      dataKey: "month",
                      tick: { fontSize: 11, fill: "#9CA3AF" },
                      axisLine: false,
                      tickLine: false,
                    }),
                    _jsx(YAxis, {
                      tick: { fontSize: 11, fill: "#9CA3AF" },
                      axisLine: false,
                      tickLine: false,
                    }),
                    _jsx(Tooltip, {
                      contentStyle: {
                        borderRadius: 12,
                        border: "none",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      },
                    }),
                    _jsx(Area, {
                      type: "monotone",
                      dataKey: "meals",
                      stroke: "#00897B",
                      strokeWidth: 2.5,
                      fill: "url(#ngoMeals)",
                      name: "Meals",
                    }),
                  ],
                }),
              }),
            ],
          }),
          _jsxs("div", {
            className: "glass rounded-2xl p-5",
            children: [
              _jsx(SectionTitle, {
                sub: "Food received (kg)",
                children: "Food Received",
              }),
              _jsx(ResponsiveContainer, {
                width: "100%",
                height: 180,
                children: _jsxs(BarChart, {
                  data: impactData,
                  children: [
                    _jsx(XAxis, {
                      dataKey: "month",
                      tick: { fontSize: 11, fill: "#9CA3AF" },
                      axisLine: false,
                      tickLine: false,
                    }),
                    _jsx(YAxis, {
                      tick: { fontSize: 11, fill: "#9CA3AF" },
                      axisLine: false,
                      tickLine: false,
                    }),
                    _jsx(Tooltip, {
                      contentStyle: {
                        borderRadius: 12,
                        border: "none",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      },
                    }),
                    _jsx(Bar, {
                      dataKey: "food",
                      fill: "#26A69A",
                      radius: [6, 6, 0, 0],
                      name: "kg received",
                    }),
                  ],
                }),
              }),
            ],
          }),
        ],
      }),
      _jsxs("div", {
        children: [
          _jsx(SectionTitle, {
            sub: "Awaiting your acceptance",
            children: "Pending Donations",
          }),
          _jsx("div", {
            className: "space-y-3",
            children: donations
              .filter((d) => d.status !== "Delivered")
              .map((d) =>
                _jsxs(
                  "div",
                  {
                    className:
                      "glass rounded-xl p-4 flex items-center justify-between",
                    children: [
                      _jsxs("div", {
                        className: "flex items-center gap-3",
                        children: [
                          _jsx("div", {
                            className:
                              "w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-xl",
                            children: "\uD83E\uDD6C",
                          }),
                          _jsxs("div", {
                            children: [
                              _jsxs("p", {
                                className:
                                  "font-semibold text-gray-900 text-sm font-display",
                                children: [d.product, " \u00B7 ", d.quantity],
                              }),
                              _jsxs("p", {
                                className: "text-xs text-gray-500",
                                children: [
                                  d.vendorName,
                                  " \u00B7 ",
                                  d.distance,
                                  " away \u00B7 Expires ",
                                  d.expiryDate,
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      _jsx("button", {
                        onClick: () => setPage("available"),
                        className:
                          "text-teal-600 text-sm font-semibold border border-teal-200 px-3 py-1.5 rounded-xl hover:bg-teal-50",
                        children: "Accept",
                      }),
                    ],
                  },
                  d.id,
                ),
              ),
          }),
        ],
      }),
    ],
  })
}
function AvailableDonations() {
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [accepting, setAccepting] = useState(null)
  useEffect(() => {
    getAvailableDonations()
      .then(setItems)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load donations",
        ),
      )
      .finally(() => setLoading(false))
  }, [])
  const handleAccept = async (id) => {
    setAccepting(id)
    try {
      const updated = await acceptDonation(id)
      setItems((prev) => prev.map((d) => (d._id === id ? updated : d)))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not accept donation")
    } finally {
      setAccepting(null)
    }
  }
  return _jsxs("div", {
    className: "p-6 space-y-5",
    children: [
      _jsx("div", {
        className: "glass rounded-2xl p-4 bg-green-50 border border-green-100",
        children: _jsxs("p", {
          className: "text-sm text-green-700 font-medium",
          children: [
            "\uD83E\uDD16 ",
            t("AI matched"),
            " ",
            _jsxs("strong", { children: [items.length, " ", t("donations")] }),
            " ",
            t("near your NGO. Accept to schedule pickup."),
          ],
        }),
      }),
      loading
        ? _jsx("div", {
            className: "text-center py-16 text-gray-500 dark:text-gray-300",
            children: t("Loading available donations..."),
          })
        : error
          ? _jsx("div", {
              className: "text-center py-16 text-red-500 text-sm",
              children: error,
            })
          : items.length === 0
            ? _jsx("div", {
                className: "text-center py-16 text-gray-500 dark:text-gray-300",
                children: t("No donations available right now \u2014 check back soon."),
              })
            : _jsx("div", {
                className: "space-y-4",
                children: items.map((d) => {
                  const vendorName =
                    typeof d.vendor === "object"
                      ? d.vendor.businessName || d.vendor.name
                      : "Vendor"
                  return _jsxs(
                    "div",
                    {
                      className: `glass rounded-2xl p-5 ${
                        d.status !== "Pending Pickup"
                          ? "border-2 border-teal-400"
                          : ""
                      }`,
                      children: [
                        _jsxs("div", {
                          className: "flex items-start justify-between mb-3",
                          children: [
                            _jsxs("div", {
                              children: [
                                _jsxs("div", {
                                  className: "flex items-center gap-2 mb-1",
                                  children: [
                                    _jsx("h4", {
                                      className:
                                        "font-bold text-gray-900 font-display",
                                      children: t(d.product),
                                    }),
                                    _jsx(Badge, {
                                      color: "green",
                                      children: d.quantity,
                                    }),
                                  ],
                                }),
                                _jsxs("p", {
                                  className: "text-sm text-gray-600 dark:text-gray-300",
                                  children: [t("From: "), vendorName],
                                }),
                                _jsxs("p", {
                                  className: "text-xs text-gray-500 dark:text-gray-300 mt-0.5",
                                  children: [
                                    t("Expires "),
                                    d.expiryDate,
                                  ],
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "text-right",
                              children: [
                                _jsx("p", {
                                  className: "text-xs text-gray-500 dark:text-gray-300 mb-1",
                                  children: t("Freshness"),
                                }),
                                _jsx("div", {
                                  className:
                                    "w-16 h-2 bg-gray-200 rounded-full overflow-hidden",
                                  children: _jsx("div", {
                                    className: "h-full rounded-full",
                                    style: {
                                      width: `${d.freshnessScore || 0}%`,
                                      background:
                                        (d.freshnessScore || 0) > 60
                                          ? "#2E7D32"
                                          : "#FF9800",
                                    },
                                  }),
                                }),
                                _jsxs("p", {
                                  className: "text-xs text-gray-400 dark:text-gray-300 mt-0.5",
                                  children: [d.freshnessScore, "/100"],
                                }),
                              ],
                            }),
                          ],
                        }),
                        d.status !== "Pending Pickup"
                          ? _jsxs("div", {
                              className:
                                "flex items-center gap-2 text-teal-600 font-semibold text-sm",
                              children: [
                                _jsx(CheckCircle, { size: 16 }),
                                t(d.status === "Delivered" ? "Delivered" : "Accepted"),
                                d.status === "Accepted" && _jsx("p", {
                                  className: "mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 dark:bg-slate-800 dark:text-amber-200",
                                  children: d.deliveryVerificationCode
                                    ? `${t("Give this code to the delivery partner only when your donation arrives:")} ${d.deliveryVerificationCode}`
                                    : t("A delivery partner will pick up and deliver this donation."),
                                }),
                              ],
                            })
                          : _jsxs("div", {
                              className: "flex gap-3",
                              children: [
                                _jsx("button", {
                                  onClick: () => handleAccept(d._id),
                                  disabled: accepting === d._id,
                                  className: "btn-primary flex-1 text-white font-semibold text-sm py-2.5 rounded-xl disabled:opacity-60",
                                  children:
                                    accepting === d._id
                                      ? t("Accepting...")
                                      : t("Accept Donation"),
                                }),
                              ],
                            }),
                      ],
                    },
                    d._id,
                  )
                }),
              }),
    ],
  })
}
function PickupSchedule() {
  const schedule = [
    {
      time: "10:00 AM",
      vendor: "Green Valley Farms",
      product: "Bananas (15 kg)",
      address: "Vashi, Navi Mumbai",
      status: "Upcoming",
    },
    {
      time: "12:30 PM",
      vendor: "Sunrise Gardens",
      product: "Tomatoes (8 kg)",
      address: "Andheri East, Mumbai",
      status: "Upcoming",
    },
    {
      time: "03:00 PM",
      vendor: "Organic Roots",
      product: "Spinach (5 kg)",
      address: "Bandra West, Mumbai",
      status: "Completed",
    },
  ]
  return _jsxs("div", {
    className: "p-6 space-y-4",
    children: [
      _jsxs("div", {
        className: "glass rounded-2xl p-4 bg-teal-50 flex items-center gap-3",
        children: [
          _jsx(Calendar, { size: 18, className: "text-teal-600" }),
          _jsxs("p", {
            children: [
              "Today, August 6, 2026 \u00B7 ",
              _jsx("strong", { children: "3 pickups scheduled" }),
            ],
          }),
        ],
      }),
      _jsx("div", {
        className: "space-y-4",
        children: schedule.map((s, i) =>
          _jsxs(
            "div",
            {
              className: "glass rounded-2xl p-5 flex items-center gap-4",
              children: [
                _jsxs("div", {
                  className:
                    "text-center bg-teal-50 rounded-xl p-3 w-20 flex-shrink-0",
                  children: [
                    _jsx("p", {
                      className: "font-bold text-teal-700 font-display text-sm",
                      children: s.time.split(" ")[0],
                    }),
                    _jsx("p", {
                      className: "text-xs text-teal-500",
                      children: s.time.split(" ")[1],
                    }),
                  ],
                }),
                _jsxs("div", {
                  className: "flex-1",
                  children: [
                    _jsx("p", {
                      className: "font-bold text-gray-900 font-display text-sm",
                      children: s.vendor,
                    }),
                    _jsx("p", {
                      className: "text-sm text-gray-600",
                      children: s.product,
                    }),
                    _jsxs("p", {
                      className: "text-xs text-gray-400 mt-0.5",
                      children: ["\uD83D\uDCCD ", s.address],
                    }),
                  ],
                }),
                _jsx(Badge, {
                  color: s.status === "Completed" ? "green" : "orange",
                  children: s.status,
                }),
              ],
            },
            i,
          ),
        ),
      }),
    ],
  })
}
function DonationHistory() {
  return _jsx("div", {
    className: "p-6 space-y-4",
    children: ngoDonationHistory.map((d) =>
      _jsxs(
        "div",
        {
          className: "glass rounded-2xl p-5 flex items-center justify-between",
          children: [
            _jsxs("div", {
              className: "flex items-center gap-4",
              children: [
                _jsx("div", {
                  className:
                    "w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-2xl",
                  children: "\uD83E\uDD57",
                }),
                _jsxs("div", {
                  children: [
                    _jsx("p", {
                      className: "font-bold text-gray-900 font-display text-sm",
                      children: d.vendor,
                    }),
                    _jsxs("p", {
                      className: "text-sm text-gray-600",
                      children: [d.product, " \u00B7 ", d.quantity],
                    }),
                    _jsx("p", {
                      className: "text-xs text-gray-400 mt-0.5",
                      children: d.date,
                    }),
                  ],
                }),
              ],
            }),
            _jsxs("div", {
              className: "text-right",
              children: [
                _jsxs("p", {
                  className: "font-bold text-teal-600 font-display",
                  children: ["\uD83C\uDF7D\uFE0F ", d.mealsSaved, " meals"],
                }),
                _jsx(Badge, { color: "green", children: d.status }),
              ],
            }),
          ],
        },
        d.id,
      ),
    ),
  })
}
function ImpactDashboard() {
  const stats = [
    {
      label: "Total Meals Distributed",
      value: "12,480",
      icon: "🍽️",
      sub: "Across 48 events",
    },
    {
      label: "Total Food Received",
      value: "4,160 kg",
      icon: "📦",
      sub: "From 68 vendors",
    },
    {
      label: "Communities Served",
      value: "24",
      icon: "🏘️",
      sub: "In Mumbai region",
    },
    {
      label: "CO₂ Offset",
      value: "1,080 kg",
      icon: "🌱",
      sub: "Since Jan 2025",
    },
    {
      label: "Families Helped",
      value: "2,080",
      icon: "👨‍👩‍👧",
      sub: "Per month avg.",
    },
    {
      label: "Waste Prevented",
      value: "4,160 kg",
      icon: "♻️",
      sub: "From landfills",
    },
  ]
  return _jsxs("div", {
    className: "p-6 space-y-6",
    children: [
      _jsx("div", {
        className: "grid grid-cols-2 md:grid-cols-3 gap-4",
        children: stats.map((s) =>
          _jsxs(
            "div",
            {
              className: "glass rounded-2xl p-5 text-center",
              children: [
                _jsx("p", { className: "text-4xl mb-2", children: s.icon }),
                _jsx("p", {
                  className: "stats-counter text-2xl font-black font-display",
                  children: s.value,
                }),
                _jsx("p", {
                  className:
                    "text-sm font-bold text-gray-700 font-display mt-1",
                  children: s.label,
                }),
                _jsx("p", {
                  className: "text-xs text-gray-400 mt-0.5",
                  children: s.sub,
                }),
              ],
            },
            s.label,
          ),
        ),
      }),
      _jsxs("div", {
        className: "glass rounded-2xl p-5",
        children: [
          _jsx(SectionTitle, {
            sub: "Growth in meals distributed",
            children: "Meals Saved Over Time",
          }),
          _jsx(ResponsiveContainer, {
            width: "100%",
            height: 220,
            children: _jsxs(AreaChart, {
              data: impactData,
              children: [
                _jsx("defs", {
                  children: _jsxs("linearGradient", {
                    id: "impactGrad",
                    x1: "0",
                    y1: "0",
                    x2: "0",
                    y2: "1",
                    children: [
                      _jsx("stop", {
                        offset: "5%",
                        stopColor: "#00897B",
                        stopOpacity: 0.3,
                      }),
                      _jsx("stop", {
                        offset: "95%",
                        stopColor: "#00897B",
                        stopOpacity: 0,
                      }),
                    ],
                  }),
                }),
                _jsx(XAxis, {
                  dataKey: "month",
                  tick: { fontSize: 11, fill: "#9CA3AF" },
                  axisLine: false,
                  tickLine: false,
                }),
                _jsx(YAxis, {
                  tick: { fontSize: 11, fill: "#9CA3AF" },
                  axisLine: false,
                  tickLine: false,
                }),
                _jsx(Tooltip, {
                  contentStyle: {
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  },
                }),
                _jsx(Area, {
                  type: "monotone",
                  dataKey: "meals",
                  stroke: "#00897B",
                  strokeWidth: 2.5,
                  fill: "url(#impactGrad)",
                  name: "Meals",
                }),
              ],
            }),
          }),
        ],
      }),
    ],
  })
}
function LiveNgoDashboard({ setPage }) {
  const { t } = useLanguage()
  const [available, setAvailable] = useState([])
  const [impact, setImpact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([getAvailableDonations(), api.get("/api/donations/impact")])
      .then(([availableDonations, impactData]) => {
        setAvailable(availableDonations)
        setImpact(impactData)
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  return _jsxs("div", {
    className: "p-6 space-y-6",
    children: [
      _jsxs("header", {
        className: "customer-dashboard-hero rounded-2xl p-6 text-white",
        children: [
          _jsx("h2", { className: "text-2xl font-black font-display", children: t("NGO Dashboard") }),
          _jsx("button", { onClick: () => setPage("available"), className: "mt-4 bg-white text-green-700 font-semibold px-4 py-2 rounded-xl", children: t("View available donations") }),
        ],
      }),
      error && _jsx("p", { role: "alert", className: "text-red-600", children: error }),
      loading
        ? _jsx("p", { className: "text-gray-500 dark:text-gray-300", children: t("Loading donation data...") })
        : _jsxs("div", {
            className: "grid grid-cols-2 md:grid-cols-3 gap-4",
            children: [
              _jsx(StatCard, { icon: _jsx(Package, { size: 22 }), label: t("Available donations"), value: available.length }),
              _jsx(StatCard, { icon: _jsx(Heart, { size: 22 }), label: t("Meals saved"), value: impact?.mealsDistributed ?? 0 }),
              _jsx(StatCard, { icon: _jsx(CheckCircle, { size: 22 }), label: t("Completed pickups"), value: impact?.pickupsDone ?? 0 }),
            ],
          }),
      !loading && available.length === 0 && _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-300", children: t("No donation opportunities available.") }),
    ],
  })
}

function LivePickupSchedule() {
  const { t } = useLanguage()
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getDonationHistory()
      .then((records) => setDonations(records.filter((record) => record.status === "Accepted")))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return _jsx("p", { className: "p-6 text-gray-500 dark:text-gray-300", children: t("Loading pickups...") })
  if (error) return _jsx("p", { role: "alert", className: "p-6 text-red-600", children: error })
  if (!donations.length) return _jsx("p", { className: "p-6 text-gray-500 dark:text-gray-300", children: t("No accepted pickups are scheduled.") })

  return _jsx("div", {
    className: "p-6 space-y-3",
    children: donations.map((donation) => _jsxs("article", {
      className: "glass rounded-xl p-4",
      children: [
        _jsx("h3", { className: "font-semibold", children: `${t(donation.product)} · ${donation.quantity}` }),
        _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: donation.vendor?.businessName || donation.vendor?.name || t("Vendor") }),
        _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: donation.vendor?.address || t("Pickup address unavailable.") }),
        _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-300", children: `${t("Accepted")} ${new Date(donation.updatedAt).toLocaleString()}` }),
      ],
    }, donation._id)),
  })
}

function LiveDonationHistory() {
  const { t } = useLanguage()
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getDonationHistory()
      .then(setDonations)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return _jsx("p", { className: "p-6 text-gray-500 dark:text-gray-300", children: t("Loading donation history...") })
  if (error) return _jsx("p", { role: "alert", className: "p-6 text-red-600", children: error })
  if (!donations.length) return _jsx("p", { className: "p-6 text-gray-500 dark:text-gray-300", children: t("No donation history yet.") })

  return _jsx("div", {
    className: "p-6 space-y-3",
    children: donations.map((donation) => _jsxs("article", {
      className: "glass rounded-xl p-4 flex items-center justify-between",
      children: [
        _jsxs("div", {
          children: [
            _jsx("h3", { className: "font-semibold", children: `${t(donation.product)} · ${donation.quantity}` }),
            _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: donation.vendor?.businessName || donation.vendor?.name || t("Vendor") }),
            _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-300", children: new Date(donation.createdAt).toLocaleDateString() }),
            donation.deliveryVerificationCode && donation.status !== "Delivered" && _jsx("p", {
              className: "mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 dark:bg-slate-800 dark:text-amber-200",
              children: `${t("NGO handoff code for the delivery partner:")} ${donation.deliveryVerificationCode}`,
            }),
          ],
        }),
        _jsx(Badge, { color: donation.status === "Delivered" ? "green" : "orange", children: t(donation.status) }),
      ],
    }, donation._id)),
  })
}

function LiveNgoImpact() {
  const { t } = useLanguage()
  const [impact, setImpact] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    api.get("/api/donations/impact")
      .then(setImpact)
      .catch((requestError) => setError(requestError.message))
  }, [])

  if (error) return _jsx("p", { role: "alert", className: "p-6 text-red-600", children: error })
  if (!impact) return _jsx("p", { className: "p-6 text-gray-500 dark:text-gray-300", children: t("Loading impact data...") })

  return _jsxs("div", {
    className: "p-6 grid grid-cols-2 gap-4",
    children: [
      _jsx(StatCard, { icon: _jsx(Heart, { size: 22 }), label: t("Meals distributed"), value: impact.mealsDistributed }),
      _jsx(StatCard, { icon: _jsx(Package, { size: 22 }), label: t("Donations accepted"), value: impact.totalDonations }),
      _jsx(StatCard, { icon: _jsx(CheckCircle, { size: 22 }), label: t("Pickups completed"), value: impact.pickupsDone }),
      _jsx(StatCard, { icon: _jsx(BarChart2, { size: 22 }), label: t("CO₂ offset (kg)"), value: impact.co2Offset }),
    ],
  })
}

function LiveNgoProfile() {
  const [user, setUser] = useState(null)
  const [error, setError] = useState("")
  const { t } = useLanguage()

  useEffect(() => {
    api.get("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch((requestError) => setError(requestError.message))
  }, [])

  if (error) return _jsx("p", { role: "alert", className: "p-6 text-red-600", children: error })
  if (!user) return _jsx("p", { className: "p-6 text-gray-500", children: "Loading profile..." })

  return _jsxs("section", {
    className: "p-6 space-y-3",
    children: [
      _jsx(ProfilePhotoUpload, { avatar: user.avatar, name: user.ngoName || user.name, onUploaded: (avatar) => setUser((current) => ({ ...current, avatar })) }),
      _jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-gray-100", children: user.ngoName || user.name }),
      _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: user.email }),
      _jsx(ProfileDetailsForm, {
        user,
        fields: [
          { key: "name", label: "Contact name" },
          { key: "ngoName", label: "NGO name" },
          { key: "phone", label: "Phone" },
          { key: "address", label: "Address" },
          { key: "city", label: "City" },
          { key: "state", label: "State" },
          { key: "pincode", label: "PIN code" },
          { key: "description", label: "Description" },
        ],
        onSaved: setUser,
      }),
    ],
  })
}

export default function NGOPortal({ onLogout }) {
  const [page, setPage] = useState("dashboard")
  const { dark, toggleDark, accent, setAccent } = usePortalTheme()
  const { language, setLanguage, t } = useLanguage()
  const pages = {
    dashboard: _jsx(LiveNgoDashboard, { setPage: setPage }),
    available: _jsx(AvailableDonations, {}),
    schedule: _jsx(LivePickupSchedule, {}),
    history: _jsx(LiveDonationHistory, {}),
    impact: _jsx(LiveNgoImpact, {}),
    profile: _jsx(LiveNgoProfile, {}),
    settings: _jsx("div", { className: "max-w-3xl space-y-4 p-6", children: [_jsx(CommunicationPreferences, {}), _jsx(SupportFeedback, {})] }),
  }
  return _jsx(TranslatedContent, { language, children: _jsxs("div", {
    className: dark ? "dark flex h-dvh min-h-0 overflow-hidden bg-[#0B1220]" : "flex h-dvh min-h-0 overflow-hidden bg-gray-50",
    children: [
      _jsx(Sidebar, { page: page, setPage: setPage, onLogout: onLogout, t }),
      _jsxs("div", {
        className: "min-h-0 min-w-0 flex-1 flex flex-col overflow-hidden",
        children: [
          _jsx(TopNav, {
            page,
            dark,
            onToggleDark: toggleDark,
            accent,
            setAccent,
            language,
            setLanguage,
            t,
            setPage,
          }),
          _jsx("main", {
            className: "min-h-0 flex-1 overflow-y-auto overscroll-contain",
            children: pages[page],
          }),
        ],
      }),
    ],
  }) })
}

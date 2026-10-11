import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime"
import { useState, useEffect } from "react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  BarChart2,
  Settings,
  LogOut,
  Bell,
  Home,
  AlertTriangle,
  Search,
  ChevronRight,
  Star,
  Truck,
  Wallet,
} from "lucide-react"
import {
  adminStats,
  adminUsers,
  adminVendors,
  revenueData,
  categoryData,
} from "../../data/mockData"
import { Badge, StatCard, SectionTitle } from "../shared/ui"
import { getAdminStats } from "../../api/admin"
import { api } from "../../api/client"
import usePortalTheme from "../shared/usePortalTheme"
import useLanguage from "../shared/useLanguage"
import PreferenceControls from "../shared/PreferenceControls"
import AdminComplaints from "./AdminComplaints"
import AdminReports from "./AdminReports"
const growthData = [
  { month: "Mar", users: 18200, vendors: 980, orders: 62000 },
  { month: "Apr", users: 19800, vendors: 1050, orders: 71000 },
  { month: "May", users: 21100, vendors: 1120, orders: 79000 },
  { month: "Jun", users: 22500, vendors: 1160, orders: 85000 },
  { month: "Jul", users: 23800, vendors: 1200, orders: 92000 },
  { month: "Aug", users: 24850, vendors: 1240, orders: 98650 },
]
function Sidebar({ page, setPage, onLogout, t }) {
  const links = [
    { id: "dashboard", icon: _jsx(Home, { size: 18 }), label: t("dashboard") },
    { id: "users", icon: _jsx(Users, { size: 18 }), label: t("customers") },
    { id: "vendors", icon: _jsx(Package, { size: 18 }), label: t("vendors") },
    { id: "delivery-partners", icon: _jsx(Truck, { size: 18 }), label: t("Delivery Partners") },
    { id: "delivery-payouts", icon: _jsx(Wallet, { size: 18 }), label: "Delivery payouts" },
    {
      id: "ngos",
      icon: _jsx("span", { className: "text-sm", children: "\uD83E\uDD1D" }),
      label: t("ngos"),
    },
    { id: "products", icon: _jsx(Package, { size: 18 }), label: t("products") },
    { id: "orders", icon: _jsx(ShoppingCart, { size: 18 }), label: t("orders") },
    {
      id: "analytics",
      icon: _jsx(BarChart2, { size: 18 }),
      label: t("analytics"),
    },
    { id: "reports", icon: _jsx(TrendingUp, { size: 18 }), label: t("reports") },
    {
      id: "complaints",
      icon: _jsx(AlertTriangle, { size: 18 }),
      label: t("complaints"),
    },
    { id: "settings", icon: _jsx(Settings, { size: 18 }), label: t("settings") },
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
            children: "\u26A1",
          }),
          _jsx("span", {
            className: "text-lg font-bold font-display text-white",
            children: "Admin Portal",
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
                  : "text-indigo-100 hover:text-white"
              }`,
              children: [l.icon, _jsx("span", { children: l.label })],
            },
            l.id,
          ),
        ),
      }),
      _jsxs("div", {
        className: "flex-shrink-0 pt-4 border-t border-green-400",
        children: [
          _jsxs("div", {
            className: "flex items-center gap-3 mb-3 px-2",
            children: [
              _jsx("div", {
                className:
                  "w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold font-display",
                children: "SA",
              }),
              _jsxs("div", {
                children: [
                  _jsx("p", {
                    className: "text-white text-sm font-bold font-display",
                    children: "Super Admin",
                  }),
                  _jsx("p", {
                    className: "text-indigo-100 text-xs font-semibold",
                    children: "Platform Admin",
                  }),
                ],
              }),
            ],
          }),
          _jsxs("button", {
            onClick: onLogout,
            className:
              "sidebar-link w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-300 hover:text-red-200",
            children: [_jsx(LogOut, { size: 16 }), " Logout"],
          }),
        ],
      }),
    ],
  })
}
function TopNav({ page, dark, onToggleDark, accent, setAccent, language, setLanguage, t }) {
  const titles = {
    dashboard: "Admin Dashboard",
    users: "Customer Management",
    vendors: "Vendor Management",
    ngos: "NGO Management",
    products: "Product Management",
    orders: "Order Management",
    "delivery-partners": "Delivery Partner Management",
    "delivery-payouts": "Delivery payouts",
    analytics: "Platform Analytics",
    reports: "Reports",
    complaints: "Complaints & Support",
    settings: "Admin Settings",
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
            children: `${new Date().toLocaleDateString()} · Administrator`,
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
          _jsx("div", {
            className:
              "w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center font-bold text-indigo-700 font-display",
            children: "SA",
          }),
        ],
      }),
    ],
  })
}
function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState("")
  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load stats"),
      )
  }, [])
  return _jsxs("div", {
    className: "p-6 space-y-8",
    children: [
      _jsxs("div", {
        className: "customer-dashboard-hero rounded-2xl p-6 hero-pattern",
        children: [
          _jsx("p", {
            className: "text-indigo-100 text-sm mb-1 font-semibold",
            children: "Platform Overview \u26A1",
          }),
          _jsx("h2", {
            className: "text-2xl font-black text-white font-display",
            children: "Admin Dashboard",
          }),
          _jsx("p", {
            className: "text-indigo-100 text-sm mt-1 font-medium",
            children:
              "Platform is running smoothly \u00B7 3 pending vendor approvals",
          }),
        ],
      }),
      error &&
        _jsx("div", {
          className:
            "bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5",
          children: error,
        }),
      _jsxs("div", {
        className: "grid grid-cols-2 gap-4",
        children: [
          _jsx(StatCard, {
            icon: _jsx(Users, { size: 22 }),
            label: "Total Customers",
            value: stats ? stats.totalUsers.toLocaleString() : "...",
            sub: "Live from database",
            color: "#3949AB",
            bg: "#E8EAF6",
          }),
          _jsx(StatCard, {
            icon: _jsx(Package, { size: 22 }),
            label: "Total Vendors",
            value: stats ? stats.totalVendors.toLocaleString() : "...",
            sub: "Live from database",
            color: "#3949AB",
            bg: "#E8EAF6",
          }),
          _jsx(StatCard, {
            icon: _jsx(ShoppingCart, { size: 22 }),
            label: "Total Orders",
            value: stats ? stats.totalOrders.toLocaleString() : "...",
            sub: "Live from database",
            color: "#3949AB",
            bg: "#E8EAF6",
          }),
          _jsx(StatCard, {
            icon: _jsx(TrendingUp, { size: 22 }),
            label: "Platform Revenue",
            value: stats ? `₹${(stats.revenue / 100000).toFixed(1)}L` : "...",
            sub: "Live from database",
            color: "#2E7D32",
            bg: "#E8F5E9",
          }),
        ],
      }),
      _jsxs("div", {
        className: "grid grid-cols-2 gap-4",
        children: [
          _jsxs("div", {
            className: "glass rounded-2xl p-4 text-center",
            children: [
              _jsx("p", {
                className: "text-3xl mb-1",
                children: "\uD83C\uDF7D\uFE0F",
              }),
              _jsx("p", {
                className: "stats-counter text-2xl font-black font-display",
                children: adminStats.mealsSaved.toLocaleString(),
              }),
              _jsx("p", {
                className: "text-sm text-gray-500",
                children: "Meals Saved",
              }),
            ],
          }),
          _jsxs("div", {
            className: "glass rounded-2xl p-4 text-center",
            children: [
              _jsx("p", {
                className: "text-3xl mb-1",
                children: "\uD83C\uDF31",
              }),
              _jsxs("p", {
                className: "stats-counter text-2xl font-black font-display",
                children: [adminStats.co2Saved.toLocaleString(), " kg"],
              }),
              _jsx("p", {
                className: "text-sm text-gray-500",
                children: "CO\u2082 Saved",
              }),
            ],
          }),
          _jsxs("div", {
            className: "glass rounded-2xl p-4 text-center",
            children: [
              _jsx("p", {
                className: "text-3xl mb-1",
                children: "\u267B\uFE0F",
              }),
              _jsxs("p", {
                className: "stats-counter text-2xl font-black font-display",
                children: [adminStats.wasteReduced.toLocaleString(), " kg"],
              }),
              _jsx("p", {
                className: "text-sm text-gray-500",
                children: "Waste Reduced",
              }),
            ],
          }),
          _jsxs("div", {
            className: "glass rounded-2xl p-4 text-center",
            children: [
              _jsx("p", {
                className: "text-3xl mb-1",
                children: "\uD83E\uDD1D",
              }),
              _jsx("p", {
                className: "stats-counter text-2xl font-black font-display",
                children: adminStats.totalNGOs,
              }),
              _jsx("p", {
                className: "text-sm text-gray-500",
                children: "NGO Partners",
              }),
            ],
          }),
        ],
      }),
      _jsxs("div", {
        className: "glass rounded-2xl p-5",
        children: [
          _jsx(SectionTitle, {
            sub: "Platform growth over time",
            children: "User & Vendor Growth",
          }),
          _jsx(ResponsiveContainer, {
            width: "100%",
            height: 220,
            children: _jsxs(LineChart, {
              data: growthData,
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
                  tickFormatter: (v) => `${(v / 1000).toFixed(0)}k`,
                }),
                _jsx(Tooltip, {
                  contentStyle: {
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  },
                }),
                _jsx(Line, {
                  type: "monotone",
                  dataKey: "users",
                  stroke: "#3949AB",
                  strokeWidth: 2.5,
                  dot: { fill: "#3949AB", r: 4 },
                  name: "Customers",
                }),
                _jsx(Line, {
                  type: "monotone",
                  dataKey: "vendors",
                  stroke: "#FF9800",
                  strokeWidth: 2,
                  strokeDasharray: "5 5",
                  dot: false,
                  name: "Vendors",
                }),
                _jsx(Line, {
                  type: "monotone",
                  dataKey: "orders",
                  stroke: "#2E7D32",
                  strokeWidth: 2,
                  strokeDasharray: "3 3",
                  dot: false,
                  name: "Orders",
                }),
              ],
            }),
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
                sub: "Top performing vendors",
                children: "Top Vendors",
              }),
              _jsx("div", {
                className: "space-y-3",
                children: adminVendors
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((v, i) =>
                    _jsxs(
                      "div",
                      {
                        className: "flex items-center gap-3",
                        children: [
                          _jsx("span", {
                            className:
                              "w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0",
                            children: i + 1,
                          }),
                          _jsxs("div", {
                            className: "flex-1 min-w-0",
                            children: [
                              _jsx("p", {
                                className:
                                  "font-semibold text-gray-900 text-sm font-display truncate",
                                children: v.name,
                              }),
                              _jsxs("div", {
                                className: "flex items-center gap-1 text-xs",
                                children: [
                                  _jsx(Star, {
                                    size: 10,
                                    fill: "#EAB308",
                                    className: "text-yellow-500",
                                  }),
                                  _jsx("span", { children: v.rating }),
                                ],
                              }),
                            ],
                          }),
                          _jsxs("div", {
                            className: "text-right",
                            children: [
                              _jsxs("p", {
                                className:
                                  "font-bold text-gray-900 text-sm font-display",
                                children: [
                                  "\u20B9",
                                  (v.revenue / 1000).toFixed(0),
                                  "K",
                                ],
                              }),
                              _jsx(Badge, {
                                color:
                                  v.status === "Verified" ? "green" : "orange",
                                children: v.status,
                              }),
                            ],
                          }),
                        ],
                      },
                      v.id,
                    ),
                  ),
              }),
            ],
          }),
          _jsxs("div", {
            className: "glass rounded-2xl p-5",
            children: [
              _jsx(SectionTitle, {
                sub: "Revenue by category",
                children: "Category Split",
              }),
              _jsxs("div", {
                className: "flex items-center gap-6",
                children: [
                  _jsx(PieChart, {
                    width: 140,
                    height: 140,
                    children: _jsx(Pie, {
                      data: categoryData,
                      cx: 65,
                      cy: 65,
                      innerRadius: 45,
                      outerRadius: 65,
                      dataKey: "value",
                      strokeWidth: 0,
                      children: categoryData.map((entry, i) =>
                        _jsx(Cell, { fill: entry.fill }, i),
                      ),
                    }),
                  }),
                  _jsx("div", {
                    className: "space-y-2",
                    children: categoryData.map((c) =>
                      _jsxs(
                        "div",
                        {
                          className: "flex items-center gap-2",
                          children: [
                            _jsx("div", {
                              className: "w-3 h-3 rounded-full",
                              style: { background: c.fill },
                            }),
                            _jsx("span", {
                              className: "text-sm text-gray-600",
                              children: c.name,
                            }),
                            _jsxs("span", {
                              className:
                                "text-sm font-bold text-gray-900 ml-auto font-display",
                              children: [c.value, "%"],
                            }),
                          ],
                        },
                        c.name,
                      ),
                    ),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  })
}
function ManageUsers() {
  const [search, setSearch] = useState("")
  const filtered = adminUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )
  return _jsxs("div", {
    className: "p-6 space-y-5",
    children: [
      _jsxs("div", {
        className: "flex items-center gap-4",
        children: [
          _jsxs("div", {
            className:
              "flex-1 flex items-center gap-2 glass rounded-xl px-4 py-2.5",
            children: [
              _jsx(Search, { size: 16, className: "text-gray-400" }),
              _jsx("input", {
                value: search,
                onChange: (e) => setSearch(e.target.value),
                placeholder: "Search customers...",
                className:
                  "flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none",
              }),
            ],
          }),
          _jsxs("div", {
            className:
              "glass rounded-xl px-4 py-2.5 text-sm font-semibold text-indigo-600",
            children: [filtered.length, " customers"],
          }),
        ],
      }),
      _jsx("div", {
        className: "glass rounded-2xl overflow-hidden",
        children: _jsxs("table", {
          className: "w-full",
          children: [
            _jsx("thead", {
              className: "bg-indigo-50",
              children: _jsx("tr", {
                children: [
                  "Customer",
                  "Email",
                  "Phone",
                  "Orders",
                  "Spent",
                  "Status",
                  "Joined",
                  "Actions",
                ].map((h) =>
                  _jsx(
                    "th",
                    {
                      className:
                        "text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider",
                      children: h,
                    },
                    h,
                  ),
                ),
              }),
            }),
            _jsx("tbody", {
              className: "divide-y divide-gray-50",
              children: filtered.map((u) =>
                _jsxs(
                  "tr",
                  {
                    className: "hover:bg-indigo-50/20 transition-colors",
                    children: [
                      _jsx("td", {
                        className:
                          "px-4 py-3 font-semibold text-gray-900 text-sm font-display",
                        children: u.name,
                      }),
                      _jsx("td", {
                        className: "px-4 py-3 text-sm text-gray-600",
                        children: u.email,
                      }),
                      _jsx("td", {
                        className: "px-4 py-3 text-sm text-gray-600",
                        children: u.phone,
                      }),
                      _jsx("td", {
                        className:
                          "px-4 py-3 font-bold text-gray-900 text-sm font-display",
                        children: u.orders,
                      }),
                      _jsxs("td", {
                        className:
                          "px-4 py-3 font-bold text-gray-900 text-sm font-display",
                        children: ["\u20B9", u.spent.toLocaleString()],
                      }),
                      _jsx("td", {
                        className: "px-4 py-3",
                        children: _jsx(Badge, {
                          color: u.status === "Active" ? "green" : "red",
                          children: u.status,
                        }),
                      }),
                      _jsx("td", {
                        className: "px-4 py-3 text-sm text-gray-500",
                        children: u.joinDate,
                      }),
                      _jsx("td", {
                        className: "px-4 py-3",
                        children: _jsxs("div", {
                          className: "flex gap-2",
                          children: [
                            _jsx("button", {
                              className:
                                "text-xs text-indigo-600 hover:underline font-semibold",
                              children: "View",
                            }),
                            _jsx("button", {
                              className:
                                "text-xs text-red-500 hover:underline font-semibold",
                              children:
                                u.status === "Active" ? "Suspend" : "Activate",
                            }),
                          ],
                        }),
                      }),
                    ],
                  },
                  u.id,
                ),
              ),
            }),
          ],
        }),
      }),
    ],
  })
}
function ManageVendors() {
  return _jsxs("div", {
    className: "p-6 space-y-5",
    children: [
      _jsxs("div", {
        className: "grid grid-cols-3 gap-4 mb-2",
        children: [
          _jsxs("div", {
            className:
              "glass rounded-xl p-4 text-center border-l-4 border-green-500",
            children: [
              _jsx("p", {
                className: "text-2xl font-black text-gray-900 font-display",
                children: "1,234",
              }),
              _jsx("p", {
                className: "text-sm text-gray-500",
                children: "Verified",
              }),
            ],
          }),
          _jsxs("div", {
            className:
              "glass rounded-xl p-4 text-center border-l-4 border-orange-400",
            children: [
              _jsx("p", {
                className: "text-2xl font-black text-gray-900 font-display",
                children: "3",
              }),
              _jsx("p", {
                className: "text-sm text-gray-500",
                children: "Pending",
              }),
            ],
          }),
          _jsxs("div", {
            className:
              "glass rounded-xl p-4 text-center border-l-4 border-red-400",
            children: [
              _jsx("p", {
                className: "text-2xl font-black text-gray-900 font-display",
                children: "6",
              }),
              _jsx("p", {
                className: "text-sm text-gray-500",
                children: "Suspended",
              }),
            ],
          }),
        ],
      }),
      _jsx("div", {
        className: "glass rounded-2xl overflow-hidden",
        children: _jsxs("table", {
          className: "w-full",
          children: [
            _jsx("thead", {
              className: "bg-indigo-50",
              children: _jsx("tr", {
                children: [
                  "Vendor",
                  "Owner",
                  "Category",
                  "Products",
                  "Revenue",
                  "Rating",
                  "Status",
                  "Actions",
                ].map((h) =>
                  _jsx(
                    "th",
                    {
                      className:
                        "text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider",
                      children: h,
                    },
                    h,
                  ),
                ),
              }),
            }),
            _jsx("tbody", {
              className: "divide-y divide-gray-50",
              children: adminVendors.map((v) =>
                _jsxs(
                  "tr",
                  {
                    className: "hover:bg-indigo-50/20 transition-colors",
                    children: [
                      _jsx("td", {
                        className:
                          "px-4 py-3 font-semibold text-gray-900 text-sm font-display",
                        children: v.name,
                      }),
                      _jsx("td", {
                        className: "px-4 py-3 text-sm text-gray-600",
                        children: v.owner,
                      }),
                      _jsx("td", {
                        className: "px-4 py-3 text-sm text-gray-600",
                        children: v.category,
                      }),
                      _jsx("td", {
                        className:
                          "px-4 py-3 font-bold text-gray-900 text-sm font-display",
                        children: v.products,
                      }),
                      _jsxs("td", {
                        className:
                          "px-4 py-3 font-bold text-gray-900 text-sm font-display",
                        children: [
                          "\u20B9",
                          (v.revenue / 1000).toFixed(0),
                          "K",
                        ],
                      }),
                      _jsx("td", {
                        className: "px-4 py-3",
                        children: _jsxs("div", {
                          className: "flex items-center gap-1",
                          children: [
                            _jsx(Star, {
                              size: 12,
                              fill: "#EAB308",
                              className: "text-yellow-500",
                            }),
                            _jsx("span", {
                              className: "text-sm font-semibold",
                              children: v.rating,
                            }),
                          ],
                        }),
                      }),
                      _jsx("td", {
                        className: "px-4 py-3",
                        children: _jsx(Badge, {
                          color: v.status === "Verified" ? "green" : "orange",
                          children: v.status,
                        }),
                      }),
                      _jsx("td", {
                        className: "px-4 py-3",
                        children: _jsxs("div", {
                          className: "flex gap-2",
                          children: [
                            _jsx("button", {
                              className:
                                "text-xs text-indigo-600 font-semibold hover:underline",
                              children: "View",
                            }),
                            v.status === "Pending" &&
                              _jsx("button", {
                                className:
                                  "text-xs text-green-600 font-semibold hover:underline",
                                children: "Approve",
                              }),
                            _jsx("button", {
                              className:
                                "text-xs text-red-500 font-semibold hover:underline",
                              children: "Suspend",
                            }),
                          ],
                        }),
                      }),
                    ],
                  },
                  v.id,
                ),
              ),
            }),
          ],
        }),
      }),
    ],
  })
}
function ManageNGOs() {
  const ngos = [
    {
      id: 1,
      name: "HelpFood NGO",
      contact: "Kavita Sharma",
      location: "Andheri, Mumbai",
      meals: 2480,
      food: 826,
      status: "Active",
    },
    {
      id: 2,
      name: "FoodBank India",
      contact: "Arun Mehta",
      location: "Bandra, Mumbai",
      meals: 1840,
      food: 613,
      status: "Active",
    },
    {
      id: 3,
      name: "Robin Hood Army",
      contact: "Sneha Patel",
      location: "Thane, Mumbai",
      meals: 3120,
      food: 1040,
      status: "Active",
    },
    {
      id: 4,
      name: "Akshaya Patra",
      contact: "Ravi Kumar",
      location: "Pune",
      meals: 980,
      food: 327,
      status: "Pending",
    },
  ]
  return _jsx("div", {
    className: "p-6 space-y-5",
    children: _jsx("div", {
      className: "glass rounded-2xl overflow-hidden",
      children: _jsxs("table", {
        className: "w-full",
        children: [
          _jsx("thead", {
            className: "bg-indigo-50",
            children: _jsx("tr", {
              children: [
                "NGO Name",
                "Contact",
                "Location",
                "Meals Saved",
                "Food Received",
                "Status",
                "Actions",
              ].map((h) =>
                _jsx(
                  "th",
                  {
                    className:
                      "text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider",
                    children: h,
                  },
                  h,
                ),
              ),
            }),
          }),
          _jsx("tbody", {
            className: "divide-y divide-gray-50",
            children: ngos.map((n) =>
              _jsxs(
                "tr",
                {
                  className: "hover:bg-indigo-50/20 transition-colors",
                  children: [
                    _jsx("td", {
                      className:
                        "px-4 py-3 font-semibold text-gray-900 text-sm font-display",
                      children: n.name,
                    }),
                    _jsx("td", {
                      className: "px-4 py-3 text-sm text-gray-600",
                      children: n.contact,
                    }),
                    _jsx("td", {
                      className: "px-4 py-3 text-sm text-gray-600",
                      children: n.location,
                    }),
                    _jsx("td", {
                      className:
                        "px-4 py-3 font-bold text-green-600 text-sm font-display",
                      children: n.meals.toLocaleString(),
                    }),
                    _jsxs("td", {
                      className:
                        "px-4 py-3 font-bold text-teal-600 text-sm font-display",
                      children: [n.food, " kg"],
                    }),
                    _jsx("td", {
                      className: "px-4 py-3",
                      children: _jsx(Badge, {
                        color: n.status === "Active" ? "green" : "orange",
                        children: n.status,
                      }),
                    }),
                    _jsx("td", {
                      className: "px-4 py-3",
                      children: _jsxs("div", {
                        className: "flex gap-2",
                        children: [
                          _jsx("button", {
                            className:
                              "text-xs text-indigo-600 font-semibold hover:underline",
                            children: "View",
                          }),
                          n.status === "Pending" &&
                            _jsx("button", {
                              className:
                                "text-xs text-green-600 font-semibold hover:underline",
                              children: "Approve",
                            }),
                        ],
                      }),
                    }),
                  ],
                },
                n.id,
              ),
            ),
          }),
        ],
      }),
    }),
  })
}
function Analytics() {
  return _jsxs("div", {
    className: "p-6 space-y-6",
    children: [
      _jsxs("div", {
        className: "grid grid-cols-2 md:grid-cols-4 gap-4",
        children: [
          _jsx(StatCard, {
            icon: _jsx(TrendingUp, { size: 22 }),
            label: "Platform Revenue",
            value: "\u20B942.5L",
            sub: "\u2191 9.2% YTD",
            color: "#3949AB",
            bg: "#E8EAF6",
          }),
          _jsx(StatCard, {
            icon: _jsx(Users, { size: 22 }),
            label: "User Growth",
            value: "+1,050",
            sub: "This month",
            color: "#3949AB",
            bg: "#E8EAF6",
          }),
          _jsx(StatCard, {
            icon: _jsx(Package, { size: 22 }),
            label: "Waste Reduced",
            value: "87,500 kg",
            sub: "Total so far",
            color: "#2E7D32",
            bg: "#E8F5E9",
          }),
          _jsx(StatCard, {
            icon: _jsx("span", {
              className: "text-lg",
              children: "\uD83C\uDF7D\uFE0F",
            }),
            label: "Meals Saved",
            value: "1,25,000",
            sub: "Platform total",
            color: "#FF9800",
            bg: "#FFF3E0",
          }),
        ],
      }),
      _jsxs("div", {
        className: "glass rounded-2xl p-5",
        children: [
          _jsx(SectionTitle, {
            sub: "Monthly revenue trend",
            children: "Revenue Analytics",
          }),
          _jsx(ResponsiveContainer, {
            width: "100%",
            height: 240,
            children: _jsxs(AreaChart, {
              data: revenueData,
              children: [
                _jsx("defs", {
                  children: _jsxs("linearGradient", {
                    id: "adminRev",
                    x1: "0",
                    y1: "0",
                    x2: "0",
                    y2: "1",
                    children: [
                      _jsx("stop", {
                        offset: "5%",
                        stopColor: "#3949AB",
                        stopOpacity: 0.3,
                      }),
                      _jsx("stop", {
                        offset: "95%",
                        stopColor: "#3949AB",
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
                  tickFormatter: (v) => `₹${v / 1000}k`,
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
                  dataKey: "revenue",
                  stroke: "#3949AB",
                  strokeWidth: 2.5,
                  fill: "url(#adminRev)",
                  name: "Revenue (\u20B9)",
                }),
              ],
            }),
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
                sub: "Order volume by month",
                children: "Order Statistics",
              }),
              _jsx(ResponsiveContainer, {
                width: "100%",
                height: 180,
                children: _jsxs(BarChart, {
                  data: revenueData,
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
                      dataKey: "orders",
                      fill: "#3949AB",
                      radius: [6, 6, 0, 0],
                      name: "Orders",
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
                sub: "Customer growth",
                children: "Customer Growth",
              }),
              _jsx(ResponsiveContainer, {
                width: "100%",
                height: 180,
                children: _jsxs(LineChart, {
                  data: growthData,
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
                      tickFormatter: (v) => `${(v / 1000).toFixed(0)}k`,
                    }),
                    _jsx(Tooltip, {
                      contentStyle: {
                        borderRadius: 12,
                        border: "none",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      },
                    }),
                    _jsx(Line, {
                      type: "monotone",
                      dataKey: "users",
                      stroke: "#2E7D32",
                      strokeWidth: 2.5,
                      dot: { fill: "#2E7D32", r: 4 },
                      name: "Customers",
                    }),
                  ],
                }),
              }),
            ],
          }),
        ],
      }),
    ],
  })
}
function Complaints() {
  const complaints = [
    {
      id: "COMP-001",
      user: "devansh chouhan",
      type: "Order",
      subject: "Product quality issue — received overripe mangoes",
      date: "Aug 5, 2026",
      status: "Open",
      priority: "High",
    },
    {
      id: "COMP-002",
      user: "Prachi Joshi",
      type: "Vendor",
      subject: "Vendor did not deliver on time",
      date: "Aug 4, 2026",
      status: "In Progress",
      priority: "Medium",
    },
    {
      id: "COMP-003",
      user: "Rohan Mehta",
      type: "Payment",
      subject: "Refund not received after cancellation",
      date: "Aug 3, 2026",
      status: "Resolved",
      priority: "High",
    },
    {
      id: "COMP-004",
      user: "Anjali Patel",
      type: "App",
      subject: "App crashes when adding to cart",
      date: "Aug 2, 2026",
      status: "Open",
      priority: "Low",
    },
  ]
  const priorityColors = { High: "red", Medium: "orange", Low: "green" }
  const statusColors = {
    Open: "red",
    "In Progress": "orange",
    Resolved: "green",
  }
  return _jsx("div", {
    className: "p-6 space-y-4",
    children: complaints.map((c) =>
      _jsxs(
        "div",
        {
          className: "glass rounded-2xl p-5",
          children: [
            _jsxs("div", {
              className: "flex items-start justify-between mb-2",
              children: [
                _jsxs("div", {
                  children: [
                    _jsxs("div", {
                      className: "flex items-center gap-2 mb-1",
                      children: [
                        _jsx("span", {
                          className:
                            "text-xs font-bold text-gray-500 font-display",
                          children: c.id,
                        }),
                        _jsx(Badge, {
                          color: priorityColors[c.priority],
                          children: c.priority,
                        }),
                      ],
                    }),
                    _jsx("h4", {
                      className: "font-bold text-gray-900 font-display text-sm",
                      children: c.subject,
                    }),
                    _jsxs("p", {
                      className: "text-xs text-gray-500 mt-0.5",
                      children: [
                        c.user,
                        " \u00B7 ",
                        c.type,
                        " \u00B7 ",
                        c.date,
                      ],
                    }),
                  ],
                }),
                _jsx(Badge, {
                  color: statusColors[c.status],
                  children: c.status,
                }),
              ],
            }),
            _jsxs("div", {
              className: "flex gap-2 mt-3",
              children: [
                _jsx("button", {
                  className:
                    "text-sm text-indigo-600 font-semibold border border-indigo-200 px-3 py-1.5 rounded-xl hover:bg-indigo-50",
                  children: "View Details",
                }),
                c.status !== "Resolved" &&
                  _jsx("button", {
                    className:
                      "text-sm text-green-600 font-semibold border border-green-200 px-3 py-1.5 rounded-xl hover:bg-green-50",
                    children: "Mark Resolved",
                  }),
              ],
            }),
          ],
        },
        c.id,
      ),
    ),
  })
}
function Reports() {
  const reports = [
    {
      label: "Monthly Revenue Report",
      period: "August 2026",
      size: "2.4 MB",
      icon: "📊",
    },
    {
      label: "Food Waste Reduction Report",
      period: "Q2 2026",
      size: "1.8 MB",
      icon: "♻️",
    },
    {
      label: "Donation Impact Report",
      period: "August 2026",
      size: "1.2 MB",
      icon: "🤝",
    },
    {
      label: "Top Vendor Performance",
      period: "Q2 2026",
      size: "3.1 MB",
      icon: "🏪",
    },
    {
      label: "Customer Analytics Report",
      period: "August 2026",
      size: "2.7 MB",
      icon: "👥",
    },
    {
      label: "AI Freshness Accuracy Report",
      period: "Q2 2026",
      size: "1.5 MB",
      icon: "🤖",
    },
  ]
  return _jsx("div", {
    className: "p-6 space-y-4",
    children: _jsx("div", {
      className: "grid grid-cols-2 md:grid-cols-3 gap-4",
      children: reports.map((r) =>
        _jsxs(
          "div",
          {
            className:
              "glass rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer",
            children: [
              _jsx("p", { className: "text-4xl mb-3", children: r.icon }),
              _jsx("h4", {
                className: "font-bold text-gray-900 font-display text-sm",
                children: r.label,
              }),
              _jsxs("p", {
                className: "text-xs text-gray-500 mt-1",
                children: [r.period, " \u00B7 ", r.size],
              }),
              _jsxs("button", {
                className:
                  "mt-3 text-indigo-600 text-xs font-semibold flex items-center gap-1 hover:text-indigo-700",
                children: ["Download PDF ", _jsx(ChevronRight, { size: 12 })],
              }),
            ],
          },
          r.label,
        ),
      ),
    }),
  })
}
function ManageOrders() {
  const orders = [
    {
      id: "CF-2026-4521",
      customer: "devansh chouhan",
      vendor: "Green Valley Farms",
      total: 485,
      date: "Aug 5, 2026",
      status: "Delivered",
    },
    {
      id: "CF-2026-4498",
      customer: "Prachi Joshi",
      vendor: "Organic Roots",
      total: 248,
      date: "Aug 5, 2026",
      status: "Out For Delivery",
    },
    {
      id: "CF-2026-4475",
      customer: "Rohan Mehta",
      vendor: "Sunrise Gardens",
      total: 672,
      date: "Aug 5, 2026",
      status: "Confirmed",
    },
    {
      id: "CF-2026-4450",
      customer: "Anjali Patel",
      vendor: "Exotic Greens",
      total: 259,
      date: "Aug 4, 2026",
      status: "Delivered",
    },
    {
      id: "CF-2026-4420",
      customer: "Vikas Gupta",
      vendor: "Berry Bliss",
      total: 188,
      date: "Aug 3, 2026",
      status: "Cancelled",
    },
  ]
  const statusColors = {
    Delivered: "green",
    "Out For Delivery": "orange",
    Confirmed: "blue",
    Cancelled: "red",
    Pending: "yellow",
  }
  return _jsx("div", {
    className: "p-6 space-y-5",
    children: _jsx("div", {
      className: "glass rounded-2xl overflow-hidden",
      children: _jsxs("table", {
        className: "w-full",
        children: [
          _jsx("thead", {
            className: "bg-indigo-50",
            children: _jsx("tr", {
              children: [
                "Order ID",
                "Customer",
                "Vendor",
                "Total",
                "Date",
                "Status",
                "Actions",
              ].map((h) =>
                _jsx(
                  "th",
                  {
                    className:
                      "text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider",
                    children: h,
                  },
                  h,
                ),
              ),
            }),
          }),
          _jsx("tbody", {
            className: "divide-y divide-gray-50",
            children: orders.map((o) =>
              _jsxs(
                "tr",
                {
                  className: "hover:bg-indigo-50/20 transition-colors",
                  children: [
                    _jsx("td", {
                      className:
                        "px-4 py-3 font-bold text-indigo-600 text-sm font-display",
                      children: o.id,
                    }),
                    _jsx("td", {
                      className: "px-4 py-3 text-sm text-gray-700",
                      children: o.customer,
                    }),
                    _jsx("td", {
                      className: "px-4 py-3 text-sm text-gray-600",
                      children: o.vendor,
                    }),
                    _jsxs("td", {
                      className:
                        "px-4 py-3 font-bold text-gray-900 text-sm font-display",
                      children: ["\u20B9", o.total],
                    }),
                    _jsx("td", {
                      className: "px-4 py-3 text-sm text-gray-500",
                      children: o.date,
                    }),
                    _jsx("td", {
                      className: "px-4 py-3",
                      children: _jsx(Badge, {
                        color: statusColors[o.status],
                        children: o.status,
                      }),
                    }),
                    _jsx("td", {
                      className: "px-4 py-3",
                      children: _jsx("button", {
                        className:
                          "text-xs text-indigo-600 font-semibold hover:underline",
                        children: "View Details",
                      }),
                    }),
                  ],
                },
                o.id,
              ),
            ),
          }),
        ],
      }),
    }),
  })
}
function LiveAdminDashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    getAdminStats().then(setStats).catch((requestError) => setError(requestError.message))
  }, [])

  if (error) return _jsx("p", { role: "alert", className: "p-6 text-red-600", children: error })
  if (!stats) return _jsx("p", { className: "p-6 text-gray-500", children: "Loading platform data..." })

  return _jsxs("div", {
    className: "p-6 space-y-6",
    children: [
      _jsx("h2", { className: "text-2xl font-bold", children: "Platform overview" }),
      _jsxs("div", {
        className: "grid grid-cols-2 gap-4",
        children: [
          _jsx(StatCard, { icon: _jsx(Users, { size: 22 }), label: "Customers", value: stats.totalCustomers }),
          _jsx(StatCard, { icon: _jsx(Package, { size: 22 }), label: "Vendors", value: stats.totalVendors }),
          _jsx(StatCard, { icon: _jsx(ShoppingCart, { size: 22 }), label: "Orders", value: stats.totalOrders }),
          _jsx(StatCard, { icon: _jsx(TrendingUp, { size: 22 }), label: "Products", value: stats.totalProducts }),
        ],
      }),
      _jsx(StatCard, { icon: _jsx(TrendingUp, { size: 22 }), label: "Revenue from paid orders", value: `₹${stats.revenue.toLocaleString()}` }),
    ],
  })
}

function LiveAdminUsers({ role }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    api.get(`/api/admin/users?role=${role}`)
      .then(setUsers)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [role])

  if (loading) return _jsx("p", { className: "p-6 text-gray-500", children: "Loading accounts..." })
  if (error) return _jsx("p", { role: "alert", className: "p-6 text-red-600", children: error })
  if (!users.length) return _jsx("p", { className: "p-6 text-gray-500", children: `No ${role} accounts.` })

  return _jsx("div", {
    className: "p-6 space-y-3",
    children: users.map((user) => _jsxs("article", {
      className: "glass rounded-xl p-4 flex items-center justify-between gap-4",
      children: [
        _jsxs("div", { children: [_jsx("h3", { className: "font-semibold", children: user.businessName || user.ngoName || user.name }), _jsx("p", { className: "text-sm text-gray-600", children: user.email }), _jsx("p", { className: "text-xs text-gray-500", children: user.status })] }),
        role === "delivery_partner" && _jsx("button", {
          className: "rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700",
          onClick: async () => {
            try {
              const result = user.deliveryPartnerProfile?.approvalStatus !== "APPROVED"
                ? await api.patch(`/api/admin/delivery-partners/${user._id}/approval`, { approvalStatus: "APPROVED" })
                : await api.patch(`/api/admin/users/${user._id}/status`, { status: user.status === "Active" ? "Suspended" : "Active" })
              setUsers((records) => records.map((record) => record._id === user._id ? result.user : record))
            } catch (requestError) {
              setError(requestError.message)
            }
          },
          children: user.deliveryPartnerProfile?.approvalStatus !== "APPROVED"
            ? "Approve partner"
            : user.status === "Active" ? "Suspend" : "Activate partner",
        }),
        role === "vendor" && _jsx("button", {
          className: "text-sm font-semibold text-green-700",
          onClick: async () => {
            try {
              const updated = await api.patch(`/api/admin/vendors/${user._id}/verify`, { verified: !user.verified })
              setUsers((records) => records.map((record) => record._id === updated._id ? updated : record))
            } catch (requestError) {
              setError(requestError.message)
            }
          },
          children: user.verified ? "Unverify" : "Verify",
        }),
      ],
    }, user._id)),
  })
}

function LiveAdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    api.get("/api/admin/products")
      .then(setProducts)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return _jsx("p", { className: "p-6 text-gray-500", children: "Loading products..." })
  if (error) return _jsx("p", { role: "alert", className: "p-6 text-red-600", children: error })
  if (!products.length) return _jsx("p", { className: "p-6 text-gray-500", children: "No products." })

  return _jsx("div", {
    className: "p-6 space-y-3",
    children: products.map((product) => _jsxs("article", {
      className: "glass rounded-xl p-4 flex items-center justify-between gap-4",
      children: [
        _jsxs("div", { children: [_jsx("h3", { className: "font-semibold", children: product.name }), _jsx("p", { className: "text-sm text-gray-600", children: product.vendor?.businessName || product.vendor?.name || "Vendor unavailable" })] }),
        _jsxs("div", { className: "text-right text-sm", children: [_jsx("p", { children: `₹${product.discountedPrice}` }), _jsx("p", { className: "text-gray-500", children: `Stock: ${product.stock}` })] }),
      ],
    }, product._id)),
  })
}

function LiveAdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  useEffect(() => {
    api.get("/api/admin/orders")
      .then(setOrders)
      .catch((requestError) => setLoadError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return _jsx("p", { className: "p-6 text-gray-500", children: "Loading orders..." })
  if (loadError) return _jsx("p", { role: "alert", className: "p-6 text-red-600", children: loadError })
  if (!orders.length) return _jsx("p", { className: "p-6 text-gray-500", children: "No orders yet." })

  return (
    <div className="space-y-3 p-6">
      {orders.map((order) => {
        return (
          <article key={order._id} className="glass rounded-xl p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{order.orderId}</h3>
                <p className="text-sm text-gray-600">{order.user?.name || "Customer"}</p>
                <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₹{order.total}</p>
                <Badge color="orange">{order.status}</Badge>
                {order.deliveryPartner?.user && (
                  <p className="mt-1 text-xs text-gray-500">
                    {order.deliveryPartner.name} · ₹{order.deliveryPartner.earnings} est.
                  </p>
                )}
                {order.status === "Packed" && !order.deliveryPartner?.user && (
                  <p className="mt-1 text-xs text-gray-500">Waiting for a delivery partner to select this order.</p>
                )}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function LiveDeliveryPayouts() {
  const [orders, setOrders] = useState([])
  const [references, setReferences] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingOrder, setSavingOrder] = useState("")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const refreshPayouts = () => api.get("/api/admin/delivery-payouts").then(setOrders)

  useEffect(() => {
    refreshPayouts()
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  const markPaid = async (order) => {
    if (!window.confirm(`Confirm you have paid ₹${order.deliveryPartner?.earnings || 0} to ${order.deliveryPartner?.name || "this delivery partner"} for order ${order.orderId}?`)) return
    setSavingOrder(order._id)
    setError("")
    setNotice("")
    try {
      const updated = await api.patch(`/api/admin/orders/${order._id}/delivery-payout`, {
        reference: references[order._id] || "",
      })
      setOrders((current) => current.map((item) => item._id === updated._id ? updated : item))
      setNotice(`Payout recorded as paid for order ${order.orderId}.`)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingOrder("")
    }
  }

  if (loading) return _jsx("p", { className: "p-6 text-gray-500", children: "Loading delivery payouts..." })
  if (error && !orders.length) return _jsx("p", { role: "alert", className: "p-6 text-red-600", children: error })

  const payable = orders
    .filter((order) => order.deliveryPartner?.earningsStatus === "Payable")
    .reduce((sum, order) => sum + (order.deliveryPartner?.earnings || 0), 0)
  const paid = orders
    .filter((order) => order.deliveryPartner?.earningsStatus === "Paid")
    .reduce((sum, order) => sum + (order.deliveryPartner?.earnings || 0), 0)

  return _jsxs("section", {
    className: "space-y-4 p-6",
    children: [
      _jsxs("div", {
        className: "grid gap-4 sm:grid-cols-2",
        children: [
          _jsx(StatCard, { icon: _jsx(Wallet, { size: 22 }), label: "Awaiting payout", value: `₹${payable.toLocaleString()}` }),
          _jsx(StatCard, { icon: _jsx(Truck, { size: 22 }), label: "Recorded as paid", value: `₹${paid.toLocaleString()}` }),
        ],
      }),
      _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: "Make the transfer outside this app first, then record it here. Recording a payout does not move money automatically." }),
      error && _jsx("p", { role: "alert", className: "rounded-xl bg-red-50 p-3 text-sm text-red-700", children: error }),
      notice && _jsx("p", { role: "status", className: "rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800", children: notice }),
      !orders.length && _jsx("p", { className: "glass rounded-xl p-6 text-gray-500", children: "No completed delivery earnings are due or recorded yet." }),
      orders.map((order) => _jsxs("article", {
        className: "glass flex flex-wrap items-center justify-between gap-4 rounded-xl p-4",
        children: [
          _jsxs("div", {
            children: [
              _jsx("h3", { className: "font-semibold", children: `${order.orderId} · ₹${order.deliveryPartner?.earnings || 0}` }),
              _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: `${order.deliveryPartner?.name || order.deliveryPartner?.user?.name || "Delivery partner"} · ${order.deliveryPartner?.phone || order.deliveryPartner?.user?.phone || "No phone saved"}` }),
              _jsx("p", { className: "text-xs text-gray-500", children: `${order.deliveryPartner?.distanceKm || 0} km · Delivered ${new Date(order.updatedAt).toLocaleDateString()}` }),
              order.deliveryPartner?.earningsStatus === "Paid" && _jsx("p", { className: "mt-1 text-xs text-gray-500", children: `Paid ${order.deliveryPartner?.paidAt ? new Date(order.deliveryPartner.paidAt).toLocaleString() : ""}${order.deliveryPartner?.payoutReference ? ` · Ref: ${order.deliveryPartner.payoutReference}` : ""}` }),
            ],
          }),
          order.deliveryPartner?.earningsStatus === "Payable"
            ? _jsxs("div", {
                className: "flex flex-wrap items-center gap-2",
                children: [
                  _jsx("input", {
                    value: references[order._id] || "",
                    onChange: (event) => setReferences((current) => ({ ...current, [order._id]: event.target.value })),
                    maxLength: 100,
                    placeholder: "Transfer reference (optional)",
                    "aria-label": `Transfer reference for ${order.orderId}`,
                    className: "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm",
                  }),
                  _jsx("button", {
                    type: "button",
                    disabled: savingOrder === order._id,
                    onClick: () => markPaid(order),
                    className: "rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50",
                    children: savingOrder === order._id ? "Saving..." : "Record as paid",
                  }),
                ],
              })
            : _jsx("span", { className: "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700", children: "Paid" }),
        ],
      }, order._id)),
    ],
  })
}

function LiveAdminAnalytics() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    getAdminStats().then(setStats).catch((requestError) => setError(requestError.message))
  }, [])

  if (error) return _jsx("p", { role: "alert", className: "p-6 text-red-600", children: error })
  if (!stats) return _jsx("p", { className: "p-6 text-gray-500", children: "Loading analytics..." })
  if (!stats.trendData.length) return _jsx("p", { className: "p-6 text-gray-500", children: "No analytics data yet." })

  return _jsx("div", {
    className: "p-6",
    children: _jsx("section", {
      className: "glass rounded-xl p-5",
      children: _jsxs(ResponsiveContainer, {
        width: "100%",
        height: 280,
        children: [
          _jsx(AreaChart, { data: stats.trendData, children: [_jsx(XAxis, { dataKey: "month" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Area, { type: "monotone", dataKey: "revenue", stroke: "#2E7D32", fill: "#A5D6A7", name: "Paid revenue" })] }),
        ],
      }),
    }),
  })
}

function AdminUnavailable({ name }) {
  return _jsx("p", { className: "p-6 text-gray-500", children: `${name} is not connected to a backend service.` })
}

function AdminSettings({ dark, toggleDark, accent, setAccent, language, setLanguage, t }) {
  return _jsx("section", {
    className: "p-6",
    children: _jsxs("div", {
      className: "glass max-w-xl space-y-4 rounded-xl p-5",
      children: [
        _jsx("h2", { className: "font-semibold text-gray-900 dark:text-gray-100", children: t("appearance") }),
        _jsx(PreferenceControls, {
          dark,
          onToggleDark: toggleDark,
          accent,
          onAccentChange: setAccent,
          language,
          onLanguageChange: setLanguage,
          t,
          compact: true,
        }),
      ],
    }),
  })
}

export default function AdminPortal({ onLogout }) {
  const [page, setPage] = useState("dashboard")
  const { dark, toggleDark, accent, setAccent } = usePortalTheme()
  const { language, setLanguage, t } = useLanguage()
  const pages = {
    dashboard: _jsx(LiveAdminDashboard, {}),
    users: _jsx(LiveAdminUsers, { role: "customer" }),
    vendors: _jsx(LiveAdminUsers, { role: "vendor" }),
    "delivery-partners": _jsx(LiveAdminUsers, { role: "delivery_partner" }),
    "delivery-payouts": _jsx(LiveDeliveryPayouts, {}),
    ngos: _jsx(LiveAdminUsers, { role: "ngo" }),
    products: _jsx(LiveAdminProducts, {}),
    orders: _jsx(LiveAdminOrders, {}),
    analytics: _jsx(LiveAdminAnalytics, {}),
    reports: _jsx(AdminReports, {}),
    complaints: _jsx(AdminComplaints, {}),
    settings: _jsx(AdminSettings, {
      dark,
      toggleDark,
      accent,
      setAccent,
      language,
      setLanguage,
      t,
    }),
  }
  return _jsxs("div", {
    className: dark ? "dark flex h-dvh min-h-0 overflow-hidden bg-[#0B1220]" : "flex h-dvh min-h-0 overflow-hidden bg-gray-50",
    children: [
      _jsx(Sidebar, { page, setPage, onLogout, t }),
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
          }),
          _jsx("main", {
            className: "min-h-0 flex-1 overflow-y-auto overscroll-contain",
            children: pages[page],
          }),
        ],
      }),
    ],
  })
}

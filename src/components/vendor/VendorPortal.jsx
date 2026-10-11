import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime"
import { useCallback, useState, useEffect } from "react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import {
  Package,
  TrendingUp,
  Users,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Home,
  Settings,
  Bell,
  ChevronRight,
  CheckCircle,
  Upload,
  BarChart2,
  Heart,
  Zap,
} from "lucide-react"
import {
  vendorInventory,
  revenueData,
  categoryData,
  wasteData,
  donations,
} from "../../data/mockData"
import { Badge, FreshnessRing, StatCard, SectionTitle } from "../shared/ui"
import {
  getVendorInventory,
  createProduct as apiCreateProduct,
  deleteProduct as apiDeleteProduct,
  updateProduct as apiUpdateProduct,
  scanFreshness as apiScanFreshness,
} from "../../api/vendor"
import { createDonation, getMyDonations } from "../../api/donations"
import { api } from "../../api/client"
import ProfilePhotoUpload from "../shared/ProfilePhotoUpload"
import ProfileDetailsForm from "../shared/ProfileDetailsForm"
import usePortalTheme from "../shared/usePortalTheme"
import PreferenceControls from "../shared/PreferenceControls"
import useLanguage from "../shared/useLanguage"
import TranslatedContent from "../shared/TranslatedContent"
import VendorProductSetup from "./VendorProductSetup"
import SupportFeedback from "../shared/SupportFeedback"
function Sidebar({ page, setPage, onLogout, t }) {
  const links = [
    { id: "dashboard", icon: _jsx(Home, { size: 18 }), label: "Dashboard" },
    { id: "inventory", icon: _jsx(Package, { size: 18 }), label: "Inventory" },
    { id: "add-product", icon: _jsx(Plus, { size: 18 }), label: "Add Product" },
    { id: "orders", icon: _jsx(CheckCircle, { size: 18 }), label: "Orders" },
    { id: "notifications", icon: _jsx(Bell, { size: 18 }), label: "Notifications" },
    {
      id: "analytics",
      icon: _jsx(BarChart2, { size: 18 }),
      label: "Analytics",
    },
    { id: "donations", icon: _jsx(Heart, { size: 18 }), label: "Donations" },
    { id: "profile", icon: _jsx(Users, { size: 18 }), label: "Profile" },
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
              "w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center",
            children: _jsx("span", {
              className: "text-white text-lg",
              children: "\uD83C\uDFEA",
            }),
          }),
          _jsx("span", {
            className: "text-lg font-bold font-display text-white",
            children: "Vendor Portal",
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
                  : "text-white/80 hover:text-white"
              }`,
              children: [l.icon, _jsx("span", { children: t(l.label) })],
            },
            l.id,
          ),
        ),
      }),
      _jsxs("div", {
        className: "flex-shrink-0 pt-4 border-t border-orange-800/40",
        children: [
          _jsxs("div", {
            className: "flex items-center gap-3 mb-3 px-2",
            children: [
              _jsx("div", {
                className:
                  "w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold font-display",
                children: "V",
              }),
              _jsxs("div", {
                children: [
                  _jsx("p", {
                    className: "text-white text-sm font-bold font-display",
                    children: "Vendor account",
                  }),
                  _jsx("p", {
                    className: "text-white/80 text-xs font-semibold",
                    children: "Vendor",
                  }),
                ],
              }),
            ],
          }),
          _jsxs("button", {
            onClick: onLogout,
            className:
              "sidebar-link w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-red-100 hover:text-white",
            children: [_jsx(LogOut, { size: 16 }), " Logout"],
          }),
        ],
      }),
    ],
  })
}
function TopNav({ page, dark, onToggleDark, accent, setAccent, language, setLanguage, t, setPage, user, unreadCount }) {
  const titles = {
    dashboard: "Vendor Dashboard",
    inventory: "Inventory Management",
    "add-product": "Add New Product",
    orders: "Order Management",
    notifications: "Notifications",
    analytics: "Sales Analytics",
    "ai-suggestions": "AI Suggestions",
    donations: "Donation Center",
    profile: "Vendor Profile",
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
          _jsxs("button", {
            type: "button",
            onClick: () => setPage("notifications"),
            "aria-label": unreadCount ? t(`Notifications, ${unreadCount} unread`) : t("Notifications"),
            className: "relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10",
            children: [
              _jsx(Bell, { size: 18 }),
              unreadCount > 0 && _jsx("span", {
                className: "absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white",
                children: unreadCount > 99 ? "99+" : unreadCount,
              }),
            ],
          }),
          _jsx("button", {
            type: "button",
            onClick: () => setPage("profile"),
            "aria-label": t("Open profile"),
            className: "w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center font-bold text-green-700 font-display",
            children: user?.avatar
              ? _jsx("img", {
                  src: user.avatar,
                  alt: "",
                  className: "h-full w-full rounded-xl object-cover",
                })
              : "V",
          }),
        ],
      }),
    ],
  })
}
function Dashboard({ setPage }) {
  const lowStock = vendorInventory.filter((i) => i.status === "Low Stock")
  const nearExpiry = vendorInventory.filter((i) => i.status === "Near Expiry")
  const expired = vendorInventory.filter((i) => i.status === "Expired")
  return _jsxs("div", {
    className: "p-6 space-y-8",
    children: [
      _jsxs("div", {
        style: { background: "linear-gradient(135deg, #E65100, #F57C00)" },
        className: "rounded-2xl p-6 hero-pattern",
        children: [
          _jsx("p", {
            className: "text-white/90 text-sm mb-1 font-semibold",
            children: "Good Morning \uD83C\uDF3F",
          }),
          _jsx("h2", {
            className: "text-2xl font-black text-white font-display",
            children: "Welcome, Green Valley Farms! \uD83D\uDC4B",
          }),
          _jsxs("p", {
            className: "text-white/90 text-sm mt-1 font-medium",
            children: [
              "Today's revenue: ",
              _jsx("strong", {
                className: "text-white font-black",
                children: "\u20B98,240",
              }),
              " \u00B7 32 new orders",
            ],
          }),
          _jsxs("div", {
            className: "flex gap-3 mt-4",
            children: [
              _jsxs("button", {
                onClick: () => setPage("add-product"),
                className:
                  "bg-white text-orange-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-orange-50 transition-all flex items-center gap-2",
                children: [_jsx(Plus, { size: 14 }), " Add Product"],
              }),
              _jsx("button", {
                onClick: () => setPage("orders"),
                className:
                  "bg-white/20 text-white text-sm px-4 py-2 rounded-xl font-medium",
                children: "Manage Orders",
              }),
            ],
          }),
        ],
      }),
      _jsxs("div", {
        className: "grid grid-cols-2 md:grid-cols-4 gap-4",
        children: [
          _jsx(StatCard, {
            icon: _jsx(TrendingUp, { size: 22 }),
            label: "Today's Revenue",
            value: "\u20B98,240",
            sub: "\u2191 18% from yesterday",
            color: "#FF9800",
            bg: "#FFF3E0",
          }),
          _jsx(StatCard, {
            icon: _jsx(Package, { size: 22 }),
            label: "Today's Orders",
            value: "32",
            sub: "12 pending",
            color: "#FF9800",
            bg: "#FFF3E0",
          }),
          _jsx(StatCard, {
            icon: _jsx(Users, { size: 22 }),
            label: "Customers",
            value: "288",
            sub: "\u2191 24 new today",
            color: "#FF9800",
            bg: "#FFF3E0",
          }),
          _jsx(StatCard, {
            icon: _jsx(AlertTriangle, { size: 22 }),
            label: "Alerts",
            value: String(lowStock.length + nearExpiry.length + expired.length),
            sub: "Need attention",
            color: "#E53E3E",
            bg: "#FFF5F5",
          }),
        ],
      }),
      (lowStock.length > 0 || nearExpiry.length > 0 || expired.length > 0) &&
        _jsxs("div", {
          className: "grid md:grid-cols-3 gap-4",
          children: [
            lowStock.length > 0 &&
              _jsxs("div", {
                className:
                  "border-l-4 border-orange-400 bg-orange-50 rounded-xl p-4",
                children: [
                  _jsxs("p", {
                    className:
                      "font-bold text-orange-700 font-display text-sm mb-2",
                    children: ["\u26A0 Low Stock (", lowStock.length, ")"],
                  }),
                  lowStock.map((i) =>
                    _jsxs(
                      "p",
                      {
                        className: "text-xs text-orange-600",
                        children: [i.name, " \u2014 ", i.stock, " left"],
                      },
                      i.id,
                    ),
                  ),
                  _jsx("button", {
                    onClick: () => setPage("inventory"),
                    className:
                      "text-xs text-orange-600 font-bold mt-2 hover:underline",
                    children: "Restock now \u2192",
                  }),
                ],
              }),
            nearExpiry.length > 0 &&
              _jsxs("div", {
                className:
                  "border-l-4 border-yellow-400 bg-yellow-50 rounded-xl p-4",
                children: [
                  _jsxs("p", {
                    className:
                      "font-bold text-yellow-700 font-display text-sm mb-2",
                    children: [
                      "\uD83D\uDD52 Near Expiry (",
                      nearExpiry.length,
                      ")",
                    ],
                  }),
                  nearExpiry.map((i) =>
                    _jsxs(
                      "p",
                      {
                        className: "text-xs text-yellow-700",
                        children: [i.name, " \u2014 expires ", i.expiryDate],
                      },
                      i.id,
                    ),
                  ),
                  _jsx("button", {
                    onClick: () => setPage("ai-suggestions"),
                    className:
                      "text-xs text-yellow-700 font-bold mt-2 hover:underline",
                    children: "Get AI discount \u2192",
                  }),
                ],
              }),
            expired.length > 0 &&
              _jsxs("div", {
                className: "border-l-4 border-red-400 bg-red-50 rounded-xl p-4",
                children: [
                  _jsxs("p", {
                    className:
                      "font-bold text-red-700 font-display text-sm mb-2",
                    children: ["\uD83D\uDEAB Expired (", expired.length, ")"],
                  }),
                  expired.map((i) =>
                    _jsxs(
                      "p",
                      {
                        className: "text-xs text-red-600",
                        children: [i.name, " \u2014 donate or dispose"],
                      },
                      i.id,
                    ),
                  ),
                  _jsx("button", {
                    onClick: () => setPage("donations"),
                    className:
                      "text-xs text-red-600 font-bold mt-2 hover:underline",
                    children: "Donate to NGO \u2192",
                  }),
                ],
              }),
          ],
        }),
      _jsxs("div", {
        className: "glass rounded-2xl p-5",
        children: [
          _jsx(SectionTitle, {
            sub: "Monthly revenue trend",
            children: "Revenue Overview",
          }),
          _jsx(ResponsiveContainer, {
            width: "100%",
            height: 200,
            children: _jsxs(AreaChart, {
              data: revenueData,
              children: [
                _jsx("defs", {
                  children: _jsxs("linearGradient", {
                    id: "vendorRev",
                    x1: "0",
                    y1: "0",
                    x2: "0",
                    y2: "1",
                    children: [
                      _jsx("stop", {
                        offset: "5%",
                        stopColor: "#FF9800",
                        stopOpacity: 0.3,
                      }),
                      _jsx("stop", {
                        offset: "95%",
                        stopColor: "#FF9800",
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
                  stroke: "#FF9800",
                  strokeWidth: 2.5,
                  fill: "url(#vendorRev)",
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
                sub: "Sales by category",
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
          _jsxs("div", {
            className: "glass rounded-2xl p-5",
            children: [
              _jsx(SectionTitle, {
                sub: "Food waste reduction",
                children: "Waste Analytics",
              }),
              _jsx(ResponsiveContainer, {
                width: "100%",
                height: 140,
                children: _jsxs(BarChart, {
                  data: wasteData,
                  children: [
                    _jsx(XAxis, {
                      dataKey: "week",
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
                      dataKey: "donated",
                      fill: "#2E7D32",
                      radius: [4, 4, 0, 0],
                      name: "Donated",
                    }),
                    _jsx(Bar, {
                      dataKey: "saved",
                      fill: "#FF9800",
                      radius: [4, 4, 0, 0],
                      name: "Saved",
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
function Inventory({ setPage, setEditingProduct }) {
  const { t } = useLanguage()
  const [filter, setFilter] = useState("All")
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const filters = ["All", "In Stock", "Low Stock", "Out of Stock"]
  const load = () => {
    setLoading(true)
    getVendorInventory()
      .then(setItems)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load inventory",
        ),
      )
      .finally(() => setLoading(false))
  }
  useEffect(load, [])
  const handleDelete = async (id) => {
    if (!confirm("Remove this product from your inventory?")) return
    try {
      await apiDeleteProduct(id)
      setItems((prev) => prev.filter((i) => i._id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed")
    }
  }
  const filtered =
    filter === "All" ? items : items.filter((i) => i.stockStatus === filter)
  const statusColors = {
    "In Stock": "green",
    "Low Stock": "orange",
    "Out of Stock": "red",
  }
  return _jsxs("div", {
    className: "p-6 space-y-5",
    children: [
      _jsxs("div", {
        className: "flex items-center justify-between",
        children: [
          _jsx("div", {
            className: "flex gap-2",
            children: filters.map((f) =>
              _jsx(
                "button",
                {
                  onClick: () => setFilter(f),
                  className: `px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filter === f
                      ? "btn-orange text-white"
                      : "glass text-gray-600 hover:text-orange-600"
                  }`,
                  children: t(f),
                },
                f,
              ),
            ),
          }),
          _jsxs("button", {
            onClick: () => setPage("add-product"),
            className:
              "btn-orange text-white font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2",
            children: [_jsx(Plus, { size: 14 }), " Add Product"],
          }),
        ],
      }),
      loading
        ? _jsx("div", {
            className: "text-center py-16 text-gray-400",
            children: "Loading inventory...",
          })
        : error
          ? _jsx("div", {
              className: "text-center py-16 text-red-500 text-sm",
              children: error,
            })
          : filtered.length === 0
            ? _jsx("div", {
                className: "text-center py-16 text-gray-400",
                children: "No products in this category yet.",
              })
            : _jsx("div", {
                className: "glass rounded-2xl overflow-x-auto",
                children: _jsxs("table", {
                  className: "w-full min-w-[900px]",
                  children: [
                    _jsx("thead", {
                      className: "bg-orange-50",
                      children: _jsx("tr", {
                        children: [
                          "Product",
                          "Category",
                          "Stock",
                          "Price",
                          "Freshness",
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
                      children: filtered.map((item) =>
                        _jsxs(
                          "tr",
                          {
                            className:
                              "hover:bg-orange-50/30 transition-colors",
                            children: [
                              _jsx("td", {
                                className: "px-4 py-3",
                                children: _jsxs("div", {
                                  className: "flex items-center gap-3",
                                  children: [
                                    _jsx("img", {
                                      src: item.image,
                                      alt: item.name,
                                      className:
                                        "w-10 h-10 rounded-xl object-cover",
                                    }),
                                    _jsx("span", {
                                      className:
                                        "font-semibold text-gray-900 text-sm font-display",
                                      children: t(item.name),
                                    }),
                                  ],
                                }),
                              }),
                              _jsx("td", {
                                className: "px-4 py-3 text-sm text-gray-600",
                                children: t(item.category),
                              }),
                              _jsx("td", {
                                className: "px-4 py-3",
                                children: _jsxs("span", {
                                  className: `text-sm font-bold font-display ${
                                    item.stock < 10
                                      ? "text-red-600"
                                      : item.stock < 20
                                        ? "text-orange-600"
                                        : "text-gray-900"
                                  }`,
                                  children: [item.stock, " ", item.unit],
                                }),
                              }),
                              _jsx("td", {
                                className: "px-4 py-3",
                                children: _jsxs("div", {
                                  children: [
                                    _jsxs("p", {
                                      className:
                                        "text-sm font-bold text-gray-900 font-display",
                                      children: [
                                        "\u20B9",
                                        item.discountedPrice,
                                      ],
                                    }),
                                    _jsxs("p", {
                                      className:
                                        "text-xs text-gray-400 line-through",
                                      children: ["\u20B9", item.originalPrice],
                                    }),
                                  ],
                                }),
                              }),
                              _jsx("td", {
                                className: "px-4 py-3",
                                children: _jsx(FreshnessRing, {
                                  score: item.freshnessScore,
                                }),
                              }),
                              _jsx("td", {
                                className: "px-4 py-3",
                                children: _jsx(Badge, {
                                  color:
                                    statusColors[item.stockStatus] || "gray",
                                  children: item.stockStatus,
                                }),
                              }),
                              _jsx("td", {
                                className: "px-4 py-3",
                                children: _jsxs("div", {
                                  className: "flex items-center gap-2",
                                  children: [
                                    _jsx("button", {
                                      onClick: () => {
                                        setEditingProduct(item)
                                        setPage("edit-product")
                                      },
                                      className:
                                        "text-blue-500 hover:text-blue-700",
                                      title: "Edit product",
                                      children: _jsx(Edit, { size: 14 }),
                                    }),
                                    _jsx("button", {
                                      onClick: () => handleDelete(item._id),
                                      className:
                                        "text-red-400 hover:text-red-600",
                                      children: _jsx(Trash2, { size: 14 }),
                                    }),
                                  ],
                                }),
                              }),
                            ],
                          },
                          item._id,
                        ),
                      ),
                    }),
                  ],
                }),
              }),
    ],
  })
}
function createEmptyProductForm() {
  return {
    name: "",
    category: "Fruits",
    image: "",
    originalPrice: "",
    discountedPrice: "",
    stock: "",
    unit: "kg",
    harvestDate: "",
    expiryDate: "",
    freshnessScore: "",
    description: "",
    organic: false,
  }
}

function AddProduct({ setPage, product, onAddAnother }) {
  const isEditing = Boolean(product)
  const [vendorSetupComplete, setVendorSetupComplete] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState("")
  const [freshnessInsight, setFreshnessInsight] = useState("")
  const [form, setForm] = useState(() => product ? ({
    name: product.name,
    category: product.category,
    image: product.image,
    originalPrice: String(product.originalPrice),
    discountedPrice: String(product.discountedPrice),
    stock: String(product.stock),
    unit: product.unit,
    harvestDate: product.harvestDate || "",
    expiryDate: "",
    freshnessScore: String(product.freshnessScore),
    description: product.description || "",
    organic: Boolean(product.organic),
  }) : createEmptyProductForm())
  const markVendorSetupComplete = useCallback(() => setVendorSetupComplete(true), [])
  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }))
  const handleFreshnessScan = async () => {
    if (!form.name || !form.image) {
      setError("Add a product name and image before using AI freshness scan.")
      return
    }
    setError("")
    setScanning(true)
    try {
      const result = await apiScanFreshness({
        name: form.name,
        category: form.category,
        image: form.image,
        harvestDate: form.harvestDate || undefined,
        expiryDate: form.expiryDate || undefined,
        freshnessScore: Number(form.freshnessScore || 0),
      })
      set("freshnessScore", String(result.score))
      setFreshnessInsight(`${result.label} • ${result.reason}`)
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Freshness analysis failed.")
    } finally {
      setScanning(false)
    }
  }
  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Choose a JPG, PNG, or WEBP image no larger than 5 MB.")
      return
    }

    setError("")
    setUploading(true)
    try {
      const imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error("Could not read the selected image."))
        reader.readAsDataURL(file)
      })
      const result = await api.post("/api/upload/product-image", {
        imageBase64,
        mimeType: file.type,
      })
      set("image", result.imageUrl)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.")
    } finally {
      setUploading(false)
    }
  }
  const handleSubmit = async () => {
    setError("")
    if (
      !form.name ||
      form.originalPrice === "" ||
      form.discountedPrice === "" ||
      form.stock === "" ||
      !form.image ||
      form.freshnessScore === ""
    ) {
      setError("Add a product image and complete all required product details.")
      return
    }
    setSaving(true)
    try {
      const original = Number(form.originalPrice)
      const discounted = Number(form.discountedPrice)
      const payload = {
        name: form.name,
        category: form.category,
        image: form.image,
        originalPrice: original,
        discountedPrice: discounted,
        discount: Math.round(((original - discounted) / original) * 100),
        stock: Number(form.stock),
        unit: form.unit,
        harvestDate: form.harvestDate,
        expiryCountdown: form.expiryDate,
        description: form.description,
        organic: form.organic,
        freshnessScore: Number(form.freshnessScore),
      }
      if (isEditing) await apiUpdateProduct(product._id, payload)
      else await apiCreateProduct(payload)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save product")
    } finally {
      setSaving(false)
    }
  }
  if (!isEditing && !vendorSetupComplete) {
    return <VendorProductSetup onComplete={markVendorSetupComplete} />
  }
  if (saved)
    return _jsx("div", {
      className: "p-6 flex items-center justify-center min-h-96",
      children: _jsxs("div", {
        className: "text-center glass rounded-3xl p-10 max-w-md",
        children: [
          _jsx(CheckCircle, {
            size: 48,
            className: "text-green-600 mx-auto mb-4",
          }),
          _jsx("h2", {
            className: "text-2xl font-black text-gray-900 font-display mb-2",
            children: isEditing ? "Product Updated" : "Product Added",
          }),
          _jsx("p", {
            className: "text-gray-500 mb-6",
            children: isEditing ? "Your changes were saved." : "Your product is now live on the marketplace.",
          }),
          _jsxs("div", {
            className: "flex gap-3",
            children: [
              _jsx("button", {
                onClick: () => setPage("inventory"),
                className:
                  "flex-1 btn-orange text-white font-semibold py-3 rounded-xl text-sm",
                children: "View Inventory",
              }),
              !isEditing && _jsx("button", {
                onClick: () => {
                  setSaved(false)
                  setForm(createEmptyProductForm())
                  onAddAnother?.()
                },
                className:
                  "flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50",
                children: "Add Another",
              }),
            ],
          }),
        ],
      }),
    })
  return _jsx("div", {
    className: "p-6 max-w-3xl mx-auto",
    children: _jsxs("div", {
      className: "glass rounded-2xl p-6 space-y-5",
      children: [
        error &&
          _jsx("div", {
            className:
              "bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5",
            children: error,
          }),
        _jsxs("label", {
          className: "border-2 border-dashed border-orange-200 rounded-2xl p-6 text-center bg-orange-50 block",
          children: [
            _jsx(Upload, { size: 28, className: "text-orange-400 mx-auto mb-2" }),
            _jsx("span", { className: "font-semibold text-gray-700", children: uploading ? "Uploading image..." : "Choose product image" }),
            _jsx("input", { type: "file", accept: "image/jpeg,image/png,image/webp", onChange: handleImageSelect, disabled: uploading, className: "mt-3 block w-full text-sm" }),
            form.image && _jsx("img", { src: form.image, alt: "Product preview", className: "mt-4 mx-auto h-32 max-w-full object-contain rounded-lg" }),
          ],
        }),
        _jsxs("div", {
          className: "grid grid-cols-2 gap-4",
          children: [
            _jsxs("div", {
              children: [
                _jsx("label", {
                  className: "block text-sm font-semibold text-gray-700 mb-1.5",
                  children: "Product Name",
                }),
                _jsx("input", {
                  value: form.name,
                  onChange: (e) => set("name", e.target.value),
                  className:
                    "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400",
                  placeholder: "e.g. Alphonso Mangoes",
                }),
              ],
            }),
            _jsxs("div", {
              children: [
                _jsx("label", {
                  className: "block text-sm font-semibold text-gray-700 mb-1.5",
                  children: "Category",
                }),
                _jsxs("select", {
                  value: form.category,
                  onChange: (e) => set("category", e.target.value),
                  className:
                    "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 bg-white",
                  children: [
                    _jsx("option", { children: "Fruits" }),
                    _jsx("option", { children: "Vegetables" }),
                    _jsx("option", { children: "Organic" }),
                    _jsx("option", { children: "Exotic" }),
                  ],
                }),
              ],
            }),
            _jsxs("div", {
              children: [
                _jsx("label", {
                  className: "block text-sm font-semibold text-gray-700 mb-1.5",
                  children: "Original Price (\u20B9)",
                }),
                _jsx("input", {
                  type: "number",
                  value: form.originalPrice,
                  onChange: (e) => set("originalPrice", e.target.value),
                  className:
                    "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400",
                  placeholder: "280",
                }),
              ],
            }),
            _jsxs("div", {
              children: [
                _jsx("label", {
                  className: "block text-sm font-semibold text-gray-700 mb-1.5",
                  children: "Discount Price (\u20B9)",
                }),
                _jsx("input", {
                  type: "number",
                  value: form.discountedPrice,
                  onChange: (e) => set("discountedPrice", e.target.value),
                  className:
                    "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400",
                  placeholder: "199",
                }),
              ],
            }),
            _jsxs("div", {
              children: [
                _jsx("label", {
                  className: "block text-sm font-semibold text-gray-700 mb-1.5",
                  children: "Stock Quantity",
                }),
                _jsx("input", {
                  type: "number",
                  value: form.stock,
                  onChange: (e) => set("stock", e.target.value),
                  className:
                    "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400",
                  placeholder: "50",
                }),
              ],
            }),
            _jsxs("div", {
              children: [
                _jsx("label", {
                  className: "block text-sm font-semibold text-gray-700 mb-1.5",
                  children: "Unit",
                }),
                _jsxs("select", {
                  value: form.unit,
                  onChange: (e) => set("unit", e.target.value),
                  className:
                    "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 bg-white",
                  children: [
                    _jsx("option", { children: "kg" }),
                    _jsx("option", { children: "piece" }),
                    _jsx("option", { children: "250g" }),
                    _jsx("option", { children: "500g" }),
                    _jsx("option", { children: "dozen" }),
                  ],
                }),
              ],
            }),
            _jsxs("div", {
              children: [
                _jsxs("div", {
                  className: "flex items-center justify-between gap-2 mb-1.5",
                  children: [
                    _jsx("label", {
                      className: "block text-sm font-semibold text-gray-700",
                      htmlFor: "product-freshness",
                      children: "Freshness Score (0-100)",
                    }),
                    _jsx("button", {
                      type: "button",
                      onClick: handleFreshnessScan,
                      disabled: scanning || !form.name || !form.image,
                      className: "text-xs font-semibold text-orange-600 disabled:text-gray-400",
                      children: scanning ? "Scanning..." : "AI scan",
                    }),
                  ],
                }),
                _jsx("input", {
                  id: "product-freshness",
                  type: "number",
                  min: 0,
                  max: 100,
                  value: form.freshnessScore,
                  onChange: (e) => set("freshnessScore", e.target.value),
                  className: "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400",
                  placeholder: "Enter measured score",
                }),
                freshnessInsight && _jsx("p", {
                  className: "mt-2 text-xs text-orange-600",
                  children: freshnessInsight,
                }),
              ],
            }),
            _jsxs("div", {
              children: [
                _jsx("label", {
                  className: "block text-sm font-semibold text-gray-700 mb-1.5",
                  children: "Harvest Date",
                }),
                _jsx("input", {
                  type: "date",
                  value: form.harvestDate,
                  onChange: (e) => set("harvestDate", e.target.value),
                  className:
                    "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400",
                }),
              ],
            }),
            _jsxs("div", {
              children: [
                _jsx("label", {
                  className: "block text-sm font-semibold text-gray-700 mb-1.5",
                  children: "Expiry Date",
                }),
                _jsx("input", {
                  type: "date",
                  value: form.expiryDate,
                  onChange: (e) => set("expiryDate", e.target.value),
                  className:
                    "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400",
                }),
              ],
            }),
          ],
        }),
        _jsxs("div", {
          children: [
            _jsx("label", {
              className: "block text-sm font-semibold text-gray-700 mb-1.5",
              children: "Description",
            }),
            _jsx("textarea", {
              rows: 3,
              value: form.description,
              onChange: (e) => set("description", e.target.value),
              className:
                "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 resize-none",
              placeholder: "Describe your product...",
            }),
          ],
        }),
        _jsxs("div", {
          className: "flex items-center gap-2",
          children: [
            _jsx("input", {
              type: "checkbox",
              id: "organic",
              checked: form.organic,
              onChange: (e) => set("organic", e.target.checked),
              className: "w-4 h-4 rounded accent-green-600",
            }),
            _jsx("label", {
              htmlFor: "organic",
              className: "text-sm text-gray-700 font-medium cursor-pointer",
              children: "Mark as Organic Product",
            }),
          ],
        }),
        _jsxs("div", {
          className: "flex gap-3",
          children: [
            _jsx("button", {
              onClick: handleSubmit,
              disabled: saving,
              className:
                "flex-1 btn-orange text-white font-bold py-3.5 rounded-xl text-sm disabled:opacity-60",
              children: saving ? "Saving..." : isEditing ? "Save Changes" : "Add to Inventory",
            }),
            _jsx("button", {
              onClick: () => setPage("inventory"),
              className:
                "border border-gray-200 text-gray-700 font-semibold px-6 py-3.5 rounded-xl text-sm hover:bg-gray-50",
              children: "Cancel",
            }),
          ],
        }),
      ],
    }),
  })
}
function Orders() {
  const vendorOrders = [
    {
      id: "CF-2026-4521",
      customer: "devansh chouhan",
      products: "Alphonso Mangoes × 2",
      time: "10:45 AM",
      total: 398,
      status: "Pending",
    },
    {
      id: "CF-2026-4519",
      customer: "Prachi Joshi",
      products: "Sweet Corn × 4",
      time: "10:28 AM",
      total: 140,
      status: "Confirmed",
    },
    {
      id: "CF-2026-4516",
      customer: "Rohan Mehta",
      products: "Bottle Gourd × 3 kg",
      time: "9:55 AM",
      total: 114,
      status: "Packed",
    },
    {
      id: "CF-2026-4510",
      customer: "Anjali Patel",
      products: "Alphonso Mangoes × 1",
      time: "9:20 AM",
      total: 199,
      status: "Delivered",
    },
  ]
  const statusColors = {
    Pending: "orange",
    Confirmed: "blue",
    Packed: "yellow",
    Delivered: "green",
    Cancelled: "red",
  }
  return _jsx("div", {
    className: "p-6 space-y-4",
    children: vendorOrders.map((o) =>
      _jsxs(
        "div",
        {
          className: "glass rounded-2xl p-5 flex items-center justify-between",
          children: [
            _jsxs("div", {
              children: [
                _jsx("p", {
                  className: "font-bold text-gray-900 font-display text-sm",
                  children: o.id,
                }),
                _jsxs("p", {
                  className: "text-sm text-gray-600",
                  children: [o.customer, " \u00B7 ", o.products],
                }),
                _jsx("p", {
                  className: "text-xs text-gray-400 mt-0.5",
                  children: o.time,
                }),
              ],
            }),
            _jsxs("div", {
              className: "text-right flex flex-col items-end gap-2",
              children: [
                _jsxs("p", {
                  className: "font-black text-gray-900 font-display",
                  children: ["\u20B9", o.total],
                }),
                _jsx(Badge, {
                  color: statusColors[o.status],
                  children: o.status,
                }),
                o.status === "Pending" &&
                  _jsxs("div", {
                    className: "flex gap-2",
                    children: [
                      _jsx("button", {
                        className:
                          "text-xs bg-green-600 text-white px-3 py-1 rounded-lg font-semibold hover:bg-green-700",
                        children: "Accept",
                      }),
                      _jsx("button", {
                        className:
                          "text-xs border border-red-300 text-red-500 px-3 py-1 rounded-lg font-semibold hover:bg-red-50",
                        children: "Reject",
                      }),
                    ],
                  }),
              ],
            }),
          ],
        },
        o.id,
      ),
    ),
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
            label: "Monthly Revenue",
            value: "\u20B982,000",
            sub: "\u2191 9.3%",
            color: "#FF9800",
            bg: "#FFF3E0",
          }),
          _jsx(StatCard, {
            icon: _jsx(Package, { size: 22 }),
            label: "Monthly Orders",
            value: "612",
            sub: "\u2191 8.9%",
            color: "#FF9800",
            bg: "#FFF3E0",
          }),
          _jsx(StatCard, {
            icon: _jsx(Users, { size: 22 }),
            label: "Unique Customers",
            value: "388",
            sub: "\u2191 14.1%",
            color: "#FF9800",
            bg: "#FFF3E0",
          }),
          _jsx(StatCard, {
            icon: _jsx(TrendingUp, { size: 22 }),
            label: "Avg Order Value",
            value: "\u20B9134",
            sub: "\u2191 2.1%",
            color: "#FF9800",
            bg: "#FFF3E0",
          }),
        ],
      }),
      _jsxs("div", {
        className: "glass rounded-2xl p-5",
        children: [
          _jsx(SectionTitle, {
            sub: "Revenue & order trends",
            children: "Monthly Performance",
          }),
          _jsx(ResponsiveContainer, {
            width: "100%",
            height: 240,
            children: _jsxs(LineChart, {
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
                  tickFormatter: (v) => `₹${v / 1000}k`,
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
                  dataKey: "revenue",
                  stroke: "#FF9800",
                  strokeWidth: 2.5,
                  dot: { fill: "#FF9800", r: 4 },
                  name: "Revenue (\u20B9)",
                }),
                _jsx(Line, {
                  type: "monotone",
                  dataKey: "customers",
                  stroke: "#2E7D32",
                  strokeWidth: 2,
                  strokeDasharray: "5 5",
                  dot: false,
                  name: "Customers",
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
            sub: "Order volume by month",
            children: "Order Trends",
          }),
          _jsx(ResponsiveContainer, {
            width: "100%",
            height: 200,
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
                  fill: "#FF9800",
                  radius: [6, 6, 0, 0],
                  name: "Orders",
                }),
              ],
            }),
          }),
        ],
      }),
    ],
  })
}
function AISuggestions() {
  const suggestions = [
    {
      product: "Bananas",
      issue: "Near expiry (2 days)",
      suggestion: "Apply 45% discount",
      aiScore: 92,
      impact: "↑ 3x sell-through",
      type: "discount",
    },
    {
      product: "Sweet Corn",
      issue: "Low stock (8 units)",
      suggestion: "Reorder 50 units",
      aiScore: 88,
      impact: "Meet demand",
      type: "restock",
    },
    {
      product: "Papaya",
      issue: "Expired today",
      suggestion: "Donate to Robin Hood Army",
      aiScore: 95,
      impact: "12 meals saved",
      type: "donate",
    },
    {
      product: "Tomatoes",
      issue: "High demand predicted",
      suggestion: "Increase stock by 30%",
      aiScore: 78,
      impact: "↑ Revenue",
      type: "restock",
    },
  ]
  const typeColors = { discount: "orange", restock: "blue", donate: "green" }
  const typeIcons = { discount: "💰", restock: "📦", donate: "💚" }
  return _jsxs("div", {
    className: "p-6 space-y-5",
    children: [
      _jsxs("div", {
        className:
          "glass rounded-2xl p-5 border-l-4 border-orange-400 bg-orange-50",
        children: [
          _jsxs("div", {
            className: "flex items-center gap-3 mb-2",
            children: [
              _jsx(Zap, { size: 20, className: "text-orange-500" }),
              _jsx("h3", {
                className: "font-bold text-gray-900 font-display",
                children: "AI Freshness Intelligence",
              }),
            ],
          }),
          _jsxs("p", {
            className: "text-sm text-gray-600",
            children: [
              "Our AI analyzed your inventory and identified ",
              _jsx("strong", { children: "4 opportunities" }),
              " to maximize revenue and reduce waste.",
            ],
          }),
        ],
      }),
      _jsx("div", {
        className: "space-y-4",
        children: suggestions.map((s, i) =>
          _jsxs(
            "div",
            {
              className: "glass rounded-2xl p-5",
              children: [
                _jsxs("div", {
                  className: "flex items-start justify-between mb-3",
                  children: [
                    _jsxs("div", {
                      className: "flex items-center gap-3",
                      children: [
                        _jsx("div", {
                          className: "text-2xl",
                          children: typeIcons[s.type],
                        }),
                        _jsxs("div", {
                          children: [
                            _jsx("h4", {
                              className: "font-bold text-gray-900 font-display",
                              children: s.product,
                            }),
                            _jsx("p", {
                              className: "text-sm text-gray-500",
                              children: s.issue,
                            }),
                          ],
                        }),
                      ],
                    }),
                    _jsxs("div", {
                      className: "text-right",
                      children: [
                        _jsx("p", {
                          className: "text-xs text-gray-400",
                          children: "AI Confidence",
                        }),
                        _jsxs("p", {
                          className:
                            "text-lg font-black font-display text-orange-600",
                          children: [s.aiScore, "%"],
                        }),
                      ],
                    }),
                  ],
                }),
                _jsxs("div", {
                  className: "bg-gray-50 rounded-xl p-3 mb-3",
                  children: [
                    _jsxs("p", {
                      className:
                        "text-sm font-semibold text-gray-900 font-display",
                      children: ["Recommendation: ", s.suggestion],
                    }),
                    _jsxs("p", {
                      className: "text-xs text-green-600 font-semibold mt-0.5",
                      children: ["Expected impact: ", s.impact],
                    }),
                  ],
                }),
                _jsxs("div", {
                  className: "flex gap-2",
                  children: [
                    _jsx("button", {
                      className:
                        "flex-1 btn-orange text-white font-semibold text-sm py-2.5 rounded-xl",
                      children: "Apply Suggestion",
                    }),
                    _jsx("button", {
                      className:
                        "border border-gray-200 text-gray-600 font-medium text-sm px-4 py-2.5 rounded-xl hover:bg-gray-50",
                      children: "Dismiss",
                    }),
                  ],
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
function Donations() {
  return _jsxs("div", {
    className: "p-6 space-y-5",
    children: [
      _jsxs("div", {
        className: "grid grid-cols-3 gap-4",
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
                children: "1,240",
              }),
              _jsx("p", {
                className: "text-sm text-gray-500 mt-0.5",
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
              _jsx("p", {
                className: "stats-counter text-2xl font-black font-display",
                children: "340 kg",
              }),
              _jsx("p", {
                className: "text-sm text-gray-500 mt-0.5",
                children: "Food Donated",
              }),
            ],
          }),
          _jsxs("div", {
            className: "glass rounded-2xl p-4 text-center",
            children: [
              _jsx("p", {
                className: "text-3xl mb-1",
                children: "\uD83C\uDFD8\uFE0F",
              }),
              _jsx("p", {
                className: "stats-counter text-2xl font-black font-display",
                children: "18",
              }),
              _jsx("p", {
                className: "text-sm text-gray-500 mt-0.5",
                children: "NGOs Helped",
              }),
            ],
          }),
        ],
      }),
      _jsx(SectionTitle, {
        sub: "Active & recent donation requests",
        children: "Donation History",
      }),
      _jsx("div", {
        className: "space-y-4",
        children: donations.map((d) =>
          _jsxs(
            "div",
            {
              className: "glass rounded-2xl p-5",
              children: [
                _jsxs("div", {
                  className: "flex items-start justify-between mb-3",
                  children: [
                    _jsxs("div", {
                      children: [
                        _jsxs("h4", {
                          className: "font-bold text-gray-900 font-display",
                          children: [d.product, " \u2014 ", d.quantity],
                        }),
                        _jsxs("p", {
                          className: "text-sm text-gray-500",
                          children: [
                            "\u2192 ",
                            d.ngoName,
                            " \u00B7 ",
                            d.distance,
                            " away",
                          ],
                        }),
                        _jsxs("p", {
                          className: "text-xs text-gray-400 mt-0.5",
                          children: [
                            "Expires ",
                            d.expiryDate,
                            " \u00B7 Freshness: ",
                            d.freshnessScore,
                            "/100",
                          ],
                        }),
                      ],
                    }),
                    _jsx(Badge, {
                      color:
                        d.status === "Delivered"
                          ? "green"
                          : d.status === "Accepted"
                            ? "blue"
                            : "orange",
                      children: d.status,
                    }),
                  ],
                }),
                _jsxs("div", {
                  className: "flex items-center gap-4 text-xs",
                  children: [
                    _jsxs("span", {
                      className: "text-green-600 font-semibold",
                      children: [
                        "\uD83C\uDF7D\uFE0F ",
                        d.mealsSaved,
                        " meals saved",
                      ],
                    }),
                    _jsxs("span", {
                      className: "text-blue-600 font-semibold",
                      children: [
                        "\uD83C\uDF31 ",
                        d.co2Saved,
                        " kg CO\u2082 saved",
                      ],
                    }),
                  ],
                }),
              ],
            },
            d.id,
          ),
        ),
      }),
      _jsxs("div", {
        className:
          "glass rounded-2xl p-5 border-2 border-dashed border-green-200",
        children: [
          _jsx("h3", {
            className: "font-bold text-gray-900 font-display mb-3",
            children: "Initiate New Donation",
          }),
          _jsx("p", {
            className: "text-sm text-gray-500 mb-4",
            children:
              "Select near-expiry products to donate to nearby NGOs. Our AI will suggest the best match.",
          }),
          _jsxs("button", {
            className:
              "btn-primary text-white font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2",
            children: [_jsx(Heart, { size: 14 }), " Start Donation Process"],
          }),
        ],
      }),
    ],
  })
}

function LiveVendorDashboard({ setPage }) {
  const [inventory, setInventory] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([getVendorInventory(), api.get("/api/orders/vendor")])
      .then(([products, vendorOrders]) => {
        setInventory(products)
        setOrders(vendorOrders)
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
          _jsx("h2", { className: "text-2xl font-black font-display", children: "Vendor Dashboard" }),
          _jsx("button", { onClick: () => setPage("add-product"), className: "mt-4 bg-white text-green-700 font-semibold px-4 py-2 rounded-xl", children: "Add Product" }),
        ],
      }),
      error && _jsx("p", { role: "alert", className: "text-red-600", children: error }),
      loading
        ? _jsx("p", { className: "text-gray-500", children: "Loading vendor data..." })
        : _jsxs("div", {
            className: "grid grid-cols-2 gap-4",
            children: [
              _jsx(StatCard, { icon: _jsx(Package, { size: 22 }), label: "Your products", value: inventory.length }),
              _jsx(StatCard, { icon: _jsx(CheckCircle, { size: 22 }), label: "Orders involving your products", value: orders.length }),
            ],
          }),
      !loading && inventory.length === 0 && _jsx("p", { className: "text-sm text-gray-500", children: "No products listed yet." }),
      !loading && orders.length === 0 && _jsx("p", { className: "text-sm text-gray-500", children: "No orders yet." }),
    ],
  })
}

function LiveVendorOrders() {
  const { t } = useLanguage()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    api.get("/api/orders/vendor")
      .then(setOrders)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  const nextStatus = (order) => {
    if (["Order Placed", "Pending", "Confirmed"].includes(order.status)) return "Packed"
    const hasManualDeliveryPartner = !order.deliveryPartner?.user &&
      Boolean(order.deliveryPartner?.name && order.deliveryPartner?.phone)
    if (hasManualDeliveryPartner && order.status === "Packed") return "Out For Delivery"
    if (hasManualDeliveryPartner && order.status === "Out For Delivery") return "Delivered"
    return null
  }

  const advanceOrder = async (order) => {
    try {
      const updated = await api.patch(`/api/orders/${order._id}/status`, { status: nextStatus(order) })
      setOrders((records) => records.map((record) => record._id === order._id ? updated : record))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  if (loading) return _jsx("p", { className: "p-6 text-gray-500", children: "Loading orders..." })
  if (error) return _jsx("p", { role: "alert", className: "p-6 text-red-600", children: error })
  if (!orders.length) return _jsx("p", { className: "p-6 text-gray-500", children: "No orders yet." })

  return _jsx("div", {
    className: "p-6 space-y-3",
    children: orders.map((order) => _jsxs("article", {
      className: "glass rounded-xl p-4",
      children: [
        _jsx("h3", { className: "font-semibold", children: order.orderId }),
        _jsx("p", { className: "text-sm text-gray-600", children: order.user?.name || "Customer" }),
        _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: order.items.map((item) => `${t(item.name)} × ${item.qty}`).join(", ") }),
        _jsx(Badge, { color: "orange", children: order.status }),
        nextStatus(order) && _jsx("button", {
          onClick: () => advanceOrder(order),
          className: "mt-2 text-sm font-semibold text-orange-700",
          children: `Mark ${nextStatus(order)}`,
        }),
      ],
    }, order._id)),
  })
}

function LiveVendorDonations() {
  const { t } = useLanguage()
  const [donations, setDonations] = useState([])
  const [inventory, setInventory] = useState([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([getMyDonations(), getVendorInventory()])
      .then(([records, products]) => {
        setDonations(records)
        setInventory(products.filter((product) => product.stock > 0))
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  const submitDonation = async () => {
    const product = inventory.find((item) => item._id === selectedProductId)
    const donationQuantity = Number(quantity)
    if (!product || !Number.isInteger(donationQuantity) || donationQuantity < 1 || donationQuantity > product.stock || !expiryDate) {
      setError("Choose a product, enter a quantity within stock, and provide an expiry date.")
      return
    }
    setError("")
    setSaving(true)
    try {
      const created = await createDonation({
        productId: product._id,
        product: product.name,
        quantity: donationQuantity,
        unit: product.unit,
        freshnessScore: product.freshnessScore,
        expiryDate,
      })
      setDonations((records) => [created, ...records])
      setShowForm(false)
      setQuantity("")
      setExpiryDate("")
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return _jsx("p", { className: "p-6 text-gray-500", children: "Loading donations..." })

  return _jsx("div", {
    className: "p-6 space-y-4",
    children: [
      error && _jsx("p", { role: "alert", className: "text-sm text-red-600", children: error }),
      _jsx("button", { onClick: () => setShowForm((value) => !value), disabled: inventory.length === 0, className: "btn-orange rounded-xl px-4 py-2.5 font-semibold text-white disabled:opacity-60", children: showForm ? "Cancel donation" : "Offer surplus food" }),
      showForm && _jsxs("section", {
        className: "glass rounded-xl p-4 grid gap-3 md:grid-cols-3",
        children: [
          _jsxs("label", { className: "text-sm font-semibold", children: [t("Product"), _jsxs("select", { value: selectedProductId, onChange: (event) => setSelectedProductId(event.target.value), className: "mt-1 w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800", children: [_jsx("option", { value: "", children: t("Select product") }), ...inventory.map((product) => _jsx("option", { value: product._id, children: `${t(product.name)} (${product.stock} ${product.unit})` }, product._id))] })] }),
          _jsxs("label", { className: "text-sm font-semibold", children: ["Quantity", _jsx("input", { type: "number", min: 1, value: quantity, onChange: (event) => setQuantity(event.target.value), className: "mt-1 w-full rounded-lg border px-3 py-2" })] }),
          _jsxs("label", { className: "text-sm font-semibold", children: ["Expiry date", _jsx("input", { type: "date", value: expiryDate, onChange: (event) => setExpiryDate(event.target.value), className: "mt-1 w-full rounded-lg border px-3 py-2" })] }),
          _jsx("button", { onClick: submitDonation, disabled: saving, className: "btn-orange rounded-xl px-4 py-2.5 font-semibold text-white disabled:opacity-60 md:col-span-3", children: saving ? "Submitting..." : "Submit donation offer" }),
        ],
      }),
      donations.length === 0 ? _jsx("p", { className: "text-gray-500", children: "No donation offers yet." }) : donations.map((donation) => _jsxs("article", {
        className: "glass rounded-xl p-4",
        children: [
          _jsx("h3", { className: "font-semibold", children: `${donation.product} · ${donation.quantity}` }),
          _jsx("p", { className: "text-sm text-gray-600", children: donation.ngoName || "Awaiting NGO" }),
          _jsx(Badge, { color: "green", children: donation.status }),
        ],
      }, donation._id)),
    ],
  })
}

function LiveVendorProfile({ user, error, onUserChange }) {
  const { t } = useLanguage()

  if (error) return _jsx("p", { role: "alert", className: "p-6 text-red-600", children: error })
  if (!user) return _jsx("p", { className: "p-6 text-gray-500", children: "Loading profile..." })

  return _jsxs("section", {
    className: "p-6 space-y-3",
    children: [
      _jsx(ProfilePhotoUpload, { avatar: user.avatar, name: user.businessName || user.name, onUploaded: (avatar) => onUserChange((current) => ({ ...current, avatar })) }),
      _jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-gray-100", children: user.businessName || user.name }),
      _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: user.email }),
      _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: t(user.verified ? "Verified vendor" : "Verification pending") }),
      _jsx(ProfileDetailsForm, {
        user,
        fields: [
          { key: "name", label: "Owner name" },
          { key: "businessName", label: "Business name" },
          { key: "ownerName", label: "Business owner" },
          { key: "phone", label: "Phone" },
          { key: "address", label: "Address" },
          { key: "category", label: "Category" },
          { key: "description", label: "Description" },
        ],
        onSaved: onUserChange,
      }),
    ],
  })
}

function LiveVendorNotifications({ items, loading, error, onRefresh, onItemsChange, onError, setPage, t }) {
  const [updating, setUpdating] = useState(false)

  const markAsRead = async (notification) => {
    if (notification.read) return
    setUpdating(true)
    onError("")
    try {
      const updated = await api.patch(`/api/notifications/${notification._id}/read`, {})
      onItemsChange((current) => current.map((item) => item._id === updated._id ? updated : item))
    } catch (requestError) {
      onError(requestError.message || t("Could not update notification."))
    } finally {
      setUpdating(false)
    }
  }

  const markAllAsRead = async () => {
    setUpdating(true)
    onError("")
    try {
      await api.patch("/api/notifications/read-all", {})
      onItemsChange((current) => current.map((item) => ({ ...item, read: true })))
    } catch (requestError) {
      onError(requestError.message || t("Could not update notifications."))
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return _jsx("p", { className: "p-6 text-gray-500 dark:text-gray-400", children: t("Loading notifications...") })

  return _jsxs("section", {
    className: "space-y-4 p-6",
    children: [
      _jsxs("div", {
        className: "flex flex-wrap items-center justify-between gap-3",
        children: [
          _jsxs("div", {
            children: [
              _jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-gray-100", children: t("Notifications") }),
              _jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: t("Updates about your orders and vendor account.") }),
            ],
          }),
          _jsxs("div", {
            className: "flex gap-2",
            children: [
              _jsx("button", { type: "button", onClick: onRefresh, className: "rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-800", children: t("Refresh") }),
              _jsx("button", { type: "button", onClick: markAllAsRead, disabled: updating || !items.some((item) => !item.read), className: "rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-800", children: t("Mark all as read") }),
            ],
          }),
        ],
      }),
      error && _jsx("p", { role: "alert", className: "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300", children: error }),
      items.length === 0 && !error
        ? _jsx("p", { className: "py-10 text-center text-gray-500 dark:text-gray-400", children: t("No notifications.") })
        : items.map((item) => _jsxs("article", {
            className: `glass flex flex-wrap items-start justify-between gap-4 rounded-xl border p-4 ${item.read ? "border-transparent opacity-75" : "border-green-300 dark:border-green-700"}`,
            children: [
              _jsxs("div", {
                className: "min-w-0 flex-1",
                children: [
                  _jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [
                      _jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100", children: t(item.title) }),
                      !item.read && _jsx("span", { className: "h-2 w-2 rounded-full bg-green-600", "aria-label": t("Unread") }),
                    ],
                  }),
                  _jsx("p", { className: "mt-1 text-sm text-gray-600 dark:text-gray-300", children: t(item.message) }),
                  _jsx("time", { className: "mt-2 block text-xs text-gray-500 dark:text-gray-400", dateTime: item.createdAt, children: new Date(item.createdAt).toLocaleString() }),
                ],
              }),
              _jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  item.link === "orders" && _jsx("button", {
                    type: "button",
                    onClick: async () => {
                      await markAsRead(item)
                      setPage("orders")
                    },
                    className: "rounded-lg px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-500/10",
                    children: t("View orders"),
                  }),
                  !item.read && _jsx("button", {
                    type: "button",
                    onClick: () => markAsRead(item),
                    disabled: updating,
                    className: "rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-white/10",
                    children: t("Mark read"),
                  }),
                ],
              }),
            ],
          }, item._id)),
    ],
  })
}

function VendorSettings({ dark, onToggleDark }) {
  const { t } = useLanguage()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    api.get("/api/auth/me")
      .then(({ user: currentUser }) => {
        if (!active) return
        setUser(currentUser)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Could not load vendor settings.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading) return _jsx("p", { className: "p-6 text-gray-500", children: "Loading vendor settings..." })
  if (!user && error) return _jsx("p", { role: "alert", className: "p-6 text-red-600", children: error })
  if (!user) return _jsx("p", { className: "p-6 text-gray-500", children: "Vendor settings are unavailable." })

  return _jsxs("div", {
    className: "max-w-3xl space-y-6 p-6",
    children: [
      _jsxs("section", {
        className: "glass rounded-2xl p-5",
        children: [
          _jsx("h2", { className: "text-lg font-bold text-gray-900 dark:text-gray-100", children: t("Business and pickup details") }),
              _jsx("p", { className: "mb-4 mt-1 text-sm text-gray-500 dark:text-gray-400", children: t("Keep your pickup location accurate so nearby customers can find you. Delivery eligibility is limited to a 10 km driving route.") }),
          _jsx(ProfileDetailsForm, {
            user,
            fields: [
              { key: "businessName", label: "Business name" },
              { key: "ownerName", label: "Business owner" },
              { key: "phone", label: "Contact phone" },
              { key: "address", label: "Pickup street address" },
              { key: "city", label: "City" },
              { key: "state", label: "State" },
              { key: "pincode", label: "PIN code" },
              { key: "category", label: "Business category" },
              { key: "description", label: "Business description" },
            ],
            onSaved: setUser,
          }),
        ],
      }),
      _jsxs("section", {
        className: "glass space-y-3 rounded-2xl p-5",
        children: [
          _jsx("div", {
            children: [
              _jsx("h2", { className: "text-lg font-bold text-gray-900 dark:text-gray-100", children: "Notification preferences" }),
              _jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Important updates are available in your in-app notifications and by email when email is configured." }),
            ],
          }),
          _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Automatic SMS and WhatsApp notifications are disabled. WhatsApp links open a message for you to send manually." }),
        ],
      }),
      _jsxs("section", {
        className: "glass flex items-center justify-between gap-4 rounded-2xl p-5",
        children: [
          _jsxs("div", {
            children: [
              _jsx("h2", { className: "font-bold text-gray-900 dark:text-gray-100", children: "Appearance" }),
              _jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: dark ? "Dark mode is on." : "Dark mode is off." }),
            ],
          }),
          _jsx("button", {
            type: "button",
            onClick: onToggleDark,
            className: "rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-100 dark:hover:bg-slate-800",
            children: dark ? "Switch to light mode" : "Switch to dark mode",
          }),
        ],
      }),
      _jsx(SupportFeedback, {}),
    ],
  })
}

export default function VendorPortal({ onLogout }) {
  const [page, setPage] = useState("dashboard")
  const [editingProduct, setEditingProduct] = useState(null)
  const [user, setUser] = useState(null)
  const [profileError, setProfileError] = useState("")
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [notificationsError, setNotificationsError] = useState("")
  const { dark, toggleDark, accent, setAccent } = usePortalTheme()
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => {
    let active = true
    api.get("/api/auth/me")
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser)
      })
      .catch((requestError) => {
        if (active) setProfileError(requestError.message)
      })
    return () => {
      active = false
    }
  }, [])

  const loadNotifications = useCallback(async () => {
    try {
      const items = await api.get("/api/notifications")
      setNotifications(items)
      setNotificationsError("")
    } catch (requestError) {
      setNotificationsError(requestError.message || "Could not load notifications.")
    } finally {
      setNotificationsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotifications()
    const interval = window.setInterval(loadNotifications, 30000)
    return () => window.clearInterval(interval)
  }, [loadNotifications])

  const pages = {
    dashboard: _jsx(LiveVendorDashboard, { setPage: setPage }),
    inventory: _jsx(Inventory, { setPage: setPage, setEditingProduct: setEditingProduct }),
    "add-product": _jsx(AddProduct, { setPage: setPage, onAddAnother: () => setEditingProduct(null) }),
    "edit-product": _jsx(AddProduct, { setPage: setPage, product: editingProduct }),
    orders: _jsx(LiveVendorOrders, {}),
    notifications: _jsx(LiveVendorNotifications, {
      items: notifications,
      loading: notificationsLoading,
      error: notificationsError,
      onRefresh: loadNotifications,
      onItemsChange: setNotifications,
      onError: setNotificationsError,
      setPage,
      t,
    }),
    analytics: _jsx("p", { className: "p-6 text-gray-500", children: "Sales analytics are unavailable until order payment data is recorded." }),
    donations: _jsx(LiveVendorDonations, {}),
    profile: _jsx(LiveVendorProfile, { user, error: profileError, onUserChange: setUser }),
    settings: _jsx(VendorSettings, { dark, onToggleDark: toggleDark }),
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
            user,
            unreadCount: notifications.filter((notification) => !notification.read).length,
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

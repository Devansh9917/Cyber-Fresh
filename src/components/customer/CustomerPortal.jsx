import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime"
import { useState, useEffect } from "react"
import {
  ShoppingCart,
  Bell,
  Search,
  Home,
  Package,
  Clock,
  Star,
  MapPin,
  Settings,
  User,
  LogOut,
  Tag,
  Zap,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Truck,
  Phone,
  Sun,
  Moon,
  MessageCircle,
} from "lucide-react"
import { products, orders, reminders, notifications } from "../../data/mockData"
import {
  FreshnessBadge,
  FreshnessRing,
  Badge,
  SectionTitle,
  StatCard,
  Toast,
} from "../shared/ui"
import { getProducts } from "../../api/products"
import { createOrder as apiCreateOrder, getMyOrders } from "../../api/orders"
import { getNearbyVendors } from "../../api/vendors"
import { api } from "../../api/client"
import ProfilePhotoUpload from "../shared/ProfilePhotoUpload"
import TranslatedContent from "../shared/TranslatedContent"
import ProfileDetailsForm from "../shared/ProfileDetailsForm"
import usePortalTheme from "../shared/usePortalTheme"
import useLanguage from "../shared/useLanguage"
import PreferenceControls, { LanguageSelector } from "../shared/PreferenceControls"
import CommunicationPreferences from "../shared/CommunicationPreferences"
import SupportFeedback from "../shared/SupportFeedback"
const cartInitial = []
function Sidebar({ page, setPage, onLogout, cartCount, user, t }) {
  const links = [
    { id: "dashboard", icon: _jsx(Home, { size: 18 }), label: t("dashboard") },
    { id: "browse", icon: _jsx(Search, { size: 18 }), label: t("browse") },
    {
      id: "cart",
      icon: _jsx(ShoppingCart, { size: 18 }),
      label: t("cart"),
      badge: cartCount,
    },
    { id: "history", icon: _jsx(Package, { size: 18 }), label: t("orders") },
    { id: "tracking", icon: _jsx(Truck, { size: 18 }), label: t("tracking") },
    { id: "reminders", icon: _jsx(Bell, { size: 18 }), label: t("reminders") },
    {
      id: "notifications",
      icon: _jsx(Bell, { size: 18 }),
      label: t("notifications"),
    },
    { id: "profile", icon: _jsx(User, { size: 18 }), label: t("profile") },
    { id: "settings", icon: _jsx(Settings, { size: 18 }), label: t("settings") },
  ]
  return _jsxs("aside", {
    className:
      "w-60 h-full min-h-0 flex-shrink-0 overflow-hidden bg-gradient-to-b from-green-700 to-green-800 p-5 flex flex-col",
    children: [
      _jsxs("div", {
        className: "flex items-center gap-2.5 mb-8",
        children: [
          _jsx("div", {
            className:
              "w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center",
            children: _jsx("span", {
              className: "text-white text-lg",
              children: "\uD83D\uDED2",
            }),
          }),
          _jsx("span", {
            className: "text-lg font-bold font-display text-white",
            children: "CyberFresh",
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
                  : "text-green-100 hover:text-white"
              }`,
              children: [
                l.icon,
                _jsx("span", { className: "flex-1", children: l.label }),
                "badge" in l &&
                  l.badge > 0 &&
                  _jsx("span", {
                    className:
                      "bg-orange-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                    children: l.badge,
                  }),
              ],
            },
            l.id,
          ),
        ),
      }),
      _jsxs("div", {
        className: "flex-shrink-0 pt-4 border-t border-green-600",
        children: [
          _jsxs("div", {
            className: "flex items-center gap-3 mb-3 px-2",
            children: [
              user?.avatar
                ? _jsx("img", {
                    src: user.avatar,
                    alt: `${user.name || "Customer"} profile`,
                    className: "w-9 h-9 rounded-xl object-cover",
                  })
                : _jsx("div", {
                    className: "w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold",
                    children: (user?.name || "C").slice(0, 1).toUpperCase(),
                  }),
              _jsxs("div", {
                children: [
                  _jsx("p", {
                    className: "text-white text-sm font-bold font-display",
                    children: user?.name || "Customer account",
                  }),
                  _jsx("p", {
                    className: "text-green-100 text-xs font-semibold",
                    children: "Customer",
                  }),
                ],
              }),
            ],
          }),
          _jsxs("button", {
            onClick: onLogout,
            className:
              "sidebar-link w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-red-300 hover:text-red-200",
            children: [_jsx(LogOut, { size: 16 }), " Logout"],
          }),
        ],
      }),
    ],
  })
}
function TopNav({ page, cartCount, setPage, dark, onToggleDark, user, language, onLanguageChange, t }) {
  const titles = {
    dashboard: "dashboard",
    browse: "browse",
    cart: "cart",
    checkout: "Checkout",
    tracking: "tracking",
    history: "orders",
    reminders: "reminders",
    notifications: "notifications",
    profile: "profile",
    settings: "settings",
    "product-detail": "Product Details",
  }
  return _jsxs("header", {
    className:
      "glass sticky top-0 z-30 px-6 py-4 flex items-center justify-between border-b border-white/60 dark:border-white/10",
    children: [
      _jsxs("div", {
        children: [
          _jsx("h1", {
            className:
              "text-lg font-bold text-gray-900 dark:text-gray-100 font-display",
            children: t(titles[page]),
          }),
          _jsx("p", {
            className: "text-xs text-gray-600 dark:text-gray-400 font-medium",
            children: new Date().toLocaleDateString(),
          }),
        ],
      }),
      _jsxs("div", {
        className: "flex items-center gap-3",
        children: [
          _jsx(LanguageSelector, { language: language, onLanguageChange: onLanguageChange, t: t }),
          _jsx("button", {
            className: "relative",
            onClick: onToggleDark,
            "aria-label": "Toggle dark mode",
            children: dark
              ? _jsx(Sun, {
                  size: 20,
                  className: "text-gray-500 dark:text-gray-400",
                })
              : _jsx(Moon, { size: 20, className: "text-gray-500" }),
          }),
          _jsxs("button", {
            className: "relative",
            onClick: () => setPage("notifications"),
            children: [
              _jsx(Bell, {
                size: 20,
                className: "text-gray-500 dark:text-gray-400",
              }),
            ],
          }),
          _jsxs("button", {
            onClick: () => setPage("cart"),
            className: "relative",
            children: [
              _jsx(ShoppingCart, {
                size: 20,
                className: "text-gray-500 dark:text-gray-400",
              }),
              cartCount > 0 &&
                _jsx("span", {
                  className:
                    "absolute -top-1 -right-1 w-4 h-4 bg-green-600 rounded-full text-white text-xs flex items-center justify-center",
                  children: cartCount,
                }),
            ],
          }),
          _jsx("button", {
            className: "w-9 h-9 rounded-xl bg-green-100 text-green-700 font-bold overflow-hidden",
            onClick: () => setPage("profile"),
            "aria-label": "Open profile",
            children: user?.avatar
              ? _jsx("img", {
                  src: user.avatar,
                  alt: `${user.name || "Customer"} profile`,
                  className: "w-full h-full object-cover",
                })
              : (user?.name || "C").slice(0, 1).toUpperCase(),
          }),
        ],
      }),
    ],
  })
}
function ProductCard({ product, onAdd, onNotify, onDetail }) {
  const { t } = useLanguage()
  const outOfStock = product.stockStatus === "Out of Stock"
  return _jsxs("div", {
    className:
      "glass product-card rounded-2xl overflow-hidden border border-white/60",
    children: [
      _jsxs("div", {
        className: "relative cursor-pointer",
        onClick: onDetail,
        children: [
          _jsx("img", {
            src: product.image,
            alt: product.name,
            className: "w-full h-44 object-cover",
          }),
          _jsxs("div", {
            className: "absolute top-3 left-3 flex flex-wrap gap-1",
            children: [
              product.organic &&
                _jsx(Badge, {
                  color: "green",
                  children: "\uD83C\uDF3F Organic",
                }),
              product.discount > 30 &&
                _jsxs(Badge, {
                  color: "orange",
                  children: ["\uD83D\uDD25 ", product.discount, "%"],
                }),
              product.stockStatus === "Low Stock" &&
                _jsx(Badge, { color: "yellow", children: "\u26A0 Low" }),
            ],
          }),
          _jsx("div", {
            className: "absolute bottom-3 right-3",
            children: _jsx(FreshnessBadge, { score: product.freshnessScore }),
          }),
        ],
      }),
      _jsxs("div", {
        className: "p-4",
        children: [
          _jsxs("div", {
            className: "flex items-start gap-2 mb-2",
            children: [
              _jsx(FreshnessRing, { score: product.freshnessScore }),
              _jsxs("div", {
                className: "flex-1 min-w-0",
                children: [
                  _jsx("h3", {
                    className:
                      "font-bold text-gray-900 dark:text-gray-100 font-display text-sm truncate",
                    children: t(product.name),
                  }),
                  _jsxs("div", {
                    className:
                      "flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5",
                    children: [
                      _jsx(MapPin, { size: 10 }),
                      _jsx("span", {
                        className: "truncate",
                        children: product.vendorName || "Vendor unavailable",
                      }),
                      _jsx("span", {
                        className: "text-gray-400 dark:text-gray-500",
                        children: "\u00B7",
                      }),
                      product.distance || "Location unavailable",
                    ],
                  }),
                  product.rating > 0 && _jsxs("div", {
                    className: "flex items-center gap-1 mt-0.5",
                    children: [_jsx(Star, { size: 10, fill: "#EAB308", className: "text-yellow-500" }), _jsx("span", { className: "text-xs font-semibold text-gray-700 dark:text-gray-300", children: product.rating })],
                  }),
                ],
              }),
            ],
          }),
          _jsxs("div", {
            className: "grid grid-cols-2 gap-1.5 mb-3 text-xs",
            children: [
              _jsxs("div", {
                className: "bg-green-50 rounded-lg px-2 py-1.5",
                children: [
                  _jsx("p", {
                    className: "text-gray-600 dark:text-gray-400 font-medium",
                    children: "Shelf Life",
                  }),
                  _jsx("p", {
                    className: "text-green-700 font-bold",
                    children: product.shelfLife,
                  }),
                ],
              }),
              _jsxs("div", {
                className: "bg-orange-50 rounded-lg px-2 py-1.5",
                children: [
                  _jsx("p", {
                    className: "text-gray-600 dark:text-gray-400 font-medium",
                    children: "Harvest",
                  }),
                  _jsx("p", {
                    className: "text-orange-700 font-bold text-xs",
                    children: product.harvestDate,
                  }),
                ],
              }),
            ],
          }),
          _jsxs("div", {
            className: "flex items-center justify-between mb-3",
            children: [
              _jsxs("div", {
                children: [
                  _jsxs("span", {
                    className:
                      "text-lg font-black text-gray-900 dark:text-gray-100 font-display",
                    children: ["\u20B9", product.discountedPrice],
                  }),
                  _jsxs("span", {
                    className:
                      "text-xs text-gray-400 dark:text-gray-500 line-through ml-1.5",
                    children: ["\u20B9", product.originalPrice],
                  }),
                  _jsxs("span", {
                    className: "text-xs text-green-600 font-bold ml-1",
                    children: ["\u2212", product.discount, "%"],
                  }),
                ],
              }),
              _jsx(Badge, {
                color: outOfStock
                  ? "red"
                  : product.stockStatus === "Low Stock"
                    ? "orange"
                    : "green",
                children: product.stockStatus,
              }),
            ],
          }),
          outOfStock
            ? _jsxs("button", {
                onClick: () => onNotify(product),
                className:
                  "w-full border-2 border-orange-300 text-orange-600 font-semibold text-sm py-2.5 rounded-xl hover:bg-orange-50 transition-all flex items-center justify-center gap-2",
                children: [_jsx(Bell, { size: 14 }), " Notify Me"],
              })
            : _jsxs("div", {
                className: "flex gap-2",
                children: [
                  _jsxs("button", {
                    onClick: onAdd,
                    className:
                      "flex-1 btn-primary text-white font-semibold text-sm py-2.5 rounded-xl flex items-center justify-center gap-1.5",
                    children: [_jsx(Plus, { size: 14 }), " Add"],
                  }),
                  _jsx("button", {
                    onClick: onDetail,
                    className:
                      "flex-1 border border-green-200 text-green-700 font-semibold text-sm py-2.5 rounded-xl hover:bg-green-50 transition-all",
                    children: "Buy Now",
                  }),
                ],
              }),
        ],
      }),
    ],
  })
}
function Dashboard({ setPage, onAdd }) {
  const flashSaleItems = products.filter((p) => p.discount >= 28)
  return _jsxs("div", {
    className: "p-6 space-y-8",
    children: [
      _jsxs("div", {
        className:
          "gradient-hero hero-pattern rounded-2xl p-6 flex items-center justify-between",
        children: [
          _jsxs("div", {
            children: [
              _jsx("p", {
                className: "text-green-100 text-sm mb-1 font-semibold",
                children: "Good Morning \uD83C\uDF3F",
              }),
              _jsx("h2", {
                className: "text-2xl font-black text-white font-display",
                children: "Welcome back, devansh chouhan! \uD83D\uDC4B",
              }),
              _jsx("p", {
                className: "text-green-100 text-sm mt-1 font-medium",
                children: "You have 3 active orders and 2 reminders waiting",
              }),
              _jsxs("div", {
                className: "flex gap-3 mt-4",
                children: [
                  _jsx("button", {
                    onClick: () => setPage("browse"),
                    className:
                      "bg-white text-green-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-green-50 transition-all",
                    children: "Browse Fresh",
                  }),
                  _jsx("button", {
                    onClick: () => setPage("history"),
                    className:
                      "glass-green text-white text-sm px-4 py-2 rounded-xl font-medium",
                    children: "View Orders",
                  }),
                ],
              }),
            ],
          }),
          _jsx("img", {
            src: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200&h=150&fit=crop",
            className:
              "w-40 h-28 rounded-xl object-cover hidden md:block opacity-80",
          }),
        ],
      }),
      _jsxs("div", {
        className: "grid grid-cols-2 md:grid-cols-4 gap-4",
        children: [
          _jsx(StatCard, {
            icon: _jsx(Package, { size: 22 }),
            label: "Total Orders",
            value: "28",
            sub: "\u2191 3 this month",
          }),
          _jsx(StatCard, {
            icon: _jsx(Tag, { size: 22 }),
            label: "Money Saved",
            value: "\u20B94,280",
            sub: "On discounts",
            color: "#FF9800",
            bg: "#FFF3E0",
          }),
          _jsx(StatCard, {
            icon: _jsx(Star, { size: 22 }),
            label: "Loyalty Points",
            value: "1,840",
            sub: "Redeem anytime",
            color: "#FBC02D",
            bg: "#FFFDE7",
          }),
          _jsx(StatCard, {
            icon: _jsx("span", {
              className: "text-lg",
              children: "\uD83C\uDF31",
            }),
            label: "Meals Contributed",
            value: "14",
            sub: "Via donations",
          }),
        ],
      }),
      _jsxs("div", {
        children: [
          _jsx(SectionTitle, {
            sub: "Shop by category",
            children: "Categories",
          }),
          _jsx("div", {
            className: "flex gap-3 overflow-x-auto pb-2",
            children: [
              ["🍎", "Fruits"],
              ["🥦", "Vegetables"],
              ["🌿", "Organic"],
              ["🔥", "Flash Sale"],
              ["⭐", "Featured"],
              ["🍋", "Citrus"],
              ["🫐", "Berries"],
              ["🥕", "Root Veg"],
            ].map(([emoji, label]) =>
              _jsxs(
                "button",
                {
                  onClick: () => setPage("browse"),
                  className:
                    "flex-shrink-0 glass rounded-xl px-4 py-3 flex flex-col items-center gap-1 hover:shadow-md transition-all hover:border-green-200 border border-transparent",
                  children: [
                    _jsx("span", { className: "text-2xl", children: emoji }),
                    _jsx("span", {
                      className:
                        "text-xs font-semibold text-gray-700 dark:text-gray-300",
                      children: label,
                    }),
                  ],
                },
                label,
              ),
            ),
          }),
        ],
      }),
      _jsxs("div", {
        className:
          "bg-gradient-to-r from-orange-500 to-amber-400 rounded-2xl p-5",
        children: [
          _jsxs("div", {
            className: "flex items-center gap-2 mb-4",
            children: [
              _jsx(Zap, { size: 18, className: "text-white", fill: "white" }),
              _jsx("h3", {
                className: "text-white font-bold font-display",
                children: "Flash Sale \u2014 Ends in 1:59:42 \u23F1",
              }),
            ],
          }),
          _jsx("div", {
            className: "grid grid-cols-2 md:grid-cols-4 gap-3",
            children: flashSaleItems.map((p) =>
              _jsxs(
                "div",
                {
                  className:
                    "bg-white/20 backdrop-blur rounded-xl p-3 cursor-pointer hover:bg-white/30 transition-all",
                  onClick: () => setPage("browse"),
                  children: [
                    _jsx("img", {
                      src: p.image,
                      alt: p.name,
                      className: "w-full h-24 object-cover rounded-lg mb-2",
                    }),
                    _jsx("p", {
                      className:
                        "text-white text-xs font-bold font-display truncate",
                      children: p.name,
                    }),
                    _jsxs("div", {
                      className: "flex items-center gap-2 mt-1",
                      children: [
                        _jsxs("span", {
                          className: "text-white font-black text-sm",
                          children: ["\u20B9", p.discountedPrice],
                        }),
                        _jsxs(Badge, {
                          color: "yellow",
                          children: [p.discount, "% OFF"],
                        }),
                      ],
                    }),
                  ],
                },
                p.id,
              ),
            ),
          }),
        ],
      }),
      _jsxs("div", {
        children: [
          _jsx(SectionTitle, {
            sub: "AI-powered picks just for you",
            children: "Recommended for You \uD83E\uDD16",
          }),
          _jsx("div", {
            className: "grid grid-cols-2 md:grid-cols-4 gap-5",
            children: products
              .slice(0, 4)
              .map((p) =>
                _jsx(
                  ProductCard,
                  {
                    product: p,
                    onAdd: () => onAdd(p),
                    onNotify: () => setPage("reminders"),
                    onDetail: () => setPage("product-detail"),
                  },
                  p.id,
                ),
              ),
          }),
        ],
      }),
      _jsxs("div", {
        children: [
          _jsx(SectionTitle, {
            sub: "Your recent purchases",
            children: "Recent Orders",
          }),
          _jsx("div", {
            className: "space-y-3",
            children: orders
              .slice(0, 3)
              .map((o) =>
                _jsxs(
                  "div",
                  {
                    className:
                      "glass rounded-xl p-4 flex items-center justify-between",
                    children: [
                      _jsxs("div", {
                        className: "flex items-center gap-4",
                        children: [
                          _jsx("div", {
                            className:
                              "w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center",
                            children: _jsx(Package, {
                              size: 18,
                              className: "text-green-600",
                            }),
                          }),
                          _jsxs("div", {
                            children: [
                              _jsx("p", {
                                className:
                                  "font-semibold text-gray-900 dark:text-gray-100 text-sm font-display",
                                children: o.id,
                              }),
                              _jsx("p", {
                                className:
                                  "text-xs text-gray-500 dark:text-gray-400",
                                children: o.products.join(", "),
                              }),
                              _jsxs("p", {
                                className:
                                  "text-xs text-gray-400 dark:text-gray-500 mt-0.5",
                                children: [
                                  o.date,
                                  " \u00B7 ",
                                  o.items,
                                  " items",
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        className: "text-right",
                        children: [
                          _jsxs("p", {
                            className:
                              "font-bold text-gray-900 dark:text-gray-100 font-display",
                            children: ["\u20B9", o.total],
                          }),
                          _jsx(Badge, {
                            color:
                              o.status === "Delivered"
                                ? "green"
                                : o.status === "Cancelled"
                                  ? "red"
                                  : o.status === "Confirmed"
                                    ? "blue"
                                    : "orange",
                            children: o.status,
                          }),
                        ],
                      }),
                    ],
                  },
                  o.id,
                ),
              ),
          }),
          _jsxs("button", {
            onClick: () => setPage("history"),
            className:
              "mt-3 text-green-600 text-sm font-semibold flex items-center gap-1 hover:text-green-700",
            children: ["View all orders ", _jsx(ChevronRight, { size: 14 })],
          }),
        ],
      }),
      _jsxs("div", {
        children: [
          _jsx(SectionTitle, {
            sub: "What's trending right now",
            children: "Trending Products \uD83D\uDCC8",
          }),
          _jsx("div", {
            className: "grid grid-cols-2 md:grid-cols-4 gap-5",
            children: products
              .slice(4, 8)
              .map((p) =>
                _jsx(
                  ProductCard,
                  {
                    product: p,
                    onAdd: () => onAdd(p),
                    onNotify: () => setPage("reminders"),
                    onDetail: () => setPage("product-detail"),
                  },
                  p.id,
                ),
              ),
          }),
        ],
      }),
    ],
  })
}
function Browse({ onAdd, onNotify, onDetail, customerAddress }) {
  const [search, setSearch] = useState("")
  const [cat, setCat] = useState("All")
  const [items, setItems] = useState([])
  const [vendorIds, setVendorIds] = useState(null)
  const [vendorDistances, setVendorDistances] = useState(null)
  const [vendorsLoading, setVendorsLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(false)
  const [error, setError] = useState("")
  const [address, setAddress] = useState(customerAddress || "")
  const [destination, setDestination] = useState(
    customerAddress ? { address: customerAddress } : null,
  )
  const cats = ["All", "Fruits", "Vegetables", "Organic"]

  useEffect(() => {
    if (!customerAddress) return
    setAddress(customerAddress)
    setVendorIds(null)
    setVendorDistances(null)
    setDestination({ address: customerAddress })
  }, [customerAddress])

  useEffect(() => {
    if (!destination) {
      setVendorIds(null)
      setVendorDistances(null)
      return
    }
    let active = true
    setVendorIds(null)
    setVendorDistances(null)
    setError("")
    setVendorsLoading(true)
    getNearbyVendors(destination)
      .then((vendors) => {
        if (active) {
          setVendorIds(vendors.map((vendor) => String(vendor._id)))
          setVendorDistances(Object.fromEntries(
            vendors
              .filter((vendor) => Number.isFinite(vendor.deliveryDistanceKm))
              .map((vendor) => [String(vendor._id), vendor.deliveryDistanceKm]),
          ))
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Failed to find nearby vendors.")
      })
      .finally(() => {
        if (active) setVendorsLoading(false)
      })
    return () => {
      active = false
    }
  }, [destination])

  useEffect(() => {
    if (!destination || vendorIds === null || vendorDistances === null) {
      setItems([])
      return
    }
    if (vendorIds.length === 0) {
      setItems([])
      return
    }
    let active = true
    setProductsLoading(true)
    getProducts({
      category: cat !== "All" && cat !== "Organic" ? cat : undefined,
      organic: cat === "Organic",
      search: search || undefined,
    })
      .then((products) => {
        if (!active) return
        const nearbyIds = new Set(vendorIds)
        setItems(products
          .filter((product) => nearbyIds.has(String(product.vendor)))
          .map((product) => {
            const distance = vendorDistances[String(product.vendor)]
            return {
              ...product,
              distance: Number.isFinite(distance) ? `${distance.toFixed(1)} km` : null,
            }
          }))
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Failed to load products")
      })
      .finally(() => {
        if (active) setProductsLoading(false)
      })
    return () => {
      active = false
    }
  }, [cat, destination, search, vendorDistances, vendorIds])

  const loading = vendorsLoading || productsLoading

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("This browser does not support location sharing. Use your saved address instead.")
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setAddress("")
        setVendorIds(null)
        setVendorDistances(null)
        setDestination({ latitude: coords.latitude, longitude: coords.longitude })
      },
      (locationError) => {
        setError(locationError.message || "Allow location access or use your saved address.")
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    )
  }

  return _jsxs("div", {
    className: "p-6",
    children: [
      _jsxs("form", {
        className: "mb-5 flex flex-wrap gap-3",
        onSubmit: (event) => {
          event.preventDefault()
          if (!address.trim()) {
            setError("Enter a delivery address to find nearby vendors.")
            return
          }
          setVendorIds(null)
          setVendorDistances(null)
          setDestination({ address: address.trim() })
        },
        children: [
          _jsx("input", {
            value: address,
            onChange: (event) => setAddress(event.target.value),
            maxLength: 500,
            placeholder: "Your saved delivery address",
            "aria-label": "Delivery address for product search",
            className: "min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800",
          }),
          _jsx("button", {
            type: "submit",
            disabled: loading || !address.trim(),
            className: "btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50",
            children: "Use address",
          }),
          _jsx("button", {
            type: "button",
            onClick: useCurrentLocation,
            disabled: loading,
            className: "rounded-xl border border-green-700 px-4 py-2.5 text-sm font-semibold text-green-800 disabled:opacity-50",
            children: "Use my location",
          }),
        ],
      }),
      _jsx("p", {
        className: "mb-4 text-xs text-gray-500 dark:text-gray-400",
        children: "Products are shown only when the vendor is within a 10 km driving distance.",
      }),
      _jsxs("div", {
        className: "flex gap-4 mb-6",
        children: [
          _jsxs("div", {
            className:
              "flex-1 flex items-center gap-2 glass rounded-xl px-4 py-2.5",
            children: [
              _jsx(Search, {
                size: 16,
                className: "text-gray-400 dark:text-gray-500",
              }),
              _jsx("input", {
                value: search,
                onChange: (e) => setSearch(e.target.value),
                placeholder: "Search fruits, vegetables...",
                className:
                  "flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none",
              }),
            ],
          }),
        ],
      }),
      _jsx("div", {
        className: "flex gap-2 mb-6",
        children: cats.map((c) =>
          _jsx(
            "button",
            {
              onClick: () => setCat(c),
              className: `px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                cat === c
                  ? "btn-primary text-white"
                  : "glass text-gray-600 dark:text-gray-400 hover:text-green-700"
              }`,
              children: c,
            },
            c,
          ),
        ),
      }),
      loading
        ? _jsx("div", {
            className: "text-center py-16 text-gray-400 dark:text-gray-500",
            children: "Loading products...",
          })
        : error
          ? _jsxs("div", {
              className: "text-center py-16",
              children: [
                _jsx("p", {
                  className: "font-semibold text-red-500",
                  children: error,
                }),
                _jsx("p", {
                  className: "text-sm text-gray-400 mt-1",
                  children:
                    "Check that your delivery address and the vendor pickup address are complete, then try again.",
                }),
              ],
            })
          : !destination
            ? _jsxs("div", {
                className: "text-center py-16 text-gray-400 dark:text-gray-500",
                children: [
                  _jsx(MapPin, { size: 40, className: "mx-auto mb-3 opacity-30" }),
                  _jsx("p", { className: "font-semibold", children: "Set your delivery location to browse nearby products" }),
                ],
              })
            : items.length === 0
              ? _jsxs("div", {
                className: "text-center py-16 text-gray-400 dark:text-gray-500",
                children: [
                  _jsx(Search, {
                    size: 40,
                    className: "mx-auto mb-3 opacity-30",
                  }),
                  _jsx("p", {
                    className: "font-semibold",
                    children: "No products are available from vendors within 10 km of this location.",
                  }),
                  _jsx("p", {
                    className: "mt-2 text-sm",
                    children: "Only active vendors with active products and complete pickup addresses appear here. If the address is the same, use the exact street, city, state, and PIN code in both profiles.",
                  }),
                ],
              })
            : _jsx("div", {
                className:
                  "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5",
                children: items.map((p) =>
                  _jsx(
                    ProductCard,
                    {
                      product: p,
                      onAdd: () => onAdd(p),
                      onNotify: onNotify,
                      onDetail: () => onDetail(p),
                    },
                    p._id,
                  ),
                ),
              }),
    ],
  })
}
function Cart({ cart, setCart, setPage }) {
  const cartId = (item) => item._id ?? item.id
  const update = (id, delta) =>
    setCart((current) =>
      current.map((item) => {
        if (String(cartId(item)) !== String(id)) return item
        const maxQuantity = Number.isFinite(Number(item.stock))
          ? Number(item.stock)
          : Number.POSITIVE_INFINITY
        return {
          ...item,
          qty: Math.min(maxQuantity, Math.max(1, item.qty + delta)),
        }
      }),
    )
  const remove = (id) =>
    setCart((current) => current.filter((item) => String(cartId(item)) !== String(id)))
  const subtotal = cart.reduce((s, i) => s + i.discountedPrice * i.qty, 0)
  const delivery = 40
  const total = subtotal + delivery
  return _jsx("div", {
    className: "p-6",
    children:
      cart.length === 0
        ? _jsxs("div", {
            className: "text-center py-20",
            children: [
              _jsx(ShoppingCart, {
                size: 60,
                className: "mx-auto text-gray-200 mb-4",
              }),
              _jsx("h3", {
                className:
                  "text-xl font-bold text-gray-700 dark:text-gray-300 font-display",
                children: "Your cart is empty",
              }),
              _jsx("p", {
                className: "text-gray-400 dark:text-gray-500 mt-2 mb-6",
                children: "Add fresh products to get started",
              }),
              _jsx("button", {
                onClick: () => setPage("browse"),
                className:
                  "btn-primary text-white font-semibold px-6 py-3 rounded-xl",
                children: "Browse Products",
              }),
            ],
          })
        : _jsxs("div", {
            className: "grid md:grid-cols-3 gap-6",
            children: [
              _jsx("div", {
                className: "md:col-span-2 space-y-4",
                children: cart.map((item) =>
                  _jsxs(
                    "div",
                    {
                      className:
                        "glass rounded-2xl p-4 flex items-center gap-4",
                      children: [
                        _jsx("img", {
                          src: item.image,
                          alt: item.name,
                          className:
                            "w-20 h-20 object-cover rounded-xl flex-shrink-0",
                        }),
                        _jsxs("div", {
                          className: "flex-1 min-w-0",
                          children: [
                            _jsxs("div", {
                              className: "flex items-start justify-between",
                              children: [
                                _jsxs("div", {
                                  children: [
                                    _jsx("p", {
                                      className:
                                        "font-bold text-gray-900 dark:text-gray-100 font-display text-sm",
                                      children: item.name,
                                    }),
                                    _jsxs("p", {
                                      className:
                                        "text-xs text-gray-500 dark:text-gray-400",
                                      children: [
                                        item.vendorName,
                                        " \u00B7 ",
                                        item.unit,
                                      ],
                                    }),
                                    _jsx(FreshnessBadge, {
                                      score: item.freshnessScore,
                                    }),
                                  ],
                                }),
                                _jsx("button", {
                                  onClick: () => remove(cartId(item)),
                                  "aria-label": `Remove ${item.name} from cart`,
                                  className: "text-red-400 hover:text-red-600",
                                  children: _jsx(Trash2, { size: 15 }),
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className:
                                "flex items-center justify-between mt-3",
                              children: [
                                _jsxs("div", {
                                  className:
                                    "flex items-center gap-2 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden",
                                  children: [
                                    _jsx("button", {
                                      onClick: () => update(cartId(item), -1),
                                      disabled: item.qty <= 1,
                                      "aria-label": `Decrease ${item.name} quantity`,
                                      className:
                                        "w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-700 transition-all disabled:cursor-not-allowed disabled:opacity-40",
                                      children: _jsx(Minus, { size: 12 }),
                                    }),
                                    _jsx("span", {
                                      className:
                                        "text-sm font-bold font-display px-1",
                                      children: item.qty,
                                    }),
                                    _jsx("button", {
                                      onClick: () => update(cartId(item), 1),
                                      disabled: Number(item.qty) >= Number(item.stock),
                                      "aria-label": `Increase ${item.name} quantity`,
                                      className:
                                        "w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-700 transition-all disabled:cursor-not-allowed disabled:opacity-40",
                                      children: _jsx(Plus, { size: 12 }),
                                    }),
                                  ],
                                }),
                                _jsxs("div", {
                                  className: "text-right",
                                  children: [
                                    _jsxs("p", {
                                      className:
                                        "font-bold text-gray-900 dark:text-gray-100 font-display",
                                      children: [
                                        "\u20B9",
                                        (
                                          item.discountedPrice * item.qty
                                        ).toLocaleString(),
                                      ],
                                    }),
                                    _jsxs("p", {
                                      className:
                                        "text-xs text-gray-400 dark:text-gray-500 line-through",
                                      children: [
                                        "\u20B9",
                                        (
                                          item.originalPrice * item.qty
                                        ).toLocaleString(),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    },
                    cartId(item),
                  ),
                ),
              }),
              _jsxs("div", {
                className: "space-y-4",
                children: [
                  _jsxs("div", {
                    className: "glass rounded-2xl p-5 space-y-3",
                    children: [
                      _jsx("h3", {
                        className:
                          "font-bold text-gray-900 dark:text-gray-100 font-display",
                        children: "Order Summary",
                      }),
                      _jsxs("div", {
                        className: "space-y-2 text-sm",
                        children: [
                          _jsxs("div", {
                            className:
                              "flex justify-between text-gray-600 dark:text-gray-400",
                            children: [
                              _jsx("span", { children: "Subtotal" }),
                              _jsxs("span", { children: ["\u20B9", subtotal] }),
                            ],
                          }),
                          _jsxs("div", {
                            className:
                              "flex justify-between text-gray-600 dark:text-gray-400",
                            children: [
                              _jsx("span", { children: "Delivery" }),
                              _jsxs("span", { children: ["\u20B9", delivery] }),
                            ],
                          }),
                          _jsxs("div", {
                            className:
                              "flex justify-between text-green-600 font-semibold",
                            children: [
                              _jsx("span", { children: "Savings" }),
                              _jsxs("span", {
                                children: [
                                  "\u2212\u20B9",
                                  cart.reduce(
                                    (s, i) =>
                                      s +
                                      (i.originalPrice - i.discountedPrice) *
                                        i.qty,
                                    0,
                                  ),
                                ],
                              }),
                            ],
                          }),
                          _jsxs("div", {
                            className:
                              "border-t border-gray-100 dark:border-slate-700 pt-2 flex justify-between font-black text-gray-900 dark:text-gray-100 font-display text-base",
                            children: [
                              _jsx("span", { children: "Total" }),
                              _jsxs("span", { children: ["\u20B9", total] }),
                            ],
                          }),
                        ],
                      }),
                      _jsx("button", {
                        onClick: () => setPage("checkout"),
                        className:
                          "btn-primary text-white font-bold w-full py-3.5 rounded-xl text-sm",
                        children: "Proceed to Checkout",
                      }),
                    ],
                  }),
                  _jsxs("div", {
                    className:
                      "glass rounded-2xl p-4 text-xs text-gray-500 dark:text-gray-400 space-y-1.5",
                    children: [
                      _jsxs("p", {
                        className: "flex items-center gap-2",
                        children: [
                          _jsx(CheckCircle, {
                            size: 14,
                            className: "text-green-600",
                          }),
                          "Freshness guaranteed",
                        ],
                      }),
                      _jsxs("p", {
                        className: "flex items-center gap-2",
                        children: [
                          _jsx(CheckCircle, {
                            size: 14,
                            className: "text-green-600",
                          }),
                          "Easy returns within 24 hours",
                        ],
                      }),
                      _jsxs("p", {
                        className: "flex items-center gap-2",
                        children: [
                          _jsx(CheckCircle, {
                            size: 14,
                            className: "text-green-600",
                          }),
                          "Secure payment processing",
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
  })
}
function Checkout({ cart, setCart, setPage, savedAddress }) {
  const [payment, setPayment] = useState("cod")
  const [razorpayConfigured, setRazorpayConfigured] = useState(false)
  const [address, setAddress] = useState("")
  const [placed, setPlaced] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState("")
  const [orderId, setOrderId] = useState("")
  const [communications, setCommunications] = useState(null)
  const [deliveryLocation, setDeliveryLocation] = useState(null)
  const [deliveryQuote, setDeliveryQuote] = useState(null)
  const [quotingDelivery, setQuotingDelivery] = useState(false)
  const [locationMessage, setLocationMessage] = useState("")
  useEffect(() => {
    if (!address && savedAddress) setAddress(savedAddress)
  }, [address, savedAddress])
  useEffect(() => {
    let active = true
    api.get("/api/payment/config")
      .then((config) => {
        if (active) setRazorpayConfigured(Boolean(config.isConfigured && config.keyId))
      })
      .catch((configError) => {
        if (active) setError(configError.message || "Could not check online payment availability.")
      })
    return () => {
      active = false
    }
  }, [])
  const subtotal = cart.reduce((s, i) => s + i.discountedPrice * i.qty, 0)
  const delivery = deliveryQuote?.deliveryFee ?? 40
  const total = subtotal + delivery
  const finishOrder = (order) => {
    setOrderId(order.orderId)
    setCommunications(order.communications || null)
    setCart([])
    setPlaced(true)
  }
  const loadRazorpay = () => new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve()
      return
    }
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true })
      existingScript.addEventListener("error", () => reject(new Error("Could not load Razorpay Checkout.")), { once: true })
      return
    }
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = resolve
    script.onerror = () => reject(new Error("Could not load Razorpay Checkout."))
    document.body.appendChild(script)
  })
  const handlePlaceOrder = async () => {
    setError("")
    setPlacing(true)
    try {
      const items = cart.map((item) => ({ productId: item._id ?? item.id, qty: item.qty }))
      if (payment === "cod") {
        finishOrder(await apiCreateOrder({ items, paymentMethod: payment, address, deliveryLocation }))
      } else {
        await loadRazorpay()
        const paymentOrder = await api.post("/api/payment/create-order", { items, address, deliveryLocation })
        await new Promise((resolve, reject) => {
          let completed = false
          const complete = (callback, value) => {
            if (completed) return
            completed = true
            callback(value)
          }
          const checkout = new window.Razorpay({
            key: paymentOrder.keyId,
            amount: paymentOrder.amountInPaise,
            currency: paymentOrder.currency,
            name: "Cyber Fresh",
            description: "Marketplace order",
            order_id: paymentOrder.orderId,
            prefill: { name: "", email: "" },
            theme: { color: "#16a34a" },
            handler: async (response) => {
              try {
                const result = await api.post("/api/payment/verify", {
                  ...response,
                  items,
                  address,
                  deliveryLocation,
                  paymentMethod: "razorpay",
                })
                finishOrder(result.order)
                complete(resolve, result)
              } catch (verificationError) {
                complete(reject, verificationError)
              }
            },
            modal: {
              ondismiss: () => complete(reject, new Error("Payment was cancelled. Your cart is unchanged.")),
            },
          })
          checkout.on("payment.failed", (failure) => {
            const message = failure.error?.description || "Razorpay could not complete this payment."
            complete(reject, new Error(message))
          })
          checkout.open()
        })
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not place order. Are you signed in?",
      )
    } finally {
      setPlacing(false)
    }
  }
  const captureDeliveryLocation = () => {
    setLocationMessage("")
    setDeliveryQuote(null)
    setDeliveryLocation(null)
    if (!navigator.geolocation) {
      setLocationMessage("This browser does not support location. You can still place an order; location-based delivery pricing needs GPS.")
      return
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const location = { latitude: coords.latitude, longitude: coords.longitude }
        setQuotingDelivery(true)
        try {
          const quote = await api.post("/api/orders/delivery-quote", {
            productIds: cart.map((item) => item._id ?? item.id),
            deliveryLocation: location,
          })
          setDeliveryLocation(location)
          setDeliveryQuote(quote)
          setLocationMessage(`Estimated route: ${quote.distanceKm} km. Distance-based delivery charge: ₹${quote.deliveryFee}.`)
        } catch (quoteError) {
          setLocationMessage(`${quoteError.message} You can still order with the standard ₹40 charge.`)
        } finally {
          setQuotingDelivery(false)
        }
      },
      (locationError) => setLocationMessage(locationError.message || "Location permission was not granted. You can still place the order."),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    )
  }
  if (placed)
    return _jsx("div", {
      className: "p-6 flex flex-col items-center justify-center min-h-96",
      children: _jsxs("div", {
        className: "text-center glass rounded-3xl p-10 max-w-md",
        children: [
          _jsx("div", {
            className:
              "w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4",
            children: _jsx(CheckCircle, {
              size: 40,
              className: "text-green-600",
            }),
          }),
          _jsx("h2", {
            className:
              "text-2xl font-black text-gray-900 dark:text-gray-100 font-display mb-2",
            children: "Order Placed! \uD83C\uDF89",
          }),
          _jsxs("p", {
            className: "text-gray-500 dark:text-gray-400 mb-1",
            children: [
              "Your order ",
              _jsx("strong", {
                className: "text-gray-700 dark:text-gray-300",
                children: orderId,
              }),
              " has been placed.",
            ],
          }),
          _jsx("p", { className: "text-gray-500 dark:text-gray-400 text-sm mb-6", children: "Delivery timing will be updated when available." }),
          communications && !Array.isArray(communications) && _jsxs("div", {
            className: "text-left text-xs text-gray-600 dark:text-gray-400 space-y-1 mb-5",
            children: [
              _jsx("p", { children: `Email: ${communications.email?.message || "Status unavailable."}` }),
              _jsx("p", { children: "Order updates are available in your in-app notifications." }),
            ],
          }),
          _jsxs("div", {
            className: "flex gap-3",
            children: [
              _jsx("button", {
                onClick: () => setPage("tracking"),
                className:
                  "flex-1 btn-primary text-white font-semibold py-3 rounded-xl text-sm",
                children: "Track Order",
              }),
              _jsx("button", {
                onClick: () => setPage("dashboard"),
                className:
                  "flex-1 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-slate-800",
                children: "Home",
              }),
            ],
          }),
        ],
      }),
    })
  return _jsxs("div", {
    className: "p-6 grid md:grid-cols-3 gap-6",
    children: [
      _jsxs("div", {
        className: "md:col-span-2 space-y-5",
        children: [
          _jsxs("div", {
            className: "glass rounded-2xl p-5",
            children: [
              _jsx("h3", {
                className:
                  "font-bold text-gray-900 dark:text-gray-100 font-display mb-4",
                children: "Delivery Address",
              }),
              _jsxs("div", {
                className: "space-y-3",
                children: [
                  _jsx("input", {
                    value: address,
                    onChange: (event) => setAddress(event.target.value),
                    required: true,
                    maxLength: 500,
                    placeholder: "Enter your delivery address",
                    className:
                      "w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400",
                    "aria-label": "Delivery address",
                  }),
                  _jsxs("div", {
                    className: "flex flex-wrap items-center gap-3",
                    children: [
                      _jsx("button", {
                        type: "button",
                        onClick: captureDeliveryLocation,
                        disabled: quotingDelivery,
                        className: "rounded-lg border border-green-600 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-50",
                        children: quotingDelivery ? "Calculating route..." : deliveryLocation ? "Refresh GPS location" : "Use my location for delivery pricing",
                      }),
                      locationMessage && _jsx("p", {
                        role: "status",
                        className: "text-xs text-gray-500 dark:text-gray-400",
                        children: locationMessage,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          _jsxs("div", {
            className: "glass rounded-2xl p-5",
            children: [
              _jsx("h3", {
                className:
                  "font-bold text-gray-900 dark:text-gray-100 font-display mb-4",
                children: "Payment Method",
              }),
              _jsxs("div", {
                className: "space-y-3",
                children: [
                  _jsxs("label", {
                    className: `flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${payment === "cod" ? "border-green-600 bg-green-50 dark:bg-green-950/20" : "border-gray-200 dark:border-slate-700"}`,
                    children: [
                      _jsx("input", { type: "radio", name: "paymentMethod", value: "cod", checked: payment === "cod", onChange: () => setPayment("cod") }),
                      _jsxs("span", { children: [
                        _jsx("span", { className: "block text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Cash on Delivery" }),
                        _jsx("span", { className: "mt-1 block text-xs text-gray-500 dark:text-gray-400", children: "Pay when your order arrives." }),
                      ] }),
                    ],
                  }),
                  _jsxs("label", {
                    className: `flex items-center gap-3 rounded-xl border p-4 ${razorpayConfigured ? "cursor-pointer" : "cursor-not-allowed opacity-60"} ${payment === "razorpay" ? "border-green-600 bg-green-50 dark:bg-green-950/20" : "border-gray-200 dark:border-slate-700"}`,
                    children: [
                      _jsx("input", { type: "radio", name: "paymentMethod", value: "razorpay", checked: payment === "razorpay", disabled: !razorpayConfigured, onChange: () => setPayment("razorpay") }),
                      _jsxs("span", { children: [
                        _jsx("span", { className: "block text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Pay online with Razorpay" }),
                        _jsx("span", { className: "mt-1 block text-xs text-gray-500 dark:text-gray-400", children: razorpayConfigured ? "UPI, cards, and supported payment methods." : "Razorpay is unavailable until the server is configured." }),
                      ] }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      _jsx("div", {
        children: _jsxs("div", {
          className: "glass rounded-2xl p-5 sticky top-24 space-y-3",
          children: [
            _jsx("h3", {
              className:
                "font-bold text-gray-900 dark:text-gray-100 font-display",
              children: "Order Summary",
            }),
            error &&
              _jsx("div", {
                className:
                  "bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2",
                children: error,
              }),
            _jsxs("div", {
              className: "space-y-1.5 text-sm",
              children: [
                _jsxs("div", {
                  className:
                    "flex justify-between text-gray-600 dark:text-gray-400",
                  children: [
                    _jsxs("span", { children: [cart.length, " items"] }),
                    _jsxs("span", { children: ["\u20B9", subtotal] }),
                  ],
                }),
                _jsxs("div", {
                  className:
                    "flex justify-between text-gray-600 dark:text-gray-400",
                  children: [
                    _jsx("span", { children: "Delivery" }),
                    _jsxs("span", { children: ["\u20B9", delivery] }),
                  ],
                }),
                _jsxs("div", {
                  className:
                    "border-t pt-2 flex justify-between font-black text-gray-900 dark:text-gray-100 font-display text-base",
                  children: [
                    _jsx("span", { children: "Total" }),
                    _jsxs("span", { children: ["\u20B9", total] }),
                  ],
                }),
              ],
            }),
            _jsx("button", {
              onClick: handlePlaceOrder,
              disabled: placing || cart.length === 0 || !address.trim(),
              className:
                "btn-primary text-white font-bold w-full py-3.5 rounded-xl text-sm disabled:opacity-60",
              children: placing ? (payment === "razorpay" ? "Opening secure checkout..." : "Placing order...") : `${payment === "razorpay" ? "Pay Online" : "Place Order"} ₹${total}`,
            }),
            _jsx("p", {
              className: "text-xs text-gray-400 dark:text-gray-500 text-center",
              children: "By placing order, you agree to our Terms of Service",
            }),
          ],
        }),
      }),
    ],
  })
}
function OrderTracking() {
  const steps = [
    { label: "Order Placed", time: "2:45 PM", done: true, icon: "📋" },
    { label: "Confirmed", time: "2:47 PM", done: true, icon: "✅" },
    { label: "Packed", time: "3:05 PM", done: true, icon: "📦" },
    { label: "Out for Delivery", time: "3:18 PM", done: true, icon: "🛵" },
    { label: "Delivered", time: "Expected 3:45 PM", done: false, icon: "🏠" },
  ]
  return _jsxs("div", {
    className: "p-6 max-w-2xl mx-auto",
    children: [
      _jsxs("div", {
        className: "glass rounded-2xl p-6 mb-5",
        children: [
          _jsxs("div", {
            className: "flex items-center justify-between mb-4",
            children: [
              _jsxs("div", {
                children: [
                  _jsx("h3", {
                    className:
                      "font-bold text-gray-900 dark:text-gray-100 font-display",
                    children: "Order CF-2026-4498",
                  }),
                  _jsx("p", {
                    className: "text-gray-500 dark:text-gray-400 text-sm",
                    children: "Cherry Tomatoes, Sweet Corn",
                  }),
                ],
              }),
              _jsx(Badge, { color: "orange", children: "Out For Delivery" }),
            ],
          }),
          _jsxs("div", {
            className: "bg-green-50 rounded-xl p-4 flex items-center gap-4",
            children: [
              _jsx("img", {
                src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop",
                className: "w-12 h-12 rounded-xl object-cover",
              }),
              _jsxs("div", {
                className: "flex-1",
                children: [
                  _jsx("p", {
                    className:
                      "font-semibold text-gray-900 dark:text-gray-100 text-sm font-display",
                    children: "Rahul (Delivery Partner)",
                  }),
                  _jsx("p", {
                    className: "text-gray-500 dark:text-gray-400 text-xs",
                    children: "\u2B50 4.9 \u00B7 820 deliveries",
                  }),
                ],
              }),
              _jsx("div", {
                className: "flex gap-2",
                children: _jsx("button", {
                  className:
                    "w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center text-white",
                  children: _jsx(Phone, { size: 15 }),
                }),
              }),
            ],
          }),
        ],
      }),
      _jsxs("div", {
        className: "glass rounded-2xl p-6",
        children: [
          _jsx("h3", {
            className:
              "font-bold text-gray-900 dark:text-gray-100 font-display mb-6",
            children: "Delivery Progress",
          }),
          _jsx("div", {
            className: "space-y-0",
            children: steps.map((step, i) =>
              _jsxs(
                "div",
                {
                  className: "flex gap-4",
                  children: [
                    _jsxs("div", {
                      className: "flex flex-col items-center",
                      children: [
                        _jsx("div", {
                          className: `w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 border-2 ${
                            step.done
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          }`,
                          children: step.icon,
                        }),
                        i < steps.length - 1 &&
                          _jsx("div", {
                            className: `w-0.5 h-10 ${
                              step.done ? "bg-green-400" : "bg-gray-200"
                            }`,
                          }),
                      ],
                    }),
                    _jsxs("div", {
                      className: "pb-6",
                      children: [
                        _jsx("p", {
                          className: `font-semibold text-sm font-display ${
                            step.done
                              ? "text-gray-900 dark:text-gray-100"
                              : "text-gray-400 dark:text-gray-500"
                          }`,
                          children: step.label,
                        }),
                        _jsx("p", {
                          className: `text-xs font-medium ${
                            step.done
                              ? "text-gray-600 dark:text-gray-400"
                              : "text-gray-400 dark:text-gray-500"
                          }`,
                          children: step.time,
                        }),
                      ],
                    }),
                  ],
                },
                step.label,
              ),
            ),
          }),
        ],
      }),
    ],
  })
}
function OrderHistory({ setPage, t }) {
  const [realOrders, setRealOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  useEffect(() => {
    let active = true
    const refreshOrders = () => {
      getMyOrders()
        .then((orders) => {
          if (active) {
            setRealOrders(orders)
            setError("")
          }
        })
        .catch((err) => {
          if (active) setError(err instanceof Error ? err.message : "Failed to load orders")
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }
    refreshOrders()
    const timer = window.setInterval(refreshOrders, 15000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [])
  if (loading)
    return _jsx("div", {
      className: "p-6 text-center text-gray-400 dark:text-gray-500",
      children: t("Loading orders..."),
    })
  if (error)
    return _jsx("div", {
      className: "p-6 text-center text-red-500 text-sm",
      children: error,
    })
  if (realOrders.length === 0)
    return _jsxs("div", {
      className: "p-6 text-center py-16",
      children: [
        _jsx(Package, { size: 40, className: "mx-auto mb-3 text-gray-200" }),
        _jsx("p", {
          className: "font-semibold text-gray-500 dark:text-gray-400",
          children: t("No orders yet"),
        }),
        _jsx("button", {
          onClick: () => setPage("browse"),
          className:
            "mt-4 btn-primary text-white font-semibold px-6 py-2.5 rounded-xl text-sm",
          children: t("Start Shopping"),
        }),
      ],
    })
  return _jsx("div", {
    className: "p-6 space-y-4",
    children: realOrders.map((o) =>
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
                    "w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center",
                  children: _jsx(Package, {
                    size: 22,
                    className: "text-green-600",
                  }),
                }),
                _jsxs("div", {
                  children: [
                    _jsx("p", {
                      className:
                        "font-bold text-gray-900 dark:text-gray-100 font-display text-sm",
                      children: o.orderId,
                    }),
                    _jsxs("p", {
                      className: "text-xs text-gray-500 dark:text-gray-400",
                      children: [
                        o.items
                          .slice(0, 2)
                          .map((i) => t(i.name))
                          .join(", "),
                        o.items.length > 2 ? ` ${t("+more")}` : "",
                      ],
                    }),
                    _jsxs("p", {
                      className:
                        "text-xs text-gray-400 dark:text-gray-500 mt-0.5",
                      children: [
                        new Date(o.createdAt).toLocaleDateString(),
                        " \u00B7 ",
                        o.items.length,
                        ` ${t(o.items.length === 1 ? "item" : "items")}`,
                      ],
                    }),
                    o.deliveryVerificationCode &&
                      _jsxs("p", {
                        className: "mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 dark:bg-slate-800 dark:text-amber-200",
                        children: [
                          t("Delivery handoff code:"),
                          " ",
                          _jsx("span", { className: "font-black tracking-widest", children: o.deliveryVerificationCode }),
                          ` · ${t("Share only with the delivery partner at handoff.")}`,
                        ],
                      }),
                  ],
                }),
              ],
            }),
            _jsxs("div", {
              className: "text-right flex flex-col items-end gap-2",
              children: [
                _jsxs("p", {
                  className:
                    "font-black text-gray-900 dark:text-gray-100 font-display",
                  children: ["\u20B9", o.total],
                }),
                _jsx(Badge, {
                  color:
                    o.status === "Delivered"
                      ? "green"
                      : o.status === "Cancelled"
                        ? "red"
                        : o.status === "Confirmed"
                          ? "blue"
                          : "orange",
                  children: t(o.status),
                }),
                o.deliveryPartner?.name
                  ? _jsxs("div", {
                      className: "mt-1 rounded-lg bg-green-50 p-3 text-left dark:bg-slate-800",
                      children: [
                        _jsx("p", { className: "text-xs font-semibold text-green-800 dark:text-green-300", children: t("Delivery partner assigned") }),
                        _jsx("p", { className: "mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100", children: o.deliveryPartner.name }),
                        o.deliveryPartner.phone
                          ? _jsxs("div", {
                              children: [
                                _jsx("a", { href: `tel:${o.deliveryPartner.phone}`, className: "text-xs text-gray-600 hover:underline dark:text-gray-300", children: o.deliveryPartner.phone }),
                                _jsxs("div", { className: "mt-2 flex gap-2", children: [
                                  _jsxs("a", { href: `tel:${o.deliveryPartner.phone}`, className: "inline-flex items-center gap-1 rounded-lg bg-green-700 px-2.5 py-1.5 text-xs font-semibold text-white", children: [_jsx(Phone, { size: 13 }), t("Call")] }),
                                  _jsxs("a", {
                                    href: `https://wa.me/${o.deliveryPartner.phone.replace(/\D/g, "").length === 10 ? `91${o.deliveryPartner.phone.replace(/\D/g, "")}` : o.deliveryPartner.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${o.deliveryPartner.name}, I am contacting you about order ${o.orderId}.`)}`,
                                    target: "_blank",
                                    rel: "noreferrer",
                                    className: "inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white",
                                    children: [_jsx(MessageCircle, { size: 13 }), t("Message")],
                                  }),
                                ] }),
                              ],
                            })
                          : _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: t("No phone number is available.") }),
                      ],
                    })
                  : _jsx("p", { className: "mt-1 text-xs text-gray-500 dark:text-gray-400", children: t("Delivery partner not assigned yet") }),
                o.status !== "Delivered" &&
                  o.status !== "Cancelled" &&
                  _jsx("button", {
                    onClick: () => setPage("tracking"),
                    className:
                      "text-green-600 text-xs font-semibold hover:underline",
                    children: t("Track"),
                  }),
              ],
            }),
          ],
        },
        o._id,
      ),
    ),
  })
}
function RemindersPage() {
  const statusColors = {
    Waiting: "orange",
    "Back In Stock": "green",
    "Notification Sent": "blue",
  }
  return _jsxs("div", {
    className: "p-6",
    children: [
      _jsx("div", {
        className:
          "glass rounded-2xl p-5 mb-5 bg-orange-50 border border-orange-100",
        children: _jsxs("div", {
          className: "flex items-center gap-3",
          children: [
            _jsx(Bell, { size: 20, className: "text-orange-500" }),
            _jsxs("div", {
              children: [
                _jsx("p", {
                  className:
                    "font-semibold text-gray-900 dark:text-gray-100 text-sm font-display",
                  children: "How Reminders Work",
                }),
                _jsx("p", {
                  className: "text-xs text-gray-500 dark:text-gray-400",
                  children:
                    "When out-of-stock products are restocked, you'll receive instant notifications.",
                }),
              ],
            }),
          ],
        }),
      }),
      _jsx("div", {
        className: "space-y-4",
        children: reminders.map((r) =>
          _jsxs(
            "div",
            {
              className: "glass rounded-2xl p-5 flex items-center gap-4",
              children: [
                _jsx("img", {
                  src: r.image,
                  alt: r.product,
                  className: "w-16 h-16 rounded-xl object-cover flex-shrink-0",
                }),
                _jsxs("div", {
                  className: "flex-1",
                  children: [
                    _jsx("p", {
                      className:
                        "font-bold text-gray-900 dark:text-gray-100 font-display",
                      children: r.product,
                    }),
                    _jsx("p", {
                      className: "text-sm text-gray-500 dark:text-gray-400",
                      children: r.vendor,
                    }),
                    _jsxs("p", {
                      className:
                        "text-xs text-gray-400 dark:text-gray-500 mt-0.5",
                      children: ["Set on ", r.setDate],
                    }),
                  ],
                }),
                _jsx(Badge, {
                  color: statusColors[r.status],
                  children: r.status,
                }),
              ],
            },
            r.id,
          ),
        ),
      }),
    ],
  })
}
function NotificationsPage() {
  const icons = { order: "📦", flash: "⚡", stock: "🔔", discount: "🏷️" }
  return _jsx("div", {
    className: "p-6 space-y-3",
    children: notifications.map((n) =>
      _jsxs(
        "div",
        {
          className: `glass rounded-2xl p-4 flex items-start gap-4 ${
            !n.read ? "border-l-4 border-green-500" : ""
          }`,
          children: [
            _jsx("div", {
              className:
                "w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0",
              children: icons[n.type],
            }),
            _jsxs("div", {
              className: "flex-1",
              children: [
                _jsx("p", {
                  className: `font-semibold text-sm font-display ${
                    n.read
                      ? "text-gray-600 dark:text-gray-400"
                      : "text-gray-900 dark:text-gray-100"
                  }`,
                  children: n.title,
                }),
                _jsx("p", {
                  className: "text-xs text-gray-500 dark:text-gray-400 mt-0.5",
                  children: n.message,
                }),
                _jsx("p", {
                  className:
                    "text-xs text-gray-500 dark:text-gray-400 font-medium mt-1.5",
                  children: n.time,
                }),
              ],
            }),
            !n.read &&
              _jsx("div", {
                className:
                  "w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1.5",
              }),
          ],
        },
        n.id,
      ),
    ),
  })
}
function Profile() {
  return _jsxs("div", {
    className: "p-6 max-w-2xl mx-auto space-y-5",
    children: [
      _jsxs("div", {
        className: "glass rounded-2xl p-6 flex items-center gap-5",
        children: [
          _jsxs("div", {
            className: "relative",
            children: [
              _jsx("img", {
                src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
                className: "w-20 h-20 rounded-2xl object-cover",
              }),
              _jsx("div", {
                className:
                  "absolute -bottom-1 -right-1 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs",
                children: "\u270E",
              }),
            ],
          }),
          _jsxs("div", {
            children: [
              _jsx("h2", {
                className:
                  "text-xl font-black text-gray-900 dark:text-gray-100 font-display",
                children: "devansh chouhan",
              }),
              _jsx("p", {
                className: "text-gray-500 dark:text-gray-400 text-sm",
                children: "devansh@example.com \u00B7 +91 98765 43210",
              }),
              _jsxs("div", {
                className: "flex gap-2 mt-2",
                children: [
                  _jsx(Badge, {
                    color: "green",
                    children: "\u2B50 Premium Customer",
                  }),
                  _jsx(Badge, { color: "orange", children: "1,840 Points" }),
                ],
              }),
            ],
          }),
        ],
      }),
      [
        {
          label: "Personal Details",
          items: [
            "Full Name: devansh chouhan",
            "Email: devansh@example.com",
            "Phone: +91 98765 43210",
            "City: Mumbai, Maharashtra",
          ],
        },
        {
          label: "Saved Addresses",
          items: [
            "412, Sunrise Apartments, Bandra West, Mumbai 400050",
            "Office: Cyber Hub, Andheri East, Mumbai 400093",
          ],
        },
        {
          label: "Order Statistics",
          items: [
            "Total Orders: 28",
            "Total Spent: ₹12,450",
            "Money Saved: ₹4,280",
            "Reviews Written: 12",
          ],
        },
      ].map((section) =>
        _jsxs(
          "div",
          {
            className: "glass rounded-2xl p-5",
            children: [
              _jsx("h3", {
                className:
                  "font-bold text-gray-900 dark:text-gray-100 font-display mb-3",
                children: section.label,
              }),
              _jsx("div", {
                className: "space-y-2",
                children: section.items.map((item, i) =>
                  _jsx(
                    "p",
                    {
                      className: "text-sm text-gray-600 dark:text-gray-400",
                      children: item,
                    },
                    i,
                  ),
                ),
              }),
            ],
          },
          section.label,
        ),
      ),
    ],
  })
}
function ProductDetail({ setPage }) {
  const product = products[0]
  return _jsx("div", {
    className: "p-6 max-w-5xl mx-auto",
    children: _jsxs("div", {
      className: "grid md:grid-cols-2 gap-8",
      children: [
        _jsxs("div", {
          children: [
            _jsx("img", {
              src: product.image,
              alt: product.name,
              className: "w-full h-80 object-cover rounded-2xl mb-3 shadow-lg",
            }),
            _jsx("div", {
              className: "grid grid-cols-4 gap-2",
              children: [
                product.image,
                products[1].image,
                products[2].image,
                products[3].image,
              ].map((img, i) =>
                _jsx(
                  "img",
                  {
                    src: img,
                    className:
                      "h-16 w-full object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity",
                  },
                  i,
                ),
              ),
            }),
          ],
        }),
        _jsxs("div", {
          className: "space-y-4",
          children: [
            _jsxs("div", {
              children: [
                product.organic &&
                  _jsx(Badge, {
                    color: "green",
                    children: "\uD83C\uDF3F Organic",
                  }),
                _jsx("h2", {
                  className:
                    "text-2xl font-black text-gray-900 dark:text-gray-100 font-display mt-2",
                  children: product.name,
                }),
                _jsxs("div", {
                  className: "flex items-center gap-3 mt-1",
                  children: [
                    _jsxs("div", {
                      className: "flex items-center gap-1",
                      children: [
                        _jsx(Star, {
                          size: 14,
                          fill: "#EAB308",
                          className: "text-yellow-500",
                        }),
                        _jsx("span", {
                          className:
                            "font-semibold text-gray-700 dark:text-gray-300 text-sm",
                          children: product.rating,
                        }),
                      ],
                    }),
                    _jsx("span", {
                      className: "text-gray-400 dark:text-gray-500",
                      children: "\u00B7",
                    }),
                    _jsxs("span", {
                      className: "text-sm text-gray-500 dark:text-gray-400",
                      children: [
                        _jsx(MapPin, { size: 12, className: "inline" }),
                        " ",
                        product.vendorName,
                      ],
                    }),
                  ],
                }),
              ],
            }),
            _jsxs("div", {
              className: "flex items-center gap-4",
              children: [
                _jsxs("span", {
                  className:
                    "text-3xl font-black text-gray-900 dark:text-gray-100 font-display",
                  children: ["\u20B9", product.discountedPrice],
                }),
                _jsxs("span", {
                  className:
                    "text-lg text-gray-400 dark:text-gray-500 line-through",
                  children: ["\u20B9", product.originalPrice],
                }),
                _jsxs(Badge, {
                  color: "orange",
                  children: ["\u2212", product.discount, "%"],
                }),
              ],
            }),
            _jsxs("div", {
              className: "glass rounded-xl p-4",
              children: [
                _jsx("h4", {
                  className:
                    "font-bold text-gray-900 dark:text-gray-100 font-display text-sm mb-3",
                  children: "AI Freshness Analysis \uD83E\uDD16",
                }),
                _jsxs("div", {
                  className: "flex items-center gap-4 mb-3",
                  children: [
                    _jsx(FreshnessRing, { score: product.freshnessScore }),
                    _jsxs("div", {
                      children: [
                        _jsx(FreshnessBadge, { score: product.freshnessScore }),
                        _jsxs("p", {
                          className:
                            "text-xs text-gray-500 dark:text-gray-400 mt-1",
                          children: ["Shelf Life: ", product.shelfLife],
                        }),
                        _jsxs("p", {
                          className: "text-xs text-gray-500 dark:text-gray-400",
                          children: ["Harvested: ", product.harvestDate],
                        }),
                      ],
                    }),
                  ],
                }),
                _jsx("p", {
                  className: "text-xs text-gray-500 dark:text-gray-400",
                  children: product.storageTips,
                }),
              ],
            }),
            _jsxs("div", {
              className: "glass rounded-xl p-4",
              children: [
                _jsx("h4", {
                  className:
                    "font-bold text-gray-900 dark:text-gray-100 font-display text-sm mb-2",
                  children: "Nutrition per 100g",
                }),
                _jsx("div", {
                  className: "grid grid-cols-5 gap-2",
                  children: Object.entries(product.nutritionPer100g).map(
                    ([k, v]) =>
                      _jsxs(
                        "div",
                        {
                          className: "text-center bg-green-50 rounded-lg p-2",
                          children: [
                            _jsx("p", {
                              className:
                                "font-bold text-green-700 text-xs font-display",
                              children: v,
                            }),
                            _jsx("p", {
                              className:
                                "text-gray-400 dark:text-gray-500 text-xs capitalize",
                              children: k,
                            }),
                          ],
                        },
                        k,
                      ),
                  ),
                }),
              ],
            }),
            _jsxs("div", {
              className: "flex gap-3",
              children: [
                _jsxs("button", {
                  onClick: () => setPage("cart"),
                  className:
                    "flex-1 btn-primary text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2",
                  children: [_jsx(ShoppingCart, { size: 16 }), " Add to Cart"],
                }),
                _jsx("button", {
                  onClick: () => setPage("checkout"),
                  className:
                    "flex-1 btn-orange text-white font-bold py-3.5 rounded-xl text-sm",
                  children: "Buy Now",
                }),
              ],
            }),
            _jsxs("div", {
              className: "text-xs text-gray-500 dark:text-gray-400 space-y-1",
              children: [
                _jsxs("p", {
                  className: "flex items-center gap-2",
                  children: [
                    _jsx("span", {
                      className: "text-green-600",
                      children: "\uD83D\uDCCD",
                    }),
                    " ",
                    product.distance,
                    " away \u00B7 ",
                    product.deliveryTime,
                    " delivery",
                  ],
                }),
                _jsxs("p", {
                  className: "flex items-center gap-2",
                  children: [
                    _jsx("span", {
                      className: "text-green-600",
                      children: "\uD83C\uDF73",
                    }),
                    " Suggested: ",
                    product.recipes.join(" · "),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  })
}
function SettingsPage({ dark, onToggleDark }) {
  const groups = [
    {
      section: "Account",
      items: [
        ["Change Password", "🔒"],
        ["Two Factor Auth", "📱"],
        ["Privacy Settings", "🛡️"],
      ],
    },
    {
      section: "Notifications",
      items: [
        ["Order Updates", "📦"],
        ["Flash Sale Alerts", "⚡"],
        ["Stock Reminders", "🔔"],
        ["Newsletter", "📧"],
      ],
    },
    {
      section: "Preferences",
      items: [
        ["Language: English", "🌐"],
        ["Currency: INR", "₹"],
        ["Dark Mode", "🌙"],
      ],
    },
    {
      section: "Support",
      items: [
        ["Help Center", "❓"],
        ["Report Issue", "⚠️"],
        ["Rate App", "⭐"],
      ],
    },
  ]
  return _jsx("div", {
    className: "p-6 max-w-2xl mx-auto space-y-4",
    children: groups.map((group) =>
      _jsxs(
        "div",
        {
          className: "glass rounded-2xl p-5",
          children: [
            _jsx("h3", {
              className:
                "font-bold text-gray-900 dark:text-gray-100 font-display mb-3",
              children: group.section,
            }),
            _jsx("div", {
              className: "space-y-1",
              children: group.items.map(([label, icon]) =>
                label === "Dark Mode"
                  ? _jsxs(
                      "button",
                      {
                        onClick: onToggleDark,
                        className:
                          "w-full flex items-center gap-3 px-3 py-3 hover:bg-green-50 dark:hover:bg-white/5 rounded-xl transition-all text-left",
                        children: [
                          _jsx("span", {
                            className: "text-xl",
                            children: icon,
                          }),
                          _jsx("span", {
                            className:
                              "text-sm text-gray-700 dark:text-gray-300 font-medium flex-1",
                            children: label,
                          }),
                          _jsx("span", {
                            className: `w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${
                              dark
                                ? "bg-green-600 justify-end"
                                : "bg-gray-300 justify-start"
                            }`,
                            children: _jsx("span", {
                              className: "w-5 h-5 bg-white rounded-full shadow",
                            }),
                          }),
                        ],
                      },
                      label,
                    )
                  : _jsxs(
                      "button",
                      {
                        className:
                          "w-full flex items-center gap-3 px-3 py-3 hover:bg-green-50 dark:hover:bg-white/5 rounded-xl transition-all text-left",
                        children: [
                          _jsx("span", {
                            className: "text-xl",
                            children: icon,
                          }),
                          _jsx("span", {
                            className:
                              "text-sm text-gray-700 dark:text-gray-300 font-medium flex-1",
                            children: label,
                          }),
                          _jsx(ChevronRight, {
                            size: 14,
                            className: "text-gray-400 dark:text-gray-500",
                          }),
                        ],
                      },
                      label,
                    ),
              ),
            }),
          ],
        },
        group.section,
      ),
    ),
  })
}
function LiveCustomerDashboard({ setPage }) {
  const [orders, setOrders] = useState([])
  const [productCount, setProductCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([getMyOrders(), getProducts()])
      .then(([customerOrders, products]) => {
        setOrders(customerOrders)
        setProductCount(products.length)
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  return _jsxs("div", {
    className: "p-6 space-y-6",
    children: [
      _jsxs("section", {
        className: "customer-dashboard-hero rounded-2xl p-6 text-white",
        children: [
          _jsx("h2", { className: "text-2xl font-black font-display", children: "Your CyberFresh account" }),
          _jsx("p", { className: "mt-2 text-green-100", children: "Browse current listings and manage your orders." }),
          _jsx("button", { onClick: () => setPage("browse"), className: "mt-4 bg-white text-green-700 font-semibold px-4 py-2 rounded-xl", children: "Browse products" }),
        ],
      }),
      error && _jsx("p", { role: "alert", className: "text-red-600", children: error }),
      loading
        ? _jsx("p", { className: "text-gray-500", children: "Loading account data..." })
        : _jsxs("div", {
            className: "grid grid-cols-2 gap-4",
            children: [
              _jsx(StatCard, { icon: _jsx(Package, { size: 22 }), label: "Your orders", value: orders.length }),
              _jsx(StatCard, { icon: _jsx(Search, { size: 22 }), label: "Available products", value: productCount }),
            ],
          }),
      !loading && orders.length === 0 && _jsx("p", { className: "text-sm text-gray-500", children: "No orders yet." }),
    ],
  })
}

function LiveOrderTracking({ t }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    const refreshOrders = () => {
      getMyOrders()
        .then((latestOrders) => {
          if (active) {
            setOrders(latestOrders)
            setError("")
          }
        })
        .catch((requestError) => {
          if (active) setError(requestError.message)
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }
    refreshOrders()
    const refreshTimer = window.setInterval(refreshOrders, 15000)
    return () => {
      active = false
      window.clearInterval(refreshTimer)
    }
  }, [])

  const order = orders.find((item) => ["Shipped", "Out For Delivery"].includes(item.status)) || orders[0]
  if (loading) return _jsx("p", { className: "p-6 text-gray-500", children: t("loadingOrder") })
  if (error) return _jsx("p", { role: "alert", className: "p-6 text-red-600", children: error })
  if (!order) return _jsx("p", { className: "p-6 text-gray-500", children: t("noOrders") })

  const partner = order.deliveryPartner
  const rawPartnerDigits = partner?.phone?.replace(/\D/g, "")
  const partnerDigits = rawPartnerDigits?.length === 10 ? `91${rawPartnerDigits}` : rawPartnerDigits
  const whatsappMessage = encodeURIComponent(`Hi ${partner?.name || ""}, I am contacting you about order ${order.orderId}.`)
  const liveLocation = partner?.liveLocation
  const mapPadding = 0.012
  const mapBounds = liveLocation
    ? [
        liveLocation.longitude - mapPadding,
        liveLocation.latitude - mapPadding,
        liveLocation.longitude + mapPadding,
        liveLocation.latitude + mapPadding,
      ].join("%2C")
    : ""
  return _jsxs("section", {
    className: "p-6 max-w-2xl mx-auto space-y-4",
    children: [
      _jsx("h2", { className: "text-xl font-bold", children: `${t("orderNumber")} ${order.orderId}` }),
      _jsx(Badge, { color: "orange", children: t(order.status) }),
      _jsxs("p", { className: "text-sm text-gray-600", children: [`${t("deliveryAddress")}: `, order.address || "Not provided"] }),
      liveLocation
        ? _jsxs("div", {
            className: "glass overflow-hidden rounded-xl",
            children: [
              _jsx("iframe", {
                title: "Delivery partner live location map",
                src: `https://www.openstreetmap.org/export/embed.html?bbox=${mapBounds}&layer=mapnik&marker=${liveLocation.latitude}%2C${liveLocation.longitude}`,
                className: "h-64 w-full border-0",
                loading: "lazy",
                referrerPolicy: "no-referrer",
              }),
              _jsxs("div", {
                className: "flex flex-wrap items-center justify-between gap-2 p-3 text-xs text-gray-600 dark:text-gray-300",
                children: [
                  _jsx("span", { children: `Partner location updated ${new Date(liveLocation.updatedAt).toLocaleTimeString()}. Map refreshes every 15 seconds.` }),
                  _jsx("a", { href: `https://www.google.com/maps/search/?api=1&query=${liveLocation.latitude},${liveLocation.longitude}`, target: "_blank", rel: "noreferrer", className: "font-semibold text-green-700 hover:underline", children: "Open in Maps" }),
                ],
              }),
            ],
          })
        : _jsx("p", { className: "text-sm text-gray-600", children: t("liveLocationUnavailable") }),
      _jsxs("p", { className: "text-xs text-gray-500", children: [`${t("lastUpdate")}: `, new Date(order.updatedAt || order.createdAt).toLocaleString()] }),
      partner?.name
        ? _jsxs("article", {
            className: "glass rounded-xl p-4 space-y-3",
            children: [
              _jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100", children: t("deliveryPartner") }),
              _jsxs("div", { children: [
                _jsx("p", { className: "font-semibold text-gray-900 dark:text-gray-100", children: partner.name }),
                partner.phone
                  ? _jsx("a", { href: `tel:${partner.phone}`, className: "text-sm text-gray-600 dark:text-gray-300 hover:underline", children: partner.phone })
                  : _jsx("p", { className: "text-sm text-gray-500", children: "No phone number is available." }),
              ] }),
              partner.phone && _jsxs("div", { className: "flex flex-wrap gap-2", children: [
                _jsxs("a", { href: `tel:${partner.phone}`, className: "btn-primary inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white", children: [_jsx(Phone, { size: 16 }), t("callPartner")] }),
                _jsxs("a", { href: `https://wa.me/${partnerDigits}?text=${whatsappMessage}`, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700", children: [_jsx(MessageCircle, { size: 16 }), t("whatsappPartner")] }),
              ] }),
            ],
          })
        : _jsx("p", { className: "rounded-xl bg-gray-100 p-4 text-sm text-gray-600 dark:bg-slate-800 dark:text-gray-300", children: t("noPartner") }),
    ],
  })
}

function LiveReminders({ t }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    api.get("/api/reminders")
      .then(setItems)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return _jsx("p", { className: "p-6 text-gray-500 dark:text-gray-400", children: t("Loading reminders...") })
  if (error) return _jsx("p", { role: "alert", className: "p-6 text-red-600", children: error })
  if (!items.length) return _jsx("p", { className: "p-6 text-gray-500 dark:text-gray-400", children: t("No reminders yet.") })

  return _jsx("div", {
    className: "p-6 space-y-3",
    children: items.map((item) => _jsxs("div", {
      className: "glass rounded-xl p-4 flex items-center justify-between",
      children: [
        _jsx("span", { className: "font-semibold", children: t(item.product?.name || "Product unavailable") }),
        _jsx(Badge, { color: "orange", children: t(item.status) }),
      ],
    }, item._id)),
  })
}

function LiveNotifications({ t }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    api.get("/api/notifications")
      .then(setItems)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return _jsx("p", { className: "p-6 text-gray-500 dark:text-gray-400", children: t("Loading notifications...") })
  if (error) return _jsx("p", { role: "alert", className: "p-6 text-red-600", children: error })
  if (!items.length) return _jsx("p", { className: "p-6 text-gray-500 dark:text-gray-400", children: t("No notifications.") })

  return _jsx("div", {
    className: "p-6 space-y-3",
    children: items.map((item) => _jsxs("article", {
      className: "glass rounded-xl p-4",
      children: [
        _jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100", children: t(item.title) }),
        _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300 mt-1", children: t(item.message) }),
        _jsx("time", { className: "text-xs text-gray-500 mt-2 block", dateTime: item.createdAt, children: new Date(item.createdAt).toLocaleString() }),
      ],
    }, item._id)),
  })
}

function LiveProfile({ user, setUser, error }) {
  if (error) return _jsx("p", { role: "alert", className: "p-6 text-red-600", children: error })
  if (!user) return _jsx("p", { className: "p-6 text-gray-500", children: "Loading profile..." })

  return _jsxs("section", {
    className: "p-6 max-w-2xl mx-auto space-y-4",
    children: [
      _jsx(ProfilePhotoUpload, { avatar: user.avatar, name: user.name, onUploaded: (avatar) => setUser((current) => ({ ...current, avatar })) }),
      _jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-gray-100", children: user.name }),
      _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: user.email }),
      _jsx(ProfileDetailsForm, {
        user,
        fields: [
          { key: "name", label: "Full name" },
          { key: "phone", label: "Phone" },
          { key: "address", label: "Address" },
          { key: "city", label: "City" },
          { key: "state", label: "State" },
          { key: "pincode", label: "PIN code" },
        ],
        onSaved: setUser,
      }),
    ],
  })
}

function ThemeSettings({ dark, onToggleDark, accent, setAccent, language, setLanguage, t }) {
  return _jsx("section", {
    className: "p-6 max-w-xl mx-auto",
    children: _jsxs("div", {
      className: "space-y-4",
      children: [
        _jsxs("div", {
          className: "glass rounded-xl p-5 space-y-4",
          children: [
            _jsxs("div", {
              children: [
                _jsx("h2", { className: "font-semibold text-gray-900 dark:text-gray-100", children: t("appearance") }),
                _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: t(dark ? "darkTheme" : "lightTheme") }),
              ],
            }),
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
          ],
        }),
        _jsx(CommunicationPreferences, {}),
        _jsx(SupportFeedback, {}),
      ],
    }),
  })
}

function LiveProductDetail({ product, onAdd, onBack }) {
  const { t } = useLanguage()
  if (!product) {
    return _jsx("p", { className: "p-6 text-gray-500", children: "Select a product from the current listings." })
  }

  return _jsxs("section", {
    className: "p-6 max-w-5xl mx-auto grid md:grid-cols-2 gap-6",
    children: [
      product.image
        ? _jsx("img", { src: product.image, alt: product.name, className: "w-full max-h-96 object-cover rounded-xl" })
        : _jsx("div", { className: "min-h-64 bg-gray-100 flex items-center justify-center text-gray-500 rounded-xl", children: "No image available" }),
      _jsxs("div", {
        className: "space-y-4",
        children: [
          _jsx("p", { className: "text-sm text-gray-500", children: product.category }),
          _jsx("h2", { className: "text-2xl font-bold", children: t(product.name) }),
          _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: t(product.category) }),
          _jsx("p", { className: "text-sm text-gray-600", children: product.description || "No description provided." }),
          _jsx("p", { className: "text-xl font-bold", children: `₹${product.discountedPrice} / ${product.unit}` }),
          _jsx("p", { className: "text-sm text-gray-600", children: `Available stock: ${product.stock}` }),
          _jsx("p", { className: "text-sm text-gray-600", children: product.shelfLife ? `Shelf life: ${product.shelfLife}` : "Shelf-life information unavailable." }),
          _jsx("p", { className: "text-sm text-gray-600", children: `Vendor: ${product.vendorName || "Unavailable"}` }),
          _jsxs("div", {
            className: "flex gap-3",
            children: [
              _jsx("button", { onClick: () => onAdd(product), disabled: product.stock <= 0, className: "btn-primary text-white font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50", children: product.stock > 0 ? "Add to cart" : "Out of stock" }),
              _jsx("button", { onClick: onBack, className: "border border-gray-300 px-5 py-2.5 rounded-xl", children: "Back" }),
            ],
          }),
        ],
      }),
    ],
  })
}

export default function CustomerPortal({ onLogout }) {
  const [page, setPage] = useState("dashboard")
  const [profileUser, setProfileUser] = useState(null)
  const [profileError, setProfileError] = useState("")
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cart, setCart] = useState(cartInitial)
  const [toast, setToast] = useState(null)
  const { dark, toggleDark, accent, setAccent } = usePortalTheme()
  const { language, setLanguage, t } = useLanguage()
  useEffect(() => {
    api.get("/api/auth/me")
      .then((data) => setProfileUser(data.user))
      .catch((requestError) => setProfileError(requestError.message))
  }, [])
  const handleAdd = (p) => {
    if (p.stockStatus === "Out of Stock") return
    const pid = (item) => item._id ?? item.id
    const existing = cart.find((item) => pid(item) === pid(p))
    if (existing && existing.qty >= p.stock) {
      setToast(`Only ${p.stock} available.`)
      setTimeout(() => setToast(null), 3000)
      return
    }
    setCart((prev) => {
      const ex = prev.find((i) => pid(i) === pid(p))
      if (ex)
        return prev.map((i) =>
          pid(i) === pid(p) ? { ...i, qty: i.qty + 1 } : i,
        )
      return [...prev, { ...p, qty: 1 }]
    })
    setToast(`${p.name} added to cart!`)
    setTimeout(() => setToast(null), 3000)
  }
  const savedAddress = [profileUser?.address, profileUser?.city, profileUser?.state, profileUser?.pincode]
    .filter(Boolean)
    .join(", ")
  const pages = {
    dashboard: _jsx(LiveCustomerDashboard, { setPage: setPage }),
    browse: _jsx(Browse, {
      onAdd: handleAdd,
      customerAddress: savedAddress,
      onNotify: async (product) => {
        try {
          await api.post("/api/reminders", { productId: product._id })
          setToast("Reminder saved.")
        } catch (requestError) {
          setToast(requestError.message)
        }
        setTimeout(() => setToast(null), 3000)
      },
      onDetail: (product) => {
        setSelectedProduct(product)
        setPage("product-detail")
      },
    }),
    cart: _jsx(Cart, { cart: cart, setCart: setCart, setPage: setPage }),
    checkout: _jsx(Checkout, {
      cart: cart,
      setCart: setCart,
      setPage: setPage,
      savedAddress,
    }),
    tracking: _jsx(LiveOrderTracking, { t: t }),
    history: _jsx(OrderHistory, { setPage: setPage, t: t }),
    reminders: _jsx(LiveReminders, { t: t }),
    notifications: _jsx(LiveNotifications, { t: t }),
    profile: _jsx(LiveProfile, {
      user: profileUser,
      setUser: setProfileUser,
      error: profileError,
    }),
    settings: _jsx(ThemeSettings, {
      dark,
      onToggleDark: toggleDark,
      accent,
      setAccent,
      language,
      setLanguage,
      t,
    }),
    "product-detail": _jsx(LiveProductDetail, {
      product: selectedProduct,
      onAdd: handleAdd,
      onBack: () => setPage("browse"),
    }),
  }
  return _jsx(TranslatedContent, { language, children: _jsx("div", {
    className: dark ? "dark" : "",
    children: _jsxs("div", {
      className: "flex h-dvh min-h-0 overflow-hidden bg-gray-50 dark:bg-[#0B1220]",
      children: [
        _jsx(Sidebar, {
          page: page,
          setPage: setPage,
          onLogout: onLogout,
          cartCount: cart.length,
          user: profileUser,
          t,
        }),
        _jsxs("div", {
          className: "min-h-0 min-w-0 flex-1 flex flex-col overflow-hidden",
          children: [
            _jsx(TopNav, {
              page: page,
              cartCount: cart.length,
              setPage: setPage,
              dark: dark,
              onToggleDark: toggleDark,
              user: profileUser,
              language,
              onLanguageChange: setLanguage,
              t,
            }),
            _jsx("main", {
              className: "min-h-0 flex-1 overflow-y-auto overscroll-contain",
              children: pages[page],
            }),
          ],
        }),
        toast &&
          _jsx(Toast, {
            message: toast,
            type: "success",
            onClose: () => setToast(null),
          }),
      ],
    }),
  }) })
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime"
import { useState, useEffect } from "react"
import {
  Search,
  Leaf,
  Star,
  MapPin,
  Clock,
  Zap,
  ChevronRight,
  Phone,
  Mail,
  Heart,
  ChevronDown,
  ChevronUp,
  Bell,
} from "lucide-react"
import { faqs } from "../data/mockData"
import { getProducts } from "../api/products"
import { api } from "../api/client"
import { FreshnessBadge, Badge } from "./shared/ui"
import usePortalTheme from "./shared/usePortalTheme"
import useLanguage from "./shared/useLanguage"
import PreferenceControls from "./shared/PreferenceControls"
import { MessageCircle } from "lucide-react"
import { getAuthToken } from "../api/client"
import { getNearbyVendors } from "../api/vendors"
function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}
function Navbar({ onPortalSelect, preferences }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", h)
    return () => window.removeEventListener("scroll", h)
  }, [])
  return _jsx("nav", {
    className: `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-white shadow-md border-b border-gray-100 dark:bg-slate-900 dark:border-slate-800 dark:shadow-black/30"
        : "bg-white/95 border-b border-gray-100 dark:bg-slate-900/95 dark:border-slate-800"
    }`,
    children: _jsxs("div", {
      className:
        "max-w-7xl mx-auto px-6 py-4 flex items-center justify-between",
      children: [
        _jsxs("div", {
          className: "flex items-center gap-2.5",
          children: [
            _jsx("div", {
              className:
                "w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center shadow-lg",
              children: _jsx(Leaf, { size: 18, className: "text-white" }),
            }),
            _jsxs("span", {
              className: "text-xl font-bold font-display text-green-700",
              children: [
                "Cyber",
                _jsx("span", {
                  className: "text-green-700",
                  children: "Fresh",
                }),
              ],
            }),
          ],
        }),
        _jsx("div", {
          className: "hidden md:flex items-center gap-8",
          children: [
            ["Products", "products"],
            ["Vendors", "vendors"],
            ["How it Works", "how-it-works"],
          ].map(([item, target]) =>
            _jsx(
              "a",
              {
                href: `#${target}`,
                className:
                  "text-sm font-semibold text-gray-800 hover:text-green-600 transition-colors",
                children: preferences.t(item),
              },
              item,
            ),
          ),
        }),
        _jsxs("div", {
          className: "flex items-center gap-3",
          children: [
            _jsx(PreferenceControls, {
              ...preferences,
              compact: true,
              t: preferences.t,
            }),
            _jsx("button", {
              onClick: () => onPortalSelect("customer-auth"),
              className:
                "flex items-center gap-2 text-xs font-bold text-green-700 border-2 border-green-600 px-3 py-2 rounded-xl hover:bg-green-50 transition-all sm:px-4 sm:text-sm dark:border-green-400 dark:hover:bg-slate-800",
              children: preferences.t("Login"),
            }),
            _jsx("button", {
              onClick: () => onPortalSelect("customer-auth"),
              className:
                "btn-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl",
              children: preferences.t("Get Started"),
            }),
          ],
        }),
      ],
    }),
  })
}
function Hero({ onPortalSelect, t, dark }) {
  return _jsxs("section", {
    className: "min-h-screen flex items-center relative overflow-hidden pt-20",
    style: {
      background: dark
        ? "linear-gradient(135deg, #0B1220 0%, #111827 50%, #1E293B 100%)"
        : "linear-gradient(135deg, #F0FDF4 0%, #FEFCE8 50%, #FFF7ED 100%)",
    },
    children: [
      _jsxs("div", {
        className: "absolute inset-0 pointer-events-none",
        children: [
          _jsx("div", {
            className:
              "absolute top-20 right-0 w-80 h-80 rounded-full bg-green-100 blur-3xl opacity-60 float-anim",
          }),
          _jsx("div", {
            className:
              "absolute bottom-10 left-0 w-64 h-64 rounded-full bg-orange-100 blur-3xl opacity-50 float-anim",
            style: { animationDelay: "1.5s" },
          }),
        ],
      }),
      _jsxs("div", {
        className:
          "max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center relative z-10",
        children: [
          _jsxs("div", {
            children: [
              _jsxs("div", {
                className:
                  "inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 shadow-md",
                children: [
                  _jsx(Zap, { size: 14, className: "text-yellow-300" }),
                  t("A marketplace for fresh food"),
                ],
              }),
              _jsxs("h1", {
                className:
                  "text-5xl md:text-6xl font-black font-display leading-tight mb-6",
                children: [
                  _jsx("span", {
                    className: "text-green-800",
                    children: t("Buy Fresh."),
                  }),
                  _jsx("br", {}),
                  _jsx("span", {
                    className: "text-orange-500",
                    children: t("Save Money."),
                  }),
                  _jsx("br", {}),
                  _jsx("span", {
                    className: "text-green-800",
                    children: t("Waste Less."),
                  }),
                ],
              }),
              _jsx("p", {
                className:
                  "text-gray-700 text-lg mb-8 max-w-lg leading-relaxed font-medium",
                children: t("Connect with food vendors and discover available produce while helping reduce food waste."),
              }),
              _jsx("button", {
                onClick: () => onPortalSelect("customer-auth"),
                className: "btn-primary text-white font-bold text-sm px-6 py-3 rounded-xl",
                children: t("Sign in to browse"),
              }),
            ],
          }),
          _jsx("div", {
            className: "hidden md:block",
            children: _jsx("img", {
              src: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=900&h=1100&fit=crop&auto=format",
              alt: "Fresh fruit and vegetables",
              className: "rounded-2xl w-full max-h-[34rem] object-cover",
            }),
          }),
        ],
      }),
    ],
  })
}
function ProductCard({ product, onClick, t }) {
  const [bookmarked, setBookmarked] = useState(false)
  return _jsxs("div", {
    className:
      "glass product-card rounded-2xl overflow-hidden border border-white/60 cursor-pointer",
    onClick: onClick,
    children: [
      _jsxs("div", {
        className: "relative",
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
                  children: `\uD83C\uDF3F ${t("Organic")}`,
                }),
              product.discount > 30 &&
                _jsxs(Badge, {
                  color: "orange",
                  children: ["\uD83D\uDD25 ", product.discount, "% OFF"],
                }),
            ],
          }),
          _jsx("button", {
            className:
              "absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow",
            onClick: (e) => {
              e.stopPropagation()
              setBookmarked(!bookmarked)
            },
            children: _jsx(Heart, {
              size: 14,
              fill: bookmarked ? "#E53E3E" : "none",
              className: bookmarked ? "text-red-500" : "text-gray-500",
            }),
          }),
          _jsx("div", {
            className: "absolute bottom-3 right-3",
            children: _jsx(FreshnessBadge, { score: product.freshnessScore, t }),
          }),
        ],
      }),
      _jsxs("div", {
        className: "p-4",
        children: [
          _jsxs("div", {
            className: "flex items-start justify-between mb-1",
            children: [
              _jsx("h3", {
                className: "font-semibold text-gray-900 font-display text-sm",
                children: product.name,
              }),
              product.rating > 0 && _jsxs("div", {
                className:
                  "flex items-center gap-0.5 text-yellow-500 text-xs font-semibold",
                children: [
                  _jsx(Star, { size: 11, fill: "#EAB308" }),
                  product.rating,
                ],
              }),
            ],
          }),
          _jsxs("div", {
            className:
              "flex items-center gap-1 text-xs text-gray-600 font-medium mb-2",
            children: [
              _jsx(MapPin, { size: 10 }),
              product.vendorName || t("Vendor unavailable"),
              " \u00B7 ",
              product.distance,
              _jsxs("span", {
                className:
                  "ml-1 text-green-700 flex items-center gap-0.5 font-semibold",
                children: [_jsx(Clock, { size: 10 }), product.deliveryTime],
              }),
            ],
          }),
          _jsxs("div", {
            className: "grid grid-cols-2 gap-1 mb-3 text-xs",
            children: [
              _jsxs("div", {
                className: "bg-green-50 rounded-lg px-2 py-1",
                children: [
                  _jsx("span", {
                    className: "text-gray-500",
                    children: t("Shelf Life"),
                  }),
                  _jsx("p", {
                    className: "text-green-700 font-semibold",
                    children: product.shelfLife,
                  }),
                ],
              }),
              _jsxs("div", {
                className: "bg-orange-50 rounded-lg px-2 py-1",
                children: [
                  _jsx("span", {
                    className: "text-gray-500",
                    children: t("Harvest"),
                  }),
                  _jsx("p", {
                    className: "text-orange-700 font-semibold",
                    children: product.harvestDate,
                  }),
                ],
              }),
            ],
          }),
          _jsxs("div", {
            className: "flex items-center justify-between",
            children: [
              _jsxs("div", {
                children: [
                  _jsxs("span", {
                    className: "text-lg font-bold text-gray-900 font-display",
                    children: ["\u20B9", product.discountedPrice],
                  }),
                  _jsxs("span", {
                    className: "text-xs text-gray-400 line-through ml-1.5",
                    children: ["\u20B9", product.originalPrice],
                  }),
                ],
              }),
              _jsx(Badge, {
                color:
                  product.stockStatus === "In Stock"
                    ? "green"
                    : product.stockStatus === "Low Stock"
                      ? "orange"
                      : "red",
                children: t(product.stockStatus),
              }),
            ],
          }),
        ],
      }),
    ],
  })
}
function FeaturedProducts({ onPortalSelect, t, nearbyVendorIds }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const nearbyItems = nearbyVendorIds
    ? items.filter((product) => nearbyVendorIds.includes(String(product.vendor)))
    : []

  return _jsx("section", {
    id: "products",
    className: "py-20 bg-white",
    children: _jsxs("div", {
      className: "max-w-7xl mx-auto px-6",
      children: [
        _jsxs("div", {
          className: "flex items-center justify-between mb-10",
          children: [
            _jsxs("div", {
              children: [
                _jsx("h2", {
                  className: "text-3xl font-black text-gray-900 font-display",
                  children: t("Today's Fresh Picks 🥭"),
                }),
                _jsx("p", {
                  className: "text-gray-500 mt-1",
                  children: nearbyVendorIds
                    ? `Deliverable within ${10} km of your location`
                    : "Set your location to see nearby delivery options",
                }),
              ],
            }),
            _jsxs("button", {
              onClick: () => onPortalSelect("customer-auth"),
              className:
                "flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700 border border-green-200 px-4 py-2 rounded-xl hover:bg-green-50 transition-all",
              children: [t("View All"), " ", _jsx(ChevronRight, { size: 14 })],
            }),
          ],
        }),
        _jsx("div", {
          className: "grid grid-cols-2 md:grid-cols-4 gap-5",
          children: loading
            ? _jsx("p", { className: "col-span-full py-8 text-center text-gray-500", children: t("Loading products...") })
            : nearbyVendorIds === null
              ? _jsx("p", { className: "col-span-full py-8 text-center text-gray-500", children: "Set your location in Nearby Vendors to see products deliverable within 10 km." })
              : nearbyItems.length === 0
                ? _jsx("p", { className: "col-span-full py-8 text-center text-gray-500", children: "No products are currently deliverable within 10 km of this location." })
                : nearbyItems.slice(0, 4).map((p) =>
              _jsx(
                ProductCard,
                { product: p, onClick: () => onPortalSelect("customer-auth"), t },
                p._id,
              ),
            ),
        }),
      ],
    }),
  })
}
function FlashSale({ onPortalSelect }) {
  const [time, setTime] = useState({ h: 1, m: 59, s: 42 })
  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev
        s--
        if (s < 0) {
          s = 59
          m--
          if (m < 0) {
            m = 59
            h = Math.max(0, h - 1)
          }
        }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])
  const pad = (n) => String(n).padStart(2, "0")
  return _jsx("section", {
    className: "py-20",
    style: { background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)" },
    children: _jsx("div", {
      className: "max-w-7xl mx-auto px-6",
      children: _jsxs("div", {
        className:
          "flex flex-col md:flex-row items-center justify-between gap-8",
        children: [
          _jsxs("div", {
            children: [
              _jsxs("div", {
                className: "flex items-center gap-2 mb-3",
                children: [
                  _jsx(Zap, {
                    size: 20,
                    className: "text-yellow-400",
                    fill: "#FBC02D",
                  }),
                  _jsx("span", {
                    className: "text-yellow-400 font-bold font-display text-lg",
                    children: "Flash Sale",
                  }),
                ],
              }),
              _jsx("h2", {
                className: "text-3xl font-black text-white font-display mb-2",
                children: "Up to 50% OFF",
              }),
              _jsx("p", {
                className: "text-green-100 font-semibold",
                children: "On seasonal fruits & organic vegetables",
              }),
              _jsx("div", {
                className: "flex items-center gap-3 mt-6",
                children: [
                  ["Hours", pad(time.h)],
                  ["Mins", pad(time.m)],
                  ["Secs", pad(time.s)],
                ].map(([label, val]) =>
                  _jsxs(
                    "div",
                    {
                      className:
                        "text-center bg-white/20 border border-white/30 rounded-xl px-4 py-3",
                      children: [
                        _jsx("p", {
                          className:
                            "text-3xl font-black text-white font-display",
                          children: val,
                        }),
                        _jsx("p", {
                          className: "text-white text-xs font-bold",
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
          _jsx("div", {
            className: "grid grid-cols-2 gap-4",
            children: products
              .filter((p) => p.discount > 25)
              .slice(0, 4)
              .map((p) =>
                _jsxs(
                  "div",
                  {
                    className:
                      "glass-green rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-white/20 transition-all",
                    onClick: () => onPortalSelect("customer-auth"),
                    children: [
                      _jsx("img", {
                        src: p.image,
                        alt: p.name,
                        className:
                          "w-12 h-12 rounded-lg object-cover flex-shrink-0",
                      }),
                      _jsxs("div", {
                        children: [
                          _jsx("p", {
                            className:
                              "text-white text-sm font-bold font-display",
                            children: p.name,
                          }),
                          _jsxs("div", {
                            className: "flex items-center gap-2 mt-0.5",
                            children: [
                              _jsxs("span", {
                                className: "text-yellow-200 font-black text-sm",
                                children: ["\u20B9", p.discountedPrice],
                              }),
                              _jsxs("span", {
                                className: "text-white/60 text-xs line-through",
                                children: ["\u20B9", p.originalPrice],
                              }),
                              _jsxs(Badge, {
                                color: "orange",
                                children: [p.discount, "%"],
                              }),
                            ],
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
    }),
  })
}
function NearbyVendors({ onPortalSelect, onVendorsFound, t }) {
  const [records, setRecords] = useState([])
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searched, setSearched] = useState(false)

  const searchNearby = async (location) => {
    setLoading(true)
    setError("")
    onVendorsFound(null)
    try {
      const vendors = await getNearbyVendors(location)
      setRecords(vendors)
      setSearched(true)
      onVendorsFound(vendors.map((vendor) => String(vendor._id)))
    } catch (requestError) {
      setRecords([])
      setSearched(false)
      setError(requestError.message || "Could not find vendors near this location.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!getAuthToken()) return
    let active = true
    api.get("/api/auth/me")
      .then(({ user }) => {
        if (!active || user.role !== "customer") return
        const savedAddress = [user.address, user.city, user.state, user.pincode].filter(Boolean).join(", ")
        if (!savedAddress) return
        setAddress(savedAddress)
        return getNearbyVendors({ address: savedAddress }).then((vendors) => {
          if (!active) return
          setRecords(vendors)
          setSearched(true)
          onVendorsFound(vendors.map((vendor) => String(vendor._id)))
        })
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Could not load vendors near your saved address.")
      })
    return () => {
      active = false
    }
  }, [])

  const useCurrentLocation = () => {
    setError("")
    if (!navigator.geolocation) {
      setError("This browser does not support location sharing. Enter your address instead.")
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => searchNearby({ latitude: coords.latitude, longitude: coords.longitude }),
      (locationError) => {
        setLoading(false)
        setError(locationError.message || "Allow location access or enter your address.")
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    )
  }

  return _jsx("section", {
    id: "vendors",
    className: "py-20 bg-white",
    children: _jsxs("div", {
      className: "max-w-7xl mx-auto px-6",
      children: [
        _jsx("div", {
          className: "flex items-center justify-between mb-10",
          children: _jsxs("div", {
            children: [
              _jsx("h2", {
                className: "text-3xl font-black text-gray-900 font-display",
                children: t("Nearby Vendors 📍"),
              }),
              _jsx("p", {
                className: "text-gray-500 mt-1",
                children: "Only showing vendors with a driving route of 10 km or less.",
              }),
            ],
          }),
        }),
        _jsxs("form", {
          className: "mb-8 flex flex-wrap gap-3",
          onSubmit: (event) => {
            event.preventDefault()
            searchNearby({ address })
          },
          children: [
            _jsx("input", {
              value: address,
              onChange: (event) => setAddress(event.target.value),
              maxLength: 500,
              placeholder: "Enter your saved delivery address",
              "aria-label": "Delivery address for nearby vendors",
              className: "min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm",
            }),
            _jsx("button", {
              type: "submit",
              disabled: loading || !address.trim(),
              className: "btn-primary rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-50",
              children: loading ? "Searching..." : "Search address",
            }),
            _jsx("button", {
              type: "button",
              onClick: useCurrentLocation,
              disabled: loading,
              className: "rounded-xl border border-green-700 px-4 py-3 text-sm font-semibold text-green-800 disabled:opacity-50",
              children: "Use my location",
            }),
          ],
        }),
        error && _jsx("p", { role: "alert", className: "mb-4 text-sm text-red-600", children: error }),
        _jsx("div", {
          className: "grid md:grid-cols-3 lg:grid-cols-5 gap-5",
          children: loading
            ? _jsx("p", { className: "col-span-full py-8 text-center text-gray-500", children: "Checking vendor driving distances..." })
            : !searched
              ? _jsx("p", { className: "col-span-full py-8 text-center text-gray-500", children: "Use GPS or enter a delivery address to find vendors that can deliver to you." })
              : records.length === 0
                ? _jsx("p", { className: "col-span-full py-8 text-center text-gray-500", children: "No vendors can deliver to this location within 10 km." })
              : records.map((v) =>
            _jsxs(
              "div",
              {
                className:
                  "glass rounded-2xl p-5 text-center cursor-pointer product-card",
                onClick: () => onPortalSelect("customer-auth"),
                children: [
                  v.avatar
                    ? _jsx("img", {
                        src: v.avatar,
                        alt: v.businessName || v.name,
                        className: "w-16 h-16 rounded-2xl object-cover mx-auto mb-3 shadow-lg",
                      })
                    : _jsx("div", {
                        className: "w-16 h-16 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-3 font-bold",
                        children: (v.businessName || v.name || "V").slice(0, 1).toUpperCase(),
                      }),
                  _jsx("p", {
                    className: "font-bold text-gray-900 font-display text-sm",
                    children: v.businessName || v.name,
                  }),
                  _jsx("p", {
                    className: "text-xs text-gray-500 mt-0.5",
                    children: `${v.category || "Vendor"} · ${v.deliveryDistanceKm} km away`,
                  }),
                  _jsx("div", {
                    className: "mt-2 flex items-center justify-center gap-1",
                    children:
                      v.verified &&
                      _jsx(Badge, {
                        color: "green",
                        children: t("✓ Verified"),
                      }),
                  }),
                ],
              },
              v._id,
            ),
          ),
        }),
      ],
    }),
  })
}
function ImpactStats({ t }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get("/api/admin/public-stats").then(setStats).catch(() => setStats(null))
  }, [])
  return _jsx("section", {
    className: "py-20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-950 dark:to-slate-900",
    children: _jsxs("div", {
      className: "max-w-7xl mx-auto px-6",
      children: [
        _jsxs("div", {
          className: "text-center mb-12",
          children: [
            _jsx("h2", {
              className: "text-3xl font-black text-gray-900 font-display",
              children: t("Our Impact 🌍"),
            }),
            _jsx("p", {
              className: "text-gray-500 mt-2",
              children: t("Real numbers. Real change."),
            }),
          ],
        }),
        _jsx("div", {
          className: "grid grid-cols-2 md:grid-cols-4 gap-6",
          children: [
            {
              icon: "🍽️",
              value: stats ? stats.mealsSaved.toLocaleString() : "—",
              label: t("Meals Saved"),
              sub: t("From waste to tables"),
            },
            {
              icon: "🌱",
              value: stats ? `${stats.co2Saved.toLocaleString()} kg` : "—",
              label: t("CO₂ Saved"),
              sub: t("Carbon reduced"),
            },
            {
              icon: "🏪",
              value: stats ? stats.totalVendors.toLocaleString() : "—",
              label: t("Vendor Partners"),
              sub: t("Fresh produce"),
            },
            {
              icon: "💚",
              value: stats ? stats.totalCustomers.toLocaleString() : "—",
              label: t("Happy Customers"),
              sub: t("Across India"),
            },
          ].map((stat, i) =>
            _jsxs(
              "div",
              {
                className: "glass rounded-2xl p-6 text-center",
                children: [
                  _jsx("p", {
                    className: "text-4xl mb-3",
                    children: stat.icon,
                  }),
                  _jsx("p", {
                    className:
                      "text-green-700 text-3xl font-black font-display",
                    children: stat.value,
                  }),
                  _jsx("p", {
                    className:
                      "text-gray-900 font-bold font-display text-sm mt-1",
                    children: stat.label,
                  }),
                  _jsx("p", {
                    className: "text-gray-600 text-xs mt-0.5 font-medium",
                    children: stat.sub,
                  }),
                ],
              },
              i,
            ),
          ),
        }),
      ],
    }),
  })
}
function HowItWorks({ t }) {
  const steps = [
    { icon: "🔍", step: "01", title: "Browse listings", desc: "Explore products currently listed by vendors." },
    {
      icon: "🛒",
      step: "02",
      title: "Check product details",
      desc: "Review vendor-reported freshness, current price, and stock before ordering.",
    },
    {
      icon: "📦",
      step: "03",
      title: "Place an order",
      desc: "Checkout verifies product availability and records your order.",
    },
    {
      icon: "♻️",
      step: "04",
      title: "Reduce Waste",
      desc: "Vendors can offer eligible surplus inventory to participating NGOs.",
    },
  ]
  return _jsx("section", {
    id: "how-it-works",
    className: "py-20 bg-white",
    children: _jsxs("div", {
      className: "max-w-7xl mx-auto px-6",
      children: [
        _jsxs("div", {
          className: "text-center mb-12",
          children: [
            _jsx("h2", {
              className: "text-3xl font-black text-gray-900 font-display",
              children: t("How Cyber Fresh Works"),
            }),
            _jsx("p", {
              className: "text-gray-500 mt-2",
              children: t("Simple, smart, and sustainable"),
            }),
          ],
        }),
        _jsx("div", {
          className: "grid md:grid-cols-4 gap-6",
          children: steps.map((s, i) =>
            _jsxs(
              "div",
              {
                className: "relative",
                children: [
                  i < steps.length - 1 &&
                    _jsx("div", {
                      className:
                        "hidden md:block absolute top-8 left-full w-full h-0.5 bg-green-100 z-0",
                    }),
                  _jsxs("div", {
                    className:
                      "glass rounded-2xl p-6 text-center relative z-10",
                    children: [
                      _jsx("div", {
                        className: "text-4xl mb-3",
                        children: s.icon,
                      }),
                      _jsx("span", {
                        className:
                          "text-xs font-black text-white bg-green-600 px-3 py-1 rounded-full font-display",
                        children: s.step,
                      }),
                      _jsx("h3", {
                        className:
                          "font-bold text-gray-900 font-display mt-3 mb-2",
                        children: t(s.title),
                      }),
                      _jsx("p", {
                        className:
                          "text-gray-600 text-sm leading-relaxed font-medium",
                        children: t(s.desc),
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
    }),
  })
}
function Testimonials({ t }) {
  return _jsx("section", {
    className: "py-20 bg-gradient-to-br from-green-50 to-white dark:from-slate-950 dark:to-slate-900",
    children: _jsxs("div", {
      className: "max-w-7xl mx-auto px-6",
      children: [
        _jsxs("div", {
          className: "text-center mb-12",
          children: [
            _jsx("h2", {
              className: "text-3xl font-black text-gray-900 font-display",
              children: t("What Customers Say 💬"),
            }),
            _jsx("p", {
              className: "text-gray-500 mt-2",
              children: t("Real reviews from real people"),
            }),
          ],
        }),
        _jsx("div", {
          className: "grid md:grid-cols-3 gap-6",
          children: testimonials.map((t) =>
            _jsxs(
              "div",
              {
                className: "glass rounded-2xl p-6",
                children: [
                  _jsx("div", {
                    className: "flex items-center gap-1 mb-4",
                    children: [1, 2, 3, 4, 5].map((i) =>
                      _jsx(
                        Star,
                        {
                          size: 14,
                          fill: "#FBC02D",
                          className: "text-yellow-400",
                        },
                        i,
                      ),
                    ),
                  }),
                  _jsxs("p", {
                    className: "text-gray-700 text-sm leading-relaxed mb-5",
                    children: ['"', t.comment, '"'],
                  }),
                  _jsxs("div", {
                    className: "flex items-center gap-3",
                    children: [
                      _jsx("img", {
                        src: t.avatar,
                        alt: t.name,
                        className: "w-10 h-10 rounded-full object-cover",
                      }),
                      _jsxs("div", {
                        children: [
                          _jsx("p", {
                            className:
                              "font-bold text-gray-900 text-sm font-display",
                            children: t.name,
                          }),
                          _jsx("p", {
                            className: "text-gray-600 text-xs font-medium",
                            children: t.role,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              },
              t.id,
            ),
          ),
        }),
      ],
    }),
  })
}
function FAQ({ t }) {
  const [open, setOpen] = useState(null)
  return _jsx("section", {
    className: "py-20 bg-white",
    children: _jsxs("div", {
      className: "max-w-3xl mx-auto px-6",
      children: [
        _jsx("div", {
          className: "text-center mb-12",
          children: _jsx("h2", {
            className: "text-3xl font-black text-gray-900 font-display",
            children: t("Frequently Asked Questions"),
          }),
        }),
        _jsx("div", {
          className: "space-y-3",
          children: faqs.map((faq, i) =>
            _jsxs(
              "div",
              {
                className: "glass rounded-2xl overflow-hidden",
                children: [
                  _jsxs("button", {
                    className:
                      "w-full text-left px-6 py-4 flex items-center justify-between",
                    onClick: () => setOpen(open === i ? null : i),
                    children: [
                      _jsx("span", {
                        className:
                          "font-semibold text-gray-900 text-sm font-display",
                        children: t(faq.q),
                      }),
                      open === i
                        ? _jsx(ChevronUp, {
                            size: 16,
                            className: "text-green-600",
                          })
                        : _jsx(ChevronDown, {
                            size: 16,
                            className: "text-gray-400",
                          }),
                    ],
                  }),
                  open === i &&
                    _jsx("div", {
                      className:
                        "px-6 pb-4 text-sm text-gray-600 leading-relaxed border-t border-green-50 pt-4",
                      children: t(faq.a),
                    }),
                ],
              },
              i,
            ),
          ),
        }),
      ],
    }),
  })
}
function Newsletter({ t }) {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  return _jsx("section", {
    className: "py-20",
    style: { background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)" },
    children: _jsxs("div", {
      className: "max-w-2xl mx-auto px-6 text-center",
      children: [
        _jsx("div", { className: "text-5xl mb-4", children: "\uD83D\uDCE7" }),
        _jsx("h2", {
          className: "text-3xl font-black text-white font-display mb-3",
          children: t("Stay Fresh, Stay Informed"),
        }),
        _jsx("p", {
          className: "text-green-100 font-semibold mb-8",
          children:
            t("Get daily fresh deals, flash sale alerts, and seasonal picks delivered to your inbox."),
        }),
        sent
          ? _jsxs("div", {
              className: "bg-white rounded-2xl p-6",
              children: [
                _jsx("p", {
                  className: "text-2xl mb-2",
                  children: "\uD83C\uDF89",
                }),
                _jsx("p", {
                  className: "font-bold font-display text-gray-900",
                  children: t("You're subscribed!"),
                }),
                _jsx("p", {
                  className: "text-gray-600 text-sm font-medium mt-1",
                  children: t("Watch for fresh deals in your inbox."),
                }),
              ],
            })
          : _jsxs("div", {
              className: "flex gap-3 bg-white rounded-2xl p-2 shadow-xl",
              children: [
                _jsxs("div", {
                  className: "flex-1 flex items-center gap-2 px-3",
                  children: [
                    _jsx(Mail, {
                      size: 16,
                      className: "text-gray-500 flex-shrink-0",
                    }),
                    _jsx("input", {
                      value: email,
                      onChange: (e) => setEmail(e.target.value),
                      placeholder: t("Enter your email address"),
                      className:
                        "flex-1 bg-transparent text-gray-800 placeholder-gray-500 text-sm outline-none py-2 font-medium",
                    }),
                  ],
                }),
                _jsx("button", {
                  onClick: () => setSent(true),
                  className:
                    "btn-orange text-white text-sm font-bold px-6 py-3 rounded-xl flex-shrink-0",
                  children: t("Subscribe"),
                }),
              ],
            }),
      ],
    }),
  })
}
function Footer({ onPortalSelect, t }) {
  return _jsx("footer", {
    className: "bg-gray-900 text-gray-300 py-16",
    children: _jsxs("div", {
      className: "max-w-7xl mx-auto px-6",
      children: [
        _jsxs("div", {
          className: "grid md:grid-cols-3 gap-8 mb-12",
          children: [
            _jsxs("div", {
              className: "",
              children: [
                _jsxs("div", {
                  className: "flex items-center gap-2 mb-4",
                  children: [
                    _jsx("div", {
                      className:
                        "w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center",
                      children: _jsx(Leaf, {
                        size: 18,
                        className: "text-white",
                      }),
                    }),
                    _jsxs("span", {
                      className: "text-xl font-bold font-display text-white",
                      children: [
                        "Cyber",
                        _jsx("span", {
                          className: "text-white",
                          children: "Fresh",
                        }),
                      ],
                    }),
                  ],
                }),
                _jsx("p", {
                  className: "text-sm leading-relaxed mb-4 text-gray-300",
                  children: t("A marketplace connecting food vendors, shoppers, and community organizations to help reduce food waste."),
                }),
              ],
            }),
            _jsxs("div", {
              children: [
                _jsx("p", {
                  className:
                    "text-white font-semibold font-display text-sm mb-4",
                  children: t("Portals"),
                }),
                [
                  [t("Customer"), "customer-auth"],
                  [t("Vendor"), "vendor-auth"],
                  [t("NGO"), "ngo-auth"],
                  [t("Delivery Partner"), "delivery-auth"],
                  [t("Admin"), "admin-auth"],
                ].map(([label, portal]) =>
                  _jsxs(
                    "button",
                    {
                      onClick: () => onPortalSelect(portal),
                      className:
                        "block text-sm hover:text-green-400 transition-colors mb-2 text-left",
                      children: [label, ` ${t("Login")}`],
                    },
                    portal,
                  ),
                ),
              ],
            }),
            _jsxs("div", {
              children: [
                _jsx("p", {
                  className: "text-white font-semibold font-display text-sm mb-4",
                  children: t("contactUs"),
                }),
                _jsxs("a", {
                  href: "mailto:damanchouhan9918@gmail.com",
                  className: "flex items-center gap-2 text-sm hover:text-green-400 transition-colors mb-3",
                  children: [_jsx(Mail, { size: 16 }), "damanchouhan9918@gmail.com"],
                }),
                _jsxs("a", {
                  href: "https://wa.me/919596911368?text=Hello%20CyberFresh%20support",
                  target: "_blank",
                  rel: "noreferrer",
                  className: "flex items-center gap-2 text-sm hover:text-green-400 transition-colors",
                  children: [_jsx(MessageCircle, { size: 16 }), t("messageWhatsApp")],
                }),
              ],
            }),
          ],
        }),
        _jsxs("div", {
          className:
            "border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs",
          children: [
            _jsx("p", {
              children: "© 2026 CyberFresh",
            }),
          ],
        }),
      ],
    }),
  })
}
export default function LandingPage({ onPortalSelect }) {
  const { dark, toggleDark, accent, setAccent } = usePortalTheme()
  const { language, setLanguage, t } = useLanguage()
  const [nearbyVendorIds, setNearbyVendorIds] = useState(null)
  const preferences = { dark, onToggleDark: toggleDark, accent, onAccentChange: setAccent, language, onLanguageChange: setLanguage, t }
  return _jsxs("div", {
    className: `min-h-screen ${dark ? "dark" : ""}`,
    children: [
      _jsx(Navbar, { onPortalSelect: onPortalSelect, preferences: preferences }),
      _jsx(Hero, { onPortalSelect: onPortalSelect, t: t, dark: dark }),
      _jsx(FeaturedProducts, { onPortalSelect: onPortalSelect, t, nearbyVendorIds }),
      _jsx(NearbyVendors, { onPortalSelect, onVendorsFound: setNearbyVendorIds, t }),
      _jsx(ImpactStats, { t }),
      _jsx(HowItWorks, { t }),
      _jsx(FAQ, { t }),
      _jsx(Footer, { onPortalSelect: onPortalSelect, t: t }),
    ],
  })
}

import { api } from "./client"

export function getNearbyVendors(location) {
  const params = new URLSearchParams()
  if (typeof location.address === "string" && location.address.trim()) {
    params.set("address", location.address.trim())
  } else if (
    Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude)
  ) {
    params.set("latitude", String(location.latitude))
    params.set("longitude", String(location.longitude))
  } else {
    throw new Error("Enter a delivery address or share your GPS location.")
  }
  return api.get(`/api/users/vendors/nearby?${params.toString()}`)
}

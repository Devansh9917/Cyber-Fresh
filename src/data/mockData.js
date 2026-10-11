export const products = []
export const vendors = []
export const orders = []
export const reminders = []
export const notifications = []
export const vendorInventory = []
export const donations = []
export const revenueData = []
export const categoryData = []
export const wasteData = []
export const ngoDonationHistory = []
export const adminStats = {
  totalUsers: 0,
  totalVendors: 0,
  totalNGOs: 0,
  totalProducts: 0,
  totalOrders: 0,
  revenue: 0,
  mealsSaved: 0,
  co2Saved: 0,
  wasteReduced: 0,
}
export const adminUsers = []
export const adminVendors = []
export const testimonials = []
export const faqs = [
  {
    q: 'Where does marketplace data come from?',
    a: 'Products, vendors, orders, and donation records are loaded from the CyberFresh API and its MongoDB database.',
  },
  {
    q: 'How is product freshness reported?',
    a: 'The vendor supplies a freshness score when creating a product listing.',
  },
  {
    q: 'How does Notify Me work?',
    a: 'A request is stored for an out-of-stock product. Availability alerts are sent only when a real notification provider is configured and the item is restocked.',
  },
]

import Product from '../models/Product.js'
import Order from '../models/Order.js'
import Donation from '../models/Donation.js'
import User from '../models/User.js'

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'of', 'for', 'and', 'or', 'my',
  'me', 'i', 'it', 'in', 'on', 'at', 'with', 'what', 'when', 'where', 'who', 'why',
  'how', 'can', 'could', 'should', 'would', 'do', 'does', 'did', 'this', 'that', 'these',
  'those', 'from', 'about', 'show', 'tell', 'give', 'need', 'needme', 'help', 'find',
  'using', 'want', 'looking', 'please', 'status', 'order', 'delivery', 'product', 'products'
])

function normalizeMessage(message) {
  return String(message || '').trim()
}

function getSearchTerms(message) {
  return [...new Set(
    message
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word && !STOP_WORDS.has(word))
  )]
}

function formatMoney(value) {
  const number = Number(value) || 0
  return `₹${number.toLocaleString('en-IN')}`
}

function formatArray(items, maxItems = 5) {
  if (!Array.isArray(items) || !items.length) return 'No matching records found.'
  return items.slice(0, maxItems).map((item) => item.name || item.product || item.orderId || item.title || item._id).filter(Boolean).join(', ')
}

function buildUnavailableMessage(subject) {
  return `I checked the current CyberFresh backend records and did not find any ${subject} data available for your account.`
}

export async function chatWithCyberFresh(req, res) {
  try {
    const message = normalizeMessage(req.body?.message)
    if (!message) {
      return res.status(400).json({ message: 'Please send a question for the CyberFresh AI assistant.' })
    }

    const role = req.user?.role
    const lowerMessage = message.toLowerCase()
    const terms = getSearchTerms(message)

    let answer = 'I checked the live CyberFresh backend records and here is what I found.'
    let data = {}

    if (role === 'customer' || role === 'admin') {
      if (/order|delivery|tracking/.test(lowerMessage)) {
        const orderQuery = role === 'customer' ? { user: req.user._id } : {}
        const orders = await Order.find(orderQuery).sort({ createdAt: -1 }).limit(10).lean()
        if (orders.length) {
          const orderSummary = orders.map((item) => `${item.orderId} • ${item.status} • ${formatMoney(item.total)}`)
          answer = `I found ${orders.length} order record(s) in the backend: ${orderSummary.join('; ')}.`
          data.orders = orders
        } else {
          answer = buildUnavailableMessage('order or delivery')
        }
      }

      if (/price|cost|discount|recommend|fresh|shelf|product/.test(lowerMessage) || terms.length) {
        const productQuery = { status: 'Active' }
        const searchText = terms.join(' ')
        if (searchText) {
          productQuery.$or = [
            { name: { $regex: searchText, $options: 'i' } },
            { category: { $regex: searchText, $options: 'i' } },
            { tags: { $in: [new RegExp(searchText, 'i')] } },
          ]
        }

        const products = await Product.find(productQuery)
          .sort({ freshnessScore: -1, discountedPrice: 1 })
          .limit(5)
          .lean()

        if (products.length) {
          const productSummary = products.map((product) => {
            const freshness = product.freshnessScore ?? 'n/a'
            const price = formatMoney(product.discountedPrice)
            return `${product.name} (${product.category}) — ${freshness}/100 freshness, ${price}, stock ${product.stock}`
          })
          answer = `I found the following live product records: ${productSummary.join('; ')}.`
          data.products = products
          if (/recommend/.test(lowerMessage)) {
            const recommended = products.filter((item) => Number(item.stock) > 0).slice(0, 3)
            answer = recommended.length
              ? `Recommended from current inventory: ${recommended.map((item) => item.name).join(', ')}.`
              : 'There are no recommendable products in the current active inventory.'
          }
        } else {
          answer = buildUnavailableMessage('product information')
        }
      }
    }

    if (role === 'vendor' || role === 'admin') {
      const vendorFilter = role === 'vendor' ? { vendor: req.user._id } : {}
      const vendorProducts = await Product.find(vendorFilter).sort({ freshnessScore: 1, stock: 1 }).limit(10).lean()
      if (vendorProducts.length) {
        const spoilageCandidates = vendorProducts.filter((product) => Number(product.freshnessScore) < 60 || Number(product.stock) < 15)
        const discountCandidates = vendorProducts.filter((product) => Number(product.discount) > 0 || Number(product.stock) < 20)
        const inventorySummary = vendorProducts.reduce((summary, product) => {
          summary.totalStock += Number(product.stock) || 0
          summary.lowFreshness += Number(product.freshnessScore) < 60 ? 1 : 0
          return summary
        }, { totalStock: 0, lowFreshness: 0 })

        data.vendorProducts = vendorProducts
        if (/spoil|fresh|shelf|expiry|near/.test(lowerMessage) || /discount|donat|inventory|summary/.test(lowerMessage)) {
          answer = `Current live inventory summary: ${inventorySummary.totalStock} total units, ${inventorySummary.lowFreshness} product(s) are below 60 freshness. Candidates: ${formatArray(spoilageCandidates.length ? spoilageCandidates : vendorProducts, 5)}.`
          if (discountCandidates.length) {
            answer += ` Discount candidates: ${formatArray(discountCandidates, 5)}.`
          }
        }
      } else if (/inventory|fresh|spoil|discount|donat/.test(lowerMessage)) {
        answer = buildUnavailableMessage('vendor inventory or spoilage data')
      }
    }

    if (role === 'ngo' || role === 'admin') {
      const donationQuery = role === 'ngo' ? { ngo: req.user._id } : {}
      const donations = await Donation.find(donationQuery).sort({ createdAt: -1 }).limit(10).lean()
      if (donations.length) {
        answer = `I found ${donations.length} donation record(s) in the backend: ${donations.map((item) => `${item.product || 'Donation'} • ${item.status || 'Pending'}`).join('; ')}.`
        data.donations = donations
      } else if (/donat|pickup|ngo|donation/.test(lowerMessage)) {
        answer = buildUnavailableMessage('donation or pickup data')
      }
    }

    if (role === 'delivery_partner' || role === 'admin') {
      const deliveryQuery = role === 'delivery_partner' ? { 'deliveryPartner.user': req.user._id } : {}
      const deliveries = await Order.find(deliveryQuery).sort({ updatedAt: -1 }).limit(10).lean()
      if (deliveries.length) {
        const summary = deliveries.map((item) => `${item.orderId} • ${item.status}`).join('; ')
        answer = `Delivery records found: ${summary}.`
        data.deliveries = deliveries
      } else if (/delivery|pickup|assigned/.test(lowerMessage)) {
        answer = buildUnavailableMessage('delivery assignment data')
      }
    }

    if (/general|support|hello|hi|hey/.test(lowerMessage) && !data.products && !data.orders && !data.donations && !data.deliveries) {
      answer = 'I can help with product lookup, order status, delivery status, freshness questions, discounts, donation opportunities, and live inventory summaries using the current CyberFresh MongoDB records.'
    }

    return res.json({
      answer,
      data,
      role,
      generatedAt: new Date().toISOString(),
      source: 'mongodb-backend',
      noInventedData: true,
    })
  } catch (error) {
    console.error('AI chat error:', error)
    return res.status(500).json({
      answer: 'I hit a backend error while checking the live records. Please retry your question or ask for a simpler query.',
      message: error.message || 'Unable to answer the request from the live database.',
    })
  }
}

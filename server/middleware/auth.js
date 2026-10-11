import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token provided' })
    }
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if (!user) return res.status(401).json({ message: 'User no longer exists' })

    if (user.status === 'Suspended') {
      return res.status(403).json({ message: 'Account is suspended. Please contact support.' })
    }

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' })
  }
}

export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Role '${req.user?.role || 'anonymous'}' is not authorized to access this resource.` })
    }
    next()
  }
}

// Aliases matching Requirement 28
export const authenticateUser = protect
export const requireAdmin = restrictTo('admin')
export const requireVendor = restrictTo('vendor')
export const requireCustomer = restrictTo('customer')
export const requireNGO = restrictTo('ngo')

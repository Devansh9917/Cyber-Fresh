# Cyber Fresh — MERN Stack Project

A farm-to-table marketplace with 4 portals (Customer, Vendor, NGO, Admin), built as:
- **Frontend**: React + TypeScript + Vite + Tailwind (this root folder)
- **Backend**: Node + Express + MongoDB (`/server`)

## Project structure

```
/                     ← React frontend
  src/
    api/              ← API client functions (fetch wrappers per resource)
    components/       ← 4 portals + landing + shared UI
    data/mockData.ts  ← original static demo data (still used for a few
                         not-yet-wired sections — see "What's wired" below)
/server                ← Express + MongoDB backend
  models/             ← Mongoose schemas
  routes/              ← Express routers
  controllers/         ← route handlers
  middleware/auth.js   ← JWT auth + role guard
  seed/seed.js         ← populates the DB with demo vendors + products
```

## Setup — run these two apps side by side

### 1. Backend

For a new checkout, create the root `.env` from [.env.example](./.env.example).
If a root `.env` already exists, keep it and add any missing variables from
the example rather than replacing it. Set at least these backend values:
```
MONGO_URI=<your MongoDB connection string — Atlas or local>
JWT_SECRET=<any long random string>
```

```bash
cd server
npm install
npm run seed   # populates 5 vendors + 8 products
npm run dev    # starts on http://localhost:3000
```

Sanity check: visit `http://localhost:3000/api/products` — you should see JSON.

### Persistent image uploads

Product images, profile photos, and vendor payment QR images are stored in
Cloudinary so vendor uploads remain publicly available after Render restarts
or redeploys. Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
`CLOUDINARY_API_SECRET` in the backend environment. Never expose the API secret
in a `VITE_*` variable.

To migrate existing images that still exist in the local `server/uploads`
folder, configure the production `MONGO_URI` and Cloudinary credentials in the
root `.env`, then run this once from the project root:

```bash
npm --prefix server run migrate:images
```

The script updates MongoDB URLs for files it successfully uploads and reports
local files that are missing. Missing files need to be uploaded again by their
vendor.

### 2. Frontend

```bash
# from the project root
echo "VITE_API_URL=http://localhost:3000" > .env.local
npm install
npm run dev
```

Open the app, go Landing → Login → pick a role → **Register** a new account (only vendor accounts are seeded — customers, NGOs, and admins need to be registered through the UI).

## What's wired to the real backend

| Feature | Status |
|---|---|
| Register / Login (all 4 roles) | ✅ real JWT auth |
| Customer → Browse products | ✅ live from MongoDB, with search/category filters |
| Customer → Cart → Checkout | ✅ places a real order, decrements stock |
| Customer → Order History | ✅ live from MongoDB |
| Vendor → Inventory (list + delete) | ✅ live from MongoDB |
| Vendor → Add Product | ✅ creates a real product |
| NGO → Available Donations (list + accept) | ✅ live from MongoDB |
| Admin → Dashboard top stats | ✅ live aggregation from MongoDB |
| Delivery-partner applications and admin approval | ✅ pending accounts can be activated in Admin → Delivery Partners |
| Automatic dispatch | ✅ assigns the shortest Google Routes trip when the order is Packed and an approved partner is online |
| Customer → Live delivery tracking | ✅ partner GPS is shared while online; customer map refreshes every 15 seconds during delivery |
| Distance-based delivery charge and partner earnings | ✅ ₹20 base + ₹8/km, server-calculated from vendor pickup to customer |
| Customer → Contact assigned delivery partner | ✅ call and WhatsApp links |
| Appearance and language preferences | ✅ light/dark, four accent palettes, English/Hindi/Tamil |
| Landing page contact links | ✅ email and WhatsApp |

### Automatic delivery setup

1. Enable billing and the **Routes API** in a Google Cloud project. Add `GOOGLE_MAPS_API_KEY` to the private root `.env` file used by the server; never add it to a `VITE_*` frontend variable or commit it. In Google Cloud Console, restrict the key to the **Routes API**. Since requests are made by Express, do not use an HTTP referrer (website) application restriction; for production, restrict by the backend server's fixed outbound IP when available. Restart the backend after changing the key or its settings.
2. Optionally configure `DELIVERY_PARTNER_BASE_FARE=20` and `DELIVERY_PARTNER_PER_KM=8` in that same server environment. These defaults set both the customer delivery charge and the partner's recorded earnings: ₹20 + ₹8 per road kilometre from vendor pickup(s) to the customer.
3. Vendors must maintain complete pickup addresses in their profiles. At checkout, customers allow GPS access to get a road-distance quote. Orders without a successful location/route quote can still use the existing flat ₹40 manual-delivery option, but cannot be automatically dispatched.
4. Delivery partners apply through the **Delivery Partner** link. An administrator approves them in **Delivery Partners** before they can go online.
5. The partner signs in on a GPS-capable device over HTTPS, grants location permission, and selects **Share GPS and go online**. Keep the partner page open during shifts.
6. When a vendor changes an order to **Packed**, the server compares recent online partner routes and assigns the shortest route. The partner accepts or declines in their portal; declined orders are offered to another available partner. If a route cannot be found, an admin can retry auto-dispatch from **Orders**.
7. After the partner marks the job **Out For Delivery**, the customer can see the partner's recent GPS on the Track Order map. Location stops being exposed when stale or when delivery is complete.

### Verified customer and NGO handoffs

- Each customer order has a six-digit handoff code visible in that customer's order history and confirmation email. The customer shares it with the delivery partner only when the order arrives.
- An NGO receives a separate six-digit code when accepting a donation; it is visible in NGO donation history and sent through configured notification channels.
- Approved partners can select either a packed customer order or an accepted NGO donation, but can hold only one active job at a time. For NGO donations, partners collect from the vendor and deliver to the accepting NGO.
- Partners must enter the recipient's code to complete a delivery. Five incorrect attempts lock verification; contact an administrator/support channel to resolve a locked handoff. Codes are not returned in delivery-partner or vendor API responses.
- Delivery partners can edit their profile photo from the profile control and change language, theme, and accent preferences from their portal.

Earnings are recorded as payable after a partner marks an order delivered. An administrator can review them in **Admin → Delivery payouts**, complete the bank/mobile-wallet transfer outside the app, and select **Record as paid** with an optional transfer reference. The app records the administrator, date, and reference; **it does not send money automatically**. Google Routes API billing, a deployed HTTPS frontend/backend, customer GPS permission, accurate vendor pickup addresses, and online approved partners are prerequisites for the automatic flow. The manual name/phone assignment is still available as a fallback.

## Email, in-app notifications, and WhatsApp links

Automatic user notifications use the app's in-app notification center and email.
Email can use the existing Brevo API configuration (`BREVO_API_KEY` and
`EMAIL_FROM`) or the configured SMTP transport described under
[Password reset email setup](#password-reset-email-setup).

Automatic SMS and WhatsApp sending are disabled. No Twilio or Brevo messaging
credentials are needed. The existing WhatsApp contact links (for example,
customer-to-delivery-partner and landing-page support links) open WhatsApp so
the user can review and send the message themselves. These links do not trigger
an automatic message from the app; WhatsApp may apply its own policies or fees.

Notification settings now explain the available channels instead of offering
SMS/WhatsApp toggles that cannot deliver. Users should keep their email address
up to date, check the in-app notification center for order and donation updates,
and use a WhatsApp link when they want to start a conversation.

## Razorpay checkout and vendor setup

1. Create a Razorpay account and use its **test mode** while developing. Copy
   the Key ID and Key Secret from the Razorpay dashboard into
   `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in the private root `.env` used by
   the backend. The Key ID is returned to the browser for Checkout; the Key
   Secret must remain server-side and must never be put in a `VITE_*` variable
   or committed.
2. Restart the backend after configuring keys. The checkout offers Razorpay
   only when the server reports valid credentials. Test payments with Razorpay
   test-mode credentials before switching to live keys.
3. The backend calculates item and delivery totals, checks stock and the vendor
   delivery radius, binds the Razorpay order to the customer/cart, verifies the
   payment signature and captured amount, and creates the paid order only after
   verification. Cash on Delivery remains available.
4. Vendors must complete business/contact/pickup address and UPI ID/QR setup
   before creating a new product. Customer payments are collected by the
   platform through Razorpay; the vendor QR is retained for settlement
   records. This project does not automatically split or transfer Razorpay
   funds to vendors.

## Feedback, complaints, and admin reports

Customers, vendors, NGOs, and delivery partners can submit feedback or
complaints from the **Settings** area of their portal; delivery partners also
have the support form while their account is waiting for approval. Submissions
are stored in MongoDB with the submitter's account and role. Administrators can
review them under **Complaints & Support**, add an internal note, and update
their status. The **Reports** page uses current MongoDB aggregates and can
download the displayed data as CSV.

## Password reset email setup

Password reset sends a six-digit code and a secure reset link to the account's
email address when an email provider is configured. The code expires after 10
minutes; the link expires after one hour. For Brevo, create an API key and set
`BREVO_API_KEY` and `EMAIL_FROM` in the private root `.env`. `EMAIL_FROM` must
be an email address verified in Brevo; it may also include a display name, for
example `Cyber Fresh <verified-sender@example.com>`. When `BREVO_API_KEY` is
set, transactional messages use Brevo's API and do not depend on SMTP IP
authorization. If the API key is not set, the backend uses SMTP when
`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, and optionally
`EMAIL_FROM` are configured. For Brevo SMTP, `EMAIL_PASSWORD` must be the SMTP
key, not the account login password.

Set `CLIENT_ORIGIN` to the frontend's public base URL (for example,
`https://your-deployed-site.example`) so reset links open your deployed
application. `http://localhost:8443` is only suitable for local development.
Restart the backend after changing these values. Password reset is available
from the shared sign-in screen for customer, vendor, NGO, delivery partner, and
admin accounts; users still need to sign in through their matching role portal.

## What's still on mock data (`src/data/mockData.ts`)

These follow the exact same pattern as the pages above — an API client file in
`src/api/`, then a `useEffect` + `useState` in the component to fetch and render.
Reasonable next steps, roughly in order of value:

1. **Customer Dashboard / Product Detail** — swap the `products` import for
   `getProducts()` / `getProduct(id)` (already built in `src/api/products.ts`).
2. **Vendor Edit Product** — the Edit icon in Inventory is present but not wired;
   `updateProduct()` is already in `src/api/vendor.ts`, just needs a form/modal.
3. **Vendor → Orders tab, Analytics, AI Suggestions** — orders tab can use
   `getMyOrders`-style logic scoped to vendor (needs a small new backend route
   filtering `Order` by items belonging to that vendor's products — not built yet).
4. **NGO → Donation History, Pickup Schedule, Impact Dashboard** —
   `getDonationHistory()` is already in `src/api/donations.ts`, just needs wiring.
5. **Vendor → Donations tab** (offering surplus stock) — `createDonation()` /
   `getMyDonations()` exist in the API client, needs a form in the Vendor portal.
6. **Admin → Users / Vendors tables, verify/suspend actions** — `getAllCustomers`,
   `getAllVendors`, `setUserStatus`, `setVendorVerified` are all built in
   `src/api/admin.ts`, just need wiring into the existing table UIs.
7. **Reminders / Notifications** — backend routes exist (`/api/reminders`,
   `/api/notifications`); no frontend API client file yet — copy the shape of
   `src/api/orders.ts` to add one.

## Auth notes

- JWT is stored in `sessionStorage` (cleared when the tab closes) via
  `src/api/client.ts`. For a production app, prefer an httpOnly cookie issued
  by the server instead.
- Login checks that the account's role matches the portal you clicked into
  (e.g. a vendor account can't log into the Customer portal).
- Password reset supports expiring email codes and secure email links, plus
  SMS/WhatsApp codes when the account has opted in and the service is configured.
- **Google OAuth** — real, not a mock. The "Continue with Google" button on
  each portal's login screen uses Google Identity Services to get a signed
  ID token, which the backend verifies with `google-auth-library`
  (`POST /api/auth/google`) before issuing our own JWT. First-time Google
  sign-in auto-creates the account for whichever portal (role) you signed in
  from; signing in again just logs you in. To turn it on:
  1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
     create an **OAuth client ID** → **Web application**. Add
     `http://localhost:5173` (and your deployed frontend URL) under
     *Authorized JavaScript origins* — no redirect URI needed.
  2. Backend: set `GOOGLE_CLIENT_ID` in `server/.env` (see `server/.env.example`),
     then `npm install` in `server/` to pull in `google-auth-library`.
  3. Frontend: add `VITE_GOOGLE_CLIENT_ID=<same client id>` to your root `.env`.
  Without this configured, the button area just shows a note instead of
  breaking the page.

## Seeded vendor logins (for testing)

All seeded vendors use the password `password123`:
- greenvalley@cyberfresh.in
- organicroots@cyberfresh.in
- sunrisegardens@cyberfresh.in
- exoticgreens@cyberfresh.in
- berrybliss@cyberfresh.in

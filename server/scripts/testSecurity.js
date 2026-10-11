import assert from 'assert'

const BASE_URL = 'http://localhost:3000'

async function post(path, body, token) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}

async function patch(path, body, token) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}

async function runTests() {
  console.log('=== Running Requirement 39 Security Tests ===\n')

  // Test 1: Normal registration with role: 'admin'
  console.log("Test 1: Normal registration with role: 'admin'")
  const t1 = await post('/api/auth/register', {
    name: 'Hacker User',
    email: 'hacker@example.com',
    password: 'Password@123',
    role: 'admin',
  })
  console.log(`Status: ${t1.status}, Message: ${t1.data.message}`)
  assert.strictEqual(t1.status, 403, 'Test 1 Failed: role admin must be rejected with 403')
  console.log('✅ Test 1 PASSED: Admin registration rejected through public registration endpoint.\n')

  // Test 2: Unauthenticated POST /api/admin/admins
  console.log('Test 2: Unauthenticated POST /api/admin/admins')
  const t2 = await post('/api/admin/admins', {
    name: 'New Admin',
    email: 'newadmin@example.com',
    password: 'Password@123',
  })
  console.log(`Status: ${t2.status}, Message: ${t2.data.message}`)
  assert.strictEqual(t2.status, 401, 'Test 2 Failed: Unauthenticated request must return 401')
  console.log('✅ Test 2 PASSED: Unauthenticated request rejected with 401.\n')

  // Create real customer account for Test 3
  console.log('Registering normal customer account...')
  const custReg = await post('/api/auth/register', {
    name: 'Test Customer',
    email: 'customer@cyberfresh.com',
    password: 'Customer@12345',
    role: 'customer',
  })
  assert.strictEqual(custReg.status, 201, 'Failed to create test customer')
  const customerToken = custReg.data.token

  // Test 3: Customer token calling POST /api/admin/admins
  console.log('Test 3: Customer token POST /api/admin/admins')
  const t3 = await post(
    '/api/admin/admins',
    {
      name: 'Malicious Admin',
      email: 'malicious@example.com',
      password: 'Password@123',
    },
    customerToken
  )
  console.log(`Status: ${t3.status}, Message: ${t3.data.message}`)
  assert.strictEqual(t3.status, 403, 'Test 3 Failed: Customer token must return 403')
  console.log('✅ Test 3 PASSED: Customer token forbidden from admin endpoints.\n')

  // Create real vendor account for Test 4
  console.log('Registering normal vendor account...')
  const vendReg = await post('/api/auth/register', {
    name: 'Test Vendor',
    email: 'vendor@cyberfresh.com',
    password: 'Vendor@12345',
    role: 'vendor',
    businessName: 'Fresh Farms',
  })
  assert.strictEqual(vendReg.status, 201, 'Failed to create test vendor')
  const vendorToken = vendReg.data.token

  // Test 4: Vendor token calling POST /api/admin/admins
  console.log('Test 4: Vendor token POST /api/admin/admins')
  const t4 = await post(
    '/api/admin/admins',
    {
      name: 'Malicious Admin 2',
      email: 'malicious2@example.com',
      password: 'Password@123',
    },
    vendorToken
  )
  console.log(`Status: ${t4.status}, Message: ${t4.data.message}`)
  assert.strictEqual(t4.status, 403, 'Test 4 Failed: Vendor token must return 403')
  console.log('✅ Test 4 PASSED: Vendor token forbidden from admin endpoints.\n')

  // Login as first admin created earlier
  console.log('Logging in as initial administrator...')
  const adminLoginRes = await post('/api/auth/admin-login', {
    email: 'admin@cyberfresh.com',
    password: 'Admin@Password123',
  })
  assert.strictEqual(adminLoginRes.status, 200, 'Failed to login as admin')
  const adminToken = adminLoginRes.data.token
  const initialAdminId = adminLoginRes.data.user._id

  // Test 5: Admin token calling POST /api/admin/admins
  console.log('Test 5: Admin token POST /api/admin/admins')
  const t5 = await post(
    '/api/admin/admins',
    {
      name: 'Second Administrator',
      email: 'admin2@cyberfresh.com',
      password: 'AdminTwo@12345',
    },
    adminToken
  )
  console.log(`Status: ${t5.status}, Message: ${t5.data.message}`)
  assert.strictEqual(t5.status, 201, 'Test 5 Failed: Admin token must successfully create admin')
  assert(t5.data.admin?._id, 'Missing created admin')
  console.log('✅ Test 5 PASSED: Admin token successfully created second administrator.\n')
  const secondAdminId = t5.data.admin._id

  // Test 7: Admin tries to disable the final active administrator.
  console.log('Test 7: Safety test - disable second admin first...')
  const disableSecond = await patch(`/api/admin/admins/${secondAdminId}/status`, { status: 'Suspended' }, adminToken)
  assert.strictEqual(disableSecond.status, 200, 'Disabling second admin should succeed')
  console.log('Second admin disabled. Now only 1 active administrator remains.')

  console.log('Attempting to disable the FINAL active administrator (initial admin)...')
  const t7 = await patch(`/api/admin/admins/${initialAdminId}/status`, { status: 'Suspended' }, adminToken)
  console.log(`Status: ${t7.status}, Message: ${t7.data.message}`)
  assert.strictEqual(t7.status, 400, 'Test 7 Failed: Disabling last active admin must return 400')
  console.log('✅ Test 7 PASSED: System prevented disabling the last active administrator.\n')

  console.log('ALL SECURITY TESTS PASSED SUCCESSFULLY! 🛡️')
}

runTests().catch(err => {
  console.error('Test execution failed:', err)
  process.exit(1)
})

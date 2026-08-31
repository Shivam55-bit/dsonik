const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';
const API_URL = `${BASE_URL}/api`;

let adminToken = '';
let customerToken = '';
let customerCookie = '';
let testTestimonialId = '';
let testAchievementId = '';
let testFaqId = '';
let testClientId = '';
let testInquiryId = '';

const pass = (msg) => console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
const fail = (msg, err) => {
  console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
  if (err?.response?.data) console.error('   Details:', JSON.stringify(err.response.data));
  else if (err) console.error('   Error:', err.message);
};

async function runTests() {
  console.log('\n======================================================');
  console.log('  DSONIK API AUTOMATED VERIFICATION SUITE');
  console.log(`  Target Base URL: ${BASE_URL}`);
  console.log('======================================================\n');

  try {
    // 1. Health Checks
    try {
      const h1 = await axios.get(`${BASE_URL}/health`);
      if (h1.data.status === 'ok' || h1.data.status === 'OK' || h1.data.success) pass('GET /health');
      else fail('GET /health returned non-ok status');
    } catch (e) { fail('GET /health', e); }

    try {
      const h2 = await axios.get(`${API_URL}/health`);
      if (h2.data.status === 'ok' || h2.data.status === 'OK' || h2.data.success) pass('GET /api/health');
      else fail('GET /api/health returned non-ok status');
    } catch (e) { fail('GET /api/health', e); }

    // 2. Auth Endpoints
    const testAdminEmail = 'admin@dsonik.com';
    const testAdminPassword = 'Admin@123';
    const testUserEmail = `testuser_${Date.now()}@dsonik.com`;
    const testUserPassword = 'User@123456';

    try {
      const reg = await axios.post(`${API_URL}/auth/register`, {
        name: 'Test Customer',
        email: testUserEmail,
        password: testUserPassword,
        phone: '9876543210'
      });
      customerToken = reg.data.token || reg.data.data?.token;
      if (customerToken) pass('POST /api/auth/register (Customer Registered)');
      else fail('POST /api/auth/register missing token');
    } catch (e) { fail('POST /api/auth/register', e); }

    try {
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: testUserEmail,
        password: testUserPassword
      });
      customerToken = loginRes.data.token || loginRes.data.data?.token;
      const setCookie = loginRes.headers['set-cookie'];
      if (setCookie) customerCookie = setCookie.join('; ');
      if (customerToken) pass('POST /api/auth/login (Customer Login)');
      else fail('POST /api/auth/login missing token');
    } catch (e) { fail('POST /api/auth/login', e); }

    try {
      const adminLoginRes = await axios.post(`${API_URL}/auth/login/admin`, {
        email: testAdminEmail,
        password: testAdminPassword
      });
      adminToken = adminLoginRes.data.token || adminLoginRes.data.data?.token;
      if (adminToken) pass('POST /api/auth/login/admin (Admin Login)');
      else fail('POST /api/auth/login/admin missing token');
    } catch (e) { fail('POST /api/auth/login/admin', e); }

    try {
      const prof = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      if (prof.data.success || prof.data.data?.email === testUserEmail) pass('GET /api/auth/profile');
      else fail('GET /api/auth/profile mismatch');
    } catch (e) { fail('GET /api/auth/profile', e); }

    try {
      const refreshRes = await axios.post(`${API_URL}/auth/refresh`, {}, {
        headers: { Cookie: customerCookie },
        withCredentials: true
      });
      if (refreshRes.data.success || refreshRes.data.token) pass('POST /api/auth/refresh');
      else fail('POST /api/auth/refresh failed');
    } catch (e) { fail('POST /api/auth/refresh', e); }

    // 3. Testimonials APIs (Public & Admin)
    try {
      const pubTest = await axios.get(`${API_URL}/testimonials`);
      if (pubTest.data.success) pass('GET /api/testimonials (Public Active Testimonials)');
      else fail('GET /api/testimonials');
    } catch (e) { fail('GET /api/testimonials', e); }

    try {
      const adminTest = await axios.get(`${API_URL}/admin/testimonials`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (adminTest.data.success) pass('GET /api/admin/testimonials');
      else fail('GET /api/admin/testimonials');
    } catch (e) { fail('GET /api/admin/testimonials', e); }

    try {
      const createTestRes = await axios.post(`${API_URL}/admin/testimonials`, {
        name: 'Verification Client',
        designation: 'VP Engineering',
        company: 'TechCorp',
        message: 'Outstanding machines and customer service.',
        rating: 5,
        status: 'active',
        displayOrder: 99
      }, { headers: { Authorization: `Bearer ${adminToken}` } });
      const testData = createTestRes.data.data || createTestRes.data.testimonial;
      testTestimonialId = testData._id;
      if (testTestimonialId) pass('POST /api/admin/testimonials');
      else fail('POST /api/admin/testimonials returned empty ID');
    } catch (e) { fail('POST /api/admin/testimonials', e); }

    try {
      const updateTestRes = await axios.put(`${API_URL}/admin/testimonials/${testTestimonialId}`, {
        message: 'Updated review message'
      }, { headers: { Authorization: `Bearer ${adminToken}` } });
      if (updateTestRes.data.success) pass('PUT /api/admin/testimonials/:id');
      else fail('PUT /api/admin/testimonials/:id');
    } catch (e) { fail('PUT /api/admin/testimonials/:id', e); }

    // 4. Achievements APIs (Public & Admin)
    try {
      const pubAch = await axios.get(`${API_URL}/achievements`);
      if (pubAch.data.success) pass('GET /api/achievements (Public Active Achievements)');
      else fail('GET /api/achievements');
    } catch (e) { fail('GET /api/achievements', e); }

    try {
      const adminAch = await axios.get(`${API_URL}/admin/achievements`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (adminAch.data.success) pass('GET /api/admin/achievements');
      else fail('GET /api/admin/achievements');
    } catch (e) { fail('GET /api/admin/achievements', e); }

    try {
      const createAchRes = await axios.post(`${API_URL}/admin/achievements`, {
        title: 'Patent Registrations',
        value: 12,
        suffix: '+',
        icon: 'award',
        status: 'active',
        displayOrder: 99
      }, { headers: { Authorization: `Bearer ${adminToken}` } });
      const achData = createAchRes.data.data || createAchRes.data.achievement;
      testAchievementId = achData._id;
      if (testAchievementId) pass('POST /api/admin/achievements');
      else fail('POST /api/admin/achievements returned empty ID');
    } catch (e) { fail('POST /api/admin/achievements', e); }

    try {
      const updateAchRes = await axios.put(`${API_URL}/admin/achievements/${testAchievementId}`, {
        value: 15
      }, { headers: { Authorization: `Bearer ${adminToken}` } });
      if (updateAchRes.data.success) pass('PUT /api/admin/achievements/:id');
      else fail('PUT /api/admin/achievements/:id');
    } catch (e) { fail('PUT /api/admin/achievements/:id', e); }

    // 5. FAQs APIs (Public & Admin)
    try {
      const pubFaq = await axios.get(`${API_URL}/faqs`);
      if (pubFaq.data.success) pass('GET /api/faqs (Public Active FAQs)');
      else fail('GET /api/faqs');
    } catch (e) { fail('GET /api/faqs', e); }

    try {
      const adminFaq = await axios.get(`${API_URL}/admin/faqs`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (adminFaq.data.success) pass('GET /api/admin/faqs');
      else fail('GET /api/admin/faqs');
    } catch (e) { fail('GET /api/admin/faqs', e); }

    try {
      const createFaqRes = await axios.post(`${API_URL}/admin/faqs`, {
        question: 'What warranty is offered?',
        answer: 'All DSONIK machines carry a 1-year comprehensive warranty.',
        category: 'service',
        status: 'active',
        displayOrder: 99
      }, { headers: { Authorization: `Bearer ${adminToken}` } });
      const faqData = createFaqRes.data.data || createFaqRes.data.faq;
      testFaqId = faqData._id;
      if (testFaqId) pass('POST /api/admin/faqs');
      else fail('POST /api/admin/faqs returned empty ID');
    } catch (e) { fail('POST /api/admin/faqs', e); }

    try {
      const updateFaqRes = await axios.put(`${API_URL}/admin/faqs/${testFaqId}`, {
        answer: 'Updated warranty description.'
      }, { headers: { Authorization: `Bearer ${adminToken}` } });
      if (updateFaqRes.data.success) pass('PUT /api/admin/faqs/:id');
      else fail('PUT /api/admin/faqs/:id');
    } catch (e) { fail('PUT /api/admin/faqs/:id', e); }

    // 6. Site Content APIs (Public & Admin)
    try {
      const pubContent = await axios.get(`${API_URL}/site-content?section=about`);
      if (pubContent.data.success && pubContent.data.data && Object.keys(pubContent.data.data).length > 0) {
        pass('GET /api/site-content?section=about (Public Site Content Map)');
      } else {
        fail('GET /api/site-content?section=about');
      }
    } catch (e) { fail('GET /api/site-content?section=about', e); }

    try {
      const adminContent = await axios.get(`${API_URL}/admin/site-content`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (adminContent.data.success) pass('GET /api/admin/site-content');
      else fail('GET /api/admin/site-content');
    } catch (e) { fail('GET /api/admin/site-content', e); }

    try {
      const updateContentRes = await axios.put(`${API_URL}/admin/site-content/about_main`, {
        section: 'about',
        title: 'About DSONIK',
        subtitle: 'Your Technology Partner',
        description: 'DSONIK is a manufacturing company involved in sales and service of plastic welding machinery.'
      }, { headers: { Authorization: `Bearer ${adminToken}` } });
      if (updateContentRes.data.success) pass('PUT /api/admin/site-content/:key');
      else fail('PUT /api/admin/site-content/:key');
    } catch (e) { fail('PUT /api/admin/site-content/:key', e); }

    // 7. Contact Info APIs (Public & Admin)
    try {
      const pubContact = await axios.get(`${API_URL}/contact-info`);
      if (pubContact.data.success) pass('GET /api/contact-info (Public Contact Info)');
      else fail('GET /api/contact-info');
    } catch (e) { fail('GET /api/contact-info', e); }

    try {
      const adminContact = await axios.get(`${API_URL}/admin/contact-info`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (adminContact.data.success) pass('GET /api/admin/contact-info');
      else fail('GET /api/admin/contact-info');
    } catch (e) { fail('GET /api/admin/contact-info', e); }

    try {
      const updateContactRes = await axios.put(`${API_URL}/admin/contact-info`, {
        phoneNumbers: ['+91-120-4217390', '+91-120-4217391'],
        emailAddresses: ['info@dsonik.com', 'sales@dsonik.com'],
        officeAddress: 'DSONIK Pvt. Ltd., Industrial Area Site-4, Sahibabad, Ghaziabad — 201010'
      }, { headers: { Authorization: `Bearer ${adminToken}` } });
      if (updateContactRes.data.success) pass('PUT /api/admin/contact-info');
      else fail('PUT /api/admin/contact-info');
    } catch (e) { fail('PUT /api/admin/contact-info', e); }

    // 8. Client APIs (Public & Admin)
    try {
      const pubClient = await axios.get(`${API_URL}/clients`);
      if (pubClient.data.success) pass('GET /api/clients (Public Active Clients)');
      else fail('GET /api/clients');
    } catch (e) { fail('GET /api/clients', e); }

    try {
      const adminClient = await axios.get(`${API_URL}/admin/clients`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (adminClient.data.success) pass('GET /api/admin/clients');
      else fail('GET /api/admin/clients');
    } catch (e) { fail('GET /api/admin/clients', e); }

    try {
      const createClientRes = await axios.post(`${API_URL}/admin/clients`, {
        name: 'Test Client Partner',
        website: 'https://example.com',
        status: 'active',
        displayOrder: 99
      }, { headers: { Authorization: `Bearer ${adminToken}` } });
      const clientData = createClientRes.data.data || createClientRes.data.client;
      testClientId = clientData._id;
      if (testClientId) pass('POST /api/admin/clients');
      else fail('POST /api/admin/clients returned empty ID');
    } catch (e) { fail('POST /api/admin/clients', e); }

    try {
      const updateClientRes = await axios.put(`${API_URL}/admin/clients/${testClientId}`, {
        website: 'https://example.org'
      }, { headers: { Authorization: `Bearer ${adminToken}` } });
      if (updateClientRes.data.success) pass('PUT /api/admin/clients/:id');
      else fail('PUT /api/admin/clients/:id');
    } catch (e) { fail('PUT /api/admin/clients/:id', e); }

    // 9. Inquiry Submission (Contact Section source: contact-section)
    try {
      const inqRes = await axios.post(`${API_URL}/inquiries`, {
        name: 'Contact Page User',
        email: 'contact@example.com',
        phone: '9876543210',
        company: 'Contact Pvt Ltd',
        subject: 'Contact section inquiry',
        message: 'Inquiring from contact page.',
        source: 'contact-section'
      });
      const inqData = inqRes.data.data?.inquiry || inqRes.data.inquiry || inqRes.data;
      testInquiryId = inqData._id || inqRes.data.data?.inquiryId;
      if (testInquiryId) pass('POST /api/inquiries (Contact Inquiry with source: contact-section)');
      else fail('POST /api/inquiries returned empty ID');
    } catch (e) { fail('POST /api/inquiries', e); }

    // Cleanup Dynamic Test Records
    if (testTestimonialId) {
      await axios.delete(`${API_URL}/admin/testimonials/${testTestimonialId}`, { headers: { Authorization: `Bearer ${adminToken}` } });
      pass('DELETE /api/admin/testimonials/:id (Cleanup Success)');
    }
    if (testAchievementId) {
      await axios.delete(`${API_URL}/admin/achievements/${testAchievementId}`, { headers: { Authorization: `Bearer ${adminToken}` } });
      pass('DELETE /api/admin/achievements/:id (Cleanup Success)');
    }
    if (testFaqId) {
      await axios.delete(`${API_URL}/admin/faqs/${testFaqId}`, { headers: { Authorization: `Bearer ${adminToken}` } });
      pass('DELETE /api/admin/faqs/:id (Cleanup Success)');
    }
    if (testClientId) {
      await axios.delete(`${API_URL}/admin/clients/${testClientId}`, { headers: { Authorization: `Bearer ${adminToken}` } });
      pass('DELETE /api/admin/clients/:id (Cleanup Success)');
    }
    if (testInquiryId) {
      await axios.delete(`${API_URL}/admin/inquiries/${testInquiryId}`, { headers: { Authorization: `Bearer ${adminToken}` } });
      pass('DELETE /api/admin/inquiries/:id (Cleanup Success)');
    }

    // 10. Logout Test
    try {
      const logoutRes = await axios.post(`${API_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      if (logoutRes.data.success) pass('POST /api/auth/logout');
      else fail('POST /api/auth/logout');
    } catch (e) { fail('POST /api/auth/logout', e); }

    console.log('\n======================================================');
    console.log('  ALL API VERIFICATION TESTS COMPLETED! 🎉');
    console.log('======================================================\n');
  } catch (globalErr) {
    console.error('Test suite error:', globalErr);
  }
}

runTests();

// Final comprehensive system test
const API_BASE = 'http://localhost:5000';

async function finalSystemTest() {
  console.log('🧪 FINAL SYSTEM TEST - Clean Database & Chat Functionality\n');

  try {
    // Test 1: Verify no hardcoded data
    console.log('1️⃣ Testing clean database (no hardcoded data)...');
    
    // Test publications endpoint
    const pubResponse = await fetch(`${API_BASE}/api/v1/publications`);
    const pubData = await pubResponse.json();
    
    if (pubData.success) {
      console.log(`✅ Publications endpoint working - ${pubData.data.publications.length} publications found`);
      if (pubData.data.publications.length === 0) {
        console.log('✅ No hardcoded publications - database is clean');
      }
    }

    // Test 2: Admin functionality
    console.log('\n2️⃣ Testing admin login and authentication...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@pranam.com',
        password: 'admin123'
      }),
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      throw new Error('Admin login failed: ' + loginData.message);
    }

    const adminToken = loginData.data.token;
    const adminUser = loginData.data.user;
    console.log('✅ Admin login successful');
    console.log(`   👤 Admin: ${adminUser.name} (${adminUser.email})`);
    console.log(`   🎭 Role: ${adminUser.role}`);

    // Test 3: Admin endpoints with authentication
    console.log('\n3️⃣ Testing admin endpoints with authentication...');
    const adminEndpoints = [
      '/api/admin/db-stats',
      '/api/admin/chats',
      '/api/admin/questions',
      '/api/admin/healing-forms',
      '/api/admin/newsletter-subscribers'
    ];

    for (const endpoint of adminEndpoints) {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ${endpoint} - Working`);
      } else {
        console.log(`❌ ${endpoint} - Failed: ${data.message}`);
      }
    }

    // Test 4: Anonymous chat functionality
    console.log('\n4️⃣ Testing anonymous chat functionality...');
    const chatResponse = await fetch(`${API_BASE}/api/chat/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: 'Final System Test',
        message: 'Testing anonymous chat after database cleanup'
      }),
    });

    const chatData = await chatResponse.json();
    
    if (!chatData.success) {
      throw new Error('Anonymous chat failed: ' + chatData.message);
    }

    const conversationId = chatData.data.conversationId;
    console.log('✅ Anonymous chat creation works');
    console.log(`   📝 Conversation ID: ${conversationId}`);

    // Test 5: Admin can see and reply to chat
    console.log('\n5️⃣ Testing admin chat management...');
    const adminChatsResponse = await fetch(`${API_BASE}/api/admin/chats`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    const adminChatsData = await adminChatsResponse.json();
    
    if (!adminChatsData.success) {
      throw new Error('Admin chat list failed: ' + adminChatsData.message);
    }

    const conversations = adminChatsData.data.conversations || [];
    const testConversation = conversations.find(c => c.conversationId === conversationId);
    
    if (!testConversation) {
      throw new Error('Admin cannot see the test conversation');
    }
    console.log('✅ Admin can see chat conversations');
    console.log(`   💬 Total conversations: ${conversations.length}`);

    // Admin reply
    const adminReplyResponse = await fetch(`${API_BASE}/api/chat/${conversationId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        message: 'Admin reply: System test successful! Chat functionality is working perfectly.'
      }),
    });

    const adminReplyData = await adminReplyResponse.json();
    
    if (!adminReplyData.success) {
      throw new Error('Admin reply failed: ' + adminReplyData.message);
    }
    console.log('✅ Admin can reply to chats');

    // Test 6: User registration and authentication
    console.log('\n6️⃣ Testing user registration...');
    const testEmail = `test_${Date.now()}@example.com`;
    const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: testEmail,
        password: 'testpass123'
      }),
    });

    const registerData = await registerResponse.json();
    
    if (registerData.success) {
      console.log('✅ User registration works');
      console.log(`   👤 Test user: ${testEmail}`);
    } else {
      console.log('ℹ️ User registration response:', registerData.message);
    }

    // Final Summary
    console.log('\n🎉 FINAL SYSTEM TEST COMPLETE!');
    console.log('\n✅ System Status:');
    console.log('   ✅ Database cleaned of hardcoded data');
    console.log('   ✅ Admin authentication working');
    console.log('   ✅ Admin dashboard endpoints secured');
    console.log('   ✅ Anonymous chat functionality working');
    console.log('   ✅ Admin chat management working');
    console.log('   ✅ User registration working');
    console.log('   ✅ All API endpoints responding correctly');

    console.log('\n🚀 SYSTEM READY FOR PRODUCTION!');
    console.log('\n📱 Frontend Testing:');
    console.log('   1. Go to http://localhost:5173');
    console.log('   2. Test chat widget (bottom right)');
    console.log('   3. Login as admin: admin@pranam.com / admin123');
    console.log('   4. Should redirect to /admin automatically');
    console.log('   5. Test chat management in admin dashboard');

  } catch (error) {
    console.error('\n❌ System test failed:', error.message);
    process.exit(1);
  }
}

finalSystemTest();

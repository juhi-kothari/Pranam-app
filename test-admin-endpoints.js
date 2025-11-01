// Test admin endpoints to debug the issue
const API_BASE = 'http://localhost:5000';

async function testAdminEndpoints() {
  console.log('🧪 Testing Admin Endpoints...\n');

  try {
    // First login as admin to get token
    console.log('1️⃣ Logging in as admin...');
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

    const token = loginData.data.token;
    console.log('✅ Admin login successful');

    // Test all admin endpoints
    const endpoints = [
      '/api/admin/db-stats',
      '/api/admin/healing-forms', 
      '/api/admin/questions',
      '/api/admin/chats',
      '/api/admin/newsletter-subscribers'
    ];

    for (const endpoint of endpoints) {
      console.log(`\n2️⃣ Testing ${endpoint}...`);
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ${endpoint} - SUCCESS`);
        if (endpoint === '/api/admin/chats') {
          console.log(`   📝 Conversations: ${data.data.conversations?.length || 0}`);
        } else if (endpoint === '/api/admin/questions') {
          console.log(`   📝 Questions: ${data.data.questions?.length || 0}`);
        } else if (endpoint === '/api/admin/healing-forms') {
          console.log(`   📝 Forms: ${data.data.forms?.length || 0}`);
        }
      } else {
        console.log(`❌ ${endpoint} - FAILED: ${data.message}`);
      }
    }

    // Test chat endpoints specifically
    console.log('\n3️⃣ Testing chat functionality...');
    
    // Start a test chat
    const chatResponse = await fetch(`${API_BASE}/api/chat/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: 'Test from admin endpoint test',
        message: 'This is a test message to verify chat works'
      }),
    });

    const chatData = await chatResponse.json();
    
    if (chatData.success) {
      console.log('✅ Chat creation works');
      console.log(`   📝 Conversation ID: ${chatData.data.conversationId}`);
      
      // Now check if admin can see this chat
      const adminChatsResponse = await fetch(`${API_BASE}/api/admin/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const adminChatsData = await adminChatsResponse.json();
      
      if (adminChatsData.success) {
        const conversations = adminChatsData.data.conversations || [];
        const testChat = conversations.find(c => c.conversationId === chatData.data.conversationId);
        
        if (testChat) {
          console.log('✅ Admin can see the new chat conversation');
        } else {
          console.log('⚠️ Admin cannot see the new chat conversation');
        }
      }
    } else {
      console.log('❌ Chat creation failed:', chatData.message);
    }

    console.log('\n🎉 Admin endpoint testing completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testAdminEndpoints();

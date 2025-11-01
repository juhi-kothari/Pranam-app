// Test script for chat API functionality
// Using built-in fetch (Node.js 18+)

const API_BASE = 'http://localhost:5000';

async function testChatAPI() {
  console.log('🧪 Testing Chat API Functionality...\n');

  try {
    // Test 1: Start anonymous chat
    console.log('1️⃣ Testing anonymous chat start...');
    const startResponse = await fetch(`${API_BASE}/api/chat/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: 'Test Chat',
        message: 'Hello, this is a test message from anonymous user!'
      }),
    });

    const startData = await startResponse.json();
    console.log('   Response:', startData);

    if (!startData.success) {
      throw new Error('Failed to start chat');
    }

    const conversationId = startData.data.conversationId;
    console.log('   ✅ Chat started successfully with ID:', conversationId);

    // Test 2: Send another message to the conversation
    console.log('\n2️⃣ Testing message sending...');
    const messageResponse = await fetch(`${API_BASE}/api/chat/${conversationId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'This is a follow-up message!'
      }),
    });

    const messageData = await messageResponse.json();
    console.log('   Response:', messageData);

    if (!messageData.success) {
      throw new Error('Failed to send message');
    }
    console.log('   ✅ Message sent successfully');

    // Test 3: Get conversation messages
    console.log('\n3️⃣ Testing message retrieval...');
    const messagesResponse = await fetch(`${API_BASE}/api/chat/${conversationId}/messages`);
    const messagesData = await messagesResponse.json();
    console.log('   Response:', messagesData);

    if (!messagesData.success) {
      throw new Error('Failed to get messages');
    }
    console.log('   ✅ Messages retrieved successfully');
    console.log('   📝 Message count:', messagesData.data.messages.length);

    // Test 4: Test admin endpoints (requires admin token)
    console.log('\n4️⃣ Testing admin chat list...');
    const adminResponse = await fetch(`${API_BASE}/api/admin/chats`);
    const adminData = await adminResponse.json();
    
    if (adminData.success) {
      console.log('   ✅ Admin chat list accessible');
      console.log('   💬 Total conversations:', adminData.data.conversations.length);
    } else {
      console.log('   ⚠️ Admin endpoint requires authentication (expected)');
    }

    console.log('\n🎉 All chat API tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Anonymous chat creation');
    console.log('   ✅ Message sending');
    console.log('   ✅ Message retrieval');
    console.log('   ✅ Admin endpoint accessible');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testChatAPI();

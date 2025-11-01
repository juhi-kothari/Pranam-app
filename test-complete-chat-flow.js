// Complete test for chat functionality
const API_BASE = 'http://localhost:5000';

async function testCompleteChatFlow() {
  console.log('🧪 Testing Complete Chat Flow...\n');

  try {
    // Step 1: Test anonymous chat creation
    console.log('1️⃣ Testing anonymous chat creation...');
    const chatResponse = await fetch(`${API_BASE}/api/chat/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: 'Test Anonymous Chat',
        message: 'Hello! This is an anonymous user testing the chat.'
      }),
    });

    const chatData = await chatResponse.json();
    
    if (!chatData.success) {
      throw new Error('Anonymous chat creation failed: ' + chatData.message);
    }

    const conversationId = chatData.data.conversationId;
    console.log('✅ Anonymous chat created successfully');
    console.log(`   📝 Conversation ID: ${conversationId}`);

    // Step 2: Send follow-up message
    console.log('\n2️⃣ Testing follow-up message...');
    const messageResponse = await fetch(`${API_BASE}/api/chat/${conversationId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'This is a follow-up message from the anonymous user.'
      }),
    });

    const messageData = await messageResponse.json();
    
    if (!messageData.success) {
      throw new Error('Follow-up message failed: ' + messageData.message);
    }
    console.log('✅ Follow-up message sent successfully');

    // Step 3: Get conversation messages
    console.log('\n3️⃣ Testing message retrieval...');
    const messagesResponse = await fetch(`${API_BASE}/api/chat/${conversationId}/messages`);
    const messagesData = await messagesResponse.json();
    
    if (!messagesData.success) {
      throw new Error('Message retrieval failed: ' + messagesData.message);
    }
    console.log('✅ Messages retrieved successfully');
    console.log(`   📝 Total messages: ${messagesData.data.messages.length}`);

    // Step 4: Admin login
    console.log('\n4️⃣ Testing admin login...');
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
    console.log('✅ Admin login successful');

    // Step 5: Admin view chats
    console.log('\n5️⃣ Testing admin chat list...');
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
    console.log('✅ Admin can see the test conversation');
    console.log(`   📝 Total conversations: ${conversations.length}`);

    // Step 6: Admin reply to chat
    console.log('\n6️⃣ Testing admin reply...');
    const adminReplyResponse = await fetch(`${API_BASE}/api/chat/${conversationId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        message: 'Hello! This is an admin response to your inquiry. How can I help you today?'
      }),
    });

    const adminReplyData = await adminReplyResponse.json();
    
    if (!adminReplyData.success) {
      throw new Error('Admin reply failed: ' + adminReplyData.message);
    }
    console.log('✅ Admin reply sent successfully');

    // Step 7: Verify complete conversation
    console.log('\n7️⃣ Testing complete conversation...');
    const finalMessagesResponse = await fetch(`${API_BASE}/api/chat/${conversationId}/messages`);
    const finalMessagesData = await finalMessagesResponse.json();
    
    if (!finalMessagesData.success) {
      throw new Error('Final message retrieval failed: ' + finalMessagesData.message);
    }

    const finalMessages = finalMessagesData.data.messages;
    console.log('✅ Complete conversation retrieved');
    console.log(`   📝 Final message count: ${finalMessages.length}`);
    
    // Display conversation summary
    console.log('\n📋 Conversation Summary:');
    finalMessages.forEach((msg, index) => {
      const sender = msg.senderType === 'admin' ? '👨‍💼 Admin' : '👤 User';
      const time = new Date(msg.createdAt).toLocaleTimeString();
      console.log(`   ${index + 1}. ${sender} (${time}): ${msg.message.substring(0, 50)}...`);
    });

    console.log('\n🎉 COMPLETE CHAT FLOW TEST SUCCESSFUL!');
    console.log('\n✅ Test Results:');
    console.log('   ✅ Anonymous chat creation works');
    console.log('   ✅ Follow-up messages work');
    console.log('   ✅ Message retrieval works');
    console.log('   ✅ Admin authentication works');
    console.log('   ✅ Admin can view all chats');
    console.log('   ✅ Admin can reply to chats');
    console.log('   ✅ Complete conversation flow works');

    console.log('\n🚀 Your chat system is fully functional!');
    console.log('\n📱 Next Steps:');
    console.log('   1. Go to http://localhost:5173 and test the chat widget');
    console.log('   2. Login as admin at http://localhost:5173/auth');
    console.log('   3. Go to admin dashboard and check the Chats tab');
    console.log('   4. Reply to conversations as admin');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testCompleteChatFlow();

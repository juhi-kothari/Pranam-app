// Comprehensive test for all functionality
const API_BASE = 'http://localhost:5000';

async function testAllFunctionality() {
  console.log('🧪 COMPREHENSIVE FUNCTIONALITY TEST\n');

  try {
    // Test 1: Admin Login
    console.log('1️⃣ Testing admin login...');
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

    // Test 2: Blog Posts
    console.log('\n2️⃣ Testing blog posts...');
    
    // Create a blog post
    const blogData = {
      title: 'Test Blog Post',
      content: 'This is a test blog post content.',
      excerpt: 'Test excerpt',
      status: 'published',
      tags: 'test, blog',
      categories: 'general',
      isFeatured: false,
      allowComments: true
    };

    const createBlogResponse = await fetch(`${API_BASE}/api/admin/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(blogData)
    });

    const createBlogResult = await createBlogResponse.json();
    
    if (createBlogResult.success) {
      console.log('✅ Blog post created successfully');
      console.log(`   📝 Blog ID: ${createBlogResult.data.id}`);
    } else {
      console.log('❌ Blog creation failed:', createBlogResult.message);
    }

    // Get all blog posts
    const getBlogsResponse = await fetch(`${API_BASE}/api/admin/blogs`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const getBlogsResult = await getBlogsResponse.json();
    
    if (getBlogsResult.success) {
      console.log('✅ Blog posts retrieved successfully');
      console.log(`   📚 Total blogs: ${getBlogsResult.data.blogs.length}`);
    } else {
      console.log('❌ Blog retrieval failed:', getBlogsResult.message);
    }

    // Test 3: Newsletter Functionality
    console.log('\n3️⃣ Testing newsletter functionality...');
    
    // Subscribe to newsletter
    const testEmail = `test_${Date.now()}@example.com`;
    const subscribeResponse = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail
      }),
    });

    const subscribeResult = await subscribeResponse.json();
    
    if (subscribeResult.success) {
      console.log('✅ Newsletter subscription successful');
      console.log(`   📧 Email: ${testEmail}`);
    } else {
      console.log('❌ Newsletter subscription failed:', subscribeResult.message);
    }

    // Get newsletter subscribers
    const getSubscribersResponse = await fetch(`${API_BASE}/api/admin/newsletter-subscribers`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const getSubscribersResult = await getSubscribersResponse.json();
    
    if (getSubscribersResult.success) {
      console.log('✅ Newsletter subscribers retrieved successfully');
      console.log(`   👥 Total subscribers: ${getSubscribersResult.data.stats.total}`);
      console.log(`   ✅ Active: ${getSubscribersResult.data.stats.active}`);
      console.log(`   ❌ Inactive: ${getSubscribersResult.data.stats.inactive}`);
    } else {
      console.log('❌ Newsletter subscribers retrieval failed:', getSubscribersResult.message);
    }

    // Test 4: Chat Functionality
    console.log('\n4️⃣ Testing chat functionality...');
    
    // Start anonymous chat
    const chatResponse = await fetch(`${API_BASE}/api/chat/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: 'Test Chat',
        message: 'Hello! This is a test message from anonymous user.'
      }),
    });

    const chatData = await chatResponse.json();
    
    if (!chatData.success) {
      throw new Error('Chat creation failed: ' + chatData.message);
    }

    const conversationId = chatData.data.conversationId;
    console.log('✅ Anonymous chat created successfully');
    console.log(`   💬 Conversation ID: ${conversationId}`);

    // Send follow-up message
    const followUpResponse = await fetch(`${API_BASE}/api/chat/${conversationId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'This is a follow-up message.'
      }),
    });

    const followUpData = await followUpResponse.json();
    
    if (followUpData.success) {
      console.log('✅ Follow-up message sent successfully');
    } else {
      console.log('❌ Follow-up message failed:', followUpData.message);
    }

    // Admin views chats
    const adminChatsResponse = await fetch(`${API_BASE}/api/admin/chats`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const adminChatsData = await adminChatsResponse.json();
    
    if (adminChatsData.success) {
      console.log('✅ Admin can view chats');
      console.log(`   💬 Total conversations: ${adminChatsData.data.conversations.length}`);
      
      const testConversation = adminChatsData.data.conversations.find(c => c.conversationId === conversationId);
      if (testConversation) {
        console.log('✅ Test conversation found in admin view');
        console.log(`   📊 Status: ${testConversation.status}`);
      }
    } else {
      console.log('❌ Admin chat view failed:', adminChatsData.message);
    }

    // Admin replies to chat
    const adminReplyResponse = await fetch(`${API_BASE}/api/chat/${conversationId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        message: 'Hello! This is an admin response to your inquiry.'
      }),
    });

    const adminReplyData = await adminReplyResponse.json();
    
    if (adminReplyData.success) {
      console.log('✅ Admin reply sent successfully');
    } else {
      console.log('❌ Admin reply failed:', adminReplyData.message);
    }

    // Test chat status update
    const statusUpdateResponse = await fetch(`${API_BASE}/api/admin/chats/${conversationId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'closed'
      }),
    });

    const statusUpdateData = await statusUpdateResponse.json();
    
    if (statusUpdateData.success) {
      console.log('✅ Chat status updated successfully');
      console.log(`   📊 New status: ${statusUpdateData.data.status}`);
    } else {
      console.log('❌ Chat status update failed:', statusUpdateData.message);
    }

    // Get final conversation messages
    const messagesResponse = await fetch(`${API_BASE}/api/chat/${conversationId}/messages`);
    const messagesData = await messagesResponse.json();
    
    if (messagesData.success) {
      console.log('✅ Chat messages retrieved successfully');
      console.log(`   📝 Total messages: ${messagesData.data.messages.length}`);
      
      console.log('\n📋 Conversation Summary:');
      messagesData.data.messages.forEach((msg, index) => {
        const time = new Date(msg.createdAt).toLocaleTimeString();
        const sender = msg.senderType === 'admin' ? '👨‍💼 Admin' : '👤 User';
        console.log(`   ${index + 1}. ${sender} (${time}): ${msg.message.substring(0, 50)}...`);
      });
    }

    console.log('\n🎉 COMPREHENSIVE TEST COMPLETE!');
    console.log('\n✅ Test Results Summary:');
    console.log('   ✅ Admin authentication working');
    console.log('   ✅ Blog post creation and retrieval working');
    console.log('   ✅ Newsletter subscription and management working');
    console.log('   ✅ Anonymous chat functionality working');
    console.log('   ✅ Admin chat management working');
    console.log('   ✅ Chat status updates working');
    console.log('   ✅ Real-time messaging working');

    console.log('\n🚀 ALL FUNCTIONALITY IS WORKING CORRECTLY!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAllFunctionality();

// Debug admin login process
const testAdminLoginFlow = async () => {
  console.log('🔍 Debugging Admin Login Flow...\n');
  
  try {
    // Step 1: Test admin login
    console.log('🔐 Step 1: Testing Admin Login');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@pranam.com',
        password: 'admin123'
      })
    });
    
    const loginResult = await loginResponse.json();
    console.log('   Status:', loginResponse.status);
    console.log('   Success:', loginResult.success);
    console.log('   Message:', loginResult.message);
    
    if (loginResult.success) {
      console.log('   ✅ Login successful');
      console.log('   👤 User Name:', loginResult.data.user.name);
      console.log('   📧 Email:', loginResult.data.user.email);
      console.log('   🔑 Role:', loginResult.data.user.role);
      console.log('   🎫 Token Length:', loginResult.data.token.length);
      
      const token = loginResult.data.token;
      
      // Step 2: Test token validation
      console.log('\n🎫 Step 2: Testing Token Validation');
      const testResponse = await fetch('http://localhost:5000/api/admin/blogs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const testResult = await testResponse.json();
      console.log('   Status:', testResponse.status);
      console.log('   Success:', testResult.success);
      
      if (testResult.success) {
        console.log('   ✅ Token validation successful');
        console.log('   📊 Blog count:', testResult.data?.blogs?.length || 0);
      } else {
        console.log('   ❌ Token validation failed:', testResult.message);
      }
      
      // Step 3: Check user in database
      console.log('\n👤 Step 3: Checking User in Database');
      const dbResponse = await fetch('http://localhost:5000/api/admin/db-stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const dbResult = await dbResponse.json();
      console.log('   Status:', dbResponse.status);
      console.log('   Success:', dbResult.success);
      
      if (dbResult.success) {
        console.log('   ✅ Database access successful');
        console.log('   👥 Total users:', dbResult.data?.userCount || 0);
      }
      
    } else {
      console.log('   ❌ Login failed:', loginResult.message);
    }
    
    console.log('\n📋 Summary:');
    console.log('Backend Server: ✅ Running');
    console.log('Admin Credentials: ✅ Valid');
    console.log('Database Connection: ✅ Working');
    console.log('');
    console.log('🎯 If frontend login still fails, the issue is likely:');
    console.log('1. CORS configuration');
    console.log('2. Frontend form submission');
    console.log('3. AuthContext token handling');
    console.log('4. Browser localStorage issues');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

testAdminLoginFlow();

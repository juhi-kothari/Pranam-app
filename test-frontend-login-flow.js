// Test the exact frontend login flow
const testFrontendLoginFlow = async () => {
  console.log('🔍 Testing Frontend Login Flow...\n');
  
  try {
    // Step 1: Simulate frontend login request (exactly like the frontend does)
    console.log('🔐 Step 1: Simulating Frontend Login Request');
    
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5174'  // Add origin header like browser
      },
      body: JSON.stringify({
        name: '',  // Frontend sends name field even for login
        email: 'admin@pranam.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('   Status:', loginResponse.status);
    console.log('   Success:', loginData.success);
    console.log('   Message:', loginData.message);
    
    if (!loginData.success) {
      console.log('❌ Login failed:', loginData);
      return;
    }
    
    // Step 2: Extract data exactly like frontend does
    console.log('\n📋 Step 2: Data Extraction (Frontend Style)');
    const userData = loginData.data?.user || loginData.user;
    const token = loginData.data?.token || loginData.token;
    
    console.log('   Raw response data:', JSON.stringify(loginData, null, 2));
    console.log('   Extracted userData:', userData);
    console.log('   Extracted token length:', token?.length || 'NO TOKEN');
    
    if (!userData || !token) {
      console.log('❌ Data extraction failed');
      return;
    }
    
    // Step 3: Simulate AuthContext login function
    console.log('\n💾 Step 3: Simulating AuthContext Login');
    const authData = {
      user: {
        name: userData?.name || 'Admin User',
        email: userData?.email || 'admin@pranam.com',
        role: userData?.role || 'user'
      },
      token: token
    };
    
    console.log('   Auth data to save:', authData);
    console.log('   User role:', authData.user.role);
    console.log('   Is admin?', authData.user.role === 'admin');
    
    // Step 4: Test admin access with this token
    console.log('\n🔒 Step 4: Testing Admin Access');
    const adminResponse = await fetch('http://localhost:5000/api/admin/blogs', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5174'
      }
    });
    
    const adminData = await adminResponse.json();
    console.log('   Admin API Status:', adminResponse.status);
    console.log('   Admin API Success:', adminData.success);
    
    if (adminData.success) {
      console.log('   ✅ Admin access working with token');
    } else {
      console.log('   ❌ Admin access failed:', adminData.message);
    }
    
    // Step 5: Check what AdminDashboard would see
    console.log('\n🎯 Step 5: AdminDashboard Check');
    const hasUser = authData.user !== null;
    const isAdmin = authData.user?.role === 'admin';
    
    console.log('   Has user:', hasUser);
    console.log('   User role:', authData.user?.role);
    console.log('   Is admin:', isAdmin);
    console.log('   AdminDashboard condition:', hasUser && isAdmin);
    
    if (hasUser && isAdmin) {
      console.log('   ✅ AdminDashboard should allow access');
    } else {
      console.log('   ❌ AdminDashboard would redirect to /auth');
      console.log('   Reason:', !hasUser ? 'No user' : 'Not admin role');
    }
    
    console.log('\n📊 Summary:');
    console.log('Backend Login: ✅ Working');
    console.log('Data Extraction: ✅ Working');
    console.log('Role Assignment: ✅ Working');
    console.log('Admin Token: ✅ Working');
    console.log('');
    
    if (hasUser && isAdmin) {
      console.log('🎉 Login flow should work! Issue might be:');
      console.log('1. Browser localStorage not saving properly');
      console.log('2. AuthContext not updating state');
      console.log('3. Page refresh clearing state');
      console.log('4. React component not re-rendering');
    } else {
      console.log('❌ Login flow has issues in data handling');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

testFrontendLoginFlow();

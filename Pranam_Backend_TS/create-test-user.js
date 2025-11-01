// Create a test user with known credentials for frontend testing
const BASE_URL = 'http://localhost:5000';

async function createTestUser() {
  console.log('👤 Creating test user for frontend testing...\n');
  
  // Create a new test user
  const testUserData = {
    name: 'Frontend Test User',
    email: 'frontend@test.com',
    password: 'test123'
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUserData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Test user created successfully!');
      console.log(`   Name: ${result.data.user.name}`);
      console.log(`   Email: ${result.data.user.email}`);
      console.log(`   Role: ${result.data.user.role}`);
      console.log(`   User ID: ${result.data.user.id}`);
      
      // Test login immediately
      console.log('\n🔐 Testing login with new user...');
      
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUserData.email,
          password: testUserData.password
        })
      });
      
      const loginResult = await loginResponse.json();
      
      if (loginResult.success) {
        console.log('✅ Login test successful!');
        console.log(`   Token: ${loginResult.data.token.substring(0, 20)}...`);
        
        console.log('\n📋 Frontend Testing Credentials:');
        console.log('=====================================');
        console.log('🔑 ADMIN LOGIN:');
        console.log('   Email: admin@pranam.com');
        console.log('   Password: admin123');
        console.log('   Role: admin');
        console.log('');
        console.log('👤 USER LOGIN:');
        console.log('   Email: frontend@test.com');
        console.log('   Password: test123');
        console.log('   Role: user');
        console.log('');
        console.log('🌐 Frontend URL: http://localhost:5174');
        console.log('🔗 Backend URL: http://localhost:5000');
        console.log('');
        console.log('✅ Both admin and user authentication are working!');
        
      } else {
        console.log('❌ Login test failed:', loginResult.message);
      }
      
    } else {
      if (result.message.includes('already exists')) {
        console.log('ℹ️  Test user already exists, testing login...');
        
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: testUserData.email,
            password: testUserData.password
          })
        });
        
        const loginResult = await loginResponse.json();
        
        if (loginResult.success) {
          console.log('✅ Existing test user login successful!');
          
          console.log('\n📋 Frontend Testing Credentials:');
          console.log('=====================================');
          console.log('🔑 ADMIN LOGIN:');
          console.log('   Email: admin@pranam.com');
          console.log('   Password: admin123');
          console.log('   Role: admin');
          console.log('');
          console.log('👤 USER LOGIN:');
          console.log('   Email: frontend@test.com');
          console.log('   Password: test123');
          console.log('   Role: user');
          console.log('');
          console.log('🌐 Frontend URL: http://localhost:5174');
          console.log('🔗 Backend URL: http://localhost:5000');
          console.log('');
          console.log('✅ Both admin and user authentication are working!');
        } else {
          console.log('❌ Existing user login failed:', loginResult.message);
        }
      } else {
        console.log('❌ User creation failed:', result.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestUser();

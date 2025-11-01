// Script to create/update admin user with correct credentials
const API_BASE = 'http://localhost:5000';

async function fixAdminCredentials() {
  console.log('🔧 Fixing admin credentials...\n');

  try {
    // First, try to login with the default password
    console.log('1️⃣ Testing current admin login...');
    let loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@pranam.com',
        password: 'admin123'  // Default password from backend
      }),
    });

    let loginData = await loginResponse.json();
    
    if (loginData.success) {
      console.log('✅ Admin login successful with password: admin123');
      console.log('📧 Email: admin@pranam.com');
      console.log('🔑 Password: admin123');
      console.log('\n🔗 Login at: http://localhost:5173/auth');
      console.log('🔗 Admin dashboard: http://localhost:5173/admin');
      return;
    }

    // If that doesn't work, try the other password
    console.log('2️⃣ Trying alternative password...');
    loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@pranam.com',
        password: 'admin123456'
      }),
    });

    loginData = await loginResponse.json();
    
    if (loginData.success) {
      console.log('✅ Admin login successful with password: admin123456');
      console.log('📧 Email: admin@pranam.com');
      console.log('🔑 Password: admin123456');
      console.log('\n🔗 Login at: http://localhost:5173/auth');
      console.log('🔗 Admin dashboard: http://localhost:5173/admin');
      return;
    }

    // If neither works, create a new admin user
    console.log('3️⃣ Creating new admin user...');
    const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Admin User',
        email: 'admin@pranam.com',
        password: 'admin123456',
        role: 'admin'
      }),
    });

    const registerData = await registerResponse.json();
    
    if (registerData.success) {
      console.log('✅ New admin user created successfully!');
      console.log('📧 Email: admin@pranam.com');
      console.log('🔑 Password: admin123456');
      console.log('\n🔗 Login at: http://localhost:5173/auth');
      console.log('🔗 Admin dashboard: http://localhost:5173/admin');
    } else {
      console.log('ℹ️ Admin user might already exist. Try these credentials:');
      console.log('📧 Email: admin@pranam.com');
      console.log('🔑 Password: admin123 (default)');
      console.log('🔑 Or try: admin123456');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Try these credentials manually:');
    console.log('📧 Email: admin@pranam.com');
    console.log('🔑 Password: admin123 (default from backend)');
  }
}

fixAdminCredentials();

// Script to create admin user for testing
const API_BASE = 'http://localhost:5000';

async function createAdmin() {
  console.log('👤 Creating admin user...\n');

  try {
    // Create admin user
    const response = await fetch(`${API_BASE}/api/auth/register`, {
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

    const data = await response.json();
    console.log('Registration response:', data);

    if (data.success) {
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@pranam.com');
      console.log('🔑 Password: admin123456');
      console.log('🎭 Role: admin');
      console.log('\n🔗 You can now login at: http://localhost:5173/auth');
      console.log('🔗 Admin dashboard: http://localhost:5173/admin');
    } else {
      if (data.message && data.message.includes('already exists')) {
        console.log('ℹ️ Admin user already exists');
        console.log('📧 Email: admin@pranam.com');
        console.log('🔑 Password: admin123456');
        console.log('\n🔗 You can login at: http://localhost:5173/auth');
        console.log('🔗 Admin dashboard: http://localhost:5173/admin');
      } else {
        throw new Error(data.message || 'Failed to create admin user');
      }
    }

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
}

createAdmin();

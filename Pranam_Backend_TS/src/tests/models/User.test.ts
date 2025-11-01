import { User } from '@/models/User';
import { IUser } from '@/types';

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
      expect(savedUser.role).toBe('user'); // Default role
      expect(savedUser.isActive).toBe(true); // Default active
    });

    it('should not create a user with invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should not create a user with duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      // Create first user
      const user1 = new User(userData);
      await user1.save();

      // Try to create second user with same email
      const user2 = new User(userData);
      
      await expect(user2.save()).rejects.toThrow();
    });

    it('should require name, email, and password', async () => {
      const user = new User({});
      
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe(userData.password);
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });

    it('should not hash password if not modified', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const user = new User(userData);
      await user.save();
      
      const originalHash = user.password;
      
      // Update name without changing password
      user.name = 'Jane Doe';
      await user.save();

      expect(user.password).toBe(originalHash);
    });
  });

  describe('Password Comparison', () => {
    it('should compare password correctly', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const user = new User(userData);
      await user.save();

      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });
  });

  describe('JSON Serialization', () => {
    it('should exclude password and refreshTokens from JSON', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const user = new User(userData);
      user.refreshTokens = ['token1', 'token2'];
      await user.save();

      const userJSON = user.toJSON();

      expect(userJSON.password).toBeUndefined();
      expect(userJSON.refreshTokens).toBeUndefined();
      expect(userJSON.name).toBe(userData.name);
      expect(userJSON.email).toBe(userData.email);
    });
  });

  describe('Virtual Fields', () => {
    it('should have profile virtual field', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '1234567890',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'State',
          pincode: '123456',
          country: 'Country',
        },
      };

      const user = new User(userData);
      await user.save();

      expect(user.profile).toBeDefined();
      expect(user.profile.name).toBe(userData.name);
      expect(user.profile.email).toBe(userData.email);
      expect(user.profile.phone).toBe(userData.phone);
      expect(user.profile.address).toEqual(userData.address);
    });
  });

  describe('Static Methods', () => {
    it('should find active users', async () => {
      // Create active user
      const activeUser = new User({
        name: 'Active User',
        email: 'active@example.com',
        password: 'password123',
        isActive: true,
      });
      await activeUser.save();

      // Create inactive user
      const inactiveUser = new User({
        name: 'Inactive User',
        email: 'inactive@example.com',
        password: 'password123',
        isActive: false,
      });
      await inactiveUser.save();

      const activeUsers = await User.findActive();
      
      expect(activeUsers).toHaveLength(1);
      expect(activeUsers[0].email).toBe('active@example.com');
    });

    it('should find user by email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const user = new User(userData);
      await user.save();

      const foundUser = await User.findByEmail('john@example.com');
      
      expect(foundUser).toBeDefined();
      expect(foundUser!.email).toBe(userData.email);

      const notFoundUser = await User.findByEmail('notfound@example.com');
      expect(notFoundUser).toBeNull();
    });
  });
});

// Simple production-ready server to test database connectivity
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - permissive for development
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret_key_1234567890',
});

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/pranam_db';
    console.log('Connecting to MongoDB:', mongoUri);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Collections in database:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Simple User schema for testing
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Simple Publication schema for testing
const publicationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Publication = mongoose.model('Publication', publicationSchema);

// Order schema for payment integration
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    publicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Publication', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    phone: { type: String, required: true }
  },
  paymentMethod: { type: String, enum: ['cod', 'online'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  orderStatus: { type: String, enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate order number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  this.updatedAt = new Date();
  next();
});

// Also generate order number before validation
orderSchema.pre('validate', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

// Newsletter Subscription Schema
const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  isActive: { type: Boolean, default: true },
  subscribedAt: { type: Date, default: Date.now },
  unsubscribedAt: { type: Date },
  source: { type: String, default: 'website' } // website, admin, import, etc.
}, { timestamps: true });

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

// Healing Form Schema
const healingFormSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  seekingFor: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  photo: { type: String }, // URL or file path for uploaded photo
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional if user is logged in
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  phone: { type: String, trim: true },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  adminNotes: { type: String },
  isConfidential: { type: Boolean, default: true }
}, { timestamps: true });

const HealingForm = mongoose.model('HealingForm', healingFormSchema);

// Questions/Comments Form Schema
const questionFormSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  category: { type: String, required: true, trim: true },
  question: { type: String, required: true, trim: true, maxlength: 2000 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional if user is logged in
  status: {
    type: String,
    enum: ['pending', 'answered', 'published'],
    default: 'pending'
  },
  adminResponse: { type: String },
  isPublic: { type: Boolean, default: false }, // Whether to show on public Q&A
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

const QuestionForm = mongoose.model('QuestionForm', questionFormSchema);

// Chat Message Schema
const chatMessageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true }, // Unique conversation identifier
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Allow null for anonymous users
  senderType: { type: String, enum: ['user', 'admin'], required: true },
  message: { type: String, required: true, trim: true, maxlength: 1000 },
  messageType: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  attachments: [{
    url: String,
    filename: String,
    fileType: String,
    fileSize: Number
  }],
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date }
}, { timestamps: true });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

// Chat Conversation Schema
const chatConversationSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Allow null for anonymous users
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Assigned admin
  subject: { type: String, trim: true, maxlength: 200 },
  status: {
    type: String,
    enum: ['active', 'closed', 'pending'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  lastMessageAt: { type: Date, default: Date.now },
  lastMessageBy: { type: String, enum: ['user', 'admin'] },
  unreadCount: {
    user: { type: Number, default: 0 },
    admin: { type: Number, default: 0 }
  },
  tags: [{ type: String, trim: true }],
  notes: { type: String } // Internal admin notes
}, { timestamps: true });

const ChatConversation = mongoose.model('ChatConversation', chatConversationSchema);

// Blog Post Schema
const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  content: { type: String, required: true, trim: true },
  excerpt: { type: String, trim: true, maxlength: 500 },
  featuredImage: { type: String, trim: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  publishedAt: { type: Date },
  tags: [{ type: String, trim: true, lowercase: true }],
  categories: [{ type: String, trim: true }],
  metaTitle: { type: String, trim: true, maxlength: 60 },
  metaDescription: { type: String, trim: true, maxlength: 160 },
  readingTime: { type: Number }, // in minutes
  viewCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  allowComments: { type: Boolean, default: true },
  seoKeywords: [{ type: String, trim: true }]
}, { timestamps: true });

// Auto-generate slug from title
blogPostSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Calculate reading time (average 200 words per minute)
  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / 200);
  }

  // Set published date when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

// Newsletter subscription endpoint
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if already subscribed
    const existingSubscription = await Newsletter.findOne({ email });
    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Email is already subscribed to newsletter'
        });
      } else {
        // Reactivate subscription
        existingSubscription.isActive = true;
        existingSubscription.subscribedAt = new Date();
        existingSubscription.unsubscribedAt = undefined;
        await existingSubscription.save();

        return res.json({
          success: true,
          message: 'Successfully resubscribed to newsletter'
        });
      }
    }

    // Create new subscription
    const subscription = new Newsletter({ email });
    await subscription.save();

    res.json({
      success: true,
      message: 'Successfully subscribed to newsletter'
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to newsletter',
      error: error.message
    });
  }
});

// Healing form submission endpoint
app.post('/api/forms/healing', async (req, res) => {
  try {
    const { name, seekingFor, description, photo, email, phone } = req.body;

    if (!name || !seekingFor || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name, seeking for, and description are required'
      });
    }

    const healingForm = new HealingForm({
      name,
      seekingFor,
      description,
      photo,
      email,
      phone,
      userId: req.user ? req.user.userId : undefined
    });

    await healingForm.save();

    res.json({
      success: true,
      message: 'Healing form submitted successfully',
      data: {
        id: healingForm._id,
        status: healingForm.status
      }
    });
  } catch (error) {
    console.error('Healing form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit healing form',
      error: error.message
    });
  }
});

// Questions form submission endpoint
app.post('/api/forms/questions', async (req, res) => {
  try {
    const { name, email, category, question } = req.body;

    if (!name || !category || !question) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, and question are required'
      });
    }

    const questionForm = new QuestionForm({
      name,
      email,
      category,
      question,
      userId: req.user ? req.user.userId : undefined
    });

    await questionForm.save();

    res.json({
      success: true,
      message: 'Question submitted successfully',
      data: {
        id: questionForm._id,
        status: questionForm.status
      }
    });
  } catch (error) {
    console.error('Question form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit question',
      error: error.message
    });
  }
});

// Chat endpoints (allow anonymous users)
app.post('/api/chat/start', async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required to start a chat'
      });
    }

    // Generate unique conversation ID
    const conversationId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Create conversation (allow null userId for anonymous users)
    const conversation = new ChatConversation({
      conversationId,
      userId: null, // Allow anonymous chats
      subject: subject || 'General Inquiry',
      unreadCount: { admin: 1, user: 0 }
    });

    await conversation.save();

    // Create first message (allow null senderId for anonymous users)
    const chatMessage = new ChatMessage({
      conversationId,
      senderId: null, // Allow anonymous messages
      senderType: 'user',
      message
    });

    await chatMessage.save();

    res.json({
      success: true,
      message: 'Chat started successfully',
      data: {
        conversationId,
        messageId: chatMessage._id
      }
    });
  } catch (error) {
    console.error('Chat start error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start chat',
      error: error.message
    });
  }
});

// Send chat message
app.post('/api/chat/:conversationId/message', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message, messageType = 'text' } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Find conversation
    const conversation = await ChatConversation.findOne({ conversationId });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Determine sender type (allow anonymous users)
    const isAdmin = req.user && req.user.role === 'admin';
    const senderType = isAdmin ? 'admin' : 'user';

    // Create message (allow null senderId for anonymous users)
    const chatMessage = new ChatMessage({
      conversationId,
      senderId: null, // Allow anonymous messages
      senderType,
      message,
      messageType
    });

    await chatMessage.save();

    // Update conversation
    conversation.lastMessageAt = new Date();
    conversation.lastMessageBy = senderType;

    if (senderType === 'user') {
      conversation.unreadCount.admin += 1;
    } else {
      conversation.unreadCount.user += 1;
    }

    await conversation.save();

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        messageId: chatMessage._id,
        timestamp: chatMessage.createdAt
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Get chat messages
app.get('/api/chat/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await ChatMessage.find({ conversationId })
      .populate('senderId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalMessages = await ChatMessage.countDocuments({ conversationId });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Show oldest first
        pagination: {
          page,
          limit,
          total: totalMessages,
          pages: Math.ceil(totalMessages / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error.message
    });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await mongoose.connection.db.admin().ping();
    res.json({ 
      success: true, 
      message: 'Server and database are running',
      timestamp: new Date().toISOString(),
      database: 'Connected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }
    
    // Create user
    const user = new User({ name, email, password });
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
        accessToken: token,
        refreshToken: token, // Simplified for testing
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
        accessToken: token,
        refreshToken: token, // Simplified for testing
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Publications endpoint
app.get('/api/v1/publications', async (req, res) => {
  try {
    const publications = await Publication.find({ isActive: true });
    res.json({
      success: true,
      data: {
        publications,
        pagination: {
          page: 1,
          limit: 12,
          total: publications.length,
          pages: 1,
        }
      },
    });
  } catch (error) {
    console.error('Publications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch publications',
      error: error.message
    });
  }
});

// Payment endpoints
app.post('/api/v1/payments/create-order', async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    // Validate items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const publication = await Publication.findById(item.publicationId);
      if (!publication) {
        return res.status(400).json({
          success: false,
          message: `Publication not found: ${item.publicationId}`
        });
      }

      if (publication.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${publication.title}`
        });
      }

      const itemTotal = publication.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        publicationId: publication._id,
        quantity: item.quantity,
        price: publication.price
      });
    }

    // Create order in database
    const order = new Order({
      userId: new mongoose.Types.ObjectId(), // Mock user ID for testing
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod
    });

    if (paymentMethod === 'online') {
      // Create Razorpay order (mock for testing)
      try {
        const razorpayOrder = await razorpay.orders.create({
          amount: totalAmount * 100, // Amount in paise
          currency: 'INR',
          receipt: order.orderNumber || 'order_' + Date.now(),
          notes: {
            orderId: order._id.toString()
          }
        });

        order.razorpayOrderId = razorpayOrder.id;
      } catch (error) {
        // Mock Razorpay order for testing when API keys are not valid
        console.log('Using mock Razorpay order for testing');
        order.razorpayOrderId = 'order_mock_' + Date.now();
      }
    }

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          razorpayOrderId: order.razorpayOrderId,
          razorpayKeyId: paymentMethod === 'online' ? process.env.RAZORPAY_KEY_ID : null
        }
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

app.post('/api/v1/payments/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_secret_key_1234567890')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update order status
    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentStatus = 'paid';
    order.orderStatus = 'confirmed';

    await order.save();

    // Reduce stock for items
    for (const item of order.items) {
      await Publication.findByIdAndUpdate(
        item.publicationId,
        { $inc: { stock: -item.quantity } }
      );
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus
        }
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

app.post('/api/v1/payments/webhook', async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret';

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const { event, payload } = req.body;

    if (event === 'payment.captured') {
      const payment = payload.payment.entity;
      const orderId = payment.notes?.orderId;

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'paid',
          orderStatus: 'confirmed',
          razorpayPaymentId: payment.id
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'dev-secret', async (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    try {
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      req.user = {
        userId: user._id,
        email: user.email,
        role: user.role
      };
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Blog endpoints
app.post('/api/admin/blogs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, content, excerpt, featuredImage, tags, categories, status, metaTitle, metaDescription, isFeatured, allowComments } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Generate slug from title
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Ensure unique slug
    let uniqueSlug = slug;
    let counter = 1;
    while (await BlogPost.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const blogPost = new BlogPost({
      title,
      slug: uniqueSlug,
      content,
      excerpt,
      featuredImage,
      author: req.user.userId,
      status: status || 'draft',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      categories: categories ? categories.split(',').map(cat => cat.trim()) : [],
      metaTitle,
      metaDescription,
      isFeatured: isFeatured || false,
      allowComments: allowComments !== false
    });

    await blogPost.save();

    res.json({
      success: true,
      message: 'Blog post created successfully',
      data: {
        id: blogPost._id,
        title: blogPost.title,
        slug: blogPost.slug,
        status: blogPost.status,
        readingTime: blogPost.readingTime
      }
    });
  } catch (error) {
    console.error('Blog creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blog post',
      error: error.message
    });
  }
});

// Get all blog posts (Admin)
app.get('/api/admin/blogs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status; // draft, published, archived

    const filter = {};
    if (status) filter.status = status;

    const blogs = await BlogPost.find(filter)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BlogPost.countDocuments(filter);
    const statusCounts = await BlogPost.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const stats = {
      total,
      draft: statusCounts.find(s => s._id === 'draft')?.count || 0,
      published: statusCounts.find(s => s._id === 'published')?.count || 0,
      archived: statusCounts.find(s => s._id === 'archived')?.count || 0
    };

    res.json({
      success: true,
      data: {
        blogs,
        stats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blog posts',
      error: error.message
    });
  }
});

app.get('/api/admin/blogs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = {};
    if (status && ['draft', 'published', 'archived'].includes(status)) {
      filter.status = status;
    }

    const blogs = await BlogPost.find(filter)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BlogPost.countDocuments(filter);

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog posts',
      error: error.message
    });
  }
});

app.put('/api/admin/blogs/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Handle tags and categories
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
    }
    if (updateData.categories && typeof updateData.categories === 'string') {
      updateData.categories = updateData.categories.split(',').map(cat => cat.trim());
    }

    const blog = await BlogPost.findByIdAndUpdate(id, updateData, { new: true })
      .populate('author', 'name email');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog post updated successfully',
      data: blog
    });
  } catch (error) {
    console.error('Blog update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog post',
      error: error.message
    });
  }
});

app.delete('/api/admin/blogs/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await BlogPost.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Blog deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog post',
      error: error.message
    });
  }
});

// Public blog endpoints
app.get('/api/blogs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await BlogPost.find({ status: 'published' })
      .populate('author', 'name')
      .select('-content') // Exclude full content for list view
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BlogPost.countDocuments({ status: 'published' });

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get public blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog posts',
      error: error.message
    });
  }
});

app.get('/api/blogs/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await BlogPost.findOne({ slug, status: 'published' })
      .populate('author', 'name');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Increment view count
    blog.viewCount += 1;
    await blog.save();

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Get blog by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog post',
      error: error.message
    });
  }
});

// Admin endpoints for managing forms and chats
app.get('/api/admin/healing-forms', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = {};
    if (status) filter.status = status;

    const forms = await HealingForm.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await HealingForm.countDocuments(filter);

    res.json({
      success: true,
      data: {
        forms,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get healing forms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get healing forms',
      error: error.message
    });
  }
});

app.get('/api/admin/questions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = {};
    if (status) filter.status = status;

    const questions = await QuestionForm.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await QuestionForm.countDocuments(filter);

    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get questions',
      error: error.message
    });
  }
});

app.get('/api/admin/chats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = {};
    if (status) filter.status = status;

    const conversations = await ChatConversation.find(filter)
      .populate('userId', 'name email')
      .populate('adminId', 'name email')
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ChatConversation.countDocuments(filter);

    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chats',
      error: error.message
    });
  }
});

// Update chat conversation status (Admin)
app.patch('/api/admin/chats/:conversationId/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { status } = req.body;

    if (!['active', 'closed', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, closed, or pending'
      });
    }

    const conversation = await ChatConversation.findOne({ conversationId });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    conversation.status = status;
    await conversation.save();

    res.json({
      success: true,
      message: 'Conversation status updated successfully',
      data: {
        conversationId,
        status: conversation.status
      }
    });
  } catch (error) {
    console.error('Update chat status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update conversation status',
      error: error.message
    });
  }
});

app.get('/api/admin/newsletter-subscribers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const isActive = req.query.active !== undefined ? req.query.active === 'true' : undefined;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive;

    const subscribers = await Newsletter.find(filter)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Newsletter.countDocuments(filter);
    const activeCount = await Newsletter.countDocuments({ isActive: true });
    const inactiveCount = await Newsletter.countDocuments({ isActive: false });

    res.json({
      success: true,
      data: {
        subscribers,
        stats: {
          total,
          active: activeCount,
          inactive: inactiveCount
        },
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get newsletter subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get newsletter subscribers',
      error: error.message
    });
  }
});

// Update form status
app.put('/api/admin/healing-forms/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const form = await HealingForm.findByIdAndUpdate(
      id,
      { status, adminNotes },
      { new: true }
    );

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Healing form not found'
      });
    }

    res.json({
      success: true,
      message: 'Form status updated successfully',
      data: form
    });
  } catch (error) {
    console.error('Update form status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update form status',
      error: error.message
    });
  }
});

// Answer question
app.put('/api/admin/questions/:id/answer', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminResponse, status = 'answered', isPublic = false } = req.body;

    const question = await QuestionForm.findByIdAndUpdate(
      id,
      { adminResponse, status, isPublic, isApproved: isPublic },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      message: 'Question answered successfully',
      data: question
    });
  } catch (error) {
    console.error('Answer question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to answer question',
      error: error.message
    });
  }
});

// Database stats endpoint
app.get('/api/admin/db-stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const publicationCount = await Publication.countDocuments();
    const orderCount = await Order.countDocuments();
    const collections = await mongoose.connection.db.listCollections().toArray();

    res.json({
      success: true,
      data: {
        userCount,
        publicationCount,
        orderCount,
        collections: collections.map(c => c.name),
        database: mongoose.connection.name,
        connectionState: mongoose.connection.readyState,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get database stats',
      error: error.message
    });
  }
});

// Create admin user endpoint (only if no admin exists)
app.post('/api/admin/create-admin', async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.json({
        success: true,
        message: 'Admin user already exists',
        data: { email: existingAdmin.email }
      });
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@pranam.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin'
    });
    await adminUser.save();

    res.json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user',
      error: error.message
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth endpoints: /api/auth/login, /api/auth/register`);
    console.log(`📚 Publications: /api/v1/publications`);
    console.log(`💳 Payment endpoints: /api/v1/payments/create-order, /api/v1/payments/verify`);
    console.log(`📊 DB Stats: /api/admin/db-stats`);
    console.log(`👤 Create Admin: POST /api/admin/create-admin`);
  });
};

startServer().catch(console.error);

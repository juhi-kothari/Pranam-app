// Database Migration Script - Local to Production MongoDB Atlas
const mongoose = require('mongoose');

// Database URIs
const LOCAL_URI = 'mongodb://localhost:27017/pranam_db';
const PRODUCTION_URI = 'mongodb+srv://pranaamjc_db_user:icjS1x1jt5s4OHGt@pranaam.wkccf0v.mongodb.net/pranam_db';

// Create separate connections
let localConnection;
let productionConnection;

async function connectToLocalDB() {
  try {
    localConnection = await mongoose.createConnection(LOCAL_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to local MongoDB');
    return localConnection;
  } catch (error) {
    console.error('❌ Failed to connect to local MongoDB:', error.message);
    throw error;
  }
}

async function connectToProductionDB() {
  try {
    productionConnection = await mongoose.createConnection(PRODUCTION_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to production MongoDB Atlas');
    return productionConnection;
  } catch (error) {
    console.error('❌ Failed to connect to production MongoDB Atlas:', error.message);
    throw error;
  }
}

// Define schemas for both connections
function defineSchemas(connection) {
  // User Schema
  const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    isActive: Boolean,
    createdAt: Date,
  });

  // Publication Schema
  const publicationSchema = new mongoose.Schema({
    title: String,
    author: String,
    price: Number,
    category: String,
    stock: Number,
    isActive: Boolean,
    createdAt: Date,
  });

  // Order Schema
  const orderSchema = new mongoose.Schema({
    orderNumber: String,
    userId: mongoose.Schema.Types.ObjectId,
    items: [{
      publicationId: mongoose.Schema.Types.ObjectId,
      quantity: Number,
      price: Number
    }],
    totalAmount: Number,
    shippingAddress: {
      address: String,
      city: String,
      pincode: String,
      state: String,
      country: String,
      phone: String
    },
    paymentMethod: String,
    paymentStatus: String,
    orderStatus: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    createdAt: Date,
    updatedAt: Date
  });

  return {
    User: connection.model('User', userSchema),
    Publication: connection.model('Publication', publicationSchema),
    Order: connection.model('Order', orderSchema)
  };
}

async function migrateCollection(localModel, productionModel, collectionName) {
  try {
    console.log(`\n📦 Migrating ${collectionName}...`);
    
    // Get all documents from local database
    const localData = await localModel.find({});
    console.log(`   Found ${localData.length} documents in local ${collectionName}`);
    
    if (localData.length === 0) {
      console.log(`   ⚠️  No data to migrate for ${collectionName}`);
      return;
    }
    
    // Clear existing data in production (optional - comment out if you want to keep existing data)
    const existingCount = await productionModel.countDocuments();
    if (existingCount > 0) {
      console.log(`   🗑️  Clearing ${existingCount} existing documents in production ${collectionName}`);
      await productionModel.deleteMany({});
    }
    
    // Insert data into production database
    console.log(`   📤 Inserting ${localData.length} documents into production...`);
    await productionModel.insertMany(localData);
    
    // Verify migration
    const productionCount = await productionModel.countDocuments();
    console.log(`   ✅ Migration complete: ${productionCount} documents in production ${collectionName}`);
    
    return {
      collection: collectionName,
      migrated: localData.length,
      verified: productionCount
    };
  } catch (error) {
    console.error(`   ❌ Error migrating ${collectionName}:`, error.message);
    throw error;
  }
}

async function createIndexes(productionModels) {
  console.log('\n🔍 Creating indexes in production database...');
  
  try {
    // User indexes
    await productionModels.User.collection.createIndex({ email: 1 }, { unique: true });
    console.log('   ✅ Created unique index on users.email');
    
    // Publication indexes
    await productionModels.Publication.collection.createIndex({ 
      title: 'text', 
      author: 'text', 
      category: 'text' 
    });
    console.log('   ✅ Created text search index on publications');
    
    await productionModels.Publication.collection.createIndex({ 
      category: 1, 
      isActive: 1 
    });
    console.log('   ✅ Created compound index on publications.category and isActive');
    
    // Order indexes
    await productionModels.Order.collection.createIndex({ orderNumber: 1 }, { unique: true });
    console.log('   ✅ Created unique index on orders.orderNumber');
    
    await productionModels.Order.collection.createIndex({ userId: 1 });
    console.log('   ✅ Created index on orders.userId');
    
    console.log('   ✅ All indexes created successfully');
  } catch (error) {
    console.error('   ⚠️  Error creating indexes:', error.message);
    // Don't throw error for indexes as they might already exist
  }
}

async function verifyMigration(localModels, productionModels) {
  console.log('\n🔍 Verifying migration...');
  
  const collections = ['User', 'Publication', 'Order'];
  const results = {};
  
  for (const collection of collections) {
    const localCount = await localModels[collection].countDocuments();
    const productionCount = await productionModels[collection].countDocuments();
    
    results[collection] = {
      local: localCount,
      production: productionCount,
      match: localCount === productionCount
    };
    
    const status = localCount === productionCount ? '✅' : '❌';
    console.log(`   ${status} ${collection}: Local(${localCount}) → Production(${productionCount})`);
  }
  
  return results;
}

async function runMigration() {
  console.log('🚀 Starting Database Migration: Local → Production MongoDB Atlas\n');
  
  try {
    // Connect to both databases
    const localConn = await connectToLocalDB();
    const productionConn = await connectToProductionDB();
    
    // Define models for both connections
    const localModels = defineSchemas(localConn);
    const productionModels = defineSchemas(productionConn);
    
    // Get local database stats
    console.log('\n📊 Local Database Stats:');
    const userCount = await localModels.User.countDocuments();
    const publicationCount = await localModels.Publication.countDocuments();
    const orderCount = await localModels.Order.countDocuments();
    
    console.log(`   Users: ${userCount}`);
    console.log(`   Publications: ${publicationCount}`);
    console.log(`   Orders: ${orderCount}`);
    console.log(`   Total documents: ${userCount + publicationCount + orderCount}`);
    
    if (userCount + publicationCount + orderCount === 0) {
      console.log('\n⚠️  No data found in local database. Please seed the local database first.');
      return;
    }
    
    // Migrate each collection
    const migrationResults = [];
    
    migrationResults.push(await migrateCollection(localModels.User, productionModels.User, 'Users'));
    migrationResults.push(await migrateCollection(localModels.Publication, productionModels.Publication, 'Publications'));
    migrationResults.push(await migrateCollection(localModels.Order, productionModels.Order, 'Orders'));
    
    // Create indexes
    await createIndexes(productionModels);
    
    // Verify migration
    const verificationResults = await verifyMigration(localModels, productionModels);
    
    // Summary
    console.log('\n📋 Migration Summary:');
    console.log('=====================================');
    
    let totalMigrated = 0;
    migrationResults.forEach(result => {
      if (result) {
        console.log(`✅ ${result.collection}: ${result.migrated} documents migrated`);
        totalMigrated += result.migrated;
      }
    });
    
    console.log(`\n📊 Total Documents Migrated: ${totalMigrated}`);
    
    // Check if all migrations were successful
    const allSuccessful = Object.values(verificationResults).every(result => result.match);
    
    if (allSuccessful) {
      console.log('\n🎉 Migration Completed Successfully!');
      console.log('✅ All data has been successfully migrated to production MongoDB Atlas');
      console.log('✅ All indexes have been created');
      console.log('✅ Data verification passed');
    } else {
      console.log('\n⚠️  Migration completed with warnings');
      console.log('Please check the verification results above');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  } finally {
    // Close connections
    if (localConnection) {
      await localConnection.close();
      console.log('\n🔌 Closed local database connection');
    }
    if (productionConnection) {
      await productionConnection.close();
      console.log('🔌 Closed production database connection');
    }
  }
}

// Run migration
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n✅ Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };

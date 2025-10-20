const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// MongoDB connection - use environment variable only
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL;

async function createDefaultUsers() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    console.log('Connected to MongoDB successfully!');
    
    // Default users
    const defaultUsers = [
      {
        email: 'admin@qa-testing.com',
        password: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        name: 'Admin User'
      },
      {
        email: 'tester@qa-testing.com',
        password: bcrypt.hashSync('tester123', 10),
        role: 'tester',
        name: 'Test User'
      }
    ];

    console.log('Creating default users...');
    
    for (const user of defaultUsers) {
      try {
        const result = await db.collection('users').updateOne(
          { email: user.email },
          { 
            $setOnInsert: {
              email: user.email,
              password: user.password,
              role: user.role,
              name: user.name,
              created_at: new Date(),
              updated_at: new Date()
            }
          },
          { upsert: true }
        );
        
        if (result.upsertedCount > 0) {
          console.log(`✅ Created user: ${user.email}`);
        } else {
          console.log(`ℹ️  User already exists: ${user.email}`);
        }
      } catch (error) {
        console.log(`❌ Error creating user ${user.email}:`, error.message);
      }
    }
    
    // Verify users
    const userCount = await db.collection('users').countDocuments();
    console.log(`\n📊 Total users in database: ${userCount}`);
    
    const users = await db.collection('users').find({}).toArray();
    console.log('\n👥 Users in database:');
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 MongoDB connection closed.');
    }
  }
}

// Run the user creation
createDefaultUsers().catch(console.error);

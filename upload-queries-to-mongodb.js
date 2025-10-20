const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// MongoDB connection - use Railway MongoDB public URL
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://mongo:uHmUTOajdsyeSCRlElnaqHFDrwZdfejj@hopper.proxy.rlwy.net:33829';

async function uploadTestQueries() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    console.log('Connected to MongoDB successfully!');
    
    // Clear existing test cases
    console.log('Clearing existing test cases...');
    await db.collection('test_cases').deleteMany({});
    console.log('Existing test cases cleared.');
    
    // List of test query files
    const testQueryFiles = [
      'beauty_products_test_queries.json',
      'bridal_test_queries.json',
      'baby_children_pregnancy_test_queries.json',
      'pets_test_queries.json',
      'city_guides_beauty_services_test_queries.json',
      'city_guides_restaurants_test_queries.json',
      'city_guides_bars_test_queries.json',
      'city_guides_services_test_queries.json',
      'city_guides_shops_test_queries.json',
      'city_guides_sightseeing_test_queries.json',
      'health_wellness_test_queries.json',
      'kitchen_bath_test_queries.json',
      'mens_test_queries.json',
      'watches_jewelry_test_queries.json',
      'digital_tools_services_test_queries.json',
      'travel_test_queries.json',
      'womens_test_queries.json',
      'venue_test_queries.json'
    ];

    let totalInserted = 0;
    let processedFiles = 0;

    console.log(`\nProcessing ${testQueryFiles.length} test query files...`);

    for (const filename of testQueryFiles) {
      try {
        if (fs.existsSync(filename)) {
          console.log(`\nProcessing ${filename}...`);
          const fileContent = fs.readFileSync(filename, 'utf8');
          const data = JSON.parse(fileContent);
          
          let testCases = [];
          
          // Handle both old format (with subCategories) and new format (direct array)
          if (data.subCategories) {
            console.log(`  Found subCategories format`);
            for (const [subCategory, queries] of Object.entries(data.subCategories)) {
              testCases = testCases.concat(queries.map(query => ({
                ...query,
                sub_category: subCategory
              })));
            }
          } else if (Array.isArray(data)) {
            console.log(`  Found array format`);
            testCases = data;
          }
          
          if (testCases.length > 0) {
            // Convert to MongoDB format
            const mongoTestCases = testCases.map((testCase, index) => ({
              _id: `${filename.replace('.json', '')}_${index + 1}`,
              category: testCase.category || 'Unknown',
              sub_category: testCase.sub_category || 'Unknown',
              city_or_locale: testCase.city_or_locale || null,
              demographic_profile: testCase.demographic_profile || 'General',
              query_text: testCase.query_text || testCase.query || 'No query provided',
              intent: testCase.intent || 'General inquiry',
              constraints: testCase.constraints || 'None',
              expected_result: testCase.expected_result || 'Relevant recommendations',
              created_at: new Date(),
              updated_at: new Date()
            }));
            
            // Insert test cases
            const result = await db.collection('test_cases').insertMany(mongoTestCases);
            console.log(`  ✅ Inserted ${result.insertedCount} test cases`);
            totalInserted += result.insertedCount;
            processedFiles++;
          } else {
            console.log(`  ⚠️  No test cases found in ${filename}`);
          }
        } else {
          console.log(`  ❌ File not found: ${filename}`);
        }
      } catch (error) {
        console.log(`  ❌ Error processing ${filename}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Upload Complete!`);
    console.log(`📊 Summary:`);
    console.log(`   - Files processed: ${processedFiles}/${testQueryFiles.length}`);
    console.log(`   - Total test cases inserted: ${totalInserted}`);
    
    // Verify the upload
    const count = await db.collection('test_cases').countDocuments();
    console.log(`   - Total test cases in database: ${count}`);
    
    // Show sample data
    const sample = await db.collection('test_cases').findOne();
    if (sample) {
      console.log(`\n📝 Sample test case:`);
      console.log(`   Category: ${sample.category}`);
      console.log(`   Sub-category: ${sample.sub_category}`);
      console.log(`   Query: ${sample.query_text}`);
    }
    
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

// Run the upload
uploadTestQueries().catch(console.error);

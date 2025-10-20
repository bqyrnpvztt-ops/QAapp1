const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateTestQueries() {
  try {
    console.log('Starting migration to Supabase...');
    
    // Clear existing test cases
    console.log('Clearing existing test cases...');
    const { error: deleteError } = await supabase
      .from('test_cases')
      .delete()
      .neq('id', 'dummy'); // Delete all records
    
    if (deleteError) {
      console.error('Error clearing test cases:', deleteError);
    } else {
      console.log('Existing test cases cleared.');
    }
    
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
            // Convert to Supabase format
            const supabaseTestCases = testCases.map((testCase, index) => ({
              id: `${filename.replace('.json', '')}_${index + 1}`,
              category: testCase.category || data.category || 'Unknown',
              sub_category: testCase.sub_category || 'Unknown',
              city_or_locale: testCase.city_or_locale || null,
              demographic_profile: testCase.demographic_profile || 'General',
              query_text: testCase.query_text || testCase.query || testCase.queryText || 'No query provided',
              intent: testCase.intent || 'General inquiry',
              constraints: testCase.constraints || 'None',
              expected_result: testCase.expected_result || 'Relevant recommendations'
            }));
            
            // Insert test cases in batches
            const batchSize = 100;
            for (let i = 0; i < supabaseTestCases.length; i += batchSize) {
              const batch = supabaseTestCases.slice(i, i + batchSize);
              const { data: insertedData, error } = await supabase
                .from('test_cases')
                .insert(batch)
                .select();
              
              if (error) {
                console.error(`  ❌ Error inserting batch ${i}-${i + batch.length}:`, error);
              } else {
                console.log(`  ✅ Inserted batch ${i}-${i + batch.length} (${batch.length} test cases)`);
                totalInserted += batch.length;
              }
            }
            
            processedFiles++;
          } else {
            console.log(`  ⚠️  No test cases found in ${filename}`);
          }
        } else {
          console.log(`  ❌ File not found: ${filename}`);
        }
      } catch (error) {
        console.error(`  ❌ Error processing ${filename}:`, error.message);
      }
    }

    console.log(`\n🎉 Migration Complete!`);
    console.log(`📊 Summary:`);
    console.log(`   - Files processed: ${processedFiles}/${testQueryFiles.length}`);
    console.log(`   - Total test cases inserted: ${totalInserted}`);
    
    // Verify insertion
    const { data: countData, error: countError } = await supabase
      .from('test_cases')
      .select('id', { count: 'exact' });
    
    if (countError) {
      console.error('Error counting test cases:', countError);
    } else {
      console.log(`   - Total test cases in database: ${countData.length}`);
    }
    
    if (countData && countData.length > 0) {
      console.log(`\n📝 Sample test case:`);
      console.log(`   Category: ${countData[0].category}`);
      console.log(`   Sub-category: ${countData[0].sub_category}`);
      console.log(`   Query: ${countData[0].query_text}`);
    }

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration
migrateTestQueries();

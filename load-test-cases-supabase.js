const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

async function loadTestCases() {
  console.log('🚀 Starting to load test cases into Supabase...');
  
  let totalInserted = 0;
  let totalErrors = 0;
  
  for (const fileName of testQueryFiles) {
    const filePath = path.join(__dirname, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Warning: ${fileName} not found`);
      continue;
    }
    
    console.log(`📁 Processing ${fileName}...`);
    
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const testCases = JSON.parse(fileContent);
      
      let fileInserted = 0;
      
      // Handle both old format (with subCategories) and new format (direct array)
      if (Array.isArray(testCases)) {
        // New format: direct array of test cases
        for (const testCase of testCases) {
          try {
            const { error } = await supabase
              .from('test_cases')
              .insert({
                id: testCase.id,
                category: testCase.category,
                sub_category: testCase.sub_category,
                city_or_locale: testCase.city_or_locale || null,
                demographic_profile: JSON.stringify(testCase.demographic_profile),
                query_text: testCase.query,
                intent: testCase.query_intent,
                constraints: JSON.stringify(testCase.constraints),
                expected_result: testCase.expected_result_type
              });
            
            if (error) {
              console.error(`❌ Error inserting ${testCase.id}:`, error.message);
              totalErrors++;
            } else {
              fileInserted++;
              totalInserted++;
            }
          } catch (err) {
            console.error(`❌ Error processing ${testCase.id}:`, err.message);
            totalErrors++;
          }
        }
      } else {
        // Old format: with subCategories
        for (const [subCategory, cases] of Object.entries(testCases.subCategories)) {
          for (const testCase of cases) {
            try {
              const { error } = await supabase
                .from('test_cases')
                .insert({
                  id: testCase.id,
                  category: testCases.category,
                  sub_category: subCategory,
                  city_or_locale: testCase.cityOrLocale || null,
                  demographic_profile: JSON.stringify(testCase.demographicProfile),
                  query_text: testCase.queryText,
                  intent: testCase.queryIntent,
                  constraints: JSON.stringify(testCase.constraints),
                  expected_result: testCase.expectedAnswerType
                });
              
              if (error) {
                console.error(`❌ Error inserting ${testCase.id}:`, error.message);
                totalErrors++;
              } else {
                fileInserted++;
                totalInserted++;
              }
            } catch (err) {
              console.error(`❌ Error processing ${testCase.id}:`, err.message);
              totalErrors++;
            }
          }
        }
      }
      
      console.log(`✅ Inserted ${fileInserted} test cases from ${fileName}`);
      
    } catch (error) {
      console.error(`❌ Error processing ${fileName}:`, error.message);
      totalErrors++;
    }
  }
  
  console.log('\n🎉 Test case loading completed!');
  console.log(`📊 Total test cases inserted: ${totalInserted}`);
  console.log(`❌ Total errors: ${totalErrors}`);
  
  // Verify the count
  try {
    const { count, error } = await supabase
      .from('test_cases')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error getting count:', error.message);
    } else {
      console.log(`📈 Total test cases in database: ${count}`);
    }
  } catch (err) {
    console.error('❌ Error verifying count:', err.message);
  }
}

// Run the script
loadTestCases()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  });

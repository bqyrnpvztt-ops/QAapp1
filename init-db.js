const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Resolve DB path, ensure directory exists, and fall back if not writable
function resolveDatabasePath() {
  try {
    let requestedPath = process.env.DB_FILE || path.join(__dirname, 'qa_testing.db');
    const requestedDir = path.dirname(requestedPath);

    // Try to create the directory if it doesn't exist
    try {
      if (requestedDir && requestedDir !== '.' && !fs.existsSync(requestedDir)) {
        fs.mkdirSync(requestedDir, { recursive: true });
      }
    } catch (e) {
      // If we cannot create the directory (e.g., /data without volume), fallback to /tmp
      requestedPath = path.join('/tmp', 'qa_testing.db');
    }

    // If the path is under /data but not writable, fallback to /tmp
    try {
      const testFile = path.join(path.dirname(requestedPath), '.db_write_test');
      fs.writeFileSync(testFile, 'ok');
      fs.unlinkSync(testFile);
      return requestedPath;
    } catch (e) {
      return path.join('/tmp', 'qa_testing.db');
    }
  } catch (_) {
    // Last-resort fallback
    return path.join('/tmp', 'qa_testing.db');
  }
}

// Create database
const DB_FILE = resolveDatabasePath();
const db = new sqlite3.Database(DB_FILE);

// Read and parse test query files
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

console.log('Initializing QA Testing Database...');
console.log(`Using database file: ${DB_FILE}`);

db.serialize(() => {
  // Create tables
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'tester',
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS test_cases (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    sub_category TEXT NOT NULL,
    city_or_locale TEXT,
    demographic_profile TEXT NOT NULL,
    query_text TEXT NOT NULL,
    query_intent TEXT NOT NULL,
    constraints TEXT,
    adversarial_features TEXT,
    expected_answer_type TEXT NOT NULL,
    status TEXT DEFAULT 'unreviewed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS test_results (
    id TEXT PRIMARY KEY,
    test_case_id TEXT NOT NULL,
    tester_id TEXT NOT NULL,
    is_correct BOOLEAN,
    notes_problem TEXT,
    expected_answer TEXT,
    screenshots TEXT,
    developer_annotations TEXT,
    status TEXT DEFAULT 'unreviewed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_case_id) REFERENCES test_cases (id),
    FOREIGN KEY (tester_id) REFERENCES users (id)
  )`);

  // Create indexes
  db.run('CREATE INDEX IF NOT EXISTS idx_test_cases_category ON test_cases(category, sub_category)');
  db.run('CREATE INDEX IF NOT EXISTS idx_test_results_status ON test_results(status)');
  db.run('CREATE INDEX IF NOT EXISTS idx_test_results_tester ON test_results(tester_id)');

  console.log('Tables created successfully');

  // Insert test cases from JSON files
  let totalInserted = 0;
  
  testQueryFiles.forEach(fileName => {
    const filePath = path.join(__dirname, fileName);
    
    if (fs.existsSync(filePath)) {
      console.log(`Processing ${fileName}...`);
      
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const testCases = JSON.parse(fileContent);
      
      // Handle both old format (with subCategories) and new format (direct array)
      if (Array.isArray(testCases)) {
        // New format: direct array of test cases
        testCases.forEach(testCase => {
          const stmt = db.prepare(`
            INSERT OR IGNORE INTO test_cases (
              id, category, sub_category, city_or_locale, demographic_profile,
              query_text, query_intent, constraints, adversarial_features,
              expected_answer_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          stmt.run([
            testCase.id,
            testCase.category,
            testCase.sub_category,
            testCase.city_or_locale || null,
            JSON.stringify(testCase.demographic_profile),
            testCase.query,
            testCase.query_intent,
            JSON.stringify(testCase.constraints),
            JSON.stringify(testCase.adversarial_features || {}),
            testCase.expected_result_type
          ]);
          
          totalInserted++;
        });
      } else {
        // Old format: with subCategories
        Object.keys(testCases.subCategories).forEach(subCategory => {
          testCases.subCategories[subCategory].forEach(testCase => {
            const stmt = db.prepare(`
              INSERT OR IGNORE INTO test_cases (
                id, category, sub_category, city_or_locale, demographic_profile,
                query_text, query_intent, constraints, adversarial_features,
                expected_answer_type
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            stmt.run([
              testCase.id,
              testCases.category,
              subCategory,
              testCase.cityOrLocale || null,
              JSON.stringify(testCase.demographicProfile),
              testCase.queryText,
              testCase.queryIntent,
              JSON.stringify(testCase.constraints),
              JSON.stringify(testCase.adversarialFeatures),
              testCase.expectedAnswerType
            ]);
            
            totalInserted++;
          });
        });
      }
      
      console.log(`Inserted test cases from ${fileName}`);
    } else {
      console.log(`Warning: ${fileName} not found`);
    }
  });

  console.log(`Total test cases inserted: ${totalInserted}`);

  // Create default admin user
  const bcrypt = require('bcryptjs');
  const { v4: uuidv4 } = require('uuid');
  
  const adminId = uuidv4();
  const adminPassword = bcrypt.hashSync('admin123', 10);
  
  db.run(`
    INSERT OR IGNORE INTO users (id, email, password, role, name)
    VALUES (?, ?, ?, ?, ?)
  `, [adminId, 'admin@qa-testing.com', adminPassword, 'admin', 'Admin User']);

  console.log('Default admin user created:');
  console.log('Email: admin@qa-testing.com');
  console.log('Password: admin123');

  // Create default tester user
  const testerId = uuidv4();
  const testerPassword = bcrypt.hashSync('tester123', 10);
  
  db.run(`
    INSERT OR IGNORE INTO users (id, email, password, role, name)
    VALUES (?, ?, ?, ?, ?)
  `, [testerId, 'tester@qa-testing.com', testerPassword, 'tester', 'Test User']);

  console.log('Default tester user created:');
  console.log('Email: tester@qa-testing.com');
  console.log('Password: tester123');

  console.log('Database initialization completed!');
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database connection closed.');
  }
});

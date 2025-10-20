const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Trust proxy for Railway deployment
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? ['https://yourdomain.com'] : true,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads/screenshots';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// MongoDB connection
let db;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/qa-testing';

async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db();
    console.log('Connected to MongoDB');
    
    // Ensure indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('test_cases').createIndex({ category: 1, sub_category: 1 });
    await db.collection('test_results').createIndex({ test_case_id: 1 });
    await db.collection('test_results').createIndex({ tester_id: 1 });
    await db.collection('test_results').createIndex({ status: 1 });
    
    // Ensure default users exist
    await ensureDefaultUsers();
    
    // Load test cases if collection is empty
    const testCaseCount = await db.collection('test_cases').countDocuments();
    if (testCaseCount === 0) {
      console.log('No test cases found, loading from JSON files...');
      await loadTestCasesFromJSON();
    } else {
      console.log(`Found ${testCaseCount} test cases in database`);
    }
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Function to ensure default users exist
async function ensureDefaultUsers() {
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

  for (const user of defaultUsers) {
    try {
      await db.collection('users').updateOne(
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
      console.log(`Ensured user exists: ${user.email}`);
    } catch (error) {
      console.log('Error creating user:', user.email, error.message);
    }
  }
}

// Load test cases from JSON files
async function loadTestCasesFromJSON() {
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

  for (const filename of testQueryFiles) {
    try {
      if (fs.existsSync(filename)) {
        const fileContent = fs.readFileSync(filename, 'utf8');
        const data = JSON.parse(fileContent);
        
        let testCases = [];
        
        // Handle both old format (with subCategories) and new format (direct array)
        if (data.subCategories) {
          for (const [subCategory, queries] of Object.entries(data.subCategories)) {
            testCases = testCases.concat(queries.map(query => ({
              ...query,
              sub_category: subCategory
            })));
          }
        } else if (Array.isArray(data)) {
          testCases = data;
        }
        
        if (testCases.length > 0) {
          // Convert to MongoDB format
          const mongoTestCases = testCases.map(testCase => ({
            category: testCase.category,
            sub_category: testCase.sub_category,
            city_or_locale: testCase.city_or_locale || null,
            demographic_profile: testCase.demographic_profile,
            query_text: testCase.query_text,
            intent: testCase.intent,
            constraints: testCase.constraints,
            expected_result: testCase.expected_result,
            created_at: new Date(),
            updated_at: new Date()
          }));
          
          await db.collection('test_cases').insertMany(mongoTestCases);
          console.log(`Inserted ${testCases.length} test cases from ${filename}`);
          totalInserted += testCases.length;
        }
      }
    } catch (error) {
      console.log(`Error processing ${filename}:`, error.message);
    }
  }
  
  console.log(`Total test cases inserted: ${totalInserted}`);
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// API Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const user = {
      _id: userId,
      email,
      password: hashedPassword,
      role: 'tester',
      name,
      created_at: new Date(),
      updated_at: new Date()
    };

    await db.collection('users').insertOne(user);

    const token = jwt.sign(
      { id: userId, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: userId,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get test cases
app.get('/api/test-cases', authenticateToken, async (req, res) => {
  try {
    const { category, status, limit = 100 } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    let pipeline = [
      { $match: query },
      { $limit: parseInt(limit) }
    ];
    
    // If status is specified, join with test_results
    if (status) {
      pipeline.push({
        $lookup: {
          from: 'test_results',
          localField: '_id',
          foreignField: 'test_case_id',
          as: 'results',
          pipeline: [
            { $match: { tester_id: req.user.id } }
          ]
        }
      });
      
      if (status === 'unreviewed') {
        pipeline.push({
          $match: { 'results.0': { $exists: false } }
        });
      } else if (status === 'completed') {
        pipeline.push({
          $match: { 'results.0': { $exists: true } }
        });
      }
    }
    
    const testCases = await db.collection('test_cases').aggregate(pipeline).toArray();
    
    res.json(testCases);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit test result
app.post('/api/test-results', authenticateToken, upload.array('screenshots', 5), async (req, res) => {
  try {
    const { test_case_id, is_correct, notes_problem, expected_answer } = req.body;
    
    if (!test_case_id || is_correct === undefined) {
      return res.status(400).json({ error: 'Test case ID and correctness are required' });
    }

    const screenshots = req.files ? req.files.map(file => file.filename) : [];
    
    const testResult = {
      test_case_id: new ObjectId(test_case_id),
      tester_id: req.user.id,
      is_correct: is_correct === 'true' || is_correct === true,
      notes_problem: notes_problem || null,
      expected_answer: expected_answer || null,
      screenshots: screenshots,
      developer_annotations: null,
      status: 'unreviewed',
      created_at: new Date(),
      updated_at: new Date()
    };

    await db.collection('test_results').insertOne(testResult);
    
    res.status(201).json({ message: 'Test result submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get test results (for dashboard)
app.get('/api/test-results', authenticateToken, async (req, res) => {
  try {
    const { status, limit = 100 } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'test_cases',
          localField: 'test_case_id',
          foreignField: '_id',
          as: 'test_case'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'tester_id',
          foreignField: '_id',
          as: 'tester'
        }
      },
      { $unwind: '$test_case' },
      { $unwind: '$tester' },
      { $limit: parseInt(limit) },
      { $sort: { created_at: -1 } }
    ];
    
    const results = await db.collection('test_results').aggregate(pipeline).toArray();
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update test result (for dashboard)
app.put('/api/test-results/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { developer_annotations, status } = req.body;
    
    const updateData = {
      updated_at: new Date()
    };
    
    if (developer_annotations !== undefined) {
      updateData.developer_annotations = developer_annotations;
    }
    
    if (status !== undefined) {
      updateData.status = status;
    }
    
    const result = await db.collection('test_results').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Test result not found' });
    }
    
    res.json({ message: 'Test result updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve static files
app.use('/uploads', express.static(process.env.UPLOAD_DIR || 'uploads'));

// Serve PWA static assets
app.use('/assets', express.static('pwa/dist/assets'));
app.use('/manifest.json', express.static('pwa/dist/manifest.webmanifest'));
app.use('/registerSW.js', express.static('pwa/dist/registerSW.js'));
app.use('/sw.js', express.static('pwa/dist/sw.js'));
app.use('/workbox-*.js', express.static('pwa/dist'));
app.use('/pwa-192x192.png', express.static('pwa-192x192.png'));

// Serve Dashboard static assets
app.use('/admin/assets', express.static('dashboard/dist/assets'));

// Serve Dashboard - handle all admin routes for SPA
app.get('/admin*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard/dist/index.html'));
});

// Serve PWA - handle all other routes for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'pwa/dist/index.html'));
});

// Start server
async function startServer() {
  await connectToDatabase();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`PWA available at: http://localhost:${PORT}`);
    console.log(`Dashboard available at: http://localhost:${PORT}/admin`);
  });
}

startServer().catch(console.error);

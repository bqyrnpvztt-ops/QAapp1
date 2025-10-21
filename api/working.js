const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
} else {
  console.log('Supabase environment variables found');
  supabase = createClient(supabaseUrl, supabaseKey);
}

// File upload configuration (simplified for Vercel)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// JWT authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Initialize database tables
async function initializeDatabase() {
  try {
    console.log('Initializing Supabase database...');
    
    // Ensure default users exist
    await ensureDefaultUsers();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Ensure default users exist
async function ensureDefaultUsers() {
  try {
    if (!supabase) return;
    
    // Check if admin user exists
    const { data: adminUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@qa-testing.com')
      .single();
    
    if (!adminUser) {
      const hashedAdminPassword = await bcrypt.hash('admin123', 10);
      await supabase
        .from('users')
        .insert({
          id: 'admin-user',
          email: 'admin@qa-testing.com',
          password: hashedAdminPassword,
          name: 'Admin User',
          role: 'admin'
        });
      console.log('Admin user created');
    }
    
    // Check if tester user exists
    const { data: testerUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'tester@qa-testing.com')
      .single();
    
    if (!testerUser) {
      const hashedTesterPassword = await bcrypt.hash('tester123', 10);
      await supabase
        .from('users')
        .insert({
          id: 'tester-user',
          email: 'tester@qa-testing.com',
          password: hashedTesterPassword,
          name: 'Test User',
          role: 'tester'
        });
      console.log('Tester user created');
    }
  } catch (error) {
    console.error('Error ensuring default users:', error);
  }
}

// API Routes

// Register user
app.post('/api/auth/register', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const { email, password, name, role = 'tester' } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'user-' + Date.now();
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        password: hashedPassword,
        name,
        role
      })
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: 'Failed to create user' });
    }
    
    const token = jwt.sign(
      { id: userId, email, role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'User created successfully',
      token,
      user: { id: userId, email, name, role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get test cases
app.get('/api/test-cases', authenticateToken, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const { category, status, limit = 100 } = req.query;
    
    let query = supabase
      .from('test_cases')
      .select('*')
      .limit(parseInt(limit));
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (status === 'unreviewed') {
      // Get test cases that don't have results for this user
      const { data: testCases } = await query;
      
      if (testCases && testCases.length > 0) {
        const testCaseIds = testCases.map(tc => tc.id);
        
        const { data: results } = await supabase
          .from('test_results')
          .select('test_case_id')
          .in('test_case_id', testCaseIds)
          .eq('tester_id', req.user.id);
        
        const reviewedIds = new Set(results.map(r => r.test_case_id));
        const unreviewedCases = testCases.filter(tc => !reviewedIds.has(tc.id));
        
        return res.json(unreviewedCases);
      }
    } else if (status === 'completed') {
      // Get test cases that have results for this user
      const { data: results } = await supabase
        .from('test_results')
        .select('test_case_id')
        .eq('tester_id', req.user.id);
      
      if (results && results.length > 0) {
        const testCaseIds = results.map(r => r.test_case_id);
        const { data: testCases } = await supabase
          .from('test_cases')
          .select('*')
          .in('id', testCaseIds);
        
        return res.json(testCases || []);
      }
    }
    
    const { data: testCases, error } = await query;
    
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch test cases' });
    }
    
    res.json(testCases || []);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit test result
app.post('/api/test-results', authenticateToken, upload.array('screenshots', 5), async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const { test_case_id, is_correct, problem_description, expected_result, annotations } = req.body;
    
    if (!test_case_id || is_correct === undefined) {
      return res.status(400).json({ error: 'Test case ID and correctness are required' });
    }
    
    const screenshots = req.files ? req.files.map(file => file.originalname) : [];
    
    const { data, error } = await supabase
      .from('test_results')
      .insert({
        test_case_id,
        tester_id: req.user.id,
        is_correct: is_correct === 'true' || is_correct === true,
        problem_description,
        expected_result,
        annotations,
        screenshots: screenshots.join(','),
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: 'Failed to save test result' });
    }
    
    res.json({ message: 'Test result saved successfully', result: data });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get test statistics
app.get('/api/test-cases/stats', authenticateToken, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const { data: results, error } = await supabase
      .from('test_results')
      .select('is_correct')
      .eq('tester_id', req.user.id);
    
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }
    
    const stats = {
      total: results.length,
      correct: results.filter(r => r.is_correct).length,
      incorrect: results.filter(r => !r.is_correct).length
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('id', req.user.id)
      .single();
    
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve static files for PWA
app.use('/assets', express.static(path.join(__dirname, '../pwa/dist/assets')));
app.use('/manifest.json', express.static(path.join(__dirname, '../pwa/dist/manifest.webmanifest')));
app.use('/registerSW.js', express.static(path.join(__dirname, '../pwa/dist/registerSW.js')));
app.use('/sw.js', express.static(path.join(__dirname, '../pwa/dist/sw.js')));
app.use('/workbox-*.js', express.static(path.join(__dirname, '../pwa/dist')));
app.use('/pwa-192x192.png', express.static(path.join(__dirname, '../pwa-192x192.png')));

// Serve static files for Dashboard
app.use('/admin/assets', express.static(path.join(__dirname, '../dashboard/dist/assets')));

// Serve PWA
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../pwa/dist/index.html'));
});

// Serve Dashboard
app.get('/admin*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dashboard/dist/index.html'));
});

// Initialize database on startup
initializeDatabase();

// Export for Vercel
module.exports = app;

// Comprehensive Debugger for QA Testing App
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

// Enhanced logging middleware
app.use((req, res, next) => {
  console.log(`🔍 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log(`📋 Headers:`, JSON.stringify(req.headers, null, 2));
  console.log(`📦 Body:`, JSON.stringify(req.body, null, 2));
  next();
});

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

// Supabase configuration with detailed logging
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🔧 SUPABASE CONFIGURATION DEBUG:');
console.log('SUPABASE_URL exists:', !!supabaseUrl);
console.log('SUPABASE_URL value:', supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'MISSING');
console.log('SUPABASE_ANON_KEY exists:', !!supabaseKey);
console.log('SUPABASE_ANON_KEY value:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'MISSING');

let supabase = null;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY in your Vercel environment variables');
} else {
  try {
    console.log('🔌 Creating Supabase client...');
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
  }
}

// File upload configuration (simplified for Vercel)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit (reduced for serverless)
    files: 3 // Maximum 3 files (reduced for serverless)
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Check if Supabase is available
const checkSupabase = (req, res, next) => {
  console.log('🔍 Checking Supabase availability...');
  if (!supabase) {
    console.error('❌ Supabase not available');
    return res.status(503).json({ 
      error: 'Database service unavailable', 
      message: 'Please configure Supabase environment variables',
      debug: {
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey,
        timestamp: new Date().toISOString()
      }
    });
  }
  console.log('✅ Supabase available');
  next();
};

// JWT authentication middleware
const authenticateToken = (req, res, next) => {
  console.log('🔐 Authenticating token...');
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      console.log('❌ Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    console.log('✅ Token verified for user:', user.id);
    req.user = user;
    next();
  });
};

// Initialize database tables with comprehensive logging
async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');
    
    if (!supabase) {
      console.log('⚠️ Supabase not configured, skipping database initialization');
      return;
    }
    
    console.log('🔌 Testing Supabase connection...');
    
    // Test connection first
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      console.error('Error details:', error);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('📊 Connection test data:', data);
    
    // Ensure default users exist
    await ensureDefaultUsers();
    
    console.log('✅ Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message || error);
    console.error('Error stack:', error.stack);
  }
}

// Ensure default users exist with detailed logging
async function ensureDefaultUsers() {
  try {
    console.log('👤 Ensuring default users exist...');
    
    // Check if admin user exists
    console.log('🔍 Checking for admin user...');
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@qa-testing.com')
      .single();
    
    if (adminError && adminError.code !== 'PGRST116') {
      console.error('❌ Error checking admin user:', adminError);
      return;
    }
    
    if (!adminUser) {
      console.log('➕ Creating admin user...');
      const hashedAdminPassword = await bcrypt.hash('admin123', 10);
      const { data: adminData, error: adminInsertError } = await supabase
        .from('users')
        .insert({
          id: 'admin-user',
          email: 'admin@qa-testing.com',
          password: hashedAdminPassword,
          name: 'Admin User',
          role: 'admin'
        })
        .select()
        .single();
      
      if (adminInsertError) {
        console.error('❌ Error creating admin user:', adminInsertError);
      } else {
        console.log('✅ Admin user created:', adminData);
      }
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Check if tester user exists
    console.log('🔍 Checking for tester user...');
    const { data: testerUser, error: testerError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'tester@qa-testing.com')
      .single();
    
    if (testerError && testerError.code !== 'PGRST116') {
      console.error('❌ Error checking tester user:', testerError);
      return;
    }
    
    if (!testerUser) {
      console.log('➕ Creating tester user...');
      const hashedTesterPassword = await bcrypt.hash('tester123', 10);
      const { data: testerData, error: testerInsertError } = await supabase
        .from('users')
        .insert({
          id: 'tester-user',
          email: 'tester@qa-testing.com',
          password: hashedTesterPassword,
          name: 'Test User',
          role: 'tester'
        })
        .select()
        .single();
      
      if (testerInsertError) {
        console.error('❌ Error creating tester user:', testerInsertError);
      } else {
        console.log('✅ Tester user created:', testerData);
      }
    } else {
      console.log('✅ Tester user already exists');
    }
  } catch (error) {
    console.error('❌ Error ensuring default users:', error.message || error);
    console.error('Error stack:', error.stack);
  }
}

// API Routes with comprehensive debugging

// Debug endpoint - shows all environment and configuration info
app.get('/api/debug', (req, res) => {
  console.log('🔍 Debug endpoint called');
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      JWT_SECRET: !!process.env.JWT_SECRET,
      VERCEL: !!process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV
    },
    supabase: {
      configured: !!supabase,
      url: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'MISSING',
      key: supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'MISSING'
    },
    request: {
      method: req.method,
      path: req.path,
      headers: req.headers,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime()
    }
  };
  
  console.log('📊 Debug info:', JSON.stringify(debugInfo, null, 2));
  res.json(debugInfo);
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('🧪 Test endpoint called');
  res.json({ 
    message: 'Debug API working',
    timestamp: new Date().toISOString(),
    node_version: process.version,
    supabase_configured: !!supabase
  });
});

// Health check endpoint with detailed status
app.get('/api/health', async (req, res) => {
  console.log('🏥 Health check requested');
  
  let supabaseStatus = 'not_configured';
  let supabaseError = null;
  
  if (supabase) {
    try {
      console.log('🔌 Testing Supabase connection...');
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        supabaseStatus = 'error';
        supabaseError = error.message;
        console.error('❌ Supabase health check failed:', error);
      } else {
        supabaseStatus = 'healthy';
        console.log('✅ Supabase health check passed');
      }
    } catch (error) {
      supabaseStatus = 'error';
      supabaseError = error.message;
      console.error('❌ Supabase health check exception:', error);
    }
  }
  
  const healthInfo = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabase: {
      configured: !!supabase,
      status: supabaseStatus,
      error: supabaseError
    },
    environment: {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      JWT_SECRET: !!process.env.JWT_SECRET
    }
  };
  
  console.log('🏥 Health check result:', JSON.stringify(healthInfo, null, 2));
  res.json(healthInfo);
});

// Register user with comprehensive debugging
app.post('/api/auth/register', checkSupabase, async (req, res) => {
  console.log('📝 User registration attempt');
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { email, password, name, role = 'tester' } = req.body;
    
    console.log('🔍 Validating input...');
    if (!email || !password || !name) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'Email, password, and name are required',
        debug: {
          email: !!email,
          password: !!password,
          name: !!name,
          role: role
        }
      });
    }
    
    console.log('✅ Input validation passed');
    
    // Check if user already exists
    console.log('🔍 Checking if user already exists...');
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing user:', checkError);
      return res.status(500).json({ 
        error: 'Database error during user check',
        debug: {
          error: checkError.message,
          code: checkError.code
        }
      });
    }
    
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({ 
        error: 'User already exists',
        debug: {
          email: email,
          existingUserId: existingUser.id
        }
      });
    }
    
    console.log('✅ User does not exist, proceeding with creation');
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'user-' + Date.now();
    
    console.log('🔐 Password hashed, creating user...');
    console.log('👤 User details:', {
      id: userId,
      email: email,
      name: name,
      role: role,
      passwordHashed: true
    });
    
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
      console.error('❌ Error creating user:', error);
      return res.status(500).json({ 
        error: 'Failed to create user',
        debug: {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        }
      });
    }
    
    console.log('✅ User created successfully:', data);
    
    const token = jwt.sign(
      { id: userId, email, role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    console.log('🎫 JWT token generated');
    
    const response = {
      message: 'User created successfully',
      token,
      user: { id: userId, email, name, role }
    };
    
    console.log('✅ Registration successful, sending response');
    res.json(response);
  } catch (error) {
    console.error('❌ Registration error:', error.message || error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Server error',
      debug: {
        error: error.message,
        stack: error.stack
      }
    });
  }
});

// Login user with comprehensive debugging
app.post('/api/auth/login', checkSupabase, async (req, res) => {
  console.log('🔑 User login attempt');
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { email, password } = req.body;
    
    console.log('🔍 Validating input...');
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ 
        error: 'Email and password are required',
        debug: {
          email: !!email,
          password: !!password
        }
      });
    }
    
    console.log('✅ Input validation passed');
    
    console.log('🔍 Looking up user...');
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('❌ Error looking up user:', error);
      return res.status(500).json({ 
        error: 'Database error during login',
        debug: {
          error: error.message,
          code: error.code
        }
      });
    }
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ 
        error: 'Invalid credentials',
        debug: {
          email: email,
          userFound: false
        }
      });
    }
    
    console.log('✅ User found:', { id: user.id, email: user.email, role: user.role });
    
    console.log('🔐 Verifying password...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ 
        error: 'Invalid credentials',
        debug: {
          email: email,
          passwordValid: false
        }
      });
    }
    
    console.log('✅ Password verified');
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    console.log('🎫 JWT token generated');
    
    const response = {
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    };
    
    console.log('✅ Login successful, sending response');
    res.json(response);
  } catch (error) {
    console.error('❌ Login error:', error.message || error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Server error',
      debug: {
        error: error.message,
        stack: error.stack
      }
    });
  }
});

// Global error handler with detailed logging
app.use((error, req, res, next) => {
  console.error('💥 Unhandled error:', error.message || error);
  console.error('Error stack:', error.stack);
  console.error('Request details:', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body
  });
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message,
    debug: {
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    }
  });
});

// Initialize database on startup with timeout
console.log('🚀 Starting application initialization...');
const initPromise = initializeDatabase();
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Database initialization timeout')), 15000)
);

Promise.race([initPromise, timeoutPromise])
  .then(() => console.log('✅ Application initialization completed'))
  .catch((error) => console.error('❌ Application initialization failed:', error.message));

console.log('🎯 Debug API server ready');

// Export for Vercel
module.exports = app;

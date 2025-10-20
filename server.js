const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
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

// Database initialization
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

const DB_FILE = resolveDatabasePath();
const db = new sqlite3.Database(DB_FILE);

// Always ensure users exist, regardless of database state
setTimeout(() => {
  ensureDefaultUsers();
}, 1000);

// Function to ensure default users exist
function ensureDefaultUsers() {
  const defaultUsers = [
    {
      id: 'admin-user',
      email: 'admin@qa-testing.com',
      password: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      name: 'Admin User'
    },
    {
      id: 'tester-user',
      email: 'tester@qa-testing.com',
      password: bcrypt.hashSync('tester123', 10),
      role: 'tester',
      name: 'Test User'
    }
  ];

  defaultUsers.forEach(user => {
    db.run(
      'INSERT OR IGNORE INTO users (id, email, password, role, name) VALUES (?, ?, ?, ?, ?)',
      [user.id, user.email, user.password, user.role, user.name],
      function(err) {
        if (err) {
          console.log('Error creating user:', user.email, err.message);
        } else if (this.changes > 0) {
          console.log('Created user:', user.email);
        }
      }
    );
  });
}

// Create tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'tester',
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, () => {
    // Ensure default users exist immediately after table creation
    ensureDefaultUsers();
  });

  // Test cases table
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

  // Test results table
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
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// API Routes

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role = 'tester' } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    db.run(
      'INSERT INTO users (id, email, password, role, name) VALUES (?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, role, name],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        const token = jwt.sign(
          { id: userId, email, role },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(201).json({
          message: 'User created successfully',
          token,
          user: { id: userId, email, name, role }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      });
    }
  );
});

// Test cases routes
app.get('/api/test-cases', authenticateToken, (req, res) => {
  const { category, sub_category, status, limit = 50, offset = 0 } = req.query;
  
  let query = `
    SELECT tc.*, tr.id as result_id, tr.is_correct, tr.status as result_status
    FROM test_cases tc
    LEFT JOIN test_results tr ON tc.id = tr.test_case_id AND tr.tester_id = ?
  `;
  const params = [req.user.id];
  
  const conditions = [];
  if (category) {
    conditions.push('tc.category = ?');
    params.push(category);
  }
  if (sub_category) {
    conditions.push('tc.sub_category = ?');
    params.push(sub_category);
  }
  if (status) {
    conditions.push('tc.status = ?');
    params.push(status);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY tc.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.get('/api/test-cases/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.get(
    'SELECT * FROM test_cases WHERE id = ?',
    [id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Test case not found' });
      }
      res.json(row);
    }
  );
});

// Test results routes
app.post('/api/test-results', authenticateToken, upload.array('screenshots', 5), (req, res) => {
  try {
    const { test_case_id, is_correct, notes_problem, expected_answer } = req.body;
    
    if (!test_case_id || is_correct === undefined) {
      return res.status(400).json({ error: 'Test case ID and correctness are required' });
    }

    const screenshots = req.files ? req.files.map(file => file.filename) : [];
    const resultId = uuidv4();

    db.run(
      `INSERT INTO test_results 
       (id, test_case_id, tester_id, is_correct, notes_problem, expected_answer, screenshots, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resultId,
        test_case_id,
        req.user.id,
        is_correct === 'true' || is_correct === true,
        notes_problem || null,
        expected_answer || null,
        JSON.stringify(screenshots),
        'unreviewed'
      ],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Test result saved successfully', id: resultId });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/test-results/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { developer_annotations, status } = req.body;
  
  // Only admins can update developer annotations and status
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.run(
    'UPDATE test_results SET developer_annotations = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [developer_annotations, status, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Test result not found' });
      }
      res.json({ message: 'Test result updated successfully' });
    }
  );
});

// Admin routes
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total_test_cases FROM test_cases',
    'SELECT COUNT(*) as total_results FROM test_results',
    'SELECT COUNT(*) as correct_results FROM test_results WHERE is_correct = 1',
    'SELECT COUNT(*) as incorrect_results FROM test_results WHERE is_correct = 0',
    'SELECT COUNT(*) as unreviewed_results FROM test_results WHERE status = "unreviewed"',
    'SELECT COUNT(*) as completed_results FROM test_results WHERE status = "completed"',
    'SELECT COUNT(*) as flagged_results FROM test_results WHERE status = "flagged"'
  ];

  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      db.get(query, (err, row) => {
        if (err) reject(err);
        else resolve(Object.values(row)[0]);
      });
    })
  )).then(results => {
    const [totalTestCases, totalResults, correctResults, incorrectResults, unreviewedResults, completedResults, flaggedResults] = results;
    
    res.json({
      totalTestCases,
      totalResults,
      correctResults,
      incorrectResults,
      unreviewedResults,
      completedResults,
      flaggedResults,
      accuracyRate: totalResults > 0 ? (correctResults / totalResults * 100).toFixed(2) : 0
    });
  }).catch(err => {
    res.status(500).json({ error: 'Database error' });
  });
});

app.get('/api/admin/results', authenticateToken, requireAdmin, (req, res) => {
  const { status, category, limit = 100, offset = 0 } = req.query;
  
  let query = `
    SELECT tr.*, tc.category, tc.sub_category, tc.query_text, u.name as tester_name
    FROM test_results tr
    JOIN test_cases tc ON tr.test_case_id = tc.id
    JOIN users u ON tr.tester_id = u.id
  `;
  const params = [];
  
  const conditions = [];
  if (status) {
    conditions.push('tr.status = ?');
    params.push(status);
  }
  if (category) {
    conditions.push('tc.category = ?');
    params.push(category);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY tr.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
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

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
  }
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`PWA available at: http://localhost:${PORT}`);
  console.log(`Dashboard available at: http://localhost:${PORT}/admin`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});

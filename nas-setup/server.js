const express = require('express')
const cors = require('cors')
const multer = require('multer')
const sqlite3 = require('sqlite3').verbose()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use('/api', limiter)

app.use(express.json())
app.use(express.static('public'))

// Database setup
const db = new sqlite3.Database('./family.db')

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    name TEXT
  )`)
  
  db.run(`CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT,
    originalName TEXT,
    caption TEXT,
    filePath TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)
  
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    datetime TEXT,
    description TEXT,
    type TEXT DEFAULT 'event',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)
  
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    type TEXT DEFAULT 'message',
    title TEXT,
    items TEXT,
    parentId INTEGER,
    author TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)
})

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this'

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' })
    req.user = user
    next()
  })
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.PHOTOS_PATH || './uploads'
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  }
})

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  const { password } = req.body
  
  // Simple password check (you can make this more secure)
  if (password !== process.env.FAMILY_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' })
  }

  const token = jwt.sign(
    { userId: 'family-member', name: 'Family Member', role: 'family' },
    JWT_SECRET,
    { expiresIn: '30d' }
  )

  res.json({ 
    token, 
    user: { id: 'family-member', name: 'Family Member', role: 'family' } 
  })
})

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ user: req.user })
})

// Photo routes
app.get('/api/photos', authenticateToken, (req, res) => {
  db.all('SELECT * FROM photos ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch photos' })
    }
    res.json(rows)
  })
})

app.post('/api/photos', authenticateToken, upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No photo provided' })
  }

  const { caption } = req.body
  const filename = req.file.filename
  const originalName = req.file.originalname
  const filePath = `/uploads/${filename}`

  db.run(
    'INSERT INTO photos (filename, originalName, caption, filePath) VALUES (?, ?, ?, ?)',
    [filename, originalName, caption, filePath],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to save photo' })
      }
      
      res.json({
        id: this.lastID,
        filename,
        originalName,
        caption,
        filePath,
        url: filePath,
        createdAt: new Date().toISOString()
      })
    }
  )
})

// Serve uploaded files
app.use('/uploads', express.static(process.env.PHOTOS_PATH || './uploads'))

// Event routes
app.get('/api/events', authenticateToken, (req, res) => {
  db.all('SELECT * FROM events ORDER BY datetime ASC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch events' })
    }
    res.json(rows)
  })
})

app.post('/api/events', authenticateToken, (req, res) => {
  const { title, datetime, description, type } = req.body
  
  db.run(
    'INSERT INTO events (title, datetime, description, type) VALUES (?, ?, ?, ?)',
    [title, datetime, description, type],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create event' })
      }
      
      res.json({
        id: this.lastID,
        title,
        datetime,
        description,
        type,
        createdAt: new Date().toISOString()
      })
    }
  )
})

app.put('/api/events/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  const { title, datetime, description, type } = req.body
  
  db.run(
    'UPDATE events SET title = ?, datetime = ?, description = ?, type = ? WHERE id = ?',
    [title, datetime, description, type, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update event' })
      }
      res.json({ success: true })
    }
  )
})

app.delete('/api/events/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  
  db.run('DELETE FROM events WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete event' })
    }
    res.json({ success: true })
  })
})

// Message routes
app.get('/api/messages', authenticateToken, (req, res) => {
  db.all('SELECT * FROM messages ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch messages' })
    }
    res.json(rows)
  })
})

app.post('/api/messages', authenticateToken, (req, res) => {
  const { content, type, title, parentId } = req.body
  
  let items = null
  if (type === 'list' && content) {
    items = content.split('\n')
      .filter(item => item.trim())
      .map(item => ({ text: item.trim(), completed: false }))
  }
  
  db.run(
    'INSERT INTO messages (content, type, title, items, parentId, author) VALUES (?, ?, ?, ?, ?, ?)',
    [content, type, title, items ? JSON.stringify(items) : null, parentId, 'Family Member'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create message' })
      }
      
      res.json({
        id: this.lastID,
        content,
        type,
        title,
        items,
        parentId,
        author: 'Family Member',
        createdAt: new Date().toISOString()
      })
    }
  )
})

app.put('/api/messages/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  const updateData = req.body
  
  const setClause = Object.keys(updateData)
    .filter(key => key !== 'id')
    .map(key => `${key} = ?`)
    .join(', ')
  
  const values = Object.keys(updateData)
    .filter(key => key !== 'id')
    .map(key => {
      if (key === 'items') {
        return JSON.stringify(updateData[key])
      }
      return updateData[key]
    })
  
  db.run(
    `UPDATE messages SET ${setClause} WHERE id = ?`,
    [...values, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update message' })
      }
      res.json({ success: true })
    }
  )
})

app.delete('/api/messages/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  
  db.run('DELETE FROM messages WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete message' })
    }
    res.json({ success: true })
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`🏠 Dudley Family Server running on port ${PORT}`)
  console.log(`📸 Photos will be stored in: ${process.env.PHOTOS_PATH || './uploads'}`)
  console.log(`🔐 Family password: ${process.env.FAMILY_PASSWORD || 'dudley2024'}`)
})

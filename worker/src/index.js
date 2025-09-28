import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import { SignJWT, jwtVerify } from 'jose'

const app = new Hono()

// CORS middleware
app.use('*', cors({
  origin: (origin) => {
    // Allow localhost for development
    if (origin && origin.includes('localhost')) return origin
    // Allow production domain
    if (origin && origin.includes('the-dudley-family.com')) return origin
    return 'https://the-dudley-family.com'
  },
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}))

// JWT secret will be accessed from environment

// Auth middleware
const authMiddleware = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401)
  }

  const token = authHeader.substring(7)
  try {
    const JWT_SECRET = new TextEncoder().encode(c.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production')
    const { payload } = await jwtVerify(token, JWT_SECRET)
    c.set('user', payload)
    await next()
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

// Auth routes
app.post('/api/auth/login', async (c) => {
  const { password } = await c.req.json()
  
  if (password !== c.env.FAMILY_PASSWORD) {
    return c.json({ error: 'Invalid password' }, 401)
  }

  const JWT_SECRET = new TextEncoder().encode(c.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production')
  const token = await new SignJWT({ 
    userId: 'family-member',
    name: 'Family Member',
    role: 'family'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET)

  return c.json({ 
    token, 
    user: { 
      id: 'family-member', 
      name: 'Family Member',
      role: 'family'
    } 
  })
})

app.get('/api/auth/verify', authMiddleware, async (c) => {
  return c.json({ user: c.get('user') })
})

// Photo routes
app.get('/api/photos', authMiddleware, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM photos 
      ORDER BY createdAt DESC
    `).all()
    
    return c.json(results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch photos' }, 500)
  }
})

app.post('/api/photos', authMiddleware, async (c) => {
  try {
    const formData = await c.req.formData()
    const photo = formData.get('photo')
    const caption = formData.get('caption') || ''

    if (!photo) {
      return c.json({ error: 'No photo provided' }, 400)
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `photo-${timestamp}-${Math.random().toString(36).substring(2)}.${photo.name.split('.').pop()}`
    
    // Upload to R2
    await c.env.PHOTOS_BUCKET.put(filename, photo.stream())
    
    // Get public URL
    const photoUrl = `https://your-r2-domain.com/${filename}`
    
    // Save to database
    const result = await c.env.DB.prepare(`
      INSERT INTO photos (filename, url, caption, createdAt)
      VALUES (?, ?, ?, ?)
    `).bind(filename, photoUrl, caption, new Date().toISOString()).run()

    return c.json({
      id: result.meta.last_row_id,
      filename,
      url: photoUrl,
      caption,
      createdAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Photo upload error:', error)
    return c.json({ error: 'Failed to upload photo' }, 500)
  }
})

// Event routes
app.get('/api/events', authMiddleware, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM events 
      ORDER BY datetime ASC
    `).all()
    
    return c.json(results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch events' }, 500)
  }
})

app.post('/api/events', authMiddleware, async (c) => {
  try {
    const { title, datetime, description, type } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      INSERT INTO events (title, datetime, description, type, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).bind(title, datetime, description, type, new Date().toISOString()).run()

    return c.json({
      id: result.meta.last_row_id,
      title,
      datetime,
      description,
      type,
      createdAt: new Date().toISOString()
    })
  } catch (error) {
    return c.json({ error: 'Failed to create event' }, 500)
  }
})

app.put('/api/events/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id')
    const { title, datetime, description, type } = await c.req.json()
    
    await c.env.DB.prepare(`
      UPDATE events 
      SET title = ?, datetime = ?, description = ?, type = ?
      WHERE id = ?
    `).bind(title, datetime, description, type, id).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to update event' }, 500)
  }
})

app.delete('/api/events/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id')
    
    await c.env.DB.prepare(`
      DELETE FROM events WHERE id = ?
    `).bind(id).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to delete event' }, 500)
  }
})

// Message routes
app.get('/api/messages', authMiddleware, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM messages 
      ORDER BY createdAt DESC
    `).all()
    
    return c.json(results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch messages' }, 500)
  }
})

app.post('/api/messages', authMiddleware, async (c) => {
  try {
    const { content, type, title, parentId } = await c.req.json()
    
    let items = null
    if (type === 'list' && content) {
      items = content.split('\n')
        .filter(item => item.trim())
        .map(item => ({ text: item.trim(), completed: false }))
    }
    
    const result = await c.env.DB.prepare(`
      INSERT INTO messages (content, type, title, items, parentId, author, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      content, 
      type, 
      title || null, 
      items ? JSON.stringify(items) : null,
      parentId || null,
      'Family Member',
      new Date().toISOString()
    ).run()

    return c.json({
      id: result.meta.last_row_id,
      content,
      type,
      title,
      items,
      parentId,
      author: 'Family Member',
      createdAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Message creation error:', error)
    return c.json({ error: 'Failed to create message' }, 500)
  }
})

app.put('/api/messages/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id')
    const updateData = await c.req.json()
    
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
    
    await c.env.DB.prepare(`
      UPDATE messages 
      SET ${setClause}
      WHERE id = ?
    `).bind(...values, id).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to update message' }, 500)
  }
})

app.delete('/api/messages/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id')
    
    await c.env.DB.prepare(`
      DELETE FROM messages WHERE id = ?
    `).bind(id).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to delete message' }, 500)
  }
})

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Worker error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

export default app

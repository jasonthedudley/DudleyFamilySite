-- Dudley Family Site Database Schema

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  datetime TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'event',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'message',
  title TEXT,
  items TEXT, -- JSON string for checklist items
  parentId INTEGER,
  author TEXT DEFAULT 'Family Member',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parentId) REFERENCES messages(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(createdAt);
CREATE INDEX IF NOT EXISTS idx_events_datetime ON events(datetime);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(createdAt);
CREATE INDEX IF NOT EXISTS idx_messages_parent_id ON messages(parentId);

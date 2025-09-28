import React, { useState, useEffect } from 'react'
import api from '../utils/api'

function MessageBoard() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState({ content: '', type: 'message' })
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyContent, setReplyContent] = useState('')

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await api.get('/api/messages')
      setMessages(response.data)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const messageData = {
        ...newMessage,
        parentId: replyingTo
      }

      await api.post('/api/messages', messageData)
      await fetchMessages()
      
      setNewMessage({ content: '', type: 'message' })
      setReplyingTo(null)
      setReplyContent('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleReply = async (messageId) => {
    if (!replyContent.trim()) return

    try {
      await api.post('/api/messages', {
        content: replyContent,
        type: 'message',
        parentId: messageId
      })
      
      await fetchMessages()
      setReplyingTo(null)
      setReplyContent('')
    } catch (error) {
      console.error('Failed to send reply:', error)
    }
  }

  const handleDelete = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await api.delete(`/api/messages/${messageId}`)
        await fetchMessages()
      } catch (error) {
        console.error('Failed to delete message:', error)
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderMessage = (message, depth = 0) => {
    const replies = messages.filter(m => m.parentId === message.id)
    
    return (
      <div key={message.id} style={{ marginLeft: depth * 20 }}>
        <div className="message-item">
          <div className="message-header">
            <span className="message-author">
              {message.author || 'Family Member'}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className="message-date">
                {formatDate(message.createdAt)}
              </span>
              <button 
                onClick={() => handleDelete(message.id)}
                className="btn-small btn-danger"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
              >
                Delete
              </button>
            </div>
          </div>
          
          <div className="message-content">
            {message.type === 'list' ? (
              <div className="checklist">
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)' }}>
                  {message.title}
                </h4>
                {message.items?.map((item, index) => (
                  <div key={index} className="checklist-item">
                    <input 
                      type="checkbox" 
                      checked={item.completed}
                      onChange={async () => {
                        const updatedItems = [...message.items]
                        updatedItems[index].completed = !updatedItems[index].completed
                        
                        try {
                          await api.put(`/api/messages/${message.id}`, {
                            ...message,
                            items: updatedItems
                          })
                          await fetchMessages()
                        } catch (error) {
                          console.error('Failed to update checklist:', error)
                        }
                      }}
                    />
                    <label 
                      className={item.completed ? 'completed' : ''}
                      style={{ 
                        textDecoration: item.completed ? 'line-through' : 'none',
                        color: item.completed ? '#7f8c8d' : 'var(--text-color)'
                      }}
                    >
                      {item.text}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {message.content}
              </p>
            )}
          </div>
          
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setReplyingTo(replyingTo === message.id ? null : message.id)}
              className="btn-small btn-secondary"
            >
              {replyingTo === message.id ? 'Cancel Reply' : 'Reply'}
            </button>
          </div>
          
          {replyingTo === message.id && (
            <div className="reply-form">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="form-input"
                style={{ minHeight: '80px' }}
              />
              <div className="reply-actions">
                <button 
                  onClick={() => setReplyingTo(null)}
                  className="btn-small btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleReply(message.id)}
                  className="btn-small btn"
                  disabled={!replyContent.trim()}
                >
                  Send Reply
                </button>
              </div>
            </div>
          )}
        </div>
        
        {replies.length > 0 && (
          <div className="message-replies">
            {replies.map(reply => renderMessage(reply, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: 'var(--text-color)' }}>
        💬 Family Message Board
      </h1>

      {/* New Message Form */}
      <div className="message-form">
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-color)' }}>
          Share Something with the Family
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Message Type</label>
            <select
              className="form-input"
              value={newMessage.type}
              onChange={(e) => setNewMessage({ ...newMessage, type: e.target.value })}
            >
              <option value="message">Regular Message</option>
              <option value="list">Grocery List</option>
              <option value="announcement">Announcement</option>
            </select>
          </div>

          {newMessage.type === 'list' && (
            <div className="form-group">
              <label className="form-label">List Title</label>
              <input
                type="text"
                className="form-input"
                value={newMessage.title || ''}
                onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
                placeholder="e.g., Grocery List for This Week"
              />
            </div>
          )}

          {newMessage.type === 'list' ? (
            <div className="form-group">
              <label className="form-label">List Items (one per line)</label>
              <textarea
                className="form-input form-textarea"
                value={newMessage.content}
                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                placeholder="Enter list items, one per line..."
                rows="6"
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea
                className="form-input form-textarea"
                value={newMessage.content}
                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                placeholder="Share news, ask questions, or just say hello to the family..."
                rows="4"
                required
              />
            </div>
          )}

          <button type="submit" className="btn">
            Post Message
          </button>
        </form>
      </div>

      {/* Messages */}
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <div className="empty-state-text">No messages yet</div>
          <div className="empty-state-hint">Start the conversation by posting a message above!</div>
        </div>
      ) : (
        <div className="message-thread">
          {messages
            .filter(message => !message.parentId)
            .map(message => renderMessage(message))
          }
        </div>
      )}
    </div>
  )
}

export default MessageBoard

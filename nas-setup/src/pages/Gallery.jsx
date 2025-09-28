import React, { useState, useEffect, useRef } from 'react'
import api from '../utils/api'

function Gallery() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [newPhoto, setNewPhoto] = useState({ caption: '', file: null })
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      const response = await api.get('/api/photos')
      setPhotos(response.data)
    } catch (error) {
      console.error('Failed to fetch photos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewPhoto({ ...newPhoto, file })
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setNewPhoto({ ...newPhoto, file })
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleUpload = async () => {
    if (!newPhoto.file) return

    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('photo', newPhoto.file)
    formData.append('caption', newPhoto.caption)

    try {
      const response = await api.post('/api/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(progress)
        }
      })

      setPhotos([response.data, ...photos])
      setNewPhoto({ caption: '', file: null })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const copyShareLink = (photoId) => {
    const shareUrl = `${window.location.origin}/gallery/share/${photoId}`
    navigator.clipboard.writeText(shareUrl)
    alert('Share link copied to clipboard!')
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
        📸 Family Photo Gallery
      </h1>

      {/* Upload Section */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-color)' }}>
          Upload New Photo
        </h3>
        
        <div
          className={`upload-area ${newPhoto.file ? 'has-file' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="file-input"
          />
          
          {newPhoto.file ? (
            <div>
              <div className="upload-icon">✅</div>
              <div className="upload-text">{newPhoto.file.name}</div>
              <div className="upload-hint">Click to change file</div>
            </div>
          ) : (
            <div>
              <div className="upload-icon">📁</div>
              <div className="upload-text">Drop a photo here or click to browse</div>
              <div className="upload-hint">Supports JPG, PNG, GIF</div>
            </div>
          )}
        </div>

        {newPhoto.file && (
          <div style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Caption (optional)</label>
              <input
                type="text"
                className="form-input"
                value={newPhoto.caption}
                onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })}
                placeholder="Add a caption for this photo..."
              />
            </div>
            
            {uploading && (
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
            
            <button 
              onClick={handleUpload} 
              className="btn" 
              disabled={uploading}
              style={{ marginTop: '1rem' }}
            >
              {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Photo'}
            </button>
          </div>
        )}
      </div>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📸</div>
          <div className="empty-state-text">No photos yet</div>
          <div className="empty-state-hint">Upload your first family photo to get started!</div>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map((photo) => (
            <div 
              key={photo.id} 
              className="photo-item"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img 
                src={photo.url} 
                alt={photo.caption || 'Family photo'} 
              />
              {photo.caption && (
                <div className="photo-caption">
                  {photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="modal-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setSelectedPhoto(null)}
            >
              ×
            </button>
            <img 
              src={selectedPhoto.url} 
              alt={selectedPhoto.caption || 'Family photo'}
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
            />
            {selectedPhoto.caption && (
              <p style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-color)' }}>
                {selectedPhoto.caption}
              </p>
            )}
            <div className="share-link-container" style={{ marginTop: '1rem' }}>
              <div className="share-link">
                {`${window.location.origin}/gallery/share/${selectedPhoto.id}`}
              </div>
              <button 
                className="copy-btn"
                onClick={() => copyShareLink(selectedPhoto.id)}
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gallery

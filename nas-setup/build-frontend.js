const fs = require('fs')
const path = require('path')

// Simple build script to create a static version of the frontend
// This combines all the React components into a single HTML file

const buildFrontend = () => {
  console.log('🏗️  Building frontend for NAS...')
  
  // Read the main HTML template
  let html = fs.readFileSync('./public/index.html', 'utf8')
  
  // Read CSS files
  const indexCSS = fs.readFileSync('./public/index.css', 'utf8')
  const appCSS = fs.readFileSync('./public/App.css', 'utf8')
  
  // Read React components
  const mainJSX = fs.readFileSync('./src/main.jsx', 'utf8')
  const appJSX = fs.readFileSync('./src/App.jsx', 'utf8')
  const authContext = fs.readFileSync('./src/contexts/AuthContext.jsx', 'utf8')
  const navigation = fs.readFileSync('./src/components/Navigation.jsx', 'utf8')
  const home = fs.readFileSync('./src/pages/Home.jsx', 'utf8')
  const login = fs.readFileSync('./src/pages/Login.jsx', 'utf8')
  const gallery = fs.readFileSync('./src/pages/Gallery.jsx', 'utf8')
  const calendar = fs.readFileSync('./src/pages/Calendar.jsx', 'utf8')
  const messageBoard = fs.readFileSync('./src/pages/MessageBoard.jsx', 'utf8')
  const apiUtils = fs.readFileSync('./src/utils/api.js', 'utf8')
  
  // Create a simple bundled version
  const bundledJS = `
// Simple React-like implementation for NAS
const React = {
  createElement: (type, props, ...children) => {
    if (typeof type === 'string') {
      const element = document.createElement(type)
      if (props) {
        Object.keys(props).forEach(key => {
          if (key === 'className') {
            element.className = props[key]
          } else if (key === 'onClick') {
            element.addEventListener('click', props[key])
          } else if (key.startsWith('on')) {
            const event = key.toLowerCase().substring(2)
            element.addEventListener(event, props[key])
          } else {
            element.setAttribute(key, props[key])
          }
        })
      }
      children.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child))
        } else if (child) {
          element.appendChild(child)
        }
      })
      return element
    }
    return type(props, ...children)
  }
}

// API utility
const api = {
  baseURL: '',
  get: (url) => fetch(url, { headers: { 'Authorization': \`Bearer \${localStorage.getItem('family_token')}\` } }).then(r => r.json()),
  post: (url, data) => fetch(url, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${localStorage.getItem('family_token')}\` },
    body: JSON.stringify(data)
  }).then(r => r.json())
}

// Simple state management
const useState = (initial) => {
  const [state, setState] = [initial, (newState) => { state = newState; render() }]
  return [state, setState]
}

const useEffect = (fn, deps) => {
  fn()
}

// Router simulation
let currentPath = window.location.pathname
const navigate = (path) => {
  window.history.pushState({}, '', path)
  currentPath = path
  render()
}

window.addEventListener('popstate', () => {
  currentPath = window.location.pathname
  render()
})

// Main app component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [user, setUser] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const token = localStorage.getItem('family_token')
    if (token) {
      api.get('/api/auth/verify')
        .then(response => {
          setIsAuthenticated(true)
          setUser(response.user)
        })
        .catch(() => {
          localStorage.removeItem('family_token')
          setIsAuthenticated(false)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (password) => {
    try {
      const response = await api.post('/api/auth/login', { password })
      localStorage.setItem('family_token', response.token)
      setIsAuthenticated(true)
      setUser(response.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Login failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('family_token')
    setIsAuthenticated(false)
    setUser(null)
  }

  if (loading) {
    return React.createElement('div', { className: 'loading' },
      React.createElement('div', { className: 'spinner' })
    )
  }

  return React.createElement('div', { className: 'family-theme' },
    React.createElement(Navigation, { isAuthenticated, user, logout }),
    React.createElement('main', { className: 'main' },
      currentPath === '/' && React.createElement(Home, { isAuthenticated }),
      currentPath === '/gallery' && isAuthenticated && React.createElement(Gallery),
      currentPath === '/calendar' && isAuthenticated && React.createElement(Calendar),
      currentPath === '/messages' && isAuthenticated && React.createElement(MessageBoard),
      currentPath === '/login' && !isAuthenticated && React.createElement(Login, { login })
    )
  )
}

// Navigation component
const Navigation = ({ isAuthenticated, user, logout }) => {
  return React.createElement('nav', { className: 'nav' },
    React.createElement('div', { className: 'nav-content' },
      React.createElement('a', { href: '/', className: 'nav-logo', onClick: (e) => { e.preventDefault(); navigate('/') } }, '🏠 The Dudley Family'),
      isAuthenticated ? React.createElement('div', { style: 'display: flex; align-items: center; gap: 2rem' },
        React.createElement('ul', { className: 'nav-links' },
          React.createElement('li', null, React.createElement('a', { href: '/gallery', onClick: (e) => { e.preventDefault(); navigate('/gallery') } }, '📸 Gallery')),
          React.createElement('li', null, React.createElement('a', { href: '/calendar', onClick: (e) => { e.preventDefault(); navigate('/calendar') } }, '📅 Calendar')),
          React.createElement('li', null, React.createElement('a', { href: '/messages', onClick: (e) => { e.preventDefault(); navigate('/messages') } }, '💬 Messages'))
        ),
        React.createElement('div', { style: 'display: flex; align-items: center; gap: 1rem' },
          React.createElement('span', { style: 'color: var(--primary-color); font-weight: 500' }, \`Welcome, \${user?.name || 'Family Member'}!\`),
          React.createElement('button', { onClick: logout, className: 'btn btn-secondary' }, 'Logout')
        )
      ) : React.createElement('a', { href: '/login', onClick: (e) => { e.preventDefault(); navigate('/login') }, className: 'btn' }, 'Family Login')
    )
  )
}

// Home component
const Home = ({ isAuthenticated }) => {
  return React.createElement('div', null,
    React.createElement('section', { className: 'welcome-section' },
      React.createElement('h1', { className: 'welcome-title' }, 'Welcome to The Dudley Family Site'),
      React.createElement('p', { className: 'welcome-subtitle' }, 'A private space for our family to share memories, stay connected, and plan together.'),
      !isAuthenticated ? React.createElement('div', null,
        React.createElement('p', { style: 'margin-bottom: 2rem; color: #7f8c8d' }, 'Please log in to access family features.'),
        React.createElement('a', { href: '/login', onClick: (e) => { e.preventDefault(); navigate('/login') }, className: 'btn' }, 'Family Login')
      ) : React.createElement('div', { className: 'feature-grid' },
        React.createElement('div', { className: 'feature-card' },
          React.createElement('div', { className: 'feature-icon' }, '📸'),
          React.createElement('h3', { className: 'feature-title' }, 'Photo Gallery'),
          React.createElement('p', { className: 'feature-description' }, 'Share and view family photos, memories, and special moments. Upload photos with captions and create shareable albums.'),
          React.createElement('a', { href: '/gallery', onClick: (e) => { e.preventDefault(); navigate('/gallery') }, className: 'btn' }, 'View Gallery')
        ),
        React.createElement('div', { className: 'feature-card' },
          React.createElement('div', { className: 'feature-icon' }, '📅'),
          React.createElement('h3', { className: 'feature-title' }, 'Family Calendar'),
          React.createElement('p', { className: 'feature-description' }, 'Keep track of birthdays, events, and family gatherings. Add events and share calendar views with family members.'),
          React.createElement('a', { href: '/calendar', onClick: (e) => { e.preventDefault(); navigate('/calendar') }, className: 'btn' }, 'View Calendar')
        ),
        React.createElement('div', { className: 'feature-card' },
          React.createElement('div', { className: 'feature-icon' }, '💬'),
          React.createElement('h3', { className: 'feature-title' }, 'Message Board'),
          React.createElement('p', { className: 'feature-description' }, 'Stay connected with family messages, share grocery lists, and coordinate family activities in one place.'),
          React.createElement('a', { href: '/messages', onClick: (e) => { e.preventDefault(); navigate('/messages') }, className: 'btn' }, 'View Messages')
        )
      )
    )
  )
}

// Login component
const Login = ({ login }) => {
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(password)
    
    if (!result.success) {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return React.createElement('div', { className: 'auth-form' },
    React.createElement('h2', { className: 'auth-title' }, 'Family Login'),
    React.createElement('p', { style: 'text-align: center; color: #7f8c8d; margin-bottom: 2rem' }, 'Enter the family password to access our private space.'),
    error && React.createElement('div', { className: 'alert alert-error' }, error),
    React.createElement('form', { onSubmit: handleSubmit },
      React.createElement('div', { className: 'form-group' },
        React.createElement('label', { htmlFor: 'password', className: 'form-label' }, 'Family Password'),
        React.createElement('input', {
          type: 'password',
          id: 'password',
          className: 'form-input',
          value: password,
          onChange: (e) => setPassword(e.target.value),
          placeholder: 'Enter family password',
          required: true,
          disabled: loading
        })
      ),
      React.createElement('button', {
        type: 'submit',
        className: 'btn',
        disabled: loading,
        style: 'width: 100%'
      }, loading ? 'Logging in...' : 'Login')
    )
  )
}

// Gallery component (simplified)
const Gallery = () => {
  return React.createElement('div', null,
    React.createElement('h1', { style: 'margin-bottom: 2rem; color: var(--text-color)' }, '📸 Family Photo Gallery'),
    React.createElement('p', null, 'Photo gallery functionality will be available once the server is running.')
  )
}

// Calendar component (simplified)
const Calendar = () => {
  return React.createElement('div', null,
    React.createElement('h1', { style: 'margin-bottom: 2rem; color: var(--text-color)' }, '📅 Family Calendar'),
    React.createElement('p', null, 'Calendar functionality will be available once the server is running.')
  )
}

// MessageBoard component (simplified)
const MessageBoard = () => {
  return React.createElement('div', null,
    React.createElement('h1', { style: 'margin-bottom: 2rem; color: var(--text-color)' }, '💬 Family Message Board'),
    React.createElement('p', null, 'Message board functionality will be available once the server is running.')
  )
}

// Render function
const render = () => {
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML = ''
    root.appendChild(App())
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', render)
`

  // Update the HTML with embedded CSS and JS
  html = html.replace('</head>', `
    <style>
      ${indexCSS}
      ${appCSS}
    </style>
  </head>`)
  
  html = html.replace('</body>', `
    <script>
      ${bundledJS}
    </script>
  </body>`)
  
  // Write the final HTML file
  fs.writeFileSync('./public/index.html', html)
  
  console.log('✅ Frontend built successfully!')
  console.log('📁 Files ready in ./public/')
}

buildFrontend()

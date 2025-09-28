# The Dudley Family Site

A full-stack family website built with React, Cloudflare Workers, and Cloudflare Pages. Features include digital photo sharing, family calendar, and message board.

## Features

- 🏠 **Homepage**: Welcome page with navigation to family features
- 📸 **Photo Gallery**: Upload and share family photos with R2 storage
- 📅 **Family Calendar**: Private calendar with events, birthdays, and anniversaries
- 💬 **Message Board**: Family chat with threaded replies and grocery lists
- 🔐 **Authentication**: Simple password-based access for family members

## Tech Stack

### Frontend
- React 18 with Vite
- React Router for navigation
- FullCalendar for calendar functionality
- Axios for API calls
- Responsive CSS with family-friendly design

### Backend
- Cloudflare Workers with Hono framework
- Cloudflare D1 database for data storage
- Cloudflare R2 for photo storage
- JWT authentication

## Project Structure

```
dudley-family-site/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
├── worker/                  # Cloudflare Worker backend
│   ├── src/
│   │   └── index.js        # Main worker file
│   ├── schema.sql          # Database schema
│   ├── package.json
│   └── wrangler.toml
├── package.json            # Root package.json
└── README.md
```

## Setup Instructions

### Prerequisites

1. Node.js 18+ installed
2. Cloudflare account
3. Wrangler CLI installed: `npm install -g wrangler`

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install worker dependencies
cd ../worker && npm install
```

### 2. Cloudflare Setup

#### Create D1 Database
```bash
# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create dudley-family-db

# Note the database ID from the output and update wrangler.toml
```

#### Create R2 Bucket
```bash
# Create R2 bucket for photos
wrangler r2 bucket create dudley-family-photos
```

#### Update Configuration
1. Update `worker/wrangler.toml` with your database ID
2. Set your JWT secret and family password in environment variables
3. Update R2 domain in the worker code if using custom domain

### 3. Database Setup

```bash
# Apply database schema
wrangler d1 execute dudley-family-db --file=./worker/schema.sql
```

### 4. Development

```bash
# Start both frontend and worker in development
npm run dev

# Or start individually:
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:worker    # Worker on http://localhost:8787
```

### 5. Deployment

#### Deploy Worker
```bash
cd worker
wrangler deploy
```

#### Deploy Frontend to Cloudflare Pages
1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `cd frontend && npm run build`
3. Set build output directory: `frontend/dist`
4. Set environment variables:
   - `VITE_API_URL`: Your worker URL (e.g., `https://dudley-family-api.your-subdomain.workers.dev`)

## Environment Variables

### Worker Environment Variables
- `JWT_SECRET`: Secret key for JWT tokens
- `FAMILY_PASSWORD`: Password for family login
- `CORS_ORIGIN`: Allowed origin for CORS (production domain)

### Frontend Environment Variables
- `VITE_API_URL`: Backend API URL

## API Endpoints

### Authentication
- `POST /auth/login` - Login with family password
- `GET /auth/verify` - Verify JWT token

### Photos
- `GET /photos` - Get all photos
- `POST /photos` - Upload new photo

### Events
- `GET /events` - Get all events
- `POST /events` - Create new event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event

### Messages
- `GET /messages` - Get all messages
- `POST /messages` - Create new message
- `PUT /messages/:id` - Update message
- `DELETE /messages/:id` - Delete message

## Security Features

- JWT-based authentication
- CORS protection
- Input validation
- Private photo storage
- Family-only access

## Customization

### Styling
- Modify `frontend/src/index.css` and `frontend/src/App.css` for custom styling
- Update color scheme in CSS custom properties

### Features
- Add new message types in the message board
- Extend calendar with recurring events
- Add photo albums and organization

## Troubleshooting

### Common Issues

1. **CORS errors**: Ensure CORS_ORIGIN is set correctly in wrangler.toml
2. **Database errors**: Verify D1 database is created and schema applied
3. **R2 upload errors**: Check R2 bucket permissions and configuration
4. **Authentication errors**: Verify JWT_SECRET is set correctly

### Development Tips

- Use browser dev tools to inspect API calls
- Check Cloudflare Workers logs in the dashboard
- Test authentication flow thoroughly
- Verify file uploads work with different image formats

## Contributing

This is a private family project. For questions or issues, contact the family administrator.

## License

Private family use only.

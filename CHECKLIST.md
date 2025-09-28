# ✅ Dudley Family Site Setup Checklist

## Phase 1: Install Prerequisites
- [ ] Install Node.js from https://nodejs.org/ (download LTS version)
- [ ] Restart terminal/command prompt
- [ ] Verify: `node --version` and `npm --version` work

## Phase 2: Install Dependencies
- [ ] Run: `cd /Users/jasondudley/Projects/DudleyFamilySite`
- [ ] Run: `./setup.sh` (or manually install dependencies)
- [ ] Verify: No error messages during installation

## Phase 3: Cloudflare Setup
- [ ] Create Cloudflare account at https://cloudflare.com/
- [ ] Run: `wrangler login`
- [ ] Run: `wrangler d1 create dudley-family-db`
- [ ] **COPY THE DATABASE ID** from the output
- [ ] Run: `wrangler r2 bucket create dudley-family-photos`

## Phase 4: Configuration
- [ ] Open `worker/wrangler.toml` in a text editor
- [ ] Replace `your-database-id-here` with the actual database ID
- [ ] Save the file

## Phase 5: Database Setup
- [ ] Run: `wrangler d1 execute dudley-family-db --file=./worker/schema.sql`
- [ ] Verify: No error messages

## Phase 6: Deploy Backend
- [ ] Run: `cd worker`
- [ ] Run: `wrangler deploy`
- [ ] **COPY THE WORKER URL** from the output

## Phase 7: Test Backend
- [ ] Visit: `https://your-worker-url.workers.dev/health`
- [ ] Should see: `{"status":"ok","timestamp":"..."}`

## Phase 8: Frontend Setup
- [ ] Create file: `frontend/.env`
- [ ] Add: `VITE_API_URL=https://your-worker-url.workers.dev`
- [ ] Save the file

## Phase 9: Test Locally
- [ ] Run: `npm run dev` (from project root)
- [ ] Visit: http://localhost:3000
- [ ] Try logging in with password: `dudley2024`

## Phase 10: Deploy Frontend
- [ ] Go to https://dash.cloudflare.com/
- [ ] Click "Pages" → "Create a project"
- [ ] Connect GitHub account
- [ ] Select your repository
- [ ] Set build command: `cd frontend && npm run build`
- [ ] Set output directory: `frontend/dist`
- [ ] Add environment variable: `VITE_API_URL=https://your-worker-url.workers.dev`
- [ ] Deploy!

## 🎉 Final Check
- [ ] Your website is live at: `https://the-dudley-family.com`
- [ ] You can log in with the family password
- [ ] All features work (gallery, calendar, messages)

## 📝 Important URLs to Save
- **Your website:** `https://the-dudley-family.com`
- **Worker API:** `https://your-worker-url.workers.dev`
- **Cloudflare dashboard:** https://dash.cloudflare.com/

## 🔑 Default Login
- **Password:** `dudley2024`
- (You can change this in the Cloudflare dashboard later)

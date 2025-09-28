# 🏠 Dudley Family Site - Complete Setup Guide

This guide will walk you through setting up your family website step by step.

## 📋 Prerequisites

Before starting, you need:
- A computer with internet access
- A Cloudflare account (free)
- About 30 minutes of time

## 🚀 Step-by-Step Setup

### Step 1: Install Node.js

1. **Go to** https://nodejs.org/
2. **Click** "Download Node.js (LTS)" - this is the green button
3. **Run** the downloaded installer
4. **Follow** the installation wizard (accept all defaults)
5. **Restart** your terminal/command prompt

**Verify it worked:**
Open a new terminal and type:
```bash
node --version
npm --version
```
You should see version numbers (like v18.17.0 and 9.6.7).

### Step 2: Run the Setup Script

In your terminal, navigate to your project and run:

```bash
cd /Users/jasondudley/Projects/DudleyFamilySite
./setup.sh
```

This will install all the required dependencies automatically.

### Step 3: Create Cloudflare Account

1. **Go to** https://cloudflare.com/
2. **Click** "Sign Up" (top right)
3. **Enter** your email and create a password
4. **Verify** your email address
5. **Complete** the account setup

### Step 4: Login to Cloudflare

In your terminal, run:
```bash
wrangler login
```

This will open a browser window. Click "Allow" to authorize the connection.

### Step 5: Create Database and Storage

Run these commands one by one:

```bash
# Create the database
wrangler d1 create dudley-family-db

# Create photo storage bucket
wrangler r2 bucket create dudley-family-photos
```

**IMPORTANT:** Copy the database ID from the first command output! It looks like: `abc12345-6789-def0-1234-567890abcdef`

### Step 6: Update Configuration

1. **Open** the file `worker/wrangler.toml` in a text editor
2. **Find** the line: `database_id = "your-database-id-here"`
3. **Replace** `your-database-id-here` with the database ID you copied
4. **Save** the file

### Step 7: Set Up Database Schema

```bash
wrangler d1 execute dudley-family-db --file=./worker/schema.sql
```

### Step 8: Deploy the Backend

```bash
cd worker
wrangler deploy
```

This will give you a URL like: `https://dudley-family-api.your-subdomain.workers.dev`

### Step 9: Test the Backend

Visit your worker URL + `/health` in a browser:
```
https://your-worker-url.workers.dev/health
```

You should see: `{"status":"ok","timestamp":"..."}`

### Step 10: Set Up Frontend Environment

1. **Create** a file called `frontend/.env` with this content:
```
VITE_API_URL=https://your-worker-url.workers.dev
```
(Replace with your actual worker URL)

### Step 11: Test Locally

```bash
# From the project root
npm run dev
```

This will start both frontend and backend. Visit http://localhost:3000

### Step 12: Deploy to Cloudflare Pages

1. **Go to** https://dash.cloudflare.com/
2. **Click** "Pages" in the sidebar
3. **Click** "Create a project"
4. **Connect** your GitHub account
5. **Select** your `dudley-family-site` repository
6. **Set** these build settings:
   - **Framework preset:** Vite
   - **Build command:** `cd frontend && npm run build`
   - **Build output directory:** `frontend/dist`
   - **Root directory:** `/` (leave empty)
7. **Add** environment variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-worker-url.workers.dev`
8. **Click** "Save and Deploy"

## 🎉 You're Done!

Your family website will be available at a URL like:
`https://dudley-family-site.pages.dev`

## 🔧 Troubleshooting

### "Command not found" errors
- Make sure Node.js is installed and you restarted your terminal
- Try running: `source ~/.bashrc` or `source ~/.zshrc`

### "Permission denied" on setup.sh
- Run: `chmod +x setup.sh` first

### Database errors
- Make sure you copied the database ID correctly
- Check that the database was created successfully

### Build errors
- Make sure all dependencies are installed
- Try deleting `node_modules` folders and running `npm install` again

## 📞 Need Help?

If you get stuck at any step:
1. **Check** the error message carefully
2. **Make sure** you completed all previous steps
3. **Try** the troubleshooting tips above
4. **Ask** for help with the specific error you're seeing

## 🎯 What You'll Have

After setup, your family will have:
- **Private photo sharing** (like a family Instagram)
- **Shared calendar** for birthdays and events
- **Message board** for family chat and grocery lists
- **Secure access** with a family password
- **Mobile-friendly** design that works on phones and tablets

The website will be completely private to your family and free to run!

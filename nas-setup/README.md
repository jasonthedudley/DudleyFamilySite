# 🏠 Dudley Family NAS Website

A self-hosted family website that runs on your Asustor NAS with unlimited photo storage and Cloudflare Tunnel security.

## 🎯 **What You Get**

- ✅ **Unlimited photo storage** (your 24TB NAS)
- ✅ **$0/month** hosting costs
- ✅ **Secure access** via Cloudflare Tunnel
- ✅ **Family calendar** with events
- ✅ **Message board** with threaded replies
- ✅ **Photo gallery** with uploads
- ✅ **Professional domain** (the-dudley-family.com)

## 🚀 **Quick Setup**

### **Step 1: Install on Your NAS**

1. **SSH into your Asustor NAS**
2. **Create project directory:**
   ```bash
   mkdir -p /volume1/web/family-site
   cd /volume1/web/family-site
   ```

3. **Upload all files** from this directory to your NAS
4. **Install dependencies:**
   ```bash
   npm install
   ```

### **Step 2: Configure Environment**

1. **Copy environment file:**
   ```bash
   cp env.example .env
   ```

2. **Edit configuration:**
   ```bash
   nano .env
   ```

   Set these values:
   ```env
   PORT=3000
   JWT_SECRET=your-very-long-random-secret-key
   FAMILY_PASSWORD=your-secure-family-password
   PHOTOS_PATH=/volume1/photo/family-photos
   ALLOWED_ORIGINS=https://the-dudley-family.com
   ```

### **Step 3: Create Photo Directory**

```bash
mkdir -p /volume1/photo/family-photos
chmod 755 /volume1/photo/family-photos
```

### **Step 4: Set Up Cloudflare Tunnel**

1. **Go to** https://dash.cloudflare.com/
2. **Navigate to** Zero Trust → Access → Tunnels
3. **Create tunnel** named "dudley-family-nas"
4. **Add public hostname:**
   - **Subdomain:** (leave blank for root domain)
   - **Domain:** `the-dudley-family.com`
   - **Service:** `http://localhost:3000`
5. **Copy tunnel token** to your NAS

### **Step 5: Start the Website**

```bash
# Start with PM2 (recommended)
npm install -g pm2
pm2 start server.js --name "family-site"
pm2 save
pm2 startup
```

### **Step 6: Test Your Website**

1. **Visit** `https://the-dudley-family.com`
2. **Login** with your family password
3. **Upload** a test photo
4. **Check** that photos are stored in `/volume1/photo/family-photos/`

## 📁 **File Structure**

```
/volume1/web/family-site/
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env                   # Configuration
├── family.db              # SQLite database
├── public/                # Frontend files
│   ├── index.html         # Main page
│   └── uploads/           # Photo uploads
└── nas-setup/             # Setup files
    ├── cloudflare-tunnel-setup.md
    └── README.md
```

## 🔧 **Configuration Options**

### **Environment Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `FAMILY_PASSWORD` | Login password | `dudley2024` |
| `PHOTOS_PATH` | Photo storage path | `/volume1/photo/family-photos` |
| `ALLOWED_ORIGINS` | CORS origins | `https://the-dudley-family.com` |

### **Photo Storage**

Photos are stored in your NAS at:
- **Path:** `/volume1/photo/family-photos/`
- **Access:** Via Asustor File Explorer
- **Backup:** Use Asustor backup features

## 🔒 **Security Features**

- **JWT authentication** for secure login
- **Rate limiting** to prevent abuse
- **CORS protection** for API security
- **Helmet.js** for security headers
- **Cloudflare Tunnel** for secure access
- **No direct internet exposure** of your NAS

## 📱 **Accessing Your Data**

### **Photos**
- **Location:** `/volume1/photo/family-photos/`
- **Access:** Asustor File Explorer or web interface
- **Backup:** Use Asustor backup to cloud services

### **Database**
- **File:** `family.db` (SQLite)
- **Backup:** Copy the file regularly
- **Location:** `/volume1/web/family-site/family.db`

## 🚨 **Troubleshooting**

### **Website Not Loading**
```bash
# Check if server is running
pm2 status

# Check logs
pm2 logs family-site

# Restart if needed
pm2 restart family-site
```

### **Photos Not Uploading**
```bash
# Check permissions
ls -la /volume1/photo/family-photos/

# Fix permissions
chmod 755 /volume1/photo/family-photos/
```

### **Database Issues**
```bash
# Check database file
ls -la family.db

# Test database
sqlite3 family.db "SELECT COUNT(*) FROM photos;"
```

## 🔄 **Updates**

To update your website:

1. **Stop the server:**
   ```bash
   pm2 stop family-site
   ```

2. **Backup your data:**
   ```bash
   cp family.db family.db.backup
   ```

3. **Update files** (upload new versions)

4. **Restart:**
   ```bash
   pm2 start family-site
   ```

## 📊 **Monitoring**

### **Check Server Status**
```bash
pm2 status
pm2 logs family-site
```

### **Check Disk Usage**
```bash
df -h /volume1/photo/family-photos/
```

### **Check Database Size**
```bash
ls -lh family.db
```

## 🎉 **Success!**

Your family now has:
- ✅ **Professional website** at `https://the-dudley-family.com`
- ✅ **Unlimited photo storage** (24TB)
- ✅ **Secure access** for family members only
- ✅ **$0/month** hosting costs
- ✅ **Full control** over your data

## 📞 **Support**

- **Asustor Documentation:** https://www.asustor.com/
- **Cloudflare Tunnel Docs:** https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **Node.js on NAS:** Check Asustor App Central

## 🔐 **Security Reminders**

1. **Change default passwords**
2. **Use strong JWT secret**
3. **Regularly update** NAS firmware
4. **Monitor access logs**
5. **Backup your database**
6. **Keep tunnel token secure**

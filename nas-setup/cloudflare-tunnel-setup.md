# 🌐 Cloudflare Tunnel Setup for Asustor NAS

This guide will help you set up a secure connection between your Asustor NAS and Cloudflare, allowing you to host your family website with unlimited storage.

## 🔒 **Why Cloudflare Tunnel?**

- ✅ **No port forwarding** needed on your router
- ✅ **DDoS protection** from Cloudflare
- ✅ **SSL certificates** automatically managed
- ✅ **Your NAS never directly exposed** to the internet
- ✅ **Use your 24TB storage** for unlimited photos

## 📋 **Prerequisites**

- Asustor NAS with ADM (Asustor Data Master)
- Cloudflare account with your domain
- Node.js installed on your NAS (via App Central)

## 🚀 **Step 1: Install Node.js on Asustor**

1. **Open** ADM (Asustor Data Master)
2. **Go to** App Central
3. **Search** for "Node.js"
4. **Install** Node.js (latest version)
5. **Enable** SSH access in ADM

## 🚀 **Step 2: Upload Website Files**

1. **Create** a folder on your NAS: `/volume1/web/family-site`
2. **Upload** all the website files to this folder
3. **Set permissions** to allow Node.js to read/write

## 🚀 **Step 3: Install Dependencies**

SSH into your NAS and run:

```bash
cd /volume1/web/family-site
npm install
```

## 🚀 **Step 4: Configure Environment**

1. **Copy** `env.example` to `.env`
2. **Edit** the configuration:

```bash
# Set your photo storage path
PHOTOS_PATH=/volume1/photo/family-photos

# Set your domain
ALLOWED_ORIGINS=https://the-dudley-family.com

# Set a secure password
FAMILY_PASSWORD=your-secure-family-password

# Set a secure JWT secret
JWT_SECRET=your-very-long-random-secret-key
```

## 🚀 **Step 5: Create Photo Directory**

```bash
mkdir -p /volume1/photo/family-photos
chmod 755 /volume1/photo/family-photos
```

## 🚀 **Step 6: Set Up Cloudflare Tunnel**

### **Option A: Using Cloudflare Dashboard (Recommended)**

1. **Go to** https://dash.cloudflare.com/
2. **Navigate to** Zero Trust → Access → Tunnels
3. **Click** "Create a tunnel"
4. **Name it:** "dudley-family-nas"
5. **Copy** the tunnel token

### **Option B: Using Wrangler CLI**

```bash
# Install Wrangler on your NAS
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create tunnel
wrangler tunnel create dudley-family-nas
```

## 🚀 **Step 7: Configure Tunnel**

1. **In Cloudflare dashboard**, go to your tunnel
2. **Add a public hostname:**
   - **Subdomain:** `the-dudley-family` (or leave blank for root)
   - **Domain:** `the-dudley-family.com`
   - **Service:** `http://localhost:3000`
3. **Save** the configuration

## 🚀 **Step 8: Start the Website**

### **Option A: Direct Node.js**

```bash
cd /volume1/web/family-site
node server.js
```

### **Option B: Using PM2 (Recommended)**

```bash
# Install PM2
npm install -g pm2

# Start the website
pm2 start server.js --name "family-site"

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🚀 **Step 9: Set Up Auto-Start**

1. **In ADM**, go to Services → Web Server
2. **Enable** Web Server
3. **Set** document root to `/volume1/web/family-site/public`
4. **Configure** reverse proxy to `localhost:3000`

## 🚀 **Step 10: Test Your Website**

1. **Visit** `https://the-dudley-family.com`
2. **Login** with your family password
3. **Test** photo uploads
4. **Verify** photos are stored on your NAS

## 🔧 **Troubleshooting**

### **Website Not Loading**
- Check if Node.js is running: `pm2 status`
- Check logs: `pm2 logs family-site`
- Verify tunnel is active in Cloudflare dashboard

### **Photos Not Uploading**
- Check permissions on photo directory
- Verify `PHOTOS_PATH` in `.env` is correct
- Check disk space on your NAS

### **Database Issues**
- Check if `family.db` file exists and is writable
- Verify SQLite3 is installed: `sqlite3 --version`

## 🔐 **Security Best Practices**

1. **Change default passwords**
2. **Use strong JWT secret**
3. **Regularly update** your NAS firmware
4. **Monitor** access logs
5. **Backup** your database regularly

## 📱 **Accessing Your Photos**

Your photos will be stored in:
- **Path:** `/volume1/photo/family-photos/`
- **Accessible via:** Asustor File Explorer
- **Backup:** Use Asustor's backup features

## 🎉 **You're Done!**

Your family now has:
- ✅ **Unlimited photo storage** (24TB)
- ✅ **Secure access** via Cloudflare
- ✅ **Fast loading** worldwide
- ✅ **$0/month** hosting costs
- ✅ **Full control** over your data

## 📞 **Need Help?**

- Check Asustor documentation for Node.js setup
- Cloudflare Tunnel documentation
- Monitor your NAS resources (CPU, RAM, disk)

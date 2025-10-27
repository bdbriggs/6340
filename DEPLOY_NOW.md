# 🚀 Deploy to DigitalOcean NOW - Step by Step

## Method 1: App Platform (Recommended - Easiest)

### Step 1: Create App
1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click **"Create App"**
3. Choose **"GitHub"** as source
4. Select your repository: `bdbriggs/6340`
5. Choose branch: `main`

### Step 2: Configure App
1. **App Name**: `dfc-gallery` (or whatever you want)
2. **Build Command**: `npm ci`
3. **Run Command**: `npm start`
4. **Port**: `3000`

### Step 3: Set Environment Variables
1. Click **"Settings"** tab
2. Click **"Environment Variables"**
3. Add these variables:

```bash
MYSQL_HOST=your_database_host
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database_name
MYSQL_PORT=3306
NODE_ENV=production
PORT=3000
```

### Step 4: Add Database (if needed)
1. Click **"Components"** tab
2. Click **"Add Component"**
3. Choose **"Database"**
4. Select **"MySQL"**
5. Choose size (smallest is fine for testing)

### Step 5: Deploy
1. Click **"Create Resources"**
2. Wait for deployment (5-10 minutes)
3. Your app will be available at: `https://your-app-name.ondigitalocean.app`

---

## Method 2: Droplet (VPS)

### Step 1: Create Droplet
1. Go to [DigitalOcean Droplets](https://cloud.digitalocean.com/droplets)
2. Click **"Create Droplet"**
3. Choose **"Ubuntu 22.04 LTS"**
4. Select size: **Basic $6/month** (minimum)
5. Add SSH key
6. Click **"Create Droplet"**

### Step 2: Connect to Droplet
```bash
ssh root@your_droplet_ip
```

### Step 3: Install Dependencies
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install MySQL
apt install mysql-server -y
mysql_secure_installation

# Install PM2
npm install -g pm2

# Install Git
apt install git -y
```

### Step 4: Deploy App
```bash
# Clone repository
git clone https://github.com/bdbriggs/6340.git
cd 6340

# Install dependencies
npm ci --production

# Create .env file
nano .env
```

Add to `.env`:
```bash
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=projects
MYSQL_PORT=3306
NODE_ENV=production
PORT=3000
```

### Step 5: Start App
```bash
# Start with PM2
pm2 start start.js --name "dfc-app"
pm2 startup
pm2 save

# Check status
pm2 status
```

---

## Method 3: Docker (Advanced)

### Step 1: Create Droplet
1. Create Ubuntu droplet
2. Install Docker: `curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh`

### Step 2: Deploy with Docker
```bash
# Clone repository
git clone https://github.com/bdbriggs/6340.git
cd 6340

# Create .env file
nano .env

# Start with Docker Compose
docker-compose up -d
```

---

## 🔍 Testing Your Deployment

### 1. Health Check
Visit: `https://your-app-url.com/health`
Should show:
```json
{
  "status": "ok",
  "checks": {
    "database": "ok",
    "environment": "ok"
  }
}
```

### 2. Gallery Test
Visit: `https://your-app-url.com/gallery`
Should show your 3 images

### 3. Test Page
Visit: `https://your-app-url.com/test`
Should show gallery data

---

## 🚨 Common Issues & Fixes

### Issue: "Database connection not available"
**Fix**: Set environment variables in DigitalOcean dashboard

### Issue: "Missing required database environment variables"
**Fix**: Add MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE

### Issue: "Port already in use"
**Fix**: Use PORT=3000 environment variable

### Issue: "Cannot find module"
**Fix**: Run `npm ci` to install dependencies

---

## 📞 Need Help?

1. **Check logs** in DigitalOcean dashboard
2. **Visit health endpoint** to see what's broken
3. **Verify environment variables** are set correctly
4. **Test database connection** separately

## 🎯 Quick Start (App Platform)

1. Go to App Platform
2. Connect GitHub repo
3. Set environment variables
4. Deploy
5. Test at `/health` endpoint

That's it! 🚀

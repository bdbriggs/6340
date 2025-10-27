# DigitalOcean Deployment Troubleshooting Guide

## 🚨 Common Issues & Solutions

### 1. **Environment Variables Not Set**
**Problem**: Gallery works locally but fails on DigitalOcean
**Solution**: Set all required environment variables in DigitalOcean

#### Required Environment Variables:
```bash
# Database Configuration
MYSQL_HOST=your_database_host
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database_name
MYSQL_PORT=3306

# Server Configuration
NODE_ENV=production
PORT=3000

# Optional: Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
MAIL_TO=your_contact_email@gmail.com
```

### 2. **Database Connection Issues**
**Problem**: Can't connect to database in production
**Solutions**:
- Verify database credentials
- Check if database is running
- Ensure database allows connections from your app's IP
- Use managed database service if available

### 3. **Port Configuration**
**Problem**: App not accessible on DigitalOcean
**Solution**: Ensure PORT environment variable is set to 3000 or use DigitalOcean's assigned port

### 4. **Missing Dependencies**
**Problem**: App crashes on startup
**Solution**: Ensure all dependencies are in package.json and installed

## 🔍 Debugging Steps

### Step 1: Check Health Endpoint
Visit: `https://your-app-url.com/health`
This will show you:
- Database connection status
- Missing environment variables
- Overall app health

### Step 2: Check Logs
In DigitalOcean dashboard:
1. Go to your app
2. Click "Runtime Logs"
3. Look for error messages

### Step 3: Test Database Connection
```bash
# SSH into your droplet (if using VPS)
mysql -h your_db_host -u your_username -p your_database_name
```

### Step 4: Verify Environment Variables
```bash
# Check if variables are set
echo $MYSQL_HOST
echo $MYSQL_USER
echo $MYSQL_DATABASE
```

## 🛠️ Quick Fixes

### Fix 1: App Platform Deployment
1. Go to DigitalOcean App Platform
2. Select your app
3. Go to "Settings" → "Environment Variables"
4. Add all required variables from above
5. Redeploy

### Fix 2: Droplet Deployment
1. SSH into your droplet
2. Edit your .env file:
   ```bash
   nano .env
   ```
3. Add all required variables
4. Restart your app:
   ```bash
   pm2 restart dfc-app
   ```

### Fix 3: Docker Deployment
1. Update your .env file
2. Restart containers:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## 📊 Health Check Endpoints

- **Health Check**: `/health` - Shows app status and database connection
- **Ping**: `/__ping` - Simple server response test
- **Gallery Test**: `/test` - Tests gallery functionality

## 🚀 Deployment Methods

### Method 1: App Platform (Recommended)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Method 2: Droplet (VPS)
1. Create Ubuntu droplet
2. Install Node.js and MySQL
3. Clone repository
4. Set up environment variables
5. Use PM2 for process management

### Method 3: Docker
1. Use provided docker-compose.yml
2. Set environment variables
3. Deploy with Docker

## 🔧 Common Error Messages

### "Database connection not available"
- Check MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
- Verify database is running
- Check network connectivity

### "Missing required database environment variables"
- Set all MYSQL_* or DB_* environment variables
- Restart the application

### "Port already in use"
- Check if another process is using port 3000
- Use different port or kill existing process

### "Cannot find module"
- Run `npm install` to install dependencies
- Check package.json for missing dependencies

## 📞 Need Help?

If you're still having issues:
1. Check the health endpoint: `/health`
2. Share the error logs from DigitalOcean
3. Verify all environment variables are set
4. Test database connection separately

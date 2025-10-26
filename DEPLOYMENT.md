# DigitalOcean Deployment Guide

## Prerequisites
- DigitalOcean account
- GitHub repository with your code
- Domain name (optional but recommended)

## Deployment Options

### Option 1: DigitalOcean App Platform (Recommended)
1. **Connect GitHub Repository**
   - Go to DigitalOcean App Platform
   - Click "Create App"
   - Connect your GitHub repository
   - Select the repository and branch

2. **Configure App Settings**
   - **Source**: GitHub
   - **Branch**: main
   - **Build Command**: `npm ci`
   - **Run Command**: `npm start`
   - **Port**: 3000

3. **Environment Variables**
   Set these in the App Platform dashboard:
   ```
   NODE_ENV=production
   DB_HOST=your_db_host
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   SMTP_FROM=your_email@gmail.com
   MAIL_TO=your_contact_email@gmail.com
   PORT=3000
   ```

4. **Database Setup**
   - Add a MySQL database component in App Platform
   - Or use an external database service

### Option 2: DigitalOcean Droplet (VPS)
1. **Create Droplet**
   - Choose Ubuntu 22.04 LTS
   - Select size (1GB RAM minimum)
   - Add SSH key

2. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install MySQL
   sudo apt install mysql-server -y
   sudo mysql_secure_installation
   
   # Install PM2 for process management
   sudo npm install -g pm2
   
   # Install Git
   sudo apt install git -y
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo
   
   # Install dependencies
   npm ci --production
   
   # Create .env file
   nano .env
   # Add your environment variables
   
   # Start with PM2
   pm2 start server.js --name "dfc-app"
   pm2 startup
   pm2 save
   ```

### Option 3: Docker Deployment
1. **Using Docker Compose**
   ```bash
   # Copy .env.example to .env and configure
   cp .env.example .env
   nano .env
   
   # Start services
   docker-compose up -d
   ```

2. **Using Docker Swarm (for scaling)**
   ```bash
   docker stack deploy -c docker-compose.yml dfc-stack
   ```

## Database Setup
1. **Create Database**
   ```sql
   CREATE DATABASE your_db_name;
   CREATE USER 'your_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON your_db_name.* TO 'your_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. **Import Schema** (if you have one)
   ```bash
   mysql -u your_user -p your_db_name < schema.sql
   ```

## SSL/HTTPS Setup
1. **Using Let's Encrypt (Certbot)**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d yourdomain.com
   ```

2. **App Platform**: SSL is handled automatically

## Monitoring & Maintenance
1. **Health Checks**
   - App Platform: Built-in health monitoring
   - Droplet: Set up monitoring alerts

2. **Logs**
   ```bash
   # PM2 logs
   pm2 logs dfc-app
   
   # Docker logs
   docker-compose logs -f
   ```

3. **Backups**
   - Database: Set up automated backups
   - Files: Use DigitalOcean Spaces for file storage

## Security Checklist
- [ ] Use strong passwords for database
- [ ] Enable firewall (ufw)
- [ ] Keep system updated
- [ ] Use environment variables for secrets
- [ ] Enable SSL/HTTPS
- [ ] Regular security updates

## Troubleshooting
1. **App Won't Start**
   - Check environment variables
   - Verify database connection
   - Check logs for errors

2. **Database Connection Issues**
   - Verify database credentials
   - Check if database is running
   - Ensure proper permissions

3. **Email Not Working**
   - Verify SMTP credentials
   - Check Gmail app password setup
   - Test SMTP connection

## Cost Optimization
- **App Platform**: Pay-as-you-scale
- **Droplet**: Fixed monthly cost
- **Database**: Consider managed database for production

Choose the deployment method that best fits your needs and budget!

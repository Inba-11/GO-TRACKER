# Go Tracker - Deployment Guide

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended for Development & Small Deployments)

#### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

#### Steps

1. **Clone and Setup**
```bash
git clone https://github.com/Syfudeen/go_tracker.git
cd go_tracker
```

2. **Create Environment File**
```bash
cat > .env << EOF
GITHUB_TOKEN=your_github_token_here
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=admin123
EOF
```

3. **Start Services**
```bash
docker-compose up -d
```

4. **Verify Services**
```bash
# Check all containers
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f scraper
```

5. **Access Application**
- Frontend: http://localhost:8084
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

#### Stopping Services
```bash
docker-compose down

# With volume cleanup
docker-compose down -v
```

---

### Option 2: Systemd Services (Linux Production)

#### Prerequisites
- Ubuntu 20.04+ or similar Linux
- Node.js 18+
- Python 3.8+
- MongoDB 4.4+
- Nginx (for reverse proxy)

#### Installation Steps

1. **Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python
sudo apt install -y python3 python3-pip python3-venv

# Install MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Install Chrome for Selenium
sudo apt install -y chromium-browser chromium-chromedriver

# Install Nginx
sudo apt install -y nginx
```

2. **Clone Repository**
```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/Syfudeen/go_tracker.git
sudo chown -R www-data:www-data go_tracker
```

3. **Setup Backend**
```bash
cd /var/www/go_tracker/backend
sudo -u www-data npm install --production

# Create .env
sudo tee .env > /dev/null << EOF
MONGO_URI=mongodb://localhost:27017/go-tracker
PORT=5000
NODE_ENV=production
GITHUB_TOKEN=your_github_token_here
FRONTEND_URL=http://your-domain.com
EOF

sudo chown www-data:www-data .env
sudo chmod 600 .env
```

4. **Setup Python Scraper**
```bash
cd /var/www/go_tracker/scraper
sudo -u www-data python3 -m venv venv
sudo -u www-data venv/bin/pip install -r requirements.txt

# Create .env
sudo tee .env > /dev/null << EOF
MONGO_URI=mongodb://localhost:27017/go-tracker
GITHUB_TOKEN=your_github_token_here
LOG_LEVEL=INFO
EOF

sudo chown www-data:www-data .env
sudo chmod 600 .env
```

5. **Setup Frontend**
```bash
cd /var/www/go_tracker
sudo -u www-data npm install --production
sudo -u www-data npm run build
```

6. **Install Systemd Services**
```bash
# Backend service
sudo cp /var/www/go_tracker/deployment/go-tracker-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable go-tracker-backend
sudo systemctl start go-tracker-backend

# Scraper service
sudo cp /var/www/go_tracker/deployment/go-tracker-scraper.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable go-tracker-scraper
sudo systemctl start go-tracker-scraper

# MongoDB (usually already installed)
sudo systemctl enable mongod
sudo systemctl start mongod
```

7. **Configure Nginx Reverse Proxy**
```bash
sudo tee /etc/nginx/sites-available/go-tracker > /dev/null << 'EOF'
upstream backend {
    server localhost:5000;
}

upstream frontend {
    server localhost:8084;
}

server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    # API proxy
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/go-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

8. **Setup SSL with Let's Encrypt**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com
```

9. **Verify Services**
```bash
# Check service status
sudo systemctl status go-tracker-backend
sudo systemctl status go-tracker-scraper
sudo systemctl status mongod

# View logs
sudo journalctl -u go-tracker-backend -f
sudo journalctl -u go-tracker-scraper -f
```

---

### Option 3: AWS Deployment

#### Architecture
- **EC2**: Node.js backend + Python scraper
- **RDS**: MongoDB
- **CloudFront**: CDN for frontend
- **S3**: Static frontend assets
- **Route53**: DNS

#### Steps

1. **Launch EC2 Instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance Type: t3.medium (or larger)
   - Security Group: Allow 80, 443, 22

2. **Install Dependencies** (same as Systemd option above)

3. **Setup RDS MongoDB**
   - Create MongoDB cluster
   - Configure security groups
   - Update connection string in `.env`

4. **Deploy Frontend to S3**
```bash
npm run build
aws s3 sync dist/ s3://your-bucket-name/
```

5. **Setup CloudFront**
   - Origin: S3 bucket
   - CNAME: your-domain.com
   - SSL: ACM certificate

6. **Configure Route53**
   - A record: EC2 instance
   - CNAME: CloudFront distribution

---

### Option 4: Kubernetes Deployment

#### Prerequisites
- Kubernetes cluster (EKS, GKE, or local)
- kubectl configured
- Docker images pushed to registry

#### Steps

1. **Create Namespace**
```bash
kubectl create namespace go-tracker
```

2. **Create ConfigMaps and Secrets**
```bash
kubectl create configmap go-tracker-config \
  --from-literal=NODE_ENV=production \
  -n go-tracker

kubectl create secret generic go-tracker-secrets \
  --from-literal=GITHUB_TOKEN=your_token \
  --from-literal=MONGO_URI=mongodb://... \
  -n go-tracker
```

3. **Deploy Services**
```bash
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/scraper-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```

4. **Setup Ingress**
```bash
kubectl apply -f k8s/ingress.yaml
```

---

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl https://your-domain.com/health

# Database connection
mongosh "mongodb://localhost:27017/go-tracker"

# Service status
sudo systemctl status go-tracker-backend
sudo systemctl status go-tracker-scraper
```

### Log Monitoring

```bash
# Backend logs
sudo journalctl -u go-tracker-backend -f

# Scraper logs
sudo journalctl -u go-tracker-scraper -f

# MongoDB logs
sudo journalctl -u mongod -f
```

### Database Backup

```bash
# Backup
mongodump --uri="mongodb://localhost:27017/go-tracker" --out=/backups/go-tracker

# Restore
mongorestore --uri="mongodb://localhost:27017/go-tracker" /backups/go-tracker
```

### Performance Monitoring

```bash
# CPU and Memory
top

# Disk usage
df -h

# Network connections
netstat -an | grep ESTABLISHED
```

---

## 🔒 Security Checklist

- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set strong MongoDB passwords
- [ ] Rotate GitHub token regularly
- [ ] Enable database backups
- [ ] Configure rate limiting
- [ ] Setup monitoring and alerts
- [ ] Regular security updates
- [ ] Enable audit logging
- [ ] Restrict API access

---

## 🚨 Troubleshooting

### Services Won't Start
```bash
# Check logs
sudo journalctl -u go-tracker-backend -n 50

# Check ports
sudo netstat -tlnp | grep 5000

# Restart service
sudo systemctl restart go-tracker-backend
```

### Database Connection Issues
```bash
# Test connection
mongosh "mongodb://localhost:27017/go-tracker"

# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

### High Memory Usage
```bash
# Check process memory
ps aux | grep node

# Restart service
sudo systemctl restart go-tracker-backend
```

---

## 📈 Scaling Considerations

1. **Horizontal Scaling**
   - Use load balancer (Nginx, HAProxy)
   - Multiple backend instances
   - Shared MongoDB

2. **Vertical Scaling**
   - Increase instance size
   - Optimize database indexes
   - Cache frequently accessed data

3. **Database Optimization**
   - Create indexes on frequently queried fields
   - Archive old logs
   - Use connection pooling

---

## 📞 Support

For deployment issues:
1. Check logs: `sudo journalctl -u service-name -f`
2. Verify configuration: Check `.env` files
3. Test connectivity: `curl` and `mongosh`
4. Review documentation: See PRODUCTION_SYSTEM_GUIDE.md

---

**Last Updated**: January 5, 2026
**Version**: 1.0.0

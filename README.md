# GO Tracker - Student Performance Dashboard

A comprehensive student performance tracking system that monitors coding progress across multiple platforms including LeetCode, CodeChef, Codeforces, GitHub, and Codolio.

## 🚀 Features

- **Multi-Platform Integration**: Track performance across LeetCode, CodeChef, Codeforces, GitHub, and Codolio
- **Real-Time Data Scraping**: Automated data collection using GraphQL APIs and web scraping
- **Modern UI**: Beautiful, responsive dashboard with gradient designs and animations
- **Role-Based Access**: Separate dashboards for Students, Staff, and Administrators
- **GitHub Integration**: Track contributions, streaks, and repository statistics
- **Badge System**: Display achievements and badges from various platforms
- **Resume Management**: Upload and manage resume links
- **Project Repositories**: Showcase student projects and repositories
- **Analytics**: Weekly progress charts and platform comparisons

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **React Router** for navigation
- **Axios** for API calls
- **Recharts** for data visualization

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** for cross-origin requests
- **Helmet** for security headers

### Data Scraping
- **Python** with requests and BeautifulSoup
- **Selenium** for JavaScript-heavy sites
- **GraphQL** APIs for LeetCode and GitHub
- **REST APIs** for Codeforces

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Python** (v3.8 or higher) - [Download here](https://www.python.org/downloads/)
- **Git** - [Download here](https://git-scm.com/downloads)
- **Chrome Browser** (for Selenium scraping)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Syfudeen/go_tracker.git
cd go_tracker/go-tracker
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Configure Backend Environment Variables** (`.env`):
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/go-tracker
MONGODB_URI=mongodb://localhost:27017/go-tracker

# JWT Secret (Change this in production)
JWT_SECRET=go-tracker-super-secret-jwt-key-2024-change-in-production

# API Configuration
API_BASE_URL=http://localhost:5000/api

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# GitHub Token (Optional - for enhanced GitHub scraping)
GITHUB_TOKEN=your_github_personal_access_token_here

# Scraping Configuration
SCRAPING_DELAY=2000
MAX_RETRIES=3
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Frontend Setup

```bash
# Navigate back to root directory
cd ..

# Install frontend dependencies
npm install

# Create frontend environment file
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### 4. Python Scraper Setup

```bash
# Navigate to scraper directory
cd scraper

# Install Python dependencies
pip install -r requirements.txt

# For Selenium (Chrome WebDriver)
# Download ChromeDriver from: https://chromedriver.chromium.org/
# Or use webdriver-manager (already in requirements.txt)
```

**Create `requirements.txt`** (if not exists):
```txt
requests==2.31.0
beautifulsoup4==4.12.2
selenium==4.15.2
webdriver-manager==4.0.1
pymongo==4.6.0
python-dotenv==1.0.0
```

### 5. Database Setup

**Start MongoDB:**

**Windows:**
```bash
# Start MongoDB service
net start MongoDB
```

**macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Import Initial Data:**
```bash
# Navigate to backend directory
cd backend

# Run the data seeding script
npm run seed
```

### 6. Start the Application

**Terminal 1 - Start Backend:**
```bash
cd go-tracker/backend
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd go-tracker
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🔑 Login Credentials

### Student Login
- **URL**: http://localhost:5173/login/student
- **Username**: Full name (e.g., "AADHAM SHARIEF A") or Roll number
- **Password**: Roll number (e.g., "711523BCB001")

### Staff Login
- **URL**: http://localhost:5173/login/staff
- **Username**: Staff name (e.g., "Pandiyarajan")
- **Password**: `Mentor@123`

### Admin Login
- **URL**: http://localhost:5173/login/owner
- **Email**: `owner@bytebuster.com`
- **Password**: `thotuparu@123`

## 📊 Data Scraping

### Manual Data Scraping

**Scrape All Students:**
```bash
cd scraper
python scrape_all_students.py
```

**Scrape Specific Platform:**
```bash
# LeetCode, CodeChef, Codeforces, GitHub
python platform_scrapers.py

# Codolio (requires Chrome)
python scrape_codolio.py

# GitHub Streaks
python fetch_streaks_batch.py
```

### Automated Scraping (Optional)

Set up cron jobs or scheduled tasks to run scraping scripts periodically:

```bash
# Example cron job (runs daily at 2 AM)
0 2 * * * cd /path/to/go-tracker/scraper && python scrape_all_students.py
```

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Error:**
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"

# Start MongoDB if not running
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
net start MongoDB  # Windows
```

**2. Port Already in Use:**
```bash
# Kill process using port 5000
npx kill-port 5000

# Kill process using port 5173
npx kill-port 5173
```

**3. CORS Errors:**
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that both servers are running on correct ports

**4. Scraping Issues:**
- Install Chrome browser for Selenium
- Update ChromeDriver: `pip install --upgrade webdriver-manager`
- Check internet connection and platform availability

**5. Missing Dependencies:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# For Python dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

## 📁 Project Structure

```
go-tracker/
├── backend/                 # Node.js Express API
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── server.js          # Entry point
├── src/                   # React frontend
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── contexts/         # React contexts
│   ├── services/         # API services
│   └── data/             # Static data
├── scraper/              # Python scraping scripts
│   ├── platform_scrapers.py
│   ├── scrape_codolio.py
│   └── requirements.txt
├── public/               # Static assets
└── README.md
```

## 🚀 Deployment

### Production Environment Variables

**Backend `.env`:**
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://your-production-db-url
JWT_SECRET=your-super-secure-jwt-secret
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend `.env`:**
```env
VITE_API_URL=https://your-backend-domain.com/api
```

### Docker Deployment (Optional)

```dockerfile
# Dockerfile example for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Mohammed Syfudeen** - *Initial work* - [Syfudeen](https://github.com/Syfudeen)

## 🙏 Acknowledgments

- Thanks to all the competitive programming platforms for their APIs
- Shadcn/ui for the beautiful UI components
- The open-source community for the amazing tools and libraries

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [Issues](https://github.com/Syfudeen/go_tracker/issues)
3. Create a new issue with detailed information

---

**Happy Coding! 🚀**

# Go Tracker - Login Credentials

## 🌐 Application URLs

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 👨‍🎓 Student Login

**Login URL**: http://localhost:8080/login/student

### Test Student Accounts

| Name | Username (Identifier) | Password (Roll Number) | Batch |
|------|----------------------|------------------------|-------|
| AADHAM SHARIEF A | AADHAM SHARIEF A | 711523BCB001 | B |
| AARTHI V | AARTHI V | 711523BCB002 | C |
| ABINAYA R | ABINAYA R | 711523BCB003 | C |
| AHAMED AMMAR O A | AHAMED AMMAR O A | 711523BCB005 | A |
| PRAKASH B | PRAKASH B | 711523BCB041 | A |

**How to Login:**
1. Go to http://localhost:8080
2. Click on "Student" card
3. Enter your **full name** as username (e.g., "AADHAM SHARIEF A")
4. Enter your **roll number** as password (e.g., "711523BCB001")
5. Click "Sign In"

**Alternative Login:**
- You can also use your **roll number** as the username
- Example: Username: `711523BCB001`, Password: `711523BCB001`

## 👨‍🏫 Staff Login

**Login URL**: http://localhost:8080/login/staff

### Staff Accounts

| Name | Username | Password |
|------|----------|----------|
| Pandiyarajan | Pandiyarajan | Mentor@123 |
| Tamilarasu | Tamilarasu | Mentor@123 |
| Priya | Priya | Mentor@123 |
| Seema | Seema | Mentor@123 |
| Narmatha | Narmatha | Mentor@123 |
| Sudarvizhi | Sudarvizhi | Mentor@123 |
| Hemalatha | Hemalatha | Mentor@123 |

**How to Login:**
1. Go to http://localhost:8080
2. Click on "Staff" card
3. Enter staff username (e.g., "Pandiyarajan")
4. Enter password: `Mentor@123`
5. Click "Sign In"

## 👑 Owner/Admin Login

**Login URL**: http://localhost:8080/login/owner

### Owner Account

| Email | Password |
|-------|----------|
| owner@bytebuster.com | thotuparu@123 |

**How to Login:**
1. Go to http://localhost:8080
2. Click on "Owner" card
3. Enter email: `owner@bytebuster.com`
4. Enter password: `thotuparu@123`
5. Click "Sign In"

## 🔧 Troubleshooting

### Login Not Working?

1. **Check if servers are running:**
   ```bash
   # Backend should be on port 5000
   curl http://localhost:5000/health
   
   # Frontend should be on port 8080
   # Open http://localhost:8080 in browser
   ```

2. **Test backend login directly:**
   ```bash
   # Test student login
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"identifier":"AADHAM SHARIEF A","password":"711523BCB001","role":"student"}'
   ```

3. **Check browser console:**
   - Open Developer Tools (F12)
   - Check Console tab for errors
   - Check Network tab to see API requests

4. **Common Issues:**
   - **CORS Error**: Make sure backend .env has `FRONTEND_URL=http://localhost:8080`
   - **401 Unauthorized**: Check username/password spelling (case-sensitive for names)
   - **Network Error**: Ensure backend is running on port 5000

## 📊 Database Info

- **Database**: MongoDB (localhost:27017)
- **Database Name**: go-tracker
- **Total Students**: 63
- **Total Staff**: 7
- **Total Owners**: 1

## 🚀 Quick Start

1. **Start MongoDB** (should already be running)
2. **Start Backend**:
   ```bash
   cd go-tracker/backend
   npm run dev
   ```
3. **Start Frontend**:
   ```bash
   cd go-tracker
   npm run dev
   ```
4. **Open Browser**: http://localhost:8080

## ✅ Verification

After logging in successfully:
- **Students**: Should see personal dashboard with platform stats
- **Staff**: Should see batch overview and student list
- **Owner**: Should see system-wide analytics and management tools

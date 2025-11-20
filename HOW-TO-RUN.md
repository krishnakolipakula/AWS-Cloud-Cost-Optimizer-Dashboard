# How to Run the Cloud Cost Optimizer Dashboard

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v24+ installed
- npm v11+ installed
- Both servers must run simultaneously

---

## ▶️ Starting the Application

### Method 1: Using Batch Files (Recommended)

**Step 1: Start Backend API**
```bash
# Open Terminal/Command Prompt #1
cd C:\Users\Krishna\OneDrive\Desktop\UF\cloudmern
.\start-backend.bat
```
- Wait for message: "Server ready: http://localhost:4000"
- Keep this window open (do NOT close it)

**Step 2: Start Frontend Dashboard**
```bash
# Open Terminal/Command Prompt #2 (NEW WINDOW)
cd C:\Users\Krishna\OneDrive\Desktop\UF\cloudmern
.\start-frontend.bat
```
- Wait for message: "webpack compiled successfully"
- Browser may auto-open to http://localhost:3002
- Keep this window open (do NOT close it)

**Step 3: Access the Dashboard**
```
Open browser: http://localhost:3002
```

---

### Method 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd C:\Users\Krishna\OneDrive\Desktop\UF\cloudmern\aws-backend
npm run start:local
```

**Terminal 2 - Frontend:**
```bash
cd C:\Users\Krishna\OneDrive\Desktop\UF\cloudmern\react-analytics-dashboard
set PORT=3002
npm start
```

---

## ✅ Verify It's Working

### Visual Indicators:
1. **Top-right corner**: Green badge "✓ Connected to Backend"
2. **Dashboard header**: Badge showing "🔌 AWS Lambda Backend API • FIXED DATA"
3. **Toggle switch**: Shows "🌐 Try Backend API" (should be ON)

### Test the Connection:
1. **Refresh the page multiple times**
   - Numbers should stay THE SAME (not random)
   - Resource IDs look like: `i-backend000001`, `db-backend000234`
   
2. **Toggle the switch OFF**
   - Badge changes to gray "⚠ Using Mock Data"
   - Header shows "📊 Frontend Mock Data • RANDOM DATA"
   - Refresh → Numbers change every time
   - Resource IDs look random: `i-7xk2m9p`, `bucket-abc123`

3. **Toggle back ON**
   - Should reconnect to backend
   - Numbers become fixed again

---

## 🛑 Stopping the Application

1. Close the Frontend terminal/window (Ctrl+C or close window)
2. Close the Backend terminal/window (Ctrl+C or close window)

---

## 🔧 Troubleshooting

### Backend not connecting?
```bash
# Check if backend is running
curl http://localhost:4000/api/billing-data

# Should return JSON with "success": true
```

### Port already in use?
```bash
# Check what's using the ports
netstat -ano | findstr "3002"
netstat -ano | findstr "4000"

# Kill the process if needed (use the PID from above)
taskkill /PID <process_id> /F
```

### Frontend shows blank page?
1. Check browser console for errors (F12)
2. Verify backend is running first
3. Hard refresh: Ctrl+Shift+R

### Wrong port?
- Frontend should be on **port 3002** (not 3000, 3001, or 3003)
- Backend should be on **port 4000**

---

## 📊 What You'll See

### Dashboard Features:
- **Metrics Cards**: Total Cost, Month to Date, Projected Monthly, Weekly Trend
- **Service Cost Chart**: Bar chart showing costs by AWS service (EC2, S3, RDS, etc.)
- **Region Cost Chart**: Pie chart showing costs by AWS region
- **Time Series Chart**: Line chart showing daily cost trends
- **Filters**: Date range, service selection, region selection

### Data Information:
- **Backend Mode**: 450 fixed billing records across 90 days
  - Same data every refresh
  - Proves you're connected to backend API
  - Resource IDs: `i-backend000001`, `s3-backend000002`, etc.
  
- **Mock Mode**: 1000 random billing records
  - Different data every refresh
  - Used for testing without backend
  - Resource IDs: Random alphanumeric

---

## 🎯 API Endpoints Available

All endpoints accessible at `http://localhost:4000`:

### Billing
- `GET /api/billing-data` - Get all billing records
- `POST /api/billing-data` - Create billing record

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/{id}` - Update budget
- `DELETE /api/budgets/{id}` - Delete budget
- `GET /api/budgets/{id}/status` - Get budget status

### Alerts
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create alert
- `POST /api/alerts/{id}/acknowledge` - Acknowledge alert

### Analytics
- `GET /api/analytics/service-costs` - Get costs by service
- `GET /api/analytics/region-costs` - Get costs by region
- `GET /api/analytics/daily-costs` - Get daily cost breakdown
- `GET /api/analytics/trends` - Get cost trends

---

## 💾 Project Structure

```
cloudmern/
├── start-backend.bat          ← Backend startup script
├── start-frontend.bat         ← Frontend startup script
├── aws-backend/               ← Backend API (Node.js + Serverless)
│   ├── src/
│   │   ├── handlers/         ← Lambda function handlers
│   │   ├── services/         ← Business logic
│   │   └── utils/            ← Helper functions
│   └── serverless.yml        ← API configuration
│
└── react-analytics-dashboard/ ← Frontend Dashboard (React + TypeScript)
    ├── src/
    │   ├── components/       ← React components
    │   ├── services/         ← API client
    │   └── utils/            ← Data processing
    └── public/               ← Static assets
```

---

## 📝 Notes

- **Keep both terminals open** while using the dashboard
- Backend data is **deterministic** (same every time) for testing
- Frontend automatically falls back to mock data if backend is down
- All data is currently **mock data** - no real AWS connection yet
- Ready for AWS deployment when needed

---

## 🆘 Need Help?

1. Check `SESSION-CONTEXT.md` for detailed session history
2. Check `INTEGRATION-GUIDE.md` for technical details
3. Check `README.md` for project overview
4. Backend logs appear in the backend terminal window
5. Frontend logs appear in browser console (F12)

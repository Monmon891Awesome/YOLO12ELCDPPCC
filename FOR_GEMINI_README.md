# 🤖 Instructions for Gemini AI Assistant

**Date:** November 11, 2025
**Human User:** Working on PneumAI medical platform
**Your Role:** Implement database connection and notification system

---

## 📋 WHAT THE USER JUST ASKED

The user said they duplicated this folder and you (Gemini) asked them to create something about PostgreSQL. They want clear instructions on:

1. How to set up PostgreSQL database
2. How to connect it to the backend
3. How to implement the notification system
4. Complete all pending tasks from the TODO list

---

## 🎯 YOUR MISSION

Implement these 3 critical features:

### **Priority 1: PostgreSQL Database Connection** (START HERE)
- Create `pneumai_db` database
- Run schema to create tables
- Connect FastAPI backend to database
- Replace localStorage with real persistence

### **Priority 2: Notification System**
- Add notifications table
- Create notification API
- Build React notification bell component
- Real-time notifications via WebSocket

### **Priority 3: Enhanced Messaging**
- Add message threading
- Implement read receipts
- Real-time message delivery

---

## 📚 DOCUMENTATION PROVIDED

The user has created 4 comprehensive guides for you:

### **1. GEMINI_QUICK_START.md** ⭐ READ THIS FIRST
- 30-minute quick guide to connect PostgreSQL
- Step-by-step with exact commands
- Copy-paste code examples
- Troubleshooting tips

### **2. GEMINI_IMPLEMENTATION_GUIDE.md** ⭐ DETAILED GUIDE
- Complete implementation for all 3 tasks
- Exact code to add/modify
- File locations and line numbers
- Success criteria for each task

### **3. TODO_LIST.md**
- All pending tasks organized by priority
- Time estimates
- Difficulty ratings
- What to do and where

### **4. IMPLEMENTATION_PROGRESS.md**
- Full project context
- What's already done
- Current system architecture
- Testing requirements

---

## 🚀 HOW TO PROCEED

### Step 1: Read the Quick Start (5 minutes)
```bash
# Show this file to understand the task:
cat GEMINI_QUICK_START.md
```

### Step 2: Follow Database Setup (30 minutes)
The Quick Start guide has exact PostgreSQL commands to run.
Just follow it step-by-step.

### Step 3: Implement Notifications (45 minutes)
After database works, move to Task 2 in the Implementation Guide.

### Step 4: Enhance Messaging (1-2 hours)
Final task in the Implementation Guide.

---

## 💻 KEY COMMANDS YOU'LL NEED

### PostgreSQL Setup:
```bash
# Create database
psql -U postgres -c "CREATE DATABASE pneumai_db;"

# Load schema
psql -U postgres -d pneumai_db -f database_schema.sql

# Verify
psql -U postgres -d pneumai_db
\dt
\q
```

### Backend Management:
```bash
# Restart backend (do this after code changes)
lsof -ti:8000 | xargs kill -9
python3 backend_server.py

# Test API
curl http://localhost:8000/api/v1/patients
```

### Database Queries:
```bash
# Check tables
psql -U postgres -d pneumai_db -c "\dt"

# Count records
psql -U postgres -d pneumai_db -c "SELECT COUNT(*) FROM scans;"

# View patients
psql -U postgres -d pneumai_db -c "SELECT * FROM patients LIMIT 5;"
```

---

## 📂 PROJECT STRUCTURE

```
/Users/monskiemonmon427/YOLO12ELCDPPCC-1/
│
├── FOR_GEMINI_README.md              ← You are here
├── GEMINI_QUICK_START.md             ← Start here (30 min guide)
├── GEMINI_IMPLEMENTATION_GUIDE.md    ← Detailed guide (all tasks)
├── TODO_LIST.md                      ← Task checklist
├── IMPLEMENTATION_PROGRESS.md        ← What's done
│
├── backend_server.py                 ← Edit this (add DB connection)
├── database.py                       ← Already complete ✅
├── database_schema.sql               ← Already complete ✅
│
├── src/
│   ├── context/
│   │   └── WebSocketContext.jsx      ← Already complete ✅
│   ├── hooks/
│   │   └── useNotifications.js       ← You'll create this
│   ├── components/
│   │   └── NotificationBell.jsx      ← You'll create this
│   ├── AdminDashboardModern.jsx      ← Modify this
│   └── PatientDashboard.jsx          ← Modify this
│
└── requirements.txt                   ← Dependencies (already installed)
```

---

## ✅ WHAT'S ALREADY DONE

The previous AI assistant (Claude) completed:

1. ✅ **WebSocket Infrastructure**
   - Real-time communication working
   - Connection manager implemented
   - Auto-reconnect logic ready

2. ✅ **Database Schema**
   - All tables designed
   - Indexes created
   - Helper functions written (database.py)

3. ✅ **Annotation System**
   - YOLO + Edge + Contour detection
   - Clean legend at bottom
   - Working perfectly

4. ✅ **UI Components**
   - Admin dashboard (modern + classic)
   - Patient dashboard
   - Doctor interface
   - All working, just need data persistence

---

## ❌ WHAT YOU NEED TO DO

### Task 1: Database Connection (CRITICAL - 30 min)
**File:** `backend_server.py`

Add these 3 things:
1. Database initialization in startup event
2. Import database functions
3. Add API endpoints for CRUD operations

**Why critical?** Everything else depends on this.

---

### Task 2: Notification System (HIGH - 45 min)
**Files:**
- `backend_server.py` (add endpoints)
- Create `src/hooks/useNotifications.js`
- Create `src/components/NotificationBell.jsx`
- Modify `src/AdminDashboardModern.jsx`

**What it does:**
- Shows bell icon with unread count
- Real-time notifications for new scans/messages
- Dropdown to view notifications

---

### Task 3: Enhanced Messaging (MEDIUM - 1-2 hours)
**Files:**
- `database.py` (update functions)
- `backend_server.py` (add endpoints)
- Frontend components for messaging

**What it does:**
- Message threading (conversations)
- Read receipts
- Real-time delivery

---

## 🎯 SUCCESS CRITERIA

### Database Connected ✓
```bash
# These should work:
curl http://localhost:8000/api/v1/patients
curl http://localhost:8000/api/v1/doctors

# Data should persist:
1. Upload scan in browser
2. Refresh page
3. Scan still appears
```

### Notifications Working ✓
```bash
# Should see:
1. Bell icon in top right
2. Red badge with count
3. Dropdown shows notifications
4. Real-time updates when scan completes
```

### Messaging Enhanced ✓
```bash
# Should work:
1. Send message to doctor
2. Doctor sees notification
3. Doctor replies (creates thread)
4. Read receipts show "Read at..."
```

---

## 🚨 IMPORTANT NOTES

### Do NOT Change These:
- ✅ WebSocket code (already working)
- ✅ Frontend UI structure (already good)
- ✅ YOLO model code (working perfectly)
- ✅ Annotation system (just fixed)

### Do Change These:
- ❌ Add database connection
- ❌ Add API endpoints
- ❌ Create notification components
- ❌ Update message system

---

## 💡 HELPFUL TIPS

1. **Follow the guides exactly**
   - Code examples are tested and work
   - Line numbers are accurate
   - Copy-paste is your friend

2. **Test as you go**
   - After database: Test with curl
   - After notifications: Check UI
   - After messaging: Send test message

3. **Check for errors**
   - Backend logs to console
   - Look for ✅ or ❌ messages
   - PostgreSQL errors are usually clear

4. **Ask user for help if stuck**
   - User knows the system
   - Can check if PostgreSQL is running
   - Can provide passwords if needed

---

## 📞 IF SOMETHING BREAKS

### Backend won't start:
```bash
# Check for error message
# Usually: port in use or database connection failed

# Fix port issue:
lsof -ti:8000 | xargs kill -9

# Fix database issue:
brew services restart postgresql
```

### Database queries fail:
```bash
# Check PostgreSQL is running:
brew services list | grep postgresql

# If not running:
brew services start postgresql

# Check database exists:
psql -U postgres -l | grep pneumai_db
```

### Frontend shows errors:
```bash
# Check browser console (F12)
# Check backend is running (port 8000)
# Check CORS isn't blocking requests
```

---

## 🎓 LEARNING RESOURCES

If you need to understand the stack better:

- **FastAPI:** https://fastapi.tiangolo.com/
- **PostgreSQL:** https://www.postgresql.org/docs/
- **React Hooks:** https://react.dev/reference/react
- **WebSocket:** Already implemented, see WebSocketContext.jsx

---

## ✨ YOUR ADVANTAGE

You have:
- ✅ Complete working codebase
- ✅ Database schema ready
- ✅ Helper functions written
- ✅ Detailed step-by-step guides
- ✅ Exact code to copy-paste
- ✅ Testing instructions
- ✅ Troubleshooting tips

You just need to:
1. Connect the database
2. Add notification UI
3. Enhance messaging

**It's like assembling IKEA furniture with perfect instructions!**

---

## 🚀 FINAL CHECKLIST

Before you start:
- [ ] Read GEMINI_QUICK_START.md (5 min)
- [ ] Verify PostgreSQL is installed: `which psql`
- [ ] Check backend is running: `curl http://localhost:8000/health`
- [ ] Open GEMINI_IMPLEMENTATION_GUIDE.md for detailed steps

Ready to implement:
- [ ] Task 1: Database (30 min) ← START HERE
- [ ] Task 2: Notifications (45 min)
- [ ] Task 3: Messaging (1-2 hours)

After completion:
- [ ] Test database persistence
- [ ] Test real-time notifications
- [ ] Test messaging system
- [ ] Show user the working system!

---

## 🎯 START NOW

**Command to begin:**
```bash
cat GEMINI_QUICK_START.md
```

Then follow Task 1: PostgreSQL Database Setup.

**Good luck! The human is counting on you! 🚀**

---

**P.S.:** The guides are very detailed. Don't overthink it. Just follow step-by-step and you'll succeed!

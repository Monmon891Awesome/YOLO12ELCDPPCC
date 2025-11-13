# Quick Start Guide for Gemini AI

**Project:** PneumAI - Lung Cancer CT Scan Analysis Platform
**Your Mission:** Implement PostgreSQL database connection and notification system

---

## 🎯 START HERE

### What This Project Does:
Medical platform where:
- **Patients** upload CT scans
- **YOLOv12 AI** analyzes for lung cancer
- **Doctors** review results
- **Admins** manage everything

### Current Problem:
- ❌ No database persistence (data lost on refresh)
- ❌ No real-time notifications
- ❌ Basic messaging system

### Your Goal:
Make the system production-ready by connecting PostgreSQL and adding notifications.

---

## 📍 YOU ARE HERE

```
✅ DONE:
- React frontend running (localhost:3000)
- FastAPI backend running (localhost:8000)
- YOLOv12 model working
- WebSocket infrastructure ready
- Database schema designed

❌ TODO:
1. Connect PostgreSQL database  ← START HERE
2. Add notification system
3. Enhance messaging
```

---

## 🚀 STEP-BY-STEP: Connect PostgreSQL (30 minutes)

### Step 1: Create Database (2 minutes)
```bash
# In terminal:
psql -U postgres

# In psql prompt:
CREATE DATABASE pneumai_db;
\q
```

### Step 2: Load Schema (1 minute)
```bash
cd /Users/monskiemonmon427/YOLO12ELCDPPCC-1
psql -U postgres -d pneumai_db -f database_schema.sql
```

### Step 3: Verify Tables (1 minute)
```bash
psql -U postgres -d pneumai_db
\dt
# Should see: patients, doctors, scans, messages, etc.
\q
```

### Step 4: Connect Backend to Database (5 minutes)

**File to edit:** `backend_server.py`

**Find line 254** (the `@app.on_event("startup")` function)

**Add this code at the end of that function:**
```python
    # Initialize database connection
    from database import Database
    try:
        Database.initialize(
            host="localhost",
            port=5432,
            database="pneumai_db",
            user="postgres",
            password="postgres",
            min_connections=2,
            max_connections=10
        )
        print("✅ Database connection pool initialized")
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
```

### Step 5: Add Database Imports (2 minutes)

**At top of `backend_server.py`, add:**
```python
from database import (
    create_patient, get_patient, get_all_patients,
    create_scan, get_scan,
    create_message, get_user_messages,
    get_all_doctors
)
```

### Step 6: Add API Endpoints (10 minutes)

**Copy-paste before the `if __name__ == "__main__"` line in backend_server.py:**

```python
@app.post("/api/v1/patients")
async def create_patient_endpoint(patient: dict):
    try:
        result = create_patient(patient)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/patients")
async def get_all_patients_endpoint():
    patients = get_all_patients()
    return JSONResponse(content=patients)

@app.get("/api/v1/patients/{patient_id}")
async def get_patient_endpoint(patient_id: str):
    patient = get_patient(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return JSONResponse(content=patient)
```

### Step 7: Save Scans to Database (5 minutes)

**In the `analyze_scan` function (around line 393), add after creating response_data:**

```python
        # Save to database
        try:
            success, encoded = cv2.imencode('.jpg', image)
            image_bytes = encoded.tobytes() if success else b''
            create_scan(response_data, results["detections"], image_bytes)
            print(f"✓ Scan {scan_id} saved to database")
        except Exception as e:
            print(f"⚠ Could not save to database: {e}")
```

### Step 8: Test (5 minutes)

```bash
# Restart backend
lsof -ti:8000 | xargs kill -9
python3 backend_server.py

# Should see:
# ✅ Model loaded successfully
# ✅ Database connection pool initialized

# Test API
curl http://localhost:8000/api/v1/patients

# Upload a scan through UI at localhost:3000
# Check database
psql -U postgres -d pneumai_db -c "SELECT COUNT(*) FROM scans;"
```

---

## ✅ SUCCESS CHECKLIST

Database connection is working if:
- [ ] Backend starts without errors
- [ ] See "Database connection pool initialized" message
- [ ] Can call `http://localhost:8000/api/v1/patients`
- [ ] Uploaded scans appear in database
- [ ] Data persists after browser refresh

---

## 🎯 NEXT: Add Notifications (45 minutes)

### Quick Overview:
1. Add notifications table to database
2. Create notification API endpoints
3. Add NotificationBell component to React
4. Connect to WebSocket for real-time updates

### Detailed Steps:
See `GEMINI_IMPLEMENTATION_GUIDE.md` - Task 2

---

## 📂 KEY FILES

```
Project Root: /Users/monskiemonmon427/YOLO12ELCDPPCC-1/

Backend:
├── backend_server.py          ← Edit this
├── database.py                ← Already complete
└── database_schema.sql        ← Already complete

Frontend:
├── src/
│   ├── AdminDashboardModern.jsx
│   ├── PatientDashboard.jsx
│   └── context/
│       └── WebSocketContext.jsx  ← Already complete

Documentation:
├── GEMINI_IMPLEMENTATION_GUIDE.md  ← Full detailed guide
├── TODO_LIST.md                    ← All tasks listed
└── IMPLEMENTATION_PROGRESS.md      ← What's done
```

---

## 🆘 TROUBLESHOOTING

### "Database connection failed"
```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# If not running:
brew services start postgresql
```

### "Port 8000 already in use"
```bash
lsof -ti:8000 | xargs kill -9
python3 backend_server.py
```

### "Module not found: database"
```bash
# Make sure you're in project root
cd /Users/monskiemonmon427/YOLO12ELCDPPCC-1
python3 backend_server.py
```

### "Table does not exist"
```bash
# Re-run schema
psql -U postgres -d pneumai_db -f database_schema.sql
```

---

## 💡 PRO TIPS

1. **Always restart backend after code changes**
   ```bash
   lsof -ti:8000 | xargs kill -9 && python3 backend_server.py
   ```

2. **Test database queries directly**
   ```bash
   psql -U postgres -d pneumai_db
   SELECT * FROM patients LIMIT 5;
   ```

3. **Check backend logs**
   - Backend prints errors to console
   - Look for ✅ success or ❌ error messages

4. **Use curl to test APIs**
   ```bash
   curl http://localhost:8000/api/v1/patients
   ```

5. **Frontend is already running**
   - Don't restart it
   - Just refresh browser to see changes

---

## 📊 PROGRESS TRACKING

**Mark these off as you complete:**

### Phase 1: Database Connection
- [ ] PostgreSQL database created
- [ ] Schema loaded successfully
- [ ] Backend connects to database
- [ ] Patient endpoints working
- [ ] Scans save to database
- [ ] Tested: Data persists

### Phase 2: Notifications
- [ ] Notifications table created
- [ ] Notification endpoints added
- [ ] NotificationBell component created
- [ ] Real-time notifications working
- [ ] Tested: Get notification on scan upload

### Phase 3: Enhanced Messaging
- [ ] Messages table updated
- [ ] Read receipts working
- [ ] Message threading implemented
- [ ] Real-time message delivery
- [ ] Tested: Can send/receive messages

---

## 🎯 EXPECTED OUTCOMES

### After Database Connection:
- Upload scan → Data stays after refresh
- Create patient → Appears in database
- Multiple users can see same data

### After Notifications:
- Upload scan → Bell icon shows "1"
- Click bell → See "New scan analyzed"
- Click notification → Opens scan details

### After Messaging:
- Send message → Receiver gets notification
- Reply to message → Thread appears
- Mark as read → Read receipt shows

---

## 📞 NEED MORE HELP?

**Read these in order:**
1. **GEMINI_QUICK_START.md** ← You are here
2. **GEMINI_IMPLEMENTATION_GUIDE.md** ← Detailed steps
3. **TODO_LIST.md** ← All remaining tasks
4. **IMPLEMENTATION_PROGRESS.md** ← Full context

**Stuck?**
- Check error messages in terminal
- Verify PostgreSQL is running
- Make sure you're in correct directory
- Try restarting backend

---

## 🚀 YOU GOT THIS!

**Remember:**
- ✅ Most code already exists
- ✅ Just connecting pieces together
- ✅ Follow steps exactly
- ✅ Test as you go

**Start with database connection. It's the foundation for everything else!**

---

**Ready? Start at Step 1 above!** 🎯

# PneumAI Implementation Guide for Gemini AI

**Purpose:** Step-by-step instructions for implementing remaining features
**Target:** AI assistants continuing this project
**Date:** November 11, 2025

---

## 🎯 PROJECT CONTEXT

### What This Project Is:
- **PneumAI** - Medical platform for lung cancer CT scan analysis using YOLOv12
- **Users:** Admins, Doctors, Patients
- **Tech Stack:** React + FastAPI + PostgreSQL + WebSocket
- **Current State:** WebSocket implemented, database schema ready, UI functional

### What's Already Working:
✅ Frontend (React) on `http://localhost:3000`
✅ Backend (FastAPI) on `http://localhost:8000`
✅ YOLOv12 model loaded and analyzing scans
✅ WebSocket for real-time updates (just implemented)
✅ Admin/Patient/Doctor dashboards (UI only)
✅ Database schema designed (not connected yet)

### Current Problem:
❌ No database persistence (using localStorage)
❌ Data doesn't persist across page refreshes properly
❌ No real user accounts or authentication
❌ No notification system
❌ Messaging is basic (no read receipts, threading)

---

## 📋 TASK 1: PostgreSQL Database Setup (START HERE)

### Why This First?
- Everything else depends on database persistence
- Unlocks multi-user functionality
- Enables notifications and messaging
- Already have schema ready to use

### Prerequisites:
```bash
# Check if PostgreSQL is installed
which psql
# Should output: /opt/homebrew/bin/psql (or similar)

# If not installed:
brew install postgresql
brew services start postgresql
```

### Step 1: Create Database

```bash
# Open terminal and run:
psql -U postgres

# In psql prompt, run:
CREATE DATABASE pneumai_db;

# Verify:
\l
# Should see pneumai_db in list

# Connect to new database:
\c pneumai_db

# Exit psql:
\q
```

### Step 2: Run Database Schema

```bash
# From project root directory:
cd /Users/monskiemonmon427/YOLO12ELCDPPCC-1

# Run the schema file:
psql -U postgres -d pneumai_db -f database_schema.sql

# You should see output like:
# CREATE TABLE
# CREATE TABLE
# CREATE TABLE
# ... (multiple times)
# CREATE INDEX
# ... etc.
```

### Step 3: Verify Tables Created

```bash
psql -U postgres -d pneumai_db

# List all tables:
\dt

# Should see:
# patients
# doctors
# scans
# detections
# appointments
# messages
# scan_images

# View a table structure:
\d patients

# Exit:
\q
```

### Step 4: Connect Backend to Database

**File:** `backend_server.py`

**Find this section (around line 254):**
```python
@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    global model, MODEL_LOADED
    try:
        model = YOLO("best.pt")
        MODEL_LOADED = True
        print("✅ Model loaded successfully")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        MODEL_LOADED = False
```

**Replace with:**
```python
@app.on_event("startup")
async def startup_event():
    """Load model and initialize database on startup"""
    global model, MODEL_LOADED

    # Load YOLO model
    try:
        model = YOLO("best.pt")
        MODEL_LOADED = True
        print("✅ Model loaded successfully")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        MODEL_LOADED = False

    # Initialize database connection
    from database import Database
    try:
        Database.initialize(
            host="localhost",
            port=5432,
            database="pneumai_db",
            user="postgres",
            password="postgres",  # Change if you set a different password
            min_connections=2,
            max_connections=10
        )
        print("✅ Database connection pool initialized")
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
```

### Step 5: Test Database Connection

**Restart backend:**
```bash
# Kill existing backend:
lsof -ti:8000 | xargs kill -9

# Start fresh:
python3 backend_server.py

# You should see:
# ✅ Model loaded successfully
# ✅ Database connection pool initialized: pneumai_db@localhost:5432
# INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 6: Add Database Endpoints to Backend

**File:** `backend_server.py`

**Add these imports at the top (after existing imports):**
```python
from database import (
    create_patient, get_patient, get_all_patients, update_patient, delete_patient,
    create_scan, get_scan, get_patient_scans,
    create_appointment, get_patient_appointments,
    create_message, get_user_messages,
    get_all_doctors, get_doctor
)
```

**Add these endpoints before `if __name__ == "__main__"`:**

```python
# ==================== PATIENT ENDPOINTS ====================

@app.post("/api/v1/patients")
async def create_patient_endpoint(patient: dict):
    """Create a new patient"""
    try:
        result = create_patient(patient)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/patients/{patient_id}")
async def get_patient_endpoint(patient_id: str):
    """Get patient by ID"""
    patient = get_patient(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return JSONResponse(content=patient)

@app.get("/api/v1/patients")
async def get_all_patients_endpoint():
    """Get all patients"""
    patients = get_all_patients()
    return JSONResponse(content=patients)

@app.patch("/api/v1/patients/{patient_id}")
async def update_patient_endpoint(patient_id: str, updates: dict):
    """Update patient information"""
    result = update_patient(patient_id, updates)
    if not result:
        raise HTTPException(status_code=404, detail="Patient not found")
    return JSONResponse(content=result)

@app.delete("/api/v1/patients/{patient_id}")
async def delete_patient_endpoint(patient_id: str):
    """Delete a patient"""
    success = delete_patient(patient_id)
    if not success:
        raise HTTPException(status_code=404, detail="Patient not found")
    return JSONResponse(content={"success": True})


# ==================== SCAN ENDPOINTS ====================

@app.get("/api/v1/scans/{scan_id}")
async def get_scan_endpoint(scan_id: str):
    """Get scan by ID from database"""
    scan = get_scan(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return JSONResponse(content=scan)

@app.get("/api/v1/patients/{patient_id}/scans")
async def get_patient_scans_endpoint(patient_id: str):
    """Get all scans for a patient"""
    scans = get_patient_scans(patient_id)
    return JSONResponse(content=scans)


# ==================== APPOINTMENT ENDPOINTS ====================

@app.post("/api/v1/appointments")
async def create_appointment_endpoint(appointment: dict):
    """Create a new appointment"""
    try:
        result = create_appointment(appointment)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/patients/{patient_id}/appointments")
async def get_patient_appointments_endpoint(patient_id: str):
    """Get all appointments for a patient"""
    appointments = get_patient_appointments(patient_id)
    return JSONResponse(content=appointments)


# ==================== MESSAGE ENDPOINTS ====================

@app.post("/api/v1/messages")
async def create_message_endpoint(message: dict):
    """Create a new message"""
    try:
        result = create_message(message)

        # Broadcast new message via WebSocket
        await manager.broadcast({
            "type": "new_message",
            "data": result
        })

        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/users/{user_id}/messages")
async def get_user_messages_endpoint(user_id: str):
    """Get all messages for a user"""
    messages = get_user_messages(user_id)
    return JSONResponse(content=messages)


# ==================== DOCTOR ENDPOINTS ====================

@app.get("/api/v1/doctors")
async def get_all_doctors_endpoint():
    """Get all doctors"""
    doctors = get_all_doctors()
    return JSONResponse(content=doctors)

@app.get("/api/v1/doctors/{doctor_id}")
async def get_doctor_endpoint(doctor_id: str):
    """Get doctor by ID"""
    doctor = get_doctor(doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return JSONResponse(content=doctor)
```

### Step 7: Modify Scan Analysis to Save to Database

**File:** `backend_server.py`

**Find the `analyze_scan` function (around line 353) and modify it:**

**Current code (around line 376-401):**
```python
        # Generate scan ID and store results
        scan_id = generate_scan_id()
        scan_images[scan_id] = {
            "original": image,
            "detections": results["detections"]
        }

        # Create response
        base_url = "http://localhost:8000"
        response_data = {
            "scanId": scan_id,
            "status": "completed",
            "uploadTime": datetime.utcnow().isoformat(),
            "processingTime": round(processing_time, 3),
            "results": {
                "detected": results["detected"],
                "confidence": results["confidence"],
                "topClass": results["topClass"],
                "riskLevel": results["riskLevel"],
                "detections": results["detections"],
                "imageSize": results["imageSize"],
                "imageUrl": f"{base_url}/api/v1/scan/{scan_id}/image",
                "annotatedImageUrl": f"{base_url}/api/v1/scan/{scan_id}/annotated"
            }
        }
```

**Replace with:**
```python
        # Generate scan ID and store results
        scan_id = generate_scan_id()
        scan_images[scan_id] = {
            "original": image,
            "detections": results["detections"]
        }

        # Create response
        base_url = "http://localhost:8000"
        response_data = {
            "scanId": scan_id,
            "status": "completed",
            "uploadTime": datetime.now().isoformat(),
            "processingTime": round(processing_time, 3),
            "results": {
                "detected": results["detected"],
                "confidence": results["confidence"],
                "topClass": results["topClass"],
                "riskLevel": results["riskLevel"],
                "detections": results["detections"],
                "imageSize": results["imageSize"],
                "imageUrl": f"{base_url}/api/v1/scan/{scan_id}/image",
                "annotatedImageUrl": f"{base_url}/api/v1/scan/{scan_id}/annotated"
            }
        }

        # Save to database
        try:
            # Convert image to bytes for storage
            success, encoded = cv2.imencode('.jpg', image)
            image_bytes = encoded.tobytes() if success else b''

            create_scan(response_data, results["detections"], image_bytes)
            print(f"✓ Scan {scan_id} saved to database")
        except Exception as e:
            print(f"⚠ Warning: Could not save scan to database: {e}")
            # Continue even if database save fails
```

### Step 8: Test Database Integration

```bash
# 1. Restart backend
lsof -ti:8000 | xargs kill -9
python3 backend_server.py

# 2. Test patient creation
curl -X POST http://localhost:8000/api/v1/patients \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test_patient_001",
    "name": "Test Patient",
    "email": "test@example.com",
    "phone": "555-0123",
    "dateOfBirth": "1990-01-01",
    "gender": "Male",
    "medicalHistory": "Test history"
  }'

# 3. Test retrieving patient
curl http://localhost:8000/api/v1/patients/test_patient_001

# 4. Test getting all patients
curl http://localhost:8000/api/v1/patients

# 5. Upload a scan through the UI and check database
psql -U postgres -d pneumai_db -c "SELECT id, status, detected FROM scans;"
```

### Success Criteria:
✅ Backend starts without errors
✅ Can create patient via API
✅ Can retrieve patient data
✅ Uploaded scans appear in database
✅ Data persists after page refresh

---

## 📋 TASK 2: Notification System

### Overview:
Add real-time notifications for new scans, messages, and appointments.

### Step 1: Add Notifications Table

```sql
-- Run this in psql:
psql -U postgres -d pneumai_db

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    user_role VARCHAR(20) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link VARCHAR(255),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

### Step 2: Add Notification Functions to database.py

**File:** `database.py`

**Add at the end of the file:**

```python
def create_notification(notification_data: Dict) -> Dict:
    """Create a new notification"""
    query = """
        INSERT INTO notifications (
            id, user_id, user_role, type, title, message, link
        ) VALUES (
            %(id)s, %(userId)s, %(userRole)s, %(type)s,
            %(title)s, %(message)s, %(link)s
        ) RETURNING *
    """
    Database.execute(query, notification_data, fetch="none")

    get_query = "SELECT * FROM notifications WHERE id = %s"
    return Database.execute(get_query, (notification_data['id'],), fetch="one")


def get_user_notifications(user_id: str, unread_only: bool = False) -> List[Dict]:
    """Get notifications for a user"""
    if unread_only:
        query = """
            SELECT * FROM notifications
            WHERE user_id = %s AND read = FALSE
            ORDER BY created_at DESC
        """
    else:
        query = """
            SELECT * FROM notifications
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT 50
        """
    return Database.execute(query, (user_id,), fetch="all")


def mark_notification_read(notification_id: str) -> bool:
    """Mark a notification as read"""
    query = "UPDATE notifications SET read = TRUE WHERE id = %s"
    Database.execute(query, (notification_id,), fetch="none")
    return True


def mark_all_notifications_read(user_id: str) -> bool:
    """Mark all notifications as read for a user"""
    query = "UPDATE notifications SET read = TRUE WHERE user_id = %s AND read = FALSE"
    Database.execute(query, (user_id,), fetch="none")
    return True


def get_notification_count(user_id: str) -> int:
    """Get unread notification count for a user"""
    query = "SELECT COUNT(*) as count FROM notifications WHERE user_id = %s AND read = FALSE"
    result = Database.execute(query, (user_id,), fetch="one")
    return result['count'] if result else 0
```

### Step 3: Add Notification Endpoints to Backend

**File:** `backend_server.py`

**Add these endpoints:**

```python
# ==================== NOTIFICATION ENDPOINTS ====================

@app.post("/api/v1/notifications")
async def create_notification_endpoint(notification: dict):
    """Create a new notification"""
    from database import create_notification
    try:
        # Add unique ID
        import uuid
        notification['id'] = f"notif_{uuid.uuid4().hex[:12]}"

        result = create_notification(notification)

        # Broadcast to user via WebSocket
        await manager.broadcast({
            "type": "new_notification",
            "data": result,
            "userId": notification['userId']
        })

        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/users/{user_id}/notifications")
async def get_user_notifications_endpoint(user_id: str, unread_only: bool = False):
    """Get notifications for a user"""
    from database import get_user_notifications
    notifications = get_user_notifications(user_id, unread_only)
    return JSONResponse(content=notifications)


@app.get("/api/v1/users/{user_id}/notifications/count")
async def get_notification_count_endpoint(user_id: str):
    """Get unread notification count"""
    from database import get_notification_count
    count = get_notification_count(user_id)
    return JSONResponse(content={"count": count})


@app.patch("/api/v1/notifications/{notification_id}/read")
async def mark_notification_read_endpoint(notification_id: str):
    """Mark notification as read"""
    from database import mark_notification_read
    success = mark_notification_read(notification_id)
    return JSONResponse(content={"success": success})


@app.patch("/api/v1/users/{user_id}/notifications/read-all")
async def mark_all_notifications_read_endpoint(user_id: str):
    """Mark all notifications as read"""
    from database import mark_all_notifications_read
    success = mark_all_notifications_read(user_id)
    return JSONResponse(content={"success": success})
```

### Step 4: Modify Scan Analysis to Create Notification

**File:** `backend_server.py`

**In the `analyze_scan` function, after saving to database:**

```python
        # Save to database
        try:
            # ... existing database save code ...

            # Create notification for admin/doctors
            from database import create_notification, get_all_doctors
            import uuid

            notification_data = {
                'id': f"notif_{uuid.uuid4().hex[:12]}",
                'userId': 'admin',  # You can make this dynamic
                'userRole': 'admin',
                'type': 'scan_completed',
                'title': 'New CT Scan Analyzed',
                'message': f'Scan {scan_id} analysis completed. Result: {results["topClass"]}',
                'link': f'/scans/{scan_id}'
            }
            create_notification(notification_data)

        except Exception as e:
            print(f"⚠ Warning: Could not create notification: {e}")
```

### Step 5: Create React Notification Hook

**File:** `src/hooks/useNotifications.js` (CREATE NEW FILE)

```javascript
import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../context/WebSocketContext';

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { lastMessage } = useWebSocket();

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`http://localhost:8000/api/v1/users/${userId}/notifications`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`http://localhost:8000/api/v1/users/${userId}/notifications/count`);
      const data = await response.json();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  }, [userId]);

  // Mark as read
  const markAsRead = async (notificationId) => {
    try {
      await fetch(`http://localhost:8000/api/v1/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      await fetch(`http://localhost:8000/api/v1/users/${userId}/notifications/read-all`, {
        method: 'PATCH'
      });

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Listen for WebSocket notifications
  useEffect(() => {
    if (lastMessage?.type === 'new_notification' && lastMessage?.userId === userId) {
      setNotifications(prev => [lastMessage.data, ...prev]);
      setUnreadCount(prev => prev + 1);
    }
  }, [lastMessage, userId]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
};
```

### Step 6: Create Notification Bell Component

**File:** `src/components/NotificationBell.jsx` (CREATE NEW FILE)

```javascript
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const NotificationBell = ({ userId }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '10px',
          width: '350px',
          maxHeight: '400px',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.link) {
                      window.location.href = notification.link;
                    }
                  }}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    background: notification.read ? 'white' : '#eff6ff',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = notification.read ? 'white' : '#eff6ff'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '14px' }}>{notification.title}</strong>
                    {!notification.read && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        background: '#3b82f6',
                        borderRadius: '50%'
                      }} />
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                    {notification.message}
                  </p>
                  <small style={{ color: '#9ca3af', fontSize: '12px' }}>
                    {new Date(notification.created_at).toLocaleString()}
                  </small>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
```

### Step 7: Add Notification Bell to Dashboards

**File:** `src/AdminDashboardModern.jsx`

**Replace the static bell button (around line 123):**

```javascript
import NotificationBell from './components/NotificationBell';

// Replace:
<button className="topbar-button">
  <Bell className="topbar-icon" />
</button>

// With:
<NotificationBell userId="admin" />
```

### Success Criteria:
✅ Notification table created
✅ Notifications created when scans complete
✅ Bell icon shows unread count
✅ Dropdown shows notification list
✅ Real-time notifications via WebSocket
✅ Can mark as read
✅ Can mark all as read

---

## 📋 TASK 3: Enhanced Messaging System

### Step 1: Update Messages Table

```sql
-- Run in psql:
psql -U postgres -d pneumai_db

-- Add new columns to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to VARCHAR(50);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add index for threading
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to);
```

### Step 2: Update Message Functions

**File:** `database.py`

**Replace existing message functions with enhanced versions:**

```python
def create_message(message_data: Dict) -> Dict:
    """Create a new message"""
    query = """
        INSERT INTO messages (
            id, sender_id, sender_name, sender_role,
            receiver_id, receiver_name, content, reply_to
        ) VALUES (
            %(id)s, %(senderId)s, %(senderName)s, %(senderRole)s,
            %(receiverId)s, %(receiverName)s, %(content)s, %(replyTo)s
        ) RETURNING *
    """
    # Add default for replyTo if not present
    if 'replyTo' not in message_data:
        message_data['replyTo'] = None

    Database.execute(query, message_data, fetch="none")

    get_query = "SELECT * FROM messages WHERE id = %s"
    return Database.execute(get_query, (message_data['id'],), fetch="one")


def mark_message_read(message_id: str) -> bool:
    """Mark a message as read"""
    query = """
        UPDATE messages
        SET read = TRUE, read_at = CURRENT_TIMESTAMP
        WHERE id = %s
    """
    Database.execute(query, (message_id,), fetch="none")
    return True


def get_conversation_thread(message_id: str) -> List[Dict]:
    """Get all messages in a conversation thread"""
    # First, find the root message
    query = """
        WITH RECURSIVE thread AS (
            SELECT * FROM messages WHERE id = %s
            UNION
            SELECT m.* FROM messages m
            INNER JOIN thread t ON m.reply_to = t.id OR m.id = t.reply_to
        )
        SELECT DISTINCT * FROM thread
        ORDER BY created_at ASC
    """
    return Database.execute(query, (message_id,), fetch="all")


def get_unread_message_count(user_id: str) -> int:
    """Get unread message count for a user"""
    query = """
        SELECT COUNT(*) as count
        FROM messages
        WHERE receiver_id = %s AND read = FALSE
    """
    result = Database.execute(query, (user_id,), fetch="one")
    return result['count'] if result else 0


def search_messages(user_id: str, search_term: str) -> List[Dict]:
    """Search messages for a user"""
    query = """
        SELECT * FROM messages
        WHERE (sender_id = %s OR receiver_id = %s)
        AND content ILIKE %s
        ORDER BY created_at DESC
        LIMIT 50
    """
    search_pattern = f"%{search_term}%"
    return Database.execute(query, (user_id, user_id, search_pattern), fetch="all")
```

### Step 3: Add Message Endpoints

**File:** `backend_server.py`

**Update existing message endpoints and add new ones:**

```python
# ==================== MESSAGE ENDPOINTS ====================

@app.post("/api/v1/messages")
async def create_message_endpoint(message: dict):
    """Create a new message"""
    from database import create_message, create_notification
    import uuid

    try:
        # Add unique ID
        message['id'] = f"msg_{uuid.uuid4().hex[:12]}"

        result = create_message(message)

        # Create notification for receiver
        notification_data = {
            'id': f"notif_{uuid.uuid4().hex[:12]}",
            'userId': message['receiverId'],
            'userRole': 'patient',  # Determine from receiver
            'type': 'new_message',
            'title': f'New message from {message["senderName"]}',
            'message': message['content'][:100] + ('...' if len(message['content']) > 100 else ''),
            'link': '/messages'
        }
        create_notification(notification_data)

        # Broadcast new message via WebSocket
        await manager.broadcast({
            "type": "new_message",
            "data": result,
            "receiverId": message['receiverId']
        })

        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/users/{user_id}/messages")
async def get_user_messages_endpoint(user_id: str):
    """Get all messages for a user"""
    from database import get_user_messages
    messages = get_user_messages(user_id)
    return JSONResponse(content=messages)


@app.get("/api/v1/users/{user_id}/messages/unread-count")
async def get_unread_message_count_endpoint(user_id: str):
    """Get unread message count"""
    from database import get_unread_message_count
    count = get_unread_message_count(user_id)
    return JSONResponse(content={"count": count})


@app.patch("/api/v1/messages/{message_id}/read")
async def mark_message_read_endpoint(message_id: str):
    """Mark message as read"""
    from database import mark_message_read
    success = mark_message_read(message_id)
    return JSONResponse(content={"success": success})


@app.get("/api/v1/messages/thread/{message_id}")
async def get_conversation_thread_endpoint(message_id: str):
    """Get conversation thread"""
    from database import get_conversation_thread
    thread = get_conversation_thread(message_id)
    return JSONResponse(content=thread)


@app.get("/api/v1/users/{user_id}/messages/search")
async def search_messages_endpoint(user_id: str, q: str):
    """Search messages"""
    from database import search_messages
    results = search_messages(user_id, q)
    return JSONResponse(content=results)
```

---

## 🚀 QUICK REFERENCE

### Common Commands:

```bash
# Database
psql -U postgres -d pneumai_db                    # Connect to database
\dt                                                # List tables
\d table_name                                      # Describe table
SELECT COUNT(*) FROM patients;                     # Count records

# Backend
lsof -ti:8000 | xargs kill -9                     # Kill backend
python3 backend_server.py                          # Start backend

# Frontend
npm start                                          # Start frontend (already running)

# Test API
curl http://localhost:8000/api/v1/patients        # Get all patients
curl http://localhost:8000/api/v1/doctors         # Get all doctors
```

### File Locations:
- Backend: `/Users/monskiemonmon427/YOLO12ELCDPPCC-1/backend_server.py`
- Database Utils: `/Users/monskiemonmon427/YOLO12ELCDPPCC-1/database.py`
- Schema: `/Users/monskiemonmon427/YOLO12ELCDPPCC-1/database_schema.sql`
- Frontend: `/Users/monskiemonmon427/YOLO12ELCDPPCC-1/src/`

### Important Notes:
1. Always restart backend after code changes
2. Test database connection before adding endpoints
3. Use WebSocket for real-time features
4. Follow existing code patterns
5. Add error handling to all functions

---

## ✅ COMPLETION CHECKLIST

### Task 1: Database ✓
- [ ] PostgreSQL installed and running
- [ ] Database `pneumai_db` created
- [ ] Schema executed successfully
- [ ] Backend connects to database
- [ ] Patient CRUD endpoints working
- [ ] Scan saves to database
- [ ] Data persists across restarts

### Task 2: Notifications ✓
- [ ] Notifications table created
- [ ] Notification functions added to database.py
- [ ] Notification endpoints in backend
- [ ] NotificationBell component created
- [ ] Bell shows in admin dashboard
- [ ] Unread count displays correctly
- [ ] Real-time notifications work
- [ ] Can mark as read

### Task 3: Enhanced Messaging ✓
- [ ] Messages table updated with new columns
- [ ] Message threading works
- [ ] Read receipts functional
- [ ] Message search implemented
- [ ] Real-time message delivery
- [ ] Message composer UI created

---

**Good luck with the implementation! Follow the steps in order for best results.**

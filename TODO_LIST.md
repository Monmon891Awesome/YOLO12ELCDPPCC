# PneumAI Platform - TODO List

**Last Updated:** November 11, 2025

---

## 🎯 PRIORITY 1: CORE FUNCTIONALITY (Critical)

### 1. PostgreSQL Database Connection
**Status:** 🔴 NOT STARTED | **Time:** 2-3 hours | **Difficulty:** Medium

**Tasks:**
- [ ] Create PostgreSQL database: `CREATE DATABASE pneumai_db;`
- [ ] Run schema: `psql -U postgres -d pneumai_db -f database_schema.sql`
- [ ] Update `backend_server.py` to initialize database on startup
- [ ] Test database connection
- [ ] Integrate `database.py` functions into API endpoints
- [ ] Replace localStorage with PostgreSQL calls in frontend

**Files to Modify:**
- `backend_server.py` (add Database.initialize())
- `src/utils/localDataManager.js` (replace with API calls)
- `src/utils/patientDataManager.js` (replace with API calls)

**Test Checklist:**
- [ ] Can create patient in database
- [ ] Can retrieve patient data
- [ ] Scan results persist after page refresh
- [ ] Multiple users can access same data

---

### 2. Notification System
**Status:** 🔴 NOT STARTED | **Time:** 3-4 hours | **Difficulty:** Medium

**Tasks:**
- [ ] Create `notifications` table in database
- [ ] Add notification API endpoints in backend
- [ ] Create `NotificationContext.jsx` in React
- [ ] Add notification bell with badge to all dashboards
- [ ] Implement notification dropdown menu
- [ ] Connect to WebSocket for real-time notifications
- [ ] Add "mark as read" functionality

**Database Schema:**
```sql
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Notification Types:**
- `scan_completed` - New CT scan processed
- `new_message` - New message received
- `appointment_scheduled` - New appointment created
- `appointment_reminder` - Upcoming appointment

**Files to Create:**
- `src/context/NotificationContext.jsx`
- `src/components/NotificationBell.jsx`
- `src/components/NotificationDropdown.jsx`

**Files to Modify:**
- `backend_server.py` (add notification endpoints)
- `src/AdminDashboardModern.jsx` (replace static bell)
- `src/PatientDashboard.jsx` (add notification bell)

---

### 3. Enhanced Messaging System
**Status:** 🔴 NOT STARTED | **Time:** 4-6 hours | **Difficulty:** High

**Tasks:**
- [ ] Add message threading (reply-to field in database)
- [ ] Implement read receipts (read_at timestamp)
- [ ] Create message composer component
- [ ] Add message pagination (load more)
- [ ] Add message search functionality
- [ ] Add real-time message delivery via WebSocket
- [ ] Support emoji/reactions (optional)

**Backend API Endpoints:**
```python
POST   /api/v1/messages              # Send message
GET    /api/v1/messages/{user_id}    # Get user messages
PATCH  /api/v1/messages/{msg_id}/read # Mark as read
GET    /api/v1/messages/thread/{id}  # Get conversation thread
```

**WebSocket Events:**
```javascript
{ type: "new_message", data: { messageId, senderId, content } }
{ type: "message_read", data: { messageId, readBy, readAt } }
```

**Files to Create:**
- `src/components/MessageComposer.jsx`
- `src/components/MessageThread.jsx`

**Files to Modify:**
- `backend_server.py` (add message endpoints)
- `src/AdminDashboardModern.jsx` (enhance Messages tab)
- `src/PatientDashboard.jsx` (add messaging UI)
- `database.py` (update message functions)

---

## 🎯 PRIORITY 2: FILE MANAGEMENT & DATA EDITING

### 4. Admin File Management System
**Status:** 🔴 NOT STARTED | **Time:** 3-4 hours | **Difficulty:** Medium

**Tasks:**
- [ ] Add "Files" tab to Admin Dashboard
- [ ] Display all uploaded CT scans in grid/list view
- [ ] Show file metadata (patient, date, size, status)
- [ ] Add search and filter functionality
- [ ] Implement file download
- [ ] Add file deletion with confirmation dialog
- [ ] Show storage statistics

**UI Mockup:**
```
┌─────────────────────────────────────┐
│ Files (156)            [+ Upload]   │
├─────────────────────────────────────┤
│ 🔍 Search...    Filter: [All ▼]    │
├─────────────────────────────────────┤
│ ┌──────┐  Scan_001.jpg             │
│ │ IMG  │  Patient: John Doe         │
│ └──────┘  Date: Nov 10, 2025        │
│           Size: 2.4 MB  [View][Del] │
├─────────────────────────────────────┤
│ Storage: 245 MB / 10 GB (2.4%)     │
└─────────────────────────────────────┘
```

**Files to Modify:**
- `src/AdminDashboardModern.jsx` (add Files tab)
- `backend_server.py` (add file management endpoints)

---

### 5. Make Dummy Data Editable
**Status:** 🔴 NOT STARTED | **Time:** 2-3 hours | **Difficulty:** Low

**Tasks:**
- [ ] Add "Edit" button to patient list in Admin Dashboard
- [ ] Create patient edit modal/form
- [ ] Add "Edit" button to doctor cards
- [ ] Create doctor edit form
- [ ] Add appointment editing functionality
- [ ] Add validation for all forms
- [ ] Show success/error toasts
- [ ] Add "Reset to Demo Data" button in Settings

**Files to Modify:**
- `src/AdminDashboardModern.jsx` (add edit buttons)
- `src/utils/localDataManager.js` (add update functions)

---

## 🎯 PRIORITY 3: DOCTOR DASHBOARD REDESIGN

### 6. Redesign Doctor's Dashboard
**Status:** 🔴 NOT STARTED | **Time:** 6-8 hours | **Difficulty:** High

**Current Issues:**
- Unclear information hierarchy
- Missing quick actions
- No dark mode
- Outdated design compared to Admin Modern

**Redesign Goals:**
- Modern, clean interface (like AdminDashboardModern)
- Quick access to pending scans
- Recent patient list
- Message center
- Calendar view for appointments

**New Components to Create:**
```
DoctorDashboardModern/
├── PendingScans.jsx
├── RecentPatients.jsx
├── MessageCenter.jsx
├── AppointmentCalendar.jsx
└── QuickActions.jsx
```

**Key Features:**
- Dashboard cards with stats
- Pending scan notifications
- Quick action buttons
- Dark mode support
- Responsive design

---

## 🎯 PRIORITY 4: TESTING & QUALITY ASSURANCE

### 7. Methodology Alignment Check
**Status:** 🔴 NOT STARTED | **Time:** 2-3 hours | **Difficulty:** Low

**Tasks:**
- [ ] Review `Methodology.txt` line by line
- [ ] Check against `revised_survey_questionnaire.pdf`
- [ ] Create discrepancy list
- [ ] Update implementation to match methodology
- [ ] Update documentation

**Documents to Review:**
- `Methodology.txt`
- `revised_survey_questionnaire.pdf`
- `SYSTEM_INTEGRATION_DOCUMENTATION.md`

---

### 8. Complete Theme Switcher
**Status:** 🟡 PARTIALLY COMPLETE | **Time:** 1-2 hours | **Difficulty:** Low

**Remaining Tasks:**
- [ ] Store theme preference in database (not localStorage)
- [ ] Apply theme to Patient Dashboard
- [ ] Apply theme to Doctor Dashboard (when redesigned)
- [ ] Test all components in both themes
- [ ] Ensure WCAG 2.1 AA accessibility compliance
- [ ] Add smooth theme transition animations

**Current State:**
- ✅ Admin has Modern/Classic toggle
- ✅ Theme context exists
- ❌ Not persistent across sessions
- ❌ Not applied to all dashboards

---

## 🎯 PRIORITY 5: INFRASTRUCTURE (Optional)

### 9. Redis Caching Layer
**Status:** 🔴 NOT STARTED | **Time:** 2-3 hours | **Difficulty:** Medium

**Tasks:**
- [ ] Install Redis: `brew install redis` (macOS)
- [ ] Install Python Redis client: `pip install redis`
- [ ] Create cache wrapper functions
- [ ] Cache frequently accessed data (patient list, scan results)
- [ ] Set appropriate TTL (Time To Live) values
- [ ] Add cache invalidation logic

**Use Cases:**
- Cache patient list (TTL: 5 minutes)
- Cache scan results (TTL: 1 hour)
- Cache doctor list (TTL: 15 minutes)

---

### 10. Nginx Reverse Proxy
**Status:** 🔴 NOT STARTED | **Time:** 2-4 hours | **Difficulty:** Medium

**Tasks:**
- [ ] Install Nginx
- [ ] Create Nginx configuration file
- [ ] Set up reverse proxy for backend API
- [ ] Configure WebSocket proxying
- [ ] Set up static file serving
- [ ] Test HTTPS (if needed)
- [ ] Document setup process

**Benefits:**
- Better performance for static files
- Load balancing (future)
- HTTPS termination
- Request rate limiting

---

## 📊 QUICK WINS (Can Do Anytime)

### Easy Improvements:
- [ ] Fix ESLint warnings (remove unused imports)
- [ ] Replace deprecated `datetime.utcnow()` with `datetime.now(datetime.UTC)`
- [ ] Add loading spinners to all async operations
- [ ] Add error boundaries in React components
- [ ] Add file size validation for uploads (max 10MB)
- [ ] Add tooltips to all icon buttons
- [ ] Improve error messages (make them user-friendly)
- [ ] Add "Copy scan ID" button

---

## 🚦 STATUS LEGEND

- 🔴 **NOT STARTED** - Task not begun
- 🟡 **IN PROGRESS** - Currently working on
- 🟢 **COMPLETED** - Task finished and tested
- ⚪ **BLOCKED** - Waiting on dependency

---

## 📈 PROGRESS TRACKING

### Overall Completion: 15%

**Completed:**
- ✅ WebSocket infrastructure (Real-time updates)
- ✅ Annotation system (YOLO + Edge + Contour)
- ✅ Admin dashboard fixes
- ✅ Database schema design

**In Progress:**
- None currently

**Next Up:**
- 🎯 PostgreSQL database connection (Recommended)
- 🎯 Notification system
- 🎯 Enhanced messaging

---

## 🔄 RECOMMENDED WORKFLOW

### Week 1: Foundation
1. Initialize PostgreSQL database
2. Connect backend to database
3. Test data persistence
4. Implement notification system

### Week 2: Features
5. Enhance messaging system
6. Add file management for admin
7. Make dummy data editable

### Week 3: Polish
8. Redesign doctor's dashboard
9. Complete theme switcher
10. Methodology alignment check

### Week 4: Infrastructure
11. Add Redis caching (optional)
12. Set up Nginx (optional)
13. Final testing and documentation

---

## 📞 NEED HELP?

**Common Issues:**
- **Database won't connect:** Check PostgreSQL is running: `brew services list`
- **WebSocket disconnects:** Check CORS settings in backend
- **Build errors:** Delete `node_modules` and run `npm install`

**Resources:**
- FastAPI Docs: https://fastapi.tiangolo.com/
- PostgreSQL Docs: https://www.postgresql.org/docs/
- React Docs: https://react.dev/

---

**Ready to start?** Pick a task from Priority 1 and let's begin! 🚀

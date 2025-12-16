# PneumAI Local Deployment Guide

## 🎯 Overview
This guide will help you deploy PneumAI locally with persistent data storage using localStorage. Perfect for testing and development before deploying to production.

---

## 📋 Prerequisites

- **Node.js**: v14 or higher
- **npm**: v6 or higher
- **Git**: For cloning the repository
- **Web Browser**: Chrome, Firefox, Safari, or Edge

---

## 🚀 Quick Start (3 Steps)

### 1. Clone and Install
```bash
# Clone the repository
git clone https://github.com/Monmon891Awesome/YOLO12ELCDPPCC.git
cd YOLO12ELCDPPCC

# Install dependencies
npm install
```

### 2. Start Development Server
```bash
npm start
```

The app will automatically open at `http://localhost:3000`

### 3. Login with Demo Accounts

**Admin Account:**
- Email: `admin@pneumai.com`
- Password: `admin123`

**Demo Doctor Accounts:**
- Email: `sarah.chen@pneumai.com` | Password: `doctor123`
- Email: `michael.torres@pneumai.com` | Password: `doctor123`
- Email: `emily.rodriguez@pneumai.com` | Password: `doctor123`

---

## 📊 Data Persistence System

PneumAI uses a sophisticated localStorage-based data management system for local deployments.

### What Data is Stored?

| Data Type | Storage Key | Description |
|-----------|-------------|-------------|
| **Users** | `pneumAIUsers` | All user accounts (patients, doctors, admin) |
| **Doctors** | `pneumAIDoctors` | Doctor profiles and credentials |
| **Patients** | `pneumAIPatients` | Patient records and medical history |
| **Scans** | `pneumAIScans` | CT scan data and analysis results |
| **Session** | `pneumAISession` | Current user session (auto-login) |
| **Settings** | `pneumAISettings` | App configuration |
| **App Data** | `pneumAIAppData` | Database version and initialization status |

### Data Initialization

When you first load the app, it automatically initializes with demo data:
- ✅ 1 Admin account
- ✅ 3 Demo doctors
- ✅ 5 Demo patients with sample medical records
- ✅ Demo statistics

This happens automatically on first run and won't overwrite existing data.

---

## 🔐 Default Accounts

### Admin Dashboard Access
```
Email: admin@pneumai.com
Password: admin123
```

**Capabilities:**
- View all patients and doctors
- Create/delete doctor accounts
- Export/import data backups
- Initialize demo data
- View system statistics

### Doctor Dashboard Access
```
Dr. Sarah Chen
Email: sarah.chen@pneumai.com
Password: doctor123

Dr. Michael Torres
Email: michael.torres@pneumai.com
Password: doctor123

Dr. Emily Rodriguez
Email: emily.rodriguez@pneumai.com
Password: doctor123
```

**Capabilities:**
- View assigned patients
- Review CT scans
- Add analysis notes
- Generate reports

### Patient Account
Currently, new patients can register through the "Register" button on the login page.

---

## 💾 Data Management Features

### Export Data Backup

1. Login as **Admin** (`admin@pneumai.com`)
2. Navigate to **Dashboard** tab
3. Click **"Export Backup"** button
4. A JSON file will download: `pneumai-backup-YYYY-MM-DD.json`

This file contains ALL your data:
- Users
- Doctors
- Patients
- Scans
- Settings

### Import Data Backup

1. Login as **Admin**
2. Navigate to **Dashboard** tab
3. Click **"Import Data"** button
4. Select your previously exported JSON file
5. Data will be restored instantly

**⚠️ Warning**: Importing will overwrite all existing data!

### Initialize Demo Data

If you want to reset to demo data:

1. Login as **Admin**
2. Navigate to **Dashboard** tab
3. Click **"Initialize Demo Data"** button
4. Confirm the action
5. Demo data will be added (won't duplicate existing records)

---

## 🏗️ Project Structure

```
YOLO12ELCDPPCC-1/
├── public/
│   └── assets/              # Images and static assets
│       ├── ai-doc1.jpg
│       ├── ai-doc2.jpg
│       ├── ai-doc3.png
│       ├── logo-medic.jpg
│       └── lungs.png
├── src/
│   ├── components/          # React components
│   ├── services/            # API services
│   ├── utils/
│   │   └── localDataManager.js  # 🔑 Data persistence system
│   ├── AdminDashboard.jsx   # Admin interface
│   ├── DoctorDashboard.jsx  # Doctor interface
│   ├── PatientDashboard.jsx # Patient interface
│   ├── PneumAIUI.jsx        # Landing page
│   ├── Login.jsx            # Authentication
│   └── PatientRegistration.jsx
├── DATA_PERSISTENCE_PLAN.md # Backend migration roadmap
├── LOCAL_DEPLOYMENT_GUIDE.md # This file
└── package.json
```

---

## 🛠️ Common Tasks

### Create a New Doctor Account

1. Login as **Admin**
2. Go to **Doctors** tab
3. Click **"Add New Doctor"**
4. Fill in the form:
   - Name
   - Email
   - Password (min 8 characters)
   - Role (General Practitioner, Medical Specialist, etc.)
   - Phone (optional)
   - Profile Image (select from dropdown)
5. Click **"Create Doctor"**

The doctor can now login with their email and password!

### Register a New Patient

1. On the landing page, click **"Sign In"**
2. Click **"Register as Patient"**
3. Fill in the registration form
4. Click **"Complete Registration"**
5. Patient account is created and they can login

### View All Data in Browser Console

Open browser console (F12) and run:

```javascript
// View all users
JSON.parse(localStorage.getItem('pneumAIUsers'))

// View all doctors
JSON.parse(localStorage.getItem('pneumAIDoctors'))

// View all patients
JSON.parse(localStorage.getItem('pneumAIPatients'))

// View current session
JSON.parse(localStorage.getItem('pneumAISession'))
```

---

## 🔄 Data Persistence Across Sessions

### How Auto-Login Works

When you login, PneumAI saves your session:

```javascript
{
  userType: "admin|doctor|patient",
  username: "Your Name"
}
```

Next time you open the app, you're automatically logged in!

To logout:
- Click the **"Logout"** button in any dashboard
- This clears your session

### How Data Survives Page Refreshes

All data is stored in `localStorage`, which:
- ✅ Persists across browser sessions
- ✅ Survives page refreshes
- ✅ Survives browser restarts
- ❌ Is browser-specific (different browsers = different data)
- ❌ Is device-specific (different devices = different data)
- ❌ Can be cleared by user (browser settings)

**Pro Tip**: Always export backups before clearing browser data!

---

## 🧪 Testing Data Persistence

### Test 1: Create Doctor Account
1. Login as admin
2. Create a new doctor
3. Logout
4. Refresh the page
5. Login as admin again
6. ✅ Doctor should still be there

### Test 2: Auto-Login
1. Login as admin
2. Close the browser tab
3. Reopen `http://localhost:3000`
4. ✅ Should be automatically logged in

### Test 3: Export/Import
1. Login as admin
2. Create some data (doctors, patients)
3. Export backup
4. Open browser console (F12)
5. Run: `localStorage.clear()`
6. Refresh page
7. Login as admin
8. Import your backup
9. ✅ All data should be restored

---

## 📦 Building for Production

### Create Production Build

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

### Serve Locally

```bash
# Install serve (one-time)
npm install -g serve

# Serve the build
serve -s build
```

Your app will be available at `http://localhost:3000` (or another port if 3000 is taken).

### Deploy Build Folder

The `build/` folder can be deployed to:
- **Vercel**: Drag and drop deployment
- **Netlify**: Drag and drop deployment
- **GitHub Pages**: Free hosting
- **Any static host**: Just upload the folder

**Important**: Data (localStorage) won't transfer between deployments. Always export backups!

---

## 🚨 Troubleshooting

### Issue: "No patients/doctors showing up"

**Solution**: Initialize demo data
1. Login as admin (`admin@pneumai.com`)
2. Go to Dashboard
3. Click "Initialize Demo Data"

### Issue: "Can't login with admin account"

**Solution**: Reset admin account
1. Open browser console (F12)
2. Run:
```javascript
const users = JSON.parse(localStorage.getItem('pneumAIUsers') || '[]');
users.push({
  username: 'Admin',
  email: 'admin@pneumai.com',
  password: 'admin123',
  userType: 'admin',
  registeredAt: new Date().toISOString()
});
localStorage.setItem('pneumAIUsers', JSON.stringify(users));
```
3. Refresh page and try logging in

### Issue: "Data disappeared"

**Possible causes**:
- Browser data/cache was cleared
- Different browser or incognito mode
- Different device

**Solution**:
- Import your backup (if you exported one)
- Or initialize demo data again

### Issue: "App won't start"

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try again
npm start
```

### Issue: "Build fails"

**Solution**:
```bash
# Check Node version
node --version  # Should be v14 or higher

# Clear cache
npm cache clean --force

# Reinstall
rm -rf node_modules
npm install

# Build again
npm run build
```

---

## 📈 Statistics Dashboard

The admin dashboard shows real-time statistics:

- **Total Patients**: Count of all registered patients
- **New This Month**: Patients registered this month
- **Requiring Follow-up**: Patients with "Follow-up Required" status
- **Critical Cases**: Patients with "Urgent" status
- **Scans Processed**: Total CT scans in system
- **Awaiting Review**: Scans with "pending" status

These update automatically when you add/remove data!

---

## 🔐 Security Considerations

### For Local Development

Current security features:
- ✅ Passwords stored in localStorage (client-side)
- ✅ Session management with auto-logout
- ✅ Role-based access (admin/doctor/patient)

**⚠️ Security Limitations**:
- ❌ Passwords NOT encrypted (plaintext in localStorage)
- ❌ Anyone with browser access can view localStorage
- ❌ No server-side validation

**DO NOT use this for production with real patient data!**

### For Production Deployment

See [DATA_PERSISTENCE_PLAN.md](DATA_PERSISTENCE_PLAN.md) for:
- Backend database setup (PostgreSQL)
- Password encryption with bcrypt
- JWT token authentication
- AES-256 encryption for medical data
- HIPAA-compliant hosting options

---

## 🌐 Deploying to Vercel (Free)

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New Project"
4. Select your repository
5. Framework: **Create React App**
6. Click "Deploy"

Done! Your app will be live in ~2 minutes.

**🔗 Example URL**: `https://pneumai-platform.vercel.app`

**⚠️ Important**: Each user's data is stored locally in their browser. Deploying doesn't move data - users start fresh. Use export/import to migrate data.

---

## 📞 Support & Resources

### Documentation
- [DATA_PERSISTENCE_PLAN.md](DATA_PERSISTENCE_PLAN.md) - Backend migration guide
- [IMPROVEMENTS_SUMMARY.md](IMPROVEMENTS_SUMMARY.md) - Change log

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pneumai.com | admin123 |
| Doctor 1 | sarah.chen@pneumai.com | doctor123 |
| Doctor 2 | michael.torres@pneumai.com | doctor123 |
| Doctor 3 | emily.rodriguez@pneumai.com | doctor123 |

### Quick Commands
```bash
# Start development server
npm start

# Build for production
npm run build

# Run linter
npm run lint

# View all localStorage data (in browser console)
Object.keys(localStorage).filter(k => k.startsWith('pneumAI'))
```

---

## ✅ Checklist for Local Deployment

- [ ] Node.js v14+ installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Development server running (`npm start`)
- [ ] Can access app at `http://localhost:3000`
- [ ] Can login as admin (`admin@pneumai.com` / `admin123`)
- [ ] Demo data initialized
- [ ] Can create doctor accounts
- [ ] Can export data backup
- [ ] Can import data backup
- [ ] Production build works (`npm run build`)

---

## 🎉 You're All Set!

Your PneumAI platform is now running locally with persistent data storage!

**Next Steps:**
1. ✅ Explore the admin dashboard
2. ✅ Create doctor accounts
3. ✅ Test patient registration
4. ✅ Export a backup for safety
5. 📖 Read [DATA_PERSISTENCE_PLAN.md](DATA_PERSISTENCE_PLAN.md) for production deployment

**Questions?** Check the troubleshooting section or review the code in `src/utils/localDataManager.js`

---

**Happy Testing! 🚀**

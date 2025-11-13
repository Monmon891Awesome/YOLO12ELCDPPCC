/**
 * Unified Data Manager for PneumAI Platform
 * Centralized localStorage management that works across Patient, Doctor, and Admin dashboards
 * Ensures data congruency and eliminates duplication
 */

// ============ STORAGE KEYS ============
const STORAGE_KEYS = {
  // User & Auth
  USERS: 'pneumai_users',
  SESSION: 'pneumai_session',

  // Medical Staff
  DOCTORS: 'pneumai_doctors',

  // Patients
  PATIENTS: 'pneumai_patients',
  PATIENT_PROFILES: 'pneumai_patient_profiles',

  // Scans (Centralized - accessible by all roles)
  SCANS: 'pneumai_scans',

  // Appointments & Communication
  APPOINTMENTS: 'pneumai_appointments',
  MESSAGES: 'pneumai_messages',

  // System
  SETTINGS: 'pneumai_settings',
  APP_DATA: 'pneumai_app_data'
};

// ============ STORAGE HELPERS ============

function getFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return null;
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    return false;
  }
}

function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
    return false;
  }
}

// ============ DATABASE INITIALIZATION ============

/**
 * Default demo doctors
 */
const DEFAULT_DOCTORS = [
  {
    id: 'DOC-001',
    name: 'Dr. Sarah Miller',
    email: 'sarah.miller@pneumai.com',
    password: 'doctor123',
    specialty: 'Pulmonology',
    phone: '(555) 234-5678',
    image: '/assets/ai-doc1.jpg',
    availability: 'Available weekdays 9AM-5PM',
    yearsOfExperience: 15,
    bio: 'Specialized in respiratory conditions and CT scan interpretation.',
    userType: 'doctor',
    createdAt: new Date().toISOString()
  },
  {
    id: 'DOC-002',
    name: 'Dr. James Rodriguez',
    email: 'james.rodriguez@pneumai.com',
    password: 'doctor123',
    specialty: 'Oncology',
    phone: '(555) 234-5679',
    image: '/assets/ai-doc2.jpg',
    availability: 'Available Mon-Fri 10AM-6PM',
    yearsOfExperience: 12,
    bio: 'Expert in lung cancer diagnosis and treatment planning.',
    userType: 'doctor',
    createdAt: new Date().toISOString()
  },
  {
    id: 'DOC-003',
    name: 'Dr. Emily Chen',
    email: 'emily.chen@pneumai.com',
    password: 'doctor123',
    specialty: 'Radiology',
    phone: '(555) 234-5680',
    image: '/assets/ai-doc3.png',
    availability: 'Available Tue-Sat 8AM-4PM',
    yearsOfExperience: 10,
    bio: 'Radiologist specializing in thoracic imaging and AI-assisted diagnostics.',
    userType: 'doctor',
    createdAt: new Date().toISOString()
  }
];

/**
 * Default admin account
 */
const DEFAULT_ADMIN = {
  username: 'Admin',
  email: 'admin@pneumai.com',
  password: 'admin123',
  userType: 'admin',
  registeredAt: new Date().toISOString()
};

/**
 * Initialize database with default data
 */
export function initializeDatabase() {
  try {
    const appData = getFromStorage(STORAGE_KEYS.APP_DATA);
    if (appData && appData.initialized) {
      console.log('✓ Database already initialized');
      return true;
    }

    // Initialize users
    const existingUsers = getFromStorage(STORAGE_KEYS.USERS) || [];
    const adminExists = existingUsers.some(user => user.email === DEFAULT_ADMIN.email);

    if (!adminExists) {
      existingUsers.push(DEFAULT_ADMIN);
    }

    // Add doctors to users
    DEFAULT_DOCTORS.forEach(doctor => {
      const doctorExists = existingUsers.some(user => user.email === doctor.email);
      if (!doctorExists) {
        existingUsers.push({
          username: doctor.name,
          email: doctor.email,
          password: doctor.password,
          userType: 'doctor',
          specialty: doctor.specialty,
          registeredAt: doctor.createdAt
        });
      }
    });

    saveToStorage(STORAGE_KEYS.USERS, existingUsers);

    // Initialize doctors
    const existingDoctors = getFromStorage(STORAGE_KEYS.DOCTORS) || [];
    if (existingDoctors.length === 0) {
      saveToStorage(STORAGE_KEYS.DOCTORS, DEFAULT_DOCTORS);
    }

    // Initialize empty collections
    if (!getFromStorage(STORAGE_KEYS.PATIENTS)) saveToStorage(STORAGE_KEYS.PATIENTS, []);
    if (!getFromStorage(STORAGE_KEYS.SCANS)) saveToStorage(STORAGE_KEYS.SCANS, []);
    if (!getFromStorage(STORAGE_KEYS.APPOINTMENTS)) saveToStorage(STORAGE_KEYS.APPOINTMENTS, []);
    if (!getFromStorage(STORAGE_KEYS.MESSAGES)) saveToStorage(STORAGE_KEYS.MESSAGES, []);

    // Mark as initialized
    saveToStorage(STORAGE_KEYS.APP_DATA, {
      initialized: true,
      version: '2.0.0',
      lastUpdated: new Date().toISOString()
    });

    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

// ============ SCAN MANAGEMENT (UNIFIED) ============

/**
 * Get all scans (accessible by all roles)
 */
export function getAllScans() {
  return getFromStorage(STORAGE_KEYS.SCANS) || [];
}

/**
 * Get scans by patient ID
 */
export function getScansByPatientId(patientId) {
  const scans = getAllScans();
  return scans.filter(scan => scan.patientId === patientId);
}

/**
 * Get scan by scan ID
 */
export function getScanById(scanId) {
  const scans = getAllScans();
  return scans.find(scan => scan.scanId === scanId);
}

/**
 * Save a new scan (called when patient uploads CT scan)
 */
export function saveScan(scanData) {
  try {
    const scans = getAllScans();

    // Enrich scan with metadata
    const enrichedScan = {
      ...scanData,
      savedAt: new Date().toISOString(),
      // Ensure patientId exists
      patientId: scanData.patientId || getCurrentPatientId() || 'UNKNOWN'
    };

    // Add to beginning (most recent first)
    scans.unshift(enrichedScan);

    // Keep last 100 scans to avoid storage limits
    const trimmedScans = scans.slice(0, 100);

    saveToStorage(STORAGE_KEYS.SCANS, trimmedScans);
    console.log('✅ Scan saved successfully:', enrichedScan.scanId);
    return true;
  } catch (error) {
    console.error('❌ Error saving scan:', error);
    return false;
  }
}

/**
 * Delete a scan
 */
export function deleteScan(scanId) {
  try {
    const scans = getAllScans();
    const filtered = scans.filter(scan => scan.scanId !== scanId);
    saveToStorage(STORAGE_KEYS.SCANS, filtered);
    console.log('✅ Scan deleted:', scanId);
    return true;
  } catch (error) {
    console.error('❌ Error deleting scan:', error);
    return false;
  }
}

/**
 * Update a scan
 */
export function updateScan(scanId, updates) {
  try {
    const scans = getAllScans();
    const index = scans.findIndex(scan => scan.scanId === scanId);

    if (index === -1) {
      throw new Error('Scan not found');
    }

    scans[index] = {
      ...scans[index],
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    saveToStorage(STORAGE_KEYS.SCANS, scans);
    return scans[index];
  } catch (error) {
    console.error('❌ Error updating scan:', error);
    return null;
  }
}

// ============ PATIENT MANAGEMENT ============

/**
 * Get all patients
 */
export function getAllPatients() {
  return getFromStorage(STORAGE_KEYS.PATIENTS) || [];
}

/**
 * Get patient by ID
 */
export function getPatientById(patientId) {
  const patients = getAllPatients();
  return patients.find(p => p.id === patientId);
}

/**
 * Get current patient profile (for logged-in patient)
 */
export function getCurrentPatientProfile() {
  const session = getCurrentSession();
  if (session && session.userType === 'patient') {
    // Check if profile exists in PATIENT_PROFILES
    const profile = getFromStorage(STORAGE_KEYS.PATIENT_PROFILES);
    if (profile) return profile;

    // Fallback to default profile
    return getDefaultPatientProfile();
  }
  return null;
}

/**
 * Get current patient ID from session
 */
function getCurrentPatientId() {
  const session = getCurrentSession();
  if (session && session.userType === 'patient') {
    const profile = getCurrentPatientProfile();
    return profile?.id || 'PAT-UNKNOWN';
  }
  return null;
}

/**
 * Save patient profile
 */
export function savePatientProfile(profile) {
  try {
    saveToStorage(STORAGE_KEYS.PATIENT_PROFILES, profile);

    // Also update in patients list if exists
    const patients = getAllPatients();
    const index = patients.findIndex(p => p.id === profile.id);

    if (index !== -1) {
      patients[index] = {
        ...patients[index],
        fullName: profile.name,
        age: profile.age,
        email: profile.email,
        phone: profile.phone,
        lastUpdated: new Date().toISOString()
      };
      saveToStorage(STORAGE_KEYS.PATIENTS, patients);
    }

    return true;
  } catch (error) {
    console.error('❌ Error saving patient profile:', error);
    return false;
  }
}

/**
 * Default patient profile
 */
function getDefaultPatientProfile() {
  return {
    name: 'Robert Johnson',
    id: 'PAT-2023-8642',
    age: '54 years',
    dateOfBirth: '1971-03-15',
    email: 'robert.johnson@email.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Anytown, USA',
    clinicalNotes: 'Patient presents with persistent cough for 3 months. Former smoker (2 packs/day for 20 years, quit 5 years ago). Family history of lung cancer.',
    medicalHistory: [
      'Former smoker (quit 5 years ago)',
      'Hypertension (controlled)',
      'Family history of lung cancer'
    ],
    emergencyContact: {
      name: 'Mary Johnson',
      relationship: 'Spouse',
      phone: '(555) 123-4568'
    }
  };
}

// ============ DOCTOR MANAGEMENT ============

/**
 * Get all doctors
 */
export function getAllDoctors() {
  return getFromStorage(STORAGE_KEYS.DOCTORS) || DEFAULT_DOCTORS;
}

/**
 * Get doctor by ID
 */
export function getDoctorById(id) {
  const doctors = getAllDoctors();
  return doctors.find(d => d.id === id);
}

/**
 * Create new doctor
 */
export function createDoctor(doctorData) {
  const doctors = getAllDoctors();

  if (doctors.some(d => d.email === doctorData.email)) {
    throw new Error('Doctor with this email already exists');
  }

  const newDoctor = {
    ...doctorData,
    id: doctorData.id || `DOC-${Date.now()}`,
    userType: 'doctor',
    createdAt: new Date().toISOString()
  };

  doctors.push(newDoctor);
  saveToStorage(STORAGE_KEYS.DOCTORS, doctors);

  // Add to users
  const users = getFromStorage(STORAGE_KEYS.USERS) || [];
  users.push({
    username: newDoctor.name,
    email: newDoctor.email,
    password: newDoctor.password,
    userType: 'doctor',
    specialty: newDoctor.specialty,
    registeredAt: newDoctor.createdAt
  });
  saveToStorage(STORAGE_KEYS.USERS, users);

  console.log('✅ Doctor created:', newDoctor.name);
  return newDoctor;
}

/**
 * Delete doctor
 */
export function deleteDoctor(doctorId) {
  try {
    const doctors = getAllDoctors();
    const doctor = doctors.find(d => d.id === doctorId);

    if (!doctor) {
      throw new Error('Doctor not found');
    }

    // Remove from doctors
    const filteredDoctors = doctors.filter(d => d.id !== doctorId);
    saveToStorage(STORAGE_KEYS.DOCTORS, filteredDoctors);

    // Remove from users
    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    const filteredUsers = users.filter(u => u.email !== doctor.email);
    saveToStorage(STORAGE_KEYS.USERS, filteredUsers);

    console.log('✅ Doctor deleted:', doctor.name);
    return true;
  } catch (error) {
    console.error('❌ Error deleting doctor:', error);
    throw error;
  }
}

// ============ APPOINTMENTS ============

/**
 * Get all appointments
 */
export function getAppointments() {
  return getFromStorage(STORAGE_KEYS.APPOINTMENTS) || [];
}

/**
 * Get appointments by patient ID
 */
export function getAppointmentsByPatient(patientId) {
  const appointments = getAppointments();
  return appointments.filter(a => a.patientId === patientId);
}

/**
 * Save new appointment
 */
export function saveAppointment(appointmentData) {
  try {
    const appointments = getAppointments();

    const newAppointment = {
      ...appointmentData,
      id: appointmentData.id || `APPT-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: appointmentData.status || 'scheduled'
    };

    appointments.push(newAppointment);
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);

    console.log('✅ Appointment saved:', newAppointment.id);
    return newAppointment;
  } catch (error) {
    console.error('❌ Error saving appointment:', error);
    return null;
  }
}

/**
 * Update appointment
 */
export function updateAppointment(appointmentId, updates) {
  try {
    const appointments = getAppointments();
    const index = appointments.findIndex(a => a.id === appointmentId);

    if (index === -1) {
      return false;
    }

    appointments[index] = {
      ...appointments[index],
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
    return true;
  } catch (error) {
    console.error('❌ Error updating appointment:', error);
    return false;
  }
}

/**
 * Delete appointment
 */
export function deleteAppointment(appointmentId) {
  try {
    const appointments = getAppointments();
    const filtered = appointments.filter(a => a.id !== appointmentId);
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, filtered);
    return true;
  } catch (error) {
    console.error('❌ Error deleting appointment:', error);
    return false;
  }
}

// ============ MESSAGES ============

/**
 * Get all messages
 */
export function getMessages() {
  return getFromStorage(STORAGE_KEYS.MESSAGES) || [];
}

/**
 * Get messages for a specific user
 */
export function getMessagesByUser(userId) {
  const messages = getMessages();
  return messages.filter(m => m.senderId === userId || m.receiverId === userId);
}

/**
 * Send a message
 */
export function sendMessage(messageData) {
  try {
    const messages = getMessages();

    const newMessage = {
      ...messageData,
      id: `MSG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    messages.unshift(newMessage);
    saveToStorage(STORAGE_KEYS.MESSAGES, messages);

    console.log('✅ Message sent');
    return newMessage;
  } catch (error) {
    console.error('❌ Error sending message:', error);
    return null;
  }
}

// ============ SESSION MANAGEMENT ============

/**
 * Get current session
 */
export function getCurrentSession() {
  return getFromStorage(STORAGE_KEYS.SESSION);
}

/**
 * Create session
 */
export function createSession(userData) {
  const session = {
    ...userData,
    loginTime: new Date().toISOString()
  };
  saveToStorage(STORAGE_KEYS.SESSION, session);
  return session;
}

/**
 * Clear session (logout)
 */
export function clearSession() {
  removeFromStorage(STORAGE_KEYS.SESSION);
  return true;
}

// ============ STATISTICS ============

/**
 * Get dashboard statistics
 */
export function getDashboardStats() {
  const scans = getAllScans();
  const appointments = getAppointments();
  const patients = getAllPatients();
  const doctors = getAllDoctors();

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    // Scan stats
    totalScans: scans.length,
    scansThisMonth: scans.filter(s => new Date(s.uploadTime) >= thisMonth).length,
    pendingScans: scans.filter(s => s.status === 'pending').length,
    reviewedScans: scans.filter(s => s.status === 'reviewed' || s.status === 'completed').length,
    highRiskScans: scans.filter(s => s.results?.riskLevel === 'high').length,
    lastScanDate: scans.length > 0 ? scans[0].uploadTime : null,

    // Patient stats
    totalPatients: patients.length,
    newPatientsThisMonth: patients.filter(p => new Date(p.createdAt) >= thisMonth).length,
    followUpRequired: patients.filter(p => p.status === 'Follow-up Required').length,
    criticalCases: patients.filter(p => p.status === 'Urgent').length,

    // Appointment stats
    totalAppointments: appointments.length,
    upcomingAppointments: appointments.filter(a => {
      const apptDate = new Date(a.date);
      return apptDate >= now && a.status === 'scheduled';
    }).length,

    // Doctor stats
    totalDoctors: doctors.length
  };
}

// ============ DATA EXPORT/IMPORT ============

/**
 * Export all data
 */
export function exportAllData() {
  return {
    users: getFromStorage(STORAGE_KEYS.USERS),
    doctors: getAllDoctors(),
    patients: getAllPatients(),
    scans: getAllScans(),
    appointments: getAppointments(),
    messages: getMessages(),
    settings: getFromStorage(STORAGE_KEYS.SETTINGS),
    appData: getFromStorage(STORAGE_KEYS.APP_DATA),
    exportedAt: new Date().toISOString(),
    version: '2.0.0'
  };
}

/**
 * Import data
 */
export function importData(data) {
  try {
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

    if (parsedData.users) saveToStorage(STORAGE_KEYS.USERS, parsedData.users);
    if (parsedData.doctors) saveToStorage(STORAGE_KEYS.DOCTORS, parsedData.doctors);
    if (parsedData.patients) saveToStorage(STORAGE_KEYS.PATIENTS, parsedData.patients);
    if (parsedData.scans) saveToStorage(STORAGE_KEYS.SCANS, parsedData.scans);
    if (parsedData.appointments) saveToStorage(STORAGE_KEYS.APPOINTMENTS, parsedData.appointments);
    if (parsedData.messages) saveToStorage(STORAGE_KEYS.MESSAGES, parsedData.messages);
    if (parsedData.settings) saveToStorage(STORAGE_KEYS.SETTINGS, parsedData.settings);
    if (parsedData.appData) saveToStorage(STORAGE_KEYS.APP_DATA, parsedData.appData);

    console.log('✅ Data imported successfully');
    return true;
  } catch (error) {
    console.error('❌ Data import failed:', error);
    throw new Error('Failed to import data: ' + error.message);
  }
}

/**
 * Download data backup
 */
export function downloadDataBackup() {
  const data = exportAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pneumai-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Clear all data
 */
export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeFromStorage(key);
  });
  console.log('✅ All data cleared');
  return true;
}

// ============ UTILITY FUNCTIONS ============

/**
 * Format date
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format time
 */
export function formatTime(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get risk level color
 */
export function getRiskLevelColor(riskLevel) {
  const colors = {
    high: '#f44336',
    medium: '#ff9800',
    low: '#ffc107',
    none: '#4caf50'
  };
  return colors[riskLevel] || '#999';
}

/**
 * Get risk level label
 */
export function getRiskLevelLabel(riskLevel) {
  const labels = {
    high: 'High Risk',
    medium: 'Medium Risk',
    low: 'Low Risk',
    none: 'No Risk'
  };
  return labels[riskLevel] || 'Unknown';
}

// Export storage keys for reference
export { STORAGE_KEYS };

import React, { useState } from 'react';
import { 
  User, 
  FileText, 
  Calendar, 
  MessageCircle, 
  LogOut, 
  Home, 
  Upload, 
  Clock, 
  ChevronRight, 
  Activity, 
  X, 
  Camera, 
  CheckCircle, 
  Layers,
  AlertCircle,
  Info,
  Menu,
  Search 
} from 'lucide-react';
import './Dashboard.css';
import './PatientPlatformIntegration.css';
import PatientPlatform from './PatientPlatform';
import './Platform.css'; // Import platform CSS
import SimplifiedPatientPlatform from './SimplifiedPatientPlatform'; // Import the new component

const PatientDashboard = ({ username, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  // New state variables for drag and drop functionality
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [quickUploadSuccess, setQuickUploadSuccess] = useState(false);
  
  // Mock data for recent uploads
  const recentUploads = [
    { id: 1, name: 'CT Scan - Chest', date: 'May 2, 2025', status: 'Analyzed' },
    { id: 2, name: 'CT Scan - Lungs', date: 'April 15, 2025', status: 'Pending Review' }
  ];
  
  // Mock data for doctors
  const availableDoctors = [
    { id: 1, name: 'Dr. Sarah Miller', specialty: 'Pulmonology', availability: 'Available May 15-20', image: '/api/placeholder/60/60' },
    { id: 2, name: 'Dr. James Rodriguez', specialty: 'Oncology', availability: 'Available May 12-18', image: '/api/placeholder/60/60' },
    { id: 3, name: 'Dr. Emily Chen', specialty: 'Radiology', availability: 'Available May 10-16', image: '/api/placeholder/60/60' }
  ];
  
  // Mock data for appointments
  const appointments = [
    { id: 1, doctor: 'Dr. Sarah Miller', type: 'Pulmonology Consultation', date: 'May 15, 2025', time: '10:30 AM - 11:30 AM' },
    { id: 2, doctor: 'Dr. James Rodriguez', type: 'Follow-up CT Scan', date: 'June 2, 2025', time: '9:00 AM - 10:00 AM' }
  ];
  
  // Mock patient data
  const patientInfo = {
    name: 'Robert Johnson',
    id: 'PAT-2023-8642',
    age: '54 years',
    scanDate: 'May 3, 2025',
    clinicalNotes: 'Patient presents with persistent cough for 3 months. Former smoker (2 packs/day for 20 years, quit 5 years ago). Family history of lung cancer.'
  };
  
  // New handlers for drag and drop functionality
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    // Simulate file upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setQuickUploadSuccess(true);
            setTimeout(() => {
              setUploadProgress(null);
              setQuickUploadSuccess(false);
            }, 2000);
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      // Simulate file upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setQuickUploadSuccess(true);
              setTimeout(() => {
                setUploadProgress(null);
                setQuickUploadSuccess(false);
              }, 2000);
            }, 500);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    }
  };
  
  const handleUpload = (e) => {
    e.preventDefault();
    // Simulate upload process
    setTimeout(() => {
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setShowUploadModal(false);
      }, 2000);
    }, 1500);
  };
  
  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };
  
  return (
    <div className="dashboard-layout">
      {/* Mobile menu button */}
      <button 
        className="mobile-menu-toggle" 
        onClick={toggleMobileSidebar}
        type="button"
      >
        <Menu size={24} />
      </button>
      
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${showMobileSidebar ? 'show' : ''}`}>
        <div className="sidebar-header">
          <h2 className="dashboard-logo">LungEvity</h2>
          <button 
            className="close-sidebar"
            onClick={() => setShowMobileSidebar(false)}
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="user-profile">
          <div className="user-avatar">
            <User className="avatar-icon" />
          </div>
          <div className="user-info-sidebar">
            <span className="username-sidebar">Welcome,</span>
            <span className="username-value">{username}</span>
          </div>
        </div>
        
        <div className="sidebar-menu">
          <button 
            className={`sidebar-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
            type="button"
          >
            <Home className="sidebar-icon" />
            <span>Home</span>
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
            type="button"
          >
            <Calendar className="sidebar-icon" />
            <span>Book Doctor</span>
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'scans' ? 'active' : ''}`}
            onClick={() => setActiveTab('scans')}
            type="button"
          >
            <Upload className="sidebar-icon" />
            <span>CT Scans</span>
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'platform' ? 'active' : ''}`}
            onClick={() => setActiveTab('platform')}
            type="button"
          >
            <Layers className="sidebar-icon" />
            <span>CT Scan Platform</span>
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            type="button"
          >
            <Clock className="sidebar-icon" />
            <span>Recent Uploads</span>
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
            type="button"
          >
            <MessageCircle className="sidebar-icon" />
            <span>Contact Doctor</span>
          </button>
        </div>
        
        <div className="sidebar-footer">
          <button className="logout-button" onClick={onLogout} type="button">
            <LogOut className="sidebar-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="dashboard-content-wrapper">
        {/* Main Content Header */}
        <div className="content-header">
          <h1 className="page-title">
            {activeTab === 'home' && 'Dashboard'}
            {activeTab === 'appointments' && 'Book a Doctor'}
            {activeTab === 'scans' && 'CT Scan Analysis'}
            {activeTab === 'platform' && 'CT Scan Platform'}
            {activeTab === 'history' && 'Recent Uploads'}
            {activeTab === 'contact' && 'Contact Your Doctor'}
          </h1>
          
          <div className="header-actions">
            <div className="search-container">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search..." className="search-input" />
            </div>
            
            {activeTab === 'scans' && (
              <button 
                type="button" 
                className="action-button"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload size={16} /> Upload Scan
              </button>
            )}
          </div>
        </div>
        
        {/* Main Content Body */}
        <div className="content-body">
          {activeTab === 'home' && (
            <>
              <div className="welcome-section">
                <h2>Welcome to Your Patient Portal</h2>
                <p>Monitor your lung health, upload CT scan results, and stay connected with your healthcare team.</p>
              </div>
              
              {/* Centered CT Scan Upload Section */}
              <div className="central-upload-section">
                <div className="upload-section-header">
                  <h2>CT Scan Upload</h2>
                  <p>Upload your CT scan images for AI-powered analysis and expert review</p>
                </div>
                
                <div 
                  className={`central-upload-area ${isDragging ? 'dragging' : ''}`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {uploadProgress !== null ? (
                    <div className="upload-progress-container">
                      {quickUploadSuccess ? (
                        <div className="upload-success">
                          <CheckCircle size={48} className="success-icon-large" />
                          <h3>Upload Successful!</h3>
                          <p>Your CT scan has been uploaded and will be analyzed shortly.</p>
                        </div>
                      ) : (
                        <>
                          <div className="upload-progress-circle">
                            <svg width="70" height="70" viewBox="0 0 100 100">
                              <circle 
                                cx="50" cy="50" r="40" 
                                stroke="#e5e7eb" 
                                strokeWidth="8" 
                                fill="none" 
                              />
                              <circle 
                                cx="50" cy="50" r="40" 
                                stroke="#3b82f6" 
                                strokeWidth="8" 
                                fill="none" 
                                strokeLinecap="round"
                                strokeDasharray="251.2"
                                strokeDashoffset={251.2 - (251.2 * uploadProgress) / 100}
                                transform="rotate(-90 50 50)"
                              />
                            </svg>
                            <span className="progress-text">{uploadProgress}%</span>
                          </div>
                          <p>Uploading your scan...</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <Camera className="upload-icon-centered" />
                      <h3>Drag & Drop Your CT Scan Files Here</h3>
                      <p>or</p>
                      <label className="browse-files-button">
                        Browse Files
                        <input 
                          type="file" 
                          className="hidden-input" 
                          accept=".dcm,.nii,.jpg,.png,.zip"
                          onChange={handleFileInputChange}
                        />
                      </label>
                      <p className="upload-formats">Accepted formats: DICOM, NIFTI, JPEG, PNG</p>
                    </>
                  )}
                </div>
                
                <div className="upload-info-section">
                  <div className="info-card">
                    <div className="info-icon">
                      <AlertCircle size={20} />
                    </div>
                    <div className="info-content">
                      <h4>Why Upload Your CT Scans?</h4>
                      <p>Our AI system can detect early signs of lung cancer with high accuracy, providing you and your doctors with valuable insights.</p>
                    </div>
                  </div>
                  
                  <div className="info-card">
                    <div className="info-icon">
                      <Info size={20} />
                    </div>
                    <div className="info-content">
                      <h4>What Happens Next?</h4>
                      <p>After upload, your scan will be analyzed automatically. Results are typically available within 30 minutes.</p>
                    </div>
                  </div>
                  
                  <button 
                    className="view-all-scans-button"
                    onClick={() => setActiveTab('scans')}
                    type="button"
                  >
                    View All My Scans
                  </button>
                </div>
              </div>
              
              {/* Dashboard Summary Cards */}
              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <h3>Your Upcoming Appointments</h3>
                  <div className="card-content">
                    {appointments.length > 0 ? (
                      appointments.map(appointment => (
                        <div className="appointment-item" key={appointment.id}>
                          <div className="appointment-date">
                            <span className="month">{appointment.date.split(' ')[0]}</span>
                            <span className="day">{appointment.date.split(' ')[1].replace(',', '')}</span>
                          </div>
                          <div className="appointment-details">
                            <h4>{appointment.doctor}</h4>
                            <p>{appointment.type}</p>
                            <p>{appointment.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-data-message">No upcoming appointments scheduled.</p>
                    )}
                    <button 
                      className="action-button" 
                      onClick={() => setActiveTab('appointments')}
                      type="button"
                    >
                      Schedule Appointment
                    </button>
                  </div>
                </div>
                
                <div className="dashboard-card">
                  <h3>Recent Uploads</h3>
                  <div className="card-content">
                    {recentUploads.length > 0 ? (
                      recentUploads.map(upload => (
                        <div className="upload-item" key={upload.id}>
                          <div className="upload-icon">
                            <FileText />
                          </div>
                          <div className="upload-details">
                            <h4>{upload.name}</h4>
                            <p>Date: {upload.date}</p>
                            <p className={`status ${upload.status === 'Analyzed' ? 'success' : 'pending'}`}>
                              {upload.status}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-data-message">No recent uploads.</p>
                    )}
                    <button 
                      className="action-button"
                      onClick={() => setShowUploadModal(true)}
                      type="button"
                    >
                      Upload New Scan
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'platform' && (
            <SimplifiedPatientPlatform/>
          )}
          
          {activeTab === 'appointments' && (
            <>
              <div className="page-subheader">
                <p>Schedule an appointment with one of our specialists.</p>
              </div>
              
              <div className="doctors-grid">
                {availableDoctors.map(doctor => (
                  <div className="doctor-card" key={doctor.id}>
                    <div className="doctor-avatar">
                      <img src={doctor.image} alt={doctor.name} />
                    </div>
                    <div className="doctor-info">
                      <h3>{doctor.name}</h3>
                      <p className="doctor-specialty">{doctor.specialty}</p>
                      <p className="doctor-availability">{doctor.availability}</p>
                      <button className="book-button" type="button">Book Appointment</button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="dashboard-card full-width">
                <h3>Your Scheduled Appointments</h3>
                <div className="appointments-list">
                  {appointments.length > 0 ? (
                    appointments.map(appointment => (
                      <div className="appointment-list-item" key={appointment.id}>
                        <div className="appointment-list-date">
                          <span className="month">{appointment.date.split(' ')[0]}</span>
                          <span className="day">{appointment.date.split(' ')[1].replace(',', '')}</span>
                        </div>
                        <div className="appointment-list-details">
                          <h4>{appointment.doctor}</h4>
                          <p>{appointment.type}</p>
                          <p>{appointment.time}</p>
                        </div>
                        <div className="appointment-list-actions">
                          <button className="reschedule-button" type="button">Reschedule</button>
                          <button className="cancel-button" type="button">Cancel</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-data-message">No appointments scheduled.</p>
                  )}
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'scans' && (
            <>
              <div className="page-subheader">
                <p>View and analyze your CT scan results with our AI-powered platform.</p>
              </div>
              
              <div className="scan-grid">
                {/* Scan Viewer */}
                <div className="scan-viewer">
                  <img 
                    src="/api/placeholder/400/400" 
                    alt="CT Scan" 
                    className="scan-image" 
                  />
                </div>
                
                {/* Analysis Results */}
                <div className="analysis-container">
                  <h4 className="analysis-title">AI Analysis Results</h4>
                  
                  <div className="analysis-content">
                    <div className="analysis-section">
                      <div className="probability-header">
                        <span className="probability-label">Cancer Probability</span>
                        <span className="probability-value">68%</span>
                      </div>
                      <div className="progress-container">
                        <div className="progress-bar" style={{width: '68%'}}></div>
                      </div>
                    </div>
                    
                    <div className="section-divider">
                      <h5 className="section-subtitle">Detected Abnormalities</h5>
                      <ul className="abnormality-list">
                        <li className="abnormality-item">
                          <ChevronRight className="abnormality-icon icon-sm" />
                          <div className="abnormality-content">
                            <p className="abnormality-title">Nodule detected in right upper lobe</p>
                            <p className="abnormality-details">Size: 1.8cm x 1.4cm, Irregular borders</p>
                          </div>
                        </li>
                        <li className="abnormality-item">
                          <ChevronRight className="abnormality-icon warning icon-sm" />
                          <div className="abnormality-content">
                            <p className="abnormality-title">Ground-glass opacity</p>
                            <p className="abnormality-details">Left lower lobe, 4.2mm diameter</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="section-divider">
                      <h5 className="section-subtitle">Recommended Actions</h5>
                      <ul className="action-list">
                        <li className="action-item">
                          <Activity className="action-icon icon-sm" />
                          Schedule follow-up scan in 30 days
                        </li>
                        <li className="action-item">
                          <Activity className="action-icon icon-sm" />
                          Consider biopsy of right upper lobe nodule
                        </li>
                        <li className="action-item">
                          <Activity className="action-icon icon-sm" />
                          Refer to pulmonary specialist
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="analysis-actions">
                    <button type="button" className="primary-button">
                      View Detailed Report
                    </button>
                    <button type="button" className="secondary-button">
                      Consult Doctor
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="patient-info">
                <h4 className="patient-title">Your Information</h4>
                <div className="patient-card">
                  <div className="patient-grid">
                    <div className="patient-field">
                      <p className="field-label">Patient Name</p>
                      <p className="field-value">{patientInfo.name}</p>
                    </div>
                    <div className="patient-field">
                      <p className="field-label">Patient ID</p>
                      <p className="field-value">{patientInfo.id}</p>
                    </div>
                    <div className="patient-field">
                      <p className="field-label">Age</p>
                      <p className="field-value">{patientInfo.age}</p>
                    </div>
                    <div className="patient-field">
                      <p className="field-label">Scan Date</p>
                      <p className="field-value">{patientInfo.scanDate}</p>
                    </div>
                  </div>
                  
                  <div className="patient-notes">
                    <p className="notes-label">Clinical Notes</p>
                    <p className="notes-text">{patientInfo.clinicalNotes}</p>
                  </div>
                </div>
              </div>
              
              <div className="dashboard-card full-width">
                <h3>Upload Guidelines</h3>
                <div className="guidelines-content">
                  <div className="guideline-item">
                    <h4>File Requirements</h4>
                    <ul className="guideline-list">
                      <li>Files must be in DICOM, NIFTI, JPEG, or PNG format</li>
                      <li>Maximum file size: 100MB per file</li>
                      <li>For optimal analysis, DICOM format is preferred</li>
                    </ul>
                  </div>
                  <div className="guideline-item">
                    <h4>Processing Time</h4>
                    <ul className="guideline-list">
                      <li>Initial AI analysis typically takes 5-10 minutes</li>
                      <li>Specialist review may take up to 24 hours</li>
                      <li>You will receive a notification when results are ready</li>
                    </ul>
                  </div>
                  <div className="guideline-item">
                    <h4>Privacy Information</h4>
                    <ul className="guideline-list">
                      <li>All uploads are encrypted and stored securely</li>
                      <li>Only authorized healthcare providers have access to your scans</li>
                      <li>You can delete your uploaded scans at any time</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'history' && (
            <>
              <div className="page-subheader">
                <p>View and manage your uploaded CT scans and results.</p>
              </div>
              
              {recentUploads.length > 0 ? (
                <div className="uploads-table-container">
                  <table className="uploads-table">
                    <thead>
                      <tr>
                        <th>Scan Name</th>
                        <th>Upload Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUploads.map(upload => (
                        <tr key={upload.id}>
                          <td>{upload.name}</td>
                          <td>{upload.date}</td>
                          <td>
                            <span className={`status-badge ${upload.status === 'Analyzed' ? 'success' : 'pending'}`}>
                              {upload.status}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button className="table-action-button" type="button">View Results</button>
                              <button className="table-action-button" type="button">Download</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-data-container">
                  <FileText className="no-data-icon" />
                  <h3>No Uploads Yet</h3>
                  <p>You haven't uploaded any CT scans yet. Upload a scan to get started.</p>
                  <button 
                    className="action-button"
                    onClick={() => setShowUploadModal(true)}
                    type="button"
                  >
                    Upload CT Scan
                  </button>
                </div>
              )}
            </>
          )}
          
          {activeTab === 'contact' && (
            <>
              <div className="page-subheader">
                <p>Reach out to your healthcare providers with any questions or concerns.</p>
              </div>
              
              <div className="contact-grid">
                <div className="contact-card">
                  <div className="contact-header">
                    <h3>Your Care Team</h3>
                  </div>
                  <div className="contact-list">
                    <div className="contact-item">
                      <div className="contact-avatar">
                        <img src="/api/placeholder/60/60" alt="Dr. Sarah Miller" />
                      </div>
                      <div className="contact-details">
                        <h4>Dr. Sarah Miller</h4>
                        <p>Pulmonology</p>
                        <div className="contact-actions">
                          <button className="contact-action-button" type="button">Message</button>
                          <button className="contact-action-button" type="button">Call</button>
                        </div>
                      </div>
                    </div>
                    <div className="contact-item">
                      <div className="contact-avatar">
                        <img src="/api/placeholder/60/60" alt="Dr. James Rodriguez" />
                      </div>
                      <div className="contact-details">
                        <h4>Dr. James Rodriguez</h4>
                        <p>Oncology</p>
                        <div className="contact-actions">
                          <button className="contact-action-button" type="button">Message</button>
                          <button className="contact-action-button" type="button">Call</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="message-card">
                  <div className="message-header">
                    <h3>Send a Message</h3>
                  </div>
                  <div className="message-form">
                    <div className="form-group">
                      <label htmlFor="recipient">Recipient</label>
                      <select id="recipient" name="recipient">
                        <option value="">Select a healthcare provider</option>
                        <option value="1">Dr. Sarah Miller</option>
                        <option value="2">Dr. James Rodriguez</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="subject">Subject</label>
                      <input type="text" id="subject" name="subject" placeholder="Enter message subject" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="message">Message</label>
                      <textarea id="message" name="message" rows="5" placeholder="Type your message here..."></textarea>
                    </div>
                    <div className="form-actions">
                      <button className="cancel-button" type="button">Cancel</button>
                      <button className="send-button" type="button">Send Message</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="dashboard-card full-width">
                <h3>Message History</h3>
                <div className="message-history">
                  <div className="message-history-item">
                    <div className="message-history-header">
                      <h4>Question about medication</h4>
                      <span className="message-date">April 30, 2025</span>
                    </div>
                    <p className="message-recipient">To: Dr. Sarah Miller</p>
                    <p className="message-preview">I've been experiencing some side effects from the new medication...</p>
                    <div className="message-status">
                      <span className="status-badge success">Replied</span>
                    </div>
                  </div>
                  <div className="message-history-item">
                    <div className="message-history-header">
                      <h4>Follow-up appointment</h4>
                      <span className="message-date">April 22, 2025</span>
                    </div>
                    <p className="message-recipient">To: Dr. James Rodriguez</p>
                    <p className="message-preview">I wanted to confirm my follow-up appointment scheduled for...</p>
                    <div className="message-status">
                      <span className="status-badge success">Replied</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Upload CT Scan</h2>
              <button className="close-button" onClick={() => setShowUploadModal(false)} type="button">
                <X className="icon-sm" />
              </button>
            </div>
            
            {uploadSuccess ? (
              <div className="success-message">
                <CheckCircle className="success-icon" />
                <h3>Upload Successful!</h3>
                <p>Your CT scan has been uploaded and is being processed. You will be notified when the analysis is complete.</p>
              </div>
            ) : (
              <form className="upload-form" onSubmit={handleUpload}>
                <div className="upload-drop-area">
                  <Camera className="upload-icon-large" />
                  <h3>Drag & Drop Files Here</h3>
                  <p>or</p>
                  <button type="button" className="browse-button">Browse Files</button>
                  <input type="file" id="file-upload" className="hidden-input" />
                  <p className="upload-formats">Accepted formats: DICOM, NIFTI, JPEG, PNG</p>
                </div>
                
                <div className="form-group">
                  <label htmlFor="scan-name">Scan Name</label>
                  <input type="text" id="scan-name" name="scan-name" placeholder="e.g., Chest CT Scan - May 2025" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="scan-notes">Notes (Optional)</label>
                  <textarea id="scan-notes" name="scan-notes" rows="3" placeholder="Add any notes about this scan..."></textarea>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="cancel-button" onClick={() => setShowUploadModal(false)}>Cancel</button>
                  <button type="submit" className="upload-button">Upload Scan</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;

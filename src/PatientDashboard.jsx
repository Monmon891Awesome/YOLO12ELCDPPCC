import React, { useState, useEffect } from 'react';
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
  Search,
  Trash2,
  Eye as EyeIcon
} from 'lucide-react';
import './Dashboard.css';
import './PatientPlatformIntegration.css';
import PatientPlatform from './PatientPlatform';
import './Platform.css'; // Import platform CSS
import SimplifiedPatientPlatform from './SimplifiedPatientPlatform'; // Import the new component
import ScanUpload from './components/ScanUpload';
import ScanResults from './components/ScanResults';
import {
  getPatientProfile,
  getScanHistory,
  saveScan,
  deleteScan,
  getAppointments,
  getDoctors,
  getDashboardStats,
  formatDate
} from './utils/patientDataManager';

const PatientDashboard = ({ username, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Load persistent data
  const [patientProfile, setPatientProfile] = useState(getPatientProfile());
  const [scanHistory, setScanHistory] = useState(getScanHistory());
  const [appointments, setAppointments] = useState(getAppointments());
  const [doctors, setDoctors] = useState(getDoctors());
  const [dashboardStats, setDashboardStats] = useState(getDashboardStats());

  // Scan upload and results state
  const [currentScanResult, setCurrentScanResult] = useState(null);

  // New state variables for drag and drop functionality
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [quickUploadSuccess, setQuickUploadSuccess] = useState(false);

  // Load latest scan on mount
  useEffect(() => {
    const history = getScanHistory();
    if (history.length > 0) {
      setCurrentScanResult(history[0]);
    }
  }, []);

  // Refresh dashboard stats when scan history changes
  useEffect(() => {
    setDashboardStats(getDashboardStats());
  }, [scanHistory]);

  // Handle scan upload completion
  const handleScanComplete = (result) => {
    setCurrentScanResult(result);

    // Save to localStorage
    saveScan(result);

    // Refresh scan history
    setScanHistory(getScanHistory());

    setUploadSuccess(true);
    // Auto-switch to results view
    setTimeout(() => setActiveTab('results'), 500);
  };

  const handleScanError = (error) => {
    console.error('Scan upload error:', error);
    alert(`Scan upload failed: ${error.message}`);
  };

  // Handle scan deletion
  const handleDeleteScan = (scanId) => {
    if (window.confirm('Are you sure you want to delete this scan?')) {
      deleteScan(scanId);
      setScanHistory(getScanHistory());

      // If we're viewing the deleted scan, clear it
      if (currentScanResult?.scanId === scanId) {
        setCurrentScanResult(null);
      }

      alert('Scan deleted successfully!');
    }
  };

  // Handle viewing a specific scan
  const handleViewScan = (scan) => {
    setCurrentScanResult(scan);
    setActiveTab('results');
  };

  // Real data from localStorage - convert to format expected by UI
  const recentUploads = scanHistory.slice(0, 5).map(scan => ({
    id: scan.scanId,
    name: `CT Scan - ${formatDate(scan.uploadTime)}`,
    date: formatDate(scan.uploadTime),
    status: 'Analyzed',
    riskLevel: scan.results?.riskLevel || 'none',
    detected: scan.results?.detected || false,
    scanData: scan
  }));

  // Use doctors from localStorage
  const availableDoctors = doctors;
  
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
      {/* Decorative lung backgrounds */}
      <div className="dashboard-lung-bg dashboard-lung-bg-left"></div>
      <div className="dashboard-lung-bg dashboard-lung-bg-right"></div>

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
          <img src="/assets/logo-medic.jpg" alt="PneumAI" className="sidebar-logo-img" />
          <h2 className="dashboard-logo">PneumAI</h2>
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
            className={`sidebar-item ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
            type="button"
          >
            <Activity className="sidebar-icon" />
            <span>Scan Results</span>
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
            {activeTab === 'results' && 'Scan Results'}
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

              {/* YOLOv12 Scan Upload Component */}
              <ScanUpload
                onScanComplete={handleScanComplete}
                onError={handleScanError}
              />

              {/* Show latest scan result if available */}
              {currentScanResult && (
                <div className="latest-result-preview">
                  <h3>Latest Scan Result</h3>
                  <div className="result-quick-info">
                    <p><strong>Status:</strong> {currentScanResult.results.detected ? 'Detection Found' : 'No Detection'}</p>
                    <p><strong>Risk Level:</strong> <span className={`risk-${currentScanResult.results.riskLevel}`}>{currentScanResult.results.riskLevel.toUpperCase()}</span></p>
                    <button onClick={() => setActiveTab('results')} type="button" className="view-full-results">
                      View Full Results
                    </button>
                  </div>
                </div>
              )}

              <div className="upload-info-section">
                <div className="info-card">
                  <div className="info-icon">
                    <AlertCircle size={20} />
                  </div>
                  <div className="info-content">
                    <h4>Why Upload Your CT Scans?</h4>
                    <p>Our AI system assists in analyzing CT scans to provide you and your healthcare professionals with helpful insights for review.</p>
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

              {/* Dashboard Summary Cards */}
              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <h3>Your Upcoming Appointments</h3>
                  <div className="card-content">
                    {appointments.length > 0 ? (
                      appointments.map(appointment => {
                        const formattedDate = formatDate(appointment.date);
                        const dateParts = formattedDate.split(' ');
                        return (
                          <div className="appointment-item" key={appointment.id}>
                            <div className="appointment-date">
                              <span className="month">{dateParts[0]}</span>
                              <span className="day">{dateParts[1] ? dateParts[1].replace(',', '') : ''}</span>
                            </div>
                            <div className="appointment-details">
                              <h4>{appointment.doctor}</h4>
                              <p>{appointment.type}</p>
                              <p>{appointment.time}</p>
                            </div>
                          </div>
                        );
                      })
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
          
          {activeTab === 'results' && (
            <>
              {currentScanResult ? (
                <ScanResults scanData={currentScanResult} />
              ) : (
                <div className="no-results-message">
                  <Info size={48} color="#999" />
                  <h3>No Scan Results Available</h3>
                  <p>Upload a CT scan from the Home tab to see your results here.</p>
                  <button onClick={() => setActiveTab('home')} type="button" className="go-home-button">
                    Go to Upload
                  </button>
                </div>
              )}
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
                    appointments.map(appointment => {
                      const formattedDate = formatDate(appointment.date);
                      const dateParts = formattedDate.split(' ');
                      return (
                        <div className="appointment-list-item" key={appointment.id}>
                          <div className="appointment-list-date">
                            <span className="month">{dateParts[0]}</span>
                            <span className="day">{dateParts[1] ? dateParts[1].replace(',', '') : ''}</span>
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
                      );
                    })
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

              {currentScanResult ? (
                <>
                  <div className="scan-grid">
                    {/* Scan Viewer */}
                    <div className="scan-viewer">
                      <img
                        src={currentScanResult.results.annotatedImageUrl || currentScanResult.results.imageUrl}
                        alt="CT Scan"
                        className="scan-image"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/400/400';
                        }}
                      />
                      <div className="scan-image-info">
                        <p className="scan-date">Uploaded: {formatDate(currentScanResult.uploadTime)}</p>
                      </div>
                    </div>

                    {/* Analysis Results */}
                    <div className="analysis-container">
                      <h4 className="analysis-title">AI Analysis Results</h4>

                      <div className="analysis-content">
                        <div className="analysis-section">
                          <div className="probability-header">
                            <span className="probability-label">Analysis Status</span>
                            <span className="probability-value" style={{
                              color: currentScanResult.results.riskLevel === 'high' ? '#ef4444' :
                                     currentScanResult.results.riskLevel === 'medium' ? '#f97316' :
                                     currentScanResult.results.riskLevel === 'low' ? '#eab308' : '#22c55e'
                            }}>
                              Complete
                            </span>
                          </div>
                          <div className="risk-badge-container">
                            <span className={`risk-badge-large risk-${currentScanResult.results.riskLevel}`}>
                              {currentScanResult.results.riskLevel === 'none' ? 'REVIEWED' :
                               currentScanResult.results.riskLevel === 'low' ? 'ATTENTION SUGGESTED' :
                               currentScanResult.results.riskLevel === 'medium' ? 'REVIEW RECOMMENDED' :
                               'PROFESSIONAL REVIEW NEEDED'}
                            </span>
                          </div>
                        </div>

                        <div className="section-divider">
                          <h5 className="section-subtitle">Detected Abnormalities</h5>
                          {currentScanResult.results.detections && currentScanResult.results.detections.length > 0 ? (
                            <ul className="abnormality-list">
                              {currentScanResult.results.detections.map((detection, idx) => (
                                <li className="abnormality-item" key={idx}>
                                  <ChevronRight className="abnormality-icon icon-sm" />
                                  <div className="abnormality-content">
                                    <p className="abnormality-title">
                                      {detection.class.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} detected
                                    </p>
                                    <p className="abnormality-details">
                                      {detection.characteristics ? `Size: ${detection.characteristics.size_mm}mm, ${detection.characteristics.shape}` : 'Detected by AI analysis'}
                                    </p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="no-detections">No abnormalities detected in this scan.</p>
                          )}
                        </div>

                        <div className="section-divider">
                          <h5 className="section-subtitle">Suggested Considerations</h5>
                          <ul className="action-list">
                            {currentScanResult.results.riskLevel === 'high' && (
                              <>
                                <li className="action-item">
                                  <Activity className="action-icon icon-sm" />
                                  Healthcare professional consultation recommended
                                </li>
                                <li className="action-item">
                                  <Activity className="action-icon icon-sm" />
                                  Further evaluation may be beneficial
                                </li>
                              </>
                            )}
                            {currentScanResult.results.riskLevel === 'medium' && (
                              <>
                                <li className="action-item">
                                  <Activity className="action-icon icon-sm" />
                                  Follow-up imaging may be considered
                                </li>
                                <li className="action-item">
                                  <Activity className="action-icon icon-sm" />
                                  Discuss findings with healthcare professional
                                </li>
                              </>
                            )}
                            {currentScanResult.results.riskLevel === 'low' && (
                              <>
                                <li className="action-item">
                                  <Activity className="action-icon icon-sm" />
                                  Consider routine follow-up with healthcare provider
                                </li>
                                <li className="action-item">
                                  <Activity className="action-icon icon-sm" />
                                  Maintain regular health monitoring
                                </li>
                              </>
                            )}
                            {currentScanResult.results.riskLevel === 'none' && (
                              <li className="action-item">
                                <Activity className="action-icon icon-sm" />
                                Continue with routine annual checkups
                              </li>
                            )}
                            <li className="action-item">
                              <Activity className="action-icon icon-sm" />
                              Share results with your primary care physician
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="analysis-actions">
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => {
                            // Download detailed report
                            const report = JSON.stringify(currentScanResult, null, 2);
                            const blob = new Blob([report], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `scan-report-${currentScanResult.scanId}.json`;
                            a.click();
                          }}
                        >
                          View Detailed Report
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => setActiveTab('contact')}
                        >
                          Consult Doctor
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="no-results-message">
                  <AlertCircle size={48} color="#999" />
                  <h3>No Scan Results Available</h3>
                  <p>Upload a CT scan from the Home tab to view analysis results here.</p>
                  <button onClick={() => setActiveTab('home')} type="button" className="action-button">
                    Go to Upload
                  </button>
                </div>
              )}
              
              <div className="patient-info">
                <h4 className="patient-title">Your Information</h4>
                <div className="patient-card">
                  <div className="patient-grid">
                    <div className="patient-field">
                      <p className="field-label">Patient Name</p>
                      <p className="field-value">{patientProfile.name}</p>
                    </div>
                    <div className="patient-field">
                      <p className="field-label">Patient ID</p>
                      <p className="field-value">{patientProfile.id}</p>
                    </div>
                    <div className="patient-field">
                      <p className="field-label">Age</p>
                      <p className="field-value">{patientProfile.age}</p>
                    </div>
                    <div className="patient-field">
                      <p className="field-label">Last Scan Date</p>
                      <p className="field-value">{dashboardStats.lastScanDate ? formatDate(dashboardStats.lastScanDate) : 'No scans yet'}</p>
                    </div>
                  </div>

                  <div className="patient-notes">
                    <p className="notes-label">Clinical Notes</p>
                    <p className="notes-text">{patientProfile.clinicalNotes}</p>
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
                <p>View and manage your uploaded CT scans and results. Total scans: {scanHistory.length}</p>
              </div>

              {scanHistory.length > 0 ? (
                <div className="uploads-table-container">
                  <table className="uploads-table">
                    <thead>
                      <tr>
                        <th>Scan Date</th>
                        <th>Risk Level</th>
                        <th>Findings</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scanHistory.map(scan => (
                        <tr key={scan.scanId}>
                          <td>{formatDate(scan.uploadTime)}</td>
                          <td>
                            <span className={`status-badge risk-${scan.results?.riskLevel || 'none'}`}>
                              {(scan.results?.riskLevel || 'none').toUpperCase()}
                            </span>
                          </td>
                          <td>{scan.results?.detected ? 'Areas Detected' : 'None Detected'}</td>
                          <td>
                            <div className="table-actions">
                              <button
                                className="table-action-button view"
                                onClick={() => handleViewScan(scan)}
                                type="button"
                                title="View Results"
                              >
                                <EyeIcon size={16} /> View
                              </button>
                              <button
                                className="table-action-button delete"
                                onClick={() => handleDeleteScan(scan.scanId)}
                                type="button"
                                title="Delete Scan"
                              >
                                <Trash2 size={16} /> Delete
                              </button>
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
                    onClick={() => setActiveTab('home')}
                    type="button"
                  >
                    Go to Home to Upload
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

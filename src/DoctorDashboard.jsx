import React, { useState, useEffect } from 'react';
import { Users, FileText, Layers, Settings, LogOut, Bell, Search, Home, Activity, Calendar, MessageCircle } from 'lucide-react';
import './Dashboard.css';
import ScanCommentThread from './components/ScanCommentThread';
import ScanCommentForm from './components/ScanCommentForm';
import {
  getAllPatients,
  getAllScans,
  getDashboardStats,
  formatDate,
  getScanCommentCount
} from './utils/unifiedDataManager';

const DoctorDashboard = ({ username, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [scans, setScans] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedScan, setSelectedScan] = useState(null);
  const [replyToComment, setReplyToComment] = useState(null);
  const [commentRefresh, setCommentRefresh] = useState(0);

  // Current user object for comments
  const currentUser = {
    id: 'doctor_' + username,
    name: 'Dr. ' + username,
    role: 'doctor'
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allScans = getAllScans();
    setPatients(getAllPatients());
    setScans(allScans);
    setStats(getDashboardStats());

    // Auto-select first scan if none selected
    if (!selectedScan && allScans.length > 0) {
      setSelectedScan(allScans[0]);
    }
  };

  const handleCommentSuccess = () => {
    setCommentRefresh(prev => prev + 1);
    setReplyToComment(null);
  };

  const handleReply = (comment) => {
    setReplyToComment(comment);
  };

  // Get recent scans with patient names
  const recentScans = scans.slice(0, 5).map(scan => {
    const patient = patients.find(p => p.id === scan.patientId);
    return {
      ...scan,
      patientName: patient?.fullName || scan.patientId,
      result: scan.results?.detected ? 'Areas Detected' : 'Reviewed'
    };
  });

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="logo-section">
            <img src="/assets/logo-medic.jpg" alt="PneumAI" className="dashboard-logo-img" />
            <h2 className="dashboard-logo">PneumAI</h2>
            <span className="doctor-badge">Doctor</span>
          </div>
          <div className="admin-actions">
            <button className="topbar-button">
              <Bell className="topbar-icon" />
            </button>
            <div className="user-info">
              <div className="user-avatar doctor">
                <span className="user-initials">{username.charAt(0).toUpperCase()}</span>
              </div>
              <span className="username">Dr. {username}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-main-container">
          <div className="dashboard-sidebar">
            <div className="sidebar-menu">
              <button
                className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <Home className="sidebar-icon" />
                <span>Dashboard</span>
              </button>
              <button
                className={`sidebar-item ${activeTab === 'patients' ? 'active' : ''}`}
                onClick={() => setActiveTab('patients')}
              >
                <Users className="sidebar-icon" />
                <span>My Patients</span>
              </button>
              <button
                className={`sidebar-item ${activeTab === 'scans' ? 'active' : ''}`}
                onClick={() => setActiveTab('scans')}
              >
                <Layers className="sidebar-icon" />
                <span>CT Scans</span>
              </button>
              <button
                className={`sidebar-item ${activeTab === 'appointments' ? 'active' : ''}`}
                onClick={() => setActiveTab('appointments')}
              >
                <Calendar className="sidebar-icon" />
                <span>Appointments</span>
              </button>
              <button
                className={`sidebar-item ${activeTab === 'messages' ? 'active' : ''}`}
                onClick={() => setActiveTab('messages')}
              >
                <MessageCircle className="sidebar-icon" />
                <span>Messages</span>
              </button>
              <button
                className={`sidebar-item ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('reports')}
              >
                <FileText className="sidebar-icon" />
                <span>Reports</span>
              </button>
              <button
                className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="sidebar-icon" />
                <span>Settings</span>
              </button>
            </div>
            <div className="sidebar-footer">
              <button className="logout-button" onClick={onLogout}>
                <LogOut className="sidebar-icon" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          <div className="dashboard-content doctor-content">
            {activeTab === 'dashboard' && (
              <>
                <div className="admin-header">
                  <h1>Doctor Dashboard</h1>
                  <div className="search-bar">
                    <Search className="search-icon" />
                    <input type="text" placeholder="Search patients" />
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-cards-row">
                  <div className="stat-card">
                    <div className="stat-card-icon patients">
                      <Users size={24} />
                    </div>
                    <div className="stat-card-content">
                      <p className="stat-card-label">Total Patients</p>
                      <h3 className="stat-card-value">{stats.totalPatients || 0}</h3>
                      <p className="stat-card-change positive">+{stats.newPatientsThisMonth || 0} this month</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-card-icon scans">
                      <Layers size={24} />
                    </div>
                    <div className="stat-card-content">
                      <p className="stat-card-label">Scans Reviewed</p>
                      <h3 className="stat-card-value">{stats.totalScans || 0}</h3>
                      <p className="stat-card-change positive">+{stats.scansThisMonth || 0} this month</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-card-icon appointments">
                      <Calendar size={24} />
                    </div>
                    <div className="stat-card-content">
                      <p className="stat-card-label">Appointments</p>
                      <h3 className="stat-card-value">{stats.upcomingAppointments || 0}</h3>
                      <p className="stat-card-change">Upcoming</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-card-icon urgent">
                      <Activity size={24} />
                    </div>
                    <div className="stat-card-content">
                      <p className="stat-card-label">High Risk Scans</p>
                      <h3 className="stat-card-value">{stats.highRiskScans || 0}</h3>
                      <p className="stat-card-change warning">Requires attention</p>
                    </div>
                  </div>
                </div>

                {/* Recent Scans */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3>Recent CT Scans</h3>
                    <button className="view-all-button">View All</button>
                  </div>
                  <div className="scans-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Patient Name</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentScans.length > 0 ? (
                          recentScans.map(scan => (
                            <tr key={scan.scanId}>
                              <td>{scan.patientName}</td>
                              <td>{formatDate(scan.uploadTime)}</td>
                              <td>
                                <span className={`status-badge ${
                                  scan.result === 'Reviewed' ? 'success' :
                                  scan.result === 'Areas Detected' ? 'warning' : 'info'
                                }`}>
                                  {scan.result}
                                </span>
                              </td>
                              <td>
                                <button className="table-action-button">Review</button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                              No scans available yet. Scans uploaded by patients will appear here.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Patients Requiring Attention */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3>Patients Requiring Attention</h3>
                  </div>
                  <div className="patients-attention-list">
                    {patients.filter(p => p.status !== 'Stable').map(patient => (
                      <div className="patient-attention-item" key={patient.id}>
                        <div className="patient-attention-info">
                          <h4>{patient.name}</h4>
                          <p>ID: {patient.id} | Age: {patient.age} | Last Visit: {patient.lastVisit}</p>
                        </div>
                        <div className="patient-attention-status">
                          <span className={`status-badge ${
                            patient.status === 'Urgent' ? 'danger' : 'warning'
                          }`}>
                            {patient.status}
                          </span>
                          <button className="action-button-small">View Details</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'patients' && (
              <>
                <div className="admin-header">
                  <h1>My Patients</h1>
                  <div className="search-bar">
                    <Search className="search-icon" />
                    <input type="text" placeholder="Search patients" />
                  </div>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Patient ID</th>
                        <th>Full Name</th>
                        <th>Age</th>
                        <th>Last Visit</th>
                        <th>Status</th>
                        <th>Risk Level</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.length > 0 ? (
                        patients.map(patient => {
                          // Get patient's scans to determine risk level
                          const patientScans = scans.filter(s => s.patientId === patient.id);
                          const highestRisk = patientScans.reduce((max, scan) => {
                            const riskLevels = { none: 0, low: 1, medium: 2, high: 3 };
                            const scanRisk = riskLevels[scan.results?.riskLevel] || 0;
                            return scanRisk > max ? scanRisk : max;
                          }, 0);
                          const riskLevel = ['none', 'low', 'medium', 'high'][highestRisk];

                          return (
                            <tr key={patient.id}>
                              <td>{patient.id}</td>
                              <td>{patient.fullName}</td>
                              <td>{patient.age}</td>
                              <td>{patient.lastVisit || 'N/A'}</td>
                              <td>
                                <span className={`status-badge ${
                                  patient.status === 'Stable' ? 'success' :
                                  patient.status === 'Urgent' ? 'danger' : 'warning'
                                }`}>
                                  {patient.status || 'N/A'}
                                </span>
                              </td>
                              <td>
                                <span className={`risk-badge-large risk-${riskLevel}`}>
                                  {riskLevel.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button className="table-action-button">View</button>
                                  <button className="table-action-button">Edit</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                            No patients registered yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === 'scans' && (
              <>
                <div className="admin-header">
                  <h1>CT Scan Analysis & Review</h1>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <select
                      className="scan-selector"
                      value={selectedScan?.id || ''}
                      onChange={(e) => {
                        const scan = scans.find(s => s.id === e.target.value);
                        setSelectedScan(scan);
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.9rem'
                      }}
                    >
                      {scans.map(scan => {
                        const patient = patients.find(p => p.id === scan.patientId);
                        const commentCount = getScanCommentCount(scan.id);
                        return (
                          <option key={scan.id} value={scan.id}>
                            {patient?.fullName || scan.patientId} - {formatDate(scan.uploadTime)}
                            {commentCount > 0 && ` (${commentCount} comments)`}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {selectedScan ? (
                  <div className="doctor-scans-grid">
                    <div className="scan-viewer-large">
                      <img
                        src={selectedScan.annotatedImageUrl || "/assets/lungs.png"}
                        alt="CT Scan"
                        className="scan-image-large"
                      />
                      <div className="scan-controls">
                        <button
                          className="scan-control-button"
                          onClick={() => {
                            const currentIndex = scans.findIndex(s => s.id === selectedScan.id);
                            if (currentIndex > 0) {
                              setSelectedScan(scans[currentIndex - 1]);
                            }
                          }}
                          disabled={scans.findIndex(s => s.id === selectedScan.id) === 0}
                        >
                          Previous
                        </button>
                        <button
                          className="scan-control-button"
                          onClick={() => {
                            const currentIndex = scans.findIndex(s => s.id === selectedScan.id);
                            if (currentIndex < scans.length - 1) {
                              setSelectedScan(scans[currentIndex + 1]);
                            }
                          }}
                          disabled={scans.findIndex(s => s.id === selectedScan.id) === scans.length - 1}
                        >
                          Next
                        </button>
                      </div>
                    </div>

                    <div className="scan-analysis-panel">
                      <h3>AI Analysis Results</h3>
                      <div className="analysis-metrics">
                        <div className="metric-item">
                          <span className="metric-label">Analysis Status</span>
                          <span className="metric-value">{selectedScan.status || 'Completed'}</span>
                        </div>
                        <div className="metric-item">
                          <span className="metric-label">Attention Level</span>
                          <span className={`risk-badge-large risk-${selectedScan.results?.riskLevel || 'medium'}`}>
                            {selectedScan.results?.detected ? 'REQUIRES REVIEW' : 'REVIEWED'}
                          </span>
                        </div>
                        <div className="metric-item">
                          <span className="metric-label">Findings</span>
                          <span className="metric-value">
                            {selectedScan.results?.detected ? 'Abnormalities Present' : 'No Issues Detected'}
                          </span>
                        </div>
                        <div className="metric-item">
                          <span className="metric-label">Comments</span>
                          <span className="metric-value">{getScanCommentCount(selectedScan.id)}</span>
                        </div>
                      </div>

                      <div className="analysis-actions">
                        <button className="primary-button">Generate Report</button>
                        <button className="secondary-button">Request Second Opinion</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                    <p>No scans available for review</p>
                  </div>
                )}

                {selectedScan && (
                  <div style={{ marginTop: '2rem' }}>
                    <ScanCommentForm
                      scanId={selectedScan.id}
                      currentUser={currentUser}
                      parentComment={replyToComment}
                      onSuccess={handleCommentSuccess}
                      onCancel={() => setReplyToComment(null)}
                    />

                    <ScanCommentThread
                      scanId={selectedScan.id}
                      currentUser={currentUser}
                      onReply={handleReply}
                      onDelete={handleCommentSuccess}
                      refreshTrigger={commentRefresh}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;

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
                  <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>Review patient CT scans and provide professional feedback</p>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {/* Statistics Cards */}
                  <div className="dashboard-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <Layers className="sidebar-icon" style={{ color: '#7B6BBE' }} />
                      <h3 style={{ margin: 0 }}>Scan Statistics</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div style={{ padding: '1rem', background: '#f0f9ff', borderRadius: '8px', textAlign: 'center' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.875rem' }}>Total Scans</h4>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0284c7', margin: 0 }}>{scans.length}</p>
                      </div>
                      <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.875rem' }}>No Risk</h4>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>
                          {scans.filter(s => s.results?.riskLevel === 'none').length}
                        </p>
                      </div>
                      <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px', textAlign: 'center' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.875rem' }}>Attention Needed</h4>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ea580c', margin: 0 }}>
                          {scans.filter(s => s.results?.riskLevel === 'medium' || s.results?.riskLevel === 'low').length}
                        </p>
                      </div>
                      <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: '8px', textAlign: 'center' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.875rem' }}>High Risk</h4>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626', margin: 0 }}>
                          {scans.filter(s => s.results?.riskLevel === 'high').length}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Scans Table */}
                  <div className="dashboard-card">
                    <h3>All Patient CT Scans</h3>
                    {scans.length > 0 ? (
                      <div className="admin-table-container">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Patient</th>
                              <th>Upload Date</th>
                              <th>Risk Level</th>
                              <th>Detection</th>
                              <th>Comments</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {scans.map(scan => {
                              const scanId = scan.scanId || scan.id;
                              const patient = patients.find(p => p.id === scan.patientId);
                              const commentCount = getScanCommentCount(scanId);
                              return (
                                <tr key={scanId}>
                                  <td><strong>{patient?.fullName || patient?.firstName || scan.patientId}</strong></td>
                                  <td>{formatDate(scan.uploadTime)}</td>
                                  <td>
                                    <span className={`status-badge ${
                                      scan.results?.riskLevel === 'none' ? 'success' :
                                      scan.results?.riskLevel === 'low' ? 'info' :
                                      scan.results?.riskLevel === 'medium' ? 'warning' :
                                      scan.results?.riskLevel === 'high' ? 'danger' : ''
                                    }`}>
                                      {(scan.results?.riskLevel || 'unknown').toUpperCase()}
                                    </span>
                                  </td>
                                  <td>
                                    {scan.results?.detected ? (
                                      <span className="badge-warning">Areas Detected</span>
                                    ) : (
                                      <span className="badge-success">None Detected</span>
                                    )}
                                  </td>
                                  <td>
                                    <span style={{
                                      padding: '0.25rem 0.5rem',
                                      background: commentCount > 0 ? '#dbeafe' : '#f3f4f6',
                                      color: commentCount > 0 ? '#1e40af' : '#6b7280',
                                      borderRadius: '4px',
                                      fontSize: '0.875rem',
                                      fontWeight: '500'
                                    }}>
                                      {commentCount} comment{commentCount !== 1 ? 's' : ''}
                                    </span>
                                  </td>
                                  <td>
                                    <button
                                      className="table-action-button"
                                      onClick={() => setSelectedScan(scan)}
                                      style={{ background: 'linear-gradient(135deg, #7B6BBE 0%, #9B8BCE 100%)', color: 'white', border: 'none' }}
                                    >
                                      Review & Comment
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                        <Layers size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
                        <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>No CT scans uploaded yet</p>
                        <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Scans uploaded by patients will appear here for review</p>
                      </div>
                    )}
                  </div>

                  {/* Selected Scan Detail View */}
                  {selectedScan && (
                    <div className="dashboard-card" style={{ padding: '2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>Scan Review: {patients.find(p => p.id === selectedScan.patientId)?.fullName || selectedScan.patientId}</h3>
                        <button
                          onClick={() => setSelectedScan(null)}
                          style={{
                            background: 'none',
                            border: '1px solid #d1d5db',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: '#6b7280'
                          }}
                        >
                          Close
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                        <div>
                          <img
                            src={selectedScan.annotatedImageUrl || selectedScan.imageUrl || "/assets/lungs.png"}
                            alt="CT Scan"
                            style={{
                              width: '100%',
                              borderRadius: '8px',
                              border: '2px solid #e5e7eb',
                              maxHeight: '400px',
                              objectFit: 'contain'
                            }}
                          />
                        </div>
                        <div>
                          <h4 style={{ marginTop: 0 }}>AI Analysis Results</h4>
                          <div style={{ display: 'grid', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Risk Level</span>
                              <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.25rem', fontWeight: 'bold', color: '#374151' }}>
                                {(selectedScan.results?.riskLevel || 'Unknown').toUpperCase()}
                              </p>
                            </div>
                            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Detection Status</span>
                              <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.25rem', fontWeight: 'bold', color: '#374151' }}>
                                {selectedScan.results?.detected ? 'Areas Detected' : 'No Issues Detected'}
                              </p>
                            </div>
                            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Confidence</span>
                              <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.25rem', fontWeight: 'bold', color: '#374151' }}>
                                {((selectedScan.results?.confidence || 0) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '2rem' }}>
                        <h4>Professional Feedback & Comments</h4>
                        <ScanCommentForm
                          scanId={selectedScan.scanId || selectedScan.id}
                          currentUser={currentUser}
                          parentComment={replyToComment}
                          onSuccess={handleCommentSuccess}
                          onCancel={() => setReplyToComment(null)}
                        />

                        <ScanCommentThread
                          scanId={selectedScan.scanId || selectedScan.id}
                          currentUser={currentUser}
                          onReply={handleReply}
                          onDelete={handleCommentSuccess}
                          refreshTrigger={commentRefresh}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;

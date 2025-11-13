import React, { useState, useEffect } from 'react';
import { Users, FileText, Layers, Settings, LogOut, Bell, Search, Home, Activity, Calendar, MessageCircle } from 'lucide-react';
import './Dashboard.css';
import {
  getAllPatients,
  getAllScans,
  getDashboardStats,
  formatDate
} from './utils/unifiedDataManager';

const DoctorDashboard = ({ username, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [scans, setScans] = useState([]);
  const [stats, setStats] = useState({});

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPatients(getAllPatients());
    setScans(getAllScans());
    setStats(getDashboardStats());
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
                  <h1>CT Scan Analysis</h1>
                  <button className="admin-button">Upload New Scan</button>
                </div>

                <div className="doctor-scans-grid">
                  <div className="scan-viewer-large">
                    <img src="/assets/lungs.png" alt="CT Scan" className="scan-image-large" />
                    <div className="scan-controls">
                      <button className="scan-control-button">Previous</button>
                      <button className="scan-control-button">Next</button>
                    </div>
                  </div>

                  <div className="scan-analysis-panel">
                    <h3>AI Analysis Results</h3>
                    <div className="analysis-metrics">
                      <div className="metric-item">
                        <span className="metric-label">Analysis Status</span>
                        <span className="metric-value">Areas Detected</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Attention Level</span>
                        <span className="risk-badge-large risk-high">REQUIRES REVIEW</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Findings</span>
                        <span className="metric-value">Abnormalities Present</span>
                      </div>
                    </div>

                    <div className="analysis-recommendations">
                      <h4>Suggested Considerations</h4>
                      <ul className="recommendations-list">
                        <li>Healthcare professional evaluation recommended</li>
                        <li>Further diagnostic procedures may be beneficial</li>
                        <li>Review patient medical history</li>
                        <li>Additional imaging may provide more information</li>
                      </ul>
                    </div>

                    <div className="analysis-actions">
                      <button className="primary-button">Generate Report</button>
                      <button className="secondary-button">Request Second Opinion</button>
                    </div>
                  </div>
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

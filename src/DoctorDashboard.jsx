import React, { useState } from 'react';
import { Users, FileText, Layers, Settings, LogOut, Bell, Search, Home, Activity, Calendar, MessageCircle } from 'lucide-react';
import './Dashboard.css';

const DoctorDashboard = ({ username, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Sample patient data
  const [patients] = useState([
    { id: 'PAT-2023-8642', name: 'Robert Johnson', age: 54, lastVisit: 'May 3, 2025', status: 'Follow-up Required', riskLevel: 'medium' },
    { id: 'PAT-2023-7512', name: 'Sarah Williams', age: 62, lastVisit: 'May 1, 2025', status: 'Stable', riskLevel: 'low' },
    { id: 'PAT-2023-9215', name: 'Michael Brown', age: 47, lastVisit: 'April 28, 2025', status: 'Urgent', riskLevel: 'high' },
    { id: 'PAT-2023-6381', name: 'Emily Davis', age: 58, lastVisit: 'April 25, 2025', status: 'Stable', riskLevel: 'none' }
  ]);

  const [recentScans] = useState([
    { id: 1, patient: 'Robert Johnson', date: 'May 3, 2025', result: 'Areas Detected' },
    { id: 2, patient: 'Sarah Williams', date: 'May 1, 2025', result: 'Reviewed' },
    { id: 3, patient: 'Michael Brown', date: 'April 28, 2025', result: 'Areas Detected' }
  ]);

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
                      <h3 className="stat-card-value">48</h3>
                      <p className="stat-card-change positive">+8 this month</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-card-icon scans">
                      <Layers size={24} />
                    </div>
                    <div className="stat-card-content">
                      <p className="stat-card-label">Scans Reviewed</p>
                      <h3 className="stat-card-value">156</h3>
                      <p className="stat-card-change positive">+23 this week</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-card-icon appointments">
                      <Calendar size={24} />
                    </div>
                    <div className="stat-card-content">
                      <p className="stat-card-label">Appointments</p>
                      <h3 className="stat-card-value">12</h3>
                      <p className="stat-card-change">3 today</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-card-icon urgent">
                      <Activity size={24} />
                    </div>
                    <div className="stat-card-content">
                      <p className="stat-card-label">Urgent Cases</p>
                      <h3 className="stat-card-value">5</h3>
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
                        {recentScans.map(scan => (
                          <tr key={scan.id}>
                            <td>{scan.patient}</td>
                            <td>{scan.date}</td>
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
                        ))}
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
                      {patients.map(patient => (
                        <tr key={patient.id}>
                          <td>{patient.id}</td>
                          <td>{patient.name}</td>
                          <td>{patient.age}</td>
                          <td>{patient.lastVisit}</td>
                          <td>
                            <span className={`status-badge ${
                              patient.status === 'Stable' ? 'success' :
                              patient.status === 'Urgent' ? 'danger' : 'warning'
                            }`}>
                              {patient.status}
                            </span>
                          </td>
                          <td>
                            <span className={`risk-badge-large risk-${patient.riskLevel}`}>
                              {patient.riskLevel.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="table-action-button">View</button>
                              <button className="table-action-button">Edit</button>
                            </div>
                          </td>
                        </tr>
                      ))}
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

import React, { useState } from 'react';
import { Users, FileText, Layers, Settings, HelpCircle, LogOut, Bell, Search, Home } from 'lucide-react';
import './Dashboard.css';

const AdminDashboard = ({ username, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="logo-section">
            <h2 className="dashboard-logo">LungEvity</h2>
            <span className="admin-badge">Admin</span>
          </div>
          <div className="admin-actions">
            <button className="topbar-button">
              <Bell className="topbar-icon" />
            </button>
            <div className="user-info">
              <div className="user-avatar admin">
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
                <span>Patients</span>
              </button>
              <button 
                className={`sidebar-item ${activeTab === 'scans' ? 'active' : ''}`}
                onClick={() => setActiveTab('scans')}
              >
                <Layers className="sidebar-icon" />
                <span>CT Scans</span>
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
              <button 
                className={`sidebar-item ${activeTab === 'help' ? 'active' : ''}`}
                onClick={() => setActiveTab('help')}
              >
                <HelpCircle className="sidebar-icon" />
                <span>Help</span>
              </button>
            </div>
            <div className="sidebar-footer">
              <button className="logout-button" onClick={onLogout}>
                <LogOut className="sidebar-icon" />
                <span>Logout</span>
              </button>
            </div>
          </div>
          
          <div className="dashboard-content">
            <div className="admin-header">
              <h1>Patient Management</h1>
              <div className="search-bar">
                <Search className="search-icon" />
                <input type="text" placeholder="Search patients" />
              </div>
              <button className="admin-button">Add New Patient</button>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>PAT-2023-8642</td>
                    <td>Robert Johnson</td>
                    <td>54</td>
                    <td>May 3, 2025</td>
                    <td>
                      <span className="status-badge warning">Follow-up Required</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="table-action-button">View</button>
                        <button className="table-action-button">Edit</button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>PAT-2023-7512</td>
                    <td>Sarah Williams</td>
                    <td>62</td>
                    <td>May 1, 2025</td>
                    <td>
                      <span className="status-badge success">Stable</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="table-action-button">View</button>
                        <button className="table-action-button">Edit</button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>PAT-2023-9215</td>
                    <td>Michael Brown</td>
                    <td>47</td>
                    <td>April 28, 2025</td>
                    <td>
                      <span className="status-badge danger">Urgent</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="table-action-button">View</button>
                        <button className="table-action-button">Edit</button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>PAT-2023-6381</td>
                    <td>Emily Davis</td>
                    <td>58</td>
                    <td>April 25, 2025</td>
                    <td>
                      <span className="status-badge success">Stable</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="table-action-button">View</button>
                        <button className="table-action-button">Edit</button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>PAT-2023-5247</td>
                    <td>James Wilson</td>
                    <td>71</td>
                    <td>April 22, 2025</td>
                    <td>
                      <span className="status-badge warning">Follow-up Required</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="table-action-button">View</button>
                        <button className="table-action-button">Edit</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="pagination">
              <button className="pagination-button active">1</button>
              <button className="pagination-button">2</button>
              <button className="pagination-button">3</button>
              <button className="pagination-button">Next</button>
            </div>
            
            <div className="dashboard-cards-row">
              <div className="dashboard-card">
                <h3>Patient Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <h4>Total Patients</h4>
                    <p className="stat-value">248</p>
                  </div>
                  <div className="stat-item">
                    <h4>New This Month</h4>
                    <p className="stat-value">32</p>
                  </div>
                  <div className="stat-item">
                    <h4>Requiring Follow-up</h4>
                    <p className="stat-value">45</p>
                  </div>
                  <div className="stat-item">
                    <h4>Critical Cases</h4>
                    <p className="stat-value">8</p>
                  </div>
                </div>
              </div>
              
              <div className="dashboard-card">
                <h3>Recent AI Analysis</h3>
                <div className="ai-stats">
                  <div className="ai-stat-item">
                    <h4>Scans Analyzed</h4>
                    <p className="ai-stat-value">156</p>
                  </div>
                  <div className="ai-stat-item">
                    <h4>Detection Rate</h4>
                    <p className="ai-stat-value">92.7%</p>
                  </div>
                  <div className="ai-progress-container">
                    <h4>System Performance</h4>
                    <div className="ai-progress-bar">
                      <div className="ai-progress" style={{width: '94%'}}></div>
                    </div>
                    <p>94% - Excellent</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

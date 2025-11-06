import React, { useState } from 'react';
import { Users, FileText, Layers, Settings, HelpCircle, LogOut, Bell, Search, Home, UserPlus, Stethoscope } from 'lucide-react';
import './Dashboard.css';

const AdminDashboard = ({ username, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctors, setDoctors] = useState(JSON.parse(localStorage.getItem('pneumAIDoctors') || '[]'));
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    password: '',
    specialty: '',
    phone: '',
    image: ''
  });

  const handleCreateDoctor = (e) => {
    e.preventDefault();

    const doctorWithId = {
      ...newDoctor,
      id: `DOC-${Date.now()}`,
      createdAt: new Date().toISOString(),
      userType: 'doctor'
    };

    // Add to doctors list
    const updatedDoctors = [...doctors, doctorWithId];
    setDoctors(updatedDoctors);
    localStorage.setItem('pneumAIDoctors', JSON.stringify(updatedDoctors));

    // Add to users for login
    const users = JSON.parse(localStorage.getItem('pneumAIUsers') || '[]');
    users.push({
      username: doctorWithId.name,
      email: doctorWithId.email,
      password: doctorWithId.password,
      userType: 'doctor',
      specialty: doctorWithId.specialty,
      registeredAt: new Date().toISOString()
    });
    localStorage.setItem('pneumAIUsers', JSON.stringify(users));

    alert(`Doctor ${doctorWithId.name} created successfully!`);
    setShowDoctorModal(false);
    setNewDoctor({
      name: '',
      email: '',
      password: '',
      specialty: '',
      phone: '',
      image: ''
    });
  };

  const handleDeleteDoctor = (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      const updatedDoctors = doctors.filter(doc => doc.id !== doctorId);
      setDoctors(updatedDoctors);
      localStorage.setItem('pneumAIDoctors', JSON.stringify(updatedDoctors));
      alert('Doctor deleted successfully!');
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="logo-section">
            <h2 className="dashboard-logo">PneumAI</h2>
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
                className={`sidebar-item ${activeTab === 'doctors' ? 'active' : ''}`}
                onClick={() => setActiveTab('doctors')}
              >
                <Stethoscope className="sidebar-icon" />
                <span>Doctors</span>
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
            {activeTab === 'dashboard' && (
              <>
                <div className="admin-header">
                  <h1>Dashboard Overview</h1>
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
                    <h3>Recent AI Analysis Activity</h3>
                    <div className="ai-stats">
                      <div className="ai-stat-item">
                        <h4>Scans Processed</h4>
                        <p className="ai-stat-value">156</p>
                      </div>
                      <div className="ai-stat-item">
                        <h4>Awaiting Review</h4>
                        <p className="ai-stat-value">12</p>
                      </div>
                      <div className="ai-progress-container">
                        <h4>System Status</h4>
                        <p>Operating Normally</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'patients' && (
              <>
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
              </>
            )}

            {activeTab === 'doctors' && (
              <>
                <div className="admin-header">
                  <h1>Doctor Management</h1>
                  <div className="search-bar">
                    <Search className="search-icon" />
                    <input type="text" placeholder="Search doctors" />
                  </div>
                  <button className="admin-button" onClick={() => setShowDoctorModal(true)}>
                    <UserPlus size={18} /> Add New Doctor
                  </button>
                </div>

                <div className="doctors-grid-admin">
                  {doctors.length > 0 ? (
                    doctors.map(doctor => (
                      <div className="doctor-card-admin" key={doctor.id}>
                        <div className="doctor-image-container">
                          <img
                            src={doctor.image || '/assets/ai-doc1.jpg'}
                            alt={doctor.name}
                            className="doctor-image-admin"
                          />
                        </div>
                        <div className="doctor-info-admin">
                          <h3>{doctor.name}</h3>
                          <p className="doctor-specialty">{doctor.specialty}</p>
                          <p className="doctor-email">{doctor.email}</p>
                          <p className="doctor-phone">{doctor.phone}</p>
                          <div className="doctor-actions">
                            <button className="edit-doctor-button">Edit</button>
                            <button
                              className="delete-doctor-button"
                              onClick={() => handleDeleteDoctor(doctor.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-doctors-message">
                      <Stethoscope size={48} color="#999" />
                      <h3>No Doctors Yet</h3>
                      <p>Click "Add New Doctor" to create the first doctor account.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Doctor Creation Modal */}
      {showDoctorModal && (
        <div className="modal-overlay" onClick={() => setShowDoctorModal(false)}>
          <div className="modal-container doctor-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Doctor Account</h2>
              <button className="close-button" onClick={() => setShowDoctorModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="doctor-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="doctor-name">Doctor Name *</label>
                  <input
                    type="text"
                    id="doctor-name"
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                    required
                    placeholder="Dr. John Smith"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="doctor-specialty">Role *</label>
                  <select
                    id="doctor-specialty"
                    value={newDoctor.specialty}
                    onChange={(e) => setNewDoctor({...newDoctor, specialty: e.target.value})}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="General Practitioner">General Practitioner</option>
                    <option value="Healthcare Professional">Healthcare Professional</option>
                    <option value="Medical Specialist">Medical Specialist</option>
                    <option value="Clinical Consultant">Clinical Consultant</option>
                    <option value="Medical Reviewer">Medical Reviewer</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="doctor-email">Email Address *</label>
                  <input
                    type="email"
                    id="doctor-email"
                    value={newDoctor.email}
                    onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                    required
                    placeholder="doctor@pneumai.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="doctor-phone">Phone Number</label>
                  <input
                    type="tel"
                    id="doctor-phone"
                    value={newDoctor.phone}
                    onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="doctor-password">Password *</label>
                  <input
                    type="password"
                    id="doctor-password"
                    value={newDoctor.password}
                    onChange={(e) => setNewDoctor({...newDoctor, password: e.target.value})}
                    required
                    placeholder="Minimum 8 characters"
                    minLength="8"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="doctor-image">Profile Image URL</label>
                  <select
                    id="doctor-image"
                    value={newDoctor.image}
                    onChange={(e) => setNewDoctor({...newDoctor, image: e.target.value})}
                  >
                    <option value="">Select Image</option>
                    <option value="/assets/ai-doc1.jpg">AI Doctor 1</option>
                    <option value="/assets/ai-doc2.jpg">AI Doctor 2</option>
                    <option value="/assets/ai-doc3.png">AI Doctor 3</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowDoctorModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Create Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

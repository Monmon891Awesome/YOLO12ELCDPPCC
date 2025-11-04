import React, { useState, useEffect } from 'react';
import { Stethoscope, Users, FileText, HelpCircle, Home, Menu, X, Upload, ChevronRight, LogIn, Activity, Layers } from 'lucide-react';
import './LungEvity.css'; // Import the CSS file
import './Login.css'; // Import login CSS
import './Dashboard.css'; // Import dashboard CSS
import './PatientRegistration.css'; // Import patient registration CSS
import Login from './Login'; // Import Login component
import PatientRegistration from './PatientRegistration'; // Import Patient Registration component
import PatientDashboard from './PatientDashboard'; // Import Patient Dashboard
import AdminDashboard from './AdminDashboard'; // Import Admin Dashboard

const LungevityUI = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Authentication states
  const [showLogin, setShowLogin] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null); // 'patient' or 'admin'
  const [username, setUsername] = useState('');
  
  // Check if user was previously logged in
  useEffect(() => {
    const savedSession = JSON.parse(localStorage.getItem('lungEvitySession') || 'null');
    if (savedSession) {
      setIsLoggedIn(true);
      setUserType(savedSession.userType);
      setUsername(savedSession.username);
    }
    
    // Initialize demo admin account if it doesn't exist
    const users = JSON.parse(localStorage.getItem('lungEvityUsers') || '[]');
    const adminExists = users.some(user => user.email === 'admin@lungevity.com');
    if (!adminExists) {
      users.push({
        username: 'Admin',
        email: 'admin@lungevity.com',
        password: 'admin123',
        userType: 'admin',
        registeredAt: new Date().toISOString()
      });
      localStorage.setItem('lungEvityUsers', JSON.stringify(users));
    }
  }, []);
  
  // Handle login button click
  const handleLoginClick = () => {
    setShowLogin(true);
    setIsMenuOpen(false); // Close mobile menu if open
  };
  
  // Handle login form submission
  const handleLogin = (type, user) => {
    setIsLoggedIn(true);
    setUserType(type);
    setUsername(user);
    setShowLogin(false);
    
    // Save session to localStorage
    const session = { userType: type, username: user };
    localStorage.setItem('lungEvitySession', JSON.stringify(session));
  };
  
  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType(null);
    setUsername('');
    
    // Remove session from localStorage
    localStorage.removeItem('lungEvitySession');
  };
  
  // Close login modal
  const handleCloseLogin = () => {
    setShowLogin(false);
  };
  
  // Open registration form
  const handleRegisterClick = () => {
    setShowLogin(false);
    setShowRegistration(true);
  };
  
  // Close registration form
  const handleCloseRegistration = () => {
    setShowRegistration(false);
  };
  
  // Return to login from registration
  const handleBackToLogin = () => {
    setShowRegistration(false);
    setShowLogin(true);
  };
  
  // If user is logged in, show the appropriate dashboard
  if (isLoggedIn) {
    if (userType === 'patient') {
      return <PatientDashboard username={username} onLogout={handleLogout} />;
    } else if (userType === 'admin') {
      return <AdminDashboard username={username} onLogout={handleLogout} />;
    }
  }
  
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container header-container">
          <div className="logo-container">
            <Layers className="icon" />
            <h1 className="logo-text">LungEvity</h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <a href="#" className="nav-link">Home</a>
            <a href="#" className="nav-link">For Patients</a>
            <a href="#" className="nav-link">For Doctors</a>
            <a href="#" className="nav-link">Research</a>
            <a href="#" className="nav-link">About Us</a>
            <button className="sign-in-button" onClick={handleLoginClick} type="button">
              <LogIn className="icon-sm" /> Sign In
            </button>
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="mobile-menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            type="button"
          >
            {isMenuOpen ? <X className="icon" /> : <Menu className="icon" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mobile-nav">
            <div className="container mobile-nav-container">
              <a href="#" className="mobile-nav-link">Home</a>
              <a href="#" className="mobile-nav-link">For Patients</a>
              <a href="#" className="mobile-nav-link">For Doctors</a>
              <a href="#" className="mobile-nav-link">Research</a>
              <a href="#" className="mobile-nav-link">About Us</a>
              <button className="mobile-sign-in-button" onClick={handleLoginClick} type="button">
                <LogIn className="icon-sm" /> Sign In
              </button>
            </div>
          </div>
        )}
      </header>
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <h2 className="hero-title">Transforming Lung Cancer Detection and Care</h2>
            <p className="hero-description">Advanced AI-powered diagnostics paired with emotional support for patients and clinical decision support for healthcare professionals.</p>
            <div className="hero-buttons">
              <button className="hero-button-primary" onClick={handleLoginClick} type="button">
                Patient Portal
              </button>
              <button className="hero-button-secondary" onClick={handleLoginClick} type="button">
                Healthcare Professional Access
              </button>
            </div>
          </div>
          <div className="hero-image-container">
            <img 
              src="/api/placeholder/600/400" 
              alt="AI Lung Scan Analysis" 
              className="hero-image" 
            />
          </div>
        </div>
      </section>
      
      {/* Rest of the component remains unchanged */}
      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">How LungEvity Works</h2>
          
          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon-container">
                <FileText className="feature-icon icon" />
              </div>
              <h3 className="feature-title">AI-Powered Diagnostics</h3>
              <p className="feature-description">Our advanced machine learning algorithms analyze CT scans to detect early signs of lung cancer with high accuracy.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon-container">
                <Stethoscope className="feature-icon icon" />
              </div>
              <h3 className="feature-title">Clinical Decision Support</h3>
              <p className="feature-description">Pulmonologists and radiologists receive detailed insights to enhance diagnostic accuracy and treatment planning.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon-container">
                <HelpCircle className="feature-icon icon" />
              </div>
              <h3 className="feature-title">Emotional Support</h3>
              <p className="feature-description">Comprehensive resources to help patients understand their condition and manage psychological aspects of lung health.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Doctor Platform Preview */}
      <section className="platform-section">
        <div className="container">
          <h2 className="section-title">Doctor's Platform</h2>
          <p className="platform-description">
            A powerful diagnostic tool designed for pulmonologists and radiologists to analyze CT scans and detect lung cancer using our advanced AI system.
          </p>
          
          {/* Sample Dashboard */}
          <div className="dashboard-container">
            <div className="dashboard-header">
              <h3 className="dashboard-title">Doctor Dashboard</h3>
              <div className="dashboard-actions">
                <a href="#" className="dashboard-action-link">Help</a>
                <a href="#" className="dashboard-action-link">Settings</a>
                <div className="dashboard-user">
                  <div className="user-avatar">
                    <span className="user-initials">DR</span>
                  </div>
                  <span className="user-name">Dr. Rodriguez</span>
                </div>
              </div>
            </div>
            
            <div className="dashboard-content">
              {/* Sidebar */}
              <div className="dashboard-sidebar">
                <div className="sidebar-nav">
                  <button 
                    className={`sidebar-nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                    type="button"
                  >
                    <Home className="icon-sm" /> Dashboard
                  </button>
                  <button 
                    className={`sidebar-nav-button ${activeTab === 'patients' ? 'active' : ''}`}
                    onClick={() => setActiveTab('patients')}
                    type="button"
                  >
                    <Users className="icon-sm" /> Patients
                  </button>
                  <button 
                    className={`sidebar-nav-button ${activeTab === 'scans' ? 'active' : ''}`}
                    onClick={() => setActiveTab('scans')}
                    type="button"
                  >
                    <Layers className="icon-sm" /> CT Scans
                  </button>
                  <button 
                    className={`sidebar-nav-button ${activeTab === 'reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reports')}
                    type="button"
                  >
                    <FileText className="icon-sm" /> Reports
                  </button>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="dashboard-main">
                <div className="main-header">
                  <h3 className="main-title">CT Scan Analysis</h3>
                  <button type="button" className="upload-button">
                    <Upload className="icon-sm" /> Upload New Scan
                  </button>
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
                        Generate Detailed Report
                      </button>
                      <button type="button" className="secondary-button">
                        Second Opinion
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="patient-info">
                  <h4 className="patient-title">Patient Information</h4>
                  <div className="patient-card">
                    <div className="patient-grid">
                      <div className="patient-field">
                        <p className="field-label">Patient Name</p>
                        <p className="field-value">Robert Johnson</p>
                      </div>
                      <div className="patient-field">
                        <p className="field-label">Patient ID</p>
                        <p className="field-value">PAT-2023-8642</p>
                      </div>
                      <div className="patient-field">
                        <p className="field-label">Age</p>
                        <p className="field-value">54 years</p>
                      </div>
                      <div className="patient-field">
                        <p className="field-label">Scan Date</p>
                        <p className="field-value">May 3, 2025</p>
                      </div>
                    </div>
                    
                    <div className="patient-notes">
                      <p className="notes-label">Clinical Notes</p>
                      <p className="notes-text">Patient presents with persistent cough for 3 months. Former smoker (2 packs/day for 20 years, quit 5 years ago). Family history of lung cancer.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Patient Section */}
      <section className="support-section">
        <div className="container">
          <h2 className="section-title">Patient Support</h2>
          <p className="support-description">
            Our platform provides comprehensive emotional and psychological support for patients
            dealing with lung conditions and cancer diagnoses.
          </p>
          
          <div className="support-grid">
            {/* Support Card 1 */}
            <div className="support-card">
              <div className="support-icon-container">
                <Users className="support-icon icon" />
              </div>
              <h3 className="support-title">Support Communities</h3>
              <p className="support-description">Connect with others facing similar challenges through our moderated support communities.</p>
              <a href="#" className="support-link">
                Join a community <ChevronRight className="icon-sm" />
              </a>
            </div>
            
            {/* Support Card 2 */}
            <div className="support-card">
              <div className="support-icon-container">
                <FileText className="support-icon icon" />
              </div>
              <h3 className="support-title">Educational Resources</h3>
              <p className="support-description">Access comprehensive information about lung conditions, treatments, and lifestyle recommendations.</p>
              <a href="#" className="support-link">
                Browse resources <ChevronRight className="icon-sm" />
              </a>
            </div>
            
            {/* Support Card 3 */}
            <div className="support-card">
              <div className="support-icon-container">
                <HelpCircle className="support-icon icon" />
              </div>
              <h3 className="support-title">Mental Health Tools</h3>
              <p className="support-description">Guided exercises, meditation, and coping strategies to manage anxiety and stress related to diagnosis.</p>
              <a href="#" className="support-link">
                Explore tools <ChevronRight className="icon-sm" />
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Login Modal */}
      {showLogin && (
        <Login 
          onClose={handleCloseLogin} 
          onLogin={handleLogin} 
          onRegister={handleRegisterClick}
        />
      )}
      
      {/* Patient Registration Modal */}
      {showRegistration && (
        <PatientRegistration 
          onClose={handleCloseRegistration}
          onBackToLogin={handleBackToLogin}
        />
      )}
    </div>
  );
};

export default LungevityUI;

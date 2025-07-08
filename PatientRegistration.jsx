import React, { useState } from 'react';
import { User, Mail, Lock, ArrowLeft, X } from 'lucide-react';
import './PatientRegistration.css';

const PatientRegistration = ({ onClose, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 4) {
      newErrors.username = 'Username must be at least 4 characters';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Save user to localStorage
      const existingUsers = JSON.parse(localStorage.getItem('lungEvityUsers') || '[]');
      
      // Check if username or email already exists
      const existingUser = existingUsers.find(
        user => user.username === formData.username || user.email === formData.email
      );
      
      if (existingUser) {
        setIsSubmitting(false);
        if (existingUser.username === formData.username) {
          setErrors({ ...errors, username: 'Username already exists' });
        } else {
          setErrors({ ...errors, email: 'Email already exists' });
        }
        return;
      }
      
      // Add new user
      const newUser = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        userType: 'patient',
        registeredAt: new Date().toISOString()
      };
      
      existingUsers.push(newUser);
      localStorage.setItem('lungEvityUsers', JSON.stringify(existingUsers));
      
      // Simulate a successful registration after a short delay
      setTimeout(() => {
        setIsSubmitting(false);
        setRegistrationSuccess(true);
        
        // After successful registration, redirect to login after 2 seconds
        setTimeout(() => {
          onBackToLogin();
        }, 2000);
      }, 1500);
    }
  };
  
  // Prevent click propagation from modal content to overlay
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };
  
  return (
    <div className="registration-overlay" onClick={onClose}>
      <div className="registration-container" onClick={handleModalContentClick}>
        <div className="registration-header">
          <h2>Create Patient Account</h2>
          <button className="close-button" onClick={onClose} type="button">
            <X className="icon-sm" />
          </button>
        </div>
        
        {registrationSuccess ? (
          <div className="success-message">
            <h3>Registration Successful!</h3>
            <p>Your patient account has been created. Redirecting you to login...</p>
          </div>
        ) : (
          <>
            <p className="registration-intro">
              Join LungEvity to access your health information, connect with healthcare providers, and more.
            </p>
            
            <form className="registration-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">
                  <User className="input-icon" />
                  Username
                </label>
                <input 
                  type="text" 
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                />
                {errors.username && <span className="error-text">{errors.username}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">
                  <Mail className="input-icon" />
                  Email
                </label>
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="password">
                  <Lock className="input-icon" />
                  Password
                </label>
                <input 
                  type="password" 
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <Lock className="input-icon" />
                  Confirm Password
                </label>
                <input 
                  type="password" 
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
              
              <div className="privacy-notice">
                By creating an account, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
              </div>
              
              <button 
                type="submit" 
                className={`register-button ${isSubmitting ? 'submitting' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            
            <div className="back-to-login">
              <button className="back-button" onClick={onBackToLogin} type="button">
                <ArrowLeft className="icon-sm" /> Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientRegistration;

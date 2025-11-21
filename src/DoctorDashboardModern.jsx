import React, { useState, useEffect } from 'react';
import { Users, FileText, Layers, Settings, HelpCircle, LogOut, Bell, Search, Home, Calendar, MessageCircle, Activity, TrendingUp, CheckCircle, AlertCircle, Clock, Moon, Sun, X } from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import ScanCommentThread from './components/ScanCommentThread';
import ScanCommentForm from './components/ScanCommentForm';
import {
  getAllPatients,
  getAllScans,
  fetchAllScans,
  getDashboardStats,
  formatDate,
  getScanCommentCount
} from './utils/unifiedDataManager';

const DoctorDashboardModern = ({ username, onLogout, onToggleDashboardStyle }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [scans, setScans] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedScan, setSelectedScan] = useState(null);
  const [replyToComment, setReplyToComment] = useState(null);
  const [commentRefresh, setCommentRefresh] = useState(0);
  const [imageBlobUrls, setImageBlobUrls] = useState({});
  const { darkMode, toggleDarkMode } = useTheme();

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

  // Helper function to fetch images with ngrok header and convert to blob URL
  const fetchImageAsBlob = async (imageUrl) => {
    if (!imageUrl || imageBlobUrls[imageUrl]) return imageBlobUrls[imageUrl];

    try {
      const response = await fetch(imageUrl, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch image');

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      setImageBlobUrls(prev => ({ ...prev, [imageUrl]: blobUrl }));
      return blobUrl;
    } catch (error) {
      console.error('Error fetching image:', error);
      return null;
    }
  };

  const loadData = async () => {
    const allScans = await fetchAllScans();
    const allPatients = getAllPatients();

    console.log('🔍 DoctorDashboardModern - Loading data:');
    console.log('📊 Total scans:', allScans.length);
    console.log('👥 Total patients:', allPatients.length);

    setPatients(allPatients);
    setScans(allScans);
    setStats(getDashboardStats());

    if (!selectedScan && allScans.length > 0) {
      setSelectedScan(allScans[0]);
    }
  };

  const handleCommentSuccess = () => {
    setCommentRefresh(prev => prev + 1);
    setReplyToComment(null);
  };

  // Fetch image blobs when scan is selected
  useEffect(() => {
    if (selectedScan) {
      if (selectedScan.annotatedImageUrl) {
        fetchImageAsBlob(selectedScan.annotatedImageUrl);
      }
      if (selectedScan.imageUrl) {
        fetchImageAsBlob(selectedScan.imageUrl);
      }
    }
  }, [selectedScan]);

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

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'patients', label: 'My Patients', icon: Users },
    { id: 'scans', label: 'CT Scans', icon: Layers },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              PneumAI
            </h1>
            <span className="px-3 py-1 text-xs font-semibold text-secondary-700 dark:text-secondary-300 bg-secondary-50 dark:bg-secondary-900/30 rounded-full">
              Doctor
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              {stats.highRiskScans > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {stats.highRiskScans}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-500 to-primary-500 flex items-center justify-center text-white font-semibold">
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Dr. {username}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Pill Style */}
        <div className="px-6 pb-3 overflow-x-auto">
          <div className="flex space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === item.id
                      ? 'bg-secondary-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Doctor Dashboard</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Monitor your patients and review CT scan analyses
              </p>
            </div>

            {/* Key Metrics - Large Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-soft-lg">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 opacity-80" />
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full">+{stats.newPatientsThisMonth || 0}</span>
                </div>
                <p className="text-sm opacity-90 mb-1">Total Patients</p>
                <p className="text-4xl font-bold">{stats.totalPatients || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-soft-lg">
                <div className="flex items-center justify-between mb-4">
                  <Layers className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-sm opacity-90 mb-1">Scans Reviewed</p>
                <p className="text-4xl font-bold">{stats.totalScans || 0}</p>
                <p className="text-xs opacity-75 mt-1">+{stats.scansThisMonth || 0} this month</p>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-soft-lg">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-sm opacity-90 mb-1">Appointments</p>
                <p className="text-4xl font-bold">{stats.upcomingAppointments || 0}</p>
                <p className="text-xs opacity-75 mt-1">Upcoming</p>
              </div>

              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-soft-lg">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-sm opacity-90 mb-1">High Risk Scans</p>
                <p className="text-4xl font-bold">{stats.highRiskScans || 0}</p>
                <p className="text-xs opacity-75 mt-1">Requires attention</p>
              </div>
            </div>

            {/* Recent Scans Table */}
            <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent CT Scans</h3>
                <button
                  onClick={() => setActiveTab('scans')}
                  className="text-sm text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 font-medium"
                >
                  View All →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-dark-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Patient Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentScans.length > 0 ? (
                      recentScans.map(scan => (
                        <tr key={scan.scanId} className="border-b border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{scan.patientName}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(scan.uploadTime)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              scan.result === 'Reviewed'
                                ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300'
                                : 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300'
                            }`}>
                              {scan.result}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedScan(scan);
                                setActiveTab('scans');
                              }}
                              className="px-4 py-2 bg-secondary-500 hover:bg-secondary-600 text-white text-sm rounded-lg font-medium transition-colors"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-gray-500 dark:text-gray-400">
                          No scans available yet. Scans uploaded by patients will appear here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Patients Requiring Attention */}
            <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Patients Requiring Attention</h3>
              <div className="space-y-3">
                {patients.filter(p => p.status !== 'Stable').length > 0 ? (
                  patients.filter(p => p.status !== 'Stable').map(patient => (
                    <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-xl">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{patient.fullName}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ID: {patient.id} | Age: {patient.age} | Last Visit: {patient.lastVisit}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          patient.status === 'Urgent'
                            ? 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300'
                            : 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300'
                        }`}>
                          {patient.status}
                        </span>
                        <button className="px-4 py-2 bg-gray-200 dark:bg-dark-600 hover:bg-gray-300 dark:hover:bg-dark-500 text-gray-700 dark:text-gray-200 text-sm rounded-lg font-medium transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No patients requiring immediate attention
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* My Patients Tab */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Patients</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and monitor your patient records</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-dark-700">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Patient ID</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Age</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Last Visit</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Risk Level</th>
                      <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.length > 0 ? (
                      patients.map(patient => {
                        const patientScans = scans.filter(s => s.patientId === patient.id);
                        const highestRisk = patientScans.reduce((max, scan) => {
                          const riskLevels = { none: 0, low: 1, medium: 2, high: 3 };
                          const scanRisk = riskLevels[scan.results?.riskLevel] || 0;
                          return scanRisk > max ? scanRisk : max;
                        }, 0);
                        const riskLevel = ['none', 'low', 'medium', 'high'][highestRisk];

                        return (
                          <tr key={patient.id} className="border-b border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors">
                            <td className="py-4 px-6 text-sm text-gray-900 dark:text-gray-100">{patient.id}</td>
                            <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-gray-100">{patient.fullName}</td>
                            <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{patient.age}</td>
                            <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{patient.lastVisit || 'N/A'}</td>
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                patient.status === 'Stable'
                                  ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300'
                                  : patient.status === 'Urgent'
                                  ? 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300'
                                  : 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300'
                              }`}>
                                {patient.status || 'N/A'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
                                riskLevel === 'high' ? 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300' :
                                riskLevel === 'medium' ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300' :
                                riskLevel === 'low' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300'
                              }`}>
                                {riskLevel}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <button className="px-3 py-1.5 bg-secondary-500 hover:bg-secondary-600 text-white text-xs rounded-lg font-medium transition-colors">
                                  View
                                </button>
                                <button className="px-3 py-1.5 bg-gray-200 dark:bg-dark-600 hover:bg-gray-300 dark:hover:bg-dark-500 text-gray-700 dark:text-gray-200 text-xs rounded-lg font-medium transition-colors">
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-gray-500 dark:text-gray-400">
                          No patients registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CT Scans Tab */}
        {activeTab === 'scans' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">CT Scan Analysis & Review</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Review patient CT scans and provide professional feedback</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-700">
                <div className="flex items-center space-x-3 mb-2">
                  <Layers className="w-5 h-5 text-blue-500" />
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Scans</h4>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{scans.length}</p>
              </div>

              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-700">
                <div className="flex items-center space-x-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-success-500" />
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">No Risk</h4>
                </div>
                <p className="text-3xl font-bold text-success-600">
                  {scans.filter(s => s.results?.riskLevel === 'none').length}
                </p>
              </div>

              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-700">
                <div className="flex items-center space-x-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-warning-500" />
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Attention Needed</h4>
                </div>
                <p className="text-3xl font-bold text-warning-600">
                  {scans.filter(s => s.results?.riskLevel === 'medium' || s.results?.riskLevel === 'low').length}
                </p>
              </div>

              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-700">
                <div className="flex items-center space-x-3 mb-2">
                  <Activity className="w-5 h-5 text-danger-500" />
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">High Risk</h4>
                </div>
                <p className="text-3xl font-bold text-danger-600">
                  {scans.filter(s => s.results?.riskLevel === 'high').length}
                </p>
              </div>
            </div>

            {/* Scans Table */}
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-700 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Patient CT Scans ({scans.length})</h3>
                <button
                  onClick={() => loadData()}
                  className="px-4 py-2 bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  🔄 Refresh
                </button>
              </div>

              {scans.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-dark-700">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Patient</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Upload Date</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Risk Level</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Detection</th>
                        <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Comments</th>
                        <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scans.map((scan, index) => {
                        const scanId = scan.scanId || scan.id;
                        const patient = patients.find(p => p.id === scan.patientId);
                        const commentCount = getScanCommentCount(scanId);
                        return (
                          <tr
                            key={scanId || index}
                            className="border-b border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors"
                          >
                            <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-gray-100">
                              {patient?.fullName || patient?.firstName || scan.patientId || 'Unknown Patient'}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(scan.uploadTime) || 'Unknown date'}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
                                scan.results?.riskLevel === 'high' ? 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300' :
                                scan.results?.riskLevel === 'medium' ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300' :
                                scan.results?.riskLevel === 'low' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                scan.results?.riskLevel === 'none' ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                              }`}>
                                {scan.results?.riskLevel || 'Unknown'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              {scan.results?.detected ? (
                                <span className="px-3 py-1 bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300 rounded-lg text-xs font-medium">
                                  ⚠️ Areas Detected
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300 rounded-lg text-xs font-medium">
                                  ✓ Clear
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium ${
                                commentCount > 0
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
                              }`}>
                                <MessageCircle className="w-3 h-3" />
                                <span>{commentCount}</span>
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <button
                                onClick={() => {
                                  console.log('🔍 Opening scan:', scan);
                                  setSelectedScan(scan);
                                }}
                                className="px-4 py-2 bg-gradient-to-br from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                              >
                                📋 Review Scan
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <Layers className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No CT Scans Available</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Patient uploaded scans will appear here for your professional review
                  </p>
                </div>
              )}
            </div>

            {/* Selected Scan Detail View Modal */}
            {selectedScan && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                  {/* Header */}
                  <div className="sticky top-0 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-6 py-4 flex items-center justify-between z-10">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">CT Scan Review</h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        Patient: <strong>{patients.find(p => p.id === selectedScan.patientId)?.fullName || selectedScan.patientId}</strong>
                        {' · '}
                        Uploaded: {formatDate(selectedScan.uploadTime)}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedScan(null)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>

                  {/* Main Content */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {/* CT Scan Image */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">CT Scan Image</h4>
                        <div className="bg-black rounded-xl overflow-hidden border-2 border-gray-200 dark:border-dark-600">
                          {selectedScan.annotatedImageUrl || selectedScan.imageUrl ? (
                            <img
                              src={
                                imageBlobUrls[selectedScan.annotatedImageUrl] ||
                                imageBlobUrls[selectedScan.imageUrl] ||
                                selectedScan.annotatedImageUrl ||
                                selectedScan.imageUrl
                              }
                              alt="CT Scan"
                              className="w-full h-auto object-contain"
                              style={{ maxHeight: '500px' }}
                              onError={(e) => {
                                console.error('Image failed to load:', e);
                                e.target.src = '/assets/lungs.png';
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-96 text-gray-400">
                              <div className="text-center">
                                <Layers className="w-16 h-16 mx-auto mb-2 opacity-50" />
                                <p>Scan image not available</p>
                              </div>
                            </div>
                          )}
                        </div>
                        {selectedScan.annotatedImageUrl && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                            ℹ️ Image shows AI-detected areas highlighted in red
                          </p>
                        )}
                      </div>

                      {/* Analysis Results */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">AI Analysis Results</h4>
                        <div className="space-y-4">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                            <span className="text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wide">Risk Level</span>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                              {(selectedScan.results?.riskLevel || 'Unknown').toUpperCase()}
                            </p>
                          </div>

                          <div className={`rounded-xl p-4 border ${
                            selectedScan.results?.detected
                              ? 'bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 border-warning-200 dark:border-warning-800'
                              : 'bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-success-200 dark:border-success-800'
                          }`}>
                            <span className={`text-xs font-semibold uppercase tracking-wide ${
                              selectedScan.results?.detected
                                ? 'text-warning-700 dark:text-warning-300'
                                : 'text-success-700 dark:text-success-300'
                            }`}>
                              Detection Status
                            </span>
                            <p className={`text-lg font-bold mt-1 ${
                              selectedScan.results?.detected
                                ? 'text-warning-900 dark:text-warning-100'
                                : 'text-success-900 dark:text-success-100'
                            }`}>
                              {selectedScan.results?.detected ? '⚠️ Areas Detected' : '✓ No Issues Detected'}
                            </p>
                          </div>

                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                            <span className="text-gray-700 dark:text-gray-300 text-xs font-semibold uppercase tracking-wide">AI Confidence</span>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                              {((selectedScan.results?.confidence || 0) * 100).toFixed(1)}%
                            </p>
                          </div>

                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                            <span className="text-purple-700 dark:text-purple-300 text-xs font-semibold uppercase tracking-wide">Scan ID</span>
                            <p className="text-sm font-mono font-semibold text-purple-900 dark:text-purple-100 mt-1">
                              {selectedScan.scanId || selectedScan.id || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comments Section */}
                    <div className="border-t border-gray-200 dark:border-dark-700 pt-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        💬 Professional Feedback & Comments
                      </h3>
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
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Appearance Settings */}
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Enable dark theme across the application</p>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        darkMode ? 'bg-secondary-500' : 'bg-gray-300 dark:bg-dark-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-700">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Dashboard Style</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Switch to classic dashboard layout</p>
                    </div>
                    <button
                      onClick={onToggleDashboardStyle}
                      className="px-4 py-2 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      Switch to Classic
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Settings */}
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
                    <input
                      type="text"
                      value={username}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <button className="w-full px-4 py-2 bg-danger-500 hover:bg-danger-600 text-white rounded-lg font-medium transition-colors">
                    Change Password
                  </button>
                </div>
              </div>
            </div>

            {/* Logout */}
            <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Session</h3>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-dark-600 hover:bg-gray-300 dark:hover:bg-dark-500 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Other tabs placeholders */}
        {(activeTab === 'appointments' || activeTab === 'messages' || activeTab === 'reports' || activeTab === 'help') && (
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-12 shadow-soft border border-gray-100 dark:border-dark-700 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              This section is under development
            </p>
          </div>
        )}
      </main>

      {/* Floating Logout Button */}
      <button
        onClick={onLogout}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-br from-danger-500 to-danger-600 hover:from-danger-600 hover:to-danger-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
        title="Logout"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
};

export default DoctorDashboardModern;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api.service';
import { sanitizeUserInput } from '../../utils/sanitize';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiService.user.getProfile();
      if (response.data.success) {
        setProfile(response.data.user);
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>

        <div className="profile-section">
          <h2>Profile Information</h2>
          <div className="profile-grid">
            <div className="profile-item">
              <span className="profile-label">Username:</span>
              <span className="profile-value">{sanitizeUserInput(profile?.username || user?.username || '')}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Email:</span>
              <span className="profile-value">{sanitizeUserInput(profile?.email || user?.email || '')}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Role:</span>
              <span className={`profile-badge role-${profile?.role || user?.role}`}>
                {sanitizeUserInput((profile?.role || user?.role)?.toUpperCase() || '')}
              </span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Status:</span>
              <span className={`profile-badge ${profile?.isActive ? 'status-active' : 'status-inactive'}`}>
                {profile?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {profile?.lastLogin && (
              <div className="profile-item">
                <span className="profile-label">Last Login:</span>
                <span className="profile-value">
                  {new Date(profile.lastLogin).toLocaleString()}
                </span>
              </div>
            )}
            {profile?.createdAt && (
              <div className="profile-item">
                <span className="profile-label">Member Since:</span>
                <span className="profile-value">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-actions">
          <button className="btn-secondary" onClick={() => navigate('/profile/edit')}>
            Edit Profile
          </button>
          {(user?.role === 'admin' || profile?.role === 'admin') && (
            <button className="btn-secondary" onClick={() => navigate('/admin')}>
              Admin Panel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <LoadingSpinner message="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="container py-5">
        <div className="card shadow-sm border-0 p-5 text-center mx-auto" style={{ maxWidth: '600px' }}>
          <div className="text-warning mb-3" style={{ fontSize: '3rem' }}>⚠️</div>
          <h3 className="fw-bold text-navy">Access Restricted</h3>
          <p className="text-muted">
            Your role (<strong className="text-capitalize">{user.role}</strong>) does not have permission to view this section.
          </p>
          <div>
            <a href="/dashboard" className="btn btn-primary px-4 py-2 rounded-pill">
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiLock,
  FiMail,
  FiShield,
  FiCheckCircle,
  FiArrowRight,
  FiUserCheck,
} from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, 'Password123!');
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials or ensure database is seeded.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 p-md-4 bg-app-light">
      <div
        className="card border-0 shadow-lg overflow-hidden w-100 rounded-4"
        style={{ maxWidth: '1000px' }}
      >
        <div className="row g-0">
          {/* Left Branded Presentation Panel */}
          <div className="col-lg-5 bg-navy text-white p-4 p-md-5 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="brand-logo-icon">
                  <span className="fw-bold">SS</span>
                </div>
                <div>
                  <h4 className="fw-bold mb-0 text-white">StaffSync</h4>
                  <span className="small text-secondary" style={{ fontSize: '0.75rem' }}>
                    Modern Human Resource Management
                  </span>
                </div>
              </div>

              <h2 className="fw-bold text-white mb-3">
                Empower your workforce with synchronized intelligence.
              </h2>
              <p className="text-secondary small mb-4">
                Enterprise-grade HR operations: live biometric attendance, multi-tiered leave approvals, employee directory, and skill development pathways.
              </p>

              <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex align-items-start gap-2">
                  <FiCheckCircle className="text-info mt-1 flex-shrink-0" />
                  <span className="small text-light">Role-Based Access Control (HR, Manager, Staff)</span>
                </div>
                <div className="d-flex align-items-start gap-2">
                  <FiCheckCircle className="text-info mt-1 flex-shrink-0" />
                  <span className="small text-light">Real-Time Clock-in / Clock-out with Location Tagging</span>
                </div>
                <div className="d-flex align-items-start gap-2">
                  <FiCheckCircle className="text-info mt-1 flex-shrink-0" />
                  <span className="small text-light">Automated Leave Accrual & Conflict Validation</span>
                </div>
                <div className="d-flex align-items-start gap-2">
                  <FiCheckCircle className="text-info mt-1 flex-shrink-0" />
                  <span className="small text-light">Interactive Weekly Attendance & Department Analytics</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-top border-secondary border-opacity-25 small text-secondary">
              StaffSync HRMS Enterprise &bull; College Capstone Project Edition
            </div>
          </div>

          {/* Right Login & Fast Demo Switcher Form */}
          <div className="col-lg-7 p-4 p-md-5 bg-white d-flex flex-column justify-content-center">
            <div className="mb-4">
              <h3 className="fw-bold text-navy mb-1">Sign in to your Portal</h3>
              <p className="text-muted small">
                Enter your authorized credentials or select a one-click demo role below.
              </p>
            </div>

            {/* Quick Demo Selector Chips */}
            <div className="mb-4 p-3 bg-light rounded-3 border">
              <span className="d-block small fw-bold text-muted text-uppercase mb-2" style={{ fontSize: '0.72rem' }}>
                Quick Demo Role Switcher:
              </span>
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectDemo('admin@staffsync.com')}
                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 rounded-pill px-3 py-1"
                >
                  <FiShield size={13} />
                  <span>HR Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDemo('manager@staffsync.com')}
                  className="btn btn-sm btn-outline-info d-flex align-items-center gap-1 rounded-pill px-3 py-1"
                >
                  <FiUserCheck size={13} />
                  <span>Manager</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDemo('employee@staffsync.com')}
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 rounded-pill px-3 py-1"
                >
                  <FiUserCheck size={13} />
                  <span>Employee</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Work Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted border-end-0">
                    <FiMail />
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0 ps-0"
                    placeholder="e.g. admin@staffsync.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <label className="form-label small fw-semibold text-muted mb-0">Password</label>
                  <span className="small text-muted" style={{ fontSize: '0.78rem' }}>
                    Default: <code>Password123!</code>
                  </span>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted border-end-0">
                    <FiLock />
                  </span>
                  <input
                    type="password"
                    className="form-control border-start-0 ps-0"
                    placeholder="Enter your secret password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to StaffSync</span>
                    <FiArrowRight />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 pt-3 text-center border-top">
              <span className="small text-muted">
                Need HR administrator provisioning? Contact your internal system administrator.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

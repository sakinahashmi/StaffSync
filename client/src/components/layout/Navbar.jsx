import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiBell, FiCalendar, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'hr':
        return <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill fw-semibold">HR Admin</span>;
      case 'manager':
        return <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle px-3 py-1 rounded-pill fw-semibold">Team Manager</span>;
      default:
        return <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle px-3 py-1 rounded-pill fw-semibold">Employee</span>;
    }
  };

  return (
    <header className="navbar-top bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between sticky-top shadow-xs">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-light d-lg-none p-2 rounded-3 border"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation"
        >
          <FiMenu size={20} />
        </button>
        <div>
          <h5 className="mb-0 fw-bold text-dark">StaffSync WorkSpace</h5>
          <span className="small text-muted d-none d-sm-inline">
            Human Capital & Operational Synchronization
          </span>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Current Date Display */}
        <div className="d-none d-md-flex align-items-center gap-2 text-muted bg-light px-3 py-1 rounded-pill small">
          <FiCalendar className="text-primary" />
          <span>{todayStr}</span>
        </div>

        {/* User Role Badge */}
        {getRoleBadge(user?.role)}

        {/* User Profile Pill */}
        <Link
          to="/profile"
          className="d-flex align-items-center gap-2 text-decoration-none text-dark p-1 rounded-pill hover-bg-light"
        >
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Staff')}&background=2563eb&color=fff&size=80`
            }
            alt={user?.name}
            className="rounded-circle border"
            style={{ width: '36px', height: '36px', objectFit: 'cover' }}
          />
          <span className="fw-semibold small d-none d-md-inline">{user?.name}</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;

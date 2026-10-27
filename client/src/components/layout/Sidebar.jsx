import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid,
  FiUsers,
  FiClock,
  FiCalendar,
  FiBell,
  FiBookOpen,
  FiUser,
  FiLogOut,
  FiX,
  FiShield,
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isHr, isManager } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiGrid },
    { name: 'Employees', path: '/employees', icon: FiUsers },
    { name: 'Attendance', path: '/attendance', icon: FiClock },
    { name: 'Leaves', path: '/leaves', icon: FiCalendar },
    { name: 'Announcements', path: '/announcements', icon: FiBell },
    { name: 'Training', path: '/training', icon: FiBookOpen },
    { name: 'My Profile', path: '/profile', icon: FiUser },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50 z-index-backdrop d-lg-none"
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar bg-navy text-white d-flex flex-column justify-content-between ${
          isOpen ? 'show' : ''
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="d-flex align-items-center justify-content-between p-4 border-bottom border-secondary border-opacity-25">
            <div className="d-flex align-items-center gap-2">
              <div className="brand-logo-icon">
                <span className="fw-bold">SS</span>
              </div>
              <div>
                <h5 className="fw-bold mb-0 text-white tracking-wide">StaffSync</h5>
                <span className="small text-secondary" style={{ fontSize: '0.72rem' }}>
                  Enterprise HRMS
                </span>
              </div>
            </div>
            <button
              className="btn btn-link text-white p-0 d-lg-none"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <FiX size={22} />
            </button>
          </div>

          {/* Role badge pill */}
          <div className="px-4 py-3">
            <div className="role-tag-box d-flex align-items-center gap-2 px-3 py-2 rounded-3">
              <FiShield className="text-info" />
              <div className="overflow-hidden">
                <span className="d-block small text-secondary text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                  Current Mode
                </span>
                <span className="fw-semibold text-white small text-capitalize text-truncate d-block">
                  {user?.role === 'hr' ? 'HR Administrator' : user?.role === 'manager' ? 'Team Manager' : 'Staff Employee'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="nav flex-column px-3 mt-1 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 sidebar-nav-item transition-all ${
                      isActive ? 'active-nav-item' : 'text-secondary-subtle'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span className="fw-medium">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer profile info & logout */}
        <div className="p-3 border-top border-secondary border-opacity-25">
          <div className="d-flex align-items-center justify-content-between mb-3 px-2">
            <div className="d-flex align-items-center gap-2 overflow-hidden">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Staff')}&background=2563eb&color=fff&size=100`
                }
                alt={user?.name}
                className="rounded-circle object-fit-cover"
                style={{ width: '38px', height: '38px' }}
              />
              <div className="overflow-hidden">
                <div className="fw-semibold text-white small text-truncate">
                  {user?.name}
                </div>
                <div className="text-secondary small text-truncate" style={{ fontSize: '0.72rem' }}>
                  {user?.position}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 small fw-semibold"
          >
            <FiLogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

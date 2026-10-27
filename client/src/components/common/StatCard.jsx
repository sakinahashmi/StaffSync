import React from 'react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = 'primary',
  subtitle,
  badgeText,
  badgeType = 'light',
}) => {
  const colorMap = {
    primary: {
      bg: 'rgba(37, 99, 235, 0.1)',
      text: '#2563eb',
      border: 'rgba(37, 99, 235, 0.2)',
    },
    success: {
      bg: 'rgba(16, 185, 129, 0.1)',
      text: '#10b981',
      border: 'rgba(16, 185, 129, 0.2)',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.1)',
      text: '#f59e0b',
      border: 'rgba(245, 158, 11, 0.2)',
    },
    danger: {
      bg: 'rgba(239, 68, 68, 0.1)',
      text: '#ef4444',
      border: 'rgba(239, 68, 68, 0.2)',
    },
    info: {
      bg: 'rgba(2, 132, 199, 0.1)',
      text: '#0284c7',
      border: 'rgba(2, 132, 199, 0.2)',
    },
    purple: {
      bg: 'rgba(124, 58, 237, 0.1)',
      text: '#7c3aed',
      border: 'rgba(124, 58, 237, 0.2)',
    },
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div className="card h-100 border-0 shadow-sm rounded-4 stat-card transition-all">
      <div className="card-body p-4 d-flex flex-column justify-content-between">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <span className="text-muted fw-semibold small text-uppercase tracking-wider">
            {title}
          </span>
          <div
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{
              width: '46px',
              height: '46px',
              backgroundColor: scheme.bg,
              color: scheme.text,
              fontSize: '1.35rem',
            }}
          >
            {Icon && <Icon />}
          </div>
        </div>

        <div>
          <h2 className="display-6 fw-bold text-dark mb-1">{value}</h2>
          <div className="d-flex align-items-center justify-content-between mt-2">
            {subtitle && <span className="small text-muted">{subtitle}</span>}
            {badgeText && (
              <span className={`badge rounded-pill bg-${badgeType} text-dark px-2 py-1 small fw-normal`}>
                {badgeText}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;

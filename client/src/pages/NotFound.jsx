import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-app-light p-4 text-center">
      <div className="card border-0 shadow-sm rounded-4 p-5" style={{ maxWidth: '500px' }}>
        <h1 className="display-1 fw-bold text-navy mb-2">404</h1>
        <h4 className="fw-bold text-dark mb-2">Page Not Found</h4>
        <p className="text-muted small mb-4">
          The requested resource or page does not exist or has been relocated within the HR portal.
        </p>
        <div>
          <Link to="/dashboard" className="btn btn-primary px-4 py-2 rounded-pill fw-semibold">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

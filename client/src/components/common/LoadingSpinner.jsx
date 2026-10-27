import React from 'react';

const LoadingSpinner = ({ message = 'Loading data...', size = 'md' }) => {
  const spinnerClass = size === 'sm' ? 'spinner-border-sm' : '';

  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <div className={`spinner-border text-primary ${spinnerClass}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <p className="text-muted mt-2 mb-0 small fw-medium">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;

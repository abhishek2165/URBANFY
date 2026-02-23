import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="section-padding text-center">
      <h1 style={{ fontSize: '6rem', color: 'var(--accent)' }}>404</h1>
      <h2 className="section-title">Page Not Found</h2>
      <p className="section-subtitle">
        The page you are looking for does not exist.
      </p>
      <Link to="/" className="btn-primary-custom">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
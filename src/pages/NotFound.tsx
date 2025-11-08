import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/NotFound.css";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-number">404</div>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-message">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="not-found-actions">
          <button
            className="not-found-btn primary"
            onClick={() => navigate("/")}
          >
            Go to Homepage
          </button>
          <button
            className="not-found-btn secondary"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
        <div className="not-found-links">
          <p>Or try one of these:</p>
          <div className="quick-links">
            <a href="/search">Browse Products</a>
            <a href="/listing">Start Selling</a>
            <a href="/about-us">About Us</a>
            <a href="/help-support">Help & Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;


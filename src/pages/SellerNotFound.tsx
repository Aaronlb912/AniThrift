import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/NotFound.css";

const SellerNotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-number">404</div>
        <h1 className="not-found-title">Seller Not Found</h1>
        <p className="not-found-message">
          We couldn't find the seller profile you're looking for. The account
          may have been removed or the link may be incorrect.
        </p>
        <div className="not-found-actions">
          <button
            className="not-found-btn primary"
            onClick={() => navigate("/search")}
          >
            Browse Items
          </button>
          <button
            className="not-found-btn secondary"
            onClick={() => navigate("/")}
          >
            Go to Homepage
          </button>
        </div>
        <div className="not-found-links">
          <p>Need more help?</p>
          <div className="quick-links">
            <a href="/help-support">Help & Support</a>
            <a href="/contact-us">Contact Us</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerNotFound;



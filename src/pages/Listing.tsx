import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Listing.css";
import FAQ from "../components/FAQ";

const Listing = () => {
  const navigate = useNavigate();

  return (
    <div className="listing-page">
      <div className="hero-section">
        <div className="tagline-box">
          <h1>Turn Your Passion Into Profit</h1>
          <p>Join our community of sellers and make an impact.</p>
          <button onClick={() => navigate("/sell")}>Start Selling</button>
        </div>
      </div>
      <div className="listing-simple">
        <h2>Listing Made Simple</h2>
        <div className="reasons-container">
          <div className="reason-box">
            <div className="reason-number">1</div>
            <p>Free listing with no hidden fees</p>
          </div>
          <div className="reason-box">
            <div className="reason-number">2</div>
            <p>Anithrift takes a percent once the item is sold</p>
          </div>
          <div className="reason-box">
            <div className="reason-number">3</div>
            <p>How the seller gets paid</p>
          </div>
        </div>
      </div>
      {/* FAQ Section */}
      <FAQ />
    </div>
  );
};

export default Listing;

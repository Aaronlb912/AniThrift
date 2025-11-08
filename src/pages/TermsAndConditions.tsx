import React from "react";
import "../css/infoPages.css";

const TermsAndConditions: React.FC = () => {
  return (
    <div className="info-page-container">
      <h1>Terms and Conditions</h1>
      <div className="info-content">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          Please read these Terms and Conditions carefully before using
          AniThrift.
        </p>
        <h2>1. Agreement to Terms</h2>
        <p>
          By accessing or using AniThrift, you agree to be bound by these Terms
          and Conditions.
        </p>
        <h2>2. Description of Service</h2>
        <p>
          AniThrift is an online marketplace that connects buyers and sellers of
          anime-related merchandise and collectibles.
        </p>
        <h2>3. User Accounts</h2>
        <p>
          You must create an account to use certain features. You are responsible
          for maintaining the security of your account.
        </p>
        <h2>4. Seller Terms</h2>
        <ul>
          <li>Accurately describe all items for sale</li>
          <li>Ship items promptly after payment</li>
          <li>Respond to buyer inquiries in a timely manner</li>
          <li>Comply with all applicable laws and regulations</li>
        </ul>
        <h2>5. Buyer Terms</h2>
        <ul>
          <li>Make payments promptly</li>
          <li>Provide accurate shipping information</li>
          <li>Review item descriptions carefully before purchasing</li>
          <li>Contact sellers for questions before purchasing</li>
        </ul>
        <h2>6. Prohibited Items</h2>
        <p>The following items are prohibited:</p>
        <ul>
          <li>Counterfeit or pirated goods</li>
          <li>Illegal items</li>
          <li>Items that infringe on intellectual property rights</li>
          <li>Hazardous materials</li>
        </ul>
        <h2>7. Dispute Resolution</h2>
        <p>
          If you have a dispute with another user, please contact our support
          team. We will work to facilitate a resolution.
        </p>
        <h2>8. Limitation of Liability</h2>
        <p>
          AniThrift acts as a platform connecting buyers and sellers. We are not
          responsible for the quality, safety, or legality of items sold.
        </p>
      </div>
    </div>
  );
};

export default TermsAndConditions;


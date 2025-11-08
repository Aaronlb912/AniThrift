import React from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import "../css/infoPages.css";

const SettingsStripeAccount: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="info-page-container">
      <h1>Stripe Account</h1>
      <div className="info-content">
        <p>
          Connect your Stripe account to receive payments from sales on
          AniThrift.
        </p>
        <h2>Why Connect Stripe?</h2>
        <ul>
          <li>Receive payments directly to your bank account</li>
          <li>Secure payment processing</li>
          <li>Fast and reliable transfers</li>
        </ul>
        <button
          className="primary-button"
          onClick={() => navigate("/StripeOnboardingForm")}
        >
          Connect Stripe Account
        </button>
        <p>
          Already connected? You can manage your Stripe account settings through
          the Stripe dashboard.
        </p>
      </div>
    </div>
    </MainLayout>
  );
};

export default SettingsStripeAccount;


import React from "react";
import MainLayout from "../components/MainLayout";
import "../css/infoPages.css";

const SettingsPayments: React.FC = () => {
  return (
    <MainLayout>
      <div className="info-page-container">
      <h1>Payment Information</h1>
      <div className="info-content">
        <h2>Payment Methods</h2>
        <p>Manage your payment methods for purchases on AniThrift.</p>
        <div className="payment-methods">
          <p>No payment methods on file.</p>
          <button className="primary-button">Add Payment Method</button>
        </div>
        <h2>Payment History</h2>
        <p>
          View your payment history in your{" "}
          <a href="/orders">Orders</a> page.
        </p>
      </div>
    </div>
    </MainLayout>
  );
};

export default SettingsPayments;


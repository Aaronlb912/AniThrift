import React from "react";
import MainLayout from "../components/MainLayout";
import "../css/infoPages.css";

const SettingsPendingDonations: React.FC = () => {
  return (
    <MainLayout>
      <div className="info-page-container">
      <h1>Pending Donations</h1>
      <div className="info-content">
        <p>View and manage your pending donation requests.</p>
        <div className="donations-list">
          <p>You don't have any pending donations.</p>
        </div>
        <p>
          Pending donations will appear here once they are submitted and
          awaiting processing.
        </p>
      </div>
    </div>
    </MainLayout>
  );
};

export default SettingsPendingDonations;


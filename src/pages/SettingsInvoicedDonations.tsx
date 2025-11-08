import React from "react";
import MainLayout from "../components/MainLayout";
import "../css/infoPages.css";

const SettingsInvoicedDonations: React.FC = () => {
  return (
    <MainLayout>
      <div className="info-page-container">
      <h1>Invoiced Donations</h1>
      <div className="info-content">
        <p>View your donation history and invoices.</p>
        <div className="donations-list">
          <p>You don't have any invoiced donations.</p>
        </div>
        <p>
          Completed donations and their invoices will appear here for your
          records.
        </p>
      </div>
    </div>
    </MainLayout>
  );
};

export default SettingsInvoicedDonations;


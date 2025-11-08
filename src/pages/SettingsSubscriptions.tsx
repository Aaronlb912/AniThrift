import React from "react";
import MainLayout from "../components/MainLayout";
import "../css/infoPages.css";

const SettingsSubscriptions: React.FC = () => {
  return (
    <MainLayout>
      <div className="info-page-container">
      <h1>Subscriptions</h1>
      <div className="info-content">
        <p>
          Manage your subscriptions and recurring payments on AniThrift.
        </p>
        <div className="subscriptions-list">
          <p>You don't have any active subscriptions.</p>
        </div>
        <h2>Available Subscriptions</h2>
        <div className="subscription-plans">
          <div className="subscription-card">
            <h3>Basic Seller</h3>
            <p className="price">Free</p>
            <ul>
              <li>Up to 10 active listings</li>
              <li>Standard seller features</li>
            </ul>
          </div>
          <div className="subscription-card featured">
            <h3>Premium Seller</h3>
            <p className="price">$9.99/month</p>
            <ul>
              <li>Unlimited listings</li>
              <li>Featured listing placement</li>
              <li>Advanced analytics</li>
              <li>Priority support</li>
            </ul>
            <button className="primary-button">Subscribe</button>
          </div>
        </div>
      </div>
    </div>
    </MainLayout>
  );
};

export default SettingsSubscriptions;


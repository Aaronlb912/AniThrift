import React, { useState } from "react";
import MainLayout from "../components/MainLayout";
import "../css/infoPages.css";

const SettingsPermissions: React.FC = () => {
  const [permissions, setPermissions] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    locationServices: false,
    cameraAccess: false,
  });

  const handleToggle = (key: string) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  return (
    <MainLayout>
      <div className="info-page-container">
      <h1>Permissions</h1>
      <div className="info-content">
        <p>Manage what information and features AniThrift can access.</p>
        <div className="permissions-list">
          <div className="permission-item">
            <div>
              <h3>Email Notifications</h3>
              <p>Receive email updates about orders, messages, and account activity</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={permissions.emailNotifications}
                onChange={() => handleToggle("emailNotifications")}
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="permission-item">
            <div>
              <h3>Push Notifications</h3>
              <p>Receive browser push notifications</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={permissions.pushNotifications}
                onChange={() => handleToggle("pushNotifications")}
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="permission-item">
            <div>
              <h3>SMS Notifications</h3>
              <p>Receive text message notifications</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={permissions.smsNotifications}
                onChange={() => handleToggle("smsNotifications")}
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="permission-item">
            <div>
              <h3>Location Services</h3>
              <p>Allow location-based features and recommendations</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={permissions.locationServices}
                onChange={() => handleToggle("locationServices")}
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="permission-item">
            <div>
              <h3>Camera Access</h3>
              <p>Allow camera access for photo uploads</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={permissions.cameraAccess}
                onChange={() => handleToggle("cameraAccess")}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
        <button className="save-button">Save Changes</button>
      </div>
    </div>
    </MainLayout>
  );
};

export default SettingsPermissions;


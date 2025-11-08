import React, { useState } from "react";
import { getAuth, deleteUser } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import "../css/infoPages.css";

const SettingsCloseAccount: React.FC = () => {
  const [confirmText, setConfirmText] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  const handleCloseAccount = async () => {
    if (confirmText.toLowerCase() !== "delete") {
      alert("Please type 'DELETE' to confirm account closure.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to permanently delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        await deleteUser(user);
        alert("Your account has been permanently deleted.");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Error deleting account:", error);
      if (error.code === "auth/requires-recent-login") {
        alert(
          "For security reasons, please sign out and sign back in before deleting your account."
        );
      } else {
        alert("An error occurred while deleting your account. Please try again.");
      }
    }
  };

  return (
    <MainLayout>
      <div className="info-page-container">
      <h1>Close Account</h1>
      <div className="info-content">
        {!showWarning ? (
          <>
            <div className="warning-box">
              <h2>⚠️ Warning: This Action Cannot Be Undone</h2>
              <p>
                Closing your account will permanently delete all of your data,
                including:
              </p>
              <ul>
                <li>Your profile and account information</li>
                <li>All your listings</li>
                <li>Order history</li>
                <li>Messages and conversations</li>
                <li>Saved items and favorites</li>
              </ul>
              <p>
                <strong>This action is permanent and cannot be reversed.</strong>
              </p>
            </div>
            <button
              className="danger-button"
              onClick={() => setShowWarning(true)}
            >
              I Understand, Continue
            </button>
          </>
        ) : (
          <>
            <div className="warning-box">
              <h2>Final Confirmation</h2>
              <p>
                To confirm account deletion, please type <strong>DELETE</strong>{" "}
                in the box below:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="confirm-input"
              />
            </div>
            <div className="button-group">
              <button
                className="danger-button"
                onClick={handleCloseAccount}
                disabled={confirmText.toLowerCase() !== "delete"}
              >
                Permanently Delete My Account
              </button>
              <button
                className="cancel-button"
                onClick={() => {
                  setShowWarning(false);
                  setConfirmText("");
                }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    </MainLayout>
  );
};

export default SettingsCloseAccount;


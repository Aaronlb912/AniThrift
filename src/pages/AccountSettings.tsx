// AccountSettings.tsx
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  updateEmail,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { TextField, Button } from "@mui/material";
import MainLayout from "../components/MainLayout";
import "../css/AccountSettings.css";

interface AccountData {
  email: string;
  currentPassword: string;
  newEmail: string;
  newPassword: string;
  confirmNewPassword: string;
}

const AccountSettings: React.FC = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [isEditing, setIsEditing] = useState(false);
  const [accountData, setAccountData] = useState<AccountData>({
    email: "",
    currentPassword: "",
    newEmail: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [originalData, setOriginalData] = useState<AccountData>({
    email: "",
    currentPassword: "",
    newEmail: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAccountData((prev) => ({
          ...prev,
          email: currentUser.email || "",
        }));
        setOriginalData((prev) => ({
          ...prev,
          email: currentUser.email || "",
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  const reauthenticate = async (currentPassword: string) => {
    if (!user || !user.email) return false;
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    try {
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (error) {
      console.error("Error re-authenticating: ", error);
      alert("Current password is incorrect.");
      return false;
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user) return;

    const isReauthenticated = await reauthenticate(accountData.currentPassword);
    if (!isReauthenticated) return;

    // Check if new passwords match
    if (accountData.newPassword && accountData.newPassword !== accountData.confirmNewPassword) {
      alert("New passwords do not match.");
      return;
    }

    let updatesMade = false;

    if (accountData.newEmail && accountData.newEmail !== accountData.email) {
      try {
        await updateEmail(user, accountData.newEmail);
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { email: accountData.newEmail });
        alert("Email updated successfully.");
        updatesMade = true;
        setAccountData((prev) => ({ ...prev, email: accountData.newEmail }));
      } catch (error) {
        console.error("Error updating email:", error);
        alert("Failed to update email.");
        return;
      }
    }

    if (accountData.newPassword && accountData.newPassword === accountData.confirmNewPassword) {
      try {
        await updatePassword(user, accountData.newPassword);
        alert("Password updated successfully.");
        updatesMade = true;
      } catch (error) {
        console.error("Error updating password:", error);
        alert("Failed to update password.");
        return;
      }
    }

    if (updatesMade) {
      setOriginalData({
        ...accountData,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setIsEditing(false);
      // Clear password fields
      setAccountData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }));
    } else {
      alert("No changes were made.");
    }
  };

  const handleCancel = () => {
    setAccountData({
      ...originalData,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setIsEditing(false);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: keyof AccountData
  ) => {
    setAccountData({ ...accountData, [field]: event.target.value });
  };

  return (
    <MainLayout>
      <div className="account-settings-container">
        <div className="account-settings-header">
          <h2>Sign-in and Security</h2>
          {!isEditing && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleEdit}
              className="edit-all-button"
            >
              Edit Information
            </Button>
          )}
        </div>

        <div className="account-settings-content">
          {/* Email field - always visible */}
          <div className="info-field">
            <label className="info-label">Email</label>
            {isEditing ? (
              <TextField
                fullWidth
                variant="outlined"
                type="email"
                value={accountData.email}
                disabled
                className="info-input"
              />
            ) : (
              <div className="info-value">
                {accountData.email || <span className="empty-value">Not set</span>}
              </div>
            )}
          </div>

          {/* New Email field - always visible */}
          <div className="info-field">
            <label className="info-label">New Email</label>
            {isEditing ? (
              <TextField
                fullWidth
                variant="outlined"
                type="email"
                value={accountData.newEmail}
                onChange={(event) =>
                  handleChange(event as React.ChangeEvent<HTMLInputElement>, "newEmail")
                }
                className="info-input"
                placeholder="Enter new email address (optional)"
              />
            ) : (
              <div className="info-value">
                {accountData.newEmail ? accountData.newEmail : <span className="empty-value">Not set</span>}
              </div>
            )}
          </div>

          {/* Current Password field - always visible */}
          <div className="info-field">
            <label className="info-label">Current Password</label>
            {isEditing ? (
              <TextField
                fullWidth
                variant="outlined"
                type="password"
                value={accountData.currentPassword}
                onChange={(event) =>
                  handleChange(event as React.ChangeEvent<HTMLInputElement>, "currentPassword")
                }
                className="info-input"
                placeholder="Enter your current password"
                required
              />
            ) : (
              <div className="info-value">
                <span className="empty-value">••••••••</span>
              </div>
            )}
          </div>

          {/* New Password field - always visible */}
          <div className="info-field">
            <label className="info-label">New Password</label>
            {isEditing ? (
              <TextField
                fullWidth
                variant="outlined"
                type="password"
                value={accountData.newPassword}
                onChange={(event) =>
                  handleChange(event as React.ChangeEvent<HTMLInputElement>, "newPassword")
                }
                className="info-input"
                placeholder="Enter new password (optional)"
              />
            ) : (
              <div className="info-value">
                <span className="empty-value">Not set</span>
              </div>
            )}
          </div>

          {/* Confirm New Password field - always visible when editing or if new password exists */}
          {(isEditing || accountData.newPassword) && (
            <div className="info-field">
              <label className="info-label">Confirm New Password</label>
              {isEditing ? (
                <TextField
                  fullWidth
                  variant="outlined"
                  type="password"
                  value={accountData.confirmNewPassword}
                  onChange={(event) =>
                    handleChange(event as React.ChangeEvent<HTMLInputElement>, "confirmNewPassword")
                  }
                  className="info-input"
                  placeholder="Confirm new password"
                />
              ) : (
                <div className="info-value">
                  <span className="empty-value">Not set</span>
                </div>
              )}
            </div>
          )}

          {isEditing && (
            <div className="edit-actions">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                className="save-button"
              >
                Save Changes
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancel}
                className="cancel-button"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AccountSettings;

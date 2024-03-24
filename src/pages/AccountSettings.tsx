// AccountSettings.tsx
import React, { useState } from "react";
import { auth, db } from "../firebase-config";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  updateEmail,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import "../css/AccountSettings.css";

const AccountSettings = () => {
  const user = auth.currentUser;
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const reauthenticate = async (currentPassword: string) => {
    if (!user || !user.email) return false;
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    try {
      await reauthenticateWithCredential(user, credential);
      return true; // User re-authenticated.
    } catch (error) {
      console.error("Error re-authenticating: ", error);
      alert("Current password is incorrect.");
      return false;
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const isReauthenticated = await reauthenticate(currentPassword);
    if (!isReauthenticated) return;

    if (newEmail) {
      try {
        await updateEmail(user, newEmail);
        // Optionally, update user's email in Firestore.
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { email: newEmail });
        alert("Email updated successfully.");
      } catch (error) {
        console.error("Error updating email:", error);
        alert("Failed to update email.");
      }
    }

    if (newPassword) {
      try {
        await updatePassword(user, newPassword);
        alert("Password updated successfully.");
      } catch (error) {
        console.error("Error updating password:", error);
        alert("Failed to update password.");
      }
    }
  };

  return (
    <div className="account-settings">
      <h2>Account Settings</h2>
      <form onSubmit={handleUpdate} className="account-settings-form">
        <label>
          Current Password:
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </label>
        <label>
          New Email:
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        </label>
        <label>
          New Password:
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>
        <button type="submit">Update Account</button>
      </form>
    </div>
  );
};

export default AccountSettings;

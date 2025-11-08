import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { TextField, Button } from "@mui/material";
import MainLayout from "../components/MainLayout"; // Adjust the import path as needed
import "../css/PersonalInfo.css";

interface UserData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

const PersonalInfoPage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
  });
  const [originalData, setOriginalData] = useState<UserData>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchData(user.uid);
      } else {
        console.log("User not logged in");
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchData = async (userId: string) => {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as UserData;
      const fetchedData = {
        username: data.username || "",
        email: data.email || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
      };
      setUserData(fetchedData);
      setOriginalData(fetchedData);
    } else {
      console.log("No such document!");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!userId) return;
    try {
      const docRef = doc(db, "users", userId);
      await updateDoc(docRef, userData);
      setOriginalData(userData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user data:", error);
      alert("Failed to update information. Please try again.");
    }
  };

  const handleCancel = () => {
    setUserData(originalData);
    setIsEditing(false);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: keyof UserData
  ) => {
    setUserData({ ...userData, [field]: event.target.value });
  };

  const fields: Array<{ key: keyof UserData; label: string }> = [
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
  ];

  return (
    <MainLayout>
      <div className="personal-info-container">
        <div className="personal-info-header">
          <h2>Personal Information</h2>
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

        <div className="personal-info-content">
          {fields.map(({ key, label }) => (
            <div key={key} className="info-field">
              <label className="info-label">{label}</label>
              {isEditing ? (
                <TextField
                  fullWidth
                  variant="outlined"
                  value={userData[key]}
                  onChange={(event) =>
                    handleChange(event as React.ChangeEvent<HTMLInputElement>, key)
                  }
                  className="info-input"
                />
              ) : (
                <div className="info-value">
                  {userData[key] || <span className="empty-value">Not set</span>}
                </div>
              )}
            </div>
          ))}

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

export default PersonalInfoPage;

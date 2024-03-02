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
  phoneNumber: string;
  firstName: string;
  lastName: string;
  address: string;
}

interface EditModeState {
  [key: string]: boolean;
}

const PersonalInfoPage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditModeState>({});
  const [userData, setUserData] = useState<UserData>({
    username: "",
    email: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
    address: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchData(user.uid);
      } else {
        // Optionally, navigate to login page or show a message
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
      setUserData({
        username: data.username || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        address: data.address || "",
      });
    } else {
      console.log("No such document!");
    }
  };

  const handleEdit = (field: keyof UserData) => {
    setEditMode({ ...editMode, [field]: true });
  };

  const handleSave = async (field: keyof UserData) => {
    if (!userId) return;
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, { [field]: userData[field] });
    setEditMode({ ...editMode, [field]: false });
  };

  const handleCancel = (field: keyof UserData) => {
    setEditMode({ ...editMode, [field]: false });
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: keyof UserData
  ) => {
    setUserData({ ...userData, [field]: event.target.value });
  };

  const editableFields = [
    "username",
    "email",
    "phoneNumber",
    "firstName",
    "lastName",
    "address",
  ];

  const formatTitle = (str: string): string => {
    // Split string at each capital letter
    const words = str.replace(/([A-Z])/g, " $1");
    // Capitalize the first letter of each word
    const capitalizedWords = words.replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
    return capitalizedWords.trim();
  };

  return (
    <MainLayout>
      <div className="personal-info-container">
        <h2>Personal Info</h2>
        {Object.entries(userData).map(([key, value]) =>
          editableFields.includes(key) ? (
            <div key={key} className="info-field">
              <div className="info-content">
                <b>{formatTitle(key)}:</b> {value}
              </div>
              {!editMode[key] ? (
                <div className="action-buttons">
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleEdit(key as keyof UserData)}
                  >
                    Edit
                  </Button>
                </div>
              ) : (
                <div className="edit-field">
                  <TextField
                    label={key}
                    variant="outlined"
                    value={value}
                    onChange={(event) =>
                      handleChange(event, key as keyof UserData)
                    }
                  />
                  <div className="action-buttons">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleSave(key as keyof UserData)}
                    >
                      Save
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleCancel(key as keyof UserData)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : null
        )}
      </div>
    </MainLayout>
  );
};

export default PersonalInfoPage;

import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { TextField, Button } from "@mui/material";
import MainLayout from "../components/MainLayout";
import "../css/Addresses.css";

interface AddressData {
  registrationAddress: string;
  shippingAddress: string;
  shipFromAddress: string;
}

interface EditModeState {
  [key: string]: boolean;
}

const AddressesPage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditModeState>({});
  const [addressData, setAddressData] = useState<AddressData>({
    registrationAddress: "",
    shippingAddress: "",
    shipFromAddress: "",
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
      const data = docSnap.data() as AddressData;
      setAddressData({
        registrationAddress: data.registrationAddress || "",
        shippingAddress: data.shippingAddress || "",
        shipFromAddress: data.shipFromAddress || "",
      });
    } else {
      console.log("No such document!");
    }
  };

  const handleEdit = (field: keyof AddressData) => {
    setEditMode({ ...editMode, [field]: true });
  };

  const handleSave = async (field: keyof AddressData) => {
    if (!userId) return;
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, { [field]: addressData[field] });
    setEditMode({ ...editMode, [field]: false });
  };

  const handleCancel = (field: keyof AddressData) => {
    setEditMode({ ...editMode, [field]: false });
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: keyof AddressData
  ) => {
    setAddressData({ ...addressData, [field]: event.target.value });
  };

  return (
    <MainLayout>
      <div className="addresses-container">
        <h2>Addresses</h2>
        {Object.entries(addressData).map(([key, value]) => (
          <div key={key} className="address-field">
            <div className="address-content">
              <b>{`${key.replace(/([A-Z])/g, " $1").trim()}:`}</b> {value}
            </div>
            {!editMode[key] ? (
              <div className="action-buttons">
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleEdit(key as keyof AddressData)}
                >
                  Edit
                </Button>
              </div>
            ) : (
              <div className="edit-field">
                <TextField
                  label={key.replace(/([A-Z])/g, " $1").trim()}
                  variant="outlined"
                  value={value}
                  onChange={(event) =>
                    handleChange(event, key as keyof AddressData)
                  }
                />
                <div className="action-buttons">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleSave(key as keyof AddressData)}
                  >
                    Save
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleCancel(key as keyof AddressData)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </MainLayout>
  );
};

export default AddressesPage;

import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import MainLayout from "../components/MainLayout";
import { ShippingAddress } from "../services/shippoService";
import "../css/Addresses.css";

interface AddressData {
  registrationAddress: string;
  shippingAddress: string;
  shipFromAddress: ShippingAddress | string;
}

interface EditModeState {
  [key: string]: boolean;
}

/**
 * Addresses Page - SECURITY: Only shows addresses to the logged-in user
 * Seller addresses are NEVER exposed to other users or in client-side code.
 * Shipping calculations use Cloud Functions that fetch seller addresses server-side only.
 */
const AddressesPage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditModeState>({});
  const [addressData, setAddressData] = useState<AddressData>({
    registrationAddress: "",
    shippingAddress: "",
    shipFromAddress: "",
  });
  const [shipFromAddressForm, setShipFromAddressForm] = useState<ShippingAddress>({
    name: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    phone: "",
    email: "",
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
      
      // Parse shipFromAddress if it's a string
      let shipFrom: ShippingAddress | string = "";
      if (data.shipFromAddress) {
        if (typeof data.shipFromAddress === "string") {
          try {
            shipFrom = JSON.parse(data.shipFromAddress);
            setShipFromAddressForm(shipFrom as ShippingAddress);
          } catch {
            shipFrom = data.shipFromAddress;
          }
        } else {
          shipFrom = data.shipFromAddress;
          setShipFromAddressForm(shipFrom as ShippingAddress);
        }
      }
      
      setAddressData({
        registrationAddress: data.registrationAddress || "",
        shippingAddress: data.shippingAddress || "",
        shipFromAddress: shipFrom,
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
    
    // Special handling for shipFromAddress - save as JSON
    if (field === "shipFromAddress") {
      await updateDoc(docRef, { 
        [field]: JSON.stringify(shipFromAddressForm) 
      });
      setAddressData({ ...addressData, shipFromAddress: shipFromAddressForm });
    } else {
      await updateDoc(docRef, { [field]: addressData[field] });
    }
    
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

  const handleShipFromAddressChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof ShippingAddress
  ) => {
    setShipFromAddressForm({
      ...shipFromAddressForm,
      [field]: event.target.value,
    });
  };

  const renderShipFromAddress = () => {
    const isEditing = editMode.shipFromAddress;
    const address = typeof addressData.shipFromAddress === "object" 
      ? addressData.shipFromAddress 
      : null;

    return (
      <div className="address-field">
        <Typography variant="h6" gutterBottom>
          Ship From Address (For Sellers)
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          This address is used when calculating shipping rates for your items. 
          Make sure all fields are complete.
        </Typography>
        
        {!isEditing ? (
          <>
            {address ? (
              <div className="address-content">
                <p><b>Name:</b> {address.name || "Not set"}</p>
                <p><b>Street:</b> {address.street1 || "Not set"}</p>
                {address.street2 && <p><b>Street 2:</b> {address.street2}</p>}
                <p><b>City:</b> {address.city || "Not set"}</p>
                <p><b>State:</b> {address.state || "Not set"}</p>
                <p><b>ZIP:</b> {address.zip || "Not set"}</p>
                <p><b>Country:</b> {address.country || "US"}</p>
                {address.phone && <p><b>Phone:</b> {address.phone}</p>}
                {address.email && <p><b>Email:</b> {address.email}</p>}
              </div>
            ) : (
              <Alert severity="warning">
                No shipping address set. Buyers won't be able to calculate shipping rates for your items.
              </Alert>
            )}
            <div className="action-buttons" style={{ marginTop: "16px" }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleEdit("shipFromAddress")}
              >
                {address ? "Edit" : "Set Address"}
              </Button>
            </div>
          </>
        ) : (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Full Name *"
              variant="outlined"
              fullWidth
              value={shipFromAddressForm.name}
              onChange={(e) => handleShipFromAddressChange(e, "name")}
              margin="normal"
              required
            />
            <TextField
              label="Street Address *"
              variant="outlined"
              fullWidth
              value={shipFromAddressForm.street1}
              onChange={(e) => handleShipFromAddressChange(e, "street1")}
              margin="normal"
              required
            />
            <TextField
              label="Apartment, suite, etc. (optional)"
              variant="outlined"
              fullWidth
              value={shipFromAddressForm.street2 || ""}
              onChange={(e) => handleShipFromAddressChange(e, "street2")}
              margin="normal"
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="City *"
                variant="outlined"
                fullWidth
                value={shipFromAddressForm.city}
                onChange={(e) => handleShipFromAddressChange(e, "city")}
                margin="normal"
                required
              />
              <TextField
                label="State *"
                variant="outlined"
                fullWidth
                value={shipFromAddressForm.state}
                onChange={(e) => handleShipFromAddressChange(e, "state")}
                margin="normal"
                required
              />
              <TextField
                label="ZIP Code *"
                variant="outlined"
                fullWidth
                value={shipFromAddressForm.zip}
                onChange={(e) => handleShipFromAddressChange(e, "zip")}
                margin="normal"
                required
              />
            </Box>
            <TextField
              label="Country *"
              variant="outlined"
              fullWidth
              value={shipFromAddressForm.country}
              onChange={(e) => handleShipFromAddressChange(e, "country")}
              margin="normal"
              required
            />
            <TextField
              label="Phone (optional)"
              variant="outlined"
              fullWidth
              value={shipFromAddressForm.phone || ""}
              onChange={(e) => handleShipFromAddressChange(e, "phone")}
              margin="normal"
            />
            <TextField
              label="Email (optional)"
              variant="outlined"
              fullWidth
              value={shipFromAddressForm.email || ""}
              onChange={(e) => handleShipFromAddressChange(e, "email")}
              margin="normal"
            />
            <div className="action-buttons" style={{ marginTop: "16px" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  // Validate required fields
                  if (!shipFromAddressForm.name || !shipFromAddressForm.street1 || 
                      !shipFromAddressForm.city || !shipFromAddressForm.state || 
                      !shipFromAddressForm.zip) {
                    alert("Please fill in all required fields (marked with *)");
                    return;
                  }
                  handleSave("shipFromAddress");
                }}
              >
                Save
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleCancel("shipFromAddress")}
              >
                Cancel
              </Button>
            </div>
          </Box>
        )}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="addresses-container">
        <h2>Addresses</h2>
        
        {/* Ship From Address - Special handling */}
        {renderShipFromAddress()}
        
        <div style={{ marginTop: "32px", marginBottom: "16px" }}>
          <Typography variant="h6" gutterBottom>
            Other Addresses
          </Typography>
        </div>
        
        {/* Other addresses */}
        {Object.entries(addressData)
          .filter(([key]) => key !== "shipFromAddress")
          .map(([key, value]) => (
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

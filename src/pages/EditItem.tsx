import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase-config";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { TextField, Button } from "@mui/material";
import { getAuth } from "firebase/auth"; // Import for authentication

import "../css/EditItem.css"; // Ensure you create or adjust the CSS file accordingly

const EditItem: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Item ID from URL
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const auth = getAuth(); // Initialize Firebase Auth

  useEffect(() => {
    const fetchItem = async () => {
      const docRef = doc(db, "items", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data) {
          setTitle(data.title || "");
          setDescription(data.description || "");
          setPrice(data.price || "");
        }
      } else {
        console.log("No such document!");
      }
    };
    fetchItem();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Assuming the user is the same as the item's seller
    const userId = auth.currentUser?.uid; // Get current user's ID
    console.log(userId);
    if (!userId) {
      console.error("User not authenticated");
      return;
    }

    const updatedItemInfo = {
      title,
      description,
      price,
    };

    try {
      // Update the item in both the 'items' collection and the user's 'selling' subcollection
      await updateDoc(doc(db, "items", id), updatedItemInfo);
      await updateDoc(doc(db, "users", userId, "selling", id), updatedItemInfo);
      navigate(`/item/${id}`); // Redirect to the item's page after updating
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return (
    <div className="edit-item-container">
      <h2>Edit Item</h2>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          variant="outlined"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          label="Description"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          label="Price"
          variant="outlined"
          fullWidth
          margin="normal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary">
          Update Item
        </Button>
      </form>
    </div>
  );
};

export default EditItem;

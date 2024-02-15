import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase-config"; // Assuming these are correctly set up
import { updateProfile, updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import "../css/EditProfile.css"; // Make sure this path is correct

const EditProfile = () => {
  const user = auth.currentUser;
  const [username, setUsername] = useState(user.displayName || "");
  const [newPassword, setNewPassword] = useState("");
  const [reEnteredPassword, setReEnteredPassword] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    // Check if the new password and re-entered password match
    if (newPassword && newPassword !== reEnteredPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    let imageUrl = user.photoURL; // Default to existing photoURL if no new image is selected
    if (selectedImage) {
      const imageRef = ref(
        storage,
        `profileImages/${user.uid}/${selectedImage.name}`
      );
      const uploadResult = await uploadBytes(imageRef, selectedImage);
      imageUrl = await getDownloadURL(uploadResult.ref);
    }

    // Update Firebase Authentication profile
    await updateProfile(user, {
      displayName: username,
      photoURL: imageUrl,
    });

    // Update Firestore document with new username (and any other information you wish to store)
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, {
      username: username,
    });

    // Update password if newPassword is provided
    if (newPassword) {
      await updatePassword(user, newPassword).catch((error) => {
        alert(
          "Failed to update password. You might need to re-login and try again."
        );
        console.error("Password update error:", error);
      });
    }

    alert("Profile updated successfully.");

    navigate("/profile");

    // Optionally, navigate the user to a different page or refresh the profile page to show updated information
  };

  return (
    <div className="edit-profile">
      <h2>Edit Profile</h2>
      <form onSubmit={handleUpdateProfile} className="edit-profile-form">
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label>
          New Password: (Leave blank to keep the same)
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>
        <label>
          Re-enter New Password:
          <input
            type="password"
            value={reEnteredPassword}
            onChange={(e) => setReEnteredPassword(e.target.value)}
          />
        </label>
        <label>
          Profile Image:
          <input type="file" onChange={handleImageChange} accept="image/*" />
        </label>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default EditProfile;

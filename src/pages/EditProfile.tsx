import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase-config";
import { updateProfile, updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import "../css/EditProfile.css";

const EditProfile = () => {
  const user = auth.currentUser;
  const [username, setUsername] = useState(user?.displayName || "");
  const [newPassword, setNewPassword] = useState("");
  const [reEnteredPassword, setReEnteredPassword] = useState("");
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure user is not null
    if (!user) {
      navigate("/signin");
      return;
    }
  }, [user, navigate]);

  const handleImageChange = (e:any) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleUpdateProfile = async (e:any) => {
    e.preventDefault();
    if (!user) return;

    let imageUrl = user.photoURL; // Keep existing photoURL by default

    if (selectedImage) {
      const imageRef = ref(
        storage,
        `profileImages/${user.uid}/${selectedImage.name}`
      );
      await uploadBytes(imageRef, selectedImage);
      imageUrl = await getDownloadURL(imageRef);
    }

    if (username) {
      await updateProfile(user, {
        displayName: username,
        photoURL: imageUrl,
      });
    }

    if (newPassword && newPassword === reEnteredPassword) {
      await updatePassword(user, newPassword);
    } else if (newPassword !== reEnteredPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, {
      username: username,
      photoURL: imageUrl,
    });

    alert("Profile updated successfully.");
    navigate("/profile");
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

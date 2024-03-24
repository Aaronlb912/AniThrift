import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase-config";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import "../css/EditProfile.css";

const EditProfile = () => {
  const user = auth.currentUser;
  const [username, setUsername] = useState(user?.displayName || "");
  const [bio, setBio] = useState(""); // Add state for user bio
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure user is not null and fetch the existing bio from the database
    if (!user) {
      navigate("/signin");
      return;
    }
    const fetchUserInfo = async () => {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
      } else {
        const userData = userDoc.data();
        setBio(userData.bio || "");
      }
    };
    fetchUserInfo();
  }, [user, navigate]);

  const handleImageChange = (e: any) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleUpdateProfile = async (e: any) => {
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

    await updateProfile(user, {
      displayName: username,
      photoURL: imageUrl,
    });

    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, {
      username: username,
      photoURL: imageUrl,
      bio: bio, // Update the user bio
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
          Bio: {/* Add a label for bio */}
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{ minHeight: "100px", minWidth: "100%" }} // Style for minimum height and width
          ></textarea>
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

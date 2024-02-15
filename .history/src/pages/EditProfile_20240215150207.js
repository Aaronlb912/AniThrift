import React, { useState } from 'react';

import { auth, db } from '../firebase-config'; // Adjust this import based on your Firebase config file
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import '../css/EditProfile.css'; // Create and import your CSS file for styling

const EditProfile = () => {
  const user = auth.currentUser;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    // Update profile in Firebase Authentication
    if (username || profileImage) {
      await updateProfile(user, {
        displayName: username || user.displayName,
        photoURL: profileImage || user.photoURL,
      });
    }

    // Update additional information in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      username: username || user.displayName,
      // Include other fields as necessary
    });

    // Handle password update separately as needed
  };

  return (
    <form onSubmit={handleUpdateProfile} className="edit-profile-form">
      <label>Username:
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <label>Password: (Leave blank to keep the same)
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <label>Profile Image URL:
        <input type="text" value={profileImage} onChange={(e) => setProfileImage(e.target.value)} />
      </label>
      <button type="submit">Update Profile</button>
    </form>
  );
};

export default EditProfile;

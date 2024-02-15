import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config'; // Adjust the path as necessary
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase-config'; // Assuming you're using Firebase Auth
import '../css/Profile.css'; // Your CSS file path

const Profile = () => {
  const [userProfile, setUserProfile] = useState({
    name: '',
    username: '', // Assuming you have a username field
    profileImage: '',
    userId: '',
    rating: 0,
    reviews: 0,
    memberSince: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile({
          name: data.name || '',
          username: data.username || '', // Add username
          profileImage: data.profileImage || 'defaultProfileImageUrl',
          userId: user.uid,
          rating: data.rating || 0,
          reviews: data.reviews || 0,
          memberSince: data.memberSince ? data.memberSince.toDate().toDateString() : 'N/A'
        });
      } else {
        console.log('No such document!');
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
      </div>
      <hr />
      <div className="profile-info">
        <img src={userProfile.profileImage} alt="Profile" />
        <div>
          <h2>{userProfile.name}</h2>
          <p>Username: {userProfile.username}</p> {/* Add username */}
          <p>User ID: {userProfile.userId}</p>
          <p>Rating: ★★★★★ ({userProfile.rating}) Reviews: {userProfile.reviews}</p> {/* Move reviews next to rating */}
          <p>Member since: {userProfile.memberSince}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;

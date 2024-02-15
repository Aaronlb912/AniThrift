import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { db } from "../firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { .profile-container {
    padding-left: 20px;
}
  
.profile-header {
    text-align: left;
}
  
.profile-info {
    display: flex;
    align-items: center;
    gap: 20px; /* Add space between the image/icon and the text */
}
  
.profile-info img, .profile-icon {
    border-radius: 50%;
    width: 100px;
    height: 100px;
    object-fit: cover; /* Ensures the image covers the area without stretching. Note: This doesn't apply to the icon */
}

.edit-profile-btn {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px; /* Added to move the button below the profile info */
    display: block; /* Makes the button block level for the margin-top to work */
}
  
.edit-profile-btn:hover {
    background-color: #0056b3;
}

.selling-info, .reviews-section {
    margin-bottom: 20px;
}
  
.selling-info {
    display: flex;
    justify-content: space-between;
}
  
.info-box {
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    padding: 5%;
    flex: 1;
    margin: 0 10px;
    border-radius: 5px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
}

.reviews-section button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    margin: 0 5px;
    border-radius: 20px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}
  
.reviews-section button:hover {
    background-color: #0056b3;
}
  
.no-reviews {
    text-align: center;
    color: #666;
    margin-top: 20px;
}
 } from "../firebase-config";
import "../css/Profile.css";
import StarRating from "../components/StarRating";
import ReviewsSection from "../components/ReviewSection";
import { Carousel } from "../components/Carousel";
import { collection, getDocs, query, where } from "firebase/firestore";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const Profile = () => {
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState({
    name: "",
    username: "",
    profileImage: "",
    userId: "",
    rating: 0,
    reviews: 0,
    memberSince: "",
  });

  const [watchListItems, setWatchListItems] = useState([]);
  const [recentlyViewedItems, setRecentlyViewedItems] = useState([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile({
          name: data.name || "",
          username: data.username || "",
          profileImage: data.profileImage || "defaultProfileImageUrl",
          userId: user.uid,
          rating: data.rating || 0,
          reviews: data.reviews || 0,
          memberSince: data.memberSince
            ? data.memberSince.toDate().toDateString()
            : "N/A",
        });
      } else {
        console.log("No such document!");
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      const user = auth.currentUser;
      if (!user) return; // Ensure user is logged in

      // Fetch Watch List Items
      const watchListQuery = query(
        collection(db, `users/${user.uid}/Watching`)
      );
      const watchListSnapshot = await getDocs(watchListQuery);
      const watchListData = watchListSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWatchListItems(watchListData);

      // Fetch Recently Viewed Items
      const recentlyViewedQuery = query(
        collection(db, `users/${user.uid}/Recently Viewed`)
      );
      const recentlyViewedSnapshot = await getDocs(recentlyViewedQuery);
      const recentlyViewedData = recentlyViewedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecentlyViewedItems(recentlyViewedData);
    };

    fetchItems();
  }, []);

  const [sellingInfo, setSellingInfo] = useState({
    activeListings: 5,
    sales: 12,
    accountBalance: 150.5,
  });

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
      </div>
      <hr />
      <div className="profile-info">
        {
          userProfile.profileImage ? (
            <img src={userProfile.profileImage} alt="Profile" />
          ) : (
            <AccountCircleIcon style={{ fontSize: 100 }} />
          ) // Adjust the icon size as needed
        }{" "}
        <div>
          <h2>{userProfile.name}</h2>
          <p>Username: {userProfile.username}</p> {/* Add username */}
          <p>User ID: {userProfile.userId}</p>
          <p>
            Rating: <StarRating rating={userProfile.rating} />
            Reviews: {userProfile.reviews}
          </p>{" "}
          {/* Move reviews next to rating */}
          <p>Member since: {userProfile.memberSince}</p>
        </div>
      </div>
      <button
        className="edit-profile-btn"
        onClick={() => navigate("/edit-profile")}
      >
        Edit Profile
      </button>

      <h2>Selling</h2>
      <div className="selling-info">
        <div className="info-box">
          {sellingInfo.activeListings}
          <br />
          Active Listings
        </div>
        <div className="info-box">
          {sellingInfo.sales} <br /> Sales{" "}
        </div>
        <div className="info-box">
          ${sellingInfo.accountBalance}
          <br />
          Account Balance:
        </div>
      </div>
      <ReviewsSection reviews={userProfile.reviews} />
      <h2>My Watch List</h2>
      <Carousel items={watchListItems} />

      <h2>Recently Viewed Items</h2>
      <Carousel items={recentlyViewedItems} />
    </div>
  );
};

export default Profile;

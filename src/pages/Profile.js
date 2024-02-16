import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase-config";
import { doc, getDoc } from "firebase/firestore";
import "../css/Profile.css";
import StarRating from "../components/StarRating";
import ReviewsSection from "../components/ReviewSection";
import { Carousel } from "../components/Carousel"; // Make sure this is the correct import based on your file structure
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const Profile = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);

  const [sellingInfo, setSellingInfo] = useState({
    activeListings: 0, // Default value, adjust as necessary
    sales: 0, // Default value, adjust as necessary
    accountBalance: 0, // Default value, adjust as necessary
  });

  const [watchListItems, setWatchListItems] = useState([]);
  const [recentlyViewedItems, setRecentlyViewedItems] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserProfile(user.uid);
      } else {
        navigate("/signin");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchUserProfile = async (uid) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserProfile(docSnap.data());
    } else {
      console.error("No such document!");
    }
  };

  if (!userProfile) return <div>Loading...</div>; // Loading state

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
      </div>
      <hr />
      <div className="profile-info">
        {userProfile.photoURL ? (
          <img
            src={userProfile.photoURL}
            alt="Profile"
            style={{ width: 100, height: 100, borderRadius: "50%" }}
          />
        ) : (
          <AccountCircleIcon style={{ fontSize: 100 }} />
        )}
        <div>
          <h2>{userProfile.name}</h2>
          <p>Username: {userProfile.username}</p>
          <p>User ID: {userProfile.userId}</p>
          <p>
            Rating: <StarRating rating={userProfile.rating} />
            Reviews: {userProfile.reviews}
          </p>
          <p>Member since: {userProfile.creationDate}</p>
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
      {/* <ReviewsSection reviews={userProfile.reviews} /> */}
      <h2>My Watch List</h2>
      <Carousel items={watchListItems} />

      <h2>Recently Viewed Items</h2>
      <Carousel items={recentlyViewedItems} />
    </div>
  );
};

export default Profile;

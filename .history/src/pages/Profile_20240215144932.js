import React, { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "../firebase-config";
import "../css/Profile.css";
import StarRating from "../components/StarRating";
import ReviewsSection from "../components/ReviewSection";
import { Carousel } from "../components/Carousel";
import { collection, getDocs, query, where } from "firebase/firestore";

const Profile = () => {
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
        <img src={userProfile.profileImage} alt="Profile" />
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
      <h2>Selling</h2>
      <div className="selling-info">
        <div className="info-box">
          Active Listings: {sellingInfo.activeListings}
        </div>
        <div className="info-box">Sales {sellingInfo.sales}</div>
        <div className="info-box">
          Account Balance: ${sellingInfo.accountBalance}
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

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../firebase-config";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import "../css/Profile.css";
import StarRating from "../components/StarRating";
import ReviewsSection from "../components/ReviewSection";
import { Carousel } from "../components/Carousel"; // Adjust the path as necessary
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const Profile = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [userItems, setUserItems] = useState([]); // State to store the user's selling items
  const [watchListItems, setWatchListItems] = useState([]);
  const [recentlyViewedItems, setRecentlyViewedItems] = useState([]);

  const [sellingInfo, setSellingInfo] = useState({
    activeListings: 0, // Default value, adjust as necessary
    sales: 0, // Default value, adjust as necessary
    accountBalance: 0, // Default value, adjust as necessary
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserProfile(user.uid);
        fetchUserItems(user.uid); // Fetch the user's selling items
        fetchWatchListItems(user.uid); // Fetch the user's watchlist items
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

  const fetchUserItems = async (uid) => {
    const q = query(collection(db, "items"), where("sellerId", "==", uid));
    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id, // Consider adding an ID if you need to reference the item later
        ...doc.data(),
        imageUrl: doc.data().photos[0],
        name: data.title,
        price: data.price,
      };
    });
    setUserItems(items);
  };
  const fetchWatchListItems = async (uid) => {
    const watchlistRef = collection(db, "users", uid, "watchlist");
    const querySnapshot = await getDocs(watchlistRef);
    const watchlist = [];
    for (const docSnapshot of querySnapshot.docs) {
      const itemRef = doc(db, "items", docSnapshot.data().itemId);
      const itemSnapshot = await getDoc(itemRef);
      if (itemSnapshot.exists()) {
        watchlist.push({
          id: itemSnapshot.id,
          ...itemSnapshot.data(),
          imageUrl: itemSnapshot.data().photos[0], // Assuming the first photo is what you want to display
          name: itemSnapshot.data().title,
          price: itemSnapshot.data().price,
        });
      }
    }
    setWatchListItems(watchlist);
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
      <h2>Items I'm Selling</h2>
      {userItems.length > 0 ? (
        <Carousel items={userItems} />
      ) : (
        <p>You do not have any items listed for sale.</p>
      )}
      {/* <ReviewsSection reviews={userProfile.reviews} /> */}
      <h2>My Watch List</h2>
      {watchListItems.length > 0 ? (
        <Carousel items={watchListItems} />
      ) : (
        <p>You are not currently watching any items.</p>
      )}

      <h2>Recently Viewed Items</h2>
      <Carousel items={recentlyViewedItems} />
    </div>
  );
};

export default Profile;

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
import { DataGrid } from "@mui/x-data-grid";

interface UserProfile {
  name: string;
  username: string;
  uid: string;
  photoURL: string;
  rating: number;
  reviews: number;
  creationDate: string;
}

interface SellingInfo {
  activeListings: number;
  sales: number;
  accountBalance: number;
}

const columns = [
  {
    field: "imageUrl",
    headerName: "Image",
    width: 160,
    renderCell: (params) => (
      <img
        src={params.value || "defaultImageURLHere"} // Use a default image if imageUrl is missing
        alt=""
        style={{ width: "100%", height: "auto" }}
      />
    ),
  },
  { field: "id", headerName: "ID", width: 150 },
  { field: "name", headerName: "Name", width: 130 },
  { field: "price", headerName: "Price", type: "number", width: 90 },
  // Add more columns as needed based on your item data structure
];

const Profile: React.FC = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userItems, setUserItems] = useState<any[]>([]); // State to store the user's selling items
  const [watchListItems, setWatchListItems] = useState<any[]>([]);
  const [recentlyViewedItems, setRecentlyViewedItems] = useState<any[]>([]);

  const [sellingInfo, setSellingInfo] = useState<SellingInfo>({
    activeListings: 0,
    sales: 0,
    accountBalance: 0,
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

  const fetchUserProfile = async (uid: string) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserProfile(docSnap.data() as UserProfile);
    } else {
      console.error("No such document!");
    }
  };

  const extractDocIdFromRefPath = (refPath) => {
    const parts = refPath.split("/");
    return parts[parts.length - 1];
  };

  const fetchUserItems = async (uid) => {
    const q = query(collection(db, "users", uid, "selling"));
    const querySnapshot = await getDocs(q);
    const itemsPromises = querySnapshot.docs.map(async (docSnapshot) => {
      // Assuming itemRef is directly a Firestore DocumentReference
      const itemRef = docSnapshot.data().ref; // This should be a DocumentReference if not a string
      if (!itemRef) return null; // Guard against missing or incorrect refs

      // Directly use the DocumentReference to fetch the document
      const itemSnapshot = await getDoc(itemRef);

      if (itemSnapshot.exists()) {
        const data = itemSnapshot.data();
        return {
          id: itemSnapshot.id,
          ...data,
          imageUrl: data.photos && data.photos.length > 0 ? data.photos[0] : "", // Fallback to empty string if no photos
          name: data.title,
          // Add more fields as needed
        };
      } else {
        console.error("No such item for ref:", itemRef);
        return null;
      }
    });

    const resolvedItems = (await Promise.all(itemsPromises)).filter(
      (item) => item !== null
    );
    setUserItems(resolvedItems);

    // Update the state as necessary
    setSellingInfo((prevInfo) => ({
      ...prevInfo,
      activeListings: resolvedItems.length,
    }));
  };

  const fetchWatchListItems = async (uid: string) => {
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
          imageUrl: itemSnapshot.data().photos[0],
          name: itemSnapshot.data().title,
          price: itemSnapshot.data().price,
        });
      }
    }
    setWatchListItems(watchlist);
  };

  const handleRowClick = (param) => {
    navigate(`/item/${param.id}`); // Navigate to the item's page using its ID
  };

  if (!userProfile) return <div>Loading...</div>;

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
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={userItems}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            onRowClick={handleRowClick} // Add the onRowClick prop
            getRowId={(row) => row.id}
          />
        </div>
      ) : (
        <p>You do not have any items listed for sale.</p>
      )}
      {/* <ReviewsSection reviews={userProfile.reviews} /> */}

      <h2>My Watch List</h2>
      {watchListItems.length > 0 ? (
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={watchListItems}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            onRowClick={handleRowClick} // Add the onRowClick prop
            getRowId={(row: any) => row.id}
          />
        </div>
      ) : (
        <p>You are not currently watching any items.</p>
      )}

      <h2>Recently Viewed Items</h2>
      <Carousel items={recentlyViewedItems} />
    </div>
  );
};

export default Profile;

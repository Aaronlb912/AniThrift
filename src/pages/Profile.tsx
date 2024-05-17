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
  bio: string;
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
    renderCell: (params: { value: any }) => (
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
  const [draftItems, setDraftItems] = useState<any[]>([]);
  const [soldItems, setSoldItems] = useState<any[]>([]);

  const [sellingInfo, setSellingInfo] = useState<SellingInfo>({
    activeListings: 0,
    sales: 0,
    accountBalance: 0,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        fetchUserProfile(user.uid);
        fetchUserItems(user.uid); // Fetch the user's selling items
        fetchWatchListItems(user.uid); // Fetch the user's watchlist items
        fetchDraftItems(user.uid);
        fetchSoldItems(user.uid);
        fetchRecentlyViewedItems(user.uid);

        const fetchStripeInfo = async (userId: any) => {
          const stripeInfoUrl = `https://us-central1-anithrift-e77a9.cloudfunctions.net/fetchStripeAccountInfo?userId=${userId}`;
          try {
            const response = await fetch(stripeInfoUrl);
            if (!response.ok) {
              throw new Error("Failed to fetch Stripe account info");
            }
            const data = await response.json();
            setSellingInfo((prevInfo) => ({
              ...prevInfo,
              sales: data.transaction_count, // Adjust based on your JSON structure
              accountBalance:
                data.balance.reduce(
                  (acc: any, curr: { amount: any }) => acc + curr.amount,
                  0
                ) / 100, // Convert to a readable format if necessary
            }));
          } catch (error) {
            console.error("Error fetching Stripe info:", error);
          }
        };

        fetchStripeInfo(user.uid);
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

  const fetchUserItems = async (uid: string) => {
    const q = query(collection(db, "users", uid, "items"));

    const querySnapshot = await getDocs(q);
    const itemsPromises = querySnapshot.docs.map(async (docSnapshot) => {
      // Assuming itemRef is directly a Firestore DocumentReference
      const itemRef = docSnapshot.data().ref; // This should be a DocumentReference if not a string
      if (!itemRef) return null; // Guard against missing or incorrect refs

      // Directly use the DocumentReference to fetch the document
      const itemSnapshot = await getDoc(itemRef);

      if (
        itemSnapshot.exists() &&
        itemSnapshot.data().listingStatus === "selling"
      ) {
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

  const fetchDraftItems = async (uid: string) => {
    const q = query(collection(db, "users", uid, "items"));

    const querySnapshot = await getDocs(q);
    const itemsPromises = querySnapshot.docs.map(async (docSnapshot) => {
      // Assuming itemRef is directly a Firestore DocumentReference
      const itemRef = docSnapshot.data().ref; // This should be a DocumentReference if not a string
      if (!itemRef) return null; // Guard against missing or incorrect refs

      // Directly use the DocumentReference to fetch the document
      const itemSnapshot = await getDoc(itemRef);

      if (
        itemSnapshot.exists() &&
        itemSnapshot.data().listingStatus === "draft"
      ) {
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
    setDraftItems(resolvedItems);
  };

  const fetchSoldItems = async (uid: string) => {
    const q = query(collection(db, "users", uid, "items"));

    const querySnapshot = await getDocs(q);
    const itemsPromises = querySnapshot.docs.map(async (docSnapshot) => {
      // Assuming itemRef is directly a Firestore DocumentReference
      const itemRef = docSnapshot.data().ref; // This should be a DocumentReference if not a string
      if (!itemRef) return null; // Guard against missing or incorrect refs

      // Directly use the DocumentReference to fetch the document
      const itemSnapshot = await getDoc(itemRef);

      if (
        itemSnapshot.exists() &&
        itemSnapshot.data().listingStatus === "sold"
      ) {
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
    setSoldItems(resolvedItems);
  };

  const fetchRecentlyViewedItems = async (uid: string) => {
    // Reference to the user's recently viewed items collection
    const recentlyViewedRef = collection(db, "users", uid, "recentlyViewed");

    // Fetch all documents from the recently viewed collection
    const querySnapshot = await getDocs(recentlyViewedRef);

    // Map over each document to fetch the referenced item details
    const itemsPromises = querySnapshot.docs.map(async (docSnapshot) => {
      // Get the reference to the item
      const itemRef = docSnapshot.data().ref;

      // Guard against missing or incorrect refs
      if (!itemRef) {
        console.error(
          "Missing or incorrect reference in recently viewed:",
          docSnapshot.id
        );
        return null;
      }

      // Use the item reference to fetch the item document
      const itemSnapshot = await getDoc(itemRef);

      if (itemSnapshot.exists()) {
        const data = itemSnapshot.data();
        return {
          id: itemSnapshot.id,
          ...data,
          imageUrl: data.photos && data.photos.length > 0 ? data.photos[0] : "", // Use the first photo as the image URL
          name: data.title,
          // Include any additional fields you need
        };
      } else {
        console.error("No such item for ref:", itemRef.path);
        return null;
      }
    });

    // Resolve the promises and filter out any null values
    const resolvedItems = (await Promise.all(itemsPromises)).filter(
      (item) => item !== null
    );

    // Update your state with the fetched items
    setRecentlyViewedItems(resolvedItems);
  };

  const fetchWatchListItems = async (uid) => {
    const watchlistRef = collection(db, "users", uid, "watchlist");
    const querySnapshot = await getDocs(watchlistRef);

    // Map over each document in the watchlist collection
    const itemsPromises = querySnapshot.docs.map(async (docSnapshot) => {
      // Retrieve the reference to the item from the watchlist document
      const itemRef = docSnapshot.data().ref;

      // Guard against missing or incorrect refs
      if (!itemRef) {
        console.error(
          "Missing or incorrect reference in watchlist:",
          docSnapshot.id
        );
        return null;
      }

      // Use the item reference to fetch the item document
      const itemSnapshot = await getDoc(itemRef);

      if (itemSnapshot.exists()) {
        const data = itemSnapshot.data();
        return {
          id: itemSnapshot.id,
          ...data,
          imageUrl: data.photos && data.photos.length > 0 ? data.photos[0] : "", // Use the first photo as the image URL
          name: data.title,
          // Include any additional fields you need
        };
      } else {
        console.error("No such item for ref:", itemRef.path);
        return null;
      }
    });

    // Await all promises and filter out any null values
    const resolvedItems = (await Promise.all(itemsPromises)).filter(
      (item) => item !== null
    );

    // Now resolvedItems contains all items from the user's watchlist
    // Here you would update your state or context with these items
    setWatchListItems(resolvedItems);
  };

  const handleRowClick = (param: { id: any }) => {
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
          <p>Bio</p>
          <p className="bio">{userProfile.bio}</p>
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
        {/* Display the sales count fetched from Stripe */}
        <div className="info-box">
          {sellingInfo.sales}
          <br />
          Sales
        </div>
        {/* Display the account balance fetched from Stripe */}
        <div className="info-box">
          ${sellingInfo.accountBalance.toFixed(2)}
          <br />
          Account Balance
        </div>
      </div>
      <h2>Recently Viewed Items</h2>
      <Carousel items={recentlyViewedItems} />

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

      <h2>My Draft List</h2>
      {draftItems.length > 0 ? (
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={draftItems}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            onRowClick={handleRowClick} // Add the onRowClick prop
            getRowId={(row: any) => row.id}
          />
        </div>
      ) : (
        <p>You do not have any items saved as draft.</p>
      )}

      <h2>My Sold List</h2>
      {soldItems.length > 0 ? (
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={soldItems}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            onRowClick={handleRowClick} // Add the onRowClick prop
            getRowId={(row: any) => row.id}
          />
        </div>
      ) : (
        <p>You have not sold any items.</p>
      )}
    </div>
  );
};

export default Profile;

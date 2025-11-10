import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db } from "../firebase-config";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import "../css/Profile.css"; // You might want to reuse or create a new stylesheet
import StarRating from "../components/StarRating";
import { Carousel } from "../components/Carousel";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { DataGrid } from "@mui/x-data-grid";

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
  { field: "name", headerName: "Name", width: 130 },
  { field: "price", headerName: "Price", type: "number", width: 90 },
  { field: "id", headerName: "ID", width: 150 },
  // Add more columns as needed based on your item data structure
];

const PublicProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>(); // Assume routing setup to capture userId
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userItems, setUserItems] = useState<any[]>([]);
  const [soldItems, setSoldItems] = useState<any[]>([]);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (username) {
      setIsLoading(true);
      setUserProfile(null);
      fetchUserProfile(username);
    }
  }, [username]);

  const fetchUserProfile = async (username: string) => {
    try {
      const usernameRef = doc(db, "usernames", username);
      const usernameSnap = await getDoc(usernameRef);

      if (!usernameSnap.exists()) {
        navigate("/seller-not-found", { replace: true });
        return;
      }

      const userId = usernameSnap.data().userId;
      setProfileUserId(userId); // Store the userId for messaging

      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        navigate("/seller-not-found", { replace: true });
        return;
      }

      const userData = userSnap.data();
      const rating =
        typeof userData.rating === "number" ? userData.rating : 0;

      setUserProfile({
        ...userData,
        rating,
      });

      await fetchUserItems(userId); // Fetch items the user is selling
      await fetchSoldItems(userId); // Fetch items the user has sold
    } catch (error) {
      console.error("Error loading seller profile:", error);
      navigate("/seller-not-found", { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserItems = async (uid: string) => {
    const q = query(collection(db, "items"), where("sellerId", "==", uid));
    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...doc.data(),
        imageUrl: doc.data().photos[0], // Assuming photos is an array
        name: data.title,
      };
    });
    setUserItems(items);

    // Update the activeListings count in the sellingInfo state
  };

  const handleRowClick = (param) => {
    navigate(`/item/${param.id}`); // Navigate to the item's page using its ID
  };

  const fetchSoldItems = async (uid: string) => {
    // Placeholder for sold items fetch
    setSoldItems([]);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!userProfile) {
    return null;
  }

  return (
    <div className="profile-container">
      {/* Display user information */}
      <h1>{userProfile.username}'s Profile</h1>
      {/* Rating, Reviews, Member Since, etc. */}

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
          <h2>{userProfile.username}</h2>
          <p>
            Star Rating
            <br />
            <StarRating rating={userProfile.rating} />
          </p>
          <p>Bio</p>
          <p className="bio">{userProfile.bio}</p>
          {/* Display other user information as needed */}
        </div>
        {/* Possibly display reviews if appropriate */}
      </div>
      {/* Option to send a message */}
      {profileUserId && (
        <Link to={`/messages/${profileUserId}`} className="edit-profile-btn">
          Send a Message
        </Link>
      )}
      {/* Items User is Selling */}
      <h2>Items for Sale</h2>
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

      {/* Items User has Sold */}
      <h2>Items Sold</h2>
      {soldItems.length > 0 ? (
        <Carousel items={soldItems} />
      ) : (
        <p>No sold items.</p>
      )}
    </div>
  );
};

export default PublicProfile;

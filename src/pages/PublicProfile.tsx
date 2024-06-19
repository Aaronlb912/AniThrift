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
  const { userId } = useParams<{ userId: string }>(); // Assume routing setup to capture userId
  const { username } = useParams<{ username: string }>(); // Assume routing setup to capture userId
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userItems, setUserItems] = useState<any[]>([]);
  const [soldItems, setSoldItems] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (username) {
      fetchUserProfile(username);
    }
  }, [username]);

  const fetchUserProfile = async (username: string) => {
    const docRef = doc(db, "usernames", username);

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      let userId = docSnap.data().userId;
      const userRef = doc(db, "users", userId);
      let userSnap = await getDoc(userRef);
      fetchUserItems(userId); // Fetch items the user is selling
      fetchSoldItems(userId); // Fetch items the user has sold
      if (userSnap.exists()) {
        setUserProfile(userSnap.data());
      }
    } else {
      console.log("No such document!");
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
    // Fetch items that the user has sold
  };

  if (!userProfile) return <div>Loading...</div>;

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
      <Link to={`/messages/${userId}`} className="edit-profile-btn">
        Send a Message
      </Link>
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

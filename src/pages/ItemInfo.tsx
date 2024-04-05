import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase-config";
import {
  doc,
  getDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
  limit,
  orderBy,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import { useSearch } from "../components/SearchHandler";

import "../css/ItemInfo.css"; // Ensure your CSS file path is correct

const ItemInfo = () => {
  let { id } = useParams(); // This ID is now expected to be the global item ID
  const auth = getAuth();
  const [mainImage, setMainImage] = useState("");
  const [item, setItem] = useState(null);
  const [seller, setSeller] = useState(null);
  const [userId, setUserId] = useState(null); // Initialize userId state
  const navigate = useNavigate(); // Use this to navigate after delete
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1); // State for tracking selected quantity
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // Can be "error", "warning", "info", or "success"
  });
  const { setSearchQuery } = useSearch(); // Destructure setSearchQuery from the context

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, set userId state
        setUserId(user.uid);
      } else {
        // User is signed out. Handle accordingly, e.g., set userId to null
        setUserId(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchItemAndSeller = async () => {
      // Fetch the item from the global 'items' collection
      const itemRef = doc(db, "items", id);
      const itemSnap = await getDoc(itemRef);

      if (itemSnap.exists()) {
        const itemData = itemSnap.data();
        setItem(itemData);

        if (itemData.photos && itemData.photos.length > 0) {
          setMainImage(itemData.photos[0]);
        }

        updateRecentlyViewedItems(userId, id, seller);

        // Fetch the seller's information using sellerId from the item
        if (itemData.sellerId) {
          const sellerRef = doc(db, "users", itemData.sellerId);
          const sellerSnap = await getDoc(sellerRef);

          if (sellerSnap.exists()) {
            // Here you might want to include only the necessary seller info
            // Adjust according to your user document structure
            setSeller({
              name: sellerSnap.data().username, // Assuming 'name' field exists
              rating: sellerSnap.data().rating, // Assuming 'rating' field exists
            });
          } else {
            console.log("Seller document does not exist");
            setSeller(null);
          }
        }
      } else {
        console.log("Item document does not exist");
      }
    };

    fetchItemAndSeller();
  }, [id, userId]);

  const updateRecentlyViewedItems = async (
    userId: string | null,
    itemId: string | undefined
  ) => {
    // Check if userId or itemId is null or undefined
    if (!userId || !itemId) {
      console.error("User ID or Item ID is missing");
      return;
    }

    const itemRef = doc(db, "items", itemId);
    const itemSnapshot = await getDoc(itemRef);

    if (!itemSnapshot.exists()) {
      console.error("Item does not exist");
      return;
    }

    const itemData = itemSnapshot.data();

    // Prevent adding the item if the viewer is the seller
    if (itemData.sellerId === userId) {
      console.log("User is the seller, not adding to recently viewed");
      return;
    }

    const recentlyViewedRef = collection(db, "users", userId, "recentlyViewed");
    const recentlyViewedSnapshot = await getDocs(recentlyViewedRef);

    let exists = false;
    recentlyViewedSnapshot.forEach((doc) => {
      if (doc.id === itemId) exists = true;
    });

    if (!exists) {
      await setDoc(doc(recentlyViewedRef, itemId), { ref: itemRef });
      console.log("Added item to recently viewed");
    } else {
      console.log("Item already exists in recently viewed");
    }
  };

  const addToWatchlist = async () => {
    if (!item || !userId) {
      console.error("No item data available or user not logged in");
      return;
    }

    // Reference to the watchlist in the user's document
    const watchlistRef = doc(db, "users", userId, "watchlist", id); // Use item.id to create a unique document for each item

    try {
      // Create a reference to the item in the global items collection
      const itemRef = doc(db, "items", id);

      // Set the document in the watchlist collection with the item reference
      await setDoc(watchlistRef, {
        ref: itemRef,
      });

      console.log("Item added to watchlist with reference");
      setSnackbar({
        open: true,
        message: "Added to watchlist",
        severity: "success",
      });
    } catch (error) {
      console.error("Error adding item reference to watchlist: ", error);
    }
  };

  const addToCart = async () => {
    if (
      !item ||
      !userId ||
      !seller ||
      selectedQuantity < 1 ||
      selectedQuantity > item.quantity
    ) {
      console.error("Invalid item data or quantity");
      return;
    }

    // Check if the item already exists in the cart
    const cartItemRef = doc(db, "users", userId, "cart", id); // This line is key
    const cartDoc = await getDoc(cartItemRef);

    if (!cartDoc.exists()) {
      // If the item is not already in the cart, create a new document with the item's ID
      await setDoc(cartItemRef, {
        itemId: id, // This ensures you're using the item's existing ID
        title: item.title,
        imageUrl: item.photos ? item.photos[0] : null,
        price: item.price,
        quantity: selectedQuantity,
        sellerId: item.sellerId,
        sellerName: seller.name,
        addedOn: new Date(),
      });
    } else {
      // If the item is already in the cart, update its quantity
      const existingItemData = cartDoc.data();
      const newQuantity = existingItemData.quantity + selectedQuantity;
      if (newQuantity <= item.quantity) {
        await updateDoc(cartItemRef, { quantity: newQuantity });
      } else {
        console.error("Not enough stock available");
        // Handle error for exceeding stock
      }
    }

    console.log("Cart updated");
    setSnackbar({
      open: true,
      message: "Cart updated successfully",
      severity: "success",
    });
  };

  const deleteItem = async () => {
    try {
      // Delete from the global items collection
      await deleteDoc(doc(db, "items", id));

      // Delete from the user's selling collection
      // Assuming you have a way to identify the specific document to delete, for example by storing the global item ID in the user's selling subcollection
      const sellingRef = collection(db, "users", userId, "selling");
      const q = query(sellingRef, where("itemId", "==", id));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        deleteDoc(doc.ref);
      });

      console.log("Item deleted successfully");
      navigate("/profile"); // Or to any other page you'd like the user to go to after deletion
    } catch (error) {
      console.error("Error deleting item: ", error);
    }
  };

  const handleTagClick = (tag: any) => {
    // Navigate to a search results page with the tag as a query parameter.
    navigate(`/search?query=${encodeURIComponent(tag)}`);
    setSearchQuery(tag);
  };

  const handleThumbnailClick = (image: React.SetStateAction<string>) => {
    setMainImage(image);
  };

  if (!item) return <div>Loading...</div>;

  return (
    <div className="item-info-container">
      <div className="item-details">
        <h2>{item.title}</h2>
      </div>
      <div className="main-image-container">
        <img src={mainImage} alt="Main Item" className="main-image" />
      </div>
      <div className="thumbnail-container">
        {item.photos?.map(
          (photo: string | undefined, index: React.Key | null | undefined) => (
            <img
              key={index}
              src={photo}
              alt={`Item Thumbnail ${index}`}
              className="thumbnail"
              onClick={() => handleThumbnailClick(photo)}
            />
          )
        )}
      </div>
      <div className="item-details">
        <p>
          <h3>Description:</h3> {item.description}
        </p>
        <p>
          <h3>Category:</h3> {item.category}
        </p>
        <p>
          <h3>Condition:</h3> {item.condition}
        </p>
        <div className="item-tags ">
          <h3>Tags:</h3>
          <div className="tag-container">
            {item.tags &&
              item.tags.map((tag, index) => (
                <Button
                  key={index}
                  onClick={() => handleTagClick(tag)}
                  variant="contained"
                  style={{ marginRight: "8px", marginBottom: "8px" }}
                >
                  {tag}
                </Button>
              ))}
          </div>
        </div>
        <div className="anime-tags ">
          <h3>Anime Tags:</h3>
          <div className="tag-container">
            {item.animeTags &&
              item.animeTags.map((animeTag, index) => (
                <Button
                  key={index}
                  onClick={() => handleTagClick(animeTag)} // Reuse the same function for anime tags
                  variant="contained"
                  style={{ marginRight: "8px", marginBottom: "8px" }}
                >
                  {animeTag}
                </Button>
              ))}
          </div>
        </div>
        <div className="item-quantity-container">
          <h3>Available Quantity: {item.quantity}</h3>
          <TextField
            label="Quantity"
            type="number"
            InputProps={{ inputProps: { min: 1, max: item.quantity } }}
            value={selectedQuantity}
            onChange={(e) => setSelectedQuantity(Number(e.target.value))}
            variant="outlined"
            size="small"
          />
        </div>

        <p>
          <h3>Price: ${item.price}</h3>
        </p>
        <div className="listing-status">
          <h3>Listing Status:</h3>
          <p>{item.listingStatus}</p>
        </div>
        {userId === item.sellerId ? (
          // If the current user is the seller, show Edit and Delete buttons
          <div>
            <button onClick={() => navigate(`/edit-item/${id}`)}>
              Edit Listing
            </button>
            <button onClick={handleOpenDeleteDialog}>Delete Listing</button>
          </div>
        ) : (
          // If the current user is not the seller, show Add to Watchlist and Cart buttons
          <div>
            <button onClick={addToWatchlist}>Add to Watchlist</button>
            <button onClick={addToCart}>Add to Cart</button>
          </div>
        )}
      </div>
      {seller && (
        <div className="seller-info">
          <h3>Seller: {seller.name}</h3>
          <p>Rating: {seller.rating}</p>
          {/* Link to the seller's public profile */}
          <button onClick={() => navigate(`/user/${item.sellerId}`)}>
            View Profile
          </button>
        </div>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this listing?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={() => {
              deleteItem();
              handleCloseDeleteDialog();
              navigate(`/profile`);
            }}
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ItemInfo;

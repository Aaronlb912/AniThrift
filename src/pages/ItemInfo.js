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
} from "@mui/material";

import "../css/ItemInfo.css"; // Ensure your CSS file path is correct

const ItemInfo = () => {
  let { id } = useParams(); // This ID is now expected to be the global item ID
  const auth = getAuth();
  const [item, setItem] = useState(null);
  const [seller, setSeller] = useState(null);
  const [userId, setUserId] = useState(null); // Initialize userId state
  const navigate = useNavigate(); // Use this to navigate after delete
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // Can be "error", "warning", "info", or "success"
  });

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

        // Fetch the seller's information using sellerId from the item
        if (itemData.sellerId) {
          const sellerRef = doc(db, "users", itemData.sellerId);
          console.log(sellerRef);
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
  }, [id]);

  const addToWatchlist = async () => {
    if (!item || !userId || !seller) {
      console.error(
        "No item data available, user not logged in, or seller info missing"
      );
      return;
    }

    const watchlistRef = collection(db, "users", userId, "watchlist");

    try {
      await addDoc(watchlistRef, {
        itemId: id,
        title: item.title,
        imageUrl: item.photos ? item.photos[0] : null, // Assuming you have photos array
        price: item.price,
        sellerId: item.sellerId, // Push sellerId
        sellerName: seller.name, // Include seller's name
        addedOn: new Date(), // Optional: track when item was added
      });

      console.log("Item added to watchlist");
      setSnackbar({
        open: true,
        message: "Added to watchlist",
        severity: "success",
      });
    } catch (error) {
      console.error("Error adding item to watchlist: ", error);
    }
  };

  const addToCart = async () => {
    if (!item || !userId || !seller) {
      console.error(
        "No item data available, user not logged in, or seller info missing"
      );
      return;
    }

    const cartRef = collection(db, "users", userId, "cart");

    try {
      await addDoc(cartRef, {
        itemId: id,
        title: item.title,
        imageUrl: item.photos ? item.photos[0] : null, // Assuming you have photos array
        price: item.price,
        sellerId: item.sellerId, // Push sellerId
        sellerName: seller.name, // Include seller's name
        addedOn: new Date(), // Optional: track when item was added
      });

      console.log("Item added to cart");
      setSnackbar({
        open: true,
        message: "Added to cart",
        severity: "success",
      });
    } catch (error) {
      console.error("Error adding item to cart: ", error);
    }
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
      navigate("/"); // Or to any other page you'd like the user to go to after deletion
    } catch (error) {
      console.error("Error deleting item: ", error);
    }
  };

  if (!item) return <div>Loading...</div>;

  return (
    <div className="item-info-container">
      <div className="item-images">
        {item.photos &&
          item.photos.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`Item ${index}`}
              className="item-image"
            />
          ))}
      </div>
      <div className="item-details">
        <h2>{item.title}</h2>
        <p>
          <h3>Description:</h3> {item.description}
        </p>
        <p>
          <h3>Category:</h3> {item.category}
        </p>
        <p>
          <h3>Condition:</h3> {item.condition}
        </p>
        <p>
          <h3>Price: ${item.price}</h3>
        </p>
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
      ;
    </div>
  );
};

export default ItemInfo;

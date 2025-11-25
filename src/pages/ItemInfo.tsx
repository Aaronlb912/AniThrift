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
  serverTimestamp,
  increment,
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
import {
  shippingServices,
  shippingWeightTiers,
} from "../data/shippingOptions";

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

        if (userId) {
          updateRecentlyViewedItems(userId, id, itemData);
        }

        // Fetch the seller's information using sellerId from the item
        if (itemData.sellerId) {
          const sellerRef = doc(db, "users", itemData.sellerId);
          const sellerSnap = await getDoc(sellerRef);

          if (sellerSnap.exists()) {
            const sellerData = sellerSnap.data();
            // Store seller info including sellerId for navigation
            setSeller({
              sellerId: itemData.sellerId, // Store the sellerId
              name: sellerData.username, // Username for display and navigation
              rating: sellerData.rating, // Seller rating
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
    itemId: string | undefined,
    itemData: Record<string, any>
  ) => {
    if (!userId || !itemId) {
      return;
    }

    if (itemData?.sellerId === userId) {
      return;
    }

    const recentlyViewedRef = collection(db, "users", userId, "recentlyViewed");
    const itemRef = doc(db, "items", itemId);

    try {
      await setDoc(
        doc(recentlyViewedRef, itemId),
        {
          ref: itemRef,
          viewedAt: serverTimestamp(),
          category: itemData?.category || "",
          tags: Array.isArray(itemData?.tags)
            ? itemData.tags.filter((tag: unknown) => typeof tag === "string")
            : [],
        },
        { merge: true }
      );

      try {
        await updateDoc(itemRef, {
          viewCount: increment(1),
          lastViewedAt: serverTimestamp(),
        });
      } catch (error) {
        console.warn("Unable to update item view count:", error);
      }
    } catch (error) {
      console.error("Failed to update recently viewed items:", error);
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
        shippingSummary: (item as any).shippingSummary || null,
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

  if (!item) return <div className="loading-container">Loading...</div>;

  const shippingSummary = (item as any)?.shippingSummary || null;
  const shippingPayer: "buyer" | "seller" | null =
    shippingSummary?.payer || (item as any)?.shippingPayer ||
    (item.deliveryOption === "Buyer Selects at Checkout" ? "buyer" : null);

  const shippingService = shippingSummary?.serviceId
    ? shippingServices.find((service) => service.id === shippingSummary.serviceId)
    : item.deliveryOption
    ? shippingServices.find((service) => service.name === item.deliveryOption)
    : null;

  const weightTier = shippingSummary?.weightTierId
    ? shippingWeightTiers.find((tier) => tier.id === shippingSummary.weightTierId)
    : undefined;

  const shippingPayerLabel = shippingPayer === "seller"
    ? "Seller"
    : shippingPayer === "buyer"
    ? "Buyer"
    : "Decided at checkout";

  const shippingPayerChipText =
    shippingPayer === "seller"
      ? "Seller pays shipping"
      : shippingPayer === "buyer"
      ? "Buyer pays shipping"
      : "Shipping decided at checkout";

  const shippingServiceLabel =
    shippingService?.name || item.deliveryOption || "Set at checkout";
  const shippingSpeed = shippingService?.speed || "Set at checkout";
  const shippingCostLabel = shippingService
    ? shippingService.id === "ship-yourself"
      ? "Custom rate"
      : `$${shippingService.price.toFixed(2)}`
    : "Calculated at checkout";

  const shippingWeightLabel = weightTier?.label || "Not specified";
  const shippingWeightDescription = weightTier?.description || null;

  return (
    <div className="item-info-container">
      {/* Main Product Section - Two Column Layout */}
      <div className="product-main-section">
        {/* Left Column - Images */}
        <div className="product-images-section">
          <div className="main-image-container">
            <img src={mainImage} alt="Main Item" className="main-image" />
          </div>
          {item.photos && item.photos.length > 1 && (
            <div className="thumbnail-container">
              {item.photos.map(
                (photo: string | undefined, index: React.Key | null | undefined) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Item Thumbnail ${index}`}
                    className={`thumbnail ${mainImage === photo ? "active" : ""}`}
                    onClick={() => handleThumbnailClick(photo)}
                  />
                )
              )}
            </div>
          )}
        </div>

        {/* Right Column - Product Details */}
        <div className="product-details-section">
          <h1 className="product-title">{item.title}</h1>
          
          <div className="product-price-section">
            <span className="product-price">${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</span>
            {item.quantity > 0 && (
              <span className="product-availability">In Stock ({item.quantity} available)</span>
            )}
          </div>

          <div className="product-condition">
            <span className="condition-label">Condition:</span>
            <span className="condition-value">{item.condition}</span>
          </div>

          <div className="product-shipping-card">
            <div className="shipping-card-header">
              <h3>Shipping & Handling</h3>
              <span className="shipping-payer-chip">{shippingPayerChipText}</span>
            </div>
            <div className="shipping-details-grid">
              <div className="shipping-detail">
                <span className="shipping-detail-label">Shipping Paid By</span>
                <span className="shipping-detail-value">{shippingPayerLabel}</span>
              </div>
              <div className="shipping-detail">
                <span className="shipping-detail-label">Service</span>
                <span className="shipping-detail-value">{shippingServiceLabel}</span>
              </div>
              <div className="shipping-detail">
                <span className="shipping-detail-label">Estimated Cost</span>
                <span className="shipping-detail-value">{shippingCostLabel}</span>
              </div>
              <div className="shipping-detail">
                <span className="shipping-detail-label">Speed</span>
                <span className="shipping-detail-value">{shippingSpeed}</span>
              </div>
              <div className="shipping-detail">
                <span className="shipping-detail-label">Package Weight</span>
                <span className="shipping-detail-value">{shippingWeightLabel}</span>
              </div>
            </div>
            {shippingWeightDescription && (
              <p className="shipping-detail-note">{shippingWeightDescription}</p>
            )}
          </div>

          {seller && item.sellerId && (
            <div className="seller-info-box">
              <div className="seller-header">
                <span className="seller-label">Seller:</span>
                <span className="seller-name">{seller.name}</span>
                {seller.rating && (
                  <span className="seller-rating">⭐ {seller.rating}</span>
                )}
              </div>
              <div className="seller-buttons">
                <button
                  className="view-seller-btn"
                  onClick={() => {
                    // Navigate using sellerId - fetch username from sellerId
                    if (seller.name && item.sellerId) {
                      // Use the username fetched from sellerId to navigate
                      navigate(`/user/${seller.name.toLowerCase()}`);
                    }
                  }}
                >
                  View Seller Profile
                </button>
                {userId !== item.sellerId && (
                  <button
                    className="message-seller-btn"
                    onClick={() => {
                      if (!userId) {
                        navigate("/signin", {
                          state: { redirectTo: `/messages/${item.sellerId}` },
                        });
                        return;
                      }
                      navigate(`/messages/${item.sellerId}`);
                    }}
                  >
                    Message Seller
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="product-quantity-section">
            <label className="quantity-label">Quantity:</label>
            <TextField
              type="number"
              InputProps={{ inputProps: { min: 1, max: item.quantity } }}
              value={selectedQuantity}
              onChange={(e) => setSelectedQuantity(Number(e.target.value))}
              variant="outlined"
              size="small"
              className="quantity-input"
            />
            <span className="quantity-available">({item.quantity} available)</span>
          </div>

          <div className="product-actions">
            {userId === item.sellerId ? (
              <div className="seller-actions">
                <button className="btn-primary" onClick={() => navigate(`/edit-item/${id}`)}>
                  Edit Listing
                </button>
                <button className="btn-secondary" onClick={handleOpenDeleteDialog}>
                  Delete Listing
                </button>
              </div>
            ) : (
              <div className="buyer-actions">
                <button className="btn-buy-now" onClick={addToCart}>
                  Add to Cart
                </button>
                <button className="btn-watchlist" onClick={addToWatchlist}>
                  Add to Watchlist
                </button>
              </div>
            )}
          </div>

          <div className="listing-status-box">
            <span className="status-label">Status:</span>
            <span className="status-value">{item.listingStatus}</span>
          </div>
        </div>
      </div>

      {/* Product Information Section */}
      <div className="product-info-section">
        <div className="info-tabs">
          <div className="info-tab active">Description</div>
        </div>
        <div className="info-content">
          <div className="description-section">
            <h3>Item Description</h3>
            <p className="description-text">{item.description}</p>
          </div>

          <div className="item-specs">
            <h3>Item Details</h3>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-label">Category:</span>
                <span className="spec-value">{item.category}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Condition:</span>
                <span className="spec-value">{item.condition}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Quantity Available:</span>
                <span className="spec-value">{item.quantity}</span>
              </div>
              {item.packageCondition && (
                <div className="spec-item">
                  <span className="spec-label">Packaging Condition:</span>
                  <span className="spec-value">{item.packageCondition}</span>
                </div>
              )}
              {item.color && (
                <div className="spec-item">
                  <span className="spec-label">Color:</span>
                  <span className="spec-value">{item.color}</span>
                </div>
              )}
            </div>
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="tags-section">
              <h3>Tags</h3>
              <div className="tag-container">
                {item.tags.map((tag, index) => (
                  <Button
                    key={index}
                    onClick={() => handleTagClick(tag)}
                    variant="outlined"
                    className="tag-button"
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {item.animeTags && item.animeTags.length > 0 && (
            <div className="tags-section">
              <h3>Anime Tags</h3>
              <div className="tag-container">
                {item.animeTags.map((animeTag, index) => (
                  <Button
                    key={index}
                    onClick={() => handleTagClick(animeTag)}
                    variant="outlined"
                    className="tag-button"
                  >
                    {animeTag}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
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

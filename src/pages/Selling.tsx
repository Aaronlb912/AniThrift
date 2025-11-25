import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { db } from "../firebase-config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import "../css/Selling.css";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
  Chip,
  CircularProgress,
  Tooltip,
  Switch,
  Box,
} from "@mui/material";
import MalSearch from "../components/MalSearch";
import axios from "axios";
import {
  shippingServices,
  shippingWeightTiers,
  ShippingPayer,
} from "../data/shippingOptions";

interface MarketplaceItemType {
  title: string;
  description: string;
  tags?: string[];
  category: string;
  condition: string;
  packageCondition: string;
  color?: string;
  deliveryOption: string;
  shippingPayer: ShippingPayer;
  shippingWeightTierId: string;
  shippingServiceId: string;
  price: string;
  quantity: number;
  photos?: PhotoType[];
  creationDate: string;
  sellerId?: string;
  listingStatus: MarketplaceItemStatus;
  isAdultContent?: boolean;
  shippingSummary?: {
    payer: ShippingPayer;
    weightTierId: string;
    serviceId: string;
  };
}

type PhotoType = {
  downloadURL: string | null;
  preview: string;
  fileName?: string;
  fileSize?: number;
};

type MarketplaceItemStatus =
  | "selling"
  | "sold"
  | "draft"
  | "listing pending"
  | "cancelled"
  | "purchased";

const Selling = () => {
  const [item, setItem] = useState<MarketplaceItemType>({
    title: "",
    description: "",
    category: "",
    condition: "",
    packageCondition: "",
    color: "",
    deliveryOption: "Buyer Selects at Checkout",
    shippingPayer: "buyer",
    shippingWeightTierId: "up-to-8oz",
    shippingServiceId: "usps-first-class",
    price: "",
    quantity: 0,
    creationDate: "",
    listingStatus: "selling",
    isAdultContent: false,
  });
  const [tags, setTags] = useState<{ label: string }[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [showColorSuggestions, setShowColorSuggestions] = useState(false);
  const [animeTags, setAnimeTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [hasShippingAddress, setHasShippingAddress] = useState<boolean | null>(
    null
  );
  const [stripeAccountStatus, setStripeAccountStatus] = useState<{
    hasAccount: boolean;
    isReady: boolean;
  } | null>(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        // Check if user has a shipping address
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const shipFromAddress = userData?.shipFromAddress;
            // Check if shipFromAddress exists and is not null/empty
            const hasAddress =
              shipFromAddress &&
              (typeof shipFromAddress === "string"
                ? shipFromAddress.trim() !== ""
                : true);
            setHasShippingAddress(!!hasAddress);
          } else {
            setHasShippingAddress(false);
          }
        } catch (error) {
          console.error("Error checking shipping address:", error);
          setHasShippingAddress(false);
        }
      } else {
        navigate("/signin");
      }
    });
  }, [navigate]);

  useEffect(() => {
    const fetchExistingTags = async () => {
      try {
        const snapshot = await getDocs(collection(db, "items"));
        const tagSet = new Set<string>();
        const colorSet = new Set<string>();
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const itemTags = data?.tags || [];
          if (Array.isArray(itemTags)) {
            itemTags.forEach((tag: string) => {
              if (typeof tag === "string" && tag.trim()) {
                tagSet.add(tag.trim());
              }
            });
          }
          const itemColor = data?.color;
          if (typeof itemColor === "string" && itemColor.trim()) {
            colorSet.add(itemColor.trim());
          }
        });
        setAvailableTags(Array.from(tagSet).sort((a, b) => a.localeCompare(b)));
        setAvailableColors(
          Array.from(colorSet).sort((a, b) => a.localeCompare(b))
        );
      } catch (error) {
        console.error("Error fetching existing tags:", error);
      }
    };

    fetchExistingTags();
  }, []);

  const selectedWeightTier = useMemo(
    () =>
      shippingWeightTiers.find(
        (tier) => tier.id === item.shippingWeightTierId
      ) || shippingWeightTiers[0],
    [item.shippingWeightTierId]
  );

  const availableServices = useMemo(() => {
    if (!selectedWeightTier) return shippingServices;
    return shippingServices.filter(
      (service) => service.maxWeightOz >= selectedWeightTier.maxWeightOz
    );
  }, [selectedWeightTier]);

  const selectedService = useMemo(
    () =>
      shippingServices.find(
        (service) => service.id === item.shippingServiceId
      ) || shippingServices[0],
    [item.shippingServiceId]
  );

  useEffect(() => {
    if (!availableServices.length) return;
    const isValid = availableServices.some(
      (service) => service.id === item.shippingServiceId
    );
    if (!isValid) {
      const fallback = availableServices[0];
      setItem((prev) => ({
        ...prev,
        shippingServiceId: fallback.id,
        deliveryOption: fallback.name,
      }));
    }
  }, [availableServices, item.shippingServiceId]);

  const onDrop = useCallback(
    (acceptedFiles: any) => {
      const storage = getStorage();

      const potentialNewTotal = photos.length + acceptedFiles.length;
      if (potentialNewTotal > 10) {
        alert(
          `You can only upload up to 10 images. Currently selected: ${photos.length}.`
        );
        return;
      }

      // Filter out duplicate files by checking file name and size
      const uniqueFiles = acceptedFiles.filter((file: any) => {
        // Check if a file with the same name and size already exists
        const isDuplicate = photos.some((photo) => {
          // Compare by stored fileName and fileSize if available
          if (photo.fileName && photo.fileSize) {
            return photo.fileName === file.name && photo.fileSize === file.size;
          }
          // Fallback: try to extract filename from downloadURL
          if (photo.downloadURL) {
            const uploadedFileName =
              photo.downloadURL
                .split("/")
                .pop()
                ?.split("_")
                .slice(1)
                .join("_") || "";
            if (uploadedFileName === file.name) {
              return true;
            }
          }
          return false;
        });

        if (isDuplicate) {
          alert(`The image "${file.name}" has already been uploaded.`);
          return false;
        }

        return true;
      });

      if (uniqueFiles.length === 0) {
        return;
      }

      const newPhotosWithPreview = uniqueFiles.map((file: any) => {
        const previewUrl = URL.createObjectURL(file);
        const fileRef = storageRef(
          storage,
          `images/${Date.now()}_${file.name}`
        );
        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {},
          (error) => {
            console.error("Upload error:", error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              setPhotos((prevPhotos) =>
                prevPhotos.map((photo) => {
                  return photo.preview === previewUrl
                    ? { ...photo, downloadURL }
                    : photo;
                })
              );
            });
          }
        );

        return {
          preview: previewUrl,
          downloadURL: null,
          fileName: file.name,
          fileSize: file.size,
        };
      });

      setPhotos((prevPhotos) => [...prevPhotos, ...newPhotosWithPreview]);
    },
    [photos]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 10,
  });

  const removePhoto = (event: any, photoUrl: any) => {
    event.stopPropagation();
    event.preventDefault();

    const filteredPhotos = photos.filter((photo) => photo.preview !== photoUrl);
    setPhotos(filteredPhotos);

    URL.revokeObjectURL(photoUrl);
  };

  React.useEffect(() => {
    return () => photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
  }, [photos]);

  const handleAddTag = (label: string) => {
    const normalized = label.trim();
    if (!normalized) {
      setTagInput("");
      return;
    }

    const canonicalTag =
      availableTags.find(
        (existing) => existing.toLowerCase() === normalized.toLowerCase()
      ) || normalized;

    if (
      !tags.some(
        (tag) => tag.label.toLowerCase() === canonicalTag.toLowerCase()
      )
    ) {
      setTags((prev) => [...prev, { label: canonicalTag }]);
      setAvailableTags((prev) => {
        if (
          prev.some((tag) => tag.toLowerCase() === canonicalTag.toLowerCase())
        ) {
          return prev;
        }
        return [...prev, canonicalTag].sort((a, b) => a.localeCompare(b));
      });
    }
    setTagInput("");
  };

  const handleRemoveTag = (labelToRemove: string) => {
    setTags(tags.filter((tag) => tag.label !== labelToRemove));
  };

  const handleMalItemSelected = (selectedItem: { title: string }) => {
    const title = selectedItem.title;
    if (title && !animeTags.includes(title)) {
      setAnimeTags([...animeTags, title]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    console.log("Submitting form...");

    if (!userId) {
      console.error("User not authenticated");
      alert("You must be logged in to list an item.");
      setIsLoading(false);
      return;
    }

    // Check if user has a shipping address
    if (!hasShippingAddress) {
      const confirmRedirect = window.confirm(
        "You must set up a shipping address before listing items. This is required for shipping calculations.\n\nWould you like to go to your address settings now?"
      );
      setIsLoading(false);
      if (confirmRedirect) {
        navigate("/addresses");
      }
      return;
    }

    if (item.quantity < 1) {
      alert("Quantity must be at least 1.");
      setIsLoading(false);
      return;
    }

    try {
      const uploadedPhotos = photos.filter((photo) => photo.downloadURL);
      const photoUrls = uploadedPhotos.map((photo) => photo.downloadURL);

      // Validate required fields
      if (!item.title.trim()) {
        alert("Please enter a title for your item.");
        setIsLoading(false);
        return;
      }

      if (!item.description.trim()) {
        alert("Please enter a description for your item.");
        setIsLoading(false);
        return;
      }

      if (!item.category) {
        alert("Please select a category.");
        setIsLoading(false);
        return;
      }

      if (!item.condition) {
        alert("Please select an item condition.");
        setIsLoading(false);
        return;
      }

      if (!item.packageCondition) {
        alert("Please select a packaging condition.");
        setIsLoading(false);
        return;
      }

      if (!item.shippingPayer) {
        alert("Please choose who pays for shipping.");
        setIsLoading(false);
        return;
      }

      if (!item.shippingWeightTierId) {
        alert("Please select a weight range for shipping.");
        setIsLoading(false);
        return;
      }

      if (!item.shippingServiceId) {
        alert("Please select a shipping service.");
        setIsLoading(false);
        return;
      }

      if (!item.price || parseFloat(item.price) < 0.01) {
        alert("Please enter a valid price of at least $0.01.");
        setIsLoading(false);
        return;
      }

      if (uploadedPhotos.length === 0) {
        alert("Please upload at least one photo.");
        setIsLoading(false);
        return;
      }

      const normalizedDeliveryOption =
        item.deliveryOption?.trim() || "Buyer Selects at Checkout";

      const newItemData = {
        ...item,
        price: parseFloat(item.price), // Convert price to number
        tags: tags.map((tag) => tag?.label),
        animeTags,
        photos: photoUrls,
        creationDate: new Date().toISOString(),
        sellerId: userId,
        deliveryOption: normalizedDeliveryOption,
        shippingSummary: {
          payer: item.shippingPayer,
          weightTierId: item.shippingWeightTierId,
          serviceId: item.shippingServiceId,
        },
      };

      console.log(newItemData);

      const globalItemDocRef = await addDoc(
        collection(db, "items"),
        newItemData
      );

      await setDoc(doc(db, "users", userId, "items", globalItemDocRef.id), {
        ref: globalItemDocRef,
      });

      // Create Stripe account on first item listing (non-blocking)
      try {
        await axios.post(
          "https://us-central1-anithrift-e77a9.cloudfunctions.net/createStripeAccountOnFirstItem",
          { item: newItemData }
        );
      } catch (stripeError: any) {
        // Log error but don't block item listing
        console.error(
          "Error creating Stripe account (non-blocking):",
          stripeError
        );
        // Item is still listed, user can complete Stripe onboarding later
      }

      console.log("Item listed with ID:", globalItemDocRef.id);

      navigate(`/item/${globalItemDocRef.id}`);
    } catch (e) {
      console.error("Error listing item:", e);
      alert("An error occurred while listing the item. Please try again.");
    }

    setIsLoading(false);
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);

    if (!userId) {
      console.error("User not authenticated");
      alert("You must be logged in to save an item.");
      setIsLoading(false);
      return;
    }

    if (item.quantity < 1) {
      alert("Quantity must be at least 1.");
      setIsLoading(false);
      return;
    }

    const normalizedDeliveryOption =
      item.deliveryOption?.trim() || "Buyer Selects at Checkout";

    const draftItemData = {
      ...item,
      price: item.price ? parseFloat(item.price) : 0, // Convert price to number
      listingStatus: "draft",
      tags: tags.map((tag) => tag?.label),
      animeTags,
      photos: photos
        .map((photo) => photo.downloadURL)
        .filter((url) => url !== null),
      creationDate: new Date().toISOString(),
      sellerId: userId,
      deliveryOption: normalizedDeliveryOption,
      shippingSummary: {
        payer: item.shippingPayer,
        weightTierId: item.shippingWeightTierId,
        serviceId: item.shippingServiceId,
      },
      isAdultContent: item.isAdultContent || false,
    };

    try {
      const globalItemDocRef = await addDoc(
        collection(db, "items"),
        draftItemData
      );

      await setDoc(doc(db, "users", userId, "items", globalItemDocRef.id), {
        ref: globalItemDocRef,
      });

      console.log("Draft saved with ID:", globalItemDocRef.id);
      alert("Item saved as draft.");
      navigate(`/item/${globalItemDocRef.id}`);
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Failed to save draft. Please try again.");
    }

    setIsLoading(false);
  };

  const dropzoneStyle: React.CSSProperties =
    photos.length > 0
      ? {
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px",
        }
      : {};

  const matchingTagSuggestions = useMemo(() => {
    const normalizedInput = tagInput.trim().toLowerCase();
    if (!normalizedInput) return [] as string[];

    return availableTags
      .filter(
        (tag) =>
          tag.toLowerCase().includes(normalizedInput) &&
          !tags.some(
            (selected) => selected.label.toLowerCase() === tag.toLowerCase()
          )
      )
      .slice(0, 8);
  }, [availableTags, tagInput, tags]);

  const matchingColorSuggestions = useMemo(() => {
    const normalizedInput = (item?.color || "").trim().toLowerCase();
    if (!normalizedInput) return [] as string[];

    return availableColors
      .filter(
        (color) =>
          color.toLowerCase().includes(normalizedInput) &&
          color.toLowerCase() !== normalizedInput
      )
      .slice(0, 8);
  }, [availableColors, item?.color]);

  return (
    <div className="selling-page">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-overlay-content">
            <CircularProgress className="loading-overlay-spinner" />
            <p>Processing...</p>
          </div>
        </div>
      )}
      {hasShippingAddress === false && (
        <Box
          sx={{
            margin: "20px auto",
            maxWidth: "800px",
            padding: "16px 24px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <strong
              style={{
                display: "block",
                marginBottom: "4px",
                color: "#856404",
              }}
            >
              Shipping Address Required
            </strong>
            <p style={{ margin: 0, color: "#856404", fontSize: "0.9rem" }}>
              You must set up a shipping address before listing items. This is
              required for shipping calculations.
            </p>
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate("/addresses")}
            sx={{
              backgroundColor: "#ffc107",
              color: "#000",
              "&:hover": {
                backgroundColor: "#e0a800",
              },
            }}
          >
            Set Address
          </Button>
        </Box>
      )}

      {stripeAccountStatus && !stripeAccountStatus.isReady && (
        <Box
          sx={{
            margin: "20px auto",
            maxWidth: "800px",
            padding: "16px 24px",
            backgroundColor: stripeAccountStatus.hasAccount
              ? "#fff3cd"
              : "#d1ecf1",
            border: `1px solid ${
              stripeAccountStatus.hasAccount ? "#ffc107" : "#0c5460"
            }`,
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <strong
              style={{
                display: "block",
                marginBottom: "4px",
                color: stripeAccountStatus.hasAccount ? "#856404" : "#0c5460",
              }}
            >
              {stripeAccountStatus.hasAccount
                ? "Stripe Account Setup Incomplete"
                : "Stripe Account Not Connected"}
            </strong>
            <p
              style={{
                margin: 0,
                color: stripeAccountStatus.hasAccount ? "#856404" : "#0c5460",
                fontSize: "0.9rem",
              }}
            >
              {stripeAccountStatus.hasAccount
                ? "Your Stripe account needs to be fully set up to receive payments. Complete the onboarding process to enable payouts."
                : "Connect your Stripe account to receive payments from sales. Your account will be created automatically when you list your first item, or you can set it up now."}
            </p>
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate("/settings/stripe-account")}
            sx={{
              backgroundColor: stripeAccountStatus.hasAccount
                ? "#ffc107"
                : "#0c5460",
              color: "#fff",
              alignSelf: "flex-start",
              "&:hover": {
                backgroundColor: stripeAccountStatus.hasAccount
                  ? "#e0a800"
                  : "#0a4550",
              },
            }}
          >
            {stripeAccountStatus.hasAccount
              ? "Complete Stripe Setup"
              : "Set Up Stripe Account"}
          </Button>
        </Box>
      )}

      <section className="selling-hero">
        <div className="selling-hero-copy">
          <p className="selling-eyebrow">Seller Workspace</p>
          <h1>List an Item</h1>
          <p>
            Showcase your collectibles with rich detail, polished photography,
            and tags that help fans discover them faster. Draft now and publish
            when you’re ready.
          </p>
          <div className="selling-hero-actions">
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/listing")}
            >
              Listing Overview
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate("/database-guidelines")}
            >
              Review Guidelines
            </Button>
          </div>
        </div>
        <div className="selling-hero-card">
          <h3>What You’ll Need</h3>
          <ul>
            <li>Up to 10 clear photos showcasing key details</li>
            <li>Series tags and anime references for discovery</li>
            <li>Accurate condition and packaging notes</li>
            <li>A price of at least $0.01 and available quantity</li>
          </ul>
        </div>
      </section>

      <div className="selling-layout">
        <div className="selling-form-card">
          <form className="selling-form" onSubmit={handleSubmit}>
            <h2>Photos</h2>
            <div
              {...getRootProps({
                className: "dropzone",
                style: dropzoneStyle,
              })}
            >
              <input {...getInputProps()} />
              {!photos.length ? (
                <p>
                  Drag 'n' drop some files here, or click to select files (Up to
                  10 photos)
                </p>
              ) : null}
              {photos.length && photos[photos.length - 1]
                ? photos.map((photo) => {
                    if (!photo) return null;
                    return (
                      <div key={photo.preview} className="photo-preview">
                        <img
                          src={photo.preview}
                          alt="Preview"
                          className="preview-image"
                        />
                        <button
                          onClick={(event) => removePhoto(event, photo.preview)}
                          className="remove-photo"
                        >
                          x
                        </button>
                      </div>
                    );
                  })
                : null}
            </div>
            <div className="section product-info-section">
              <h2>Product Info</h2>
              <h3>Title</h3>
              <TextField
                fullWidth
                label="Title"
                variant="outlined"
                value={item?.title}
                onChange={(e) =>
                  setItem((prev) => ({ ...prev, title: e.target.value }))
                }
                className="form-field"
              />
              <h3>Description</h3>
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                multiline
                rows={4}
                value={item?.description}
                onChange={(e) =>
                  setItem((prev) => ({ ...prev, description: e.target.value }))
                }
                className="form-field"
              />
              <h3>Tags</h3>
              <div className="tags-section">
                <div className="tag-input-wrapper">
                  <TextField
                    fullWidth
                    label="Type a tag and press Enter"
                    variant="outlined"
                    value={tagInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setTagInput(value);
                      setShowTagSuggestions(!!value.trim());
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag(tagInput);
                        setShowTagSuggestions(false);
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setShowTagSuggestions(true);
                      }
                    }}
                    onFocus={() => {
                      if (matchingTagSuggestions.length) {
                        setShowTagSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowTagSuggestions(false), 120);
                    }}
                    inputProps={{ autoComplete: "off" }}
                    className="form-field"
                  />
                  {showTagSuggestions && matchingTagSuggestions.length > 0 && (
                    <ul className="tag-suggestions" role="listbox">
                      {matchingTagSuggestions.map((suggestion) => (
                        <li
                          key={suggestion}
                          role="option"
                          aria-selected="false"
                          tabIndex={-1}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleAddTag(suggestion);
                            setShowTagSuggestions(false);
                          }}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="tags-chip-group">
                  {tags.map((tag, index) => (
                    <Chip
                      key={`${tag.label}-${index}`}
                      label={tag.label}
                      onDelete={() => handleRemoveTag(tag.label)}
                      className="tag-chip"
                    />
                  ))}
                </div>
              </div>
              <h3>Anime Relation</h3>
              <div className="animeTags-section">
                <MalSearch onItemSelected={handleMalItemSelected} />
                {animeTags.map((title, index) => (
                  <Chip
                    key={index}
                    label={title}
                    onDelete={() =>
                      setAnimeTags(animeTags.filter((t) => t !== title))
                    }
                    className="tag-chip"
                  />
                ))}
              </div>
              <h3>Category</h3>
              <FormControl fullWidth className="form-field">
                <InputLabel>Category</InputLabel>
                <Select
                  value={item?.category}
                  onChange={(e) =>
                    setItem((prev) => ({ ...prev, category: e.target.value }))
                  }
                  label="Category"
                >
                  <MenuItem value="Digital Media">Digital Media</MenuItem>
                  <MenuItem value="Manga">Manga</MenuItem>
                  <MenuItem value="Novels">Novels</MenuItem>
                  <MenuItem value="Merchandise">Merchandise</MenuItem>
                  <MenuItem value="Figures">Figures</MenuItem>
                  <MenuItem value="Trinkets">Trinkets</MenuItem>
                  <MenuItem value="Apparel">Apparel</MenuItem>
                  <MenuItem value="Audio">Audio</MenuItem>
                  <MenuItem value="Games">Games</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ marginTop: 2, marginBottom: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={item.isAdultContent || false}
                      onChange={(e) =>
                        setItem((prev) => ({
                          ...prev,
                          isAdultContent: e.target.checked,
                        }))
                      }
                      color="primary"
                    />
                  }
                  label={
                    <span>
                      <strong>18+ Content</strong>
                      <br />
                      <small style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                        Mark this item as containing adult-only content. It will
                        only be visible to users who have enabled 18+ content in
                        their preferences.
                      </small>
                    </span>
                  }
                />
              </Box>
              <h3>Color</h3>
              <div className="color-input-wrapper">
                <TextField
                  fullWidth
                  label="Color (optional)"
                  variant="outlined"
                  value={item?.color || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setItem((prev) => ({ ...prev, color: value }));
                    setShowColorSuggestions(!!value.trim());
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setShowColorSuggestions(false);
                    } else if (e.key === "ArrowDown") {
                      setShowColorSuggestions(true);
                    }
                  }}
                  onFocus={() => {
                    if (matchingColorSuggestions.length) {
                      setShowColorSuggestions(true);
                    }
                  }}
                  onBlur={(e) => {
                    const currentValue = e.target.value.trim();
                    setTimeout(() => setShowColorSuggestions(false), 120);
                    if (currentValue) {
                      setAvailableColors((prev) => {
                        if (
                          prev.some(
                            (color) =>
                              color.toLowerCase() === currentValue.toLowerCase()
                          )
                        ) {
                          return prev;
                        }
                        return [...prev, currentValue].sort((a, b) =>
                          a.localeCompare(b)
                        );
                      });
                    }
                  }}
                  inputProps={{ autoComplete: "off" }}
                  className="form-field"
                />
                {showColorSuggestions &&
                  matchingColorSuggestions.length > 0 && (
                    <ul className="color-suggestions" role="listbox">
                      {matchingColorSuggestions.map((suggestion) => (
                        <li
                          key={suggestion}
                          role="option"
                          aria-selected={
                            (item?.color || "").toLowerCase() ===
                            suggestion.toLowerCase()
                              ? "true"
                              : "false"
                          }
                          tabIndex={-1}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            setItem((prev) => ({ ...prev, color: suggestion }));
                            setShowColorSuggestions(false);
                          }}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
              </div>
            </div>
            <div className="section condition-section">
              <h2>Item Condition</h2>
              <RadioGroup
                row
                aria-label="condition"
                name="condition"
                value={item?.condition}
                onChange={(e) =>
                  setItem((prev) => ({ ...prev, condition: e.target.value }))
                }
                className="condition-selector"
              >
                <FormControlLabel
                  value="New"
                  control={<Radio />}
                  label={
                    <div className="condition-label-container">
                      <div className="condition-label-title">New</div>
                      <div className="condition-label-description">
                        Item is brand new, with no signs of use.
                      </div>
                    </div>
                  }
                />
                <FormControlLabel
                  value="Like New"
                  control={<Radio />}
                  label={
                    <div className="condition-label-container">
                      <div className="condition-label-title">Like New</div>
                      <div className="condition-label-description">
                        Gently used with minimal, if any, signs of wear.
                      </div>
                    </div>
                  }
                />
                <FormControlLabel
                  value="Very Good"
                  control={<Radio />}
                  label={
                    <div className="condition-label-container">
                      <div className="condition-label-title">Very Good</div>
                      <div className="condition-label-description">
                        Well cared for with light, cosmetic imperfections.
                      </div>
                    </div>
                  }
                />
                <FormControlLabel
                  value="Good"
                  control={<Radio />}
                  label={
                    <div className="condition-label-container">
                      <div className="condition-label-title">Good</div>
                      <div className="condition-label-description">
                        Shows moderate wear but functions perfectly.
                      </div>
                    </div>
                  }
                />
                <FormControlLabel
                  value="Fair"
                  control={<Radio />}
                  label={
                    <div className="condition-label-container">
                      <div className="condition-label-title">Fair</div>
                      <div className="condition-label-description">
                        Noticeable wear or cosmetic issues. Priced accordingly.
                      </div>
                    </div>
                  }
                />
              </RadioGroup>
            </div>
            <div className="section packaging-condition-section">
              <h2>Packaging Condition</h2>
              <RadioGroup
                row
                aria-label="packageCondition"
                name="packageCondition"
                value={item?.packageCondition}
                onChange={(e) =>
                  setItem((prev) => ({
                    ...prev,
                    packageCondition: e.target.value,
                  }))
                }
                className="condition-selector"
              >
                <FormControlLabel
                  value="Mint"
                  control={<Radio />}
                  label={
                    <div className="condition-label-container">
                      <div className="condition-label-title">Mint</div>
                      <div className="condition-label-description">
                        Original packaging untouched and pristine.
                      </div>
                    </div>
                  }
                />
                <FormControlLabel
                  value="Good"
                  control={<Radio />}
                  label={
                    <div className="condition-label-container">
                      <div className="condition-label-title">Good</div>
                      <div className="condition-label-description">
                        Minor shelf wear or small blemishes present.
                      </div>
                    </div>
                  }
                />
                <FormControlLabel
                  value="Worn"
                  control={<Radio />}
                  label={
                    <div className="condition-label-container">
                      <div className="condition-label-title">Worn</div>
                      <div className="condition-label-description">
                        Noticeable wear, creases, or imperfections.
                      </div>
                    </div>
                  }
                />
                <FormControlLabel
                  value="No Packaging"
                  control={<Radio />}
                  label={
                    <div className="condition-label-container">
                      <div className="condition-label-title">No Packaging</div>
                      <div className="condition-label-description">
                        Item ships safely but without original packaging.
                      </div>
                    </div>
                  }
                />
              </RadioGroup>
            </div>
            <div className="section shipping-section">
              <div className="shipping-section-header">
                <div>
                  <h2>Shipping</h2>
                  <p>
                    Choose who covers shipping, your package weight, and a
                    service. We’ll recommend options similar to Mercari’s
                    shipping labels.
                  </p>
                </div>
                <div className="shipping-summary-card">
                  <p className="summary-title">Selected Service</p>
                  <p className="summary-service">
                    {selectedService?.name} ({selectedService?.carrier})
                  </p>
                  <p className="summary-price">
                    {item.shippingServiceId === "ship-yourself"
                      ? "Set your own rate"
                      : `$${selectedService?.price.toFixed(2)}`}
                  </p>
                  <p className="summary-speed">{selectedService?.speed}</p>
                </div>
              </div>

              <div className="shipping-payer">
                <h3>Who pays for shipping?</h3>
                <RadioGroup
                  row
                  value={item.shippingPayer}
                  onChange={(e) =>
                    setItem((prev) => ({
                      ...prev,
                      shippingPayer: e.target.value as ShippingPayer,
                    }))
                  }
                >
                  <FormControlLabel
                    value="buyer"
                    control={<Radio />}
                    label="Buyer pays"
                  />
                  <FormControlLabel
                    value="seller"
                    control={<Radio />}
                    label="Seller pays"
                  />
                </RadioGroup>
              </div>

              <div className="shipping-weight">
                <h3>Package weight (including packaging)</h3>
                <div className="weight-grid">
                  {shippingWeightTiers.map((tier) => (
                    <button
                      type="button"
                      key={tier.id}
                      className={`weight-card ${
                        item.shippingWeightTierId === tier.id ? "active" : ""
                      }`}
                      onClick={() => {
                        const tierServices = shippingServices.filter(
                          (service) => service.maxWeightOz >= tier.maxWeightOz
                        );
                        const fallbackService =
                          tierServices.find(
                            (service) => service.id === item.shippingServiceId
                          ) ||
                          tierServices[0] ||
                          shippingServices[0];

                        setItem((prev) => ({
                          ...prev,
                          shippingWeightTierId: tier.id,
                          shippingServiceId: fallbackService.id,
                          deliveryOption: fallbackService.name,
                        }));
                      }}
                    >
                      <span className="weight-label">{tier.label}</span>
                      <span className="weight-description">
                        {tier.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="shipping-services">
                <h3>Shipping services</h3>
                <div className="service-grid">
                  {availableServices.map((service) => {
                    const isActive = item.shippingServiceId === service.id;
                    return (
                      <Tooltip
                        title={service.notes || ""}
                        arrow
                        key={service.id}
                      >
                        <button
                          type="button"
                          className={`service-card ${isActive ? "active" : ""}`}
                          onClick={() =>
                            setItem((prev) => ({
                              ...prev,
                              shippingServiceId: service.id,
                              deliveryOption: service.name,
                            }))
                          }
                        >
                          <div className="service-header">
                            <span className="service-name">{service.name}</span>
                            <span className="service-carrier">
                              {service.carrier}
                            </span>
                          </div>
                          <div className="service-body">
                            <span className="service-price">
                              {service.id === "ship-yourself"
                                ? "Custom rate"
                                : `$${service.price.toFixed(2)}`}
                            </span>
                            <span className="service-speed">
                              {service.speed}
                            </span>
                            <span className="service-limit">
                              Up to {Math.round(service.maxWeightOz / 16)} lb
                            </span>
                          </div>
                        </button>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            </div>
            <h3>Quantity</h3>
            <TextField
              label="Quantity"
              type="number"
              InputProps={{ inputProps: { min: 0 } }}
              value={item?.quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                setItem((prev) => ({
                  ...prev,
                  quantity: isNaN(value) ? 0 : Math.max(0, value),
                }));
              }}
            />
            <h3>Price</h3>
            <div className="section pricing-section">
              <TextField
                label="Price"
                type="number"
                InputProps={{ inputProps: { min: 0.01, step: 0.01 } }}
                value={item?.price}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty string or valid number input (including decimals like 0.50)
                  if (value === "" || /^\d*\.?\d*$/.test(value)) {
                    setItem((prev) => ({ ...prev, price: value }));
                  }
                }}
              />
            </div>
            <div className="form-actions">
              <Button
                variant="contained"
                color="secondary"
                type="button"
                onClick={handleSaveDraft}
              >
                Save as Draft
              </Button>
              <Button variant="contained" color="primary" type="submit">
                List Item
              </Button>
            </div>
          </form>
        </div>
        <aside className="selling-sidebar">
          <h2>Quick Tips</h2>
          <ul>
            <li>Natural, indirect light keeps colors accurate in photos.</li>
            <li>Call out limited editions, first prints, or bonus items.</li>
            <li>Double-check spelling for character and series names.</li>
            <li>Ship within 2 business days to maintain seller ratings.</li>
          </ul>
          <div className="selling-sidebar-card">
            <h3>Need Support?</h3>
            <p>
              Visit Help & Support for packing guides, dispute resolution, and
              contact options if you hit a snag.
            </p>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate("/help-support")}
            >
              Open Help Center
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Selling;

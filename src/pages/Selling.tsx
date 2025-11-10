import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { db } from "../firebase-config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
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
} from "@mui/material";
import MalSearch from "../components/MalSearch";
import axios from "axios";

interface MarketplaceItemType {
  title: string;
  description: string;
  tags?: string[];
  category: string;
  condition: string;
  packageCondition: string;
  color?: string;
  deliveryOption: string;
  price: string;
  quantity: number;
  photos?: PhotoType[];
  creationDate: string;
  sellerId?: string;
  listingStatus: MarketplaceItemStatus;
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
    deliveryOption: "",
    price: "",
    quantity: 0,
    creationDate: "",
    listingStatus: "selling",
  });
  const [tags, setTags] = useState<{ label: string }[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [animeTags, setAnimeTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate("/signin");
      }
    });
  }, [navigate]);

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
    if (
      normalized &&
      !tags.some((tag) => tag.label.toLowerCase() === normalized.toLowerCase())
    ) {
      setTags((prev) => [...prev, { label: normalized }]);
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

      if (!item.deliveryOption) {
        alert("Please select a delivery option.");
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

      const newItemData = {
        ...item,
        price: parseFloat(item.price), // Convert price to number
        tags: tags.map((tag) => tag?.label),
        animeTags,
        photos: photoUrls,
        creationDate: new Date().toISOString(),
        sellerId: userId,
      };

      console.log(newItemData);

      const globalItemDocRef = await addDoc(
        collection(db, "items"),
        newItemData
      );

      await setDoc(doc(db, "users", userId, "items", globalItemDocRef.id), {
        ref: globalItemDocRef,
      });

      await axios.post(
        "https://us-central1-anithrift-e77a9.cloudfunctions.net/createStripeAccountOnFirstItem",
        { item: newItemData }
      );

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

  return (
    <div className="selling-form">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-overlay-content">
            <CircularProgress className="loading-overlay-spinner" />
            <p>Processing...</p>
          </div>
        </div>
      )}
      <h1>List an Item</h1>
      <form onSubmit={handleSubmit}>
        <h2>Photos</h2>
        <div {...getRootProps({ className: "dropzone", style: dropzoneStyle })}>
          <input {...getInputProps()} />
          {!photos.length ? (
            <p>
              Drag 'n' drop some files here, or click to select files (Up to 10
              photos)
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
            <TextField
              fullWidth
              label="Type a tag and press Enter"
              variant="outlined"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag(tagInput);
                }
              }}
              className="form-field"
            />
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
          <h3>Color</h3>
          <TextField
            fullWidth
            label="Color (optional)"
            variant="outlined"
            value={item?.color}
            onChange={(e) =>
              setItem((prev) => ({ ...prev, color: e.target.value }))
            }
            className="form-field"
          />
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
                    Item is brand new, with no signs of use.
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
                    Item has minor wear, but still fully functional.
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
                    Item shows wear from consistent use, but remains in good
                    condition.
                  </div>
                </div>
              }
            />
            <FormControlLabel
              value="Poor"
              control={<Radio />}
              label={
                <div className="condition-label-container">
                  <div className="condition-label-title">Poor</div>
                  <div className="condition-label-description">
                    Item has significant wear and tear but is still functional.
                  </div>
                </div>
              }
            />
          </RadioGroup>
        </div>
        <div className="section condition-section">
          <h2>Packaging Condition</h2>
          <RadioGroup
            row
            aria-label="packagingCondition"
            name="packagingCondition"
            value={item?.packageCondition}
            onChange={(e) =>
              setItem((prev) => ({ ...prev, packageCondition: e.target.value }))
            }
            className="condition-selector"
          >
            <FormControlLabel
              value="Original"
              control={<Radio />}
              label={
                <div className="condition-label-container">
                  <div className="condition-label-title">Original</div>
                  <div className="condition-label-description">Unopened</div>
                </div>
              }
            />
            <FormControlLabel
              value="Repackaged"
              control={<Radio />}
              label={
                <div className="condition-label-container">
                  <div className="condition-label-title">Repackaged</div>
                  <div className="condition-label-description">
                    Opened but repackaged
                  </div>
                </div>
              }
            />
            <FormControlLabel
              value="Damaged"
              control={<Radio />}
              label={
                <div className="condition-label-container">
                  <div className="condition-label-title">Damaged</div>
                  <div className="condition-label-description">
                    Packaging is damaged but item is intact
                  </div>
                </div>
              }
            />
            <FormControlLabel
              value="None"
              control={<Radio />}
              label={
                <div className="condition-label-container">
                  <div className="condition-label-title">None</div>
                  <div className="condition-label-description">
                    There is not any packaging for this item
                  </div>
                </div>
              }
            />
          </RadioGroup>
        </div>
        <div className="section delivery-section">
          <h2>Delivery</h2>
          <RadioGroup
            aria-label="shipping"
            value={item?.deliveryOption}
            onChange={(e) =>
              setItem((prev) => ({ ...prev, deliveryOption: e.target.value }))
            }
            className="form-field"
          >
            <FormControlLabel
              value="seller"
              control={<Radio />}
              label="I will handle the shipping"
            />
            <FormControlLabel
              value="buyer"
              control={<Radio />}
              label="Buyer will handle the shipping"
            />
          </RadioGroup>
        </div>
        <h3>Quantity</h3>
        <TextField
          label="Quantity"
          type="number"
          InputProps={{ inputProps: { min: 1 } }}
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
            color="primary"
            type="button"
            onClick={handleSaveDraft}
          >
            Save as Draft
          </Button>
          <Button variant="contained" color="secondary" type="submit">
            List Item
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Selling;

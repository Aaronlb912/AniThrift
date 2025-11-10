import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import "../css/EditItem.css";
import MalSearch from "../components/MalSearch";

interface PhotoType {
  downloadURL: string | null;
  preview: string;
  fileName?: string;
  fileSize?: number;
}

interface MarketplaceItemEditable {
  title: string;
  description: string;
  category: string;
  price: string;
  quantity: number;
  photos: PhotoType[];
  listingStatus: MarketplaceItemStatus;
  condition: string;
  packageCondition: string;
  deliveryOption: string;
  color: string;
}

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<MarketplaceItemEditable>({
    title: "",
    description: "",
    category: "",
    price: "",
    quantity: 1,
    photos: [] as PhotoType[],
    listingStatus: "draft",
    condition: "",
    packageCondition: "",
    deliveryOption: "",
    color: "",
  });
  const [tags, setTags] = useState<{ label: string }[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [animeTags, setAnimeTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const storage = getStorage();

  useEffect(() => {
    const fetchItem = async () => {
      const docRef = doc(db, "items", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setItem({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          price: data.price?.toString() || "",
          quantity: data.quantity || 1,
          photos: (data.photos || []).map((url: string) => ({
            preview: url,
            downloadURL: url,
          })),
          listingStatus: data.listingStatus || "draft",
          condition: data.condition || "",
          packageCondition: data.packageCondition || "",
          deliveryOption: data.deliveryOption || "",
          color: data.color || "",
        });
        setTags(
          (data.tags || []).map((label: string) => ({
            label: label || "",
          }))
        );
        setAnimeTags(data.animeTags || []);
      } else {
        console.log("No such document!");
      }
    };

    fetchItem();
  }, [id]);


  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles
        .filter((file) => {
          // Check for duplicates by name and size
          const isDuplicate = item.photos.some(
            (photo) =>
              photo.fileName === file.name && photo.fileSize === file.size
          );
          if (isDuplicate) {
            alert(`The file "${file.name}" has already been uploaded.`);
            return false;
          }
          return true;
        })
        .map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
            downloadURL: null,
            fileName: file.name,
            fileSize: file.size,
          })
        );

      setItem((prevItem) => ({
        ...prevItem,
        photos: [...prevItem.photos, ...newFiles],
      }));
    },
    [item.photos]
  );

  const removePhoto = (event: React.MouseEvent, photoUrl: string) => {
    event.stopPropagation();
    event.preventDefault();

    setItem((prevItem) => {
      const filteredPhotos = prevItem.photos.filter(
        (photo) => photo.preview !== photoUrl
      );
      return {
        ...prevItem,
        photos: filteredPhotos,
      };
    });

    URL.revokeObjectURL(photoUrl);
  };

  React.useEffect(() => {
    return () =>
      item.photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
  }, [item.photos]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 10,
  });


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
      setAnimeTags((prev) => [...prev, title]);
    }
  };

  const handleRemoveAnimeTag = (label: string) => {
    setAnimeTags((prev) => prev.filter((tag) => tag !== label));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate price
    if (!item.price || parseFloat(item.price) < 0.01) {
      alert("Please enter a valid price of at least $0.01.");
      setIsLoading(false);
      return;
    }

    try {
      // Upload new photos that don't have downloadURL
      const photoUrls = await Promise.all(
        item.photos.map(async (photo) => {
          if (photo.downloadURL) return photo.downloadURL;

          const storageReference = storageRef(
            storage,
            `photos/${id}/${photo.fileName || Date.now()}`
          );
          const uploadTask = await uploadBytesResumable(
            storageReference,
            photo as any
          );
          return getDownloadURL(uploadTask.ref);
        })
      );

      const updatedItemInfo = {
        ...item,
        price: parseFloat(item.price) || 0,
        photos: photoUrls,
        tags: tags.map((tag) => tag.label),
        animeTags,
      };

      await updateDoc(doc(db, "items", id!), updatedItemInfo);
      navigate(`/item/${id}`);
    } catch (error) {
      console.error("Error updating item:", error);
      alert("An error occurred while updating the item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    setIsLoading(true);

    try {
      const photoUrls = await Promise.all(
        item.photos.map(async (photo) => {
          if (photo.downloadURL) return photo.downloadURL;

          const storageReference = storageRef(
            storage,
            `photos/${id}/${photo.fileName || Date.now()}`
          );
          const uploadTask = await uploadBytesResumable(
            storageReference,
            photo as any
          );
          return getDownloadURL(uploadTask.ref);
        })
      );

      const updatedItemInfo = {
        ...item,
        price: parseFloat(item.price) || 0,
        photos: photoUrls,
        listingStatus: "draft",
        tags: tags.map((tag) => tag.label),
        animeTags,
      };

      await updateDoc(doc(db, "items", id!), updatedItemInfo);
      alert("Saved as draft.");
      navigate(`/item/${id}`);
    } catch (error) {
      console.error("Error saving as draft:", error);
      alert(
        "An error occurred while saving the item as draft. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleListAsSelling = async () => {
    setIsLoading(true);

    try {
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

      if (item.photos.length === 0) {
        alert("Please upload at least one photo.");
        setIsLoading(false);
        return;
      }

      const photoUrls = await Promise.all(
        item.photos.map(async (photo) => {
          if (photo.downloadURL) return photo.downloadURL;

          const storageReference = storageRef(
            storage,
            `photos/${id}/${photo.fileName || Date.now()}`
          );
          const uploadTask = await uploadBytesResumable(
            storageReference,
            photo as any
          );
          return getDownloadURL(uploadTask.ref);
        })
      );

      const updatedItemInfo = {
        ...item,
        price: parseFloat(item.price) || 0,
        photos: photoUrls,
        listingStatus: "selling",
        tags: tags.map((tag) => tag.label),
        animeTags,
      };

      await updateDoc(doc(db, "items", id!), updatedItemInfo);
      alert("Item listed for sale.");
      navigate(`/item/${id}`);
    } catch (error) {
      console.error("Error listing item:", error);
      alert(
        "An error occurred while listing the item for sale. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const dropzoneStyle: React.CSSProperties =
    item.photos.length > 0
      ? {
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px",
        }
      : {};

  const isDraft = item.listingStatus === "draft";

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
      <h1>Edit Item</h1>
      <form onSubmit={handleSubmit}>
        <h2>Photos</h2>
        <div {...getRootProps({ className: "dropzone", style: dropzoneStyle })}>
          <input {...getInputProps()} />
          {!item.photos.length ? (
            <p>
              Drag 'n' drop some files here, or click to select files (Up to 10
              photos)
            </p>
          ) : null}
          {item.photos.length &&
            item.photos.map((photo, index) => (
              <div key={photo.preview || index} className="photo-preview">
                <img
                  src={photo.preview}
                  alt={`preview ${index}`}
                  className="preview-image"
                />
                <button
                  type="button"
                  className="remove-photo"
                  onClick={(event) => removePhoto(event, photo.preview)}
                >
                  x
                </button>
              </div>
            ))}
        </div>
        <div className="section product-info-section">
          <h2>Product Info</h2>
          <h3>Title</h3>
          <TextField
            fullWidth
            label="Title"
            variant="outlined"
            value={item.title}
            onChange={(e) => setItem({ ...item, title: e.target.value })}
            className="form-field"
          />
          <h3>Description</h3>
          <TextField
            fullWidth
            label="Description"
            variant="outlined"
            multiline
            rows={4}
            value={item.description}
            onChange={(e) => setItem({ ...item, description: e.target.value })}
            className="form-field"
          />
          <h3>Category</h3>
          <FormControl fullWidth className="form-field">
            <InputLabel>Category</InputLabel>
            <Select
              value={item.category}
              onChange={(e) => setItem({ ...item, category: e.target.value })}
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
        </div>
        {isDraft && (
          <>
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
                  key={`${title}-${index}`}
                  label={title}
                  onDelete={() => handleRemoveAnimeTag(title)}
                  className="tag-chip"
                />
              ))}
            </div>

            <h3>Color</h3>
            <TextField
              fullWidth
              label="Color (optional)"
              variant="outlined"
              value={item.color}
              onChange={(e) => setItem({ ...item, color: e.target.value })}
              className="form-field"
            />
          </>
        )}

        <h3>Quantity</h3>
        <TextField
          label="Quantity"
          type="number"
          InputProps={{ inputProps: { min: 1 } }}
          value={item.quantity}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            setItem({
              ...item,
              quantity: isNaN(value) ? 1 : Math.max(1, value),
            });
          }}
          className="form-field"
        />
        <h3>Price</h3>
        <div className="section pricing-section">
          <TextField
            label="Price"
            type="number"
            InputProps={{ inputProps: { min: 0.01, step: 0.01 } }}
            value={item.price}
            onChange={(e) => {
              const value = e.target.value;
              // Allow empty string or valid number input (including decimals like 0.50)
              if (value === "" || /^\d*\.?\d*$/.test(value)) {
                setItem({ ...item, price: value });
              }
            }}
            className="form-field"
          />
        </div>
        {isDraft && (
          <>
            <div className="section condition-section">
              <h2>Item Condition</h2>
              <RadioGroup
                row
                aria-label="condition"
                name="condition"
                value={item.condition}
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
                value={item.packageCondition}
                onChange={(e) =>
                  setItem((prev) => ({
                    ...prev,
                    packageCondition: e.target.value,
                  }))
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
                value={item.deliveryOption}
                onChange={(e) =>
                  setItem((prev) => ({
                    ...prev,
                    deliveryOption: e.target.value,
                  }))
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
          </>
        )}
        <div className="form-actions">
          {item.listingStatus === "draft" ? (
            <>
              <Button
                variant="contained"
                color="primary"
                type="button"
                onClick={handleSaveAsDraft}
              >
                Save as Draft
              </Button>
              <Button
                variant="contained"
                color="secondary"
                type="button"
                onClick={handleListAsSelling}
              >
                List Item
              </Button>
            </>
          ) : (
            <Button variant="contained" color="primary" type="submit">
              Update Item
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default EditItem;

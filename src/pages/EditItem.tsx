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
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import "../css/EditItem.css";

interface PhotoType {
  downloadURL: string | null;
  preview: string;
  fileName?: string;
  fileSize?: number;
}

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    quantity: 1,
    photos: [] as PhotoType[],
    listingStatus: "draft",
  });
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
        });
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

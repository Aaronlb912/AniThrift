import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import "../css/EditItem.css";

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    packageCondition: "",
    deliveryOption: "",
    price: "",
    quantity: 1,
    photos: [],
    tags: [],
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
          ...data,
          photos: data.photos.map((url) => ({
            preview: url,
            downloadURL: url,
          })),
        });
      } else {
        console.log("No such document!");
      }
    };

    fetchItem();
  }, [id]);

  const onDrop = (acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );

    setItem((prevItem) => ({
      ...prevItem,
      photos: [...prevItem.photos, ...newFiles],
    }));
  };

  const removePhoto = (event, photoUrl) => {
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

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const photoUrls = await Promise.all(
      item.photos.map(async (photo) => {
        if (photo.downloadURL) return photo.downloadURL;

        const storageReference = storageRef(
          storage,
          `photos/${id}/${photo.name}`
        );
        const uploadTask = await uploadBytesResumable(storageReference, photo);
        return getDownloadURL(uploadTask.ref);
      })
    );

    const updatedItemInfo = {
      ...item,
      photos: photoUrls,
    };

    try {
      await updateDoc(doc(db, "items", id), updatedItemInfo);
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

    const photoUrls = await Promise.all(
      item.photos.map(async (photo) => {
        if (photo.downloadURL) return photo.downloadURL;

        const storageReference = storageRef(
          storage,
          `photos/${id}/${photo.name}`
        );
        const uploadTask = await uploadBytesResumable(storageReference, photo);
        return getDownloadURL(uploadTask.ref);
      })
    );

    const updatedItemInfo = {
      ...item,
      photos: photoUrls,
      listingStatus: "draft",
    };

    try {
      await updateDoc(doc(db, "items", id), updatedItemInfo);
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

    const photoUrls = await Promise.all(
      item.photos.map(async (photo) => {
        if (photo.downloadURL) return photo.downloadURL;

        const storageReference = storageRef(
          storage,
          `photos/${id}/${photo.name}`
        );
        const uploadTask = await uploadBytesResumable(storageReference, photo);
        return getDownloadURL(uploadTask.ref);
      })
    );

    const updatedItemInfo = {
      ...item,
      photos: photoUrls,
      listingStatus: "selling",
    };

    try {
      await updateDoc(doc(db, "items", id), updatedItemInfo);
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

  const dropzoneStyle =
    item.photos.length > 0
      ? {
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px",
        }
      : {};

  return (
    <div className="edit-item-container">
      <h2>Edit Item</h2>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          fullWidth
          variant="outlined"
          value={item.title}
          onChange={(e) => setItem({ ...item, title: e.target.value })}
        />
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={item.description}
          onChange={(e) => setItem({ ...item, description: e.target.value })}
        />
        <FormControl fullWidth>
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
        <TextField
          label="Price"
          fullWidth
          type="number"
          variant="outlined"
          value={item.price}
          onChange={(e) => setItem({ ...item, price: e.target.value })}
        />
        <TextField
          label="Quantity"
          fullWidth
          type="number"
          variant="outlined"
          value={item.quantity}
          onChange={(e) =>
            setItem({ ...item, quantity: parseInt(e.target.value, 10) })
          }
        />
        <div {...getRootProps({ className: "dropzone", style: dropzoneStyle })}>
          <input {...getInputProps()} />
          {!item.photos.length ? (
            <p>
              Drag 'n' drop some files here, or click to select files (Up to 10
              photos)
            </p>
          ) : null}
          {item.photos.length && item.photos[item.photos.length - 1]
            ? item.photos.map((file, index) => (
                <div key={file.preview} className="photo-preview">
                  <img
                    src={file.preview}
                    alt={`preview ${index}`}
                    className="preview-image"
                  />
                  <button
                    type="button"
                    className="remove-photo"
                    onClick={(event) => removePhoto(event, file.preview)}
                  >
                    ×
                  </button>
                </div>
              ))
            : null}
        </div>
        {item.listingStatus === "draft" ? (
          <>
            <Button
              onClick={handleSaveAsDraft}
              variant="outlined"
              color="primary"
            >
              Save as Draft
            </Button>
            <Button
              onClick={handleListAsSelling}
              variant="contained"
              color="secondary"
            >
              List Item
            </Button>
          </>
        ) : (
          <Button type="submit" variant="contained" color="primary">
            Update Item
          </Button>
        )}
      </form>
      {isLoading && <p>Updating item...</p>}
    </div>
  );
};

export default EditItem;

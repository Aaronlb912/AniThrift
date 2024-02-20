import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { db } from "../firebase-config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import moment from "moment/moment";
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
} from "@mui/material";

const Selling = () => {
  // State for form inputs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [color, setColor] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("");
  const [price, setPrice] = useState("");
  const [photos, setPhotos] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate(); // Add this line

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, set userId state
        setUserId(user.uid);
      } else {
        // User is signed out, handle as needed
        setUserId(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Handle change for file input
  const onDrop = useCallback((acceptedFiles) => {
    const storage = getStorage();

    // Map through the files, upload them to Firebase Storage, and create preview URLs
    const newPhotosWithPreview = acceptedFiles.map((file) => {
      // Generate a local preview URL
      const previewUrl = URL.createObjectURL(file);

      // Define the storage reference path
      const fileRef = storageRef(storage, `images/${Date.now()}_${file.name}`);

      // Start the file upload
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Optional: handle upload progress
        },
        (error) => {
          console.error("Upload error:", error);
        },
        () => {
          // Handle successful upload
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            // Update the state to include the download URL for this file
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

      // Return the file object with the local preview URL immediately
      return { preview: previewUrl, downloadURL: null };
    });

    // Update the photos state to include the new photos with their previews
    setPhotos((prevPhotos) => [...prevPhotos, ...newPhotosWithPreview]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
    maxFiles: 15,
  });

  const removePhoto = (photoUrl) => {
    setPhotos(photos.filter((photo) => photo.preview !== photoUrl));
  };

  // Remember to revoke data uris to avoid memory leaks
  React.useEffect(() => {
    return () => photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
  }, [photos]);

  // Handle adding new tag
  const handleAddTag = (e) => {
    if (e.key === "Enter" && e.target.value) {
      const newTag = { id: Date.now(), text: e.target.value };
      setTags([...tags, newTag]);
      e.target.value = ""; // Clear input
      e.preventDefault(); // Prevent form submission
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tagId) => {
    setTags(tags.filter((tag) => tag.id !== tagId));
  };

  // Handle form submit
  const handleSubmit = async (event) => {
    event.preventDefault();

    const uploadedPhotos = photos.filter((photo) => photo.downloadURL);
    const photoUrls = uploadedPhotos.map((photo) => photo.downloadURL);

    if (!userId) {
      console.error("User not authenticated");
      return;
    }

    const creationDate = moment().toISOString(); // Get current date in ISO string format

    try {
      // Add to the user's 'selling' collection
      const userSellingDocRef = await addDoc(
        collection(db, "users", userId, "selling"),
        {
          title,
          description,
          tags: tags.map((tag) => tag.text),
          category,
          condition,
          color,
          deliveryOption,
          price,
          photos: photoUrls,
          creationDate, // Include the creation date
        }
      );

      // Add to a global 'items' collection with seller information
      const globalItemDocRef = await addDoc(collection(db, "items"), {
        sellerId: userId,
        title,
        description,
        tags: tags.map((tag) => tag.text),
        category,
        condition,
        color,
        deliveryOption,
        price,
        photos: photoUrls,
        creationDate, // Include the creation date
      });

      console.log(
        "User selling document written with ID: ",
        userSellingDocRef.id
      );

      console.log("Document written with ID: ", globalItemDocRef.id);
      navigate(`/item/${globalItemDocRef.id}`); // Redirect user to the item listing page
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div className="selling-form">
      <h1>List an Item</h1>
      <form onSubmit={handleSubmit}>
        <h2>Photos</h2>
        <div {...getRootProps({ className: "dropzone" })}>
          <input {...getInputProps()} />
          <p>
            Drag 'n' drop some files here, or click to select files (Up to 15
            photos)
          </p>
        </div>
        <aside style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {photos.map((photo, index) => (
            <div
              key={index}
              style={{
                position: "relative",
                width: "100px",
                height: "100px",
              }}
            >
              <img
                src={photo.preview}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                alt="Preview"
              />
              <button
                type="button"
                onClick={() => removePhoto(photo.preview)}
                style={{ position: "absolute", top: "0", right: "0" }}
              >
                x
              </button>
            </div>
          ))}
        </aside>
        <div className="section product-info-section">
          <h2>Product Info</h2>
          <h3>Title</h3>
          <TextField
            fullWidth
            label="Title"
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-field"
          />
          <h3>Description</h3>
          <TextField
            fullWidth
            label="Description"
            variant="outlined"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-field"
          />
          <h3>Tags</h3>
          <TextField
            label="Tags"
            variant="outlined"
            onKeyPress={handleAddTag}
            fullWidth
          />
          <div>
            {tags.map((tag) => (
              <div key={tag.id}>
                {tag.text}
                <button onClick={() => handleRemoveTag(tag.id)}>X</button>
              </div>
            ))}
          </div>
          <h3>Category</h3>
          <FormControl fullWidth className="form-field">
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="anime">Anime & Videos</MenuItem>
              <MenuItem value="manga">Manga & Novels</MenuItem>
              <MenuItem value="merchandise">Merchandise</MenuItem>
              <MenuItem value="figures-trinkets">Figures & Trinkets</MenuItem>
              <MenuItem value="apparel">Apparel</MenuItem>
              <MenuItem value="audio">Audio</MenuItem>
              <MenuItem value="games">Games</MenuItem>
              {/* Add more MenuItem here */}
            </Select>
          </FormControl>
          <h3>Color</h3>
          <TextField
            fullWidth
            label="Color (optional)"
            variant="outlined"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="form-field"
          />
        </div>
        <div className="section condition-section">
          <h2>Condition</h2>
          <RadioGroup
            row
            aria-label="condition"
            name="condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="condition-selector"
          >
            <FormControlLabel value="new" control={<Radio />} label="New" />
            <FormControlLabel
              value="like new"
              control={<Radio />}
              label="Like New"
            />
            <FormControlLabel value="good" control={<Radio />} label="Good" />
            <FormControlLabel value="fair" control={<Radio />} label="Fair" />
            <FormControlLabel value="poor" control={<Radio />} label="Poor" />
          </RadioGroup>
        </div>
        <div className="section delivery-section">
          <h2>Delivery</h2>
          <RadioGroup
            aria-label="shipping"
            value={deliveryOption}
            onChange={(e) => setDeliveryOption(e.target.value)}
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
        <h3>Price</h3>

        <div className="section pricing-section">
          <TextField
            fullWidth
            label="Price"
            variant="outlined"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="form-field"
          />
        </div>

        <div className="form-actions">
          <Button variant="contained" color="primary" type="button">
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

import React, {
  useState,
  useCallback,
  useEffect,
  Fragment,
  useRef,
} from "react";
import { useDropzone } from "react-dropzone";
import { db } from "../firebase-config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import moment from "moment/moment";
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import algoliasearch from "algoliasearch/lite";
import "@algolia/autocomplete-theme-classic";
import { autocomplete } from "@algolia/autocomplete-js";
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
} from "@mui/material";
import axios from "axios";

const client = algoliasearch("UDKPDLE9YO", "0eaa91b0f52cf49f20d168216adbad37");
const index = client.initIndex("items");

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
  photos?: PhotoType;
  creationDate: string;
  sellerId?: string;
  listingStatus: MarketplaceItemStatus;
}

type PhotoType = {
  downloadURL: string | null;
  preview: string;
};
/**
 * selling = the item is available on the marketplace for purchase
 * sold = the item has been purchased and is no longer available on the marketpalce, can still be seen in the sold section of the user profile
 * draft = the user is creating an item but it will not be available for purchase yet, they can go back and edit it
 * listing pending = the item has been submited to be sold, it is going through a review process
 * cancelled = someone chose to cancel an order, the originial item can be set to selling and a duplicate of the item information will be created on the person who cancelled's account so that they can see their cancelled orders
 * purchased = items users have purchased, will be a copy of a sold item shown on the purchaser user's account
 */
type MarketplaceItemStatus =
  | "selling"
  | "sold"
  | "draft"
  | "listing pending"
  | "cancelled"
  | "purchased";

const Selling = () => {
  // State for form inputs
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
    listingStatus: "draft",
  });
  // const [title, setTitle] = useState("");
  // const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  // const [category, setCategory] = useState("");
  // const [condition, setCondition] = useState("");
  // const [packageCondition, setPackageCondition] = useState(""); // For package condition
  // const [color, setColor] = useState("");
  // const [deliveryOption, setDeliveryOption] = useState("");
  // const [price, setPrice] = useState("");
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  // const [quantity, setQuantity] = useState(1); // Default to 1
  const navigate = useNavigate(); // Add this line
  // const [listingStatus, setListingStatus] =
  // useState<MarketplaceItemStatus>("listing pending");
  const autocompleteContainerRef = useRef(null); // Ref for the autocomplete container

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, set userId state
        setUserId(user.uid);
      } else {
        // User is signed out, redirect to login page
        navigate("/signin"); // Update this path to your login route
      }
    });
  }, [navigate]);

  // Handle change for file input
  const onDrop = useCallback(
    (acceptedFiles: any) => {
      const storage = getStorage();

      // Check if adding new photos exceeds the limit
      const potentialNewTotal = photos.length + acceptedFiles.length;
      if (potentialNewTotal > 10) {
        alert(
          `You can only upload up to 10 images. Currently selected: ${photos.length}.`
        );
        return; // Prevent further execution
      }

      // Proceed with the file processing
      const newPhotosWithPreview = acceptedFiles.map((file: any) => {
        const previewUrl = URL.createObjectURL(file);
        const fileRef = storageRef(
          storage,
          `images/${Date.now()}_${file.name}`
        );
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

        return { preview: previewUrl, downloadURL: null };
      });

      setPhotos((prevPhotos) => [...prevPhotos, ...newPhotosWithPreview]);
    },
    [photos]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
    maxFiles: 10,
  });

  const removePhoto = (event: any, photoUrl: any) => {
    event.stopPropagation();
    event.preventDefault();

    // Filter out the photo to be removed
    const filteredPhotos = photos.filter((photo) => photo.preview !== photoUrl);
    setPhotos(filteredPhotos);

    // Revoke the object URL of the removed photo
    URL.revokeObjectURL(photoUrl);
  };

  // Remember to revoke data uris to avoid memory leaks
  React.useEffect(() => {
    return () => photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
  }, [photos]);

  console.log("photos", photos);

  useEffect(() => {
    if (!autocompleteContainerRef.current) return;

    const autocompleteInstance = autocomplete({
      container: autocompleteContainerRef.current,
      placeholder: "Type and select tags",
      getSources({ query }) {
        return [
          {
            sourceId: "tags-facet",
            getItems() {
              return client
                .initIndex("items")
                .searchForFacetValues("tags", query, { maxFacetHits: 10 })
                .then(({ facetHits }) => {
                  return facetHits.map((facetHit) => ({
                    label: facetHit.value,
                  }));
                });
            },
            templates: {
              item({ item }) {
                return `${item.label}`;
              },
            },
            onSelect({ item }) {
              const tagToAdd = item.label.trim();
              if (tagToAdd && !tags.find((tag) => tag.label === tagToAdd)) {
                setTags((prevTags) => [...prevTags, { label: tagToAdd }]);
              }
              // Note: Directly clearing the query with setQuery isn't done here; focus on onSelect logic
            },
          },
        ];
      },
      // The onSubmit callback is adjusted to avoid using state.setQuery
      onSubmit({ state }) {
        const tagToAdd = state.query.trim();
        if (tagToAdd && !tags.find((tag) => tag.label === tagToAdd)) {
          setTags((prevTags) => [...prevTags, { label: tagToAdd }]);
          // Here, rather than trying to clear the input directly, you'd reset the external state managing the input value if applicable
        }
      },
    });

    return () => {
      if (autocompleteInstance) {
        autocompleteInstance.destroy();
      }
    };
  }, [tags]);

  // New method for adding tags, ensuring we don't trigger the useEffect unnecessarily
  const addTag = (newTag) => {
    if (newTag && !tags.includes(newTag)) {
      setTags((currentTags) => [...currentTags, newTag]);
    }
  };

  const handleRemoveTag = (labelToRemove) => {
    setTags(tags.filter((tag) => tag.label !== labelToRemove));
  };

  // Handle form submit
  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("Submitting form...");

    if (!userId) {
      console.error("User not authenticated");
      alert("You must be logged in to list an item.");
      return;
    }

    try {
      const uploadedPhotos = photos.filter((photo) => photo.downloadURL);
      const photoUrls = uploadedPhotos.map((photo) => photo.downloadURL);

      // Prepare data for new item
      const newItemData = {
        ...item,
        tags: tags.map((tag) => tag?.label), // Assuming tags are objects with a label property
        photos: photoUrls,
        creationDate: moment().toISOString(),
        sellerId: userId,
      };

      console.log(newItemData);
      // Step 1: Add to the global 'items' collection
      const globalItemDocRef = await addDoc(
        collection(db, "items"),
        newItemData
      );

      // Step 2: Use the same ID to create a document in the user's 'selling' collection
      await setDoc(doc(db, "users", userId, "items", globalItemDocRef.id), {
        ref: globalItemDocRef,
      });

      const response = await axios.post(
        "https://us-central1-anithrift-e77a9.cloudfunctions.net/createStripeAccountOnFirstItem",
        { item: newItemData }
      );

      console.log("Item listed with ID:", globalItemDocRef.id);
      navigate(`/item/${globalItemDocRef.id}`); // Redirect to the item page using the consistent item ID
    } catch (e) {
      console.error("Error listing item:", e);
      alert("An error occurred while listing the item. Please try again.");
    }
  };

  const dropzoneStyle =
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
          <div className="tags-section">
            <h3>Tags</h3>
            <div
              id="autocomplete"
              ref={autocompleteContainerRef}
              style={{ position: "relative" }}
            ></div>
            {tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag.label} // Make sure to access the label property
                onDelete={() => handleRemoveTag(tag.label)} // Assuming you want to remove by label
                style={{ margin: "5px" }}
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
              <MenuItem value="Digital Media"> Digital Media</MenuItem>
              <MenuItem value="Manga">Manga</MenuItem>
              <MenuItem value="Novels">Novels</MenuItem>
              <MenuItem value="Merchandise">Merchandise</MenuItem>
              <MenuItem value="Figures">Figures</MenuItem>
              <MenuItem value="Trinkets">Trinkets</MenuItem>
              <MenuItem value="Apparel">Apparel</MenuItem>
              <MenuItem value="Audio">Audio</MenuItem>
              <MenuItem value="Games">Games</MenuItem>
              {/* Add more MenuItem here */}
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
                <div>
                  New
                  <br />
                  <span style={{ fontSize: "0.75rem", color: "#666" }}>
                    Item is brand new, with no signs of use.
                  </span>
                </div>
              }
            />
            <FormControlLabel
              value="Like New"
              control={<Radio />}
              label={
                <div>
                  Like New
                  <br />
                  <span style={{ fontSize: "0.75rem", color: "#666" }}>
                    Item is brand new, with no signs of use.
                  </span>
                </div>
              }
            />
            <FormControlLabel
              value="Good"
              control={<Radio />}
              label={
                <div>
                  Good
                  <br />
                  <span style={{ fontSize: "0.75rem", color: "#666" }}>
                    Item has minor wear, but still fully functional.
                  </span>
                </div>
              }
            />
            <FormControlLabel
              value="Fair"
              control={<Radio />}
              label={
                <div>
                  Fair
                  <br />
                  <span style={{ fontSize: "0.75rem", color: "#666" }}>
                    Item shows wear from consistent use, but remains in good
                    condition.
                  </span>
                </div>
              }
            />
            <FormControlLabel
              value="Poor"
              control={<Radio />}
              label={
                <div>
                  Poor
                  <br />
                  <span style={{ fontSize: "0.75rem", color: "#666" }}>
                    Item has significant wear and tear but is still functional.
                  </span>
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
              label="Original (Unopened)"
            />
            <FormControlLabel
              value="Repackaged"
              control={<Radio />}
              label="Repackaged (Opened but repackaged)"
            />
            <FormControlLabel
              value="Damaged"
              control={<Radio />}
              label="Damaged (Packaging is damaged but item is intact)"
            />
            <FormControlLabel
              value="None"
              control={<Radio />}
              label="None (There is not any packaging for this item)"
            />
            {/* Add more conditions as necessary */}
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
        {/* Quantity input field */}
        <h3>Quantity</h3>
        <TextField
          label="Quantity"
          type="number"
          InputProps={{ inputProps: { min: 1 } }} // Minimum quantity is 1
          value={item?.quantity}
          onChange={(e) =>
            setItem((prev) => ({
              ...prev,
              quantity: parseInt(e.target.value, 10),
            }))
          }
        />
        <h3>Price</h3>

        <div className="section pricing-section">
          <TextField
            label="Price"
            type="number"
            InputProps={{ inputProps: { min: 0 } }} // Prevent negative numbers
            value={item?.price}
            onChange={(e) =>
              setItem((prev) => ({ ...prev, price: e.target.value }))
            }
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

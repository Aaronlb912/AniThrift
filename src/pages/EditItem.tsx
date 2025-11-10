import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import {
  shippingServices,
  shippingWeightTiers,
  ShippingPayer,
} from "../data/shippingOptions";

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
  shippingPayer: ShippingPayer;
  shippingWeightTierId: string;
  shippingServiceId: string;
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
    deliveryOption: "Buyer Selects at Checkout",
    color: "",
    shippingPayer: "buyer",
    shippingWeightTierId: "up-to-8oz",
    shippingServiceId: "usps-first-class",
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
          deliveryOption: data.deliveryOption || "Buyer Selects at Checkout",
          color: data.color || "",
          shippingPayer: data?.shippingSummary?.payer || "buyer",
          shippingWeightTierId:
            data?.shippingSummary?.weightTierId || "up-to-8oz",
          shippingServiceId:
            data?.shippingSummary?.serviceId || "usps-first-class",
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

    const isDraftStatus = item.listingStatus === "draft";

    if (!isDraftStatus) {
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

      if (item.photos.length === 0) {
        alert("Please upload at least one photo.");
        setIsLoading(false);
        return;
      }
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

      const normalizedDeliveryOption =
        item.deliveryOption?.trim() || "Buyer Selects at Checkout";

      const updatedItemInfo = {
        ...item,
        price: parseFloat(item.price) || 0,
        photos: photoUrls,
        tags: tags.map((tag) => tag.label),
        animeTags,
        shippingSummary: {
          payer: item.shippingPayer,
          weightTierId: item.shippingWeightTierId,
          serviceId: item.shippingServiceId,
        },
        deliveryOption: normalizedDeliveryOption,
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

  const matchingColorSuggestions = useMemo(() => {
    const normalizedInput = (item?.color || "").trim().toLowerCase();
    if (!normalizedInput) return [] as string[];

    return availableColors
      .filter((color) =>
        color.toLowerCase().includes(normalizedInput)
      )
      .slice(0, 5);
  }, [availableColors, item?.color]);

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

  return (
    <div className="edit-item-page">
      <section className="edit-item-hero">
        <div>
          <p className="edit-item-eyebrow">Seller Workspace</p>
          <h1>Edit Your Listing</h1>
          <p>
            {isDraft
              ? "Finish polishing your draft before it goes live. Add accurate details, strong imagery, and relevant tags to attract the right buyers."
              : "Refresh photos, preview pricing updates, and keep your listing competitive. Changes save instantly once you publish."}
          </p>
        </div>
        <div className="edit-item-highlight">
          <p>
            {isDraft
              ? "Draft status lets you experiment without going public. Publish whenever everything feels perfect."
              : "This listing is live. Updates will be visible immediately to shoppers browsing AniThrift."}
          </p>
        </div>
      </section>

      <div className="edit-item-form-card">
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
            <div
              {...getRootProps({ className: "dropzone", style: dropzoneStyle })}
            >
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
                onChange={(e) =>
                  setItem({ ...item, description: e.target.value })
                }
                className="form-field"
              />
              <h3>Category</h3>
              <FormControl fullWidth className="form-field">
                <InputLabel>Category</InputLabel>
                <Select
                  value={item.category}
                  onChange={(e) =>
                    setItem({ ...item, category: e.target.value })
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
                  onChange={(e) =>
                    setItem({ ...item, color: e.target.value })
                  }
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
                    value={item.condition}
                    onChange={(e) =>
                      setItem({ ...item, condition: e.target.value })
                    }
                  >
                    <FormControlLabel
                      value="New"
                      control={<Radio />}
                      label="New / Unopened"
                    />
                    <FormControlLabel
                      value="Like New"
                      control={<Radio />}
                      label="Like New"
                    />
                    <FormControlLabel
                      value="Very Good"
                      control={<Radio />}
                      label="Very Good"
                    />
                    <FormControlLabel
                      value="Good"
                      control={<Radio />}
                      label="Good"
                    />
                    <FormControlLabel
                      value="Fair"
                      control={<Radio />}
                      label="Fair"
                    />
                  </RadioGroup>
                </div>

                <div className="section packaging-condition-section">
                  <h2>Packaging Condition</h2>
                  <RadioGroup
                    value={item.packageCondition}
                    onChange={(e) =>
                      setItem({ ...item, packageCondition: e.target.value })
                    }
                  >
                    <FormControlLabel
                      value="Mint"
                      control={<Radio />}
                      label="Mint"
                    />
                    <FormControlLabel
                      value="Good"
                      control={<Radio />}
                      label="Good"
                    />
                    <FormControlLabel
                      value="Worn"
                      control={<Radio />}
                      label="Worn"
                    />
                    <FormControlLabel
                      value="No Packaging"
                      control={<Radio />}
                      label="No Packaging"
                    />
                  </RadioGroup>
                </div>

                <div className="section shipping-section">
                  <div className="shipping-section-header">
                    <div>
                      <h2>Shipping</h2>
                      <p>
                        Update the shipping approach for this listing. Choose payer,
                        weight, and service to mirror the Mercari-style workflow.
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
                        setItem({
                          ...item,
                          shippingPayer: e.target.value as ShippingPayer,
                        })
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
                              ) || tierServices[0] || shippingServices[0];

                            setItem({
                              ...item,
                              shippingWeightTierId: tier.id,
                              shippingServiceId: fallbackService.id,
                              deliveryOption: fallbackService.name,
                            });
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
                          <button
                            type="button"
                            key={service.id}
                            className={`service-card ${isActive ? "active" : ""}`}
                            onClick={() =>
                              setItem({
                                ...item,
                                shippingServiceId: service.id,
                                deliveryOption: service.name,
                              })
                            }
                          >
                            <div className="service-header">
                              <span className="service-name">{service.name}</span>
                              <span className="service-carrier">{service.carrier}</span>
                            </div>
                            <div className="service-body">
                              <span className="service-price">
                                {service.id === "ship-yourself"
                                  ? "Custom rate"
                                  : `$${service.price.toFixed(2)}`}
                              </span>
                              <span className="service-speed">{service.speed}</span>
                              <span className="service-limit">
                                Up to {Math.round(service.maxWeightOz / 16)} lb
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="actions">
              <Button type="submit" variant="contained" color="primary">
                Save Changes
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate(`/item/${id}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>

      <aside className="edit-item-tips">
        <h2>Quick Tips</h2>
        <ul>
          <li>Use natural light and neutral backgrounds for photos.</li>
          <li>Lead with key details in the first two sentences.</li>
          <li>Tag popular series so collectors find you faster.</li>
          <li>Keep pricing consistent with condition and rarity.</li>
        </ul>
      </aside>
    </div>
  );
};

export default EditItem;

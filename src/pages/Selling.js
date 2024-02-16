import React, { useState } from "react";
import "../css/Selling.css";

const Selling = () => {
  // State for form inputs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [color, setColor] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("");
  const [shipping, setShipping] = useState("");

  const [price, setPrice] = useState("");
  const [photos, setPhotos] = useState([]);

  // Handle change for file input
  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      const filesArray = Array.from(event.target.files).map((file) =>
        URL.createObjectURL(file)
      );
      setPhotos((prevPhotos) => [...prevPhotos, ...filesArray]);
    }
  };

  // Remove photo
  const removePhoto = (photoUrl) => {
    setPhotos(photos.filter((photo) => photo !== photoUrl));
  };

  // Handle form submit
  const handleSubmit = (event) => {
    event.preventDefault();
    // Form submission logic here
    console.log({
      title,
      description,
      tags,
      category,
      condition,
      color,
      deliveryOption,
      price,
      photos,
    });
  };

  return (
    <div className="selling-form">
      <h1>List an Item</h1>
      <form onSubmit={handleSubmit} className="selling-form">
        {/* Photos Section */}
        <h2>Photos</h2>
        <div className="section photos-section">
          {/* Upload logic here */}
          <p>Upload up to 15 photos</p>
        </div>

        {/* Product Info Section */}
        <div className="section product-info-section">
          <h2>Product Info</h2>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />
          <h2>Description</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          ></textarea>
          <h2>Tags</h2>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags"
          />
          <h2>Category</h2>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="anime">Anime & Videos</option>
            <option value="manga">Manga & Novels</option>
            <option value="merchandise">Merchandise</option>
            <option value="figures">Figures & Trinkets</option>
            <option value="apparel">Apparel</option>
            <option value="audio">Audio</option>
            <option value="games">Games</option>
          </select>
          {/* Condition Section */}
          <div className="condition-section">
            <h2>Condition</h2>
            {/* Condition options here */}
          </div>
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="Color (optional)"
          />
        </div>

        {/* Delivery Section */}
        <div className="section delivery-section">
          <h2>Delivery</h2>
          <label>
            <input
              type="radio"
              value="seller"
              name="shipping"
              onChange={(e) => setShipping(e.target.value)}
            />{" "}
            I will handle the shipping
          </label>
          <label>
            <input
              type="radio"
              value="buyer"
              name="shipping"
              onChange={(e) => setShipping(e.target.value)}
            />{" "}
            Buyer will handle the shipping
          </label>
        </div>

        {/* Pricing Section */}
        <div className="section pricing-section">
          <h2>Pricing</h2>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
          />
        </div>

        {/* Buttons */}
        <div className="form-actions">
          <button type="button">Save as Draft</button>
          <button type="submit">List Item</button>
        </div>
      </form>
    </div>
  );
};

export default Selling;

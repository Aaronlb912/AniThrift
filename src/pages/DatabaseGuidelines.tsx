import React from "react";
import "../css/infoPages.css";

const DatabaseGuidelines: React.FC = () => {
  return (
    <div className="info-page-container">
      <h1>Database Guidelines</h1>
      <div className="info-content">
        <h2>Product Information Standards</h2>
        <p>
          To maintain quality and consistency across our platform, please follow
          these guidelines when listing items:
        </p>
        <h3>Title Guidelines</h3>
        <ul>
          <li>Use clear, descriptive titles</li>
          <li>Include brand names and series when applicable</li>
          <li>Avoid excessive capitalization or special characters</li>
        </ul>
        <h3>Category Selection</h3>
        <ul>
          <li>Choose the most appropriate category for your item</li>
          <li>Use specific categories when available</li>
          <li>Select "All Categories" only if no specific category fits</li>
        </ul>
        <h3>Tags and Anime Relations</h3>
        <ul>
          <li>Add relevant tags to help buyers find your items</li>
          <li>Link items to specific anime, manga, or characters when applicable</li>
          <li>Use accurate and descriptive tags</li>
        </ul>
        <h3>Photos</h3>
        <ul>
          <li>Upload clear, well-lit photos</li>
          <li>Show all angles and any damage or wear</li>
          <li>Use the first photo as the main product image</li>
        </ul>
      </div>
    </div>
  );
};

export default DatabaseGuidelines;


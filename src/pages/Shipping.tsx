import React from "react";
import "../css/infoPages.css";

const Shipping: React.FC = () => {
  return (
    <div className="info-page-container">
      <h1>AniThrift Shipping</h1>
      <div className="info-content">
        <h2>Shipping Information</h2>
        <p>
          Shipping details are handled by individual sellers on AniThrift. Each
          seller sets their own shipping rates and policies.
        </p>
        <h3>Shipping Options</h3>
        <ul>
          <li>Standard Shipping - Typically 5-7 business days</li>
          <li>Expedited Shipping - Typically 2-3 business days</li>
          <li>International Shipping - Varies by location</li>
        </ul>
        <h3>Shipping Costs</h3>
        <p>
          Shipping costs are calculated by the seller and displayed on each
          product page. Costs may vary based on:
        </p>
        <ul>
          <li>Item size and weight</li>
          <li>Shipping destination</li>
          <li>Selected shipping method</li>
        </ul>
        <h3>Tracking</h3>
        <p>
          Once your order ships, you'll receive a tracking number via email.
          You can track your package directly from your orders page.
        </p>
        <h3>Questions?</h3>
        <p>
          If you have questions about shipping for a specific order, please
          contact the seller directly through the messaging system.
        </p>
      </div>
    </div>
  );
};

export default Shipping;


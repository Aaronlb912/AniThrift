import React from "react";
import "../css/infoPages.css";

const DatabaseGuidelines: React.FC = () => {
  return (
    <div className="info-page-container">
      <h1>Database Guidelines</h1>
      <div className="info-content">
        <p>
          AniThrift is a fan-built catalogue. These standards keep listings
          consistent, searchable, and trustworthy for buyers and sellers.
          Please use them whenever you add or revise an item.
        </p>

        <h2>Titles & Descriptions</h2>
        <ul>
          <li>Use the official product name plus franchise and character.</li>
          <li>Keep titles concise—no ALL CAPS, emoji, or extra punctuation.</li>
          <li>
            Describe condition, edition, and defects in the description, not the
            title.
          </li>
          <li>
            Be transparent about wear, missing parts, or custom modifications.
          </li>
        </ul>

        <h2>Categories & Tags</h2>
        <ul>
          <li>Select the narrowest category that fits the item.</li>
          <li>
            Add tags for characters, brands, materials, and themes so buyers can
            filter easily.
          </li>
          <li>
            Link the listing to specific anime, manga, or game entries when
            available.
          </li>
        </ul>

        <h2>Photos</h2>
        <ul>
          <li>
            Provide bright, in-focus images on neutral backgrounds from multiple
            angles.
          </li>
          <li>
            Include close-ups of important details, certificates, and any wear.
          </li>
          <li>The first photo becomes the cover image—choose wisely.</li>
        </ul>

        <h2>Inventory & Pricing</h2>
        <ul>
          <li>Enter accurate quantity and delivery options.</li>
          <li>Price in USD; AniThrift will handle conversions for buyers.</li>
          <li>
            Update or archive drafts if items sell elsewhere to keep the
            catalogue fresh.
          </li>
        </ul>

        <h2>Restricted Items</h2>
        <ul>
          <li>No counterfeit or replica merchandise.</li>
          <li>No adult-only content outside approved categories.</li>
          <li>
            Listings must relate to anime, manga, gaming, or adjacent fandoms.
          </li>
        </ul>

        <p>
          Need clarification? Reach us via <a href="/feedback">Submit Feedback</a>
          and the curation team will help you ensure your listing shines.
        </p>
      </div>
    </div>
  );
};

export default DatabaseGuidelines;

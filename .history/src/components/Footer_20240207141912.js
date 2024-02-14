import React from "react";
import AppStore from "../assets/images/app-store-badge.png";

const Footer = () => {
  return (
    <>
      <appAdd className="footer-layer app-advertisement">
        <img src="/path-to-your-app-image.png" alt="Mobile App" />
        <div>
          <p>Discover a World of Anime Merchandise - Anytime, Anywhere.</p>
          <a href="apple-store-link">
            <img
              src=AppS
              alt="Download on the App Store"
            />
          </a>
          <a href="google-play-store-link">
            <img
              src="/path-to-google-play-icon.png"
              alt="Get it on Google Play"
            />
          </a>
        </div>
      </appAdd>
      <footer></footer>
      <legal></legal>
    </>
  );
};

export default Footer;

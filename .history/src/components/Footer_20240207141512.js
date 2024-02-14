import React from "react";
import App

const Footer = () => {
  return (
    <>
      <appAdd className="footer-layer app-advertisement">
        <img src="/path-to-your-app-image.png" alt="Mobile App" />
        <div>
          <p>Discover a World of Anime Merchandise - Anytime, Anywhere.</p>
          <a href="apple-store-link">
            <img
              src="/path-to-apple-store-icon.png"
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

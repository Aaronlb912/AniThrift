import React from "react";
import AppStore from "../assets/app-store-badge.png";
import PlayStore from "../assets/google-play-badge.png";
import Phones from "../assets/phones.png";

import "../css/Footer.css";

const Footer = () => {
  return (
    <>
      <appAdd className="app-promotion-layer">
        <div className="app-image">
          <img src={Phones} alt="App on Phone" style={{ width: "100%" }} />
        </div>
        <div>
          <div className="app-ad-text">
            <div s>Discover a World of Anime Merchandise</div><br/>
            <div>Anytime, Anywhere.</div><br/>
            <div>Get the official app now!</div>
            <br/>
            <br/>
            <br/>
                
          </div>
          <div className="app-store-links">
            <div>
              <a href="apple-store-link">
                <img src={AppStore} alt="Download on the App Store" />
              </a>
            </div>
            <div>
              <a href="google-play-store-link">
                <img src={PlayStore} alt="Get it on Google Play" />
              </a>
            </div>
          </div>
        </div>
      </appAdd>
      <footer></footer>
      <legal></legal>
    </>
  );
};

export default Footer;

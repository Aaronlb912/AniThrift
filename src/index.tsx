import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { BrowserRouter, Routes, Route, Router } from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { auth } from "./firebase-config"; // Adjust the path according to your project structure
import { onAuthStateChanged } from "firebase/auth";
import SearchResult from "./pages/SearchResults";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Listing from "./pages/Listing";
import Selling from "./pages/Selling";
import ItemListing from "./pages/ItemInfo";
import Cart from "./pages/Cart";
import AllCategories from "./pages/AllCategories";
import SearchProvider from "./components/SearchHandler";
import EditItem from "./pages/EditItem";
import PublicProfile from "./pages/PublicProfile";
import Messages from "./pages/Messages";
import Checkout from "./pages/CheckOut";
import ProfileSettings from "./pages/ProfileSettings";
import PersonalInfoPage from "./components/PersonalInfo";
import AddressesPage from "./components/Addresses";

const Root = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
  }, []);

  return (
    <Router>
      <App user={currentUser} />
    </Router>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <SearchProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<App />}></Route>
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/search" element={<SearchResult />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="edit-profile" element={<EditProfile />} />
          <Route path="/listing" element={<Listing />} />
          <Route path="/sell" element={<Selling />} />
          <Route path="/item/:id" element={<ItemListing />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/all-categories" element={<AllCategories />} />
          <Route path="edit-item/:id" element={<EditItem />} />
          <Route path="/user/:userId" element={<PublicProfile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profsettings" element={<ProfileSettings />} />
          <Route
            path="/settings/personal-information"
            element={<PersonalInfoPage />}
          />
          <Route path="/settings/addresses" element={<AddressesPage />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </SearchProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

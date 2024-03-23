import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SearchResult from "./pages/SearchResults";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Listing from "./pages/Listing";
import Selling from "./pages/Selling";
import ItemListing from "./pages/ItemInfo";
import Cart from "./pages/Cart";
import SearchProvider from "./components/SearchHandler";
import EditItem from "./pages/EditItem";
import PublicProfile from "./pages/PublicProfile";
import Messages from "./pages/Messages";
import Checkout from "./pages/CheckOut";
import ProfileSettings from "./pages/ProfileSettings";
import PersonalInfoPage from "./components/PersonalInfo";
import AddressesPage from "./components/Addresses";
import PurchaseSuccess from "./components/PurchaseSuccess";
import StripeOnboardingForm from "./components/StripeOnboardingForm";
import Orders from "./pages/orders";
import Archives from "./pages/ArchivedOrders";
import { AuthProvider } from "./components/userAuth";

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <SearchProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/search" element={<SearchResult />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/listing" element={<Listing />} />
            <Route path="/sell" element={<Selling />} />
            <Route path="/item/:id" element={<ItemListing />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/edit-item/:id" element={<EditItem />} />
            <Route path="/user/:userId" element={<PublicProfile />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profsettings" element={<ProfileSettings />} />
            <Route
              path="/settings/personal-information"
              element={<PersonalInfoPage />}
            />
            <Route path="/settings/addresses" element={<AddressesPage />} />
            <Route path="/success" element={<PurchaseSuccess />} />
            <Route
              path="/StripeOnboardingForm"
              element={<StripeOnboardingForm />}
            />
            <Route path="/orders" element={<Orders />} />
            <Route path="/archives" element={<Archives />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </SearchProvider>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

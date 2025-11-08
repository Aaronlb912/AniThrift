import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SearchProvider from "./components/SearchHandler";
import { AuthProvider } from "./components/userAuth";

// Lazy load components for code splitting
const App = lazy(() => import("./App"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const SearchResult = lazy(() => import("./pages/SearchResults"));
const Profile = lazy(() => import("./pages/Profile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const Listing = lazy(() => import("./pages/Listing"));
const Selling = lazy(() => import("./pages/Selling"));
const ItemListing = lazy(() => import("./pages/ItemInfo"));
const Cart = lazy(() => import("./pages/Cart"));
const EditItem = lazy(() => import("./pages/EditItem"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const Messages = lazy(() => import("./pages/Messages"));
const Checkout = lazy(() => import("./pages/CheckOut"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));
const PersonalInfoPage = lazy(() => import("./components/PersonalInfo"));
const AddressesPage = lazy(() => import("./components/Addresses"));
const PurchaseSuccess = lazy(() => import("./components/PurchaseSuccess"));
const StripeOnboardingForm = lazy(
  () => import("./components/StripeOnboardingForm")
);
const Orders = lazy(() => import("./pages/orders"));
const Archives = lazy(() => import("./pages/ArchivedOrders"));
const AboutUsPage = lazy(() => import("./pages/AboutUs"));
const CareersPage = lazy(() => import("./pages/Careers"));
const HelpAndSupportPage = lazy(() => import("./pages/HelpAndSupport"));
const AccountSettings = lazy(() => import("./pages/AccountSettings"));
const FBResults = lazy(() => import("./components/FBResults"));
const FeedbackForm = lazy(() => import("./components/Feedback"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const LoadingFallback = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "50vh",
    }}
  >
    <div>Loading...</div>
  </div>
);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <SearchProvider>
        <BrowserRouter>
          <Header />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/search" element={<SearchResult />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/listing" element={<Listing />} />
              <Route path="/sell" element={<Selling />} />
              <Route path="/item/:id" element={<ItemListing />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/edit-item/:id" element={<EditItem />} />
              <Route path="/user/:username" element={<PublicProfile />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/:userId" element={<Messages />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profsettings" element={<ProfileSettings />} />
              <Route
                path="/settings/personal-information"
                element={<PersonalInfoPage />}
              />
              <Route path="/settings/addresses" element={<AddressesPage />} />
              <Route
                path="/settings/account-settings"
                element={<AccountSettings />}
              />
              <Route path="/success" element={<PurchaseSuccess />} />
              <Route
                path="/StripeOnboardingForm"
                element={<StripeOnboardingForm />}
              />
              <Route path="/orders" element={<Orders />} />
              <Route path="/archives" element={<Archives />} />
              <Route path="/about-us" element={<AboutUsPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/help-support" element={<HelpAndSupportPage />} />
              <Route path="/fbresults" element={<FBResults />} />
              <Route path="/feedback" element={<FeedbackForm />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Footer />
        </BrowserRouter>
      </SearchProvider>
    </AuthProvider>
  </React.StrictMode>
);

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
import AnimePage from "./pages/AnimePage"; // Import your category components
import MangaPage from "./pages/MangaPage";
import MerchandisePage from "./pages/MerchandisePage";
import FigurePage from "./pages/FigurePage";
import ApparelPage from "./pages/ApparelPage.js";
import AudioPage from "./pages/AudioPage";
import GamesPage from "./pages/GamesPage";

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
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<App />}></Route>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/search" element={<SearchResult />} />
        <Route path="/anime" element={<AnimePage />} />
        <Route path="/manga" element={<MangaPage />} />
        <Route path="/merchandise" element={<MerchandisePage />} />
        <Route path="/figures-trinkets" element={<FigurePage />} />
        <Route path="/apparel" element={<ApparelPage />} />
        <Route path="/audio" element={<AudioPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/"
      </Routes>
      <Footer />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

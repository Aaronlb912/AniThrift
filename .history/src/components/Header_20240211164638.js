import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link, useNavigate } from "react-router-dom";
import "../css/Header.css";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase-config"; // Adjust the path according to your project structure

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    // Redirect to the search results page with the query
    window.location.href = `/search?query=${encodeURIComponent(searchTerm)}`;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/"); // Optionally navigate to sign-in page
        window.location.reload(true); // Or ensure the header updates accordingly without reloading
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
  };

  return (
    <>
      <header className="header">
        <AppBar position="static">
          <Toolbar>
            {/* Logo and Name */}
            <IconButton
              edge="start"
              color="inherit"
              aria-label="home"
              component={Link}
              to="/"
            >
              {/* Your Logo Here */}
              {!isMobile && (
                <Typography variant="h6" noWrap>
                  AniThrift
                </Typography>
              )}
            </IconButton>

            {/* Search Bar */}
            <div
              style={{ flexGrow: 1, display: "flex", justifyContent: "center" }}
            >
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search eBay"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
            </div>

            {/* Sign In / Profile */}
            {user ? (
              <>
                <Typography variant="body1" style={{ marginRight: 10 }}>
                  Welcome, {user.displayName || "User"}
                </Typography>
                <Button color="inherit" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                color="inherit"
                startIcon={<AccountCircleIcon />}
                component={Link}
                to="/signin"
              >
                Sign In
              </Button>
            )}

            {/* Cart */}
            <IconButton
              color="inherit"
              aria-label="cart"
              component={Link}
              to="/cart"
            >
              <ShoppingCartIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </header>
      <nav className="navbar">
        <Link to="/anime" className="nav-link">
          Anime & Videos
        </Link>
        <Link to="/manga" className="nav-link">
          Manga & Novels
        </Link>
        <Link to="/merchandise" className="nav-link">
          Merchandise
        </Link>
        <Link to="/figures-trinkets" className="nav-link">
          Figures & Trinkets
        </Link>
        <Link to="/apparel" className="nav-link">
          Apparel
        </Link>
        <Link to="/audio" className="nav-link">
          Audio
        </Link>
        <Link to="/games" className="nav-link">
          Games
        </Link>
        <Link to="/all-categories" className="nav-link">
          All Categories
        </Link>
      </nav>
    </>
  );
};

export default Header;

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
import { Link } from "react-router-dom";
import "../css/Header.css";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase-config"; // Adjust the path according to your project structure
import { useNavigate } from "react-router-dom";

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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
              <InputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
                startAdornment={<SearchIcon />}
                className="searchBar"
              />
            </div>

            {/* Sign In / Profile */}
            {user ? (
              <>
                <Typography variant="body1" style={{ marginRight: 10 }}>
                  Welcome, {user.firstName || "User"}
                </Typography>
                console.log(user.);
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
      {/* Your navigation bar here */}
    </>
  );
};

export default Header;

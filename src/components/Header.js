import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme,
  MenuItem,
  Menu,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import "../css/Header.css";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase-config"; // Adjust the path according to your project structure

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false); // State to control Drawer open state

  console.log(user);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen); // Toggle Drawer open state
  };

  const drawer = (
    <List>
      {[
        "Anime & Videos",
        "Manga & Novels",
        "Merchandise",
        "Figures & Trinkets",
        "Apparel",
        "Audio",
        "Games",
        "All Categories",
      ].map((text, index) => (
        <ListItem
          button
          key={text}
          component={Link}
          to={`/${text.toLowerCase().replace(/ & /g, "-").replace(/ /g, "")}`}
        >
          <ListItemText primary={text} />
        </ListItem>
      ))}
    </List>
  );

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

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <topbar>
        {/* Left Side - Welcome Message */}
        {user ? (
          <>
            <Typography
              variant="body1"
              sx={{
                marginRight: 2,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
              onClick={handleMenu}
            >
              Welcome, {user.displayName || "User"}
              {/* Conditionally render the arrow icon based on menu open state */}
              {Boolean(anchorEl) ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
            </Typography>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem
                onClick={() => {
                  handleClose(); // This will close the menu
                  navigate("/profile"); // Then navigate to the profile page
                }}
              >
                My Profile
              </MenuItem>
              <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
            </Menu>
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

        {/* Right Side - Sell and Cart */}
        <div className="right-side">
          <Button color="inherit" component={Link} to="/listing">
            Sell
          </Button>
          <IconButton
            color="inherit"
            aria-label="cart"
            component={Link}
            to="/cart"
          >
            <ShoppingCartIcon />
          </IconButton>
        </div>
      </topbar>
      <header className="header">
        <AppBar position="static" sx={{ bgcolor: "black" }}>
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
              style={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
                height: 50,
              }}
            >
              <InputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
                startAdornment={<SearchIcon />}
                className="searchBar"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && searchInput.trim()) {
                    e.preventDefault(); // Prevent the default action
                    navigate(
                      `/search?query=${encodeURIComponent(searchInput.trim())}`
                    ); // Navigate to SearchResult page with query
                  }
                }}
              />
            </div>
          </Toolbar>
        </AppBar>
      </header>
      {isMobile ? (
        <>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </>
      ) : (
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
      )}
    </>
  );
};

export default Header;

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
import MessageIcon from "@mui/icons-material/Message";
import { Link, useNavigate } from "react-router-dom";
import "../css/Header.css";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase-config"; // Adjust the path according to your project structure
import { useSearch } from "./SearchHandler";
import { doc, getDoc } from "firebase/firestore";

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false); // State to control Drawer open state
  const { setSearchQuery }: any = useSearch(); // Use setSearchQuery from your search context

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchInput.trim()) {
      setSearchQuery(searchInput.trim());
      navigate(`/search?query=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen); // Toggle Drawer open state
  };

  const drawer = (
    <List>
      {[
        "Digital Media",
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserProfile(user.uid);
      }
    });
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

  const fetchUserProfile = async (uid: string) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUser(docSnap.data() as UserProfile);
    } else {
      console.error("No such document!");
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCategoryClick = (query) => {
    // Update the search query in the context
    setSearchQuery(`${query}`);
    // Navigate to the search page. The EbayResults component will pick up the updated query.
    navigate(`/search?query=${encodeURIComponent(`${query}`)}`);
  };

  const categories = [
    { name: "Digital Media", query: "anime" },
    { name: "Manga & Novels", query: "manga" },
    { name: "Merchandise", query: "merch" },
    { name: "Figures & Trinkets", query: "figures" },
    { name: "Apparel", query: "apparel" },
    { name: "Audio", query: "audio" },
    { name: "Games", query: "games" },
    { name: "All Categories", query: "" },
  ];

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
              Welcome, {user.username || "User"}
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
                  navigate("/profile"); // Navigate to the profile page
                }}
              >
                My Profile
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  navigate("/orders");
                }}
              >
                My Orders
              </MenuItem>
              {/* Add a menu item for Profile Settings */}
              <MenuItem
                onClick={() => {
                  handleClose(); // Close the menu
                  navigate("/profsettings"); // Navigate to the profile settings page
                }}
              >
                Profile Settings
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
          <Button color="inherit" component={Link} to="/messages">
            <MessageIcon />
          </Button>
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
        <AppBar position="static" sx={{ bgcolor: `#9e9e9e`, color: `#333` }}>
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
            <div className="searchContainer">
              <InputBase
                placeholder="Search…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleSearch}
                className="searchBar"
                endAdornment={
                  <IconButton
                    type="submit"
                    aria-label="search"
                    onClick={handleSearch}
                  >
                    <SearchIcon />
                  </IconButton>
                }
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
          {categories.map((category, index) => (
            <Button
              key={index}
              className="nav-link"
              onClick={() => handleCategoryClick(category.query)}
              style={{ textTransform: "none" }}
            >
              {category.name}
            </Button>
          ))}
        </nav>
      )}
    </>
  );
};

export default Header;

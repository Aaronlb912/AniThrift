import React, { useEffect, useState, useCallback, useMemo } from "react";
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
import { auth, db } from "../firebase-config";
import { useSearch } from "./SearchHandler";
import { doc, getDoc } from "firebase/firestore";

interface UserProfile {
  username?: string;
  [key: string]: unknown;
}

const Header: React.FC = React.memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setSearchQuery } = useSearch();

  const categories = useMemo(
    () => [
      { name: "Digital Media", query: "anime" },
      { name: "Manga & Novels", query: "manga" },
      { name: "Merchandise", query: "merch" },
      { name: "Figures & Trinkets", query: "figures" },
      { name: "Apparel", query: "apparel" },
      { name: "Audio", query: "audio" },
      { name: "Games", query: "games" },
      { name: "All Categories", query: "" },
    ],
    []
  );

  const drawerItems = useMemo(
    () => [
      { name: "Digital Media", query: "anime" },
      { name: "Manga & Novels", query: "manga" },
      { name: "Merchandise", query: "merch" },
      { name: "Figures & Trinkets", query: "figures" },
      { name: "Apparel", query: "apparel" },
      { name: "Audio", query: "audio" },
      { name: "Games", query: "games" },
      { name: "All Categories", query: "" },
    ],
    []
  );

  const fetchUserProfile = useCallback(async (uid: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUser(docSnap.data() as UserProfile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserProfile(user.uid);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [fetchUserProfile]);

  const handleSearch = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
      if (searchInput.trim()) {
        setSearchQuery(searchInput.trim());
        navigate(`/search?query=${encodeURIComponent(searchInput.trim())}`);
      }
    },
    [searchInput, setSearchQuery, navigate]
  );

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const handleSignOut = useCallback(() => {
    signOut(auth)
      .then(() => {
        setUser(null);
        navigate("/");
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
  }, [navigate]);

  const handleMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleCategoryClick = useCallback(
    (query: string) => {
      setSearchQuery(query);
      navigate(`/search?query=${encodeURIComponent(query)}`);
    },
    [setSearchQuery, navigate]
  );

  const handleDrawerItemClick = useCallback(
    (query: string) => {
      handleDrawerToggle(); // Close the drawer
      handleCategoryClick(query); // Use the same handler as desktop
    },
    [handleDrawerToggle, handleCategoryClick]
  );

  const drawer = useMemo(
    () => (
      <List>
        {drawerItems.map((item) => (
          <ListItem
            button
            key={item.name}
            onClick={() => handleDrawerItemClick(item.query)}
          >
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
    ),
    [drawerItems, handleDrawerItemClick]
  );

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
              disableScrollLock={true}
              disableAutoFocusItem={true}
              MenuListProps={{
                'aria-labelledby': 'user-menu-button',
              }}
              slotProps={{
                paper: {
                  style: {
                    maxWidth: '200px',
                    width: '200px',
                  },
                },
              }}
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
        <AppBar position="static" sx={{ bgcolor: `#F5E6D3`, color: `#333` }}>
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
                onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                className="searchBar"
                endAdornment={
                  <IconButton
                    type="submit"
                    aria-label="search"
                    onClick={(e) => handleSearch(e)}
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
});

Header.displayName = "Header";

export default Header;

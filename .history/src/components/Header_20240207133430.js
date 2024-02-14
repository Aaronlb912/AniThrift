import React from "react";
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

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
              <img
                src="/path-to-your-logo.png"
                alt="logo"
                style={{ marginRight: isMobile ? "0" : "10px" }}
              />
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
            <Button
              color="inherit"
              startIcon={<AccountCircleIcon />}
              component={Link}
              to="/"
            >
              Sign In
            </Button>

            {/* Cart */}
            <IconButton
              color="inherit"
              aria-label="cart"
              component={Link}
              to="/"
            >
              <ShoppingCartIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </header>
      <nav className="navbar">
        <a>text</a>
        <Link to="/anime-videos" className="nav-link">
          Anime & Videos
        </Link>
        <Link to="/manga-novels" className="nav-link">
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

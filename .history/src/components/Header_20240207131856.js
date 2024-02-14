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
import '../css/Header.css';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
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
        <div style={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
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
        <IconButton color="inherit" aria-label="cart" component={Link} to="/">
          <ShoppingCartIcon />
        </IconButton>
      </Toolbar>
    </AppBar></header>
  );
  
};

export default Header;

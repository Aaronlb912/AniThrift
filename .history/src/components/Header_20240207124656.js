import React from 'react';
import { AppBar, Toolbar, Typography, InputBase, Button, IconButton, useMediaQuery, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';


const Header = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <AppBar position="static">
            <Toolbar>
                {/* Logo and Name */}
                <IconButton edge="start" color="inherit" aria-label="home">
                    <img src="/path-to-your-logo.png" alt="logo" style={{ marginRight: isMobile ? '0' : '10px' }} />
                    {!isMobile && <Typography variant="h6" noWrap>
                        AniThrift
                    </Typography>}
                </IconButton>
                
                {/* Search Bar */}
                <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                    <InputBase
                        placeholder="Search…"
                        inputProps={{ 'aria-label': 'search' }}
                        startAdornment={<SearchIcon />}
                        style={{ color: 'inherit', backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: '0 10px', borderRadius: '5px' }}
                    />
                </div>
                
                {/* Sign In / Profile */}
                <Button color="inherit" startIcon={<AccountCircleIcon />}>
                    Sign In
                </Button>
                
                {/* Cart */}
                <IconButton color="inherit" aria-label="cart">
                    <ShoppingCartIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}

export default Header;

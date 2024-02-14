const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 3000;

// Endpoint to handle OAuth redirect and code exchange
app.get('/auth/ebay/callback', async (req, res) => {
    const { code } = req.query; // eBay sends the auth code here
    const clientId = 'YOUR_CLIENT_ID';
    const clientSecret = 'YOUR_CLIENT_SECRET';
    const redirectUri = 'YOUR_REDIRECT_URI'; // Must match the one registered with eBay
    
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const url = 'https://api.ebay.com/identity/v1/oauth2/token';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${credentials}`,
            },
            body: new URLSearchParams({
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': redirectUri,
            })
        });

        const data = await response.json();
        // Use the access token from data.access_token for API calls
        // Optionally, redirect the user to a success page or back to your app
        res.redirect('/success'); // Example redirect
    } catch (error) {
        console.error('Error exchanging auth code:', error);
        res.status(500).send('Authentication failed');
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

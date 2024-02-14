require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

cons

const ebayAuthToken = new EbayAuthToken({
    clientId: '<your_client_id>',
    clientSecret: '<your_client_secret>',
    redirectUri: '<redirect_uri_name>'
});

app.use(express.json());

// Route to handle eBay search
app.get('/api/search', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).send('Query parameter is required');
    }

    try {
        const response = await axios.get(`https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}`, {
            headers: {
                Authorization: `Bearer ${process.env.EBAY_OAUTH_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching from eBay API:', error);
        res.status(500).json({ message: 'Failed to fetch data from eBay' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

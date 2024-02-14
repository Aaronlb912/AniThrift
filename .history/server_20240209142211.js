const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable parsing of incoming JSON requests
app.use(express.json());

// Define a route for eBay API requests
app.get('/api/ebay-search', async (req, res) => {
    const { query } = req.query; // Assuming a query parameter named "query"
    const apiUrl = `https://api.ebay.com/commerce/catalog/v1/product/${query}`;
    
    try {
        const ebayResponse = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer YOUR_OAUTH_USER_TOKEN',
                'Content-Type': 'application/json'
            }
        });

        if (!ebayResponse.ok) {
            throw new Error('Failed to fetch data from eBay');
        }

        const data = await ebayResponse.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching data from eBay' });
    }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

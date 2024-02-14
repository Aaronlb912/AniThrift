const axios = require('axios');

app.get('/api/search', async (req, res) => {
    const { query } = req.query; // Get the search query from request parameters

    if (!query) {
        return res.status(400).send('Query parameter is required');
    }

    try {
        // Directly call the eBay API within this route
        const ebayApiResponse = await axios.get(`https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}` //prett
        , {
            headers: {
                Authorization: `Bearer YOUR_EBAY_OAUTH_USER_TOKEN`,
                'Content-Type': 'application/json',
            },
        });

        // Send the eBay API response directly to the frontend
        res.json(ebayApiResponse.data);
    } catch (error) {
        console.error('Error fetching from eBay API:', error);
        res.status(error.response?.status || 500).json({ message: 'Failed to fetch data from eBay' });
    }
});

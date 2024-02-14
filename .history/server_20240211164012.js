const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  const ebayApiUrl = `https://svcs.ebay.com/services/search/FindingService/v1`; // eBay Finding API endpoint
  const params = {
    'OPERATION-NAME': 'findItemsByKeywords',
    'SERVICE-VERSION': '1.0.0',
    'SECURITY-APPNAME': process.env.EBAY_APP_ID, // Your eBay App ID stored in environment variables
    'RESPONSE-DATA-FORMAT': 'JSON',
    'REST-PAYLOAD': '',
    keywords: query,
  };

  try {
    const response = await axios.get(ebayApiUrl, { params });
    res.json(response.data); // Send eBay search results back to the frontend
  } catch (error) {
    console.error('eBay API request failed:', error);
    res.status(500).json({ message: 'Failed to fetch data from eBay' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const clientId = process.env.EBAY_CLIENT_ID;
const clientSecret = process.env.EBAY_CLIENT_SECRET;

const ebayAuthToken = new EbayAuthToken({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: "Anithrift-Anithrif-Anithr-bnjhl",
});

app.use(express.json());

// Route to handle eBay search
app.get("/api/search", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).send("Query parameter is required");
  }

  try {
    const response = await axios.get(
      `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(
        query
      )}`,
      {
        headers: {
          Authorization: `Bearer ${e}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching from eBay API:", error);
    res.status(500).json({ message: "Failed to fetch data from eBay" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

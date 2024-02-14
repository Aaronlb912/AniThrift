require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
const PORT = 3000; // Or any port you prefer

app.use(cors());
app.use(express.json());

// Endpoint to handle search queries
app.get("/api/search", async (req, res) => {
  const { query } = req.query;

  try {
    const response = await axios.get(
      `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(
        query
      )}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.EBAY_OAUTH_TOKEN}`,
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*

        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching from eBay API:", error);
    res.status(500).json({ error: "Failed to fetch data from eBay" });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = 3000; // Use your preferred port

app.use(express.json());

// Proxy route for eBay search
app.get("/api/search", async (req, res) => {
  const { q } = req.query; // Assuming you pass the search query as "q"

  try {
    const response = await axios.get(
      `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(q)}`, //
      {
        headers: {
          Authorization: `Bearer ${process.env.EBAY_OAUTH_TOKEN}`, // Use your eBay OAuth token
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res
      .status(error.response.status)
      .json({ message: "Error fetching data from eBay" });
  }
});

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);

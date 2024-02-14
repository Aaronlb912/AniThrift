require("dotenv").config(); // Ensure this is at the top to load environment variables
const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

const cors = require("cors");
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.get("/api/search", async (req, res) => {
  const { query } = req.query; // Get the search query from request parameters

  if (!query) {
    return res.status(400).send("Query parameter is required");
  }

  try {
    // Directly call the eBay API within this route
    const ebayApiResponse = await axios.get(
      `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}`, //prettier-ignore
      {
        headers: {
          "X-EBAY-C-ENDUSERCTX": "contextualLocation=country%3DUS%2Czip%3D19406",
          Authorization: `Bearer ${process.env.EBAY_OAUTH_TOKEN}`,
          "X-EBAY-API-VERSION": "967",
          "X-EBAY-C-MARKETPLACE-ID:EBAY_US

          "Content-Type": "application/json",
        },
      }
    );

    // Send the eBay API response directly to the frontend
    res.json(ebayApiResponse.data);
  } catch (error) {
    console.error("Error fetching from eBay API:", error);
    res
      .status(error.response?.status || 500)
      .json({ message: "Failed to fetch data from eBay" });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

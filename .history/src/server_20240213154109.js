require("dotenv").config(); // Ensure this is at the top to load environment variables
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;


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
          "X-EBAY-C-ENDUSERCTX":
            "contextualLocation=country%3DUS%2Czip%3D19406",
          Authorization: `bearer ${process.env.EBAY_OAUTH_TOKEN}`,
          "X-EBAY-API-VERSION": "967",
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

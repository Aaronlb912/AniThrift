const axios = require("axios");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/api/ebay-search", async (req, res) => {
  const { query } = req.query;
  const apiUrl = `https://api.ebay.com/commerce/catalog/v1/product/${query}`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: "SBX-7fc0fe9727d0-80e7-4a79-aaa7-366f
        ",
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching data from eBay" });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

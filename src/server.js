const express = require("express");
const algoliasearch = require("algoliasearch");

const app = express();
const port = process.env.PORT || 3000;

// Replace these with your Algolia application ID and admin API key
const client = algoliasearch("UDKPDLE9YO", "0eaa91b0f52cf49f20d168216adbad37");
const index = client.initIndex("items");

app.get("/api/facets", async (req, res) => {
  try {
    const settings = await index.getSettings();
    res.json({
      success: true,
      attributesForFaceting: settings.attributesForFaceting,
    });
  } catch (error) {
    console.error("Failed to fetch attributesForFaceting:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

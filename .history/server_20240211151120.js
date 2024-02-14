import express f

const express = require("express");
const fetch = require("node-fetch");
const app = express();
const PORT = 3000;

app.use(express.json());

// CORS setup for development (adjust in production)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// eBay API endpoint
app.get("/api/search", async (req, res) => {
  const keywords = req.query.keywords;
  const appId = "Anithrif-Anithrif-SBX-07fc0fe97-e3f8dc2d"; // Replace with your actual eBay App ID
  const url = `https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByKeywords&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=${appId}&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&keywords=${encodeURIComponent(
    keywords
  )}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching from eBay:", error);
    res.status(500).send("Error fetching data from eBay");
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

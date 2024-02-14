import express from "express";

const express = require("express");
const fetch = require("node-fetch");
const app = express();
const PORT = 3000;

app.use(express.json());

// CORS setup for development (adjust in production)
app.get("/api/search", async (req, res) => {
  const keywords = req.query.keywords;
  const appId = "YOUR_EBAY_APP_ID"; // Replace with your actual eBay App ID

  // Use dynamic import for node-fetch
  const { default: fetch } = await import("node-fetch");

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

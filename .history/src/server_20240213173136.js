const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
const PORT = 3000; // Or any port you prefer
import eBayApi from "ebay-api;

require("dotenv").config();

const ebay = new Ebay({ clientID: process.env.EBAY_CLIENT_ID });

// Endpoint to handle search queries
// app.get("/api/search", async (req, res) => {
//   const { query } = req.query;

//   try {
//     const response = await axios.get(
//       `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(
//         query
//       )}`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.EBAY_OAUTH_TOKEN}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     res.json(response.data);
//   } catch (error) {
//     console.error("Error fetching from eBay API:", error);
//     res.status(500).json({ error: "Failed to fetch data from eBay" });
//   }
// });

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname + "/pages/SearchResults.js"))
);

// create a route to search items in eBay.
app.use("/search", function (req, res) {
  const queryParam = req.query;
  // call the ebay api
  ebay
    .findItemsByKeywords({
      keywords: queryParam.keyword,
      sortOrder: "PricePlusShippingLowest", //https://developer.ebay.com/devzone/finding/callref/extra/fndcmpltditms.rqst.srtordr.html
      Condition: 3000,
      SoldItemsOnly: false,
      affiliate: {
        networkId: 9,
        trackingId: 1234567890,
      },
    })
    .then(
      (data) => {
        return res.status(200).send(data);
      },
      (error) => {
        return res.status(404).send(data);
      }
    );
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

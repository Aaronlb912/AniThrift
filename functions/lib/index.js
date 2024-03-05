/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
const axios_1 = require("axios");
const https_1 = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const express = require("express");
const app = express();
app.use(express.json()); // This line is crucial

const functions = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");

const { defineSecret } = require("firebase-functions/params");
// let Ebay = require("ebay-node-api");
const ebayClientSecret = defineSecret("EBAY_CLIENT_SECRET");
const ebayAuthToken = defineSecret("EBAY_AUTH_TOKEN");

// Start writing functions
// https://firebase.google.com/docs/functions/typescript
// exports.helloWorld = (0, https_1.onRequest)(
//   { secrets: [ebayAuthToken] },
//   async (request, response) => {
//     const oauthToken = ebayAuthToken;
//     logger.info("Hello logs!", { structuredData: true });
//     try {
//       // Adjust this URL to match your actual backend endpoint
//       const resp = await axios_1.default.get(
//         "https://api.ebay.com/buy/browse/v1/item_summary/search?q=drone&limit=3",
//         {
//           headers: {
//             Authorization: `Bearer ${oauthToken}`,
//             "Content-Type": "application/json",
//             // Include additional headers as required by the eBay API
//           },
//         }
//       );
//       if (!resp.data) throw new Error("Failed to fetch data");
//       // const data = await response.json();
//       // Assuming the response format matches eBay's, adjust as necessary
//       // const items =
//       //   data.findItemsByKeywordsResponse[0].searchResult[0].item || [];
//       response.send(resp.data);
//       // console.log("First ten items from eBay search:", items.slice(0, 10));
//     } catch (error) {
//       console.error("Error fetching eBay search results: ", error);
//       response.send(error);
//     }
//   }
// );
// const getAccessToken = async (ebayClientSecret) => {
//   let ebay = new Ebay({
//     clientID: "Anithrif-Anithrif-PRD-b7fc0fe97-09fe34fa",
//     clientSecret: ebayClientSecret,
//     body: {
//       grant_type: "client_credentials",
//       //you may need to define the oauth scope
//       scope: "https://api.ebay.com/oauth/api_scope",
//     },
//   });
//   return ebay.getAccessToken().then(
//     (data) => {
//       return data;
//     },
//     (error) => {
//       console.log(error);
//     }
//   );
// };
/**
 * const whitelistedIPs = [
  '108.45.67.167',
  '98.201.220.188',
  '2601:2c1:c200:a::b',
  '192.168.1.152',
  'fe80::932:1e42:b462:c403%12',
];
 */
// https://firebase.google.com/docs/functions/http-events?gen=2nd#node.js
/**
 * to enable it for your domain
 * { cors: ['anithrift.com'] }
 */
// exports.searchEbayItems = (0, https_1.onRequest)(
//   { secrets: [ebayClientSecret] },
//   async (req, res) => {
//     res.set("Access-Control-Allow-Origin", "*");
//     res.set("Accept", "Application/json");
//     console.log("body", req.body);
//     try {
//       let parsedBody = await JSON.parse(req.body);
//       console.log(parsedBody, parsedBody);
//       let token = await getAccessToken(ebayClientSecret);
//       const endpoint = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${parsedBody.query}`;
//       const headers = {
//         Authorization: `Bearer ${token.access_token}`,
//         "Content-Type": "application/json",
//         "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
//         "Accept-Language": "en-US",
//         "Accept-Charset": "utf-8",
//         Accept: "application/json",
//         LegacyUse: "true",
//       };
//       const response = await axios_1.default.get(endpoint, {
//         headers: headers,
//       });
//       // Process and send the response data
//       res.status(200).send(response.data);
//     } catch (error) {
//       console.log(JSON.stringify(error));
//       res
//         .status(500)
//         .send({ error: error, message: "Failed to fetch data from eBay" });
//     }
//   }
// );
// const ip = req.ip;
// if (whitelistedIPs.includes(ip as string)) {
//   // IP is whitelisted, proceed with your function's logic
//   res.set("Access-Control-Allow-Origin", "*");
// } else {
//   // IP is not whitelisted, send an appropriate response
//   res.status(403).send('Access denied');
// }
//# sourceMappingURL=index.js.map
// server.js

const cors = require("cors")({ origin: true });
const stripe = require("stripe")(
  "sk_test_51OmlACB42524Tsr4u5DxNgH2OJluMx2gZa888g0TX5kAqLDlKs2LScFM3zmrK3MvjmuzPmxOl4pHPPQPWluPz2VK00cGhyFCZm"
);
exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    console.log(req.body);
    try {
      const { cartItems } = req.body;
      const sellerId = cartItems[0].sellerId;
      const sellerName = cartItems[0].sellerName;

      const lineItems = cartItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
            images: [item.imageUrl],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: 1,
      }));

      const session = await stripe.checkout.sessions.create({
        metadata: { sellerName, sellerId },
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/cancel`,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });
});

// exports.stripeWebHook = functions.https.onRequest((req, res) => {

// })

// const changeListingStatus = () => {

// }

// exports.handlePurchaseCompletion = functions.https.onRequest(async (req, res) => {
//   const sig = req.headers['stripe-signature'];

//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(
//       req.rawBody,
//       sig,
//       functions.config().stripe.webhooksecret
//     );
//   } catch (err) {
//     console.error(`Webhook signature verification failed.`, err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === 'checkout.session.completed') {
//     const session = event.data.object;

//     // Retrieve metadata from session
//     const { userId, itemId, quantity } = session.metadata;

//     try {
//       // Update item listing status to sold
//       await db.collection('items').doc(itemId).update({ status: 'sold' });
//       await db.collection('users').doc(itemData.sellerId).collection("selling").
//       // Create a copy of the item data with listing status purchased under the buyer's account
//       const itemData = (await db.collection('items').doc(itemId).get()).data();
//       await db.collection('users').doc(userId).collection('purchased').add({
//         ...itemData,
//         status: 'purchased',
//         purchaseDate: admin.firestore.FieldValue.serverTimestamp(),
//       });

//       // If more than one quantity, handle accordingly (this step depends on your data model)
//       // For example, decrement the available quantity or mark individual items as sold

//       // Send verification email to seller and buyer
//       // This requires integrating with an email service and is not shown here

//       console.log(`Purchase processed for user ${userId} for item ${itemId}`);
//       res.json({ received: true });
//     } catch (error) {
//       console.error("Error processing purchase:", error);
//       return res.status(500).send({ error: "Internal Server Error" });
//     }
//   } else {
//     console.log(`Unhandled event type ${event.type}`);
//     res.json({ received: true });
//   }
// });

exports.createStripeAccountOnFirstItem = functions.https.onRequest(
  async (req, res) => {
    cors(req, res, async () => {
      const { item } = req.body;
      const userId = item.sellerId; // Assuming item data includes a sellerId

      // Retrieve user data
      const userRef = admin.firestore().doc(`users/${userId}`);
      const userSnap = await userRef.get();
      if (!userSnap.exists) return null;

      const user = userSnap.data();

      // Check if the user already has a Stripe account
      if (!user.stripeAccountId) {
        // Create a new Stripe Connect account
        try {
          const account = await stripe.accounts.create({
            type: "express",
            country: "US",
            email: user.email,
            capabilities: {
              card_payments: { requested: true },
              transfers: { requested: true },
            },
          });

          // Update user document with Stripe account ID
          await userRef.update({ stripeAccountId: account.id });
          console.log(
            `Stripe account created with ID: ${account.id} for user: ${userId}`
          );
          return res
            .status(200)
            .send({ status: "account successfully created" });
        } catch (error) {
          return res.status(500).send({
            error: `Error creating Stripe account for user ${userId}:`,
          });
        }
      } else {
        return res
          .status(200)
          .send(`User ${userId} already has a Stripe account.`);
      }
    });
  }
);

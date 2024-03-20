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
const { error } = require("console");
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

exports.createCheckoutSession = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    // Ensure that you're receiving a POST request
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const { cartItems, buyerId } = req.body;

      // Check for cartItems in the request
      if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        throw new Error("cartItems is required and must be a non-empty array.");
      }

      // Validate buyerId
      if (!buyerId) {
        return res.status(400).send("buyerId is required.");
      }

      // Optionally verify the buyer's Firebase user ID if needed
      // This step is optional and should be used according to your security requirements
      const buyerExists = await checkIfUserExists(buyerId);

      console.log("we are here");
      console.log("cart", cartItems);

      // Assuming the first cart item to determine the seller for simplification. Adjust as necessary.
      const sellerStripeAccountId = await fetchSellerStripeAccountId(
        cartItems[0].sellerId
      );

      if (!sellerStripeAccountId) {
        throw new Error("Seller Stripe account ID not found");
      }

      const lineItems = cartItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
            images: [item.imageUrl],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

      console.log("now we are here");
      console.log("StripeID", sellerStripeAccountId);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `http://localhost:3000/success`,
        cancel_url: `http://localhost:3000/cart`,
        payment_intent_data: {
          application_fee_amount: 123, // Adjust your application fee
          transfer_data: {
            destination: sellerStripeAccountId,
          },
        },
        metadata: {
          buyerId,
          cartItems: JSON.stringify(
            cartItems.map((item) => ({
              itemId: item.itemId, // Ensure each item has a unique identifier
              quantity: item.quantity,
            }))
          ),
        },
      });

      res.json({ url: session.url });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });
});

async function fetchSellerStripeAccountId(sellerId) {
  const sellerRef = admin.firestore().doc(`users/${sellerId}`);
  const sellerSnap = await sellerRef.get();

  if (!sellerSnap.exists) {
    throw new Error("Seller not found");
  }

  const sellerData = sellerSnap.data();
  return sellerData.stripeAccountId; // Ensure this is correctly pointing to where the Stripe account ID is stored
}

async function checkIfUserExists(userId) {
  try {
    await admin.auth().getUser(userId);
    return true;
  } catch (error) {
    console.error("Error checking user existence:", error);
    return false;
  }
}

exports.stripeWebhook = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // console.log(JSON.stringify(req.body));

    const event = req.body;

    // Proceed only for checkout.session.completed events
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("session", JSON.stringify(session));
      console.log("metadata", session.metadata);

      const { buyerId, cartItems } = session.metadata; // Make sure metadata is stored correctly during checkout session creation
      const parsedCartItems = JSON.parse(cartItems); // Make sure metadata is stored correctly during checkout session creation

      try {
        await updateInventoryAndOrderStatus(parsedCartItems);
        await emptyBuyersCart(buyerId);
        await createOrderReferenceForBuyer(
          buyerId,
          parsedCartItems,
          session.id
        );
        await sendEmailConfirmation(buyerId, parsedCartItems);
        res.status(200).send({ received: true });
      } catch (error) {
        console.error("Failed to process purchase:", JSON.stringify(error));
        res.status(500).send({ error: "Failed to process purchase" });
      }
    } else {
      return res.status(200).send({ received: false });
    }
  });
});

async function updateInventoryAndOrderStatus(cartItems) {
  // Assuming cartItems is an array of { itemId, quantity }

  try {
    const itemsToUpdate = cartItems.map((item) => {
      return admin
        .firestore()
        .doc(`items/${item.itemId}`)
        .get()
        .then((doc) => {
          if (!doc.exists) {
            console.log(`Item ${item.itemId} not found`);
            return null;
          }
          const itemData = doc.data();
          const updatedQuantity = itemData.quantity - item.quantity;

          const newData = {
            ...itemData,
            quantity: updatedQuantity,
          };

          // Update listingStatus to "sold" if the updated quantity is less than or equal to 0
          if (updatedQuantity <= 0) {
            newData.listingStatus = "sold"; // Ensure this field name matches your database schema
          }

          // Perform the update
          return admin.firestore().doc(`items/${item.itemId}`).update(newData);
        });
    });

    await Promise.all(itemsToUpdate);
  } catch (error) {
    console.error("Error updating items:", error);
  }
}

async function emptyBuyersCart(buyerId, purchasedItemIds) {
  try {
    const cartRef = admin
      .firestore()
      .collection("users")
      .doc(buyerId)
      .collection("cart");

    // This process assumes you have the specific IDs of the cart items that were purchased.
    // 'purchasedItemIds' is an array of IDs of the items that need to be removed from the cart.

    const deletes = purchasedItemIds.map((itemId) => {
      return cartRef.doc(itemId).delete();
    });

    // Execute all delete operations
    await Promise.all(deletes);
    return true;
  } catch (error) {
    return error;
  }
}

async function createOrderReferenceForBuyer(buyerId, cartItems, orderId) {
  try {
    const orderRef = admin
      .firestore()
      .collection("users")
      .doc(buyerId)
      .collection("orders")
      .doc(orderId);
    await orderRef.set({
      cartItems,
      orderId,
      date: admin.firestore.FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error) {
    return error;
  }
}

async function sendEmailConfirmation(buyerId, cartItems) {
  // Implement your email sending logic here
  // You can use Firebase Extensions or third-party services like SendGrid
  return true;
}

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
            business_type: "individual",
            business_profile: {
              url: `https://www.anithrift.com/${userId}`,
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

exports.completeStripeOnboarding = functions.https.onRequest(
  async (req, res) => {
    cors(req, res, async () => {
      const { userId } = req.body;
      admin
        .firestore()
        .collection("users")
        .doc(userId)
        .get()
        .then(async (userSnapshot) => {
          if (!userSnapshot.exists) {
            return res.status(404).send("User not found");
          }

          const userData = userSnapshot.data();
          // Assume userData contains a field named 'stripeAccountId'
          let stripeAccountId = userData.stripeAccountId;

          if (!stripeAccountId) {
            // Create a new Stripe account if it doesn't exist
            const account = await stripe.accounts.create({
              /* Account creation params */
            });
            // Save the Stripe account ID to Firestore
            await admin.firestore().collection("users").doc(userId).update({
              stripeAccountId: account.id,
            });
            stripeAccountId = account.id;
          }

          // Generate an account link for onboarding
          const accountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: "http://localhost:3000/reauth",
            return_url: "http://localhost:3000/",
            type: "account_onboarding",
          });

          res.json({ url: accountLink.url });
        })
        .catch((error) => {
          res.status(500).send("Internal server error");
        });
    });
  }
);

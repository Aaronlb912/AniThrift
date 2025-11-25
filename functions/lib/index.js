"use strict";
/**
 * Firebase Cloud Functions for AniThrift
 */
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSession = exports.getShippoTracking = exports.createShippoLabel = exports.calculateShippoRatesForSeller = exports.calculateShippoRates = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const stripe_1 = require("stripe");
// Initialize Firebase Admin
admin.initializeApp();
// Initialize Stripe
const stripe = new stripe_1.default(((_a = functions.config().stripe) === null || _a === void 0 ? void 0 : _a.secret_key) || process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2023-10-16" });
// Get Shippo API Key (secure - only accessible server-side, never exposed to client)
// Priority: 1. Firebase Functions config, 2. Environment variable
// This is secure because functions.config() is only available in Cloud Functions runtime
const getShippoApiKey = () => {
    var _a;
    return ((_a = functions.config().shippo) === null || _a === void 0 ? void 0 : _a.api_key) ||
        process.env.SHIPPO_API_KEY ||
        "";
};
const SHIPPO_API_URL = "https://api.goshippo.com";
/**
 * Calculate shipping rates using Shippo API
 *
 * Request body:
 * {
 *   fromAddress: ShippingAddress,
 *   toAddress: ShippingAddress,
 *   parcel: { length, width, height, weight }
 * }
 */
exports.calculateShippoRates = (0, https_1.onRequest)({
    cors: true,
    region: "us-central1",
    timeoutSeconds: 60,
}, async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const SHIPPO_API_KEY = getShippoApiKey();
    if (!SHIPPO_API_KEY || SHIPPO_API_KEY === "") {
        logger.error("Shippo API key not configured");
        res.status(500).json({
            error: "Shippo API key not configured. Please set shippo.api_key in Firebase Functions config.",
        });
        return;
    }
    try {
        const { fromAddress, toAddress, parcel } = req.body;
        if (!fromAddress || !toAddress || !parcel) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }
        // Create shipment request
        const shipmentData = {
            address_from: {
                name: fromAddress.name,
                street1: fromAddress.street1,
                street2: fromAddress.street2 || "",
                city: fromAddress.city,
                state: fromAddress.state,
                zip: fromAddress.zip,
                country: fromAddress.country || "US",
                phone: fromAddress.phone || "",
                email: fromAddress.email || "",
            },
            address_to: {
                name: toAddress.name,
                street1: toAddress.street1,
                street2: toAddress.street2 || "",
                city: toAddress.city,
                state: toAddress.state,
                zip: toAddress.zip,
                country: toAddress.country || "US",
                phone: toAddress.phone || "",
                email: toAddress.email || "",
            },
            parcels: [
                {
                    length: parcel.length.toString(),
                    width: parcel.width.toString(),
                    height: parcel.height.toString(),
                    weight: parcel.weight.toString(),
                    mass_unit: "oz",
                    distance_unit: "in",
                },
            ],
            async: false,
        };
        // Call Shippo API
        const response = await fetch(`${SHIPPO_API_URL}/shipments`, {
            method: "POST",
            headers: {
                "Authorization": `ShippoToken ${SHIPPO_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(shipmentData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            logger.error("Shippo API error:", errorData);
            res.status(response.status).json({
                error: "Failed to calculate shipping rates",
                details: errorData,
            });
            return;
        }
        const shipment = await response.json();
        // Get rates
        const ratesResponse = await fetch(`${SHIPPO_API_URL}/shipments/${shipment.object_id}/rates`, {
            method: "GET",
            headers: {
                "Authorization": `ShippoToken ${SHIPPO_API_KEY}`,
            },
        });
        if (!ratesResponse.ok) {
            const errorData = await ratesResponse.json();
            logger.error("Shippo rates API error:", errorData);
            res.status(ratesResponse.status).json({
                error: "Failed to get shipping rates",
                details: errorData,
            });
            return;
        }
        const ratesData = await ratesResponse.json();
        // Format rates for frontend
        const rates = ratesData.results.map((rate) => {
            var _a, _b;
            return ({
                object_id: rate.object_id,
                amount: rate.amount,
                currency: rate.currency,
                provider: rate.provider,
                servicelevel: {
                    name: ((_a = rate.servicelevel) === null || _a === void 0 ? void 0 : _a.name) || rate.servicelevel_name || "Standard",
                    token: ((_b = rate.servicelevel) === null || _b === void 0 ? void 0 : _b.token) || rate.servicelevel_token || "",
                },
                estimated_days: rate.estimated_days || null,
                duration_terms: rate.duration_terms || null,
            });
        });
        res.json({ rates });
    }
    catch (error) {
        logger.error("Error calculating shipping rates:", error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
});
/**
 * Calculate shipping rates for a seller (seller address fetched server-side for privacy)
 *
 * Request body:
 * {
 *   sellerId: string,
 *   toAddress: ShippingAddress,
 *   parcel: { length, width, height, weight }
 * }
 */
exports.calculateShippoRatesForSeller = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const SHIPPO_API_KEY = getShippoApiKey();
    if (!SHIPPO_API_KEY || SHIPPO_API_KEY === "") {
        logger.error("Shippo API key not configured");
        res.status(500).json({
            error: "Shippo API key not configured. Please set shippo.api_key in Firebase Functions config.",
        });
        return;
    }
    try {
        const { sellerId, toAddress, parcel } = req.body;
        if (!sellerId || !toAddress || !parcel) {
            res.status(400).json({ error: "Missing required fields: sellerId, toAddress, parcel" });
            return;
        }
        // Fetch seller's address server-side (never exposed to client)
        const sellerDoc = await admin.firestore().collection("users").doc(sellerId).get();
        if (!sellerDoc.exists) {
            res.status(404).json({ error: "Seller not found" });
            return;
        }
        const sellerData = sellerDoc.data();
        const sellerAddressStr = (sellerData === null || sellerData === void 0 ? void 0 : sellerData.shipFromAddress) || (sellerData === null || sellerData === void 0 ? void 0 : sellerData.registrationAddress);
        if (!sellerAddressStr) {
            res.status(400).json({ error: "Seller has not set a shipping address" });
            return;
        }
        // Parse seller address
        const fromAddress = typeof sellerAddressStr === "string"
            ? JSON.parse(sellerAddressStr)
            : sellerAddressStr;
        // Create shipment request
        const shipmentData = {
            address_from: {
                name: fromAddress.name,
                street1: fromAddress.street1,
                street2: fromAddress.street2 || "",
                city: fromAddress.city,
                state: fromAddress.state,
                zip: fromAddress.zip,
                country: fromAddress.country || "US",
                phone: fromAddress.phone || "",
                email: fromAddress.email || "",
            },
            address_to: {
                name: toAddress.name,
                street1: toAddress.street1,
                street2: toAddress.street2 || "",
                city: toAddress.city,
                state: toAddress.state,
                zip: toAddress.zip,
                country: toAddress.country || "US",
                phone: toAddress.phone || "",
                email: toAddress.email || "",
            },
            parcels: [
                {
                    length: parcel.length.toString(),
                    width: parcel.width.toString(),
                    height: parcel.height.toString(),
                    weight: parcel.weight.toString(),
                    mass_unit: "oz",
                    distance_unit: "in",
                },
            ],
            async: false,
        };
        // Call Shippo API
        const response = await fetch(`${SHIPPO_API_URL}/shipments`, {
            method: "POST",
            headers: {
                "Authorization": `ShippoToken ${SHIPPO_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(shipmentData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            logger.error("Shippo API error:", errorData);
            res.status(response.status).json({
                error: "Failed to calculate shipping rates",
                details: errorData,
            });
            return;
        }
        const shipment = await response.json();
        // Get rates
        const ratesResponse = await fetch(`${SHIPPO_API_URL}/shipments/${shipment.object_id}/rates`, {
            method: "GET",
            headers: {
                "Authorization": `ShippoToken ${SHIPPO_API_KEY}`,
            },
        });
        if (!ratesResponse.ok) {
            const errorData = await ratesResponse.json();
            logger.error("Shippo rates API error:", errorData);
            res.status(ratesResponse.status).json({
                error: "Failed to get shipping rates",
                details: errorData,
            });
            return;
        }
        const ratesData = await ratesResponse.json();
        // Format rates for frontend (seller address never included in response)
        const rates = ratesData.results.map((rate) => {
            var _a, _b;
            return ({
                object_id: rate.object_id,
                amount: rate.amount,
                currency: rate.currency,
                provider: rate.provider,
                servicelevel: {
                    name: ((_a = rate.servicelevel) === null || _a === void 0 ? void 0 : _a.name) || rate.servicelevel_name || "Standard",
                    token: ((_b = rate.servicelevel) === null || _b === void 0 ? void 0 : _b.token) || rate.servicelevel_token || "",
                },
                estimated_days: rate.estimated_days || null,
                duration_terms: rate.duration_terms || null,
            });
        });
        res.json({ rates });
    }
    catch (error) {
        logger.error("Error calculating shipping rates:", error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
});
/**
 * Create a shipping label using Shippo API
 *
 * Request body:
 * {
 *   rateId: string,
 *   orderId: string,
 *   metadata?: object
 * }
 */
exports.createShippoLabel = (0, https_1.onRequest)({
    cors: true,
    region: "us-central1",
    timeoutSeconds: 60,
}, async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const SHIPPO_API_KEY = getShippoApiKey();
    if (!SHIPPO_API_KEY || SHIPPO_API_KEY === "") {
        logger.error("Shippo API key not configured");
        res.status(500).json({
            error: "Shippo API key not configured. Please set shippo.api_key in Firebase Functions config.",
        });
        return;
    }
    try {
        const { rateId, orderId, metadata } = req.body;
        if (!rateId || !orderId) {
            res.status(400).json({ error: "Missing required fields: rateId, orderId" });
            return;
        }
        // Create transaction (purchase label)
        const transactionData = {
            rate: rateId,
            async: false,
            metadata: metadata || {},
        };
        const response = await fetch(`${SHIPPO_API_URL}/transactions`, {
            method: "POST",
            headers: {
                "Authorization": `ShippoToken ${SHIPPO_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(transactionData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            logger.error("Shippo transaction error:", errorData);
            res.status(response.status).json({
                error: "Failed to create shipping label",
                details: errorData,
            });
            return;
        }
        const transaction = await response.json();
        // Update order in Firestore with label information
        try {
            const orderRef = admin.firestore().collection("orders").doc(orderId);
            await orderRef.update({
                shippingLabel: {
                    label_url: transaction.label_url,
                    tracking_number: transaction.tracking_number,
                    tracking_url_provider: transaction.tracking_url_provider,
                    shippo_transaction_id: transaction.object_id,
                    created_at: admin.firestore.FieldValue.serverTimestamp(),
                },
                status: "shipped",
            });
        }
        catch (firestoreError) {
            logger.error("Error updating order in Firestore:", firestoreError);
            // Continue even if Firestore update fails
        }
        res.json({
            label_url: transaction.label_url,
            tracking_number: transaction.tracking_number,
            tracking_url_provider: transaction.tracking_url_provider,
            shippo_transaction_id: transaction.object_id,
        });
    }
    catch (error) {
        logger.error("Error creating shipping label:", error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
});
/**
 * Get tracking information for a shipment
 *
 * Request body:
 * {
 *   trackingNumber: string,
 *   carrier: string (e.g., "usps", "ups", "fedex")
 * }
 */
exports.getShippoTracking = (0, https_1.onRequest)({
    cors: true,
    region: "us-central1",
    timeoutSeconds: 60,
}, async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const SHIPPO_API_KEY = getShippoApiKey();
    if (!SHIPPO_API_KEY || SHIPPO_API_KEY === "") {
        logger.error("Shippo API key not configured");
        res.status(500).json({
            error: "Shippo API key not configured. Please set shippo.api_key in Firebase Functions config.",
        });
        return;
    }
    try {
        const { trackingNumber, carrier } = req.body;
        if (!trackingNumber || !carrier) {
            res.status(400).json({ error: "Missing required fields: trackingNumber, carrier" });
            return;
        }
        // Create tracking request
        const trackingData = {
            carrier: carrier.toLowerCase(),
            tracking_number: trackingNumber,
        };
        const response = await fetch(`${SHIPPO_API_URL}/tracks`, {
            method: "POST",
            headers: {
                "Authorization": `ShippoToken ${SHIPPO_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(trackingData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            logger.error("Shippo tracking API error:", errorData);
            res.status(response.status).json({
                error: "Failed to get tracking information",
                details: errorData,
            });
            return;
        }
        const tracking = await response.json();
        res.json({
            tracking_status: tracking.tracking_status,
            tracking_history: tracking.tracking_history || [],
            eta: tracking.eta,
            carrier: tracking.carrier,
        });
    }
    catch (error) {
        logger.error("Error getting tracking info:", error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
});
/**
 * Create Stripe checkout session with shipping costs included
 *
 * Request body:
 * {
 *   cartItems: Array,
 *   buyerId: string,
 *   shippingAddress: ShippingAddress,
 *   shippingRates: Record<string, ShippoRate>,
 *   shippingCost: number,
 *   itemTotal: number
 * }
 */
exports.createCheckoutSession = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    try {
        const { cartItems, buyerId, shippingAddress, shippingRates, shippingCost = 0, itemTotal, } = req.body;
        if (!cartItems || !buyerId) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }
        // Calculate total
        const calculatedItemTotal = itemTotal || cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
        const totalAmount = calculatedItemTotal + (shippingCost || 0);
        // Create line items for Stripe
        const lineItems = [];
        // Add item line items
        cartItems.forEach((item) => {
            lineItems.push({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.title,
                        images: item.imageUrl ? [item.imageUrl] : [],
                    },
                    unit_amount: Math.round(item.price * 100), // Convert to cents
                },
                quantity: item.quantity,
            });
        });
        // Add shipping as a line item if there's a shipping cost
        if (shippingCost > 0) {
            lineItems.push({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "Shipping",
                        description: "Shipping and handling",
                    },
                    unit_amount: Math.round(shippingCost * 100), // Convert to cents
                },
                quantity: 1,
            });
        }
        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${req.headers.origin || "https://anithrift.com"}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin || "https://anithrift.com"}/cart`,
            metadata: {
                buyerId,
                cartItems: JSON.stringify(cartItems),
                shippingAddress: JSON.stringify(shippingAddress || {}),
                shippingRates: JSON.stringify(shippingRates || {}),
                shippingCost: shippingCost.toString(),
                itemTotal: calculatedItemTotal.toString(),
            },
        });
        // Store order information in Firestore (optional, for tracking)
        try {
            const orderRef = admin.firestore().collection("orders").doc();
            await orderRef.set({
                buyerId,
                cartItems,
                shippingAddress: shippingAddress || {},
                shippingRates: shippingRates || {},
                shippingCost,
                itemTotal: calculatedItemTotal,
                totalAmount,
                stripeSessionId: session.id,
                status: "pending",
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        catch (firestoreError) {
            logger.error("Error storing order in Firestore:", firestoreError);
            // Continue even if Firestore update fails
        }
        res.json({ url: session.url, sessionId: session.id });
    }
    catch (error) {
        logger.error("Error creating checkout session:", error);
        res.status(500).json({
            error: "Failed to create checkout session",
            message: error.message,
        });
    }
});
//# sourceMappingURL=index.js.map
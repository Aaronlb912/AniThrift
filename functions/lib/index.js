"use strict";
/**
 * Firebase Cloud Functions for AniThrift
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = exports.fetchStripeAccountInfo = exports.completeStripeOnboarding = exports.createStripeAccountOnFirstItem = exports.createCheckoutSession = exports.getShippoTracking = exports.createShippoLabel = exports.calculateShippoRatesForSeller = exports.calculateShippoRates = void 0;
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const stripe_1 = require("stripe");
// Initialize Firebase Admin
admin.initializeApp();
// Initialize Stripe
const getStripeSecretKey = () => {
    var _a;
    return (((_a = functions.config().stripe) === null || _a === void 0 ? void 0 : _a.secret_key) || process.env.STRIPE_SECRET_KEY || "");
};
const stripeSecretKey = getStripeSecretKey();
// Initialize Stripe - will throw error if key is invalid, but we check for empty key in functions
const stripe = new stripe_1.default(stripeSecretKey || "sk_test_placeholder", {
    apiVersion: "2023-10-16",
});
// Get Shippo API Key (secure - only accessible server-side, never exposed to client)
// Priority: 1. Firebase Functions config, 2. Environment variable
// This is secure because functions.config() is only available in Cloud Functions runtime
const getShippoApiKey = () => {
    var _a;
    return ((_a = functions.config().shippo) === null || _a === void 0 ? void 0 : _a.api_key) || process.env.SHIPPO_API_KEY || "";
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
exports.calculateShippoRates = functions.https.onRequest(async (req, res) => {
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
                Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
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
                Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
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
            res.status(400).json({
                error: "Missing required fields: sellerId, toAddress, parcel",
            });
            return;
        }
        // Fetch seller's address server-side (never exposed to client)
        const sellerDoc = await admin
            .firestore()
            .collection("users")
            .doc(sellerId)
            .get();
        if (!sellerDoc.exists) {
            res.status(404).json({ error: "Seller not found" });
            return;
        }
        const sellerData = sellerDoc.data();
        const sellerAddressStr = (sellerData === null || sellerData === void 0 ? void 0 : sellerData.shipFromAddress) || (sellerData === null || sellerData === void 0 ? void 0 : sellerData.registrationAddress);
        if (!sellerAddressStr) {
            res
                .status(400)
                .json({ error: "Seller has not set a shipping address" });
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
                Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
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
                Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
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
exports.createShippoLabel = functions.https.onRequest(async (req, res) => {
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
        const { rateId, orderId, metadata } = req.body;
        if (!rateId || !orderId) {
            res
                .status(400)
                .json({ error: "Missing required fields: rateId, orderId" });
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
                Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
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
exports.getShippoTracking = functions.https.onRequest(async (req, res) => {
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
        const { trackingNumber, carrier } = req.body;
        if (!trackingNumber || !carrier) {
            res
                .status(400)
                .json({ error: "Missing required fields: trackingNumber, carrier" });
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
                Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
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
        const { cartItems, buyerId, sellerId, shippingAddress, shippingRates, shippingCost = 0, itemTotal, } = req.body;
        if (!cartItems || !buyerId) {
            res.status(400).json({
                error: "Missing required fields: cartItems and buyerId are required",
            });
            return;
        }
        // Validate Stripe is configured
        const currentStripeKey = getStripeSecretKey();
        if (!currentStripeKey || !stripe) {
            logger.error("Stripe secret key not configured");
            res.status(500).json({
                error: "Stripe is not configured. Please set stripe.secret_key in Firebase Functions config.",
            });
            return;
        }
        // Get seller's Stripe account ID if available (for Stripe Connect)
        let sellerStripeAccountId = null;
        if (sellerId) {
            try {
                const sellerDoc = await admin
                    .firestore()
                    .collection("users")
                    .doc(sellerId)
                    .get();
                if (sellerDoc.exists) {
                    const sellerData = sellerDoc.data();
                    sellerStripeAccountId =
                        (sellerData === null || sellerData === void 0 ? void 0 : sellerData.stripeAccountId) ||
                            (sellerData === null || sellerData === void 0 ? void 0 : sellerData.stripe_account_id) ||
                            null;
                }
            }
            catch (error) {
                logger.warn(`Could not fetch seller Stripe account for ${sellerId}:`, error);
            }
        }
        // Calculate total
        const calculatedItemTotal = itemTotal ||
            cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
        const totalAmount = calculatedItemTotal + (shippingCost || 0);
        const totalAmountInCents = Math.round(totalAmount * 100);
        // Calculate platform fee: 10% with $1 minimum
        const platformFeePercentage = 0.1; // 10%
        const platformFeeMinimum = 100; // $1.00 in cents
        const calculatedPlatformFee = Math.max(Math.round(totalAmountInCents * platformFeePercentage), // 10% of total in cents
        platformFeeMinimum // Minimum $1.00
        );
        const sellerPayoutAmount = totalAmountInCents - calculatedPlatformFee;
        // Create line items for Stripe
        const lineItems = [];
        // Add item line items
        cartItems.forEach((item) => {
            const itemPrice = Number(item.price) || 0;
            if (itemPrice <= 0) {
                throw new Error(`Invalid price for item: ${item.title}`);
            }
            lineItems.push({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.title,
                        images: item.imageUrl ? [item.imageUrl] : [],
                    },
                    unit_amount: Math.round(itemPrice * 100), // Convert to cents
                },
                quantity: Number(item.quantity) || 1,
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
        // Create Stripe checkout session with seller-specific payment
        const sessionParams = {
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${req.headers.origin || "https://anithrift.com"}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin || "https://anithrift.com"}/cart`,
            metadata: {
                buyerId,
                sellerId: sellerId || "",
                // Store only item IDs to stay within Stripe's 500 character metadata limit
                itemIds: cartItems.map((item) => item.itemId || item.id).join(","),
                itemCount: cartItems.length.toString(),
                shippingCost: shippingCost.toString(),
                itemTotal: calculatedItemTotal.toString(),
                // Note: Full cart items, shipping address, and rates are stored in Firestore order document
            },
        };
        // If seller has a Stripe Connect account, use it for direct payout with platform fee
        if (sellerStripeAccountId) {
            // Verify the account is ready to receive transfers
            try {
                const account = await stripe.accounts.retrieve(sellerStripeAccountId);
                if (account.charges_enabled && account.payouts_enabled) {
                    sessionParams.payment_intent_data = {
                        application_fee_amount: calculatedPlatformFee,
                        transfer_data: {
                            destination: sellerStripeAccountId, // Seller receives the remainder
                        },
                    };
                }
                else {
                    logger.warn(`Seller ${sellerId} Stripe account is not fully enabled. Charges enabled: ${account.charges_enabled}, Payouts enabled: ${account.payouts_enabled}. Payment will be processed but seller needs to complete onboarding.`);
                    // Don't set transfer_data if account isn't ready - payment will go to platform
                }
            }
            catch (accountError) {
                logger.error(`Error retrieving seller Stripe account ${sellerStripeAccountId}:`, accountError);
                // Continue without transfer_data - payment will go to platform account
            }
        }
        else {
            // If seller doesn't have a Stripe Connect account yet, log a warning
            // The payment will still go through, but seller won't receive payout until they set up Stripe
            logger.warn(`Seller ${sellerId} does not have a Stripe Connect account. Payment will be processed but seller needs to complete onboarding.`);
        }
        const session = await stripe.checkout.sessions.create(sessionParams);
        // Store order information in Firestore
        try {
            const orderId = admin.firestore().collection("orders").doc().id;
            const orderData = {
                buyerId,
                sellerId: sellerId || "",
                cartItems,
                shippingAddress: shippingAddress || {},
                shippingRates: shippingRates || {},
                shippingCost,
                itemTotal: calculatedItemTotal,
                totalAmount,
                platformFee: calculatedPlatformFee / 100,
                sellerPayoutAmount: sellerPayoutAmount / 100,
                stripeSessionId: session.id,
                status: "pending",
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            // Save to global orders collection (for admin/system use)
            const globalOrderRef = admin.firestore().collection("orders").doc(orderId);
            await globalOrderRef.set(orderData);
            // Also save to user's orders subcollection (for user viewing)
            const userOrderRef = admin
                .firestore()
                .collection("users")
                .doc(buyerId)
                .collection("orders")
                .doc(orderId);
            await userOrderRef.set(orderData);
            logger.info(`Order ${orderId} saved for buyer ${buyerId}`);
        }
        catch (firestoreError) {
            logger.error("Error storing order in Firestore:", firestoreError);
            // Continue even if Firestore update fails
        }
        res.json({ url: session.url, sessionId: session.id });
    }
    catch (error) {
        logger.error("Error creating checkout session:", error);
        logger.error("Error stack:", error.stack);
        logger.error("Error type:", error.type);
        logger.error("Error code:", error.code);
        // Provide more detailed error information
        const errorMessage = error.message || "Unknown error";
        const errorDetails = error.type || error.code || "No additional details";
        // Provide more specific error messages
        let userFriendlyError = "Failed to create checkout session";
        let statusCode = 500;
        if (error.type === "StripeInvalidRequestError") {
            userFriendlyError = error.message || "Invalid payment request. Please check your cart items.";
            statusCode = 400;
        }
        else if (error.type === "StripeAPIError") {
            userFriendlyError = "Payment service error. Please try again later.";
            statusCode = 503;
        }
        else if (error.type === "StripeAuthenticationError") {
            userFriendlyError = "Payment authentication failed. Please contact support.";
            statusCode = 500;
        }
        else if (error.message) {
            // Use the actual Stripe error message if available
            userFriendlyError = error.message;
        }
        // Log the full error for debugging
        logger.error("Sending error response:", {
            error: userFriendlyError,
            message: errorMessage,
            type: error.type,
            code: error.code,
            statusCode,
        });
        res.status(statusCode).json(Object.assign({ error: userFriendlyError, message: errorMessage, details: errorDetails, type: error.type, code: error.code }, (errorMessage.includes("No API key") ||
            errorMessage.includes("Invalid API Key")
            ? {
                hint: "Please check that stripe.secret_key is set in Firebase Functions config",
            }
            : {})));
    }
});
/**
 * Create Stripe Connect account on first item listing
 * This function is called when a user lists their first item
 *
 * Request body:
 * {
 *   item: MarketplaceItemType
 * }
 */
exports.createStripeAccountOnFirstItem = functions.https.onRequest(async (req, res) => {
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
        const { item } = req.body;
        if (!item || !item.sellerId) {
            res
                .status(400)
                .json({ error: "Missing required fields: item with sellerId" });
            return;
        }
        const sellerId = item.sellerId;
        // Check if user already has a Stripe account
        const sellerDoc = await admin
            .firestore()
            .collection("users")
            .doc(sellerId)
            .get();
        if (!sellerDoc.exists) {
            res.status(404).json({ error: "Seller not found" });
            return;
        }
        const sellerData = sellerDoc.data();
        // If seller already has a Stripe account, skip creation
        if ((sellerData === null || sellerData === void 0 ? void 0 : sellerData.stripeAccountId) || (sellerData === null || sellerData === void 0 ? void 0 : sellerData.stripe_account_id)) {
            logger.info(`Seller ${sellerId} already has Stripe account`);
            res.json({
                success: true,
                message: "Stripe account already exists",
                stripeAccountId: (sellerData === null || sellerData === void 0 ? void 0 : sellerData.stripeAccountId) || (sellerData === null || sellerData === void 0 ? void 0 : sellerData.stripe_account_id),
            });
            return;
        }
        // Create Stripe Connect account
        const account = await stripe.accounts.create({
            type: "express",
            country: "US",
            email: (sellerData === null || sellerData === void 0 ? void 0 : sellerData.email) || "",
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        });
        // Create account link for onboarding
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${req.headers.origin || "https://anithrift.com"}/settings/stripe-account?refresh=true`,
            return_url: `${req.headers.origin || "https://anithrift.com"}/settings/stripe-account?success=true`,
            type: "account_onboarding",
        });
        // Update user document with Stripe account ID
        await admin.firestore().collection("users").doc(sellerId).update({
            stripeAccountId: account.id,
            stripe_account_id: account.id,
            stripeOnboardingComplete: false,
            isSeller: true,
        });
        res.json({
            success: true,
            stripeAccountId: account.id,
            onboardingUrl: accountLink.url,
            message: "Stripe account created. User needs to complete onboarding.",
        });
    }
    catch (error) {
        logger.error("Error creating Stripe account:", error);
        res.status(500).json({
            error: "Failed to create Stripe account",
            message: error.message,
        });
    }
});
/**
 * Complete Stripe onboarding (called from StripeOnboardingForm)
 *
 * Request body:
 * {
 *   userId: string
 * }
 */
exports.completeStripeOnboarding = functions.https.onRequest(async (req, res) => {
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
        const { userId } = req.body;
        if (!userId) {
            res.status(400).json({ error: "Missing required field: userId" });
            return;
        }
        // Get user's Stripe account ID
        const userDoc = await admin
            .firestore()
            .collection("users")
            .doc(userId)
            .get();
        if (!userDoc.exists) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const userData = userDoc.data();
        const stripeAccountId = (userData === null || userData === void 0 ? void 0 : userData.stripeAccountId) || (userData === null || userData === void 0 ? void 0 : userData.stripe_account_id);
        if (!stripeAccountId) {
            res.status(400).json({
                error: "User does not have a Stripe account. Please list an item first.",
            });
            return;
        }
        // Create account link for onboarding
        const accountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${req.headers.origin || "https://anithrift.com"}/settings/stripe-account?refresh=true`,
            return_url: `${req.headers.origin || "https://anithrift.com"}/settings/stripe-account?success=true`,
            type: "account_onboarding",
        });
        res.json({
            url: accountLink.url,
        });
    }
    catch (error) {
        logger.error("Error creating Stripe onboarding link:", error);
        res.status(500).json({
            error: "Failed to create onboarding link",
            message: error.message,
        });
    }
});
/**
 * Fetch Stripe account info for a user
 *
 * Query params:
 *   userId: string
 */
exports.fetchStripeAccountInfo = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
    if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    try {
        const userId = req.query.userId;
        if (!userId) {
            res
                .status(400)
                .json({ error: "Missing required query parameter: userId" });
            return;
        }
        // Get user's Stripe account ID
        const userDoc = await admin
            .firestore()
            .collection("users")
            .doc(userId)
            .get();
        if (!userDoc.exists) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const userData = userDoc.data();
        const stripeAccountId = (userData === null || userData === void 0 ? void 0 : userData.stripeAccountId) || (userData === null || userData === void 0 ? void 0 : userData.stripe_account_id);
        if (!stripeAccountId) {
            res.json({
                hasAccount: false,
                message: "No Stripe account found",
            });
            return;
        }
        // Fetch account details from Stripe
        const account = await stripe.accounts.retrieve(stripeAccountId);
        const balance = await stripe.balance.retrieve({
            stripeAccount: stripeAccountId,
        });
        // Get charges count
        const charges = await stripe.charges.list({
            limit: 100,
        }, {
            stripeAccount: stripeAccountId,
        });
        res.json({
            hasAccount: true,
            accountId: stripeAccountId,
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            details_submitted: account.details_submitted,
            balance: balance.available,
            transaction_count: charges.data.length,
        });
    }
    catch (error) {
        logger.error("Error fetching Stripe account info:", error);
        res.status(500).json({
            error: "Failed to fetch Stripe account info",
            message: error.message,
        });
    }
});
/**
 * Stripe Webhook Handler
 * Handles checkout.session.completed events to update order status
 *
 * Note: This webhook needs to be configured in Stripe Dashboard:
 * 1. Go to Stripe Dashboard > Developers > Webhooks
 * 2. Add endpoint: https://us-central1-anithrift-e77a9.cloudfunctions.net/stripeWebhook
 * 3. Select event: checkout.session.completed
 * 4. Copy the webhook signing secret and set it: firebase functions:config:set stripe.webhook_secret="whsec_..."
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    var _a;
    const sig = req.headers["stripe-signature"];
    const webhookSecret = ((_a = functions.config().stripe) === null || _a === void 0 ? void 0 : _a.webhook_secret) || "";
    if (!webhookSecret) {
        logger.error("Stripe webhook secret not configured");
        res.status(500).json({ error: "Webhook secret not configured" });
        return;
    }
    let event;
    try {
        // For Firebase Functions, req.body is already parsed, but we need raw body for webhook verification
        // Use req.rawBody if available (Firebase Functions v1), otherwise stringify
        const rawBody = req.rawBody
            ? Buffer.from(req.rawBody)
            : typeof req.body === "string"
                ? req.body
                : JSON.stringify(req.body);
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    }
    catch (err) {
        logger.error(`Webhook signature verification failed: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const sessionId = session.id;
        try {
            // Find orders with this session ID and update their status
            const ordersRef = admin.firestore().collection("orders");
            const ordersSnapshot = await ordersRef
                .where("stripeSessionId", "==", sessionId)
                .get();
            if (!ordersSnapshot.empty) {
                const updatePromises = ordersSnapshot.docs.map(async (orderDoc) => {
                    const orderId = orderDoc.id;
                    const orderData = orderDoc.data();
                    const buyerId = orderData.buyerId;
                    // Update order status to completed
                    await orderDoc.ref.update({
                        status: "completed",
                        paymentStatus: "paid",
                        completedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                    // Also update in user's orders subcollection
                    if (buyerId) {
                        const userOrderRef = admin
                            .firestore()
                            .collection("users")
                            .doc(buyerId)
                            .collection("orders")
                            .doc(orderId);
                        const userOrderDoc = await userOrderRef.get();
                        if (userOrderDoc.exists) {
                            await userOrderRef.update({
                                status: "completed",
                                paymentStatus: "paid",
                                completedAt: admin.firestore.FieldValue.serverTimestamp(),
                            });
                        }
                    }
                    logger.info(`Order ${orderId} marked as completed for session ${sessionId}`);
                });
                await Promise.all(updatePromises);
            }
            else {
                logger.warn(`No orders found for session ${sessionId}`);
            }
            res.json({ received: true });
        }
        catch (error) {
            logger.error("Error processing webhook:", error);
            res.status(500).json({ error: error.message });
        }
    }
    else {
        // Return a response to acknowledge receipt of the event
        res.json({ received: true });
    }
});
//# sourceMappingURL=index.js.map
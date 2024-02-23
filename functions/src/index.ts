/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import axios from "axios";

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
const { defineSecret } = require('firebase-functions/params');

let Ebay = require('ebay-node-api')

const ebayClientSecret = defineSecret('EBAY_CLIENT_SECRET');
const ebayAuthToken = defineSecret('EBAY_AUTH_TOKEN');

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = onRequest({ secrets: [ebayAuthToken] }, async(request, response)  => {
    const oauthToken = ebayAuthToken;
  logger.info("Hello logs!", {structuredData: true});

  try {
    // Adjust this URL to match your actual backend endpoint
    const resp = await axios.get(
      "https://api.ebay.com/buy/browse/v1/item_summary/search?q=drone&limit=3",
      {
        headers: {
          Authorization: `Bearer ${oauthToken}`,
          "Content-Type": "application/json",
          // Include additional headers as required by the eBay API
        },
      }
    );
    if (!resp.data) throw new Error("Failed to fetch data");
    // const data = await response.json();

    // Assuming the response format matches eBay's, adjust as necessary
    // const items =
    //   data.findItemsByKeywordsResponse[0].searchResult[0].item || [];
      response.send(resp.data);

    // console.log("First ten items from eBay search:", items.slice(0, 10));
  } catch (error) {
    console.error("Error fetching eBay search results: ", error);
    response.send(error);
  }

});


const getAccessToken =  async (ebayClientSecret: string) => {
  let ebay = new Ebay({
    clientID: 'Anithrif-Anithrif-PRD-b7fc0fe97-09fe34fa',
    clientSecret: ebayClientSecret,
    body: {
        grant_type: 'client_credentials',
    //you may need to define the oauth scope
    scope: 'https://api.ebay.com/oauth/api_scope'
    }
  });

  return ebay.getAccessToken().then((data: any) => {
    return data;
  }, (error: Error) => {
    console.log(error);
  });
}

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
 
exports.searchEbayItems = onRequest({ secrets: [ebayClientSecret] },async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  console.log('body', req.body);
  
  try {
    let parsedBody = await JSON.parse(req.body);
    console.log(parsedBody, parsedBody);
    let token = await getAccessToken(ebayClientSecret);
  
    const endpoint = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${parsedBody.query}`;
    const headers = {
          Authorization: `Bearer ${token.access_token}`,
          "Content-Type": "application/json",
          "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
          "Accept-Language": "en-US",
          "Accept-Charset": "utf-8",
          "Accept": "application/json",
          "LegacyUse": "true"
        };
    const response = await axios.get(endpoint, { headers: headers });
    // Process and send the response data
    res.status(200).send(response.data);
  } catch (error) {
    console.log(JSON.stringify(error));
    res.status(500).send({ error: error, message: 'Failed to fetch data from eBay' });
  }
});



  // const ip = req.ip;
  // if (whitelistedIPs.includes(ip as string)) {
  //   // IP is whitelisted, proceed with your function's logic
  //   res.set("Access-Control-Allow-Origin", "*");
  // } else {
  //   // IP is not whitelisted, send an appropriate response
  //   res.status(403).send('Access denied');
  // }

  
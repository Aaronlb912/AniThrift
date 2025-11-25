import axios from "axios";

export interface ShippingAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface Parcel {
  length: number; // inches
  width: number; // inches
  height: number; // inches
  weight: number; // oz
}

export interface ShippoRate {
  object_id: string;
  amount: string;
  currency: string;
  provider: string;
  servicelevel: {
    name: string;
    token: string;
  };
  estimated_days: number;
  duration_terms?: string;
}

export interface ShippoRateResponse {
  rates: ShippoRate[];
  messages?: any[];
}

/**
 * Calculate shipping rates using Shippo API via Cloud Function
 * @param fromAddress - Seller's shipping address
 * @param toAddress - Buyer's shipping address
 * @param parcel - Package dimensions and weight
 * @returns Array of available shipping rates
 */
export const calculateShippingRates = async (
  fromAddress: ShippingAddress,
  toAddress: ShippingAddress,
  parcel: Parcel
): Promise<ShippoRate[]> => {
  try {
    const response = await axios.post(
      "https://us-central1-anithrift-e77a9.cloudfunctions.net/calculateShippoRates",
      {
        fromAddress,
        toAddress,
        parcel,
      }
    );

    if (response.data.rates && response.data.rates.length > 0) {
      return response.data.rates;
    }

    return [];
  } catch (error) {
    console.error("Error calculating shipping rates:", error);
    throw new Error("Failed to calculate shipping rates. Please try again.");
  }
};

/**
 * Create a shipping label using Shippo API via Cloud Function
 * @param rateId - The selected rate ID from Shippo
 * @param orderId - The order ID
 * @param metadata - Additional metadata for the shipment
 * @returns Shipping label information
 */
export const createShippingLabel = async (
  rateId: string,
  orderId: string,
  metadata?: Record<string, any>
): Promise<any> => {
  try {
    const response = await axios.post(
      "https://us-central1-anithrift-e77a9.cloudfunctions.net/createShippoLabel",
      {
        rateId,
        orderId,
        metadata,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating shipping label:", error);
    throw new Error("Failed to create shipping label. Please try again.");
  }
};

/**
 * Get tracking information for a shipment
 * @param trackingNumber - The tracking number
 * @param carrier - The carrier name (e.g., "usps", "ups", "fedex")
 * @returns Tracking information
 */
export const getTrackingInfo = async (
  trackingNumber: string,
  carrier: string
): Promise<any> => {
  try {
    const response = await axios.post(
      "https://us-central1-anithrift-e77a9.cloudfunctions.net/getShippoTracking",
      {
        trackingNumber,
        carrier,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error getting tracking info:", error);
    throw new Error("Failed to get tracking information. Please try again.");
  }
};

/**
 * Convert weight tier to actual weight in ounces
 */
export const getWeightFromTier = (tierId: string): number => {
  const tierMap: Record<string, number> = {
    "up-to-4oz": 4,
    "up-to-8oz": 8,
    "up-to-16oz": 16,
    "up-to-32oz": 32,
    "up-to-48oz": 48,
    "up-to-64oz": 64,
  };

  return tierMap[tierId] || 16; // Default to 16 oz if not found
};

/**
 * Estimate parcel dimensions based on weight tier
 */
export const getParcelDimensions = (weightTierId: string): Parcel => {
  const weight = getWeightFromTier(weightTierId);
  
  // Estimate dimensions based on weight
  // These are rough estimates - sellers should be able to override
  if (weight <= 4) {
    return { length: 6, width: 4, height: 1, weight };
  } else if (weight <= 8) {
    return { length: 9, width: 6, height: 2, weight };
  } else if (weight <= 16) {
    return { length: 10, width: 8, height: 3, weight };
  } else if (weight <= 32) {
    return { length: 12, width: 10, height: 4, weight };
  } else if (weight <= 48) {
    return { length: 14, width: 12, height: 6, weight };
  } else {
    return { length: 16, width: 14, height: 8, weight };
  }
};


export type ShippingPayer = "buyer" | "seller";

export interface ShippingWeightTier {
  id: string;
  label: string;
  maxWeightOz: number;
  description: string;
}

export interface ShippingService {
  id: string;
  name: string;
  carrier: string;
  price: number;
  maxWeightOz: number;
  speed: string;
  notes?: string;
}

export const shippingWeightTiers: ShippingWeightTier[] = [
  {
    id: "up-to-4oz",
    label: "Up to 4 oz",
    maxWeightOz: 4,
    description: "Lightweight accessories, pins, keychains",
  },
  {
    id: "up-to-8oz",
    label: "5 - 8 oz",
    maxWeightOz: 8,
    description: "Single manga volume, card packs",
  },
  {
    id: "up-to-16oz",
    label: "9 - 16 oz",
    maxWeightOz: 16,
    description: "Figures, plush under 1 lb",
  },
  {
    id: "up-to-32oz",
    label: "17 - 32 oz",
    maxWeightOz: 32,
    description: "Small bundles, lightweight apparel",
  },
  {
    id: "up-to-48oz",
    label: "33 - 48 oz",
    maxWeightOz: 48,
    description: "Multiple volumes, mid-size figures",
  },
  {
    id: "up-to-64oz",
    label: "49 - 64 oz",
    maxWeightOz: 64,
    description: "Collector boxes, larger plush",
  },
];

export const shippingServices: ShippingService[] = [
  {
    id: "usps-first-class",
    name: "USPS First-Class",
    carrier: "USPS",
    price: 4.49,
    maxWeightOz: 16,
    speed: "2-5 business days",
    notes: "Best for lightweight packages under 1 lb",
  },
  {
    id: "usps-priority",
    name: "USPS Priority",
    carrier: "USPS",
    price: 8.99,
    maxWeightOz: 64,
    speed: "1-3 business days",
    notes: "Includes tracking and $100 insurance",
  },
  {
    id: "ups-ground",
    name: "UPS Ground",
    carrier: "UPS",
    price: 9.49,
    maxWeightOz: 64,
    speed: "1-5 business days",
    notes: "Dimensional pricing for larger items",
  },
  {
    id: "fedex-home",
    name: "FedEx Home Delivery",
    carrier: "FedEx",
    price: 10.25,
    maxWeightOz: 64,
    speed: "1-5 business days",
    notes: "Evening and weekend delivery in many areas",
  },
  {
    id: "ship-yourself",
    name: "Ship on Your Own",
    carrier: "Custom",
    price: 0,
    maxWeightOz: 1000,
    speed: "Set your own rate",
    notes: "Purchase and upload your own tracking info",
  },
];

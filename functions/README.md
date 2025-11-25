# Firebase Cloud Functions

## Setup

### Install Dependencies

```bash
cd functions
npm install
```

### Deploy Functions

```bash
npm run build
firebase deploy --only functions
```

## Available Functions

- `calculateShippoRates` - Calculates shipping rates
- `createShippoLabel` - Creates shipping labels
- `getShippoTracking` - Retrieves tracking information
- `createCheckoutSession` - Creates Stripe checkout session with shipping


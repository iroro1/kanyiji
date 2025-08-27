# Shipping Module - Gig Logistics Integration

This shipping module integrates with Gig Logistics shipping APIs to provide comprehensive shipping functionality for the Kanyiji marketplace.

## Features

### 🚚 Shipping Calculator

- Calculate shipping costs based on origin, destination, and package details
- Support for multiple packages with different dimensions and weights
- Real-time rate calculation using Gig Logistics APIs
- Address validation and error handling

### 📦 Shipment Tracking

- Real-time shipment tracking using tracking numbers
- Detailed tracking history with status updates
- Current location and estimated delivery information
- Visual timeline of shipment progress

### 🗂️ Shipment Manager

- Create new shipments with selected shipping rates
- View and manage existing shipments
- Cancel shipments when needed
- Comprehensive shipment details and history

## Components

### Core Components

1. **ShippingDashboard** (`/src/components/shipping/ShippingDashboard.tsx`)

   - Main dashboard with tabbed navigation
   - Integrates all shipping functionality
   - Quick stats and overview

2. **ShippingCalculator** (`/src/components/shipping/ShippingCalculator.tsx`)

   - Calculate shipping rates
   - Address input forms (origin and destination)
   - Package management
   - Rate selection

3. **ShipmentTracker** (`/src/components/shipping/ShipmentTracker.tsx`)

   - Track shipments by tracking number
   - Real-time status updates
   - Visual tracking timeline

4. **ShipmentManager** (`/src/components/shipping/ShipmentManager.tsx`)

   - Create and manage shipments
   - View shipment history
   - Cancel shipments

5. **AddressForm** (`/src/components/shipping/AddressForm.tsx`)
   - Reusable address input form
   - Validation and error handling
   - Nigerian states dropdown

### Services

1. **GigLogisticsService** (`/src/services/gigLogisticsService.ts`)
   - Handles all API communication with Gig Logistics
   - Rate calculation, shipment creation, tracking
   - Error handling and response transformation

### Types

1. **Shipping Types** (`/src/types/shipping.ts`)
   - Comprehensive TypeScript interfaces
   - Address, package, shipment, and tracking types
   - API request/response interfaces

### Utilities

1. **Shipping Utilities** (`/src/lib/shipping.ts`)
   - Address and package validation
   - Weight and dimension calculations
   - Currency formatting
   - Delivery date estimation

## Installation & Setup

### 1. Environment Variables

Create a `.env.local` file in your project root:

```env
# Gig Logistics API Credentials
GIG_LOGISTICS_API_KEY=your_api_key_here
GIG_LOGISTICS_API_SECRET=your_api_secret_here
GIG_LOGISTICS_BASE_URL=https://api.giglogistics.com/v1
GIG_LOGISTICS_MERCHANT_ID=your_merchant_id_here
```

### 2. Update API Credentials

Replace the mock credentials in the components with environment variables:

```typescript
// In each component, replace:
const mockCredentials = {
  apiKey: "your_api_key_here",
  apiSecret: "your_api_secret_here",
  baseUrl: "https://api.giglogistics.com/v1",
  merchantId: "your_merchant_id_here",
};

// With:
const credentials = {
  apiKey: process.env.NEXT_PUBLIC_GIG_LOGISTICS_API_KEY!,
  apiSecret: process.env.NEXT_PUBLIC_GIG_LOGISTICS_API_SECRET!,
  baseUrl: process.env.NEXT_PUBLIC_GIG_LOGISTICS_BASE_URL!,
  merchantId: process.env.NEXT_PUBLIC_GIG_LOGISTICS_MERCHANT_ID!,
};
```

### 3. Route Configuration

The shipping module is accessible at `/shipping` route:

```typescript
// /src/app/shipping/page.tsx
import ShippingDashboard from "@/components/shipping/ShippingDashboard";

export default function ShippingPage() {
  return <ShippingDashboard />;
}
```

## Usage

### Basic Shipping Calculation

```typescript
import { ShippingCalculator } from "@/components/shipping";

function MyComponent() {
  const handleRateSelect = (rate) => {
    console.log("Selected rate:", rate);
  };

  return <ShippingCalculator onRateSelect={handleRateSelect} />;
}
```

### Shipment Tracking

```typescript
import { ShipmentTracker } from "@/components/shipping";

function TrackingComponent() {
  return <ShipmentTracker />;
}
```

### Shipment Management

```typescript
import { ShipmentManager } from "@/components/shipping";

function ManagementComponent() {
  return <ShipmentManager merchantId="your_merchant_id" />;
}
```

## API Integration

### Gig Logistics API Endpoints

The service integrates with these Gig Logistics endpoints:

- `POST /shipping/rates` - Get shipping rates
- `POST /shipping/shipments` - Create shipment
- `GET /shipping/track/{trackingNumber}` - Track shipment
- `POST /shipping/shipments/{id}/cancel` - Cancel shipment
- `GET /shipping/shipments` - Get shipment history

### Response Handling

All API responses are transformed to match our internal types:

```typescript
// Example rate transformation
const rates: ShippingRate[] = response.rates.map((rate: any) => ({
  id: rate.id || rate.service_id,
  serviceName: rate.service_name || rate.name,
  deliveryTime: rate.delivery_time || rate.estimated_delivery,
  price: parseFloat(rate.price) || 0,
  currency: rate.currency || "NGN",
  estimatedDays: parseInt(rate.estimated_days) || 0,
  trackingAvailable: rate.tracking_available || false,
}));
```

## Validation

### Address Validation

```typescript
import { validateShippingAddress } from "@/lib/shipping";

const validation = validateShippingAddress(address);
if (!validation.isValid) {
  console.log("Validation errors:", validation.errors);
}
```

### Package Validation

```typescript
import { validatePackage } from "@/lib/shipping";

const validation = validatePackage(package);
if (!validation.isValid) {
  console.log("Package errors:", validation.errors);
}
```

## Styling

The module uses Tailwind CSS with a consistent design system:

- **Primary Colors**: Uses `primary-500` and `primary-600` for main actions
- **Status Colors**:
  - Green for delivered/success
  - Blue for in-transit
  - Yellow for pending
  - Red for errors/cancelled
- **Responsive Design**: Mobile-first approach with responsive grids
- **Icons**: Lucide React icons for consistent visual language

## Error Handling

Comprehensive error handling throughout the module:

- API error responses
- Validation errors
- Network failures
- User input validation

## Testing

### Mock Data

For development and testing, the module includes mock credentials and sample data:

```typescript
// Mock shipment data
const mockShipment = {
  id: "1",
  trackingNumber: "GL123456789",
  status: { code: "in_transit", description: "In Transit" },
  // ... other fields
};
```

### API Testing

Test the API integration by:

1. Setting up valid Gig Logistics credentials
2. Creating test shipments
3. Tracking shipments with valid tracking numbers
4. Testing error scenarios

## Customization

### Adding New Shipping Carriers

To add support for additional shipping carriers:

1. Create new service classes (e.g., `DHLService`, `FedExService`)
2. Implement the same interface as `GigLogisticsService`
3. Update the component to use the appropriate service

### Custom Validation Rules

Modify validation in `/src/lib/shipping.ts`:

```typescript
export function validateShippingAddress(address: ShippingAddress) {
  const errors: string[] = [];

  // Add custom validation rules
  if (address.state === "Lagos" && address.city === "Victoria Island") {
    // Special validation for Victoria Island
  }

  return { isValid: errors.length === 0, errors };
}
```

## Performance Considerations

- API responses are cached where appropriate
- Lazy loading of shipment history
- Debounced input validation
- Optimized re-renders with React hooks

## Security

- API credentials stored in environment variables
- Input sanitization and validation
- HTTPS-only API communication
- Rate limiting considerations

## Troubleshooting

### Common Issues

1. **API Authentication Failed**

   - Check API credentials in environment variables
   - Verify API key permissions
   - Check network connectivity

2. **Validation Errors**

   - Ensure all required fields are filled
   - Check field format (email, phone, etc.)
   - Verify package dimensions are positive numbers

3. **Tracking Not Found**
   - Verify tracking number format
   - Check if shipment exists in Gig Logistics system
   - Ensure tracking number is not expired

### Debug Mode

Enable debug logging by setting:

```typescript
const DEBUG = process.env.NODE_ENV === "development";
if (DEBUG) {
  console.log("API Request:", request);
  console.log("API Response:", response);
}
```

## Support

For issues related to:

- **Gig Logistics API**: Contact Gig Logistics support
- **Module Implementation**: Check this README and component documentation
- **Customization**: Review the customization section above

## License

This shipping module is part of the Kanyiji marketplace project and follows the same licensing terms.

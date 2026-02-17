# DHL MyDHL API Integration Setup

## Credentials Received from DHL

**USERNAME:** `apR3iY3aQ0lN9u`  
**PASSWORD:** `Q!6jA!0kD$4wW@2u`

**Note:** These are authorization credentials for API access, not login credentials for the MyDHL Developer Portal.

## Environment Variables

Add the following to your `.env` file:

```env
# DHL MyDHL API Credentials
DHL_USERNAME=apR3iY3aQ0lN9u
DHL_PASSWORD=Q!6jA!0kD$4wW@2u
DHL_ACCOUNT_NUMBER=365822501
DHL_API_BASE_URL=https://express.api.dhl.com/mydhlapi
```

**Account Number:** `365822501`

## Important Notes from DHL

1. **Product Codes:** Pay attention to product codes (N, P, D) when making API calls
2. **Account Numbers:** Use correct Export/Import account numbers
3. **Commodity (HS) Codes:** Ensure products have proper Harmonized System (HS) codes

## How It Works

1. **OAuth Authentication:** The service first obtains an access token using your username/password
2. **Token Caching:** Tokens are cached to avoid requesting on every API call
3. **Rate Fetching:** Uses the access token to fetch real-time shipping rates for international orders

## API Endpoints Used

- **Auth:** `POST /auth/accesstoken` - Get OAuth access token
- **Rates:** `POST /rates` - Get shipping rates for international destinations

## Testing

The DHL service will automatically:
- Use real-time DHL rates when credentials are configured
- Fall back to manual calculator (₦14,500/kg) if credentials are missing
- Cache tokens to minimize API calls
- Handle authentication errors gracefully

## Support

Refer to the MyDHL API Integration Manual provided by DHL for:
- Detailed API documentation
- Product code specifications
- Account number requirements
- HS code requirements

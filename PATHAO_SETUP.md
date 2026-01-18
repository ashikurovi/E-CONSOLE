# Pathao Courier Integration Setup

This document outlines the setup and usage of the Pathao courier integration in the SquadCart Console.

## Overview

The Pathao integration allows you to:
- Create courier orders with automatic delivery tracking
- Manage multiple store locations
- View and track all orders
- Browse available delivery locations (cities, zones, areas)
- Calculate delivery prices based on location and item details

## API Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```env
VITE_PATHAO_CLIENT_ID=pnel77jdKB
VITE_PATHAO_CLIENT_SECRET=YMx6Rf6Dls4UoFNizVm2cMlhS5i0ijQacxOtxwlU
```

### API Endpoints

Base URL: `https://hermes-api.pathao.com/api/v1`

The integration uses OAuth 2.0 Client Credentials flow:
- Token endpoint: `/issue-token`
- Access tokens are automatically managed and refreshed

## Features

### 1. Create Order
Create new courier orders with the following details:
- Store selection (from your registered stores)
- Merchant order ID
- Recipient information (name, phone, address)
- Delivery location (city, zone, area)
- Item details (type, quantity, weight, description)
- Delivery type (Normal/On-Demand)
- Amount to collect (COD)
- Special instructions

### 2. Bulk Orders
Create multiple orders at once using CSV file upload:
- Download CSV template with proper format
- Fill in order details in spreadsheet
- Upload CSV file for batch processing
- Review parsed orders before submission
- Get detailed results showing successful and failed orders
- Supports all order fields available in single order creation

### 3. View Orders
- View all your orders in a table format
- Search specific orders by Consignment ID
- View detailed order information including status

### 4. Manage Stores
- View all registered stores
- Create new store locations with:
  - Store name and contact information
  - Store address with city/zone/area
  
**Note:** You must create at least one store before creating orders.

### 5. Locations
Browse available delivery locations:
- View all available cities
- Explore zones within selected cities
- View areas within selected zones
- Interactive navigation through location hierarchy

### 6. Price Calculator
Calculate delivery charges before placing orders:
- Select delivery location (city, zone)
- Choose delivery type (Normal/On-Demand)
- Specify item type (Document/Parcel)
- Enter item weight
- Get instant price estimate with breakdown

## File Structure

```
src/
├── features/
│   └── pathao/
│       └── pathaoApiSlice.js          # RTK Query API slice for Pathao
├── pages/
│   └── pathao/
│       ├── index.jsx                   # Main Pathao page with tabs
│       └── components/
│           ├── CreateOrder.jsx         # Create new order form
│           ├── BulkCreateOrder.jsx     # Bulk order creation via CSV
│           ├── ManageStores.jsx        # Store management
│           ├── ViewOrders.jsx          # View and search orders
│           ├── Locations.jsx           # Browse delivery locations
│           └── PriceCalculator.jsx     # Calculate delivery prices
```

## Implementation Details

### Authentication
- Uses OAuth 2.0 Client Credentials flow
- Access tokens are cached and automatically refreshed
- Token expiry set to 55 minutes (1 hour minus 5 min safety margin)

### API Integration
- Built with Redux Toolkit Query (RTK Query)
- Automatic error handling and retries
- Optimistic updates with cache invalidation
- Type-safe API calls

### Available Endpoints

#### Location APIs
- `GET /countries/1/city-list` - Get all cities
- `GET /cities/:cityId/zone-list` - Get zones by city
- `GET /zones/:zoneId/area-list` - Get areas by zone

#### Store APIs
- `GET /stores` - Get all stores
- `POST /stores` - Create new store

#### Order APIs
- `GET /orders` - Get all orders
- `POST /orders` - Create new order
- `POST /orders/bulk` - Create multiple orders at once
- `GET /orders/:consignmentId` - View specific order

#### Utility APIs
- `POST /merchant/price-plan` - Calculate delivery price

## Usage

### Creating Your First Order

1. **Set up a Store** (First time only)
   - Go to "Manage Stores" tab
   - Click "Add New Store"
   - Fill in store details (name, contact, address, location)
   - Submit the form

2. **Create an Order**
   - Go to "Create Order" tab
   - Select your store from dropdown
   - Enter merchant order ID
   - Fill in recipient information
   - Select delivery location (city → zone → area)
   - Enter item details and COD amount
   - Add special instructions if needed
   - Submit the order

3. **Track Orders**
   - Go to "View Orders" tab
   - View all orders in the table
   - Search by Consignment ID for specific orders

### Creating Bulk Orders

1. **Download CSV Template**
   - Go to "Bulk Orders" tab
   - Click "Download CSV Template" button
   - Open the template in Excel or Google Sheets

2. **Fill in Order Details**
   - Add your order details row by row
   - Ensure all required fields are filled
   - Use correct city, zone, and area IDs (check Locations tab)
   - delivery_type: 48 (Normal) or 12 (On-Demand)
   - item_type: 1 (Document) or 2 (Parcel)

3. **Upload and Submit**
   - Save your CSV file
   - Upload the file using the upload area
   - Review the parsed orders in the preview table
   - Click "Create X Orders" to submit
   - View results showing successful and failed orders

**CSV Format Tips:**
- Keep column headers exactly as in template
- Use numeric IDs for store, city, zone, and area
- Phone numbers should be in format: 01XXXXXXXXX
- Amount should be numeric without currency symbol
- Text fields with commas should be in quotes

### Calculating Delivery Price

1. Go to "Price Calculator" tab
2. Select city and zone
3. Choose delivery type and item type
4. Enter item weight
5. Click "Calculate Price"
6. View estimated charges with breakdown

## Error Handling

The integration handles common errors:
- **401 Unauthorized**: Invalid credentials or expired token
- **429 Too Many Requests**: Rate limit exceeded
- **Network errors**: Automatic retry with exponential backoff

Error messages are displayed via toast notifications.

## Development Notes

### Adding New Endpoints

To add new Pathao API endpoints:

1. Add the endpoint definition in `pathaoApiSlice.js`:
```javascript
newEndpoint: builder.query({
  query: (params) => ({
    url: '/your-endpoint',
    method: 'GET',
  }),
}),
```

2. Export the generated hook:
```javascript
export const { useNewEndpointQuery } = pathaoApiSlice;
```

3. Use in components:
```javascript
const { data, isLoading } = useNewEndpointQuery(params);
```

## API Reference

For detailed API documentation, visit:
[Pathao Merchant Developer API](https://merchant.pathao.com/courier/developer-api)

## Support

For API issues or integration support:
- Contact Pathao Merchant Support
- Email: merchant@pathao.com
- Website: https://merchant.pathao.com

## Notes

- Ensure your Pathao merchant account is active
- Verify API credentials are correct in environment variables
- Test in development before deploying to production
- Monitor API usage to avoid rate limits
- Keep access tokens secure and never commit to version control

# SquadCart Console - Feature List

## Application Overview

SquadCart Console is a comprehensive E-commerce management platform built with React, Redux Toolkit, and Tailwind CSS. It provides merchants with a complete solution for managing products, orders, customers, and courier integrations with role-based access control and real-time analytics.

---

## Core Features

### 1. Authentication & Authorization

#### User Authentication
- **User Login/Registration**: Secure authentication with JWT tokens
- **Forgot Password**: Password recovery with email verification
- **Reset Password**: Secure password reset functionality
- **Super Admin Portal**: Separate admin authentication system

#### Permission Management
- **Role-Based Access Control (RBAC)**: Granular permissions for different user roles
- **Feature Permissions**: 
  - Products Management
  - Orders Management
  - Customers Management
  - Inventory Management
  - Categories Management
  - Reports & Analytics
  - Settings & Configuration
  - Staff Management
  - Banners & Promocodes
  - Notifications
  - Courier Integrations (Pathao, Steadfast)
  - Privacy & Legal Pages

---

### 2. Dashboard & Analytics

#### Dashboard Overview
- **Welcome Widget**: Personalized greeting with store status
- **KPI Cards**:
  - E-commerce Revenue (with growth percentage)
  - New Customers Count
  - Repeat Purchase Rate
  - Average Order Value
- **Income Growth Chart**: 7-day revenue trend visualization
- **Payment Breakdown**: Radial chart showing paid vs unpaid orders
- **Recent Orders Table**: Quick view of latest transactions
- **Best Sellers List**: Top-selling products with sales count
- **Top Customers**: Weekly top customers by order count
- **Period Selector**: View all-time or custom time range data

---

### 3. Product Management

#### Categories
- Create, read, update, and delete product categories
- Category hierarchy and organization
- Permission-controlled access

#### Products
- **Product CRUD**: Full product lifecycle management
- **Product Details**:
  - Name, description, and specifications
  - Pricing and SKU
  - Multiple product images
  - Category assignment
  - Stock status
- **Bulk Operations**: Manage multiple products simultaneously
- **Search & Filter**: Find products quickly

#### Inventory Management
- Real-time stock tracking
- Inventory level monitoring
- Stock alerts and notifications
- Multi-warehouse support (via branch locations)

---

### 4. Customer Management

#### Customer Database
- **Customer Profiles**:
  - Personal information (name, email, phone)
  - Order history
  - Purchase patterns
  - Customer status (active/inactive)
- **Customer Analytics**:
  - Lifetime value tracking
  - Repeat purchase behavior
  - Customer segmentation
- **Customer Creation & Editing**: Add and manage customer records

---

### 5. Order Management

#### Orders Module
- **Order Tracking**: Complete order lifecycle management
- **Order Details**:
  - Order ID and timestamp
  - Customer information
  - Product details and quantities
  - Payment status
  - Delivery status
  - Special instructions
- **Order Items View**: Detailed breakdown of order line items
- **Order Status Management**: Update order progress
- **Search & Filter**: Advanced order search capabilities
- **Order History**: Complete audit trail

---

### 6. Courier Integration

### 6.1 Pathao Courier Integration

#### Features
- **Order Creation**:
  - Create single courier orders
  - Automatic delivery tracking
  - Multiple store location support
  - Merchant order ID linking
  - Recipient information management
  - Delivery location selection (city → zone → area)
  - Item details (type, quantity, weight, description)
  - Delivery type selection (Normal/On-Demand)
  - Cash on Delivery (COD) amount
  - Special delivery instructions

- **Bulk Order Creation**:
  - CSV template download
  - Batch order upload (up to 500 orders)
  - Order validation and preview
  - Detailed success/failure reporting
  - Support for all order fields

- **Store Management**:
  - View all registered stores
  - Create new store locations
  - Store contact information
  - Store address with location mapping
  - Store-based order filtering

- **Order Tracking**:
  - View all orders in table format
  - Search by Consignment ID
  - Real-time status updates
  - Detailed order information

- **Locations Browser**:
  - Browse available cities
  - Explore zones within cities
  - View areas within zones
  - Interactive location hierarchy

- **Price Calculator**:
  - Calculate delivery charges
  - Location-based pricing
  - Delivery type pricing (Normal/On-Demand)
  - Item type pricing (Document/Parcel)
  - Weight-based calculations
  - Instant price breakdown

#### Technical Details
- OAuth 2.0 authentication
- Automatic token management and refresh
- API Base URL: `https://hermes-api.pathao.com/api/v1`
- Credentials stored securely in user profile and localStorage

### 6.2 Steadfast Courier Integration

#### Features
- **Order Creation**:
  - Single order creation
  - Bulk order creation (up to 500 orders)
  - Consignment tracking

- **Order Management**:
  - Check delivery status by:
    - Consignment ID
    - Invoice number
    - Tracking code
  - Return request management
  - Order history

- **Financial Management**:
  - Check current balance
  - View payment history
  - Transaction tracking

- **Location Services**:
  - View police stations
  - Area coverage information

#### Technical Details
- API Key-based authentication
- API Base URL: `https://portal.packzy.com/api/v1`
- Credentials stored securely in user profile and localStorage

---

### 7. Marketing & Promotions

#### Banners
- **Banner Management**:
  - Create promotional banners
  - Upload banner images
  - Set banner visibility
  - Link to products/categories
  - Schedule banner display

#### Promocodes
- **Discount Code System**:
  - Create promocodes
  - Set discount types (percentage/fixed)
  - Define validity periods
  - Usage limits per code
  - Customer eligibility rules
  - Minimum order requirements

---

### 8. Fraud Prevention

#### Fraud Checker
- **Risk Analysis**:
  - Customer verification
  - Order pattern analysis
  - Suspicious activity detection
  - Fraud risk scoring
- **Reports Access**: Detailed fraud reports and analytics

---

### 9. Settings & Configuration

#### Account Settings
- **Profile Management**:
  - Personal information (name, email, phone)
  - Company details (company name, ID)
  - Branch location/country
  - Company logo upload
  - Account creation and update dates
  - Account status (active/inactive)

#### Payment Information
- **Subscription Details**:
  - Current package information
  - Payment status
  - Payment method
  - Subscription amount
  - Billing history

#### Courier Configuration
- **Pathao Credentials**:
  - Client ID management
  - Client Secret configuration
  - Secure credential storage
  - Link to Pathao Merchant Portal

- **Steadfast Credentials**:
  - API Key management
  - Secret Key configuration
  - Secure credential storage
  - Link to Steadfast Portal

#### Notification Settings
- **Order Notifications**:
  - Email notifications configuration
  - WhatsApp notifications setup
  - SMS notifications setup
  - Notification triggers
  - Template customization

---

### 10. User Management

#### Staff Management
- **User Roles**: Define custom roles with specific permissions
- **Access Control**: Assign features to different user levels
- **Team Collaboration**: Multi-user support with permission boundaries

---

### 11. Support & Help

#### Help Center
- Documentation access
- FAQ section
- Support ticket system
- Integration guides
- Troubleshooting resources

#### Legal Pages
- **Privacy Policy**: Data protection and privacy information
- **Terms & Conditions**: Service terms and user agreements
- **Refund Policy**: Return and refund guidelines

---

### 12. Super Admin Panel

#### Overview Dashboard
- Platform-wide statistics
- Revenue monitoring
- Customer analytics

#### Earnings Management
- Track platform earnings
- Commission monitoring
- Financial reports

#### Customer Management
- View all merchant accounts
- Customer details and history
- Account creation and editing
- Account status management
- Payment information tracking
- Permission assignment

#### Support System
- View support tickets
- Support ticket details
- Issue resolution tracking
- Customer communication

---

## Technical Features

### State Management
- **Redux Toolkit**: Centralized state management
- **RTK Query**: Efficient API data fetching and caching
- **Persistent Storage**: State persistence across sessions

### UI/UX Features
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Mobile-first, works on all devices
- **Modern UI Components**: Built with Radix UI and Tailwind CSS
- **Interactive Charts**: Data visualization with Recharts
- **Toast Notifications**: Real-time user feedback
- **Loading States**: Skeleton loaders and progress indicators
- **Form Validation**: Client-side validation with React Hook Form

### Data Visualization
- **Line Charts**: Revenue and growth trends
- **Radial Charts**: Payment status breakdown
- **Stat Cards**: Key performance indicators
- **Data Tables**: Sortable, searchable data grids

### File Handling
- **Image Upload**: Product and profile image management
- **CSV Import/Export**: Bulk data operations
- **Multi-file Support**: Batch file processing

### Security
- **JWT Authentication**: Secure token-based auth
- **Permission Checks**: Route-level access control
- **Secure Credential Storage**: Encrypted API keys
- **CORS Protection**: Cross-origin security
- **XSS Prevention**: Input sanitization

### API Integration
- **RESTful API**: Standard HTTP methods
- **Error Handling**: Graceful error recovery
- **Retry Logic**: Automatic retry for failed requests
- **Rate Limiting**: API usage management
- **Caching**: Smart data caching for performance

---

## Notification System

### Real-time Notifications
- **In-app Notifications**: Bell icon with unread count
- **Notification Center**: Dropdown with recent notifications
- **Notification Types**:
  - Order updates
  - Payment confirmations
  - System alerts
  - Courier status updates
- **Mark as Read**: Individual and bulk actions
- **Notification History**: Archive of all notifications

---

## Permission Matrix

| Feature | Permission Code |
|---------|----------------|
| Dashboard | DASHBOARD |
| Products | PRODUCTS |
| Categories | CATEGORY |
| Inventory | INVENTORY |
| Customers | CUSTOMERS |
| Orders | ORDERS |
| Order Items | ORDERS |
| Pathao Courier | PATHAO |
| Steadfast Courier | STEADFAST |
| Fraud Checker | REPORTS |
| Banners | BANNERS |
| Promocodes | PROMOCODES |
| Settings | SETTINGS |
| Staff Management | STAFF |
| Notifications | NOTIFICATIONS |
| Email Notifications | EMAIL_NOTIFICATIONS |
| WhatsApp Notifications | WHATSAPP_NOTIFICATIONS |
| Privacy Policy | PRIVACY_POLICY |
| Terms & Conditions | TERMS_CONDITIONS |
| Refund Policy | REFUND_POLICY |

---

## Storage & Data Sync

### Storage Synchronization
- **Cross-tab Sync**: Real-time data sync across browser tabs
- **localStorage Backup**: Persistent data storage
- **Session Management**: Active session tracking
- **Token Management**: Automatic token refresh

---

## Navigation

### Top Navigation
- User profile dropdown
- Notification bell
- Settings access
- Theme toggle
- Logout option

### Side Navigation
- Dashboard
- Categories
- Products
- Inventory
- Customers
- Orders
- Order Items
- Steadfast Courier
- Pathao Courier
- Fraud Checker
- Banners
- Promocodes
- Settings
- Help
- Privacy Policy
- Terms & Conditions
- Refund Policy

---

## Supported Operations

### CRUD Operations
- ✅ Create new records
- ✅ Read/View records
- ✅ Update existing records
- ✅ Delete records
- ✅ Bulk operations
- ✅ Search and filter
- ✅ Sort and pagination

### Data Export/Import
- ✅ CSV export
- ✅ CSV import with validation
- ✅ Bulk data processing
- ✅ Template downloads

---

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS/Android)

---

## Performance Features

- **Code Splitting**: Lazy loading for faster initial load
- **Image Optimization**: Responsive image loading
- **API Caching**: Reduced server requests
- **Debounced Search**: Optimized search performance
- **Virtualization**: Efficient large list rendering

---

## Future Enhancements

- Multi-language support
- Advanced reporting and analytics
- Email marketing integration
- SMS marketing campaigns
- Inventory forecasting
- Customer loyalty programs
- AI-powered recommendations
- Mobile app (iOS/Android)

---

## Summary

SquadCart Console is a feature-rich e-commerce management platform with:
- 🎯 **20+ Core Features**
- 🔐 **35+ Permission-based Access Controls**
- 📊 **Real-time Analytics & Reporting**
- 🚚 **2 Courier Integrations (Pathao & Steadfast)**
- 📱 **Responsive Design**
- 🌙 **Dark Mode Support**
- 🔔 **Real-time Notifications**
- 👥 **Multi-user Support**
- 🔒 **Enterprise-grade Security**
- ⚡ **High Performance**

---

**Last Updated:** January 19, 2026  
**Version:** 1.0.0  
**Platform:** Web-based (React + Vite)

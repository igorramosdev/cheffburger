# replit.md

## Overview

This is an e-commerce checkout and payment system for a food delivery business (burger restaurant). The application handles product display, shopping cart functionality, customer checkout forms, and PIX payment processing through the Otimize Pagamentos payment gateway. The system is designed as a static frontend with serverless API functions for payment processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Static HTML/CSS/JavaScript**: The frontend consists of static HTML pages with inline JavaScript for interactivity
- **jQuery-based**: Uses jQuery (v3.7.1) for DOM manipulation, AJAX requests, and form handling
- **No frontend framework**: Pure vanilla JavaScript with jQuery plugins for specific functionality (masks, alerts)
- **SweetAlert2**: Used for user-friendly modal dialogs and notifications
- **QRCode.js**: Client-side QR code generation for PIX payments

### Backend Architecture
- **Serverless Functions**: API endpoints are implemented as Vercel serverless functions in the `/api` directory
- **Express.js setup available**: Package.json includes Express, but primary deployment uses serverless functions
- **Node.js runtime**: Backend logic runs on Node.js with ES modules

### Key API Endpoints
1. `/api/generate-pix.js` - Creates PIX payment transactions via Otimize Pagamentos API
2. `/api/check-status.js` - Polls payment status to verify if PIX payment was completed

### Payment Flow
1. Customer fills checkout form with personal info (name, CPF, phone, address)
2. Frontend sends order data to `/api/generate-pix`
3. API creates transaction and returns PIX QR code and copy-paste code
4. Frontend displays QR code and polls `/api/check-status` until payment confirmed
5. On successful payment, customer is redirected to confirmation page

### Data Management
- **No database**: Product data is hardcoded in `product.js` files
- **LocalStorage**: Used for cart persistence and UTM tracking data
- **Session-based cart**: Cart items stored client-side in localStorage

### Directory Structure
- `/api` - Serverless API functions for payment processing
- `/css` - Stylesheets (Poppins font, red/white theme)
- `/js` - Client-side JavaScript libraries and custom scripts
- `/shop/{id}/` - Shop-specific pages (cart, checkout, terms)
- `/payment/{ids}/` - Payment confirmation pages

## External Dependencies

### Payment Gateway
- **Otimize Pagamentos API** (`api.otimizepagamentos.com/v1/transactions`)
  - Handles PIX payment generation and status checking
  - Requires `OTIMIZE_SECRET_KEY` environment variable for Basic Auth

### Analytics & Tracking
- **Google Analytics** (G-Y2N3W6KSXL) - Page tracking
- **UTMify** (`cdn.utmify.com.br`) - UTM parameter tracking and pixel integration
- **Google Pixel** - Conversion tracking via UTMify

### CDN Dependencies
- jQuery 3.7.1 (cdnjs)
- jQuery Mask Plugin 1.14.16 (cdnjs)
- SweetAlert2 v11 (jsdelivr)
- Font Awesome 6.0.0 (cdnjs)
- QRCode.js 1.0.0 (cdnjs)
- Google Fonts (Poppins)

### NPM Packages
- `axios` - HTTP client for API requests
- `express` - Web server framework (available but serverless preferred)
- `cors` - Cross-origin resource sharing middleware
- `dotenv` - Environment variable management
- `node-fetch` - Fetch API for Node.js

### Image Hosting
- Images hosted on ibb.co (ImgBB image hosting service)
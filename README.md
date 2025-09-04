# Italian Corner Invoice Management System

## Project Overview

The Italian Corner Invoice Management System is a comprehensive web-based application designed for generating and managing invoices for the Italian Corner restaurant group and associated villa accommodations. The system provides a mock implementation of the Greek AADE (Ανεξάρτητη Αρχή Δημοσίων Εσόδων) myDATA service for invoice submission and compliance.

### Key Features

- **Multi-branch Support**: Manages invoices for three business entities:
  - Italian Corner restaurant (central branch)
  - Villa Alexandros accommodation
  - 3A's Family Luxury Villa accommodation
  
- **AADE myDATA Integration**: Mock implementation with validation and submission capabilities
- **Customer Management**: Complete customer database with CRUD operations
- **Invoice History**: Comprehensive tracking of all issued invoices
- **PDF Export**: High-quality PDF generation with professional Greek invoice format
- **Failed Queue Management**: Automatic retry mechanism for failed submissions
- **Draft Management**: Save and restore invoice drafts
- **Responsive Design**: Professional UI optimized for desktop and mobile devices

## Technical Architecture

### Frontend Stack
- **React 18**: Component-based UI framework
- **Babel Standalone**: In-browser JSX compilation
- **Tailwind CSS**: Utility-first styling framework
- **PDFMake**: Professional PDF document generation
- **LocalStorage**: Client-side data persistence

### Backend Stack
- **Express.js**: Static file server and API endpoints
- **Node.js**: Server runtime
- **CORS**: Cross-origin resource sharing support

### Project Structure

```
italiancorner_invoice_app/
├── frontendmock.jsx          # Main React application component
├── pdfGenerator.js           # PDF generation module using PDFMake
├── index.html               # Application entry point
├── frontend-server.js       # Express static file server
├── package.json            # Project dependencies and scripts
├── assets/                 # Static assets directory
│   ├── italiancornerDesktop App Icon.png  # Company logo
│   └── README.md           # Project history and notes
└── backendaade/            # Mock AADE backend service
    ├── aade-backend-stub.js # Mock API server
    └── package.json        # Backend dependencies
```

## Installation and Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm package manager

### Installation Steps

1. **Clone or download the project**
   ```bash
   cd "c:\DEV PORTOFOLIO\italiancorner_invoice_app"
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backendaade
   npm install
   cd ..
   ```

### Running the Application

#### Start Frontend Server
```bash
npm start
# Starts frontend server on http://localhost:8080
```

#### Start Backend API (Optional)
```bash
npm run backend
# Starts mock AADE backend on http://localhost:3000
```

#### Access the Application
Open your web browser and navigate to: `http://localhost:8080`

## Application Components

### 1. Main Application (`frontendmock.jsx`)

The core React component managing the entire invoice creation and management workflow.

#### Key Functions:
- `validateInvoiceForAADE()`: Client-side validation for AADE compliance
- `buildMyDataPayload()`: Converts invoice data to myDATA format
- `submitToAADEMock()`: Mock submission with random failure simulation
- `calcTotals()`: Automatic calculation of invoice totals
- `round2()`: Financial rounding to 2 decimal places

#### State Management:
- **Branch Configuration**: Multi-branch business logic
- **Customer Data**: Complete customer information management
- **Invoice Items**: Dynamic line item management with VAT calculations
- **History Tracking**: Persistent storage of all invoice transactions
- **Failed Queue**: Automatic retry mechanism for failed submissions

#### Branch Configuration:
```javascript
const BRANCHES = {
  central: {
    id: 'central',
    label: 'ITALIAN CORNER – meeting point',
    series: 'I-REST',
    revenueMapping: {
      documentType: '1.1',
      revenueCategory: 'RESTAURANT_SERVICES',
      defaultVat: 13,
      allowedVatRates: [13, 24]
    }
  },
  villa1: {
    id: 'villa1',
    label: 'Villa Alexandros',
    series: 'I-VILLA1',
    revenueMapping: {
      documentType: '1.1',
      revenueCategory: 'ACCOMMODATION',
      defaultVat: 13,
      allowedVatRates: [13, 24]
    }
  },
  villa2: {
    id: 'villa2',
    label: "3A's Family Luxury Villa",
    series: 'I-VILLA2',
    revenueMapping: {
      documentType: '1.1',
      revenueCategory: 'ACCOMMODATION',
      defaultVat: 13,
      allowedVatRates: [13, 24]
    }
  }
};
```

### 2. PDF Generator Module (`pdfGenerator.js`)

Professional PDF generation system using PDFMake library for Greek invoice standards.

#### Key Functions:
- `getImageDataURL()`: Converts images to base64 for PDF embedding
- `createPDFDocumentDefinition()`: Creates complete PDFMake document structure
- `downloadInvoicePDF()`: Generates and downloads PDF invoice
- `openInvoicePDF()`: Opens PDF in new browser tab

#### Features:
- **Logo Integration**: Automatic company logo embedding
- **Greek Typography**: Proper Unicode support for Greek characters
- **Professional Layout**: Compliant with Greek invoice standards
- **Responsive Tables**: Dynamic item tables with automatic spacing
- **Financial Calculations**: Accurate VAT and total calculations
- **Error Handling**: Graceful fallbacks for missing resources

### 3. Mock AADE Backend (`backendaade/aade-backend-stub.js`)

Express.js API server simulating the Greek AADE myDATA service.

#### API Endpoints:

**POST `/api/aade/validate`**
- Validates invoice structure and required fields
- Returns validation errors or success confirmation

**POST `/api/aade/submit`**
- Simulates invoice submission to AADE
- Returns MARK number on success or error message on failure
- Includes random failure simulation (25% failure rate)

**POST `/api/aade/retry`**
- Handles retry attempts for failed submissions
- Returns new MARK number on successful retry

#### Response Format:
```javascript
// Success Response
{
  "ok": true,
  "mark": "MARK-1640995200000"
}

// Error Response
{
  "ok": false,
  "error": "Error description in Greek"
}
```

### 4. Static Server (`frontend-server.js`)

Simple Express.js server for serving static files and the main application.

- Serves all static assets from the project root
- Handles routing for single-page application
- Provides CORS support for API communication

## Data Models

### Invoice Structure
```javascript
{
  branchId: 'central|villa1|villa2',
  invoiceDate: 'YYYY-MM-DD',
  invoiceNumber: 'string',
  customer: {
    name: 'string',
    vat: 'string',
    email: 'string',
    address: 'string',
    city: 'string'
  },
  items: [{
    description: 'string',
    qty: number,
    price: number,
    vatRate: 13|24
  }],
  surcharge: number, // Only for villa accommodations
  totals: {
    net: number,
    vat: number,
    gross: number
  }
}
```

### myDATA Payload Structure
```javascript
{
  header: {
    series: 'string',
    aa: 'string',
    issueDate: 'YYYY-MM-DD',
    docType: '1.1',
    issuer: {
      name: 'string',
      vat: 'string',
      address: 'string',
      city: 'string',
      zip: 'string',
      phone: 'string'
    },
    counterparty: {
      name: 'string',
      vat: 'string',
      email: 'string',
      address: 'string',
      city: 'string'
    }
  },
  lines: [{
    lineNumber: number,
    description: 'string',
    qty: number,
    unitPrice: number,
    netAmount: number,
    vatCategory: 'string',
    vatAmount: number,
    revenueClassification: 'string'
  }],
  totals: {
    net: number,
    vat: number,
    gross: number,
    surcharge: number
  }
}
```

## Business Logic

### Revenue Categories
- **Restaurant Services**: 13% and 24% VAT rates supported
- **Accommodation Services**: 13% and 24% VAT rates supported
- **Accommodation Tax**: Additional surcharge for villa stays

### VAT Calculation
```javascript
// Per line item
const netAmount = quantity * unitPrice;
const vatAmount = netAmount * (vatRate / 100);
const totalAmount = netAmount + vatAmount;

// Invoice totals
const totalNet = sum(all line netAmounts);
const totalVat = sum(all line vatAmounts);
const accommodationTax = surcharge (villas only);
const grandTotal = totalNet + totalVat + accommodationTax;
```

### Validation Rules
1. **Required Fields**: Invoice number, date, branch, customer name, customer VAT
2. **Line Items**: At least one item with valid description, quantity > 0, price >= 0
3. **VAT Rates**: Must match allowed rates for branch type
4. **Customer VAT**: Must be valid format (Greek or EU VAT format)

## Storage Management

### LocalStorage Keys
- `customers_{branchId}`: Customer database per branch
- `invoices_history`: Complete invoice history across all branches
- `aade_failed_queue`: Failed submissions awaiting retry
- `invoice_draft`: Current draft invoice data

### Data Persistence
All data is stored client-side using localStorage for offline capability:
- **Customer Database**: Searchable customer records with full contact information
- **Invoice History**: Complete audit trail of all transactions
- **Draft Management**: Automatic saving and restoration of work in progress
- **Failed Queue**: Automatic queuing of failed submissions for retry

## User Interface Features

### Professional Header
- Company logo integration with transparent background
- Dynamic branch information display
- Gradient styling with professional color scheme

### Invoice Form
- **Branch Selection**: Dropdown with automatic configuration
- **Customer Management**: Searchable customer database with CRUD operations
- **Dynamic Line Items**: Add/remove items with real-time calculation
- **VAT Management**: Branch-specific VAT rate validation
- **Accommodation Tax**: Automatic handling for villa bookings

### Management Panels
- **Customer Database**: Expandable panel with full customer listing
- **Invoice History**: Complete transaction history with filtering
- **Failed Queue**: Automatic retry management with manual override
- **Test Panel**: Built-in validation testing for development

### Responsive Design
- **Desktop Optimization**: Multi-column layout for efficient data entry
- **Mobile Support**: Responsive grid system with touch-friendly controls
- **Professional Styling**: Tailwind CSS with custom gradients and shadows

## Error Handling

### Client-Side Validation
- Real-time form validation with immediate feedback
- VAT rate compliance checking per branch type
- Required field validation with clear error messages
- Financial calculation validation with rounding

### Network Error Management
- Automatic retry mechanism for failed API calls
- Graceful degradation to mock mode when backend unavailable
- User-friendly error messages in Greek
- Persistent queue for failed submissions

### PDF Generation Errors
- Fallback image handling for missing logos
- Graceful handling of missing data with default values
- Error reporting with actionable user guidance

## Testing Framework

### Built-in Test Suite
The application includes a comprehensive test panel accessible from the main interface:

```javascript
// Test scenarios included:
1. Restaurant VAT mix calculation (13% + 24%)
2. Villa accommodation with surcharge
3. Invalid VAT rate rejection
4. Payload structure validation
5. Calculation accuracy verification
```

### Manual Testing Procedures
1. **Invoice Creation**: Test all branch types with various item combinations
2. **Customer Management**: Verify CRUD operations and data persistence
3. **PDF Export**: Validate PDF generation with logo and formatting
4. **Backend Integration**: Test both mock and API modes
5. **Error Scenarios**: Verify graceful handling of network failures

## Configuration

### Environment Variables
- `PORT`: Frontend server port (default: 8080)
- `BACKEND_PORT`: Backend API port (default: 3000)

### Customization Options
- **Logo**: Replace `/assets/italiancornerDesktop App Icon.png`
- **Branch Configuration**: Modify `BRANCHES` object in `frontendmock.jsx`
- **VAT Rates**: Update `allowedVatRates` arrays per branch
- **Styling**: Customize Tailwind CSS classes for branding

## Security Considerations

### Data Protection
- All sensitive data stored client-side only
- No server-side persistence in mock mode
- VAT number format validation
- Input sanitization for XSS prevention

### API Security
- CORS configuration for controlled access
- Request size limits to prevent abuse
- Input validation on all API endpoints
- Error message sanitization

## Performance Optimization

### Frontend Performance
- React component optimization with proper state management
- Minimal external dependencies for fast loading
- Efficient localStorage usage with JSON serialization
- Lazy loading of PDF generation resources

### Backend Performance
- Express.js with minimal middleware overhead
- Efficient JSON parsing with size limits
- Fast mock response generation
- Memory-efficient data handling

## Deployment Guidelines

### Production Deployment
1. **Static Hosting**: Deploy frontend files to any web server
2. **API Service**: Deploy backend to Node.js hosting service
3. **Environment Configuration**: Update API endpoints for production
4. **Asset Optimization**: Optimize images and static resources

### Maintenance Requirements
- Regular localStorage cleanup for performance
- PDF library updates for security
- React/dependency updates for compatibility
- Backend monitoring for API availability

## Future Enhancement Opportunities

### Immediate Enhancements
- **Real AADE Integration**: Connect to actual myDATA API
- **Database Backend**: Replace localStorage with server database
- **User Authentication**: Multi-user support with role management
- **Advanced Reporting**: Dashboard with analytics and insights

### Advanced Features
- **Multi-language Support**: English interface option
- **Email Integration**: Automatic invoice delivery to customers
- **Barcode Generation**: QR codes for digital invoice verification
- **Mobile Application**: Native mobile app for field operations

## Support and Troubleshooting

### Common Issues

**1. PDF Generation Fails**
- Verify PDFMake library loading in browser developer tools
- Check logo file accessibility and format
- Ensure browser supports PDF generation

**2. Backend Connection Errors**
- Verify backend server is running on port 3000
- Check CORS configuration for cross-origin requests
- Validate API endpoint URLs in configuration

**3. Data Loss Issues**
- Check browser localStorage availability and limits
- Verify JSON serialization/deserialization
- Backup data regularly through export functions

### Development Support
- Browser Developer Tools for debugging React components
- Network tab for API communication monitoring
- Console logs for detailed error information
- Test panel for validation verification

## License and Credits

### Third-Party Libraries
- **React**: Facebook Inc. - MIT License
- **PDFMake**: bpampuch - MIT License
- **Tailwind CSS**: Tailwind Labs - MIT License
- **Express.js**: Express.js Team - MIT License

### Development Credits
- **Architecture Design**: Modern React with functional components
- **PDF Generation**: Custom implementation with Greek language support
- **UI/UX Design**: Professional business application standards
- **API Integration**: RESTful design with error handling

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Compatibility**: Modern browsers with ES6+ support  
**Status**: Production Ready

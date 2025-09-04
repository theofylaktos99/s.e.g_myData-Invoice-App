# API Documentation - Italian Corner Invoice System

## Overview

This document provides comprehensive API documentation for the Italian Corner Invoice Management System's mock AADE (Ανεξάρτητη Αρχή Δημοσίων Εσόδων) backend service.

## Base Configuration

- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`
- **CORS**: Enabled for all origins
- **Request Size Limit**: 1MB

## Authentication

Currently, the mock API does not require authentication. In a production environment, this would include:
- API Key authentication
- OAuth 2.0 integration with AADE
- Digital certificate validation

## API Endpoints

### 1. Validate Invoice

Validates invoice data structure and business rules before submission.

**Endpoint**: `POST /api/aade/validate`

**Request Body**:
```json
{
  "header": {
    "series": "I-REST",
    "aa": "0001",
    "issueDate": "2025-01-15",
    "docType": "1.1",
    "issuer": {
      "name": "ITALIAN CORNER 'meeting point'",
      "vat": "099999999",
      "address": "Μάρκου Πορτάλιου 25",
      "city": "Ρέθυμνο",
      "zip": "74100",
      "phone": "+302831020010"
    },
    "counterparty": {
      "name": "ACME SA",
      "vat": "123456789",
      "email": "test@example.com",
      "address": "Test Address 1",
      "city": "Athens"
    }
  },
  "lines": [
    {
      "lineNumber": 1,
      "description": "Γεύμα",
      "qty": 2,
      "unitPrice": 10.00,
      "netAmount": 20.00,
      "vatCategory": "13%",
      "vatAmount": 2.60,
      "revenueClassification": "RESTAURANT_SERVICES"
    }
  ],
  "totals": {
    "net": 20.00,
    "vat": 2.60,
    "gross": 22.60,
    "surcharge": 0.00
  },
  "meta": {
    "branchId": "central",
    "sandbox": true
  }
}
```

**Success Response** (200 OK):
```json
{
  "ok": true,
  "message": "VALID"
}
```

**Error Response** (200 OK):
```json
{
  "ok": false,
  "error": "Λείπουν βασικά στοιχεία header."
}
```

**Validation Rules**:
- Header must contain `aa` (invoice number) and `issueDate`
- Lines array must exist and contain at least one item
- Each line must have `qty > 0` and `unitPrice >= 0`
- All required fields must be present and properly formatted

### 2. Submit Invoice

Submits validated invoice to AADE myDATA system (mock implementation).

**Endpoint**: `POST /api/aade/submit`

**Request Body**: Same as validation endpoint

**Success Response** (200 OK):
```json
{
  "ok": true,
  "mark": "MARK-1640995200000"
}
```

**Error Response** (200 OK):
```json
{
  "ok": false,
  "error": "AADE gateway προσωρινά μη διαθέσιμο."
}
```

**Mock Behavior**:
- 25% random failure rate to simulate real-world conditions
- Automatic failure if counterparty VAT contains "FAIL"
- Returns unique MARK identifier on success
- Simulates network delays (650ms)

### 3. Retry Submission

Retries previously failed invoice submissions.

**Endpoint**: `POST /api/aade/retry`

**Request Body**: Same as submit endpoint

**Success Response** (200 OK):
```json
{
  "ok": true,
  "mark": "MARK-1640995200001"
}
```

**Error Response** (200 OK):
```json
{
  "ok": false,
  "error": "Retry limit exceeded."
}
```

**Features**:
- Generates new MARK on successful retry
- No failure simulation for retry attempts
- Maintains same request/response format as submit

## Data Models

### Header Object
```typescript
interface Header {
  series: string;           // Invoice series (e.g., "I-REST")
  aa: string;              // Invoice number
  issueDate: string;       // ISO date format (YYYY-MM-DD)
  docType: string;         // Document type (always "1.1")
  issuer: IssuerInfo;      // Company issuing the invoice
  counterparty: CustomerInfo; // Customer receiving the invoice
}
```

### Issuer Info
```typescript
interface IssuerInfo {
  name: string;            // Company name
  vat: string;            // Company VAT number
  address: string;        // Street address
  city: string;           // City name
  zip: string;            // Postal code
  phone: string;          // Contact phone
}
```

### Customer Info
```typescript
interface CustomerInfo {
  name: string;           // Customer name
  vat: string;           // Customer VAT number
  email?: string;        // Customer email (optional)
  address?: string;      // Customer address (optional)
  city?: string;         // Customer city (optional)
}
```

### Line Item
```typescript
interface LineItem {
  lineNumber: number;     // Sequential line number
  description: string;    // Item/service description
  qty: number;           // Quantity (must be > 0)
  unitPrice: number;     // Unit price (must be >= 0)
  netAmount: number;     // Calculated net amount (qty * unitPrice)
  vatCategory: string;   // VAT percentage (e.g., "13%", "24%")
  vatAmount: number;     // Calculated VAT amount
  revenueClassification: string; // Revenue category
}
```

### Totals Object
```typescript
interface Totals {
  net: number;           // Total net amount
  vat: number;          // Total VAT amount
  gross: number;        // Total gross amount (net + vat + surcharge)
  surcharge: number;    // Additional charges (accommodation tax)
}
```

## Revenue Classifications

### Restaurant Services
- **Category**: `RESTAURANT_SERVICES`
- **Allowed VAT Rates**: 13%, 24%
- **Document Type**: 1.1 (Sales Invoice)

### Accommodation Services
- **Category**: `ACCOMMODATION`
- **Allowed VAT Rates**: 13%, 24%
- **Document Type**: 1.1 (Sales Invoice)
- **Additional Charges**: Accommodation tax (surcharge)

## Error Codes and Messages

### Validation Errors
| Error Message | Description |
|---------------|-------------|
| `Λείπουν βασικά στοιχεία header.` | Missing required header fields |
| `Δεν υπάρχουν γραμμές.` | No line items in request |
| `Μη έγκυρες ποσότητες/τιμές.` | Invalid quantities or prices |

### Submission Errors
| Error Message | Description |
|---------------|-------------|
| `AADE gateway προσωρινά μη διαθέσιμο.` | Service temporarily unavailable |
| `Μη έγκυρος ΑΦΜ.` | Invalid VAT number format |
| `Υπέρβαση ορίου αιτημάτων.` | Rate limit exceeded |

## Request Examples

### Complete Restaurant Invoice
```bash
curl -X POST http://localhost:3000/api/aade/submit \
  -H "Content-Type: application/json" \
  -d '{
    "header": {
      "series": "I-REST",
      "aa": "0001",
      "issueDate": "2025-01-15",
      "docType": "1.1",
      "issuer": {
        "name": "ITALIAN CORNER 'meeting point'",
        "vat": "099999999",
        "address": "Μάρκου Πορτάλιου 25",
        "city": "Ρέθυμνο",
        "zip": "74100",
        "phone": "+302831020010"
      },
      "counterparty": {
        "name": "John Doe",
        "vat": "123456789",
        "email": "john@example.com"
      }
    },
    "lines": [
      {
        "lineNumber": 1,
        "description": "Pasta Carbonara",
        "qty": 1,
        "unitPrice": 12.50,
        "netAmount": 12.50,
        "vatCategory": "13%",
        "vatAmount": 1.63,
        "revenueClassification": "RESTAURANT_SERVICES"
      },
      {
        "lineNumber": 2,
        "description": "Wine Bottle",
        "qty": 1,
        "unitPrice": 25.00,
        "netAmount": 25.00,
        "vatCategory": "24%",
        "vatAmount": 6.00,
        "revenueClassification": "RESTAURANT_SERVICES"
      }
    ],
    "totals": {
      "net": 37.50,
      "vat": 7.63,
      "gross": 45.13,
      "surcharge": 0.00
    }
  }'
```

### Villa Accommodation Invoice
```bash
curl -X POST http://localhost:3000/api/aade/submit \
  -H "Content-Type: application/json" \
  -d '{
    "header": {
      "series": "I-VILLA1",
      "aa": "0001",
      "issueDate": "2025-01-15",
      "docType": "1.1",
      "issuer": {
        "name": "Villa Alexandros OE",
        "vat": "088888888",
        "address": "Οδός Θάλασσας 1",
        "city": "Ρέθυμνο",
        "zip": "74100",
        "phone": ""
      },
      "counterparty": {
        "name": "Maria Schmidt",
        "vat": "EL999999999",
        "email": "maria@example.com"
      }
    },
    "lines": [
      {
        "lineNumber": 1,
        "description": "Διαμονή 3 νύχτες",
        "qty": 3,
        "unitPrice": 80.00,
        "netAmount": 240.00,
        "vatCategory": "13%",
        "vatAmount": 31.20,
        "revenueClassification": "ACCOMMODATION"
      }
    ],
    "totals": {
      "net": 240.00,
      "vat": 31.20,
      "gross": 275.70,
      "surcharge": 4.50
    }
  }'
```

## Rate Limiting

The mock API does not implement rate limiting, but production environments should include:
- Maximum requests per minute per IP
- Daily submission limits per VAT number
- Burst protection for validation endpoints

## Monitoring and Logging

### Request Logging
All API requests are logged to console with:
- Timestamp
- HTTP method and endpoint
- Request body (truncated for large payloads)
- Response status and body

### Health Check
The server provides basic health monitoring:
- Server startup confirmation
- Port binding status
- Basic error logging

## Security Considerations

### Input Validation
- JSON payload size limits (1MB maximum)
- Required field validation
- Data type verification
- SQL injection prevention (not applicable to mock)

### Error Information
- Generic error messages to prevent information leakage
- No sensitive data in error responses
- Proper HTTP status codes

## Testing

### Unit Test Examples

```javascript
// Validation test
const validationTest = {
  header: {
    series: "TEST",
    aa: "0001",
    issueDate: "2025-01-15",
    docType: "1.1",
    issuer: { /* valid issuer data */ },
    counterparty: { /* valid customer data */ }
  },
  lines: [
    {
      lineNumber: 1,
      description: "Test Item",
      qty: 1,
      unitPrice: 10.00,
      netAmount: 10.00,
      vatCategory: "13%",
      vatAmount: 1.30,
      revenueClassification: "RESTAURANT_SERVICES"
    }
  ],
  totals: {
    net: 10.00,
    vat: 1.30,
    gross: 11.30,
    surcharge: 0.00
  }
};
```

### Integration Testing
- End-to-end invoice submission flow
- Error scenario testing
- Performance testing with concurrent requests
- Data validation accuracy testing

## Deployment

### Environment Variables
```bash
PORT=3000                    # API server port
NODE_ENV=production         # Environment mode
CORS_ORIGIN=*              # CORS allowed origins
REQUEST_SIZE_LIMIT=1mb     # Maximum request size
```

### Production Considerations
- Replace mock logic with real AADE API integration
- Implement proper authentication and authorization
- Add comprehensive logging and monitoring
- Include rate limiting and DDoS protection
- Set up health checks and service monitoring

---

**API Version**: 1.0.0  
**Documentation Updated**: January 2025  
**Mock Implementation**: Development and Testing Only

# Component Architecture - Italian Corner Invoice System

## Overview

This document provides detailed technical documentation of the React component architecture, state management, and data flow patterns used in the Italian Corner Invoice Management System.

## Component Hierarchy

```
InvoiceAppMock (Root Component)
├── Header Section
│   ├── Logo Display
│   └── Company Information
├── Invoice Form Section
│   ├── Branch Selection
│   ├── Invoice Metadata
│   └── Document Type Display
├── Customer Management Section
│   ├── Customer Form
│   ├── Customer Dropdown
│   └── Customer Database Panel
├── Line Items Section
│   ├── Items Table
│   ├── Add/Remove Controls
│   └── Real-time Calculations
├── Totals Section
│   ├── Net Amount Display
│   ├── VAT Calculations
│   └── Accommodation Tax (Villa branches)
├── Action Buttons Section
│   ├── Submit to AADE
│   ├── Clear Form
│   ├── Save/Load Draft
│   └── PDF Export
├── Status Display Section
│   └── Success/Error Messages
├── Management Panels
│   ├── Failed Queue Management
│   ├── Invoice History
│   └── Test Panel
└── Configuration Footer
    ├── Backend Toggle
    └── API Endpoint Settings
```

## State Management Architecture

### Primary State Structure

```typescript
interface AppState {
  // Branch and configuration
  branch: BranchId;
  branchCfg: BranchConfig;
  
  // Invoice data
  customer: CustomerData;
  items: LineItem[];
  invoiceDate: string;
  invoiceNumber: string;
  surcharge: number;
  
  // UI state
  status: StatusMessage;
  logoUrl: string;
  
  // Data collections
  customers: CustomerData[];
  history: InvoiceHistory[];
  failedQueue: FailedSubmission[];
  
  // Configuration
  useBackend: boolean;
  backendBase: string;
}
```

### State Management Patterns

#### 1. Local State with useState Hooks
```javascript
// Core invoice state
const [branch, setBranch] = useState('central');
const [customer, setCustomer] = useState({ name: '', vat: '', email: '', address: '', city: '' });
const [items, setItems] = useState([{ description: '', qty: 1, price: 0, vatRate: 13 }]);
const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().substring(0, 10));
const [invoiceNumber, setInvoiceNumber] = useState('0001');
const [surcharge, setSurcharge] = useState(0);

// UI state
const [status, setStatus] = useState({ type: 'idle', msg: '' });
const [logoUrl, setLogoUrl] = useState('/assets/italiancornerDesktop App Icon.png');

// Data collections
const [customers, setCustomers] = useState(() => {
  try { return JSON.parse(localStorage.getItem(storageKeyCustomers('central')) || '[]'); } 
  catch { return []; }
});
const [history, setHistory] = useState(() => {
  try { return JSON.parse(localStorage.getItem(storageKeyHistory()) || '[]'); } 
  catch { return []; }
});
const [failedQueue, setFailedQueue] = useState(() => {
  try { return JSON.parse(localStorage.getItem('aade_failed_queue') || '[]'); } 
  catch { return []; }
});

// Configuration state
const [useBackend, setUseBackend] = useState(true);
const [backendBase, setBackendBase] = useState('http://localhost:3000');
```

#### 2. Computed State with useMemo
```javascript
// Branch configuration
const branchCfg = useMemo(() => BRANCHES[branch], [branch]);

// Real-time totals calculation
const totals = useMemo(() => calcTotals(items), [items]);

// Villa branch detection
const isVilla = branch === 'villa1' || branch === 'villa2';

// Final totals with accommodation tax
const totalsGross = isVilla ? 
  round2(totals.net + totals.vat + surcharge) : 
  round2(totals.net + totals.vat);
```

#### 3. Side Effects with useEffect
```javascript
// Reset surcharge when switching from villa to restaurant
useEffect(() => { 
  if (!isVilla) setSurcharge(0); 
}, [branch, isVilla]);

// Load branch-specific customers when branch changes
useEffect(() => { 
  try { 
    const data = JSON.parse(localStorage.getItem(storageKeyCustomers(branch)) || '[]'); 
    setCustomers(Array.isArray(data) ? data : []); 
  } catch { 
    setCustomers([]); 
  } 
}, [branch]);
```

## Data Flow Patterns

### 1. Invoice Creation Flow
```
User Input → State Update → Validation → Calculation → Display Update
     ↓
Form Submission → Data Transformation → API Call → Response Handling
     ↓
Success: History Update + Status Message + Optional Form Clear
Failure: Failed Queue + Error Message + Retry Options
```

### 2. Customer Management Flow
```
Customer Input → Validation → Database Update → UI Refresh
     ↓
localStorage Persistence → Cross-session Availability
     ↓
Customer Selection → Form Population → Invoice Association
```

### 3. PDF Generation Flow
```
Invoice Data → Data Validation → PDF Generator Module
     ↓
Logo Loading → Document Definition → PDFMake Processing
     ↓
PDF Download/Display → User Download Action
```

## Component Details

### 1. Branch Configuration System

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
    },
    issuer: {
      name: "ITALIAN CORNER 'meeting point'",
      vat: '099999999',
      address: 'Μάρκου Πορτάλιου 25',
      city: 'Ρέθυμνο',
      zip: '74100',
      phone: '+302831020010'
    }
  }
  // villa1, villa2 configurations...
};
```

**Features:**
- Immutable configuration object
- Branch-specific VAT rules
- Revenue classification mapping
- Complete issuer information
- Series number management

### 2. Customer Management Component

```javascript
// Customer state management
const addCustomer = () => {
  if (!customer.name || !customer.vat) {
    setStatus({ type: 'error', msg: 'Συμπλήρωσε Επωνυμία και ΑΦΜ για αποθήκευση πελάτη.' });
    return;
  }
  
  const exists = customers.some(c => c.vat === customer.vat);
  const list = exists ? 
    customers.map(c => c.vat === customer.vat ? { ...customer } : c) : 
    [{ ...customer }, ...customers];
  
  persistCustomers(list);
  setStatus({ type: 'success', msg: exists ? 'Ενημερώθηκε ο πελάτης.' : 'Προστέθηκε νέος πελάτης.' });
};

const deleteCustomer = (vat) => {
  const list = customers.filter(c => c.vat !== vat);
  persistCustomers(list);
  if (customer.vat === vat) setCustomer({ name: '', vat: '', email: '', address: '', city: '' });
};

const pickCustomer = (vat) => {
  const c = customers.find(x => x.vat === vat);
  if (c) setCustomer({ ...c });
};
```

**Features:**
- CRUD operations with validation
- Duplicate prevention by VAT number
- Branch-specific customer storage
- Form integration with auto-population

### 3. Line Items Management

```javascript
// Dynamic line item operations
const addItem = () => setItems((prev) => [
  ...prev, 
  { description: '', qty: 1, price: 0, vatRate: branchCfg.revenueMapping.defaultVat }
]);

const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

// Real-time calculation system
const calcTotals = (items) => {
  const net = items.reduce((s, i) => s + i.qty * i.price, 0);
  const vat = items.reduce((s, i) => s + i.qty * i.price * (i.vatRate / 100), 0);
  return { net, vat };
};

// Financial rounding
const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
```

**Features:**
- Dynamic array manipulation
- Real-time calculation updates
- VAT rate validation per branch
- Financial accuracy with proper rounding

### 4. AADE Integration Component

```javascript
// Validation system
function validateInvoiceForAADE(invoice, branchCfg) {
  const errors = [];
  if (!invoice.invoiceNumber) errors.push('Αριθμός τιμολογίου είναι υποχρεωτικός.');
  if (!invoice.invoiceDate) errors.push('Ημερομηνία είναι υποχρεωτική.');
  if (!invoice.branchId || !BRANCHES[invoice.branchId]) errors.push('Άκυρο υποκατάστημα.');
  if (!invoice.customer?.name) errors.push('Επωνυμία πελάτη είναι υποχρεωτική.');
  if (!invoice.customer?.vat) errors.push('ΑΦΜ πελάτη είναι υποχρεωτικό.');
  if (!invoice.items?.length) errors.push('Πρέπει να υπάρχει τουλάχιστον μία γραμμή είδους/υπηρεσίας.');
  
  invoice.items.forEach((it, i) => {
    if (!it.description) errors.push(`Γραμμή ${i + 1}: Περιγραφή υποχρεωτική.`);
    if (!(it.qty > 0)) errors.push(`Γραμμή ${i + 1}: Ποσότητα > 0.`);
    if (!(it.price >= 0)) errors.push(`Γραμμή ${i + 1}: Τιμή >= 0.`);
    if (!branchCfg.revenueMapping.allowedVatRates.includes(Number(it.vatRate))) {
      errors.push(`Γραμμή ${i + 1}: Μη επιτρεπτός συντελεστής ΦΠΑ για ${branchCfg.label}.`);
    }
  });
  
  return errors;
}

// Payload transformation
function buildMyDataPayload(invoice, branchCfg) {
  const header = {
    series: branchCfg.series,
    aa: invoice.invoiceNumber,
    issueDate: invoice.invoiceDate,
    docType: branchCfg.revenueMapping.documentType,
    issuer: branchCfg.issuer,
    counterparty: {
      name: invoice.customer.name,
      vat: invoice.customer.vat,
      email: invoice.customer.email || undefined,
      address: invoice.customer.address || undefined,
      city: invoice.customer.city || undefined
    }
  };
  
  const lines = invoice.items.map((it, idx) => {
    const net = it.qty * it.price;
    const vatAmt = net * (it.vatRate / 100);
    return {
      lineNumber: idx + 1,
      description: it.description,
      qty: it.qty,
      unitPrice: it.price,
      netAmount: round2(net),
      vatCategory: `${it.vatRate}%`,
      vatAmount: round2(vatAmt),
      revenueClassification: branchCfg.revenueMapping.revenueCategory
    };
  });
  
  const totals = calcTotals(invoice.items);
  const surcharge = Number(invoice.surcharge || 0);
  
  return {
    header,
    lines,
    totals: {
      net: round2(totals.net),
      vat: round2(totals.vat),
      gross: round2(totals.net + totals.vat + surcharge),
      surcharge: round2(surcharge)
    },
    meta: {
      branchId: invoice.branchId,
      sandbox: true
    }
  };
}
```

**Features:**
- Comprehensive validation rules
- myDATA format compliance
- Branch-specific business rules
- Error aggregation and reporting

### 5. Persistence Layer

```javascript
// Storage key management
function storageKeyCustomers(branchId) {
  return `customers_${branchId}`;
}

function storageKeyHistory() {
  return 'invoices_history';
}

// Data persistence functions
const persistFailedQueue = (q) => {
  setFailedQueue(q);
  localStorage.setItem('aade_failed_queue', JSON.stringify(q));
};

const persistCustomers = (list) => {
  setCustomers(list);
  localStorage.setItem(storageKeyCustomers(branch), JSON.stringify(list));
};

const persistHistory = (list) => {
  setHistory(list);
  localStorage.setItem(storageKeyHistory(), JSON.stringify(list));
};

// Draft management
const saveDraft = () => {
  const draft = {
    branchId: branchCfg.id,
    invoiceDate,
    invoiceNumber,
    customer,
    items,
    surcharge
  };
  localStorage.setItem('invoice_draft', JSON.stringify(draft));
  setStatus({ type: 'info', msg: 'Αποθηκεύτηκε πρόχειρο.' });
};

const loadDraft = () => {
  try {
    const d = JSON.parse(localStorage.getItem('invoice_draft') || 'null');
    if (!d) {
      setStatus({ type: 'error', msg: 'Δεν βρέθηκε πρόχειρο.' });
      return;
    }
    
    setBranch(d.branchId in BRANCHES ? d.branchId : 'central');
    setCustomer(d.customer || { name: '', vat: '', email: '', address: '', city: '' });
    setItems(d.items || [{ description: '', qty: 1, price: 0, vatRate: 13 }]);
    setInvoiceDate(d.invoiceDate || new Date().toISOString().substring(0, 10));
    setInvoiceNumber(d.invoiceNumber || '0001');
    setSurcharge(d.surcharge || 0);
    setStatus({ type: 'success', msg: 'Φορτώθηκε πρόχειρο.' });
  } catch {
    setStatus({ type: 'error', msg: 'Σφάλμα ανάγνωσης προχείρου.' });
  }
};
```

**Features:**
- Branch-specific data isolation
- Error-safe JSON serialization
- Draft save/restore functionality
- Cross-session data persistence

## Error Handling Patterns

### 1. Network Error Handling
```javascript
// Graceful API failure handling
try {
  let result;
  if (useBackend) {
    const validateResult = await serverValidate(payload);
    if (!validateResult.ok) {
      setStatus({ type: 'error', msg: `Αποτυχία επικύρωσης: ${validateResult.error}` });
      return;
    }
    result = await serverSubmit(payload);
  } else {
    result = await submitToAADEMock(payload);
  }
  
  if (result.ok) {
    // Success handling...
  } else {
    // Failure queue management...
  }
} catch (error) {
  console.error('Submission error:', error);
  setStatus({ type: 'error', msg: `Σφάλμα δικτύου: ${error.message}` });
}
```

### 2. Data Validation Error Handling
```javascript
// Form validation with user feedback
const handleSubmit = async () => {
  setStatus({ type: 'info', msg: 'Υποβολή σε AADE…' });
  
  const invoice = { branchId: branchCfg.id, invoiceDate, invoiceNumber, customer, items, surcharge };
  const errors = validateInvoiceForAADE(invoice, branchCfg);
  
  if (errors.length) {
    setStatus({ type: 'error', msg: errors.join('\n') });
    return;
  }
  
  // Continue with submission...
};
```

### 3. Storage Error Handling
```javascript
// Safe localStorage operations
const [customers, setCustomers] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem(storageKeyCustomers('central')) || '[]');
  } catch {
    return [];
  }
});
```

## Performance Optimization Strategies

### 1. Memoization
```javascript
// Expensive calculations cached with useMemo
const totals = useMemo(() => calcTotals(items), [items]);
const branchCfg = useMemo(() => BRANCHES[branch], [branch]);
```

### 2. Conditional Rendering
```javascript
// Render optimization for large lists
{customers.length === 0 ? (
  <div className="text-sm text-gray-500 mt-2">Κανένας αποθηκευμένος πελάτης.</div>
) : (
  <table className="w-full text-sm mt-2">
    {/* Large table content */}
  </table>
)}
```

### 3. Event Handler Optimization
```javascript
// Efficient array updates
const updateItem = (index, field, value) => {
  setItems(prev => prev.map((item, i) => 
    i === index ? { ...item, [field]: value } : item
  ));
};
```

## Testing Strategy

### 1. Component Testing
```javascript
// Built-in test panel for validation
function TestsPanel() {
  const [results, setResults] = useState([]);
  
  const runTests = async () => {
    const out = [];
    
    // Test case 1: Restaurant VAT mix
    const inv1 = {
      branchId: 'central',
      invoiceDate: '2025-08-14',
      invoiceNumber: 'TST-0001',
      customer: { name: 'ACME SA', vat: '123456789' },
      items: [
        { description: 'Γεύμα', qty: 2, price: 10, vatRate: 13 },
        { description: 'Ποτό', qty: 1, price: 8, vatRate: 24 }
      ],
      surcharge: 0
    };
    
    const cfg1 = BRANCHES[inv1.branchId];
    const errs1 = validateInvoiceForAADE(inv1, cfg1);
    const p1 = buildMyDataPayload(inv1, cfg1);
    const cond1 = errs1.length === 0 && p1.totals.net === 28 && p1.totals.vat === 4.52;
    
    out.push({ name: 'Restaurant basic VAT mix', pass: cond1, detail: p1 });
    
    // Additional test cases...
    setResults(out);
  };
  
  return (
    // Test panel UI...
  );
}
```

### 2. Integration Testing
- Complete invoice submission workflow
- Customer management operations
- PDF generation functionality
- Error scenario handling

## Deployment Considerations

### 1. Build Optimization
- Bundle size minimization
- Code splitting for large components
- Asset optimization (images, fonts)
- CDN utilization for external libraries

### 2. Runtime Performance
- localStorage size monitoring
- Memory leak prevention
- Event listener cleanup
- Efficient re-rendering patterns

### 3. Browser Compatibility
- ES6+ feature support
- PDF generation library compatibility
- LocalStorage availability checking
- Graceful degradation strategies

---

**Component Architecture Version**: 1.0.0  
**Last Updated**: January 2025  
**Framework**: React 18 with Hooks  
**Pattern**: Functional Components with Local State Management

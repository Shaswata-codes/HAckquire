# 📄 Client-Side High-Fidelity PDF Generation Engine

## Overview
This standalone, lightweight client-side PDF generation engine generates vector-quality, printable, and branded business invoices directly in the user's browser without requiring server-side headless browsers (like Puppeteer or Chromium).

---

## 🌟 Key Features

- **Zero Backend Dependencies**: Runs entirely in the client browser using `jsPDF`.
- **Dynamic Mathematical Calculation**: Automatically breaks down Subtotals, GST/Tax Rates, Discounts, and Due Amounts.
- **Corporate Styling**: Styled headers, table zebra striping, currency formatting (₹ INR), payment status indicators, and customizable terms.
- **Fast Execution**: Renders and triggers the download in under 300ms.
- **Privacy First**: Sensitive customer billing details are never sent to external third-party PDF rendering APIs.

---

## 📦 How to Integrate (Plug & Play)

### 1. Installation
```bash
npm install jspdf
```

### 2. Usage in React / JavaScript

```javascript
import { downloadInvoicePDF } from './utils/helpers';

// Sample Invoice Object
const invoice = {
  invoiceNumber: "INV-001",
  clientName: "Rahul Sharma",
  clientEmail: "rahul@example.com",
  clientPhone: "+91-9876543210",
  clientAddress: "Sector 15, Noida, UP",
  issueDate: new Date(),
  dueDate: new Date(Date.now() + 7 * 86400000),
  items: [
    { description: "AC Repair & Servicing", quantity: 1, rate: 2500, amount: 2500 },
    { description: "AC Filter Replacement", quantity: 1, rate: 600, amount: 600 }
  ],
  subtotal: 3100,
  taxRate: 18,
  taxAmount: 558,
  discount: 0,
  total: 3658,
  amountPaid: 0,
  amountDue: 3658,
  notes: "Warranty applicable for 30 days."
};

// Business Profile
const user = {
  businessName: "Rajesh Electricals & Services",
  phone: "+91-9876543210",
  address: "Shop 12, Sector 5, Noida",
  gstNumber: "09AABCU9603R1ZP"
};

// Trigger instant download
downloadInvoicePDF(invoice, user);
```

---

## 🎯 Commercial & Pitch Value
- **Target Buyers**: Any hackathon team building accounting tools, freelancer marketplaces, e-commerce checkouts, or billing apps that need instant client-side invoice generation without server costs.

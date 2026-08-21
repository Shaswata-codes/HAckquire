# 🔔 Smart Due Tracker & 1-Click WhatsApp/SMS Dispatcher

## Overview
A plug-and-play reminder and cashflow recovery engine that automatically filters receivables into **Overdue** and **Due Soon** buckets, calculating at-risk amounts and generating pre-formatted, 1-click **WhatsApp** and **SMS** payment reminders without expensive SMS gateway APIs.

---

## 🌟 Key Features

- **Automated Due Segmentation**:
  - `Overdue`: Invoices past due date with outstanding balance.
  - `Due Soon`: Invoices maturing within the next 7 days.
- **Zero Paid Gateway Fees**: Uses direct URI schemes (`https://wa.me/...` and `sms:...`) to launch WhatsApp and SMS apps natively with pre-filled messages.
- **At-Risk Amount Tracker**: Computes total outstanding money at risk.
- **RESTful API Endpoint**: `GET /api/invoices/reminders`.

---

## 📦 How to Integrate

### 1. Backend Endpoint (`GET /api/invoices/reminders`)

```javascript
// Response Example
{
  "overdue": [
    {
      "_id": "66b1...",
      "invoiceNumber": "INV-004",
      "clientName": "Suresh Patel",
      "clientPhone": "+91-9845678901",
      "amountDue": 1750,
      "dueDate": "2026-08-08T00:00:00.000Z",
      "status": "overdue"
    }
  ],
  "dueSoon": [
    {
      "_id": "66b2...",
      "invoiceNumber": "INV-003",
      "clientName": "Priya Singh",
      "clientPhone": "+91-9834567890",
      "amountDue": 5800,
      "dueDate": "2026-08-23T00:00:00.000Z",
      "status": "sent"
    }
  ]
}
```

### 2. Frontend 1-Click Dispatcher Functions

```javascript
// Generate pre-encoded WhatsApp reminder link
export const getWhatsAppLink = (phone, invoiceNumber, amount, clientName) => {
  const cleanPhone = phone?.replace(/[^0-9]/g, '') || '';
  const message = encodeURIComponent(
    `Dear ${clientName}, this is a reminder that Invoice ${invoiceNumber} of ₹${amount} is due. Please arrange payment at the earliest. Thank you!`
  );
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${message}`;
  }
  return `https://wa.me/?text=${message}`;
};

// Generate pre-encoded SMS link
export const getSMSLink = (phone, invoiceNumber, amount, clientName) => {
  const cleanPhone = phone?.replace(/[^0-9]/g, '') || '';
  const body = encodeURIComponent(
    `Dear ${clientName}, Invoice ${invoiceNumber} for ₹${amount} is due. Please pay ASAP. - Hackquire`
  );
  return `sms:${cleanPhone}?body=${body}`;
};
```

---

## 🎯 Commercial & Pitch Value
- **Target Buyers**: Any hackathon team building small business software, gym/tuition fee management, medical billing, or freelancer platforms that need to reduce payment collection delays.

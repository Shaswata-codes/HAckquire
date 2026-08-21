// Format currency in INR
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// Format date
export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Get days until due
export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  const diff = new Date(dueDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    paid: 'badge-paid',
    sent: 'badge-sent',
    overdue: 'badge-overdue',
    partial: 'badge-partial',
    draft: 'badge-draft',
    matched: 'badge-matched',
    unmatched: 'badge-unmatched',
  };
  return colors[status] || 'badge-draft';
};

// WhatsApp reminder link
export const getWhatsAppLink = (phone, invoiceNumber, amount, clientName) => {
  const cleanPhone = phone?.replace(/[^0-9]/g, '') || '';
  const message = encodeURIComponent(
    `Dear ${clientName}, this is a reminder that Invoice ${invoiceNumber} of ${formatCurrency(amount)} is due. Please arrange payment at the earliest. Thank you!`
  );
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${message}`;
  }
  return `https://wa.me/?text=${message}`;
};

// SMS link
export const getSMSLink = (phone, invoiceNumber, amount, clientName) => {
  const cleanPhone = phone?.replace(/[^0-9]/g, '') || '';
  const body = encodeURIComponent(
    `Dear ${clientName}, Invoice ${invoiceNumber} for ${formatCurrency(amount)} is due. Please pay ASAP. - Hackquire`
  );
  return `sms:${cleanPhone}?body=${body}`;
};

// Generate PDF invoice
export const downloadInvoicePDF = async (invoice, user) => {
  const { jsPDF } = await import('jspdf');
  
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageW = 210;
  const margin = 20;
  let y = margin;

  // Header background
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageW, 50, 'F');

  // Business name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(user?.businessName || 'Your Business', margin, 22);

  // Invoice label
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('INVOICE', pageW - margin, 16, { align: 'right' });
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.invoiceNumber, pageW - margin, 26, { align: 'right' });

  // Dates
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Issue Date: ${formatDate(invoice.issueDate)}`, pageW - margin, 34, { align: 'right' });
  doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, pageW - margin, 40, { align: 'right' });

  y = 65;

  // Bill To
  doc.setTextColor(50, 50, 80);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 60);
  doc.setFontSize(12);
  doc.text(invoice.clientName, margin, y);
  y += 6;
  doc.setFontSize(9);
  if (invoice.clientEmail) { doc.text(invoice.clientEmail, margin, y); y += 5; }
  if (invoice.clientPhone) { doc.text(invoice.clientPhone, margin, y); y += 5; }
  if (invoice.clientAddress) { doc.text(invoice.clientAddress, margin, y); y += 5; }

  y += 10;

  // Items table header
  doc.setFillColor(240, 240, 255);
  doc.rect(margin, y, pageW - 2 * margin, 10, 'F');
  doc.setTextColor(50, 50, 100);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', margin + 3, y + 7);
  doc.text('QTY', 130, y + 7, { align: 'center' });
  doc.text('RATE', 155, y + 7, { align: 'center' });
  doc.text('AMOUNT', pageW - margin - 3, y + 7, { align: 'right' });
  y += 14;

  // Items
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 70);
  invoice.items.forEach((item, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(248, 248, 255);
      doc.rect(margin, y - 5, pageW - 2 * margin, 10, 'F');
    }
    doc.text(item.description, margin + 3, y);
    doc.text(String(item.quantity), 130, y, { align: 'center' });
    doc.text(`₹${item.rate.toLocaleString('en-IN')}`, 155, y, { align: 'center' });
    doc.text(`₹${item.amount.toLocaleString('en-IN')}`, pageW - margin - 3, y, { align: 'right' });
    y += 10;
  });

  y += 5;

  // Totals
  const totalsX = 140;
  doc.setDrawColor(230, 230, 240);
  doc.line(totalsX, y, pageW - margin, y);
  y += 8;

  doc.setFontSize(10);
  const addTotal = (label, value, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(50, 50, 80);
    doc.text(label, totalsX, y);
    doc.text(`₹${value.toLocaleString('en-IN')}`, pageW - margin, y, { align: 'right' });
    y += 8;
  };

  addTotal('Subtotal:', invoice.subtotal);
  if (invoice.taxRate > 0) addTotal(`Tax (${invoice.taxRate}%):`, invoice.taxAmount);
  if (invoice.discount > 0) addTotal('Discount:', -invoice.discount);

  doc.setDrawColor(99, 102, 241);
  doc.line(totalsX, y, pageW - margin, y);
  y += 8;

  doc.setFontSize(12);
  doc.setTextColor(99, 102, 241);
  addTotal('TOTAL:', invoice.total, true);

  if (invoice.amountPaid > 0) {
    doc.setTextColor(16, 185, 129);
    addTotal('Amount Paid:', invoice.amountPaid);
    doc.setTextColor(239, 68, 68);
    addTotal('Amount Due:', invoice.amountDue, true);
  }

  // Notes
  if (invoice.notes) {
    y += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 80);
    doc.text('NOTES:', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 100);
    const lines = doc.splitTextToSize(invoice.notes, pageW - 2 * margin);
    doc.text(lines, margin, y);
    y += lines.length * 5;
  }

  // Footer
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 280, pageW, 17, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Generated by Hackquire — AI-Powered Invoicing', pageW / 2, 290, { align: 'center' });

  doc.save(`${invoice.invoiceNumber}.pdf`);
};

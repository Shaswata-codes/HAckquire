import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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

// Generate high-fidelity Unicode & Indic PDF invoice supporting all Indian languages
export const downloadInvoicePDF = async (invoice, user) => {
  // Create an off-screen container with full Unicode & Indic font support
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '794px'; // Standard A4 width at 96 DPI
  container.style.minHeight = '1123px'; // Standard A4 height
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1e293b';
  container.style.fontFamily = "'Inter', 'Segoe UI', 'Noto Sans', 'Noto Sans Bengali', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans Telugu', sans-serif";
  container.style.padding = '0';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  const itemsHtml = (invoice.items || [])
    .map((item, i) => `
      <tr style="background-color: ${i % 2 === 1 ? '#f8fafc' : '#ffffff'}; border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 12px 16px; font-size: 13px; color: #1e293b; font-weight: 500;">
          ${item.description || 'Service'}
        </td>
        <td style="padding: 12px 16px; font-size: 13px; color: #475569; text-align: center;">
          ${item.quantity || 1}
        </td>
        <td style="padding: 12px 16px; font-size: 13px; color: #475569; text-align: right;">
          ₹${(item.rate || 0).toLocaleString('en-IN')}
        </td>
        <td style="padding: 12px 16px; font-size: 13px; color: #0f172a; text-align: right; font-weight: 600;">
          ₹${((item.quantity || 1) * (item.rate || 0)).toLocaleString('en-IN')}
        </td>
      </tr>
    `)
    .join('');

  container.innerHTML = `
    <div style="background-color: #ffffff; min-height: 1123px; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <!-- Top Header Banner -->
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #06b6d4 100%); color: #ffffff; padding: 36px 40px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <div style="width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold;">⚡</div>
              <span style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${user?.businessName || user?.name || 'Hackquire'}</span>
            </div>
            <div style="font-size: 12px; opacity: 0.9; margin-top: 4px;">${user?.email || 'Verified Invoice'}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; opacity: 0.9;">INVOICE</div>
            <div style="font-size: 22px; font-weight: 800; margin-top: 2px; letter-spacing: -0.5px;">#${invoice.invoiceNumber || 'INV-001'}</div>
            <div style="font-size: 11px; opacity: 0.85; margin-top: 6px;">Issue Date: ${formatDate(invoice.issueDate || new Date())}</div>
            <div style="font-size: 11px; opacity: 0.85;">Due Date: ${formatDate(invoice.dueDate)}</div>
          </div>
        </div>

        <!-- Bill To Section -->
        <div style="padding: 32px 40px 20px 40px;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6366f1; margin-bottom: 6px;">
            BILL TO
          </div>
          <div style="font-size: 18px; font-weight: 700; color: #0f172a;">
            ${invoice.clientName || 'Valued Client'}
          </div>
          ${invoice.clientEmail ? `<div style="font-size: 13px; color: #64748b; margin-top: 3px;">📧 ${invoice.clientEmail}</div>` : ''}
          ${invoice.clientPhone ? `<div style="font-size: 13px; color: #64748b; margin-top: 2px;">📞 ${invoice.clientPhone}</div>` : ''}
          ${invoice.clientAddress ? `<div style="font-size: 13px; color: #64748b; margin-top: 2px;">📍 ${invoice.clientAddress}</div>` : ''}
        </div>

        <!-- Items Table -->
        <div style="padding: 0 40px;">
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                <th style="padding: 12px 16px; text-align: left;">Description</th>
                <th style="padding: 12px 16px; text-align: center; width: 80px;">Qty</th>
                <th style="padding: 12px 16px; text-align: right; width: 120px;">Rate</th>
                <th style="padding: 12px 16px; text-align: right; width: 130px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <!-- Totals & Notes Section -->
        <div style="padding: 24px 40px; display: flex; justify-content: space-between; gap: 30px;">
          <!-- Notes -->
          <div style="flex: 1; max-width: 55%;">
            ${invoice.notes ? `
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin-bottom: 6px;">
                  NOTES / TERMS
                </div>
                <div style="font-size: 12px; color: #334155; line-height: 1.6; word-break: break-word;">
                  ${invoice.notes}
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Summary Box -->
          <div style="width: 260px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px;">
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 8px;">
              <span>Subtotal</span>
              <span style="font-weight: 600; color: #1e293b;">₹${(invoice.subtotal || 0).toLocaleString('en-IN')}</span>
            </div>
            ${invoice.taxRate > 0 ? `
              <div style="display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 8px;">
                <span>Tax (${invoice.taxRate}%)</span>
                <span style="font-weight: 600; color: #1e293b;">₹${(invoice.taxAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            ` : ''}
            ${invoice.discount > 0 ? `
              <div style="display: flex; justify-content: space-between; font-size: 13px; color: #10b981; margin-bottom: 8px;">
                <span>Discount</span>
                <span style="font-weight: 600;">-₹${(invoice.discount || 0).toLocaleString('en-IN')}</span>
              </div>
            ` : ''}
            <div style="border-top: 2px solid #e2e8f0; margin-top: 10px; padding-top: 10px; display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-size: 15px; font-weight: 800; color: #0f172a;">Total</span>
              <span style="font-size: 20px; font-weight: 800; color: #4f46e5;">₹${(invoice.total || 0).toLocaleString('en-IN')}</span>
            </div>
            ${invoice.amountPaid > 0 ? `
              <div style="display: flex; justify-content: space-between; font-size: 12px; color: #10b981; margin-top: 8px;">
                <span>Amount Paid</span>
                <span style="font-weight: 600;">₹${(invoice.amountPaid || 0).toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; color: #ef4444; font-weight: 700; margin-top: 4px;">
                <span>Amount Due</span>
                <span>₹${(invoice.amountDue || 0).toLocaleString('en-IN')}</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Bottom Footer -->
      <div style="padding: 20px 40px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 11px; margin-top: 30px;">
        Generated by <strong>Hackquire</strong> — AI-Powered Invoicing & Payment Reconciliation
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // 2x resolution for razor-sharp text
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${invoice.invoiceNumber || 'Invoice'}.pdf`);
  } catch (error) {
    console.error('PDF generation error:', error);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

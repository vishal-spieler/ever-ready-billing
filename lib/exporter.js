import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';

applyPlugin(jsPDF);

// Helper to format currency
const formatCurrency = (val) => {
  return '₹' + (val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Helper to convert number to Indian words
export const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero Only';
  let result = '';
  let crore = Math.floor(num / 10000000);
  let lakh = Math.floor((num % 10000000) / 100000);
  let thousand = Math.floor((num % 100000) / 1000);
  let hundred = Math.floor((num % 1000) / 100);
  let rest = Math.floor(num % 100);

  if (crore > 0) result += ones[crore] + ' Crore ';
  if (lakh > 0) result += ones[lakh] + ' Lakh ';
  if (thousand > 0) result += ones[thousand] + ' Thousand ';
  if (hundred > 0) result += ones[hundred] + ' Hundred ';
  
  if (rest >= 20) result += tens[Math.floor(rest / 10)] + (rest % 10 > 0 ? ' ' + ones[rest % 10] : '') + ' ';
  else if (rest > 0) result += (rest < 10 ? ones[rest] : teens[rest - 10]) + ' ';
  
  return result.trim() + ' Only';
};

// ═══════════════════════════════════════════════════════════════════
// EXCEL EXPORT
// ═══════════════════════════════════════════════════════════════════

export async function exportToExcel({ invoices = [], payments = [], clients = [], quotations = [], companyName = 'EVER READY ENGINEERS' }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = companyName;
  workbook.lastModifiedBy = companyName;
  workbook.created = new Date();

  // 1. SHEET 1: INVOICE SUMMARY
  const summarySheet = workbook.addWorksheet('Invoice Summary');
  summarySheet.views = [{ showGridLines: true }];

  // Title block
  summarySheet.mergeCells('A1:L1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = `${companyName} - INVOICE SUMMARY`;
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1B2A4A' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  summarySheet.getRow(1).height = 40;

  // Header row
  const summaryHeaders = [
    'Invoice No', 'Invoice Date', 'Client Name', 'PO No', 'PO Date', 
    'Tax Type', 'Subtotal', 'CGST', 'SGST', 'IGST', 'Gross Total', 'Status'
  ];
  summarySheet.getRow(3).values = summaryHeaders;
  summarySheet.getRow(3).font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
  summarySheet.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2F4F4F' } };
  summarySheet.getRow(3).alignment = { vertical: 'middle', horizontal: 'center' };
  summarySheet.getRow(3).height = 25;

  let summaryRowIndex = 4;
  invoices.forEach(inv => {
    const row = summarySheet.getRow(summaryRowIndex++);
    row.values = [
      inv.invoiceNo || inv.invoice_no,
      inv.invoiceDate || inv.invoice_date,
      inv.clientName || (inv.clients ? inv.clients.name : ''),
      inv.poNo || inv.po_no || '—',
      inv.poDate || inv.po_date || '—',
      inv.taxType || inv.tax_type,
      inv.subtotal,
      inv.cgstAmount || inv.cgst_amount || 0,
      inv.sgstAmount || inv.sgst_amount || 0,
      inv.igstAmount || inv.igst_amount || 0,
      inv.grossTotal || inv.gross_total,
      inv.payment_status || 'UNPAID'
    ];
    row.height = 20;

    // Alignment and formats
    row.getCell(7).numFmt = '₹#,##0.00';
    row.getCell(8).numFmt = '₹#,##0.00';
    row.getCell(9).numFmt = '₹#,##0.00';
    row.getCell(10).numFmt = '₹#,##0.00';
    row.getCell(11).numFmt = '₹#,##0.00';

    // Status colors
    const statusCell = row.getCell(12);
    let color = '7F8C8D';
    if (inv.payment_status === 'PAID') color = '27AE60';
    else if (inv.payment_status === 'PARTIAL') color = 'F39C12';
    else if (inv.payment_status === 'OVERPAID') color = '8E44AD';
    else if (inv.payment_status === 'UNPAID') color = 'C0392B';

    statusCell.font = { bold: true, color: { argb: color } };
  });

  // Enable filters
  summarySheet.autoFilter = `A3:L${summaryRowIndex - 1}`;

  // 2. SHEET 2: INVOICE LINE ITEMS (WITH EXPANDABLE OUTLINE)
  const itemsSheet = workbook.addWorksheet('Invoice Line Items');
  itemsSheet.views = [{ showGridLines: true }];

  itemsSheet.mergeCells('A1:G1');
  const titleCell2 = itemsSheet.getCell('A1');
  titleCell2.value = `${companyName} - INVOICE LINE ITEMS (OUTLINE VIEW)`;
  titleCell2.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  titleCell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1B2A4A' } };
  titleCell2.alignment = { vertical: 'middle', horizontal: 'center' };
  itemsSheet.getRow(1).height = 40;

  const itemHeaders = ['Invoice / Item Name', 'Description', 'HSN Code', 'Qty', 'Rate', 'Total', 'Details'];
  itemsSheet.getRow(3).values = itemHeaders;
  itemsSheet.getRow(3).font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
  itemsSheet.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2F4F4F' } };
  itemsSheet.getRow(3).alignment = { vertical: 'middle', horizontal: 'center' };
  itemsSheet.getRow(3).height = 25;

  let itemRowIndex = 4;
  invoices.forEach(inv => {
    // Parent Row (Invoice Header)
    const parentRow = itemsSheet.getRow(itemRowIndex++);
    parentRow.values = [
      inv.invoiceNo || inv.invoice_no,
      inv.clientName || (inv.clients ? inv.clients.name : ''),
      '',
      '',
      'Total:',
      inv.grossTotal || inv.gross_total,
      'Invoice Header'
    ];
    parentRow.font = { bold: true };
    parentRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EAECEE' } };
    parentRow.getCell(6).numFmt = '₹#,##0.00';
    parentRow.height = 22;

    // Child Rows (Items)
    const items = inv.items || [];
    items.forEach(item => {
      const childRow = itemsSheet.getRow(itemRowIndex++);
      childRow.values = [
        `Item ${item.sr}`,
        item.desc || item.description,
        item.hsn || '—',
        item.qty,
        item.rate,
        item.total,
        'Line Item'
      ];
      childRow.outlineLevel = 1;
      childRow.getCell(5).numFmt = '₹#,##0.00';
      childRow.getCell(6).numFmt = '₹#,##0.00';
      childRow.height = 18;
    });
  });

  // Enable outlines settings
  itemsSheet.properties.outlineProperties = {
    summaryBelow: false,
    summaryRight: false
  };

  // 3. SHEET 3: PAYMENT HISTORY
  const paymentsSheet = workbook.addWorksheet('Payment History');
  paymentsSheet.views = [{ showGridLines: true }];

  paymentsSheet.mergeCells('A1:G1');
  const titleCell3 = paymentsSheet.getCell('A1');
  titleCell3.value = `${companyName} - PAYMENT HISTORY`;
  titleCell3.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  titleCell3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1B2A4A' } };
  titleCell3.alignment = { vertical: 'middle', horizontal: 'center' };
  paymentsSheet.getRow(1).height = 40;

  const paymentHeaders = ['Payment Date', 'Invoice No', 'Client Name', 'Amount', 'Payment Mode', 'Reference No', 'Notes'];
  paymentsSheet.getRow(3).values = paymentHeaders;
  paymentsSheet.getRow(3).font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
  paymentsSheet.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2F4F4F' } };
  paymentsSheet.getRow(3).alignment = { vertical: 'middle', horizontal: 'center' };
  paymentsSheet.getRow(3).height = 25;

  let paymentRowIndex = 4;
  payments.forEach(pay => {
    const row = paymentsSheet.getRow(paymentRowIndex++);
    row.values = [
      pay.payment_date,
      pay.invoice_no || (pay.invoices ? pay.invoices.invoice_no : ''),
      pay.client_name || (pay.invoices && pay.invoices.clients ? pay.invoices.clients.name : ''),
      pay.amount,
      pay.payment_mode,
      pay.reference_number || '—',
      pay.notes || '—'
    ];
    row.height = 20;
    row.getCell(4).numFmt = '₹#,##0.00';
  });

  paymentsSheet.autoFilter = `A3:G${paymentRowIndex - 1}`;

  // 4. Auto-size columns for all sheets
  workbook.worksheets.forEach(sheet => {
    sheet.columns.forEach(col => {
      let maxLen = 0;
      col.eachCell({ includeEmpty: true }, cell => {
        if (cell.value) {
          const sVal = cell.value.toString();
          if (sVal.length > maxLen) maxLen = sVal.length;
        }
      });
      col.width = Math.max(maxLen + 3, 12);
    });
  });

  // Export buffer
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Download file in browser
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `EverReady_Billing_Summary_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════════════
// PDF EXPORT: INVOICE
// ═══════════════════════════════════════════════════════════════════

export async function exportInvoicePDF({ invoice, companySettings }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header Brand Card
  doc.setDrawColor(27, 42, 74);
  doc.setLineWidth(1.5);
  doc.rect(10, 10, pageWidth - 20, 48); // border box

  // Company logo text / name
  doc.setTextColor(27, 42, 74);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(companySettings.name, 15, 22);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const addrLines = doc.splitTextToSize(companySettings.address, pageWidth - 100);
  doc.text(addrLines, 15, 30);
  doc.text(`Mob: ${companySettings.phone} | Email: ${companySettings.email}`, 15, 46);

  // Invoice label & logo box
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(pageWidth - 80, 10, pageWidth - 80, 58); // divider line

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(27, 42, 74);
  doc.text('INVOICE', pageWidth - 70, 24);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Invoice No: ${invoice.invoiceNo || invoice.invoice_no}`, pageWidth - 70, 32);
  doc.text(`Date: ${invoice.invoiceDate || invoice.invoice_date}`, pageWidth - 70, 38);
  doc.text(`GSTIN: ${companySettings.gstin}`, pageWidth - 70, 44);
  doc.text(`PAN: ${companySettings.pan}`, pageWidth - 70, 50);

  // Client Details Row
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(27, 42, 74);
  doc.text('BILL TO:', 10, 68);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 30);
  doc.text(invoice.clientName || 'N/A', 10, 74);
  doc.text(invoice.clientAddress || '', 10, 80);
  doc.text(`${invoice.clientCity || ''} - ${invoice.clientPin || ''}`, 10, 86);
  doc.text(`Mobile: ${invoice.clientMobile || ''}`, 10, 92);
  if (invoice.clientGstin) doc.text(`GSTIN: ${invoice.clientGstin}`, 10, 98);

  // PO details on the right
  doc.setFont('Helvetica', 'bold');
  doc.text('DELIVERY / PO DETAILS:', pageWidth - 90, 68);
  doc.setFont('Helvetica', 'normal');
  doc.text(`PO No: ${invoice.poNo || invoice.po_no || '—'}`, pageWidth - 90, 74);
  doc.text(`PO Date: ${invoice.poDate || invoice.po_date || '—'}`, pageWidth - 90, 80);
  doc.text(`Tax Type: ${invoice.taxType || invoice.tax_type}`, pageWidth - 90, 86);

  // Line Items Table
  const tableHeaders = [['Sr', 'Material Description', 'HSN Code', 'Qty', 'Rate', 'Total']];
  const tableData = (invoice.items || []).map(item => [
    item.sr,
    item.desc || item.description,
    item.hsn || '—',
    item.qty,
    formatCurrency(item.rate),
    formatCurrency(item.total)
  ]);

  doc.autoTable({
    startY: 105,
    head: tableHeaders,
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [27, 42, 74], textColor: [255, 255, 255], halign: 'center' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 24, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 32, halign: 'right' },
      5: { cellWidth: 35, halign: 'right' }
    },
    styles: { fontSize: 8.5 }
  });

  let currentY = doc.lastAutoTable.finalY + 10;

  // Subtotal block
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 30);

  const rightAlignX = pageWidth - 10;
  const leftAlignLabelX = pageWidth - 90;

  doc.text('Subtotal:', leftAlignLabelX, currentY);
  doc.text(formatCurrency(invoice.subtotal), rightAlignX, currentY, { align: 'right' });
  currentY += 6;

  // Discount row (only if non-zero)
  const discount = invoice.discount || 0;
  if (discount > 0) {
    doc.setTextColor(192, 57, 43);
    doc.text('Discount:', leftAlignLabelX, currentY);
    doc.text('- ' + formatCurrency(discount), rightAlignX, currentY, { align: 'right' });
    currentY += 6;

    // Taxable Amount row
    doc.setTextColor(30, 30, 30);
    const taxableAmount = Math.max(0, (invoice.subtotal || 0) - discount);
    doc.text('Taxable Amount:', leftAlignLabelX, currentY);
    doc.text(formatCurrency(taxableAmount), rightAlignX, currentY, { align: 'right' });
    currentY += 6;
  }

  doc.setTextColor(30, 30, 30);

  if ((invoice.taxType || invoice.tax_type) === 'CGST_SGST') {
    doc.text(`CGST (${invoice.cgstRate || invoice.cgst_rate || 9}%):`, leftAlignLabelX, currentY);
    doc.text(formatCurrency(invoice.cgstAmount || invoice.cgst_amount), rightAlignX, currentY, { align: 'right' });
    currentY += 6;

    doc.text(`SGST (${invoice.sgstRate || invoice.sgst_rate || 9}%):`, leftAlignLabelX, currentY);
    doc.text(formatCurrency(invoice.sgstAmount || invoice.sgst_amount), rightAlignX, currentY, { align: 'right' });
    currentY += 6;
  } else if ((invoice.taxType || invoice.tax_type) === 'IGST') {
    doc.text(`IGST (${invoice.igstRate || invoice.igst_rate || 18}%):`, leftAlignLabelX, currentY);
    doc.text(formatCurrency(invoice.igstAmount || invoice.igst_amount), rightAlignX, currentY, { align: 'right' });
    currentY += 6;
  }

  // Transport Charges row (only if non-zero)
  const transportCharges = invoice.transportCharges || invoice.transport_charges || 0;
  if (transportCharges > 0) {
    doc.setTextColor(39, 100, 50);
    doc.text('Transport Charges:', leftAlignLabelX, currentY);
    doc.text('+ ' + formatCurrency(transportCharges), rightAlignX, currentY, { align: 'right' });
    currentY += 6;
    doc.setTextColor(30, 30, 30);
  }

  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.rect(leftAlignLabelX - 2, currentY - 4, 82, 10);
  doc.text('Grand Total:', leftAlignLabelX, currentY + 2.5);
  doc.text(formatCurrency(invoice.grossTotal || invoice.gross_total), rightAlignX, currentY + 2.5, { align: 'right' });
  currentY += 12;

  // Paid & Pending Amounts
  const totalPaid = invoice.total_paid || 0;
  const remaining = invoice.remaining_amount !== undefined ? invoice.remaining_amount : (invoice.grossTotal || invoice.gross_total || 0);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 30);
  doc.text('Amount Received:', leftAlignLabelX, currentY);
  doc.text(formatCurrency(totalPaid), rightAlignX, currentY, { align: 'right' });
  currentY += 6;

  doc.setFont('Helvetica', 'bold');
  if (remaining > 0) {
    doc.setTextColor(192, 57, 43); // Red color for pending balance
  } else {
    doc.setTextColor(39, 174, 96); // Green color if settled
  }
  doc.text('Pending Amount:', leftAlignLabelX, currentY);
  doc.text(formatCurrency(remaining), rightAlignX, currentY, { align: 'right' });
  doc.setTextColor(30, 30, 30); // Reset color
  currentY += 10;

  // Words Total
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Amount in words:', 10, currentY);
  doc.setFont('Helvetica', 'italic');
  doc.text(numberToWords(invoice.grossTotal), 10, currentY + 5);

  currentY += 15;

  // Bank Credentials Card
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 249, 250);
  doc.rect(10, currentY, 110, 35, 'FD'); // fill and stroke

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(27, 42, 74);
  doc.text('BANK ACCOUNT DETAILS:', 13, currentY + 6);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);
  doc.text(`Bank Name: ${companySettings.bankName}`, 13, currentY + 12);
  doc.text(`Branch: ${companySettings.bankBranch}`, 13, currentY + 17);
  doc.text(`A/c Name: ${companySettings.accountName}`, 13, currentY + 22);
  doc.text(`A/c No: ${companySettings.accountNo}`, 13, currentY + 27);
  doc.text(`IFSC Code: ${companySettings.ifscCode}`, 13, currentY + 32);

  // Signature Block
  const sigX = pageWidth - 65;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(27, 42, 74);
  doc.text(`For ${companySettings.name}`, sigX, currentY + 6);
  
  doc.line(sigX, currentY + 28, sigX + 50, currentY + 28);
  doc.setFont('Helvetica', 'normal');
  doc.text('Authorised Signatory', sigX + 10, currentY + 32);

  // Save PDF
  doc.save(`${invoice.invoiceNo || invoice.invoice_no}_Invoice.pdf`);
}

// ═══════════════════════════════════════════════════════════════════
// PDF EXPORT: RECEIPT
// ═══════════════════════════════════════════════════════════════════

export async function exportReceiptPDF({ payment, invoice, companySettings }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Outer Border Box
  doc.setDrawColor(27, 42, 74);
  doc.setLineWidth(1.5);
  doc.rect(10, 10, pageWidth - 20, doc.internal.pageSize.height - 20);

  // Header Title
  doc.setFillColor(27, 42, 74);
  doc.rect(11, 11, pageWidth - 22, 25, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('PAYMENT RECEIPT', pageWidth / 2, 24, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.text(companySettings.name, pageWidth / 2, 30, { align: 'center' });

  // Receipt meta details
  doc.setFontSize(9.5);
  doc.setTextColor(50, 50, 50);
  doc.text(`Receipt Date: ${payment.payment_date}`, 20, 50);
  doc.text(`Payment ID: PMT-${payment.id}`, 20, 56);
  doc.text(`Invoice Ref: ${invoice.invoice_no || invoice.invoiceNo}`, pageWidth - 80, 50);

  // Main details Box
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(250, 250, 250);
  doc.rect(20, 65, pageWidth - 40, 70, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(27, 42, 74);
  doc.setFontSize(11);
  doc.text('RECEIPT DETAILS:', 25, 74);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 30);
  
  doc.text(`Received From:  ${invoice.clientName || invoice.clients?.name || 'Client Name'}`, 25, 84);
  doc.text(`Payment Mode:   ${payment.payment_mode}`, 25, 92);
  doc.text(`Reference No:   ${payment.reference_number || '—'}`, 25, 100);
  doc.text(`Amount Paid:    ${formatCurrency(payment.amount)}`, 25, 108);
  doc.text(`Notes:          ${payment.notes || '—'}`, 25, 116);
  
  // Total in Words
  doc.setFont('Helvetica', 'italic');
  doc.text(`(${numberToWords(payment.amount)})`, 25, 126);

  // Invoice Balance Statement Box
  const startY = 145;
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(27, 42, 74);
  doc.text('INVOICE BALANCE SUMMARY:', 20, startY);

  const balHeaders = [['Grand Total', 'Total Paid', 'Outstanding Balance']];
  const balData = [[
    formatCurrency(invoice.grossTotal || invoice.gross_total),
    formatCurrency(invoice.total_paid),
    formatCurrency(invoice.remaining_amount)
  ]];

  doc.autoTable({
    startY: startY + 4,
    head: balHeaders,
    body: balData,
    margin: { left: 20, right: 20 },
    theme: 'grid',
    headStyles: { fillColor: [47, 79, 79], textColor: [255, 255, 255], halign: 'center' },
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'center' },
      2: { halign: 'center' }
    },
    styles: { fontSize: 9.5 }
  });

  // Footer Branding info
  let currentY = doc.lastAutoTable.finalY + 30;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text('This is a computer generated system receipt. No signature required.', pageWidth / 2, currentY, { align: 'center' });
  doc.text(`Thank you for doing business with ${companySettings.name}!`, pageWidth / 2, currentY + 5, { align: 'center' });

  doc.save(`Receipt_PMT-${payment.id}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════
// PDF EXPORT: LEDGER
// ═══════════════════════════════════════════════════════════════════

export async function exportLedgerPDF({ client, ledgerEntries, companySettings }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header Title
  doc.setFillColor(27, 42, 74);
  doc.rect(10, 10, pageWidth - 20, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('CUSTOMER ACCOUNT STATEMENT / LEDGER', pageWidth / 2, 22, { align: 'center' });
  doc.setFontSize(9.5);
  doc.setFont('Helvetica', 'normal');
  doc.text(companySettings.name, pageWidth / 2, 28, { align: 'center' });
  doc.text(`Mobile: ${companySettings.phone} | Email: ${companySettings.email}`, pageWidth / 2, 34, { align: 'center' });

  // Client Details
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(27, 42, 74);
  doc.text('STATEMENT FOR CLIENT:', 10, 50);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 30);
  doc.text(`Client Name: ${client.name}`, 10, 56);
  doc.text(`Address: ${client.address || ''}, ${client.city || ''}`, 10, 61);
  doc.text(`Contact: ${client.contact_person || ''} (${client.mobile})`, 10, 66);
  if (client.gstin) doc.text(`GSTIN: ${client.gstin}`, 10, 71);

  // Ledger calculation summary
  const totalDebit = ledgerEntries.reduce((sum, e) => sum + (e.debit || 0), 0);
  const totalCredit = ledgerEntries.reduce((sum, e) => sum + (e.credit || 0), 0);
  const outstanding = totalDebit - totalCredit;

  doc.setFont('Helvetica', 'bold');
  doc.text('STATEMENT SUMMARY:', pageWidth - 80, 50);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Total Invoiced (Debit):  ${formatCurrency(totalDebit)}`, pageWidth - 80, 56);
  doc.text(`Total Received (Credit): ${formatCurrency(totalCredit)}`, pageWidth - 80, 61);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(192, 57, 43); // Red color for outstanding label
  doc.text(`Net Outstanding:         ${formatCurrency(outstanding)}`, pageWidth - 80, 68);

  // Table Columns: Date, Description, Debit, Credit, Balance
  const tableHeaders = [['Date', 'Description', 'Debit (Inv)', 'Credit (Pmt)', 'Balance']];
  const tableData = ledgerEntries.map(e => [
    e.date,
    e.description,
    e.debit > 0 ? formatCurrency(e.debit) : '—',
    e.credit > 0 ? formatCurrency(e.credit) : '—',
    formatCurrency(e.balance)
  ]);

  doc.autoTable({
    startY: 78,
    head: tableHeaders,
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [27, 42, 74], textColor: [255, 255, 255], halign: 'center' },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' }
    },
    styles: { fontSize: 8.5 }
  });

  doc.save(`Ledger_${client.name.replace(/\s+/g, '_')}.pdf`);
}

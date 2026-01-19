import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = (invoice) => {
  const doc = new jsPDF();
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Colors
  const primaryColor = [41, 128, 185]; // Blue
  const secondaryColor = [52, 73, 94]; // Dark gray
  const lightGray = [236, 240, 241];
  const successColor = [39, 174, 96];
  const warningColor = [243, 156, 18];
  const dangerColor = [231, 76, 60];

  // Helper function to format currency
  const formatCurrency = (amount) => `৳${parseFloat(amount || 0).toFixed(2)}`;

  // Helper function to format date
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==================== HEADER ====================
  // Company Logo/Name (Top Left)
  doc.setFillColor(...primaryColor);
  doc.rect(margin, margin, 60, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("SquadCart", margin + 5, margin + 8);

  // Invoice Title (Top Right)
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - margin, margin + 10, { align: "right" });

  // ==================== INVOICE INFO BOX ====================
  const invoiceInfoY = margin + 18;
  doc.setFillColor(...lightGray);
  doc.rect(pageWidth - 80, invoiceInfoY, 60, 30, "F");
  
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Number:", pageWidth - 75, invoiceInfoY + 6);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.invoiceNumber || "-", pageWidth - 75, invoiceInfoY + 11);
  
  doc.setFont("helvetica", "bold");
  doc.text("Transaction ID:", pageWidth - 75, invoiceInfoY + 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(invoice.transactionId || "-", pageWidth - 75, invoiceInfoY + 23);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Date:", pageWidth - 75, invoiceInfoY + 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(formatDate(invoice.createdAt), pageWidth - 75, invoiceInfoY + 33);

  // ==================== CUSTOMER INFORMATION ====================
  const customerY = invoiceInfoY;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("Bill To:", margin, customerY + 6);

  doc.setFontSize(11);
  doc.setTextColor(...secondaryColor);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.customer?.name || "-", margin, customerY + 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.customer?.companyName || "-", margin, customerY + 20);
  doc.text(invoice.customer?.email || "-", margin, customerY + 25);
  doc.text(invoice.customer?.phone || "-", margin, customerY + 30);
  doc.text(invoice.customer?.branchLocation || "-", margin, customerY + 35);

  // ==================== STATUS BADGE ====================
  const statusY = customerY + 42;
  let statusColor = warningColor;
  let statusText = invoice.status?.toUpperCase() || "PENDING";
  
  if (invoice.status === "paid") statusColor = successColor;
  else if (invoice.status === "cancelled") statusColor = dangerColor;
  
  doc.setFillColor(...statusColor);
  doc.roundedRect(margin, statusY, 35, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(statusText, margin + 17.5, statusY + 5.5, { align: "center" });

  // ==================== LINE ITEMS TABLE ====================
  const tableStartY = statusY + 15;

  // Amount breakdown data
  const tableData = [
    ["Description", "Amount Type", "Amount"],
    [
      invoice.customer?.paymentInfo?.packagename || "Service",
      invoice.amountType?.toUpperCase() || "PACKAGE",
      formatCurrency(invoice.totalAmount)
    ],
  ];

  autoTable(doc, {
    startY: tableStartY,
    head: [tableData[0]],
    body: [tableData[1]],
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold",
      halign: "left",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: secondaryColor,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 50, halign: "center" },
      2: { cellWidth: 40, halign: "right", fontStyle: "bold" },
    },
    margin: { left: margin, right: margin },
  });

  // ==================== PAYMENT SUMMARY ====================
  const summaryStartY = (doc.lastAutoTable?.finalY || tableStartY + 30) + 10;
  const summaryX = pageWidth - 70;

  // Summary box
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.5);
  doc.line(summaryX - 5, summaryStartY, pageWidth - margin, summaryStartY);

  const summaryLines = [
    { label: "Subtotal:", value: formatCurrency(invoice.totalAmount), bold: false },
    { label: "Paid Amount:", value: formatCurrency(invoice.paidAmount), bold: false, color: successColor },
    { label: "Due Amount:", value: formatCurrency(invoice.dueAmount), bold: true, color: dangerColor },
  ];

  let currentY = summaryStartY + 8;
  summaryLines.forEach((line) => {
    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
    doc.setFont("helvetica", line.bold ? "bold" : "normal");
    doc.text(line.label, summaryX, currentY);
    
    if (line.color) doc.setTextColor(...line.color);
    else doc.setTextColor(...secondaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(line.value, pageWidth - margin, currentY, { align: "right" });
    currentY += 6;
  });

  // Total box
  doc.setFillColor(...primaryColor);
  doc.rect(summaryX - 5, currentY + 2, pageWidth - summaryX + 5 - margin, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", summaryX, currentY + 9);
  doc.text(formatCurrency(invoice.totalAmount), pageWidth - margin, currentY + 9, { align: "right" });

  // ==================== PAYMENT DETAILS ====================
  let paymentDetailsY = currentY + 20;

  if (invoice.bankPayment) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("Bank Payment Details:", margin, paymentDetailsY);

    doc.setFillColor(...lightGray);
    doc.rect(margin, paymentDetailsY + 3, pageWidth - 2 * margin, 25, "F");

    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
    doc.setFont("helvetica", "normal");
    
    const bankDetails = [
      [`Bank Name: ${invoice.bankPayment.bankName}`, `Amount: ${formatCurrency(invoice.bankPayment.amount)}`],
      [`Account Last Digits: ${invoice.bankPayment.accLastDigit}`, `Status: ${invoice.bankPayment.status?.toUpperCase()}`],
    ];

    let bankY = paymentDetailsY + 10;
    bankDetails.forEach((row) => {
      doc.text(row[0], margin + 5, bankY);
      doc.text(row[1], margin + 90, bankY);
      bankY += 6;
    });

    paymentDetailsY += 32;
  }

  if (invoice.bkashPaymentID || invoice.bkashTrxID) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("Bkash Payment Details:", margin, paymentDetailsY);

    doc.setFillColor(...lightGray);
    doc.rect(margin, paymentDetailsY + 3, pageWidth - 2 * margin, 15, "F");

    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
    doc.setFont("helvetica", "normal");
    
    let bkashY = paymentDetailsY + 10;
    if (invoice.bkashPaymentID) {
      doc.text(`Payment ID: ${invoice.bkashPaymentID}`, margin + 5, bkashY);
      bkashY += 6;
    }
    if (invoice.bkashTrxID) {
      doc.text(`Transaction ID: ${invoice.bkashTrxID}`, margin + 5, bkashY);
    }

    paymentDetailsY += 20;
  }

  // ==================== FOOTER ====================
  const footerY = pageHeight - 25;
  
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.setFont("helvetica", "italic");
  doc.text("Thank you for your business!", pageWidth / 2, footerY + 6, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(
    "This is a computer-generated invoice. For any queries, please contact support.",
    pageWidth / 2,
    footerY + 11,
    { align: "center" }
  );

  // Page number
  doc.setFontSize(8);
  doc.text(`Page 1 of 1`, pageWidth - margin, footerY + 16, { align: "right" });
  doc.text(`Generated: ${formatDate(new Date())}`, margin, footerY + 16);

  // ==================== SAVE PDF ====================
  const filename = `Invoice_${invoice.invoiceNumber}_${invoice.customer?.name?.replace(/\s+/g, "_")}.pdf`;
  doc.save(filename);
};

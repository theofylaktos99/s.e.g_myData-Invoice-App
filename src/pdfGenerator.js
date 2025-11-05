import QRCode from 'qrcode';

/**
 * PDF Generator Module for Italian Corner Invoice App
 * Handles all PDF generation functionality using PDFMake
 */

/**
 * Converts an image URL to base64 data URL
 * @param {string} url - Image URL
 * @param {function} callback - Callback function that receives the base64 data URL
 */
function getImageDataURL(url, callback) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = this.width;
    canvas.height = this.height;
    ctx.drawImage(this, 0, 0);
    const dataURL = canvas.toDataURL('image/png');
    callback(dataURL);
  };
  img.onerror = function() {
    // Fallback to empty transparent image if logo fails to load
    callback('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
  };
  img.src = url;
}

/**
 * Creates PDF document definition for PDFMake
 * @param {Object} invoice - Invoice data object
 * @param {Object} branchInfo - Branch information
 * @param {string} logoBase64 - Logo image as base64 string
 * @returns {Object} PDFMake document definition
 */
function createPDFDocumentDefinition(invoice, branchInfo, logoBase64, options = {}) {
  const issuer = branchInfo.issuer || {};
  const qrCodeDataUrl = options.qrCodeDataUrl;
  const paymentMethod = invoice.paymentMethod || 'cash';
  const paymentLabel = paymentMethod === 'card' ? 'Κάρτα' : paymentMethod === 'bank' ? 'Κατάθεση' : 'Μετρητά';
  const docType = branchInfo?.revenueMapping?.documentType || '';
  const revenueCategory = branchInfo?.revenueMapping?.revenueCategory || '';
  const currency = 'EUR';
  const markValue = invoice.mark || invoice.MARK || invoice?.totals?.mark || '';

  // Calculate totals (prefer provided totals to avoid double counting)
  const netTotal = Number(invoice.totals?.net || 0);
  const vatTotal = Number(invoice.totals?.vat || 0);
  const surchargeTotal = Number(
    (invoice.totals && invoice.totals.surcharge != null)
      ? invoice.totals.surcharge
      : (invoice.surcharge || 0)
  );
  const grandTotal = Number(
    (invoice.totals && invoice.totals.gross != null)
      ? invoice.totals.gross
      : (netTotal + vatTotal + surchargeTotal)
  );

  // Create table rows for items
  const itemRows = (invoice.items || []).map(item => {
    const netAmount = (item.qty || 0) * (item.price || 0);
    const vatAmount = netAmount * ((item.vatRate || 0) / 100);
    const totalAmount = netAmount + vatAmount;
    
    return [
      { text: item.description || '', fontSize: 9 },
      { text: (item.qty || 0).toString(), alignment: 'center', fontSize: 9 },
      { text: (item.price || 0).toFixed(2) + ' €', alignment: 'right', fontSize: 9 },
      { text: '0%', alignment: 'center', fontSize: 9 },
      { text: (item.vatRate || 0) + '%', alignment: 'center', fontSize: 9 },
      { text: totalAmount.toFixed(2) + ' €', alignment: 'right', fontSize: 9 }
    ];
  });

  // Add empty rows to fill the table
  const emptyRowsNeeded = Math.max(0, 6 - (invoice.items?.length || 0));
  for (let i = 0; i < emptyRowsNeeded; i++) {
    itemRows.push([
      { text: '', fontSize: 9 },
      { text: '', fontSize: 9 },
      { text: '', fontSize: 9 },
      { text: '', fontSize: 9 },
      { text: '', fontSize: 9 },
      { text: '', fontSize: 9 }
    ]);
  }

  return {
    content: [
      // Header Section
      {
        columns: [
          {
            width: 100,
            image: logoBase64,
            fit: [80, 80]
          },
          {
            width: '*',
            stack: [
              { text: issuer.name || '', style: 'companyName' },
              { text: (issuer.address || '') + ', ' + (issuer.city || '') + ' ' + (issuer.zip || ''), style: 'companyDetails' },
              { text: 'Τηλ.: ' + (issuer.phone || ''), style: 'companyDetails' },
              { text: 'Α.Φ.Μ.: ' + (issuer.vat || ''), style: 'companyDetails' }
            ],
            alignment: 'center'
          },
          {
            width: 180,
            stack: [
              {
                table: {
                  body: [
                    [{ text: 'ΤΙΜΟΛΟΓΙΟ ΠΑΡΑΣΤΑΤΙΚΟΥ', style: 'invoiceHeader' }],
                    [{ text: 'ΣΕΙΡΑ: ' + (branchInfo.series || ''), style: 'invoiceDetails' }],
                    [{ text: 'ΑΡΙΘΜΟΣ: ' + (invoice.invoiceNumber || ''), style: 'invoiceDetails' }],
                    [{ text: 'ΗΜΕΡΟΜΗΝΙΑ: ' + (invoice.issueDate || ''), style: 'invoiceDetails' }],
                    ...(markValue ? [[{ text: 'MARK: ' + markValue, style: 'invoiceDetails' }]] : []),
                    [{ text: 'ΝΟΜΙΣΜΑ: ' + currency, style: 'invoiceDetails' }]
                  ]
                },
                layout: {
                  defaultBorder: true
                }
              },
              ...(qrCodeDataUrl
                ? [{
                    marginTop: 12,
                    stack: [
                      { text: 'Σάρωσε για επιβεβαίωση', style: 'qrLabel', alignment: 'center', marginBottom: 6 },
                      { image: qrCodeDataUrl, fit: [100, 100], alignment: 'center' }
                    ]
                  }]
                : [])
            ]
          }
        ],
        marginBottom: 15
      },

      // Customer and Invoice Details (AADE-relevant fields)
      {
        table: {
          widths: ['50%', '50%'],
          body: [
            [
              {
                stack: [
                  { text: 'ΣΤΟΙΧΕΙΑ ΣΥΜΒΑΛΛΟΜΕΝΟΥ', style: 'sectionHeader' },
                  { text: 'ΚΩΔ.: ' + (invoice.customer?.vat || ''), style: 'customerDetails' },
                  { text: 'ΕΠΩΝΥΜΙΑ: ' + (invoice.customer?.name || ''), style: 'customerDetails' },
                  { text: 'ΕΠΑΓΓΕΛΜΑ:', style: 'customerDetails' },
                  { text: 'ΔΙΕΥΘΥΝΣΗ: ' + (invoice.customer?.address || ''), style: 'customerDetails' },
                  { text: 'ΠΟΛΗ - Τ.Κ.: ' + (invoice.customer?.city || ''), style: 'customerDetails' },
                  { text: 'ΤΗΛ.:', style: 'customerDetails' },
                  { text: 'Α.Φ.Μ.: ' + (invoice.customer?.vat || ''), style: 'customerDetails' },
                  { text: 'Δ.Ο.Υ.:', style: 'customerDetails' }
                ]
              },
              {
                stack: [
                  { text: 'ΣΤΟΙΧΕΙΑ ΠΑΡΑΣΤΑΤΙΚΟΥ', style: 'sectionHeader' },
                  { text: 'ΤΥΠΟΣ ΠΑΡΑΣΤΑΤΙΚΟΥ: ' + docType, style: 'customerDetails' },
                  { text: 'ΚΑΤ. ΕΣΟΔΟΥ: ' + revenueCategory, style: 'customerDetails' },
                  { text: 'ΤΟΠΟΣ ΠΡΟΟΡΙΣΜΟΥ: ' + (issuer.address || ''), style: 'customerDetails' },
                  { text: 'ΤΡΟΠΟΣ ΠΛΗΡΩΜΗΣ: ' + paymentLabel, style: 'customerDetails' },
                  ...(markValue ? [{ text: 'MARK: ' + markValue, style: 'customerDetails' }] : []),
                  { text: 'ΝΟΜΙΣΜΑ: ' + currency, style: 'customerDetails' }
                ]
              }
            ]
          ]
        },
        layout: {
          defaultBorder: true
        },
        marginBottom: 15
      },

      // Items Table
      {
        table: {
          headerRows: 1,
          widths: ['40%', '10%', '12%', '10%', '10%', '18%'],
          body: [
            [
              { text: 'Περιγραφή', style: 'tableHeader' },
              { text: 'Ποσότητα', style: 'tableHeader', alignment: 'center' },
              { text: 'Τιμή (€)', style: 'tableHeader', alignment: 'right' },
              { text: 'Έκπτωση (%)', style: 'tableHeader', alignment: 'center' },
              { text: 'ΦΠΑ (%)', style: 'tableHeader', alignment: 'center' },
              { text: 'Αξία (€)', style: 'tableHeader', alignment: 'right' }
            ],
            ...itemRows
          ]
        },
        layout: 'noBorders',
        marginBottom: 15
      },

      // Totals Section
      {
        columns: [
          {
            width: '50%',
            table: {
              body: [
                  [{ text: 'Παρατηρήσεις', style: 'sectionHeader' }],
                  [{ text: 'IBAN ΤΡΑΠΕΖΑΣ ΠΕΙΡΑΙΩΣ - GR7101715600006021443427251\nΔΙΚΑΙΟΥΧΟΣ - ' + (issuer.name || ''), style: 'remarks' }]
                ],
              },
              // make remarks visually lighter and add spacing so it sits lower on the page
              layout: 'noBorders',
              margin: [0, 12, 0, 0]
          },
          {
            width: '50%',
            table: {
              widths: ['25%', '25%', '25%', '25%'],
              body: [
                [
                  { text: 'ΠΡΟΦ. ΥΠΟΛΟΙΠΟ:', style: 'totalsLabel' },
                  { text: '0,00 €', style: 'totalsValue' },
                  { text: 'ΚΑΘΑΡΗ ΑΞΙΑ', style: 'totalsLabel' },
                  { text: netTotal.toFixed(2) + ' €', style: 'totalsValue' }
                ],
                [
                  { text: 'ΝΕΟ ΥΠΟΛΟΙΠΟ:', style: 'totalsLabel' },
                  { text: '0,00 €', style: 'totalsValue' },
                  { text: 'ΦΠΑ %', style: 'totalsLabel' },
                  { text: 'Αξία ΦΠΑ', style: 'totalsValue' }
                ],
                [
                  { text: 'ΣΥΝ. ΠΟΣΟΤΗΤΑ:', style: 'totalsLabel' },
                  { text: ((invoice.items || []).reduce((sum, item) => sum + (item.qty || 0), 0)).toString(), style: 'totalsValue' },
                  { text: ((invoice.items || []).map(item => item.vatRate).filter((v, i, a) => a.indexOf(v) === i).join(', ')) + '%', style: 'totalsValue' },
                  { text: vatTotal.toFixed(2) + ' €', style: 'totalsValue' }
                ],
                [
                  { text: '', style: 'totalsLabel' },
                  { text: '', style: 'totalsValue' },
                  { text: 'ΕΚΠΤΩΣΗ', style: 'totalsLabel' },
                  { text: '0,00 €', style: 'totalsValue' }
                ],
                [
                  { text: '', style: 'totalsLabel' },
                  { text: '', style: 'totalsValue' },
                  { text: 'ΕΚΠΤ. ΣΥΝΑΛΛΑΓΩΝ', style: 'totalsLabel' },
                  { text: '0%', style: 'totalsValue' }
                ],
                [
                  { text: '', style: 'totalsLabel' },
                  { text: '', style: 'totalsValue' },
                  { text: 'ΚΑΘΑΡΗ ΑΞΙΑ', style: 'totalsLabel' },
                  { text: netTotal.toFixed(2) + ' €', style: 'totalsValue' }
                ],
                ...(surchargeTotal > 0 ? [[
                  { text: '', style: 'totalsLabel' },
                  { text: '', style: 'totalsValue' },
                  { text: 'ΤΕΛΟΣ ΔΙΑΜΟΝΗΣ', style: 'totalsLabel' },
                  { text: surchargeTotal.toFixed(2) + ' €', style: 'totalsValue' }
                ]] : []),
                [
                  { text: '', style: 'totalsLabel' },
                  { text: '', style: 'totalsValue' },
                  { text: 'ΦΠΑ ΠΟΣΟ', style: 'totalsLabel' },
                  { text: vatTotal.toFixed(2) + ' €', style: 'totalsValue' }
                ],
                [
                  { text: '', style: 'totalsLabel' },
                  { text: '', style: 'totalsValue' },
                  { text: 'ΕΠΙΒΑΡΥΝΣΕΙΣ', style: 'totalsLabel' },
                  { text: '0,00 €', style: 'totalsValue' }
                ],
                [
                  { text: '', style: 'totalsLabel' },
                  { text: '', style: 'totalsValue' },
                  { text: 'ΦΠΑ ΕΠΙΒ.', style: 'totalsLabel' },
                  { text: '0,00 €', style: 'totalsValue' }
                ],
                [
                  { text: '', style: 'grandTotalLabel' },
                  { text: '', style: 'grandTotalLabel' },
                  { text: 'ΣΥΝΟΛΙΚΗ ΑΞΙΑ', style: 'grandTotalLabel' },
                  { text: grandTotal.toFixed(2) + ' €', style: 'grandTotalValue' }
                ]
              ]
            },
            layout: {
              defaultBorder: true
            }
          }
        ]
      },

      // Footer
      {
        text: 'Εκδότης: ' + (issuer.name || '') + ' | ΑΦΜ: ' + (issuer.vat || '') + ' | Διεύθυνση: ' + (issuer.address || '') + ', ' + (issuer.city || ''),
        style: 'footer',
        marginTop: 20
      }
    ],

    styles: {
      companyName: {
        fontSize: 16,
        bold: true,
        alignment: 'center',
        marginBottom: 5
      },
      companyDetails: {
        fontSize: 10,
        alignment: 'center',
        marginBottom: 2
      },
      invoiceHeader: {
        fontSize: 12,
        bold: true,
        alignment: 'center',
        fillColor: '#f0f0f0'
      },
      invoiceDetails: {
        fontSize: 10,
        alignment: 'center'
      },
      sectionHeader: {
        fontSize: 9,
        bold: true,
        fillColor: '#f0f0f0',
        marginBottom: 5
      },
      customerDetails: {
        fontSize: 9,
        marginBottom: 2
      },
      tableHeader: {
        fontSize: 9,
        bold: true,
        fillColor: '#f0f0f0'
      },
      totalsLabel: {
        fontSize: 8,
        bold: true,
        fillColor: '#f0f0f0'
      },
      totalsValue: {
        fontSize: 9,
        alignment: 'right'
      },
      grandTotalLabel: {
        fontSize: 9,
        bold: true,
        fillColor: '#e0e0e0'
      },
      grandTotalValue: {
        fontSize: 11,
        bold: true,
        alignment: 'right',
        fillColor: '#e0e0e0'
      },
      remarks: {
        fontSize: 8,
        marginTop: 5
      },
      qrLabel: {
        fontSize: 8,
        color: '#0ea5e9',
        bold: true,
        letterSpacing: 1
      },
      footer: {
        fontSize: 8,
        alignment: 'center',
        color: 'gray'
      }
    },

    defaultStyle: {
      font: 'Roboto'
    }
  };
}

/**
 * Main function to generate and download PDF invoice
 * @param {Object} invoice - Invoice data object
 * @param {Object} branches - All branch configurations
 * @param {string} logoPath - Path to logo image (optional, defaults to Italian Corner logo)
 */
async function generateInvoiceQRCode(invoice, branchInfo) {
  const issuer = branchInfo.issuer || {};
  const net = Number(invoice.totals?.net || 0).toFixed(2);
  const vat = Number(invoice.totals?.vat || 0).toFixed(2);
  const gross = Number(invoice.totals?.gross || Number(net) + Number(vat) + Number(invoice.surcharge || 0)).toFixed(2);
  const payload = [
  'S.E.G. Stournaras Entertainment Group • myData Invoice App',
    `Series: ${branchInfo.series || ''}`,
    `Invoice: ${invoice.invoiceNumber || ''}`,
    `Date: ${invoice.issueDate || ''}`,
    `Branch: ${issuer.name || branchInfo.label || ''}`,
    `Customer: ${invoice.customer?.name || ''}`,
    `VAT: ${invoice.customer?.vat || ''}`,
    `Net: ${net} €`,
    `VAT: ${vat} €`,
    `Total: ${gross} €`
  ].join('\n');

  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      scale: 4,
      color: {
        dark: '#111827',
        light: '#ffffff'
      }
    });
  } catch (error) {
    console.warn('QR code generation failed', error);
    return null;
  }
}

function downloadInvoicePDF(invoice, branches, logoPath = `${import.meta.env.BASE_URL || '/'}assets/italiancornerDesktop App Icon.png`) {
  // Check if PDFMake is available
  if (typeof pdfMake === 'undefined') {
    alert('Η βιβλιοθήκη PDFMake δεν είναι διαθέσιμη. Παρακαλώ φορτώστε τη σελίδα ξανά.');
    return;
  }

  const branchInfo = branches[invoice.branchId] || {};

  // Get logo as base64 and then create PDF
  getImageDataURL(logoPath, async function(logoBase64) {
    try {
      const qrCodeDataUrl = await generateInvoiceQRCode(invoice, branchInfo);
      const docDefinition = createPDFDocumentDefinition(invoice, branchInfo, logoBase64, { qrCodeDataUrl });
      pdfMake.createPdf(docDefinition).download(`invoice_${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error creating PDF:', error);
      alert('Σφάλμα κατά τη δημιουργία του PDF: ' + error.message);
    }
  });
}

/**
 * Alternative function to open PDF in new tab instead of downloading
 * @param {Object} invoice - Invoice data object
 * @param {Object} branches - All branch configurations
 * @param {string} logoPath - Path to logo image (optional)
 */
function openInvoicePDF(invoice, branches, logoPath = `${import.meta.env.BASE_URL || '/'}assets/italiancornerDesktop App Icon.png`) {
  if (typeof pdfMake === 'undefined') {
    alert('Η βιβλιοθήκη PDFMake δεν είναι διαθέσιμη. Παρακαλώ φορτώστε τη σελίδα ξανά.');
    return;
  }

  const branchInfo = branches[invoice.branchId] || {};

  getImageDataURL(logoPath, async function(logoBase64) {
    try {
      const qrCodeDataUrl = await generateInvoiceQRCode(invoice, branchInfo);
      const docDefinition = createPDFDocumentDefinition(invoice, branchInfo, logoBase64, { qrCodeDataUrl });
      pdfMake.createPdf(docDefinition).open();
    } catch (error) {
      console.error('Error creating PDF:', error);
      alert('Σφάλμα κατά τη δημιουργία του PDF: ' + error.message);
    }
  });
}

function generateInvoicePDFBlob(invoice, branches, logoPath = `${import.meta.env.BASE_URL || '/'}assets/italiancornerDesktop App Icon.png`) {
  return new Promise((resolve, reject) => {
    if (typeof pdfMake === 'undefined') {
      reject(new Error('Η βιβλιοθήκη PDFMake δεν είναι διαθέσιμη.'));
      return;
    }

    const branchInfo = branches[invoice.branchId] || {};

    getImageDataURL(logoPath, async function(logoBase64) {
      try {
        const qrCodeDataUrl = await generateInvoiceQRCode(invoice, branchInfo);
        const docDefinition = createPDFDocumentDefinition(invoice, branchInfo, logoBase64, { qrCodeDataUrl });
        pdfMake.createPdf(docDefinition).getBlob((blob) => resolve(blob));
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Export functions for use in other modules
// Export functions for use in other modules
window.PDFGenerator = {
  downloadInvoicePDF,
  openInvoicePDF,
  createPDFDocumentDefinition,
  getImageDataURL,
  generateInvoicePDFBlob
};

/**
 * Create a compact thermal/receipt PDF definition (approx 80mm width)
 * @param {Object} invoice
 * @param {Object} branchInfo
 * @param {string} logoBase64
 */
function createThermalReceiptDefinition(invoice, branchInfo, logoBase64, options = {}) {
  const issuer = branchInfo.issuer || {};
  const items = invoice.items || [];
  const totals = invoice.totals || {};
  const net = Number(totals.net || 0);
  const vat = Number(totals.vat || 0);
  const gross = Number(totals.gross != null ? totals.gross : net + vat + Number(totals.surcharge || 0));

  // 80mm width in points: 80mm = 3.1496in * 72 = ~226.77pt
  const pageWidth = 226.77;

  const body = [];
  // Header with compact logo and title
  const headerStack = [];
  if (logoBase64) {
    headerStack.push({ image: logoBase64, width: 50, alignment: 'center', margin: [0, 0, 0, 6] });
  }
  headerStack.push({ text: branchInfo.label || issuer.name || 'Receipt', style: 'rTitle', alignment: 'center' });
  headerStack.push({ text: issuer.address || '', style: 'rMeta', alignment: 'center' });
  headerStack.push({ text: issuer.phone || '', style: 'rMeta', alignment: 'center', margin: [0, 0, 0, 6] });

  body.push({ stack: headerStack, margin: [0, 0, 0, 6] });

  // Invoice meta
  body.push({ text: `Αρ: ${invoice.invoiceNumber || ''}    Ημ/νια: ${invoice.issueDate || invoice.invoiceDate || ''}`, style: 'rSmall' });
  body.push({ text: `Πελάτης: ${invoice.customer?.name || ''}`, style: 'rSmall' });
  body.push({ text: `ΑΦΜ: ${invoice.customer?.vat || ''}`, style: 'rSmall', margin: [0, 0, 0, 6] });

  // Items table (compact)
  const itemRows = items.map(it => {
    const qty = Number(it.qty || 0);
    const price = Number(it.price || 0).toFixed(2);
    const lineNet = (qty * Number(it.price || 0)).toFixed(2);
    return [ { text: it.description || '', style: 'rSmall' }, { text: `${qty}x${price}`, style: 'rSmall', alignment: 'right' }, { text: `${lineNet} €`, style: 'rSmall', alignment: 'right' } ];
  });

  if (itemRows.length) {
    const table = {
      table: {
        widths: ['*', 'auto', 'auto'],
        body: [
          [ { text: 'Περιγραφή', style: 'rSmallBold' }, { text: 'Ποσ.', style: 'rSmallBold', alignment: 'right' }, { text: 'Σύνολο', style: 'rSmallBold', alignment: 'right' } ],
          ...itemRows
        ]
      },
      layout: 'noBorders',
      margin: [0, 6, 0, 6]
    };
    body.push(table);
  }

  // Totals
  body.push({ columns: [ { text: 'Καθαρή:', style: 'rSmall' }, { text: `${net.toFixed(2)} €`, style: 'rSmall', alignment: 'right' } ], margin: [0,6,0,0] });
  body.push({ columns: [ { text: 'ΦΠΑ:', style: 'rSmall' }, { text: `${vat.toFixed(2)} €`, style: 'rSmall', alignment: 'right' } ], margin: [0,2,0,0] });
  body.push({ columns: [ { text: 'Σύνολο:', style: 'rSmallBold' }, { text: `${gross.toFixed(2)} €`, style: 'rSmallBold', alignment: 'right' } ], margin: [0,6,0,0] });

  // QR (if present in options)
  if (options.qrCodeDataUrl) {
    body.push({ image: options.qrCodeDataUrl, width: 80, alignment: 'center', margin: [0, 8, 0, 0] });
  }

  body.push({ text: options.footerText || 'Ευχαριστούμε για την προτίμησή σας', style: 'rSmall', alignment: 'center', margin: [0,10,0,0] });

  const docDefinition = {
    pageSize: { width: pageWidth, height: 1000 },
    pageMargins: [8, 8, 8, 8],
    content: body,
    styles: {
      rTitle: { fontSize: 12, bold: true, margin: [0,2,0,2] },
      rMeta: { fontSize: 8, color: '#9CA3AF' },
      rSmall: { fontSize: 8 },
      rSmallBold: { fontSize: 8, bold: true }
    },
    defaultStyle: { font: 'Roboto' }
  };

  return docDefinition;
}

function downloadThermalReceiptPDF(invoice, branches, logoPath = `${import.meta.env.BASE_URL || '/'}assets/italiancornerDesktop App Icon.png`, options = {}) {
  if (typeof pdfMake === 'undefined') {
    alert('Η βιβλιοθήκη PDFMake δεν είναι διαθέσιμη.');
    return;
  }
  const branchInfo = branches[invoice.branchId] || {};
  getImageDataURL(logoPath, async function(logoBase64) {
    try {
      const qrCodeDataUrl = options.qr ? await generateInvoiceQRCode(invoice, branchInfo) : null;
      const docDefinition = createThermalReceiptDefinition(invoice, branchInfo, logoBase64, { qrCodeDataUrl, footerText: options.footerText });
      pdfMake.createPdf(docDefinition).download(`receipt_${invoice.invoiceNumber || 'print'}.pdf`);
    } catch (err) {
      console.error('Thermal receipt create error', err);
      alert('Σφάλμα κατά τη δημιουργία του αποδείκτη: ' + (err.message || String(err)));
    }
  });
}

function generateThermalReceiptPDFBlob(invoice, branches, logoPath = `${import.meta.env.BASE_URL || '/'}assets/italiancornerDesktop App Icon.png`, options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof pdfMake === 'undefined') {
      reject(new Error('pdfMake unavailable'));
      return;
    }
    const branchInfo = branches[invoice.branchId] || {};
    getImageDataURL(logoPath, async function(logoBase64) {
      try {
        const qrCodeDataUrl = options.qr ? await generateInvoiceQRCode(invoice, branchInfo) : null;
        const docDefinition = createThermalReceiptDefinition(invoice, branchInfo, logoBase64, { qrCodeDataUrl, footerText: options.footerText });
        pdfMake.createPdf(docDefinition).getBlob((blob) => resolve(blob));
      } catch (err) {
        reject(err);
      }
    });
  });
}

// add new functions to exported API
window.PDFGenerator = Object.assign(window.PDFGenerator || {}, {
  createThermalReceiptDefinition,
  downloadThermalReceiptPDF,
  generateThermalReceiptPDFBlob
});

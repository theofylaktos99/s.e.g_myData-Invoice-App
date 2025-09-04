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
function createPDFDocumentDefinition(invoice, branchInfo, logoBase64) {
  const issuer = branchInfo.issuer || {};

  // Calculate totals
  const netTotal = Number(invoice.totals?.net || 0);
  const vatTotal = Number(invoice.totals?.vat || 0);
  const surchargeTotal = Number(invoice.surcharge || 0);
  const grandTotal = netTotal + vatTotal + surchargeTotal;

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
            width: 150,
            table: {
              body: [
                [{ text: 'ΤΙΜΟΛΟΓΙΟ ΠΑΡΑΣΤΑΤΙΚΟΥ', style: 'invoiceHeader' }],
                [{ text: 'ΣΕΙΡΑ: ' + (branchInfo.series || ''), style: 'invoiceDetails' }],
                [{ text: 'ΑΡΙΘΜΟΣ: ' + (invoice.invoiceNumber || ''), style: 'invoiceDetails' }],
                [{ text: 'ΗΜΕΡΟΜΗΝΙΑ: ' + (invoice.issueDate || ''), style: 'invoiceDetails' }]
              ]
            },
            layout: {
              defaultBorder: true
            }
          }
        ],
        marginBottom: 15
      },

      // Customer and Invoice Details
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
                  { text: 'ΣΧ. ΠΑΡΑΣΤΑΤΙΚΑ:', style: 'customerDetails' },
                  { text: 'ΣΚΟΠΟΣ ΔΙΑΚΙΝΗΣΗΣ:', style: 'customerDetails' },
                  { text: 'ΤΟΠΟΣ ΦΟΡΤΩΣΗΣ:', style: 'customerDetails' },
                  { text: 'ΤΟΠΟΣ ΠΡΟΟΡΙΣΜΟΥ: ' + (issuer.address || ''), style: 'customerDetails' },
                  { text: 'ΤΡΟΠΟΣ ΠΛΗΡΩΜΗΣ: Μετρητοίς', style: 'customerDetails' },
                  { text: 'ΤΡΟΠΟΣ ΑΠΟΣΤΟΛΗΣ:', style: 'customerDetails' },
                  { text: 'ΑΡΙΘΜΟΣ ΜΕΤΑΦΟΡΙΚΟΥ:', style: 'customerDetails' },
                  { text: 'ΗΜΕΡΟΜΗΝΙΑ ΠΑΡΑΔΟΣΗΣ:', style: 'customerDetails' },
                  { text: 'ΠΑΡΑΓΓΕΛΙΑ ΑΠΟ:', style: 'customerDetails' },
                  { text: 'ΑΠΟΣΤΟΛΗ ΣΕ:', style: 'customerDetails' },
                  { text: 'ΔΙΑΤΑΞΗ ΑΠΑΛΛΑΓΗΣ:', style: 'customerDetails' }
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
        layout: {
          defaultBorder: true
        },
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
              ]
            },
            layout: {
              defaultBorder: true
            }
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
function downloadInvoicePDF(invoice, branches, logoPath = '/assets/italiancornerDesktop App Icon.png') {
  // Check if PDFMake is available
  if (typeof pdfMake === 'undefined') {
    alert('Η βιβλιοθήκη PDFMake δεν είναι διαθέσιμη. Παρακαλώ φορτώστε τη σελίδα ξανά.');
    return;
  }

  const branchInfo = branches[invoice.branchId] || {};

  // Get logo as base64 and then create PDF
  getImageDataURL(logoPath, function(logoBase64) {
    try {
      const docDefinition = createPDFDocumentDefinition(invoice, branchInfo, logoBase64);
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
function openInvoicePDF(invoice, branches, logoPath = '/assets/italiancornerDesktop App Icon.png') {
  if (typeof pdfMake === 'undefined') {
    alert('Η βιβλιοθήκη PDFMake δεν είναι διαθέσιμη. Παρακαλώ φορτώστε τη σελίδα ξανά.');
    return;
  }

  const branchInfo = branches[invoice.branchId] || {};

  getImageDataURL(logoPath, function(logoBase64) {
    try {
      const docDefinition = createPDFDocumentDefinition(invoice, branchInfo, logoBase64);
      pdfMake.createPdf(docDefinition).open();
    } catch (error) {
      console.error('Error creating PDF:', error);
      alert('Σφάλμα κατά τη δημιουργία του PDF: ' + error.message);
    }
  });
}

// Export functions for use in other modules
// Export functions for use in other modules
window.PDFGenerator = {
  downloadInvoicePDF,
  openInvoicePDF,
  createPDFDocumentDefinition,
  getImageDataURL
};

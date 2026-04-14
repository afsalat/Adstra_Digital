const fs = require('fs');
const path = 'c:/Projects/Adstra_Digital/adstra-next/src/app/invoices/create/page.js';

let content = fs.readFileSync(path, 'utf8');

const oldPreviewStart = '{/* Boxed GST Style Header */}';
const oldPreviewEnd = '{/* Items Table */}';

const refinedBoxedLayout = `{/* Boxed GST Style Header - Refined */}
                <div style={{ border: '2px solid black', fontFamily: 'Arial, sans-serif', color: 'black' }}>
                  {/* Top Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderBottom: '1px solid black', fontSize: '10px', fontWeight: 'bold' }}>
                    <span>Page No. 1 of 1</span>
                    <span style={{ fontSize: '14px', letterSpacing: '2px' }}>INVOICE</span>
                    <span>Original Copy</span>
                  </div>

                  {/* Logo Section */}
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid black' }}>
                    <img
                      src="/assets/logo_lightBg-01.png"
                      alt="Adstra Logo"
                      style={{ maxWidth: '140px', height: 'auto' }}
                    />
                  </div>

                  {/* From & To Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid black' }}>
                    <div style={{ padding: '8px', borderRight: '1px solid black', fontSize: '11px' }}>
                      <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4px' }}>From:</div>
                      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>Adstra Digital</div>
                      <div>Husna Complex, 1st Floor, Nadakkavu, Kozhikode, Kerala - 673011</div>
                      <div style={{ marginTop: '2px' }}>GSTIN: 32CMJPK3035L1Z2 | PAN: AI-PENDING</div>
                      <div>Mobile: +91 974 477 9574 | 956 756 8185</div>
                      <div>Email: info.adstradigital@gmail.com</div>
                    </div>
                    <div style={{ padding: '8px', fontSize: '11px' }}>
                      <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4px' }}>To:</div>
                      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{selectedClient?.company_name || selectedClient?.name || "N/A"}</div>
                      <div>{selectedClient?.address || "N/A"}</div>
                      <div style={{ marginTop: '2px' }}>GSTIN: {selectedClient?.gstin || "-"} | Mobile: {selectedClient?.contact || "-"}</div>
                      <div>Email: {selectedClient?.email || "-"}</div>
                    </div>
                  </div>

                  {/* Invoice Details Line */}
                  <div style={{ padding: '8px', borderBottom: '1px solid black' }}>
                     <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '8px', fontSize: '11px' }}>Invoice Details:</div>
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', fontSize: '11px', gap: '8px' }}>
                        <div>
                           <div style={{ color: '#666' }}>Invoice No:</div>
                           <div style={{ fontWeight: 'bold' }}>{invoice.invoice_no || "PROVISIONAL"}</div>
                        </div>
                        <div>
                           <div style={{ color: '#666' }}>Date:</div>
                           <div style={{ fontWeight: 'bold' }}>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        </div>
                        <div>
                           <div style={{ color: '#666' }}>Due Date:</div>
                           <div style={{ fontWeight: 'bold' }}>Upon Delivery</div>
                        </div>
                        <div>
                           <div style={{ color: '#666' }}>Place of Supply:</div>
                           <div style={{ fontWeight: 'bold' }}>Kerala</div>
                        </div>
                     </div>
                  </div>`;

const startIndex = content.indexOf(oldPreviewStart);
const endIndex = content.indexOf(oldPreviewEnd);

if (startIndex !== -1 && endIndex !== -1) {
  const finalContent = content.substring(0, startIndex) + refinedBoxedLayout + content.substring(endIndex);
  fs.writeFileSync(path, finalContent, 'utf8');
  console.log("Success: CreateInvoice.js updated with Refined Boxed Layout.");
} else {
  console.error("Error: Could not find placeholders in CreateInvoice.js");
}

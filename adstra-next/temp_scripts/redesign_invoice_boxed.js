const fs = require('fs');
const path = 'c:/Projects/Adstra_Digital/adstra-next/src/app/invoices/create/page.js';

let content = fs.readFileSync(path, 'utf8');

const oldPreviewStart = '{/* Traditional Header */}';
const oldPreviewEnd = '{/* Company Footer */}';

const newBoxedLayout = `{/* Boxed GST Style Header */}
                <div style={{ border: '2px solid black', fontFamily: 'Arial, sans-serif', color: 'black' }}>
                  {/* Top Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderBottom: '1px solid black', fontSize: '10px', fontWeight: 'bold' }}>
                    <span>Page No. 1 of 1</span>
                    <span style={{ fontSize: '14px', letterSpacing: '2px' }}>INVOICE</span>
                    <span>Original Copy</span>
                  </div>

                  {/* Company Info */}
                  <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid black' }}>
                    <img
                      src="/assets/logo_lightBg-01.png"
                      alt="Adstra Logo"
                      style={{ maxWidth: '140px', height: 'auto', marginBottom: '8px' }}
                    />
                    <div style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase' }}>Adstra Digital</div>
                    <div style={{ fontSize: '11px', marginTop: '4px' }}>
                      Husna Complex, 1st Floor, Nadakkavu, Kozhikode, Kerala - 673011<br />
                      Mobile: +91 974 477 9574 | 956 756 8185 | Email: info.adstradigital@gmail.com<br />
                      <strong>GSTIN: 32CMJPK3035L1Z2 | PAN: AI-PENDING</strong>
                    </div>
                  </div>

                  {/* Details Grid: Invoice & Transporter */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid black' }}>
                    <div style={{ padding: '8px', borderRight: '1px solid black', fontSize: '11px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr><td style={{ width: '40%', padding: '2px 0' }}>Invoice Number</td><td style={{ width: '5%' }}>:</td><td style={{ fontWeight: 'bold' }}>{invoice.invoice_no || "PROVISIONAL"}</td></tr>
                          <tr><td style={{ padding: '2px 0' }}>Invoice Date</td><td>:</td><td>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td></tr>
                          <tr><td style={{ padding: '2px 0' }}>Due Date</td><td>:</td><td>Upon Delivery</td></tr>
                          <tr><td style={{ padding: '2px 0' }}>Place of Supply</td><td>:</td><td>Kerala</td></tr>
                          <tr><td style={{ padding: '2px 0' }}>Reverse Charge</td><td>:</td><td>No</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div style={{ padding: '8px', fontSize: '11px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px', textDecoration: 'underline' }}>Transporter Details</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr><td style={{ width: '40%', padding: '2px 0' }}>Transporter</td><td style={{ width: '5%' }}>:</td><td>N/A</td></tr>
                          <tr><td style={{ padding: '2px 0' }}>Vehicle No.</td><td>:</td><td>N/A</td></tr>
                          <tr><td style={{ padding: '2px 0' }}>E-Way Bill No.</td><td>:</td><td>N/A</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Address Grid: Billing & Shipping */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid black' }}>
                    <div style={{ padding: '8px', borderRight: '1px solid black', fontSize: '11px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px', textDecoration: 'underline' }}>Billing Details</div>
                      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{selectedClient?.company_name || selectedClient?.name || "N/A"}</div>
                      <div>{selectedClient?.address || "N/A"}</div>
                      <div>GSTIN: {selectedClient?.gstin || "-"} | Mobile: {selectedClient?.contact || "-"}</div>
                      <div>Email: {selectedClient?.email || "-"}</div>
                    </div>
                    <div style={{ padding: '8px', fontSize: '11px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px', textDecoration: 'underline' }}>Shipping Details</div>
                      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{selectedClient?.company_name || selectedClient?.name || "N/A"}</div>
                      <div>{selectedClient?.address || "N/A"}</div>
                      <div>GSTIN: {selectedClient?.gstin || "-"} | Mobile: {selectedClient?.contact || "-"}</div>
                      <div>Email: {selectedClient?.email || "-"}</div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div style={{ minHeight: '300px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid black', backgroundColor: '#f9fafb' }}>
                          <th style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center', width: '40px' }}>Sr.</th>
                          <th style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'left' }}>Item Description</th>
                          <th style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center', width: '60px' }}>Qty</th>
                          <th style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center', width: '60px' }}>Unit</th>
                          <th style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right', width: '100px' }}>Rate (Rs)</th>
                          <th style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center', width: '60px' }}>Tax %</th>
                          <th style={{ padding: '6px', textAlign: 'right', width: '100px' }}>Amount (Rs)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.items.map((item, i) => {
                          const rate = Number(item.rate) || 0;
                          const qty = Number(item.quantity) || 0;
                          const gst = Number(item.gst) || 0;
                          const base = rate * qty;
                          const gstAmt = (base * gst) / 100;
                          const total = base + gstAmt;
                          return (
                            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center' }}>{i + 1}</td>
                              <td style={{ borderRight: '1px solid black', padding: '6px' }}>{item.description}</td>
                              <td style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center' }}>{qty.toFixed(2)}</td>
                              <td style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center' }}>Nos</td>
                              <td style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right' }}>{rate.toFixed(2)}</td>
                              <td style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center' }}>{gst}%</td>
                              <td style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>{total.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                        {/* Fill empty space if needed */}
                        {[...Array(Math.max(0, 5 - invoice.items.length))].map((_, i) => (
                          <tr key={'empty-' + i} style={{ height: '24px' }}>
                            <td style={{ borderRight: '1px solid black' }}></td>
                            <td style={{ borderRight: '1px solid black' }}></td>
                            <td style={{ borderRight: '1px solid black' }}></td>
                            <td style={{ borderRight: '1px solid black' }}></td>
                            <td style={{ borderRight: '1px solid black' }}></td>
                            <td style={{ borderRight: '1px solid black' }}></td>
                            <td></td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ borderTop: '1px solid black', fontWeight: 'bold' }}>
                          <td colSpan="6" style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right' }}>Discount</td>
                          <td style={{ padding: '6px', textAlign: 'right' }}>{Number(invoice.discount_amount).toFixed(2)}</td>
                        </tr>
                        <tr style={{ borderTop: '1px solid black', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>
                          <td colSpan="6" style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right' }}>Total</td>
                          <td style={{ padding: '6px', textAlign: 'right', fontSize: '14px' }}>{Number(invoice.total_amount).toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Amount in words */}
                  <div style={{ padding: '8px', borderTop: '1px solid black', borderBottom: '1px solid black', fontSize: '11px' }}>
                    <strong>Rs.</strong> {invoice.total_in_words}
                  </div>

                  {/* Footer Section */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', fontSize: '10px' }}>
                    <div style={{ padding: '8px', borderRight: '1px solid black' }}>
                      <strong style={{ textDecoration: 'underline' }}>Terms and Conditions</strong>
                      <ol style={{ paddingLeft: '14px', margin: '4px 0' }}>
                        <li>Goods once sold will not be taken back.</li>
                        <li>Interest @18% may apply on overdue amounts.</li>
                        <li>Subject to local jurisdiction only.</li>
                      </ol>
                    </div>
                    <div style={{ padding: '8px', borderRight: '1px solid black' }}>
                      <strong style={{ textDecoration: 'underline' }}>Bank Details</strong>
                      <div style={{ marginTop: '4px' }}>
                        Acc No: 50200091927202<br />
                        Bank: HDFC Bank<br />
                        IFSC: HDFC0001595<br />
                        Branch: Sulthan Bathery
                      </div>
                    </div>
                    <div style={{ padding: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <strong>For Adstra Digital</strong>
                      <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
                        <div style={{ borderTop: '1px solid black', display: 'inline-block', width: '80%', paddingTop: '4px' }}>
                          Authorized Signatory
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Created By */}
                  <div style={{ padding: '4px', borderTop: '1px solid black', textAlign: 'center', fontSize: '9px', color: '#666' }}>
                    Invoice Created by Adstra Digital
                  </div>
                </div>`;

const startIndex = content.indexOf(oldPreviewStart);
const endIndex = content.indexOf(oldPreviewEnd);

if (startIndex !== -1 && endIndex !== -1) {
  const finalContent = content.substring(0, startIndex) + newBoxedLayout + content.substring(endIndex);
  fs.writeFileSync(path, finalContent, 'utf8');
  console.log("Success: CreateInvoice.js updated with Boxed Layout.");
} else {
  console.error("Error: Could not find placeholders in CreateInvoice.js");
}

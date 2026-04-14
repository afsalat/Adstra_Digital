const fs = require('fs');
const path = 'c:/Projects/Adstra_Digital/adstra-next/src/app/invoices/create/page.js';

let content = fs.readFileSync(path, 'utf8');

const oldBlock = `{/* Company Banner with Logo — matches invoice view page */}
                <div style={{
                  backgroundColor: "#136270",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "20px",
                  padding: "12px 16px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  position: "relative",
                  marginBottom: "16px",
                }}>
                  <span>ADSTRA DIGITAL</span>
                  {/* Logo box — absolutely positioned so it overflows the banner */}
                  <div className="rounded shadow-md" style={{
                    position: "absolute",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "80px",
                    height: "80px",
                    backgroundColor: "white",
                    padding: "5px",
                    border: "1px solid black",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <img
                      src="/assets/logo_gellery.png"
                      alt="Adstra Logo"
                      style={{ height: "100%", width: "100%", objectFit: "contain" }}
                    />
                  </div>
                </div>

                {/* INVOICE Title */}
                <div style={{ textAlign: "right", fontSize: "2rem", fontWeight: "bold", marginBottom: "24px", color: "#cbd5e1", letterSpacing: "0.1em" }}>
                  INVOICE
                </div>

                {/* Client Info + Invoice Meta */}
                <div className="row px-1 mb-3">
                  <div className="col-md-5">
                    <h6 className="fw-bold text-uppercase text-xs text-slate-500 mb-2 tracking-wider">Bill To</h6>
                    <p style={{ fontSize: "14px", lineHeight: "1.8" }} className="text-slate-800">
                      {selectedClient?.name || <span className="text-slate-400 italic">Select a client</span>}<br />
                      {selectedClient?.company_name && <>{selectedClient.company_name}<br /></>}
                      {selectedClient?.address && <>{selectedClient.address}<br /></>}
                      {selectedClient?.contact && <>&#128222; {selectedClient.contact}<br /></>}
                      {selectedClient?.email && <>&#9993;&#65039; {selectedClient.email}<br /></>}
                      {selectedClient?.gstin && <>GSTIN: {selectedClient.gstin}<br /></>}
                      {selectedClient?.lut && <>LUT: {selectedClient.lut}<br /></>}
                    </p>
                  </div>
                  <div className="col-md-7">
                    <table className="table table-sm table-borderless">
                      <tbody>
                        <tr>
                          <th className="text-end text-slate-500 text-sm font-semibold pr-3">Invoice No:</th>
                          <td style={{ fontSize: "0.85rem" }} className="text-end font-semibold text-slate-800">
                            {invoice.invoice_no || <span className="text-slate-400 italic">Auto-Generated</span>}
                          </td>
                        </tr>
                        <tr>
                          <th className="text-end text-slate-500 text-sm font-semibold pr-3">Date:</th>
                          <td className="text-end font-semibold text-slate-800">
                            {new Date().toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                        </tr>
                        <tr>
                          <th className="text-end text-slate-500 text-sm font-semibold pr-3">Due Date:</th>
                          <td className="text-end font-semibold text-slate-800">Upon Delivery</td>
                        </tr>
                        <tr>
                          <th className="text-end text-slate-500 text-sm font-semibold pr-3">Payment status:</th>
                          <td className="text-capitalize text-end font-semibold">
                            <span className={\`px-2 py-0.5 rounded text-xs \${invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}\`}>
                              {invoice.status?.replace("_", " ") || "Unpaid"}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>`;

const newBlock = `{/* Traditional Header */}
                <div className="flex justify-between items-start mb-8 border-b pb-6">
                  <div className="flex flex-col">
                    <img
                      src="/assets/logo_new-01.png"
                      alt="Adstra Logo"
                      style={{ maxWidth: "160px", height: "auto", marginBottom: "16px" }}
                    />
                    <div className="text-sm text-slate-600 leading-relaxed">
                      <strong>Adstra Digital</strong><br />
                      Thoppayil Beach, Calicut<br />
                      Kerala, India<br />
                      Phone: +91 974 477 9574 | 956 756 8185<br />
                      Email: info.adstradigital@gmail.com
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-end items-end h-full">
                    <h1 className="text-4xl font-bold tracking-widest text-slate-800 mb-4">INVOICE</h1>
                    <table className="table-auto text-sm text-right mt-2">
                      <tbody>
                        <tr>
                          <th className="pr-4 py-1 text-slate-500 font-medium">Invoice No:</th>
                          <td className="font-semibold text-slate-800 text-end">{invoice.invoice_no || "Auto-Generated"}</td>
                        </tr>
                        <tr>
                          <th className="pr-4 py-1 text-slate-500 font-medium">Date:</th>
                          <td className="font-semibold text-slate-800 text-end">
                            {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                        </tr>
                        <tr>
                          <th className="pr-4 py-1 text-slate-500 font-medium">Due Date:</th>
                          <td className="font-semibold text-slate-800 text-end">Upon Delivery</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Client Info */}
                <div className="mb-8">
                  <h6 className="font-bold text-slate-800 uppercase text-xs tracking-wider mb-2 border-b border-slate-200 pb-1 inline-block">Bill To</h6>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    <strong>{selectedClient?.company_name || selectedClient?.name || <span className="text-slate-400 italic">Select a client</span>}</strong><br />
                    {selectedClient?.company_name && selectedClient?.name && <>{selectedClient.name}<br /></>}
                    {selectedClient?.address && <>{selectedClient.address}<br /></>}
                    {selectedClient?.contact && <>Phone: {selectedClient.contact}<br /></>}
                    {selectedClient?.email && <>Email: {selectedClient.email}<br /></>}
                    {selectedClient?.gstin && <>GSTIN: {selectedClient.gstin}<br /></>}
                    {selectedClient?.lut && <>LUT: {selectedClient.lut}<br /></>}
                  </p>
                </div>`;

const lines = content.split('\n');
const startIdx = lines.findIndex(l => l.includes('{/* Company Banner with Logo — matches invoice view page */}'));
const endIdx = lines.findIndex(l => l.includes('{/* Items Table */}'));

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = newBlock.split('\n');
  lines.splice(startIdx, endIdx - startIdx, ...replacement);
  fs.writeFileSync(path, lines.join('\n'));
  console.log("Success! Header Replaced");
} else {
  console.error("Could not find delimiters. Start:", startIdx, "End:", endIdx);
}

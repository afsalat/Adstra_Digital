const fs = require('fs');
const path = 'c:/Projects/Adstra_Digital/adstra-next/src/components/InvoicePreview/InvoicePreview.js';

let content = fs.readFileSync(path, 'utf8');

const oldHeaderStart = '        {/* Header */}';
const oldHeaderEnd = '        {/* Client Info */}';

const newBlock = `        {/* Traditional Header */}
        <div className="d-flex justify-content-between align-items-start mb-4 border-bottom pb-3">
          <div className="d-flex flex-column">
            <img
              src="/assets/logo_new-01.png"
              alt="Adstra Logo"
              style={{ maxWidth: "160px", height: "auto", marginBottom: "16px" }}
            />
            <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#475569" }}>
              <strong>Adstra Digital</strong><br />
              Thoppayil Beach, Calicut<br />
              Kerala, India<br />
              Phone: +91 974 477 9574 | 956 756 8185<br />
              Email: info.adstradigital@gmail.com
            </div>
          </div>
          <div className="d-flex flex-column align-items-end text-end">
            <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", letterSpacing: "2px", color: "#1e293b", marginBottom: "16px" }}>
              INVOICE
            </h1>
            <table className="table table-sm table-borderless text-end shadow-none" style={{ width: "auto" }}>
              <tbody>
                <tr>
                  <th className="text-secondary fw-semibold pe-3 py-1">Invoice No:</th>
                  <td className="fw-bold py-1">{invoice?.invoice_no || "Auto-Generated"}</td>
                </tr>
                <tr>
                  <th className="text-secondary fw-semibold pe-3 py-1">Date:</th>
                  <td className="fw-bold py-1">
                    {invoice?.date
                      ? new Date(invoice.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </td>
                </tr>
                <tr>
                  <th className="text-secondary fw-semibold pe-3 py-1">Due Date:</th>
                  <td className="fw-bold py-1">
                    {invoice?.due_date
                      ? new Date(invoice.due_date).toLocaleDateString("en-IN")
                      : "Upon Delivery"}
                  </td>
                </tr>
                <tr>
                  <th className="text-secondary fw-semibold pe-3 py-1">Status:</th>
                  <td className="py-1">
                    <span className={\`px-2 py-1 rounded-pill text-xs fw-bold \${invoice?.status === 'paid' ? 'bg-success text-white' : invoice?.status === 'partially_paid' ? 'bg-info text-white' : invoice?.status === 'cancelled' ? 'bg-secondary text-white' : 'bg-danger text-white'}\`}>
                      {invoice?.status ? invoice.status.replace("_", " ").toUpperCase() : "UNPAID"}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Client Info */}`;

const startIndex = content.indexOf(oldHeaderStart);
const endIndex = content.indexOf(oldHeaderEnd);

if (startIndex !== -1 && endIndex !== -1) {
  const startStr = content.substring(0, startIndex);
  const endStr = content.substring(endIndex + oldHeaderEnd.length);
  const result = startStr + newBlock + endStr;

  // After we do this, we should remove the old table for Invoice Meta since it's already in the header
  const oldClientMetaStart = '<div className="col-md-7">';
  const oldClientMetaEnd = '</div>\n        </div>';

  let result2 = result;
  const cMetaStart = result2.indexOf(oldClientMetaStart);
  if (cMetaStart !== -1) {
    let metaSegment = result2.substring(cMetaStart);
    let endMatch = metaSegment.indexOf(oldClientMetaEnd);
    if (endMatch !== -1) {
      result2 = result2.substring(0, cMetaStart) + '        </div>\n' + metaSegment.substring(endMatch + oldClientMetaEnd.length);
    }
  }

  // Specifically we also need to change 'col-md-5' for the 'Bill To' column to be 'mb-4' instead, because we removed the right column.
  result2 = result2.replace('<div className="col-md-5">', '<div className="mb-4">');

  fs.writeFileSync(path, result2);
  console.log("Success! Invoice Preview Header Replaced.");
} else {
  console.error("Could not find delimiters.");
}

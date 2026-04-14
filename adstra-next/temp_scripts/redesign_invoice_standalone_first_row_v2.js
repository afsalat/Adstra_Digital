const fs = require('fs');
const path = 'c:/Projects/Adstra_Digital/adstra-next/src/components/InvoicePreview/InvoicePreview.js';

let content = fs.readFileSync(path, 'utf8');

const oldHeaderStart = '{/* Simplified Boxed Invoice Content */}';
const itemsTableMarker = '{/* Items Table Section */}';

const refinedBoxedLayout = `{/* Boxed GST Style Invoice Content - Combined First Row */}
        <div style={{ border: '2px solid black', fontFamily: 'Arial, sans-serif', color: 'black', background: 'white' }}>
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderBottom: '1px solid black', fontSize: '10px', fontWeight: 'bold' }}>
            <span>Page No. 1 of 1</span>
            <span style={{ fontSize: '14px', letterSpacing: '2px' }}>INVOICE</span>
            <span>Original Copy</span>
          </div>

          {/* Row 1: Logo and Invoice Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', borderBottom: '1px solid black' }}>
            <div style={{ padding: '12px', borderRight: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src="/assets/logo_lightBg-01.png"
                alt="Adstra Logo"
                style={{ maxWidth: '140px', height: 'auto' }}
              />
            </div>
            <div style={{ padding: '8px', fontSize: '11px' }}>
              <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '8px' }}>Invoice Details:</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '2px 0', color: '#666' }}>Invoice No</td>
                    <td style={{ padding: '2px 0' }}>: <span style={{ fontWeight: 'bold' }}>{invoice?.invoice_no}</span></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', color: '#666' }}>Date</td>
                    <td style={{ padding: '2px 0' }}>: <span style={{ fontWeight: 'bold' }}>{invoice?.date ? new Date(invoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}</span></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', color: '#666' }}>Due Date</td>
                    <td style={{ padding: '2px 0' }}>: <span style={{ fontWeight: 'bold' }}>{invoice?.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN') : "Upon Delivery"}</span></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', color: '#666' }}>Place of Supply</td>
                    <td style={{ padding: '2px 0' }}>: <span style={{ fontWeight: 'bold' }}>Kerala</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Row 2: From & To */}
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
              <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{invoice?.client?.company_name || invoice?.client?.name || "N/A"}</div>
              <div>{invoice?.client?.address || "N/A"}</div>
              <div style={{ marginTop: '2px' }}>GSTIN: {invoice?.client?.gstin || "-"} | Mobile: {invoice?.client?.contact || "-"}</div>
              <div>Email: {invoice?.client?.email || "-"}</div>
            </div>
          </div>`;

const startIndex = content.indexOf(oldHeaderStart);
const endIndex = content.indexOf(itemsTableMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const finalContent = content.substring(0, startIndex) + refinedBoxedLayout + content.substring(endIndex);
  fs.writeFileSync(path, finalContent, 'utf8');
  console.log("Success: InvoicePreview.js updated with Logo and Details in First Row.");
} else {
  console.error("Error: Could not find placeholders in InvoicePreview.js");
}

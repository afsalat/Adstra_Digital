"use client";

/**
 * ReceiptTemplate — pure presentational component.
 * Accepts all data as props, renders the formal receipt document.
 * Used by ReceiptDetail (saved receipt) and Create Transaction (live preview).
 */

/* ─── design tokens ─── */
const BLUE = "#2B6CB0";
const DARK_BLUE = "#1A4A80";
const LABEL_COLOR = "#6B7280";
const BORDER_COLOR = "#D1D5DB";
const TEXT_COLOR = "#1F2937";
const LIGHT_GRAY_BG = "#F9FAFB";
const TOTAL_BG = "#EBF4FF";

/* ─── helpers ─── */
function fmt(amount) {
  return Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const PAYMENT_MODE_LABELS = {
  upi: "UPI",
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  cheque: "Cheque",
  other: "Other",
};

/**
 * Props:
 *  clientName      string
 *  invoiceNo       string
 *  date            string  (ISO date)
 *  purpose         string
 *  amount          number  (amount paid / paying)
 *  paymentMode     string
 *  referenceNo     string
 *  notes           string
 *  invoiceTotal    number  (invoice total_amount)
 *  discountAmount  number
 *  taxAmount       number
 *  additionalFee   number
 *  balanceDue      number  (explicit balance from DB)
 *  isPreview       boolean (show DRAFT watermark instead of PAID)
 *  companySettings object
 */
export default function ReceiptTemplate({
  clientName = "",
  clientAddress = "",
  clientEmail = "",
  clientPhone = "",
  invoiceNo = "",
  date = "",
  purpose = "",
  amount = 0,
  paymentMode = "",
  referenceNo = "",
  notes = "",
  invoiceTotal = 0,
  discountAmount = 0,
  taxAmount = 0,
  additionalFee = 0,
  balanceDue = null,
  isPreview = false,
  companySettings = null,
}) {
  const amountPaid = parseFloat(amount) || 0;
  const total = parseFloat(invoiceTotal) || 0;
  const discount = parseFloat(discountAmount) || 0;
  const tax = parseFloat(taxAmount) || 0;
  const addFee = parseFloat(additionalFee) || 0;

  // Use explicit balanceDue if provided (from DB), else calculate it for preview
  const balanceAmt = balanceDue !== null ? parseFloat(balanceDue) : Math.max(0, total - amountPaid);

  /* company info — prefer dynamic settings with hardcoded fallbacks */
  const company = {
    name: companySettings?.name || "Adstra Digital",
    address: companySettings?.address || "Husna Complex 1st Floor, English Church Road,\nNadakkavu, Kozhikode - 673011",
    phone: companySettings?.mobile || "+91 9744 77 9574",
    email: companySettings?.email || "info@adstradigital.com",
    payableTo: companySettings?.name || "Adstra Digital",
  };

  const paymentModeLabel =
    PAYMENT_MODE_LABELS[(paymentMode || "").toLowerCase()] || paymentMode || "N/A";

  /* build line items */
  const lineItems = [];
  lineItems.push({
    desc: purpose || "Payment Received",
    amount: amountPaid > 0 ? fmt(amountPaid) : "",
  });
  if (referenceNo) lineItems.push({ desc: `Reference No: ${referenceNo}`, amount: "" });
  if (paymentMode) lineItems.push({ desc: `Payment Mode: ${paymentModeLabel}`, amount: "" });

  const MIN_ROWS = 8;
  const blankRows = Math.max(0, MIN_ROWS - lineItems.length);

  /* ─── inline styles ─── */
  const s = {
    page: {
      maxWidth: 760,
      margin: "0 auto",
      backgroundColor: "#fff",
      padding: "40px 44px",
      fontFamily: "Calibri, 'Segoe UI', Arial, sans-serif",
      color: TEXT_COLOR,
      fontSize: 13,
      boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
    },
    headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 },
    companyName: { fontSize: 30, fontWeight: 700, color: BLUE, lineHeight: 1.1, letterSpacing: "-0.5px" },
    receiptTitle: { fontSize: 28, fontWeight: 700, color: BLUE, textAlign: "right", letterSpacing: 1 },
    hr: { border: "none", borderTop: `2px solid ${BLUE}`, margin: "8px 0 0" },
    hrDouble: { border: "none", borderTop: `4px double ${BLUE}`, margin: "16px 0" },
    infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${BORDER_COLOR}` },
    label: { fontSize: 11, fontWeight: 700, color: LABEL_COLOR, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 8 },
    value: { fontWeight: 400, color: TEXT_COLOR, fontSize: 13 },
    addressSection: { display: "flex", padding: "14px 0", borderBottom: `1px solid ${BORDER_COLOR}` },
    addressBlock: { flex: 1 },
    addressLabel: { fontSize: 10, fontWeight: 700, color: LABEL_COLOR, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 },
    addressLine: { fontSize: 12.5, color: TEXT_COLOR, lineHeight: 1.65 },
    /* table */
    tableWrapper: { position: "relative" },
    tableHead: { display: "flex", justifyContent: "space-between", backgroundColor: BLUE, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "7px 10px" },
    tableRow: { display: "flex", justifyContent: "space-between", padding: "7px 10px", borderBottom: `1px dashed ${BORDER_COLOR}`, fontSize: 13, minHeight: 28 },
    paidWatermark: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%) rotate(-30deg)",
      fontSize: 110,
      fontWeight: 900,
      color: isPreview ? "rgba(180,180,180,0.18)" : "rgba(180,180,180,0.30)",
      letterSpacing: 8,
      pointerEvents: "none",
      whiteSpace: "nowrap",
      userSelect: "none",
      zIndex: 1,
      lineHeight: 1,
    },
    footerRow: { display: "flex", gap: "5%", paddingTop: 4 },
    commentsCol: { flex: "0 0 52%" },
    summaryCol: { flex: "1" },
    commentsLabel: { fontSize: 10, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 },
    commentsBox: { borderBottom: `1.5px solid ${BLUE}`, paddingBottom: 6, minHeight: 64 },
    commentLine: { fontSize: 12, color: TEXT_COLOR, lineHeight: 1.75 },
    summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px", borderBottom: `1px solid ${BORDER_COLOR}`, fontSize: 12 },
    summaryLabel: { color: LABEL_COLOR, fontWeight: 600, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" },
    summaryAmt: { color: TEXT_COLOR, textAlign: "right", minWidth: 72 },
    summaryTotalRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 8px", backgroundColor: TOTAL_BG, fontWeight: 700, fontSize: 13, borderTop: `2px solid ${BLUE}` },
    bottomBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 16 },
    thankYou: { fontStyle: "italic", fontWeight: 700, color: BLUE, fontSize: 14 },
    payableTo: { fontSize: 11, color: LABEL_COLOR, textAlign: "right", lineHeight: 1.5 },
  };

  return (
    <div style={s.page}>
      {/* HEADER */}
      <div style={s.headerRow}>
        <div>
          <img src="/assets/logo_new-01.png" alt="Company Logo" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
        </div>
        <div style={s.receiptTitle}>RECEIPT</div>
      </div>
      <hr style={s.hr} />

      {/* INVOICE # + DATE */}
      <div style={s.infoRow}>
        <div>
          <span style={s.label}>Invoice #</span>
          <span style={s.value}>{invoiceNo || "—"}</span>
        </div>
        <div>
          <span style={s.label}>Date</span>
          <span style={s.value}>{fmtDate(date) || fmtDate(new Date().toISOString().slice(0, 10))}</span>
        </div>
      </div>

      {/* MAILING INFO + BILL TO */}
      <div style={s.addressSection}>
        <div style={s.addressBlock}>
          <div style={s.addressLabel}>Mailing Info</div>
          <div style={s.addressLine}>
            {company.address.split("\n").map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
            Phone: {company.phone}<br />
            Email: {company.email}
          </div>
        </div>
        <div style={{ width: 1, backgroundColor: BORDER_COLOR, margin: "0 24px" }} />
        <div style={s.addressBlock}>
          <div style={s.addressLabel}>Bill To</div>
          <div style={s.addressLine}>
            <strong>{clientName || "—"}</strong><br />
            {clientAddress && (
              <span style={{ fontSize: 12, color: TEXT_COLOR }}>
                {clientAddress.split("\n").map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </span>
            )}
            {clientPhone && <span style={{ fontSize: 12 }}>Phone: {clientPhone}<br /></span>}
            {clientEmail && <span style={{ fontSize: 12 }}>Email: {clientEmail}<br /></span>}
            {invoiceNo && <div style={{ marginTop: 4 }}>Invoice: {invoiceNo}</div>}
            {balanceAmt > 0 && (
              <span style={{ color: "#DC2626", fontWeight: 600 }}>Balance Due: ₹{fmt(balanceAmt)}</span>
            )}
          </div>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div style={s.tableWrapper}>
        <div style={s.tableHead}>
          <span>Description</span>
          <span>Amount</span>
        </div>
        {lineItems.map((item, i) => (
          <div key={i} style={{ ...s.tableRow, ...(i % 2 === 1 ? { backgroundColor: LIGHT_GRAY_BG } : {}) }}>
            <span style={{ flex: 1, color: TEXT_COLOR }}>{item.desc}</span>
            {item.amount && (
              <span style={{ fontWeight: 500, color: TEXT_COLOR, minWidth: 80, textAlign: "right" }}>
                ₹{item.amount}
              </span>
            )}
          </div>
        ))}
        {Array.from({ length: blankRows }).map((_, i) => (
          <div key={`blank-${i}`} style={s.tableRow}>&nbsp;</div>
        ))}
        {/* PAID / DRAFT watermark */}
        <div style={s.paidWatermark} aria-hidden="true">
          {isPreview ? "DRAFT" : "PAID"}
        </div>
      </div>

      {/* DOUBLE RULE */}
      <hr style={s.hrDouble} />

      {/* FOOTER */}
      <div style={s.footerRow}>
        {/* Comments / Notes */}
        <div style={s.commentsCol}>
          <div style={s.commentsLabel}>Other Comments</div>
          <div style={s.commentsBox}>
            {notes ? (
              notes.split("\n").map((line, i) => (
                <div key={i} style={s.commentLine}>{i + 1}. {line}</div>
              ))
            ) : (
              <>
                <div style={s.commentLine}>1. Payment received via {paymentModeLabel}.</div>
                {referenceNo && (
                  <div style={s.commentLine}>2. Reference No: {referenceNo}</div>
                )}
                {invoiceNo && (
                  <div style={s.commentLine}>{referenceNo ? "3" : "2"}. Kindly retain this receipt for your records.</div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Summary */}
        <div style={s.summaryCol}>
          <div style={s.summaryRow}>
            <span style={s.summaryLabel}>Subtotal</span>
            <span style={s.summaryAmt}>{total > 0 ? `₹${fmt(total)}` : "—"}</span>
          </div>
          {tax > 0 && (
            <div style={s.summaryRow}>
              <span style={s.summaryLabel}>Tax</span>
              <span style={s.summaryAmt}>₹{fmt(tax)}</span>
            </div>
          )}
          {addFee > 0 && (
            <div style={s.summaryRow}>
              <span style={s.summaryLabel}>Additional Fee</span>
              <span style={s.summaryAmt}>₹{fmt(addFee)}</span>
            </div>
          )}
          {discount > 0 && (
            <div style={s.summaryRow}>
              <span style={s.summaryLabel}>Discount</span>
              <span style={{ ...s.summaryAmt, color: "#059669" }}>-₹{fmt(discount)}</span>
            </div>
          )}
          <div style={s.summaryTotalRow}>
            <span style={{ color: DARK_BLUE, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: 12 }}>
              Total Paid
            </span>
            <span style={{ color: DARK_BLUE, fontSize: 14 }}>₹{fmt(amountPaid)}</span>
          </div>
          {balanceAmt > 0 && (
            <div style={{ ...s.summaryRow, backgroundColor: "#FEF2F2" }}>
              <span style={{ ...s.summaryLabel, color: "#DC2626" }}>Balance Due</span>
              <span style={{ ...s.summaryAmt, color: "#DC2626", fontWeight: 700 }}>₹{fmt(balanceAmt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM BAR */}
      <hr style={{ ...s.hr, marginTop: 20 }} />
      <div style={s.bottomBar}>
        <div style={s.thankYou}>Thank You For Your Business!</div>
        <div style={s.payableTo}>
          Make all payments payable to:<br />
          <strong style={{ color: BLUE }}>{company.payableTo}</strong>
        </div>
      </div>
    </div>
  );
}

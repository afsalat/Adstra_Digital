"use client";
import Image from "next/image";
import logo from "../../assets/team/logo_gellery.png";

export default function ProformaHeader({
  tagline = "The Soul of a Premium Digital Brand",
  branches = [],
  billTo = {},
  quotationNo,
  quotationDate,
  reference,
  purpose = "",
  mainBranch = "",
  otherBranches = ""
}) {
  return (
    <div className="border px-4 py-3 bg-white rounded shadow small">
      {/* Logo and Branches */}
      <div className="row align-items-start">
        {/* Left: Logo + Tagline */}
        <div className="col-6 text-start">
          <Image src={logo} alt="Adstra Digital" width={85} height={73} />
          <div className="text-muted small mt-1">{tagline}</div>
        </div>

        {/* Right: Branches */}
        <div className="col-6 text-end text-sm leading-tight">
          {/* Main Branch */}
          <div className="mb-3">
            <div style={{fontWeight: "bold", fontSize: "0.8rem"}}> Main Branch</div>
            <div className="text-gray-800" style={{fontSize: "0.6rem"}}>
              {mainBranch}
            </div>
          </div>

          {/* Other Branches */}
            <div>
              <div style={{fontWeight: "bold", fontSize: "0.8rem"}}>
                 Registered Office
              </div>
                <div className="text-gray-700" style={{fontSize: "0.6rem"}}>
                  {otherBranches}
                </div>
            </div>
        </div>
      </div>

      <hr className="my-2" />

      {/* Proposal Info */}
      <div className="row">
        {/* Left Side */}
        <div className="col-6 text-start small">
          <strong className="text-uppercase">Proposal to:</strong>
          <div>{billTo?.name || "Client Name"}</div>
          <div>{billTo?.address || "City | State | Pin"}</div>
          <div>GSTIN: {billTo?.gstin || "GSTIN..."}</div>
          <div>LUT: {billTo?.lut || "LUT not available"}</div>
        </div>

        {/* Right Side */}
        <div className="col-6 text-end small">
          <strong>{billTo?.company_name || "Company Name"}</strong>
          <div>
            Quotation No: <strong>{quotationNo || "N/A"}</strong>
          </div>
          <div>
            Quotation Dt: <strong>{quotationDate || "N/A"}</strong>
          </div>
          <div>
            Reference: <strong>{reference || "N/A"}</strong>
          </div>
        </div>
      </div>

      {/* Purpose */}
      <div className="mt-2 small">
        <strong>Purpose:</strong> {purpose || "__________________________"}
      </div>
    </div>
  );
}

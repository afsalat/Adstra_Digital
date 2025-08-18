"use client";
import { useState } from "react";
import SectionEditor from "../SectionEditor/SectionEditor";
import ProposalPreview from "../ProposalPreview/ProposalPreview";
import ExportButton from "../ExportButton/ExportButton";
import ProformaHeader from "../ProformaHeader/ProformaHeader";
import HeaderEditor from "../HeaderEditor/HeaderEditor";
import ServiceTable from "../ServiceTable/ServiceTable";
import { serviceExtraDetails } from "../../data/clientData";

export default function ProposalBuilder() {
  const [service, setService] = useState([]);

  const [sections, setSections] = useState([
    {
      id: Date.now(),
      title: "Proposal by ADSTRA DIGITAL",
      type: "text",
      content: "",
    },
  ]);

  const [headerData, setHeaderData] = useState({
    tagline: "The Soul of a Premium Digital Brand",
    mainBranch:
      "Husna Complex, near English Church, West Nadakkave, west, Nadakkave, Kozhikode, Kerala 673011",
    otherBranches:
      "Anganvadi Road, Thiruvelli, Sulthan Bathery, Wayanad 673592",
    billTo: {
      name: "Client Name",
      address: "City | State | Pin: 673011",
      gstin: "N/A",
    },
    quotationNo: "",
    quotationDate: "",
    reference: "",
    purpose: "Quotation for N/A",
  });

  const updateSection = (id, updated) => {
    setSections(sections.map((sec) => (sec.id === id ? updated : sec)));
  };

  const removeSection = (id) => {
    setSections(sections.filter((sec) => sec.id !== id));
  };

  const addSection = () => {
    setSections([
      ...sections,
      { id: Date.now(), title: "", type: "text", content: "" },
    ]);
  };

  const addExtraSectionFromService = (serviceName) => {
    const detail = serviceExtraDetails[serviceName];
    if (!detail) return;

    const exists = sections.some(
      (s) => s.title === serviceName && s.type === "textarea"
    );

    if (exists) {
      setSections(
        sections.map((s) =>
          s.title === serviceName && s.type === "textarea"
            ? { ...s, content: detail }
            : s
        )
      );
    } else {
      setSections([
        ...sections,
        {
          id: Date.now(),
          title: serviceName,
          type: "textarea",
          alignment: "left",
          content: detail,
        },
      ]);
    }
  };

  const handleSaveProposal = async () => {
    try {
      const token = localStorage.getItem("auth_token")?.replace(/"/g, "");
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

      const total = service.reduce((acc, item) => acc + item.amount, 0);
      const numberToWords = (n) => `${n} Rupees only`;

      const payload = {
        proposal_no: headerData.quotationNo,
        reference: headerData.reference,
        purpose: headerData.purpose,
        total_amount: total,
        total_in_words: numberToWords(total),
        client: headerData.billTo?.id,
        services: service.map((item) => ({
          ...item,
          gst: parseFloat(item.gst) || 0,
        })),
        sections: sections,
      };

      const response = await fetch(`${API_BASE_URL}/proposal/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Proposal saved successfully!");
      } else {
        console.error("Save failed:", data);
        alert("❌ Failed to save proposal.");
      }
    } catch (error) {
      console.error("Error saving proposal:", error);
      alert("❌ Error while saving proposal.");
    }
  };

  return (
    <div className="container py-5" style={{ minHeight: "100vh" }}>
      <button onClick={() => window.history.back()} className="btn btn-secondary w-10">
        Back
      </button>
     <br />
     <br />

      <div className="row g-4">
        {/* Left Editor */}
        <div className="col-md-6">
          <div className="bg-white p-4 shadow-sm rounded-3 h-100 d-flex flex-column overflow-auto border">
            <h2 className="h4 fw-semibold text-primary mb-3">
              📝 Proposal Editor
            </h2>
            <hr className="text-muted" />

            <HeaderEditor data={headerData} onChange={setHeaderData} />

            <div className="mb-3">
              <ServiceTable
                services={service}
                onChange={setService}
                onServiceSelect={addExtraSectionFromService}
              />
              {sections.map((sec) => (
                <SectionEditor
                  key={sec.id}
                  section={sec}
                  onChange={(s) => updateSection(sec.id, s)}
                  onRemove={() => removeSection(sec.id)}
                />
              ))}
            </div>

            <div className="sticky-bottom bg-white pt-2 pb-3 mt-auto d-flex justify-content-between align-items-center border-top">
              <button className="btn btn-outline-primary" onClick={addSection}>
                ➕ Add Section
              </button>
            </div>

            <div className="mt-4">
              <ExportButton />
              <button
                className="btn btn-success w-100 mt-3"
                onClick={handleSaveProposal}
              >
                💾 Save Proposal
              </button>
            </div>
          </div>
        </div>

        {/* Right Preview */}
        <div className="col-md-6">
          <div
            id="proposal-content"
            className="bg-white p-3 shadow-sm rounded-3 h-100 overflow-auto border"
          >
            <ProformaHeader {...headerData} />
            <ProposalPreview sections={sections} services={service} />
          </div>
        </div>
      </div>
    </div>
  );
}

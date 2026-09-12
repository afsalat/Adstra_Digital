import React, { useState, useEffect } from "react";
import axios from "axios";
import { useModal } from "@/Context/ModalContext";

const SettingsPanel = ({ API_BASE, proposalOnly = false }) => {
  const { showAlert, showConfirm } = useModal();
  const [settings, setSettings] = useState({
    name: "",
    address: "",
    gstin: "",
    lut_no: "",
    mobile: "",
    email: "",
    bank_name: "",
    account_no: "",
    ifsc: "",
    branch: "",
    invoice_prefix: "INV-AD-2026",
    proforma_prefix: "PI-AD-2026",
    invoice_next_number: 1,
    proforma_next_number: 1,
    terms_conditions: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    axios.get(`${API_BASE}/settings/`, {
      headers: getAuthHeaders(),
    })
      .then(res => {
        if (res.data) setSettings(res.data);
        setLoading(false);
      })
      .catch(err => {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to fetch settings:", err);
        }
        setLoading(false);
      });
  }, [API_BASE]);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Create a clean data object without read-only ID
    const { id, ...saveData } = settings;

    axios.put(`${API_BASE}/settings/`, saveData, {
      headers: getAuthHeaders(),
    })
      .then((res) => {
        showAlert("Success", "Settings updated successfully!", "success");
        if (res.data) setSettings(res.data);
        setSaving(false);
      })
      .catch(err => {
        if (process.env.NODE_ENV !== "production") {
          console.error("Save Error:", err);
        }
        const errorMsg = err.response?.data ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(", ") : "Failed to save settings.";
        showAlert("Save Failed", errorMsg, "error");
        setSaving(false);
      });
  };

  const downloadBackup = async (table = "full") => {
    try {
      const response = await axios.get(`${API_BASE}/settings/backup/export/`, {
        headers: getAuthHeaders(),
        params: { table },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `adstra_${table}_backup.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Export Error:", err);
      }
      showAlert("Export Failed", err.response?.data?.error || "Failed to export backup.", "error");
    }
  };

  const handleExport = () => {
    downloadBackup("full");
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showConfirm(
      "Warning: Data Overwrite",
      "⚠️ WARNING: This will OVERWRITE all existing data with the data from the backup file. Are you sure you want to proceed?",
      async () => {
        const formData = new FormData();
        formData.append("file", file);

        try {
          setSaving(true);
          const res = await axios.post(`${API_BASE}/settings/backup/import/`, formData, {
            headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" }
          });
          showAlert("Import Successful", res.data.message || "Backup restored successfully!", "success");
          setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
          if (process.env.NODE_ENV !== "production") {
            console.error("Import Error:", err);
          }
          showAlert("Import Failed", err.response?.data?.error || "Failed to restore backup.", "error");
        } finally {
          setSaving(false);
          e.target.value = null;
        }
      },
      "warning"
    );
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', textAlign: 'left' }}>
      <div style={{ background: '#ffffff', padding: '32px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)', border: '1px solid #E2E8F0' }}>
        {!proposalOnly && <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '2rem', color: '#0f172a' }}>Organization Settings</h3>}
        <form onSubmit={handleSave} noValidate style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3rem' }}>
          
          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Company Profile */}
            <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 className="font-semibold text-indigo-600 border-b pb-2" style={{ color: '#4f46e5', fontWeight: '600', paddingBottom: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Company Profile</h4>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Company Name</label>
                <input className="w-full border p-2 rounded mt-1" style={{ width: '100%', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '0.25rem', marginTop: '0.25rem' }} value={settings.name} onChange={e => setSettings({...settings, name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Address</label>
                <textarea className="w-full border p-2 rounded mt-1" rows="3" style={{ width: '100%', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '0.25rem', marginTop: '0.25rem' }} value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>GSTIN</label>
                  <input className="w-full border p-2 rounded mt-1" style={{ width: '100%', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '0.25rem', marginTop: '0.25rem' }} value={settings.gstin} onChange={e => setSettings({...settings, gstin: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>LUT Number</label>
                  <input className="w-full border p-2 rounded mt-1" style={{ width: '100%', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '0.25rem', marginTop: '0.25rem' }} value={settings.lut_no} onChange={e => setSettings({...settings, lut_no: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Phone</label>
                  <input className="w-full border p-2 rounded mt-1" style={{ width: '100%', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '0.25rem', marginTop: '0.25rem' }} value={settings.mobile} onChange={e => setSettings({...settings, mobile: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Email</label>
                  <input type="text" className="w-full border p-2 rounded mt-1" style={{ width: '100%', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '0.25rem', marginTop: '0.25rem' }} value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Invoice Numbering */}
            {!proposalOnly && (
              <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 className="font-semibold text-indigo-600 border-b pb-2" style={{ color: '#4f46e5', fontWeight: '600', paddingBottom: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Invoice Numbering</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                  {/* Tax Invoice Config */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', marginBottom: '0.75rem' }}>Tax Invoice</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase" style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Prefix</label>
                        <input className="w-full border p-2 rounded mt-1" style={{ width: '100%', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '0.25rem', marginTop: '0.25rem' }} value={settings.invoice_prefix} onChange={e => setSettings({...settings, invoice_prefix: e.target.value})} placeholder="INV-AD-2026" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase" style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Next No.</label>
                        <input type="number" min="1" className="w-full border p-2 rounded mt-1" style={{ width: '100%', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '0.25rem', marginTop: '0.25rem' }} value={settings.invoice_next_number} onChange={e => setSettings({...settings, invoice_next_number: parseInt(e.target.value) || 1})} />
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#6366f1', marginTop: '0.5rem', fontWeight: '600' }}>Preview: {settings.invoice_prefix || "INV-AD-2026"}-{String(settings.invoice_next_number || 1).padStart(4, '0')}</div>
                  </div>
                  
                  {/* Proforma Number Config */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', marginBottom: '0.75rem' }}>Proforma Invoice</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase" style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Prefix</label>
                        <input className="w-full border p-2 rounded mt-1" style={{ width: '100%', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '0.25rem', marginTop: '0.25rem' }} value={settings.proforma_prefix} onChange={e => setSettings({...settings, proforma_prefix: e.target.value})} placeholder="PI-AD-2026" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase" style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Next No.</label>
                        <input type="number" min="1" className="w-full border p-2 rounded mt-1" style={{ width: '100%', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '0.25rem', marginTop: '0.25rem' }} value={settings.proforma_next_number} onChange={e => setSettings({...settings, proforma_next_number: parseInt(e.target.value) || 1})} />
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#6366f1', marginTop: '0.5rem', fontWeight: '600' }}>Preview: {settings.proforma_prefix || "PI-AD-2026"}-{String(settings.proforma_next_number || 1).padStart(4, '0')}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Bank Details */}
            <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 className="font-semibold text-indigo-600 border-b pb-2" style={{ color: '#4f46e5', fontWeight: '600', paddingBottom: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Bank Details</h4>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Bank Name</label>
                <input className="w-full border p-2 rounded mt-1" style={{ width: '100%', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '0.25rem', marginTop: '0.25rem' }} value={settings.bank_name} onChange={e => setSettings({...settings, bank_name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Account Number</label>
                <input className="w-full border p-2 rounded mt-1" style={{ width: '100%', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '0.25rem', marginTop: '0.25rem' }} value={settings.account_no} onChange={e => setSettings({...settings, account_no: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>IFSC Code</label>
                  <input className="w-full border p-2 rounded mt-1" style={{ width: '100%', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '0.25rem', marginTop: '0.25rem' }} value={settings.ifsc} onChange={e => setSettings({...settings, ifsc: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Branch</label>
                  <input className="w-full border p-2 rounded mt-1" style={{ width: '100%', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '0.25rem', marginTop: '0.25rem' }} value={settings.branch} onChange={e => setSettings({...settings, branch: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexGrow: 1 }}>
              <h4 className="font-semibold text-indigo-600 border-b pb-2" style={{ color: '#4f46e5', fontWeight: '600', paddingBottom: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Terms & Conditions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <label className="text-xs font-bold text-slate-500 uppercase" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Invoice Footer Rules (Separate by double slash //)</label>
                <textarea className="w-full border p-2 rounded mt-1" style={{ width: '100%', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '0.25rem', marginTop: '0.25rem', flexGrow: 1, minHeight: '200px', resize: 'vertical' }} value={settings.terms_conditions} onChange={e => setSettings({...settings, terms_conditions: e.target.value})} placeholder="Rule 1 // Rule 2 // Rule 3" />
              </div>
            </div>

          </div>

          {/* SYSTEM BACKUP & RESTORE */}
          {!proposalOnly && (
            <div className="col-span-full pt-10 mt-10 border-t" style={{ gridColumn: '1 / -1', paddingTop: '2.5rem', marginTop: '2.5rem', borderTop: '2px dashed #e2e8f0' }}>
              <h4 className="font-semibold text-rose-600 mb-4" style={{ color: '#e11d48', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Advanced System Backup & Restore</span>
                <span style={{ fontSize: '0.7rem', backgroundColor: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>Admin Only</span>
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', background: '#fff1f2', padding: '2rem', borderRadius: '1rem', border: '1px solid #fecaca' }}>
                <div>
                  <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                    <strong>Export Full Backup:</strong> Generate a comprehensive JSON backup of all system data including clients, invoices, proposals, attendance records, and user profiles. Keep this file safe for data recovery.
                  </p>
                  <button 
                    type="button" 
                    onClick={handleExport}
                    style={{ backgroundColor: '#0f172a', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: '600', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    Download Full Backup (.json)
                  </button>

                  {/* Separate Backups */}
                  <div style={{ marginTop: '2.5rem', borderTop: '1px solid #fecaca', paddingTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#be123c', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Separate Table Backups:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      {[
                        { id: 'users', label: 'Users' },
                        { id: 'attendance', label: 'Attendance' },
                        { id: 'invoices', label: 'Tax Invoices' },
                        { id: 'performa', label: 'Proforma' },
                        { id: 'proposals', label: 'Proposals' },
                        { id: 'receipts', label: 'Receipts' },
                        { id: 'clients', label: 'Clients' },
                        { id: 'settings', label: 'Settings' }
                      ].map(btn => (
                        <button
                          key={btn.id}
                          type="button"
                          onClick={() => downloadBackup(btn.id)}
                          style={{ 
                            padding: '0.5rem 1rem', 
                            borderRadius: '0.5rem', 
                            border: '1px solid #fecaca', 
                            background: 'white', 
                            cursor: 'pointer', 
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: '#475569',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={e => e.target.style.background = '#fff1f2'}
                          onMouseOut={e => e.target.style.background = 'white'}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                    <strong>Restore from Backup:</strong> Upload a previously exported backup file to restore the entire system state. 
                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}> Warning: This will permanently overwrite all current data.</span>
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input 
                      type="file" 
                      accept=".json" 
                      id="backup-upload" 
                      onChange={handleImport} 
                      style={{ display: 'none' }} 
                    />
                    <label 
                      htmlFor="backup-upload"
                      style={{ backgroundColor: '#ef4444', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: '600', border: 'none', cursor: 'pointer', display: 'inline-block' }}
                    >
                      {saving ? "Processing..." : "Upload & Restore System"}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="col-span-full pt-6 border-t flex justify-end" style={{ gridColumn: '1 / -1', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:bg-slate-400"
              style={{ backgroundColor: '#4f46e5', color: '#fff', padding: '0.75rem 2rem', borderRadius: '0.75rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPanel;

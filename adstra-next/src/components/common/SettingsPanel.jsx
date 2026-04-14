import React, { useState, useEffect } from "react";
import axios from "axios";

const SettingsPanel = ({ API_BASE }) => {
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

  useEffect(() => {
    axios.get(`${API_BASE}/settings/`)
      .then(res => {
        if (res.data) setSettings(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch settings:", err);
        setLoading(false);
      });
  }, [API_BASE]);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Create a clean data object without read-only ID
    const { id, ...saveData } = settings;
    
    console.log("Saving settings:", saveData);
    axios.put(`${API_BASE}/settings/`, saveData)
      .then((res) => {
        alert("Settings updated successfully!");
        if (res.data) setSettings(res.data);
        setSaving(false);
      })
      .catch(err => {
        console.error("Save Error:", err);
        const errorMsg = err.response?.data ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(", ") : "Failed to save settings.";
        alert(errorMsg);
        setSaving(false);
      });
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="settings-panel w-full col-span-full" style={{ textAlign: 'left' }}>
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Organization Settings</h3>
        <form onSubmit={handleSave} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
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
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Terms & Conditions (Separate by double slash //)</label>
              <textarea className="w-full border p-2 rounded mt-1" rows="5" style={{ width: '100%', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '0.25rem', marginTop: '0.25rem' }} value={settings.terms_conditions} onChange={e => setSettings({...settings, terms_conditions: e.target.value})} placeholder="Rule 1 // Rule 2 // Rule 3" />
            </div>
          </div>

          {/* Invoice Numbering Section */}
          <div className="col-span-full" style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
            <h4 className="font-semibold text-indigo-600 border-b pb-2" style={{ color: '#4f46e5', fontWeight: '600', paddingBottom: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Invoice Numbering</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.5rem', marginTop: '0.75rem' }}>
              {/* Invoice Number Config */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', marginBottom: '0.75rem' }}>Tax Invoice</div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase" style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Prefix (incl. year)</label>
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
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase" style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Prefix (incl. year)</label>
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

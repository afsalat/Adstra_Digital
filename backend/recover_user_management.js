const fs = require('fs');

const filePath = 'c:\\\\Projects\\\\Adstra_Digital\\\\adstra-next\\\\src\\\\components\\\\admin_side\\\\UserManagement\\\\UserManagement.jsx';

let content = fs.readFileSync(filePath, 'utf8');

// 1. Add LEAD_PERMISSION_SECTIONS and buildPermissionSections
const prefix = `const BASE_URL = API_BASE_URL;
const FULL_ACCESS_ROLES = new Set(["admin", "super_admin"]);`;

const newPrefix = `const BASE_URL = API_BASE_URL;
const FULL_ACCESS_ROLES = new Set(["admin", "super_admin"]);
const MODULE_LABELS = {
  users: "User Management",
  attendance: "Attendance",
  clients: "Clients",
  proposals: "Proposals",
  invoices: "Invoices",
  proforma_invoices: "Proforma Invoices",
  transactions: "Transactions",
  receipts: "Receipts",
  settings: "Settings",
  blogs: "Blog Posts",
  backup: "Backup",
};

const LEAD_PERMISSION_SECTIONS = [
  {
    title: "Leads List",
    codes: ["lead.view_own", "lead.view_all", "lead.create", "lead.edit", "lead.delete", "lead.import", "lead.export"],
  },
  {
    title: "Sales Team",
    codes: ["lead.assign", "lead.reassign"],
  },
  {
    title: "My Profile",
    codes: ["lead.view_my_profile", "lead.call", "lead.follow_up", "lead.schedule_meeting"],
  },
  {
    title: "Lead Workflow",
    codes: [
      "lead.complete_demo",
      "lead.capture_requirement",
      "lead.technical_review",
      "lead.create_cost_estimate",
      "lead.approve_cost_estimate",
      "lead.create_proposal",
      "lead.create_quotation",
      "lead.convert",
      "lead.reject",
      "lead.reopen",
    ],
  },
  {
    title: "Emailing",
    codes: ["lead.send_email"],
  },
  {
    title: "Reports & Settings",
    codes: ["lead.view_reports", "lead.manage_settings"],
  },
];

const buildPermissionSections = (permissions) => {
  const sections = [];
  const consumed = new Set();

  LEAD_PERMISSION_SECTIONS.forEach(({ title, codes }) => {
    const items = codes
      .filter((code) => permissions[code])
      .map((code) => {
        consumed.add(code);
        return { code, label: permissions[code] };
      });

    if (items.length > 0) {
      sections.push({ title, items, isLeadSection: true });
    }
  });

  const modules = {};
  Object.entries(permissions).forEach(([code, label]) => {
    if (consumed.has(code)) return;
    const prefix = code.split(".")[0] || "other";
    const title = MODULE_LABELS[prefix] || "General";
    if (!modules[title]) modules[title] = [];
    modules[title].push({ code, label });
  });

  Object.entries(modules).forEach(([title, items]) => {
    sections.push({ title, items, isLeadSection: false });
  });

  return sections;
};`;
content = content.replace(prefix, newPrefix);

// 2. Add selectedRoleForm state
const stateBlock = `  const [roles, setRoles] = useState({});
  const [permissions, setPermissions] = useState({});`;
const newStateBlock = `  const [roles, setRoles] = useState({});
  const [permissions, setPermissions] = useState({});
  const [selectedRoleForm, setSelectedRoleForm] = useState("");`;
content = content.replace(stateBlock, newStateBlock);

// 3. Initialize selectedRoleForm
const handleAdd = `  const handleAddUser = () => {
    setEditUser(null);
    setShowForm(true);
  };`;
const newHandleAdd = `  const handleAddUser = () => {
    setEditUser(null);
    setSelectedRoleForm("employee");
    setShowForm(true);
  };`;
content = content.replace(handleAdd, newHandleAdd);

const handleEdit = `  const handleEdit = (user) => {
    setEditUser(user);
    setShowForm(true);
  };`;
const newHandleEdit = `  const handleEdit = (user) => {
    setEditUser(user);
    setSelectedRoleForm(user.role || "employee");
    setShowForm(true);
  };`;
content = content.replace(handleEdit, newHandleEdit);

// 4. Modify role select and add radio buttons
const roleSelect = `                    <select
                      name="role"
                      defaultValue={editUser?.role || "employee"}
                      onChange={(e) => {
                        const shouldCheckAll = FULL_ACCESS_ROLES.has(e.target.value);
                        const permissionInputs = e.currentTarget
                          .closest("form")
                          ?.querySelectorAll("input[name='custom_permissions']");
                        permissionInputs?.forEach((input) => {
                          input.checked = shouldCheckAll;
                        });
                      }}
                    >
                      {Object.keys(roles).length > 0 ? (
                        Object.keys(roles).map((role) => (
                          <option key={role} value={role}>{role.replaceAll("_", " ")}</option>
                        ))
                      ) : (
                        <option value="employee">employee</option>
                      )}
                    </select>
                  </label>
                </div>`;

const newRoleSelect = `                    <select
                      name="role"
                      defaultValue={editUser?.role || "employee"}
                      onChange={(e) => {
                        const newRole = e.target.value;
                        setSelectedRoleForm(newRole);
                        const shouldCheckAll = FULL_ACCESS_ROLES.has(newRole);
                        const permissionInputs = e.currentTarget
                          .closest("form")
                          ?.querySelectorAll("input[name='custom_permissions']");
                        permissionInputs?.forEach((input) => {
                          input.checked = shouldCheckAll;
                        });
                      }}
                    >
                      {Object.keys(roles).length > 0 ? (
                        Object.keys(roles).map((role) => (
                          <option key={role} value={role}>{role.replaceAll("_", " ")}</option>
                        ))
                      ) : (
                        <option value="employee">employee</option>
                      )}
                    </select>
                  </label>
                  
                  {selectedRoleForm === "sales_and_marketing" && (
                    <div className="form-field radio-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1', marginTop: '8px' }}>
                      <span style={{ fontWeight: '500', color: '#1e293b' }}>Sales Role Type</span>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input 
                            type="radio" 
                            name="sales_role_type" 
                            value="my_profile" 
                            onChange={(e) => {
                              const form = e.target.closest('form');
                              const inputs = form.querySelectorAll("input[name='custom_permissions']");
                              inputs.forEach(input => input.checked = false);
                              const myProfileCodes = [
                                "lead.view_own", "lead.create", "lead.edit", "lead.export", 
                                "lead.send_email", "lead.call", "lead.follow_up", "lead.schedule_meeting", 
                                "lead.complete_demo", "lead.capture_requirement", "lead.view_reports"
                              ];
                              inputs.forEach(input => {
                                if (myProfileCodes.includes(input.value)) input.checked = true;
                              });
                            }}
                          />
                          My Profile
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input 
                            type="radio" 
                            name="sales_role_type" 
                            value="team_lead" 
                            onChange={(e) => {
                              const form = e.target.closest('form');
                              const inputs = form.querySelectorAll("input[name='custom_permissions']");
                              inputs.forEach(input => input.checked = false);
                              const allLeadCodes = LEAD_PERMISSION_SECTIONS.flatMap(s => s.codes);
                              inputs.forEach(input => {
                                if (allLeadCodes.includes(input.value)) input.checked = true;
                              });
                            }}
                          />
                          Team Lead
                        </label>
                      </div>
                    </div>
                  )}
                </div>`;
content = content.replace(roleSelect, newRoleSelect);

// 5. Replace permissions-panel
const oldPermissionsPanel = `                <div className="permissions-panel">
                  <label className="field-label">Custom Permissions</label>
                  {Object.keys(permissions).length > 0 && (() => {
                    const categories = {};
                    Object.entries(permissions).forEach(([code, label]) => {
                      const prefix = code.split(".")[0] || "other";
                      const catName = {
                        lead: "Lead Management",
                        users: "User Management",
                        attendance: "Attendance",
                        clients: "Clients",
                        proposals: "Proposals",
                        invoices: "Invoices",
                        transactions: "Transactions",
                        settings: "Settings",
                        blogs: "Blog Posts",
                        backup: "Backup",
                      }[prefix] || "General";

                      if (!categories[catName]) categories[catName] = [];
                      categories[catName].push({ code, label });
                    });

                    return (
                      <div className="permissions-categories">
                        {Object.entries(categories).map(([catName, permList]) => (
                          <div key={catName} className="permission-category-group" style={{ marginBottom: "16px" }}>
                            <strong className="category-title" style={{ display: "block", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", marginBottom: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px" }}>
                              {catName}
                            </strong>
                            <div className="permissions-grid">
                              {permList.map(({ code, label }) => (
                                <label key={code} className="permission-option">
                                  <input
                                    type="checkbox"
                                    name="custom_permissions"
                                    value={code}
                                    defaultChecked={
                                      FULL_ACCESS_ROLES.has(editUser?.role) ||
                                      (editUser?.effective_permissions || []).includes("*") ||
                                      (editUser?.custom_permissions || []).includes(code)
                                    }
                                  />
                                  <span>{label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>`;

const newPermissionsPanel = `                <div className="permissions-panel">
                  <div className="form-panel-title">
                    <span>Custom Permissions</span>
                    <small>Section-wise access control</small>
                  </div>
                  {Object.keys(permissions).length > 0 && (() => {
                    const sections = buildPermissionSections(permissions);

                    return (
                      <div className="permissions-categories">
                        {sections.map(({ title, items, isLeadSection }) => (
                          <div key={title} className={\`permission-category-group \${isLeadSection ? "permission-category-group--lead" : ""}\`}>
                            <strong className="category-title">
                              {title}
                            </strong>
                            <div className="permissions-grid">
                              {items.map(({ code, label }) => (
                                <label key={code} className="permission-option">
                                  <input
                                    type="checkbox"
                                    name="custom_permissions"
                                    value={code}
                                    defaultChecked={
                                      FULL_ACCESS_ROLES.has(editUser?.role) ||
                                      (editUser?.effective_permissions || []).includes("*") ||
                                      (editUser?.custom_permissions || []).includes(code)
                                    }
                                  />
                                  <span>{label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>`;

content = content.replace(oldPermissionsPanel, newPermissionsPanel);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated successfully");

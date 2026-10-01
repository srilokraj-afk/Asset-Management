import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
 Archive,
 Bell,
 BarChart3,
 CheckCircle2,
 ClipboardCheck,
 ClipboardList,
 Clock3,
 Factory,
 Laptop,
 LayoutDashboard,
 LogOut,
 Package,
 Plus,
 RefreshCw,
 AlertTriangle,
 Search,
 Settings,
 ShieldCheck,
 User,
 Users,
 Wrench,
 Trash2,
 Download,
 XCircle
} from "lucide-react";

import "./styles.css";


/* =========================================================
   CONSTANTS
========================================================= */

const STATUS_META = {
 IN_STOCK: {
  label: "In Stock",
  icon: Package
 },
 ASSIGNED: {
  label: "Assigned",
  icon: ClipboardList
 },
 IN_REPAIR: {
  label: "In Repair",
  icon: Wrench
 },
 RETIRED: {
  label: "Retired",
  icon: Archive
 }
};

const EMPTY_USER_FORM = { username: "", password: "", role: "EMPLOYEE", displayName: "", email: "", department: "" };

const EMPTY_FORM = {
 assetTag: "",
 type: "LAPTOP",
 make: "",
 model: "",
 serialNumber: "",
 purchaseDate: "",
 warrantyExpiry: "",
 costMinor: "",
 currency: "USD",
 condition: "NEW",
 notes: ""
};


/* =========================================================
   API
========================================================= */

async function api(path, options = {}) {
 const session = localStorage.getItem("assetLifecycleSession");

 const response = await fetch(path, {
  ...options,
  headers: {
   "Content-Type": "application/json",

   ...(session
       ? {
        "X-Session-Id": session
       }
       : {}),

   ...(options.headers || {})
  }
 });

 const text = await response.text();

 let data = null;

 try {
  data = text ? JSON.parse(text) : null;
 } catch {
  data = null;
 }

 if (!response.ok) {
  throw new Error(
      data?.detail ||
      data?.message ||
      `Request failed (${response.status})`
  );
 }

 return data;
}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {
 localStorage.removeItem("assetLifecycleSession");
 localStorage.removeItem("assetLifecycleUser");
 localStorage.removeItem("assetLifecycleProfile");

 window.location.reload();
}


/* =========================================================
   LOGIN
========================================================= */

function LoginPage({ onLogin }) {
 const [username, setUsername] = useState("");
 const [password, setPassword] = useState("");

 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");

 const submit = async (e) => {
  e.preventDefault();

  setError("");

  if (!username.trim() || !password) {
   setError("Username and password are required.");
   return;
  }

  setLoading(true);

  try {
   const r = await api("/api/auth/login", {
    method: "POST",

    body: JSON.stringify({
     username: username.trim(),
     password
    })
   });

   localStorage.setItem(
       "assetLifecycleSession",
       r.sessionId
   );

   localStorage.setItem(
       "assetLifecycleUser",
       r.username
   );

   localStorage.setItem(
       "assetLifecycleProfile",
       JSON.stringify(r)
   );

   onLogin(r);

  } catch (e) {
   setError(e.message);

  } finally {
   setLoading(false);
  }
 };

 return (
     <div className="login-page">

      <div className="login-card">

       <div className="login-brand-mark">
        <Laptop size={27} />
       </div>

       <div className="login-eyebrow">
        ENFEC ONE
       </div>

       <h1>
        Asset Management
       </h1>

       <p className="login-subtitle">
        Sign in to manage assets, requests and lifecycle status.
       </p>

       <form
           onSubmit={submit}
           className="login-form"
       >

        <label>
            <span>
              Username
            </span>

         <input
             value={username}
             onChange={(e) =>
                 setUsername(e.target.value)
             }
             placeholder="admin or ravi"
             autoFocus
         />
        </label>


        <label>
            <span>
              Password
            </span>

         <input
             type="password"
             value={password}
             onChange={(e) =>
                 setPassword(e.target.value)
             }
             placeholder="Enter password"
         />
        </label>


        {error && (
            <div className="login-error">
             <XCircle size={17} />

             {error}
            </div>
        )}


        <button
            className="login-btn"
            disabled={loading}
        >
         {loading
             ? "Signing in..."
             : "Sign In"}
        </button>

       </form>


       <div className="demo-accounts">

        <b>
         Demo accounts
        </b>

        <span>
            Admin: admin / admin123
          </span>

        <span>
            Employee: ravi / ravi123
          </span>

       </div>

      </div>

     </div>
 );
}


/* =========================================================
   COMMON COMPONENTS
========================================================= */

function Stat({
               title,
               value,
               icon: Icon
              }) {
 return (
     <div className="stat-card">

      <div className="stat-icon">
       <Icon size={19} />
      </div>

      <div>
        <span>
          {title}
        </span>

       <strong>
        {value}
       </strong>
      </div>

     </div>
 );
}


function Notice({
                 notice,
                 onClose
                }) {
 if (!notice) {
  return null;
 }

 return (
     <div
         className={`notice ${notice.type}`}
     >

      <CheckCircle2 size={17} />

      <span>
        {notice.text}
      </span>

      <button
          onClick={onClose}
      >
       <XCircle size={15} />
      </button>

     </div>
 );
}


function StatusBadge({
                      status
                     }) {
 const meta =
     STATUS_META[status] || {
      label: status,
      icon: Package
     };

 const Icon = meta.icon;

 return (
     <span
         className={`status-badge ${status?.toLowerCase()}`}
     >

      <Icon size={13} />

      {meta.label}

    </span>
 );
}


/* =========================================================
   EMPLOYEE DASHBOARD
========================================================= */

function EmployeeDashboard({
                            profile
                           }) {
 const [page, setPage] =
     useState("dashboard");

 const [assets, setAssets] =
     useState([]);

 const [requests, setRequests] =
     useState([]);

 const [notifications, setNotifications] =
     useState([]);

 const [notice, setNotice] =
     useState(null);

 const [showRequest, setShowRequest] =
     useState(false);

 const [loading, setLoading] =
     useState(true);

 const [form, setForm] =
     useState({
      assetType: "LAPTOP",
      reason: "",
      priority: "NORMAL",
      requiredDate: "",
      comments: ""
     });


 const load = async () => {
  setLoading(true);

  try {

   const [
    a,
    r,
    n
   ] = await Promise.all([
    api("/api/assets/my"),
    api("/api/asset-requests/my"),
    api("/api/notifications")
   ]);

   setAssets(a || []);
   setRequests(r || []);
   setNotifications(n || []);

  } catch (e) {

   setNotice({
    type: "error",
    text: e.message
   });

  } finally {

   setLoading(false);

  }
 };


 useEffect(() => {
  load();
 }, []);


 useEffect(() => {

  if (notice) {

   const t = setTimeout(
       () => setNotice(null),
       3500
   );

   return () =>
       clearTimeout(t);
  }

 }, [notice]);


 const submit = async (e) => {

  e.preventDefault();

  try {

   await api(
       "/api/asset-requests",
       {
        method: "POST",

        body: JSON.stringify(form)
       }
   );

   setShowRequest(false);

   setForm({
    assetType: "LAPTOP",
    reason: "",
    priority: "NORMAL",
    requiredDate: "",
    comments: ""
   });

   setNotice({
    type: "success",
    text: "Asset request submitted to Admin."
   });

   await load();

  } catch (e) {

   setNotice({
    type: "error",
    text: e.message
   });

  }
 };


 const returnAsset = async (id) => {

  if (
      !confirm(
          "Return this asset to stock?"
      )
  ) {
   return;
  }

  try {

   await api(
       `/api/assets/${id}/return`,
{
    method: "PATCH"
}
);

setNotice({
    type: "success",
    text: "Asset returned successfully."
});

await load();

} catch (e) {

    setNotice({
        type: "error",
        text: e.message
    });

}
};


const pending =
    requests.filter(
        r => r.status === "PENDING"
    ).length;


return (
    <AppShell
        profile={profile}
        role="EMPLOYEE"
        page={page}
        setPage={setPage}
        onLogout={logout}
        notificationCount={
            notifications.filter(
                n => !n.read
            ).length
        }
    >

        <Notice
            notice={notice}
            onClose={() =>
                setNotice(null)
            }
        />


        {page === "dashboard" && (

            <>

                <Header
                    title="Employee Dashboard"
                    subtitle={`Welcome, ${profile.displayName}. Request and manage your assigned assets.`}
                    action={
                        <button
                            className="primary-btn"
                            onClick={() =>
                                setShowRequest(true)
                            }
                        >
                            <Plus size={17} />
                            Request Asset
                        </button>
                    }
                />


                <section className="stats-grid">

                    <Stat
                        title="My Assets"
                        value={assets.length}
                        icon={Package}
                    />

                    <Stat
                        title="Pending Requests"
                        value={pending}
                        icon={Clock3}
                    />

                    <Stat
                        title="Approved Requests"
                        value={
                            requests.filter(
                                r =>
                                    r.status ===
                                    "APPROVED"
                            ).length
                        }
                        icon={CheckCircle2}
                    />

                    <Stat
                        title="Notifications"
                        value={
                            notifications.filter(
                                n => !n.read
                            ).length
                        }
                        icon={Bell}
                    />

                </section>


                <Panel title="My Assigned Assets">

                    <AssetRows
                        assets={assets}
                        employeeView
                        onReturn={returnAsset}
                    />

                </Panel>


                <Panel title="Recent Requests">

                    <RequestTable
                        requests={
                            requests.slice(0, 6)
                        }
                    />

                </Panel>

            </>
        )}


        {page === "requests" && (

            <>

                <Header
                    title="My Requests"
                    subtitle="Track every asset request and its approval status."
                    action={
                        <button
                            className="primary-btn"
                            onClick={() =>
                                setShowRequest(true)
                            }
                        >
                            <Plus size={17} />
                            New Request
                        </button>
                    }
                />

                <Panel title="Request History">

                    <RequestTable
                        requests={requests}
                    />

                </Panel>

            </>
        )}


        {page === "assets" && (

            <>

                <Header
                    title="My Assets"
                    subtitle="Assets currently assigned to you."
                />

                <Panel title="Assigned Assets">

                    <AssetRows
                        assets={assets}
                        employeeView
                        onReturn={returnAsset}
                    />

                </Panel>

            </>
        )}


        {page === "notifications" && (

            <>

                <Header
                    title="Notifications"
                    subtitle="Updates about your requests and assets."
                />

                <Panel title="Notifications">

                    <NotificationList
                        items={notifications}
                        onRead={async id => {

                            await api(
                                `/api/notifications/${id}/read`,
                                {
                                    method: "PATCH"
                                }
                            );

                            load();

                        }}
                    />

                </Panel>

            </>
        )}


        {page === "settings" && (

            <>

                <Header
                    title="Settings"
                    subtitle="Your employee account information."
                />

                <Panel title="Profile">

                    <div className="settings-content">

                        <div className="setting-row">

                            <div>
                                <strong>
                                    Name
                                </strong>

                                <span>
                    {profile.displayName}
                  </span>
                            </div>

                        </div>


                        <div className="setting-row">

                            <div>
                                <strong>
                                    Username
                                </strong>

                                <span>
                    {profile.username}
                  </span>
                            </div>

                        </div>


                        <div className="setting-row">

                            <div>
                                <strong>
                                    Email
                                </strong>

                                <span>
                    {profile.email || "—"}
                  </span>
                            </div>

                        </div>


                        <div className="setting-row">

                            <div>
                                <strong>
                                    Department
                                </strong>

                                <span>
                    {profile.department || "—"}
                  </span>
                            </div>

                        </div>

                    </div>

                </Panel>

            </>
        )}


        {showRequest && (

            <RequestModal
                form={form}
                setForm={setForm}
                onClose={() =>
                    setShowRequest(false)
                }
                onSubmit={submit}
            />

        )}

    </AppShell>
);
}


/* =========================================================
   USER MANAGEMENT
========================================================= */

function UsersPage({ users, loading, onRefresh, onCreate }) {
    const [form, setForm] = useState(EMPTY_USER_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSaving(true);
        try {
            await onCreate(form);
            setForm(EMPTY_USER_FORM);
            setSuccess("User created successfully. They can now sign in and use their dashboard.");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Header
                title="Users"
                subtitle="Create employees and administrators who can sign in to the appropriate dashboard."
                action={<button className="secondary-btn" onClick={onRefresh}><RefreshCw size={15} /> Refresh</button>}
            />

            {error && <div className="notice error">{error}</div>}
            {success && <div className="notice success">{success}</div>}

            <div className="two-col">
                <Panel title="Create User">
                    <form className="form-grid" onSubmit={submit}>
                        <label><span>Display Name</span><input required value={form.displayName} onChange={e=>setForm({...form,displayName:e.target.value})} placeholder="Rahul Kumar" /></label>
                        <label><span>Username</span><input required value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="rahul" /></label>
                        <label><span>Password</span><input required type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Temporary password" /></label>
                        <label><span>Role</span><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="EMPLOYEE">EMPLOYEE</option><option value="ADMIN">ADMIN</option><option value="HR">HR</option><option value="MANAGER">MANAGER</option><option value="FINANCE">FINANCE</option><option value="VP">VP</option><option value="PROCUREMENT">PROCUREMENT</option></select></label>
                        <label><span>Email</span><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="rahul@enfec.com" /></label>
                        <label><span>Department</span><input value={form.department} onChange={e=>setForm({...form,department:e.target.value})} placeholder="Engineering" /></label>
                        <div className="form-actions"><button className="primary-btn" disabled={saving}>{saving ? "Creating..." : "Create User"}</button></div>
                    </form>
                </Panel>

                <Panel title={`${users.length} users`}>
                    {loading ? <div className="empty">Loading users...</div> : !users.length ? <div className="empty">No users found.</div> : (
                        <div className="table-wrap">
                            <table>
                                <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Email</th><th>Department</th><th>Status</th></tr></thead>
                                <tbody>{users.map(u=>(
                                    <tr key={u.username}>
                                        <td><b>{u.displayName}</b></td><td>{u.username}</td><td>{u.role}</td><td>{u.email || "—"}</td><td>{u.department || "—"}</td><td>{u.active ? "Active" : "Inactive"}</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    )}
                </Panel>
            </div>
        </>
    );
}

/* =========================================================
   ENTERPRISE WORKFLOW CENTER
========================================================= */

function WorkflowCenter({ profile }) {
    const [rows, setRows] = useState([]);
    const [assets, setAssets] = useState([]);
    const [notice, setNotice] = useState(null);
    const [form, setForm] = useState({
        employeeName: "",
        employeeId: "",
        department: "",
        assetType: "LAPTOP",
        reason: "",
        priority: "NORMAL",
        requiredDate: "",
        items: "Laptop, ID Card, Mouse, Keyboard",
        estimatedCostMinor: "",
        budgetMinor: "",
        vendorName: ""
    });

    const role = profile.role;
    const isAdmin = role === "ADMIN";
    const canSeeAll = ["ADMIN", "HR", "MANAGER", "FINANCE", "VP", "PROCUREMENT"].includes(role);

    const roleMeta = {
        HR: {
            title: "HR Onboarding Intake",
            subtitle: "Create new-joinee asset requests and track the requests raised by HR.",
            stepText: "HR Intake → Admin Review → VP Approval → Inventory Allocation → Handover"
        },
        VP: {
            title: "VP Approval Dashboard",
            subtitle: "Review onboarding requests delegated by System Admin and record the business decision.",
            stepText: "Review Request → Approve / Reject → Admin Inventory Allocation"
        },
        MANAGER: {
            title: "Manager Approval Dashboard",
            subtitle: "Review secondary hardware requests submitted by employees.",
            stepText: "Employee Request → Manager Decision → Admin Inventory Allocation"
        },
        FINANCE: {
            title: "Finance Budget Verification",
            subtitle: "Verify procurement budgets before requests move to higher-authority approval.",
            stepText: "Purchase Request → Budget Check → Return / Reject / Approve → VP"
        },
        PROCUREMENT: {
            title: "Procurement Queue",
            subtitle: "View procurement requests and their purchasing progress. System Admin executes the PO and receipt steps.",
            stepText: "Budget → VP Approval → PO → Vendor → GRN → Inspection → In Stock"
        },
        EMPLOYEE: {
            title: "Employee Hardware Requests",
            subtitle: "Request secondary hardware, track your requests and report issues for your assigned assets.",
            stepText: "Request → Manager Approval → Stock Check → Allocation / Procurement"
        },
        ADMIN: {
            title: "System Admin Workflow Control",
            subtitle: "Coordinate approvals, inventory allocation, procurement execution and maintenance.",
            stepText: "Review → Delegate / Execute → Reserve → Allocate → Close"
        }
    }[role] || {
        title: "Workflow Center",
        subtitle: "Asset workflow management.",
        stepText: "Request → Approval → Allocation → Close"
    };

    const load = async () => {
        try {
            const endpoint = canSeeAll ? "/api/workflow/requests" : "/api/workflow/requests/my";
            const data = await api(endpoint);
            setRows(data || []);
            if (isAdmin) {
                setAssets(await api("/api/assets"));
            } else {
                // Every non-admin role can view assets assigned to the logged-in user.
                // This includes EMPLOYEE, HR, MANAGER, FINANCE, VP and PROCUREMENT.
                setAssets(await api("/api/assets/my"));
            }
        } catch (e) {
            setNotice({ type: "error", text: e.message });
        }
    };

    useEffect(() => { load(); }, [role]);

    const create = async (e) => {
        e.preventDefault();
        const workflowType = role === "HR" ? "ONBOARDING" : role === "ADMIN" ? "PROCUREMENT" : "SECONDARY";
        try {
            const data = await api("/api/workflow/requests", {
                method: "POST",
                body: JSON.stringify({
                    workflowType,
                    employeeName: form.employeeName || profile.displayName,
                    employeeId: form.employeeId || null,
                    department: form.department || profile.department,
                    assetType: form.assetType,
                    reason: form.reason,
                    priority: form.priority,
                    requiredDate: form.requiredDate || null,
                    items: form.items.split(",").map(x => x.trim()).filter(Boolean),
                    estimatedCostMinor: form.estimatedCostMinor === "" ? null : Number(form.estimatedCostMinor),
                    currency: "INR",
                    budgetMinor: form.budgetMinor === "" ? null : Number(form.budgetMinor),
                    vendorName: form.vendorName || null
                })
            });
            const successText = workflowType === "ONBOARDING"
                ? (data?.accountUsername ? `New joinee submitted. Login: ${data.accountUsername} / employee123` : "New joinee onboarding request submitted.")
                : workflowType === "PROCUREMENT" ? "Purchase request submitted for budget verification." : "Secondary hardware request submitted.";
            setNotice({ type: "success", text: successText });
            setForm(prev => ({ ...prev, employeeName: "", employeeId: "", reason: "" }));
            await load();
        } catch (e) {
            setNotice({ type: "error", text: e.message });
        }
    };

    const action = async (path, options = {}) => {
        try {
            await api(path, options);
            setNotice({ type: "success", text: "Workflow updated successfully." });
            await load();
        } catch (e) {
            setNotice({ type: "error", text: e.message });
        }
    };

    const decide = (r, approved) => {
        const comments = prompt(approved ? "Approval comments (optional):" : "Rejection reason:", "");
        if (comments === null) return;
        action(`/api/workflow/requests/${r.id}/${approved ? "approve" : "reject"}`, {
            method: "PATCH",
            body: JSON.stringify({ comments })
        });
    };

    const reserve = async (r) => {
        let requestedTypes = String(r.assetType || "").toLowerCase().split(",").map(x => x.trim()).filter(Boolean);
        try {
            const items = JSON.parse(r.itemsJson || "[]");
            requestedTypes = Array.from(new Set([...requestedTypes, ...items.map(x => String(x || "").toLowerCase().trim())]));
        } catch {}
        const typeMatches = (assetType) => {
            const t = String(assetType || "").toLowerCase().trim();
            if (!requestedTypes.length) return true;
            return requestedTypes.some(req => t === req || t.includes(req) || req.includes(t));
        };
        const available = assets.filter(a => a.status === "IN_STOCK" && typeMatches(a.type));
        if (!available.length) {
            setNotice({ type: "error", text: "No matching assets are currently In Stock. Route the request to Procurement." });
            return;
        }
        const chosen = prompt(
            "Select assets for this request. Enter Asset ID(s), separated by commas:\n\n" + available.map(a => `${a.id} — ${a.assetTag} — ${a.type || ""} — ${a.model || ""}`).join("\n"),
            available[0].id
        );
        if (!chosen) return;
        const assetIds = chosen.split(",").map(x => x.trim()).filter(Boolean);
        action(`/api/workflow/requests/${r.id}/reserve`, { method: "PATCH", body: JSON.stringify({ assetIds }) });
    };

    const po = (r) => {
        const vendor = prompt("Vendor name:", r.vendorName || "Dell Technologies");
        if (!vendor) return;
        action(`/api/workflow/requests/${r.id}/purchase-order`, {
            method: "POST",
            body: JSON.stringify({ vendorName: vendor, amountMinor: r.estimatedCostMinor || 0, currency: "INR" })
        });
    };

    const grn = (r) => {
        const qty = Number(prompt("Received quantity:", "1") || "1");
        action(`/api/workflow/requests/${r.id}/goods-receipt`, {
            method: "POST",
            body: JSON.stringify({ receivedQuantity: qty, condition: "GOOD", notes: "Received from vendor" })
        });
    };

    const registerAsset = (r) => {
        const assetTag = prompt("Asset Tag:", "AST-" + Date.now().toString().slice(-6));
        if (!assetTag) return;
        const model = prompt("Model:", r.assetType || "Laptop");
        if (!model) return;
        const serial = prompt("Serial Number:", "SN-" + Date.now().toString().slice(-8));
        if (!serial) return;
        const make = prompt("Brand / Make:", "Dell");
        if (!make) return;
        action(`/api/workflow/requests/${r.id}/register-asset`, {
            method: "POST",
            body: JSON.stringify({
                assetTag,
                type: r.assetType || "LAPTOP",
                make,
                model,
                serialNumber: serial,
                purchaseDate: new Date().toISOString().slice(0, 10),
                warrantyExpiry: null,
                costMinor: r.estimatedCostMinor || 0,
                currency: "INR",
                condition: "GOOD",
                notes: "Received through procurement workflow"
            })
        });
    };

    const [maintenanceRows, setMaintenanceRows] = useState([]);
    const [maintenanceForm, setMaintenanceForm] = useState({ assetId: "", issueDescription: "" });

    const loadMaintenance = async () => {
        if (!isAdmin) return;
        try {
            setMaintenanceRows(await api("/api/workflow/maintenance"));
        } catch (e) {
            setNotice({ type: "error", text: e.message });
        }
    };

    useEffect(() => { loadMaintenance(); }, [isAdmin]);

    const reportIssue = async (e) => {
        e.preventDefault();
        try {
            await api("/api/workflow/maintenance", {
                method: "POST",
                body: JSON.stringify(maintenanceForm)
            });
            setNotice({ type: "success", text: "Asset issue reported to IT." });
            setMaintenanceForm({ assetId: "", issueDescription: "" });
            await loadMaintenance();
            await load();
        } catch (e) {
            setNotice({ type: "error", text: e.message });
        }
    };

    const diagnose = async (t) => {
        const d = prompt("Diagnosis:", "Hardware issue");
        if (d === null) return;
        const repairable = confirm("Is the asset repairable? Click OK for Repair, Cancel for Replace.");
        await action(`/api/workflow/maintenance/${t.id}/diagnose?diagnosis=${encodeURIComponent(d)}&repairable=${repairable}`, { method: "PATCH" });
        await loadMaintenance();
    };

    const resolveMaintenance = async (t) => {
        if (t.status === "REPLACEMENT") {
            const oldAsset = assets.find(x => x.id === t.assetId);
            const oldType = String(oldAsset?.type || "").toLowerCase();
            const available = assets.filter(a => a.status === "IN_STOCK" && String(a.type || "").toLowerCase() === oldType);
            if (!available.length) {
                setNotice({ type: "error", text: "No replacement asset is In Stock." });
                return;
            }
            const replacementId = prompt(
                "Replacement Asset ID:\n\n" + available.map(a => `${a.id} — ${a.assetTag} — ${a.model || ""}`).join("\n"),
                available[0].id
            );
            if (!replacementId) return;
            await action(`/api/workflow/maintenance/${t.id}/replace?replacementAssetId=${encodeURIComponent(replacementId)}`, { method: "PATCH" });
        } else {
            const resolution = prompt("Resolution:", "Repair completed and quality verified");
            if (resolution === null) return;
            await action(`/api/workflow/maintenance/${t.id}/resolve?resolution=${encodeURIComponent(resolution)}`, { method: "PATCH" });
        }
        await loadMaintenance();
    };

    const visibleRows = rows;
    const pendingRows = visibleRows.filter(r => ["PENDING", "UNDER_REVIEW", "APPROVAL_PENDING", "IN_PROGRESS"].includes(r.status));
    const completedRows = visibleRows.filter(r => ["COMPLETED", "CLOSED", "REJECTED"].includes(r.status));

    const renderRequestTable = (data, title) => (
        <Panel title={`${title} (${data.length})`}>
            {!data.length ? <div className="empty">No requests in this queue.</div> : <div className="table-wrap"><table><thead><tr><th>Request</th><th>Workflow</th><th>Employee</th><th>Stage</th><th>Status</th><th>Action</th></tr></thead><tbody>
                {data.map(r => <tr key={r.id}>
                    <td><strong>{r.requestNo}</strong><br/><small>{r.assetType || "—"}</small></td>
                    <td>{r.workflowType}</td>
                    <td><b>{r.employeeName}</b><br/><small>{r.employeeId || ""}{r.department ? ` · ${r.department}` : ""}</small></td>
                    <td>{r.stage}</td>
                    <td><StatusBadge status={r.status}/></td>
                    <td>
                        {role === "MANAGER" && r.stage === "MANAGER_APPROVAL" && <><button className="small-btn" onClick={() => decide(r, true)}>Approve</button><button className="small-btn danger" onClick={() => decide(r, false)}>Reject</button></>}
                        {role === "FINANCE" && r.stage === "FINANCE_BUDGET" && <><button className="small-btn" onClick={() => decide(r, true)}>Budget Approve</button><button className="small-btn" onClick={() => { const comments = prompt("Revision request:", "Please revise budget details"); if (comments !== null) action(`/api/workflow/requests/${r.id}/return`, { method: "PATCH", body: JSON.stringify({ comments }) }); }}>Return</button><button className="small-btn danger" onClick={() => decide(r, false)}>Reject</button></>}
                        {role === "VP" && r.stage === "VP_APPROVAL" && <><button className="small-btn" onClick={() => decide(r, true)}>Approve</button><button className="small-btn danger" onClick={() => decide(r, false)}>Reject</button></>}
                        {isAdmin && r.workflowType === "ONBOARDING" && r.stage === "ADMIN_REVIEW" && <button className="small-btn" onClick={() => action(`/api/workflow/requests/${r.id}/delegate`, { method: "PATCH" })}>Delegate to VP</button>}
                        {isAdmin && r.stage === "INVENTORY" && <button className="small-btn" onClick={() => reserve(r)}>Select & Reserve Assets</button>}
                        {isAdmin && r.stage === "RESERVED" && <button className="small-btn" onClick={() => action(`/api/workflow/requests/${r.id}/allocate`, { method: "PATCH" })}>Allocate & Complete</button>}
                        {isAdmin && r.workflowType === "PROCUREMENT" && r.stage === "INVENTORY" && <button className="small-btn" onClick={() => po(r)}>Create PO</button>}
                        {isAdmin && r.stage === "PURCHASE_ORDER" && <button className="small-btn" onClick={() => grn(r)}>Goods Received</button>}
                        {isAdmin && r.stage === "INSPECTION" && <button className="small-btn" onClick={() => action(`/api/workflow/requests/${r.id}/inspect`, { method: "PATCH" })}>Inspect & Ready</button>}
                        {isAdmin && r.stage === "ASSET_READY" && <button className="small-btn" onClick={() => registerAsset(r)}>Register & Tag Asset</button>}
                        {isAdmin && (r.status === "COMPLETED" || r.status === "REJECTED") && r.status !== "CLOSED" && <button className="small-btn" onClick={() => action(`/api/workflow/requests/${r.id}/close`, { method: "PATCH" })}>Close Request</button>}
                    </td>
                </tr>)}
            </tbody></table></div>}
        </Panel>
    );

    const createOnboardingForm = role === "HR" && <Panel title="Create New Joinee Asset Request">
        <form className="form-grid" onSubmit={create}>
            <label><span>Candidate / Employee Name</span><input required value={form.employeeName} onChange={e => setForm({...form, employeeName: e.target.value})} placeholder="Rahul Kumar" /></label>
            <label><span>Employee ID</span><input required value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} placeholder="EMP-1025" /></label>
            <label><span>Department</span><input required value={form.department} onChange={e => setForm({...form, department: e.target.value})} placeholder="Engineering" /></label>
            <label><span>Joining Date</span><input required type="date" value={form.requiredDate} onChange={e => setForm({...form, requiredDate: e.target.value})} /></label>
            <label><span>Priority</span><select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}><option>NORMAL</option><option>HIGH</option><option>URGENT</option></select></label>
            <label><span>Asset Type</span><input value={form.assetType} onChange={e => setForm({...form, assetType: e.target.value})} placeholder="LAPTOP" /></label>
            <label className="full"><span>Assets / Items</span><input required value={form.items} onChange={e => setForm({...form, items: e.target.value})} placeholder="Laptop, ID Card, Mouse, Keyboard" /></label>
            <label className="full"><span>Remarks / Business Reason</span><textarea required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="New developer onboarding" /></label>
            <button className="primary-btn" type="submit"><Plus size={16}/> Submit Onboarding Ticket</button>
        </form>
    </Panel>;

    const createSecondaryForm = role === "EMPLOYEE" && <Panel title="Request Secondary Hardware">
        <form className="form-grid" onSubmit={create}>
            <label><span>Asset Type</span><input required value={form.assetType} onChange={e => setForm({...form, assetType: e.target.value})} placeholder="MOUSE" /></label>
            <label><span>Required Date</span><input type="date" value={form.requiredDate} onChange={e => setForm({...form, requiredDate: e.target.value})} /></label>
            <label><span>Priority</span><select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}><option>NORMAL</option><option>HIGH</option><option>URGENT</option></select></label>
            <label className="full"><span>Requested Items</span><input value={form.items} onChange={e => setForm({...form, items: e.target.value})} placeholder="Mouse, Keyboard" /></label>
            <label className="full"><span>Business Reason</span><textarea required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Additional hardware required for work" /></label>
            <button className="primary-btn" type="submit"><Plus size={16}/> Submit Request</button>
        </form>
    </Panel>;

    const adminCreateForm = isAdmin && <Panel title="Create Procurement Request">
        <form className="form-grid" onSubmit={create}>
            <label><span>Department / Request Owner</span><input value={form.department} onChange={e => setForm({...form, department: e.target.value})} placeholder="Engineering" /></label>
            <label><span>Asset Type</span><input required value={form.assetType} onChange={e => setForm({...form, assetType: e.target.value})} placeholder="LAPTOP" /></label>
            <label><span>Required Date</span><input type="date" value={form.requiredDate} onChange={e => setForm({...form, requiredDate: e.target.value})} /></label>
            <label><span>Priority</span><select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}><option>NORMAL</option><option>HIGH</option><option>URGENT</option></select></label>
            <label><span>Estimated Cost (₹)</span><input type="number" value={form.estimatedCostMinor} onChange={e => setForm({...form, estimatedCostMinor: e.target.value})} /></label>
            <label><span>Budget (₹)</span><input type="number" value={form.budgetMinor} onChange={e => setForm({...form, budgetMinor: e.target.value})} /></label>
            <label className="full"><span>Items</span><input required value={form.items} onChange={e => setForm({...form, items: e.target.value})} placeholder="Laptop, Mouse, Keyboard" /></label>
            <label className="full"><span>Business Reason</span><textarea required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Stock requirement" /></label>
            <button className="primary-btn" type="submit"><Plus size={16}/> Create Purchase Request</button>
        </form>
    </Panel>;

    return <>
        <Header title={roleMeta.title} subtitle={roleMeta.subtitle} />
        <Notice notice={notice} onClose={() => setNotice(null)} />

        <Panel title="Workflow Stage">
            <div style={{display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
                {roleMeta.stepText.split(" → ").map((step, index) => <React.Fragment key={step}><span style={{padding:"8px 12px",border:"1px solid var(--border,#e5e7eb)",borderRadius:"999px",fontWeight:600,fontSize:"13px"}}>{index + 1}. {step}</span>{index < roleMeta.stepText.split(" → ").length - 1 && <span style={{opacity:.5}}>→</span>}</React.Fragment>)}
            </div>
        </Panel>

        {createOnboardingForm}
        {createSecondaryForm}
        {adminCreateForm}

        {role === "HR" && renderRequestTable(rows.filter(r => r.workflowType === "ONBOARDING"), "My Onboarding Requests")}
        {role === "VP" && renderRequestTable(rows.filter(r => r.stage === "VP_APPROVAL"), "Requests Awaiting VP Decision")}
        {role === "MANAGER" && renderRequestTable(rows.filter(r => r.stage === "MANAGER_APPROVAL"), "Requests Awaiting Manager Decision")}
        {role === "FINANCE" && renderRequestTable(rows.filter(r => r.stage === "FINANCE_BUDGET"), "Requests Awaiting Budget Verification")}
        {role === "PROCUREMENT" && renderRequestTable(rows.filter(r => r.workflowType === "PROCUREMENT"), "Procurement Requests")}
        {role === "EMPLOYEE" && renderRequestTable(pendingRows, "My Open Requests")}

        {isAdmin && renderRequestTable(rows.filter(r => !["COMPLETED", "CLOSED", "REJECTED"].includes(r.status)), "System Admin Active Workflow Queue")}
        {isAdmin && completedRows.length > 0 && renderRequestTable(completedRows, "Completed / Closed History")}

        {(role === "EMPLOYEE" || isAdmin) && <Panel title="Maintenance — Issue, Repair & Replacement">
            {role === "EMPLOYEE" && <form className="form-grid" onSubmit={reportIssue}>
                <label><span>Asset</span><select required value={maintenanceForm.assetId} onChange={e => setMaintenanceForm({...maintenanceForm, assetId:e.target.value})}><option value="">Select assigned asset</option>{assets.filter(a => a.assignedTo === profile.displayName).map(a => <option key={a.id} value={a.id}>{a.assetTag} — {a.model || a.type}</option>)}</select></label>
                <label className="full"><span>Issue Description</span><textarea required value={maintenanceForm.issueDescription} onChange={e => setMaintenanceForm({...maintenanceForm, issueDescription:e.target.value})} placeholder="Laptop screen not working" /></label>
                <button className="primary-btn" type="submit"><Wrench size={16}/> Report Asset Issue</button>
            </form>}
            {isAdmin && <div className="table-wrap"><table><thead><tr><th>Ticket</th><th>Asset</th><th>Issue</th><th>Status</th><th>Action</th></tr></thead><tbody>{maintenanceRows.map(t => <tr key={t.id}><td>{String(t.id).slice(0,8)}</td><td>{t.assetId}</td><td>{t.issueDescription}</td><td>{t.status}</td><td>{["REPORTED","REPAIR","REPLACEMENT"].includes(t.status) && <button className="small-btn" onClick={() => diagnose(t)}>Diagnose</button>}{["REPAIR","REPLACEMENT"].includes(t.status) && <button className="small-btn" onClick={() => resolveMaintenance(t)}>Complete</button>}</td></tr>)}</tbody></table></div>}
        </Panel>}
    </>;
}
function WorkflowRoleDashboard({ profile }) {
    const [page, setPage] = useState("workflow");
    const [assets, setAssets] = useState([]);
    const [loadingAssets, setLoadingAssets] = useState(false);
    const [assetNotice, setAssetNotice] = useState(null);

    const loadMyAssets = async () => {
        setLoadingAssets(true);
        try {
            const data = await api("/api/assets/my");
            setAssets(data || []);
        } catch (e) {
            setAssetNotice({ type: "error", text: e.message });
        } finally {
            setLoadingAssets(false);
        }
    };

    useEffect(() => {
        loadMyAssets();
    }, [profile.username]);

    return (
        <AppShell
            profile={profile}
            role={profile.role}
            page={page}
            setPage={setPage}
            onLogout={logout}
            notificationCount={0}
        >
            {page === "workflow" && (
                <WorkflowCenter profile={profile} />
            )}

            {page === "assets" && (
                <>
                    <Header
                        title="My Assets"
                        subtitle={`Assets currently assigned to ${profile.displayName}.`}
                        action={
                            <button
                                className="secondary-btn"
                                onClick={loadMyAssets}
                                disabled={loadingAssets}
                            >
                                {loadingAssets ? "Refreshing..." : "Refresh"}
                            </button>
                        }
                    />

                    <Notice
                        notice={assetNotice}
                        onClose={() => setAssetNotice(null)}
                    />

                    <section className="stats-grid">
                        <Stat
                            title="My Assets"
                            value={assets.length}
                            icon={Package}
                        />
                        <Stat
                            title="Assigned"
                            value={assets.filter(a => a.status === "ASSIGNED").length}
                            icon={CheckCircle2}
                        />
                        <Stat
                            title="In Repair"
                            value={assets.filter(a => a.status === "IN_REPAIR").length}
                            icon={Wrench}
                        />
                    </section>

                    <Panel title="Assigned Asset Details">
                        <AssetRows assets={assets} />
                    </Panel>
                </>
            )}
        </AppShell>
    );
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AssetInventorySummary({ analytics }) {
    const grouped = analytics?.byTypeAndMake || {};

    const sections = Object.entries(grouped)
        .map(([type, makes]) => {
            const normalizedMakes = new Map();

            Object.entries(makes || {}).forEach(
                ([make, count]) => {
                    const displayMake =
                        String(make || "Unknown").trim() ||
                        "Unknown";

                    const key =
                        displayMake.toLowerCase();

                    const existing =
                        normalizedMakes.get(key);

                    normalizedMakes.set(key, {
                        name: existing?.name || displayMake,
                        count:
                            (existing?.count || 0) +
                            Number(count || 0)
                    });
                }
            );

            return {
                type:
                    String(type || "Unknown").trim() ||
                    "Unknown",
                makes:
                    Array.from(
                        normalizedMakes.values()
                    ).sort(
                        (a, b) =>
                            b.count - a.count ||
                            a.name.localeCompare(b.name)
                    )
            };
        })
        .sort(
            (a, b) =>
                a.type.localeCompare(b.type)
        );

    if (!sections.length) {
        return (
            <div className="empty">
                No asset inventory data available.
            </div>
        );
    }

    return (
        <div className="overview-list">
            {sections.map(section => {
                const total = section.makes.reduce(
                    (sum, item) => sum + item.count,
                    0
                );

                return (
                    <div
                        className="overview-row"
                        key={section.type.toLowerCase()}
                        style={{
                            display: "block",
                            padding: "14px 0"
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "12px",
                                marginBottom: "10px"
                            }}
                        >
                            <strong>
                                {section.type}
                            </strong>

                            <span>
              {total}{" "}
                                {total === 1
                                    ? "asset"
                                    : "assets"}
             </span>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(180px, 1fr))",
                                gap: "8px"
                            }}
                        >
                            {section.makes.map(item => (
                                <div
                                    key={`${section.type}-${item.name}`}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: "10px",
                                        padding: "9px 12px",
                                        border: "1px solid var(--border, #e5e7eb)",
                                        borderRadius: "10px"
                                    }}
                                >
                  <span>
                   {item.name}
                  </span>

                                    <strong>
                                        {item.count}
                                    </strong>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}


/* =========================================================
   LOW STOCK SUMMARY
========================================================= */

function LowStockSummary({ analytics }) {
    const items = Array.isArray(analytics?.lowStock)
        ? analytics.lowStock
        : [];

    if (!items.length) {
        return (
            <div className="empty">
                No low-stock assets.
            </div>
        );
    }

    return (
        <div className="overview-list">
            {items.map(item => {
                const available =
                    Number(item.available || 0);

                return (
                    <div
                        className="overview-row"
                        key={String(item.type).toLowerCase()}
                    >
            <span>
             {item.type}
            </span>

                        <strong>
                            {available === 0
                                ? "Out of Stock"
                                : `${available} available — Low Stock`}
                        </strong>
                    </div>
                );
            })}
        </div>
    );
}


/* =========================================================
   CSV EXPORT
========================================================= */

function exportAssetsToCsv(rows) {
    const headers = [
        "Asset Tag",
        "Type",
        "Brand / Manufacturer",
        "Model",
        "Serial Number",
        "Status",
        "Assigned To",
        "Purchase Date",
        "Warranty Expiry",
        "Condition",
        "Cost",
        "Currency"
    ];

    const escapeCsv = (value) => {
        const text = value === null || value === undefined ? "" : String(value);
        return `"${text.replace(/"/g, '""')}"`;
    };

    const lines = [
        headers.map(escapeCsv).join(","),
        ...rows.map(a => [
            a.assetTag,
            a.type,
            a.make,
            a.model,
            a.serialNumber,
            STATUS_META[a.status]?.label || a.status,
            a.assignedTo,
            a.purchaseDate,
            a.warrantyExpiry,
            a.condition,
            a.costMinor,
            a.currency
        ].map(escapeCsv).join(","))
    ];

    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `asset-register-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard({
                            profile
                        }) {
    const [page, setPage] =
        useState("dashboard");

    const [assets, setAssets] =
        useState([]);

    const [requests, setRequests] =
        useState([]);

    const [notifications, setNotifications] =
        useState([]);

    const [audit, setAudit] =
        useState([]);

    const [analytics, setAnalytics] =
        useState({});

    const [notice, setNotice] =
        useState(null);

    const [search, setSearch] =
        useState("");

    const [filterType, setFilterType] =
        useState("ALL");

    const [filterStatus, setFilterStatus] =
        useState("ALL");

    const [filterMake, setFilterMake] =
        useState("ALL");

    const [filterPurchaseYear, setFilterPurchaseYear] =
        useState("ALL");

    const [showCreate, setShowCreate] =
        useState(false);

    const [form, setForm] =
        useState(EMPTY_FORM);

    const [selected, setSelected] =
        useState(null);

    const [history, setHistory] =
        useState([]);

    const [showHistory, setShowHistory] =
        useState(false);

    const [loading, setLoading] =
        useState(true);

    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);


    const employees = useMemo(() => {
        return users
            .filter(u => u.active && u.role !== "ADMIN")
            .map(u => u.displayName || u.username)
            .filter(Boolean);
    }, [users]);


    const load = async () => {

        setLoading(true);

        try {

            const [
                a,
                r,
                n,
                au,
                an,
                u
            ] = await Promise.all([
                api("/api/assets"),
                api("/api/asset-requests"),
                api("/api/notifications"),
                api("/api/audit"),
                api("/api/assets/analytics"),
                api("/api/users")
            ]);

            setAssets(a || []);
            setRequests(r || []);
            setNotifications(n || []);
            setAudit(au || []);
            setAnalytics(an || {});
            setUsers(u || []);

        } catch (e) {

            setNotice({
                type: "error",
                text: e.message
            });

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        load();
    }, []);


    useEffect(() => {

        if (notice) {

            const t = setTimeout(
                () => setNotice(null),
                3500
            );

            return () =>
                clearTimeout(t);
        }

    }, [notice]);


    const createUser = async (form) => {
        const created = await api("/api/users", { method: "POST", body: JSON.stringify(form) });
        setUsers(prev => [...prev, created].sort((a,b) => String(a.displayName).localeCompare(String(b.displayName))));
        return created;
    };

    const refreshUsers = async () => {
        setUsersLoading(true);
        try { setUsers(await api("/api/users")); } finally { setUsersLoading(false); }
    };

    const filterOptions = useMemo(() => {
        const normalizeLabel = (value) => {
            if (!value) return value;
            return String(value).trim().replace(/\s+/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        };
        const types = Array.from(new Set(assets.map(a => normalizeLabel(a.type)).filter(Boolean))).sort();
        const makes = Array.from(new Set(assets.map(a => normalizeLabel(a.make)).filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b)));
        const years = Array.from(new Set(assets.map(a => a.purchaseDate?.slice(0, 4)).filter(Boolean))).sort().reverse();
        return { types, makes, years };
    }, [assets]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();

        return assets.filter(a => {
            const matchesSearch = !q || [
                a.assetTag, a.type, a.make, a.model, a.serialNumber,
                a.status, a.assignedTo, a.purchaseDate
            ].filter(Boolean).some(v => String(v).toLowerCase().includes(q));

            const matchesType = filterType === "ALL" || String(a.type || "").trim().toLowerCase() === String(filterType).trim().toLowerCase();
            const matchesStatus = filterStatus === "ALL" || a.status === filterStatus;
            const matchesMake = filterMake === "ALL" || String(a.make || "").trim().toLowerCase() === String(filterMake).trim().toLowerCase();
            const matchesYear = filterPurchaseYear === "ALL" || a.purchaseDate?.startsWith(filterPurchaseYear);

            return matchesSearch && matchesType && matchesStatus && matchesMake && matchesYear;
        });
    }, [assets, search, filterType, filterStatus, filterMake, filterPurchaseYear]);


    const create = async (e) => {

        e.preventDefault();

        try {

            await api(
                "/api/assets",
                {
                    method: "POST",

                    body: JSON.stringify({
                        ...form,
                        purchaseDate: form.purchaseDate || null,
                        warrantyExpiry: form.warrantyExpiry || null,
                        costMinor:
                            form.costMinor !== "" && form.costMinor !== null
                                ? Number(form.costMinor)
                                : null
                    })
                }
            );

            setShowCreate(false);
            setForm(EMPTY_FORM);

            setNotice({
                type: "success",
                text: "Asset created successfully."
            });

            await load();

        } catch (e) {

            setNotice({
                type: "error",
                text: e.message
            });

        }
    };


    const requestAction = async (
        id,
        action
    ) => {

        try {

            if (action === "approve") {

                await api(
                    `/api/asset-requests/${id}/approve`,
                    {
                        method: "PATCH"
                    }
                );

            } else {

                const reason = prompt(
                    "Reason for rejection:",
                    "Not approved at this time"
                );

                if (reason === null) {
                    return;
                }

                await api(
                    `/api/asset-requests/${id}/reject`,
                    {
                        method: "PATCH",

                        body: JSON.stringify({
                            reason
                        })
                    }
                );
            }


            setNotice({
                type: "success",
                text:
                    `Request ${action}d successfully.`
            });

            await load();

        } catch (e) {

            setNotice({
                type: "error",
                text: e.message
            });

        }
    };


    /*
     * Assign asset using the existing employee
     * list instead of allowing arbitrary names.
     */
    const status = async (
        asset,
        next
    ) => {

        let assignedTo =
            asset.assignedTo || "";


        if (next === "ASSIGNED") {

            if (!employees.length) {

                setNotice({
                    type: "error",
                    text:
                        "No employees are available in the Admin employee data."
                });

                return;
            }


            const employee =
                await selectEmployee(
                    employees,
                    assignedTo
                );


            if (employee === null) {
                return;
            }


            assignedTo = employee;
        }


        try {

            await api(
                `/api/assets/${asset.id}/status`,
                {
                    method: "PATCH",

                    body: JSON.stringify({
                        status: next,

                        assignedTo:
                            next === "ASSIGNED"
                                ? assignedTo
                                : null
                    })
                }
            );


            setNotice({
                type: "success",
                text:
                    `${asset.assetTag} updated.`
            });

            await load();

        } catch (e) {

            setNotice({
                type: "error",
                text: e.message
            });

        }
    };


    const repair = async (
        asset
    ) => {

        const notes = prompt(
            "Repair notes:",
            asset.repairNotes || ""
        );

        if (notes === null) {
            return;
        }


        try {

            await api(
                `/api/assets/${asset.id}/repair`,
                {
                    method: "PATCH",

                    body: JSON.stringify({
                        notes
                    })
                }
            );


            setNotice({
                type: "success",
                text:
                    "Repair details saved."
            });

            await load();

        } catch (e) {

            setNotice({
                type: "error",
                text: e.message
            });

        }
    };


    /*
     * Transfer asset using the same existing
     * employee list.
     */
    const transfer = async (
        asset
    ) => {

        if (!employees.length) {

            setNotice({
                type: "error",
                text:
                    "No employees are available in the Admin employee data."
            });

            return;
        }


        const employee =
            await selectEmployee(
                employees,
                asset.assignedTo || ""
            );


        if (employee === null) {
            return;
        }


        try {

            await api(
                `/api/assets/${asset.id}/transfer`,
                {
                    method: "PATCH",

                    body: JSON.stringify({
                        employee
                    })
                }
            );


            setNotice({
                type: "success",
                text:
                    "Asset transferred successfully."
            });

            await load();

        } catch (e) {

            setNotice({
                type: "error",
                text: e.message
            });

        }
    };


    const openHistory = async (
        asset
    ) => {

        setSelected(asset);
        setShowHistory(true);

        try {

            setHistory(
                await api(
                    `/api/assets/${asset.id}/status-history`
                )
            );

        } catch (e) {

            setHistory([]);

            setNotice({
                type: "error",
                text: e.message
            });

        }
    };


    const deleteAsset = async (asset) => {
        const assignedText = asset.assignedTo
            ? ` It is currently assigned to ${asset.assignedTo}.`
            : "";

        const confirmed = window.confirm(
            `Delete asset ${asset.assetTag}?${assignedText}\n\nThis cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        try {
            await api(
                `/api/assets/${asset.id}`,
                { method: "DELETE" }
            );

            setNotice({
                type: "success",
                text: `${asset.assetTag} deleted successfully.`
            });

            await load();
        } catch (e) {
            setNotice({
                type: "error",
                text: e.message
            });
        }
    };


    const pending =
        requests.filter(
            r => r.status === "PENDING"
        );


    return (
        <AppShell
            profile={profile}
            role="ADMIN"
            page={page}
            setPage={setPage}
            onLogout={logout}
            notificationCount={
                notifications.filter(
                    n => !n.read
                ).length
            }
        >

            <Notice
                notice={notice}
                onClose={() =>
                    setNotice(null)
                }
            />


            {page === "dashboard" && (

                <>

                    <Header
                        title="Admin Dashboard"
                        subtitle="Control asset inventory, employee requests and lifecycle status."
                        action={
                            <button
                                className="primary-btn"
                                onClick={() =>
                                    setShowCreate(true)
                                }
                            >
                                <Plus size={17} />
                                Add Asset
                            </button>
                        }
                    />


                    <section className="stats-grid">

                        <Stat
                            title="Total Assets"
                            value={
                                analytics.TOTAL ??
                                assets.length
                            }
                            icon={Package}
                        />

                        <Stat
                            title="In Stock"
                            value={
                                analytics.IN_STOCK ??
                                0
                            }
                            icon={Package}
                        />

                        <Stat
                            title="Assigned"
                            value={
                                analytics.ASSIGNED ??
                                0
                            }
                            icon={Users}
                        />

                        <Stat
                            title="In Repair"
                            value={
                                analytics.IN_REPAIR ??
                                0
                            }
                            icon={Wrench}
                        />

                        <Stat
                            title="Pending Requests"
                            value={pending.length}
                            icon={Clock3}
                        />

                    </section>


                    <div className="two-col">

                        <Panel title="Pending Employee Requests">

                            <RequestTable
                                requests={
                                    pending.slice(0, 5)
                                }
                                admin
                                onAction={requestAction}
                            />

                        </Panel>


                        <Panel title="Lifecycle Overview">

                            <div className="overview-list">

                                {Object.entries(
                                    STATUS_META
                                ).map(
                                    ([s, m]) => (

                                        <div
                                            className="overview-row"
                                            key={s}
                                        >

                                            <StatusBadge
                                                status={s}
                                            />

                                            <strong>
                                                {analytics[s] ?? 0}
                                            </strong>

                                        </div>

                                    )
                                )}

                            </div>

                        </Panel>

                    </div>

                    <div className="two-col">
                        <Panel title="Asset Quantity by Type">
                            <div className="overview-list">
                                {Object.entries(analytics.byType || {}).map(([type, count]) => (
                                    <div className="overview-row" key={type}>
                                        <span>{type}</span>
                                        <strong>{count}</strong>
                                    </div>
                                ))}
                                {!Object.keys(analytics.byType || {}).length && <div className="empty">No asset inventory yet.</div>}
                            </div>
                        </Panel>

                        <Panel title="Purchase & Warranty Summary">
                            <div className="overview-list">
                                <div className="overview-row"><span>Purchased this month</span><strong>{analytics.purchasedThisMonth ?? 0}</strong></div>
                                <div className="overview-row"><span>Purchased this year</span><strong>{analytics.purchasedThisYear ?? 0}</strong></div>
                                <div className="overview-row"><span>Warranty active</span><strong>{analytics.warrantyActive ?? 0}</strong></div>
                                <div className="overview-row"><span>Expiring within 30 days</span><strong>{analytics.warrantyExpiringSoon ?? 0}</strong></div>
                                <div className="overview-row"><span>Warranty expired</span><strong>{analytics.warrantyExpired ?? 0}</strong></div>
                            </div>
                        </Panel>
                    </div>

                    <Panel title="Asset Inventory — Type & Brand">
                        <AssetInventorySummary
                            analytics={analytics}
                        />
                    </Panel>

                    <Panel title="Low Stock">
                        <LowStockSummary
                            analytics={analytics}
                        />
                    </Panel>

                </>
            )}


            {page === "users" && (
                <UsersPage
                    users={users}
                    loading={usersLoading}
                    onRefresh={refreshUsers}
                    onCreate={createUser}
                />
            )}

            {page === "inventory" && (

                <>
                    <Header
                        title="Inventory & Analytics"
                        subtitle="View asset quantities, manufacturers, purchases, warranty status and stock alerts."
                        action={
                            <button className="secondary-btn" onClick={load}>
                                <RefreshCw size={15} /> Refresh
                            </button>
                        }
                    />

                    <section className="stats-grid">
                        <Stat title="Total Assets" value={analytics.TOTAL ?? 0} icon={Package} />
                        <Stat title="Available" value={analytics.IN_STOCK ?? 0} icon={Package} />
                        <Stat title="Assigned" value={analytics.ASSIGNED ?? 0} icon={Users} />
                        <Stat title="In Repair" value={analytics.IN_REPAIR ?? 0} icon={Wrench} />
                        <Stat title="Retired" value={analytics.RETIRED ?? 0} icon={Archive} />
                    </section>

                    <div className="two-col">
                        <Panel title="Quantity by Asset Type">
                            <QuantityTable rows={Object.entries(analytics.byType || {}).map(([name, quantity]) => ({name, quantity}))} />
                        </Panel>
                        <Panel title="Quantity by Brand / Manufacturer">
                            <QuantityTable rows={Object.entries(analytics.byMake || {}).map(([name, quantity]) => ({name, quantity}))} />
                        </Panel>
                    </div>

                    <Panel title="Quantity by Asset Type + Brand">
                        <TypeBrandTable data={analytics.byTypeAndMake || {}} />
                    </Panel>

                    <div className="two-col">
                        <Panel title="Purchase Analytics">
                            <div className="overview-list">
                                <div className="overview-row"><span>Purchased this month</span><strong>{analytics.purchasedThisMonth ?? 0}</strong></div>
                                <div className="overview-row"><span>Purchased this year</span><strong>{analytics.purchasedThisYear ?? 0}</strong></div>
                                <div className="overview-row"><span>Assets with purchase date</span><strong>{assets.filter(a => a.purchaseDate).length}</strong></div>
                                <div className="overview-row"><span>Warranty tracked</span><strong>{analytics.WARRANTY_TRACKED ?? 0}</strong></div>
                            </div>
                        </Panel>
                        <Panel title="Warranty Overview">
                            <div className="overview-list">
                                <div className="overview-row"><span>Active</span><strong>{analytics.warrantyActive ?? 0}</strong></div>
                                <div className="overview-row"><span>Expiring within 30 days</span><strong>{analytics.warrantyExpiringSoon ?? 0}</strong></div>
                                <div className="overview-row"><span>Expired</span><strong>{analytics.warrantyExpired ?? 0}</strong></div>
                            </div>
                        </Panel>
                    </div>

                    <Panel title="Low Stock Alerts">
                        {(analytics.lowStock || []).length ? (
                            <div className="overview-list">
                                {analytics.lowStock.map(item => (
                                    <div className="overview-row low-stock-row" key={item.type}>
                                        <span><AlertTriangle size={14} /> {item.type}</span>
                                        <strong>{item.available === 0 ? "Out of stock" : `${item.available} available — Low stock`}</strong>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty">No low-stock asset types.</div>
                        )}
                    </Panel>
                </>
            )}


            {page === "workflow" && (
                <WorkflowCenter profile={profile} />
            )}

            {page === "requests" && (

                <>

                    <Header
                        title="Employee Requests"
                        subtitle="Approve or reject requests and assign available assets."
                    />

                    <Panel title="All Requests">

                        <RequestTable
                            requests={requests}
                            admin
                            onAction={requestAction}
                        />

                    </Panel>

                </>
            )}


            {page === "assets" && (

                <>

                    <Header
                        title="Asset Register"
                        subtitle="Manage inventory, lifecycle status, assignments and repairs."
                        action={
                            <button
                                className="primary-btn"
                                onClick={() =>
                                    setShowCreate(true)
                                }
                            >
                                <Plus size={17} />
                                Add Asset
                            </button>
                        }
                    />


                    <Panel
                        title={`${filtered.length} assets`}
                    >

                        <div className="toolbar asset-filters">
                            <div className="search">
                                <Search size={16} />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tag, serial, model, brand, employee..." />
                            </div>
                            <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                                <option value="ALL">All Types</option>
                                {filterOptions.types.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                            <select value={filterMake} onChange={e => setFilterMake(e.target.value)}>
                                <option value="ALL">All Brands</option>
                                {filterOptions.makes.map(make => <option key={make} value={make}>{make}</option>)}
                            </select>
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                <option value="ALL">All Statuses</option>
                                {Object.entries(STATUS_META).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}
                            </select>
                            <select value={filterPurchaseYear} onChange={e => setFilterPurchaseYear(e.target.value)}>
                                <option value="ALL">All Purchase Years</option>
                                {filterOptions.years.map(year => <option key={year} value={year}>{year}</option>)}
                            </select>
                            <button className="icon-btn" onClick={load} title="Refresh">
                                <RefreshCw size={16} />
                            </button>
                            <button
                                className="secondary-btn"
                                onClick={() => exportAssetsToCsv(filtered)}
                                title="Export the currently filtered assets as CSV"
                                disabled={!filtered.length}
                            >
                                <Download size={16} />
                                Export CSV
                            </button>
                        </div>


                        <AssetRows
                            assets={filtered}
                            adminView
                            onStatus={status}
                            onHistory={openHistory}
                            onRepair={repair}
                            onTransfer={transfer}
                            onDelete={deleteAsset}
                        />

                    </Panel>

                </>
            )}


            {page === "audit" && (

                <>

                    <Header
                        title="Audit Log"
                        subtitle="Recent administrative actions and asset lifecycle changes."
                    />

                    <Panel title="Recent Activity">

                        <AuditTable
                            rows={audit}
                        />

                    </Panel>

                </>
            )}


            {page === "warranty" && (

                <>

                    <Header
                        title="Warranty Tracking"
                        subtitle="Assets with warranty information recorded."
                    />

                    <Panel title="Warranty Register">

                        <WarrantyTable
                            assets={assets.filter(
                                a => a.warrantyExpiry
                            )}
                        />

                    </Panel>

                </>
            )}


            {page === "notifications" && (

                <>

                    <Header
                        title="Notifications"
                        subtitle="System notifications for administrators."
                    />

                    <Panel title="Notifications">

                        <NotificationList
                            items={notifications}
                        />

                    </Panel>

                </>
            )}


            {page === "settings" && (

                <>

                    <Header
                        title="Settings"
                        subtitle="Application and demo account information."
                    />

                    <Panel title="Environment">

                        <div className="settings-content">

                            <div className="setting-row">

                                <div>
                                    <strong>
                                        Backend API
                                    </strong>

                                    <span>
                    Spring Boot asset lifecycle service
                  </span>
                                </div>

                                <code>
                                    http://localhost:8085
                                </code>

                            </div>


                            <div className="setting-row">

                                <div>
                                    <strong>
                                        Frontend
                                    </strong>

                                    <span>
                    React + Vite
                  </span>
                                </div>

                                <code>
                                    http://localhost:3012
                                </code>

                            </div>


                            <div className="setting-row">

                                <div>
                                    <strong>
                                        Database
                                    </strong>

                                    <span>
                    PostgreSQL + Flyway
                  </span>
                                </div>

                                <code>
                                    asset @ localhost:5433
                                </code>

                            </div>


                            <div className="setting-row">

                                <div>
                                    <strong>
                                        Supported lifecycle statuses
                                    </strong>

                                    <span>
                    In Stock, Assigned, In Repair, Retired
                  </span>
                                </div>

                                <StatusBadge
                                    status="IN_STOCK"
                                />

                            </div>

                        </div>

                    </Panel>

                </>
            )}


            {showCreate && (

                <AssetModal
                    form={form}
                    setForm={setForm}
                    onClose={() =>
                        setShowCreate(false)
                    }
                    onSubmit={create}
                />

            )}


            {showHistory && (

                <HistoryModal
                    asset={selected}
                    history={history}
                    onClose={() =>
                        setShowHistory(false)
                    }
                />

            )}

        </AppShell>
    );
}


/* =========================================================
   EMPLOYEE SELECTOR
========================================================= */

function selectEmployee(
    employees,
    currentValue = ""
) {
    return new Promise(
        resolve => {

            const employeeList =
                employees
                    .map(
                        (employee, index) =>
                            `${index + 1}. ${employee}`
                    )
                    .join("\n");


            const currentIndex =
                employees.findIndex(
                    employee =>
                        employee.toLowerCase() ===
                        currentValue.toLowerCase()
                );


            const defaultValue =
                currentIndex >= 0
                    ? String(currentIndex + 1)
                    : "1";


            const choice = prompt(
                `Select an existing asset holder:\n\n${employeeList}\n\nEnter employee number:`,
                defaultValue
            );


            if (choice === null) {
                resolve(null);
                return;
            }


            const index =
                Number(choice) - 1;


            if (
                !Number.isInteger(index) ||
                index < 0 ||
                index >= employees.length
            ) {

                alert(
                    "Invalid employee selection."
                );

                resolve(null);
                return;
            }


            resolve(
                employees[index]
            );

        }
    );
}


/* =========================================================
   APP SHELL
========================================================= */

function AppShell({
                      profile,
                      role,
                      page,
                      setPage,
                      onLogout,
                      notificationCount,
                      children
                  }) {

    const admin = role === "ADMIN";
    const specialized = !admin && role !== "EMPLOYEE";

    const items = specialized
        ? [
            ["workflow", "Workflow Center", ClipboardList],
            ["assets", "My Assets", Package]
          ]
        : admin
        ? [
            [
                "dashboard",
                "Dashboard",
                LayoutDashboard
            ],
            [
                "requests",
                "Employee Requests",
                ClipboardCheck
            ],
            [
                "workflow",
                "Workflow Center",
                ClipboardList
            ],
            [
                "assets",
                "Asset Register",
                Package
            ],
            [
                "users",
                "Users",
                Users
            ],
            [
                "inventory",
                "Inventory & Analytics",
                BarChart3
            ],
            [
                "audit",
                "Audit Log",
                ShieldCheck
            ],
            [
                "warranty",
                "Warranty",
                Clock3
            ],
            [
                "notifications",
                "Notifications",
                Bell
            ],
            [
                "settings",
                "Settings",
                Settings
            ]
        ]
        : [
            [
                "dashboard",
                "Dashboard",
                LayoutDashboard
            ],
            [
                "requests",
                "My Requests",
                ClipboardCheck
            ],
            [
                "assets",
                "My Assets",
                Package
            ],
            [
                "notifications",
                "Notifications",
                Bell
            ],
            [
                "settings",
                "Settings",
                Settings
            ]
        ];


    return (
        <div className="app-shell">

            <aside className="sidebar">

                <div className="brand">

                    <div className="brand-mark">
                        <Laptop size={21} />
                    </div>

                    <div>

                        <strong>
                            ENFEC ONE
                        </strong>

                        <span>
              Asset Management
            </span>

                    </div>

                </div>


                <div className="user-card">

                    <div className="avatar">
                        <User size={16} />
                    </div>

                    <div>

                        <b>
                            {profile.displayName}
                        </b>

                        <span>
              {profile.role}
            </span>

                    </div>

                </div>


                <nav>

                    {items.map(
                        ([key, label, Icon]) => (

                            <button
                                key={key}
                                className={`nav-item ${
                                    page === key
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    setPage(key)
                                }
                            >

                                <Icon size={17} />

                                {label}

                                {key ===
                                    "notifications" &&
                                    notificationCount > 0 && (
                                        <em>
                                            {notificationCount}
                                        </em>
                                    )}

                            </button>

                        )
                    )}

                </nav>


                <button
                    className="logout-btn"
                    onClick={onLogout}
                >
                    <LogOut size={17} />
                    Sign out
                </button>


                <div className="sidebar-footer">

                    <span className="online-dot" />

                    Asset service

                    <b>
                        online
                    </b>

                </div>

            </aside>


            <main className="main">
                {children}
            </main>

        </div>
    );
}


/* =========================================================
   HEADER
========================================================= */

function Header({
                    title,
                    subtitle,
                    action
                }) {

    return (
        <header className="topbar">

            <div>

                <div className="eyebrow">
                    M18-F02
                </div>

                <h1>
                    {title}
                </h1>

                <p>
                    {subtitle}
                </p>

            </div>

            {action}

        </header>
    );
}


/* =========================================================
   PANEL
========================================================= */

function Panel({
                   title,
                   children
               }) {

    return (
        <section className="panel">

            <div className="panel-head">

                <div>

                    <h2>
                        {title}
                    </h2>

                </div>

            </div>

            {children}

        </section>
    );
}


/* =========================================================
   ASSET TABLE
========================================================= */

function AssetRows({
                       assets,
                       adminView,
                       employeeView,
                       onStatus,
                       onHistory,
                       onReturn,
                       onRepair,
                       onTransfer,
                       onDelete
                   }) {

    if (!assets.length) {

        return (
            <div className="empty">
                No assets found.
            </div>
        );
    }


    return (
        <div className="table-wrap">

            <table>

                <thead>

                <tr>

                    <th>
                        Asset
                    </th>

                    <th>
                        Type
                    </th>

                    <th>
                        Model
                    </th>

                    <th>
                        Purchase Date
                    </th>

                    <th>
                        Status
                    </th>

                    <th>
                        Assigned To
                    </th>

                    <th>
                        Warranty
                    </th>

                    <th>
                        Actions
                    </th>

                </tr>

                </thead>


                <tbody>

                {assets.map(a => (

                    <tr key={a.id}>

                        <td>

                            <b>
                                {a.assetTag}
                            </b>

                            <small>
                                {a.make} {a.model}
                                <br />
                                {a.serialNumber}
                            </small>

                        </td>


                        <td>
                            {a.type}
                        </td>

                        <td>
                            {a.model || "—"}
                            <small>{a.make || "—"}</small>
                        </td>

                        <td>
                            {a.purchaseDate || "—"}
                        </td>

                        <td>

                            <StatusBadge
                                status={a.status}
                            />

                        </td>


                        <td>
                            {a.assignedTo || "—"}
                        </td>


                        <td>
                            {a.warrantyExpiry || "—"}
                        </td>


                        <td>

                            <div className="actions">

                                {adminView && (

                                    <>

                                        <select
                                            value={a.status}
                                            onChange={e =>
                                                onStatus(
                                                    a,
                                                    e.target.value
                                                )
                                            }
                                        >

                                            <option value="IN_STOCK">
                                                In Stock
                                            </option>

                                            <option value="ASSIGNED">
                                                Assigned
                                            </option>

                                            <option value="IN_REPAIR">
                                                In Repair
                                            </option>

                                            <option value="RETIRED">
                                                Retired
                                            </option>

                                        </select>


                                        {a.status ===
                                            "IN_REPAIR" && (

                                                <button
                                                    className="small-btn"
                                                    onClick={() =>
                                                        onRepair(a)
                                                    }
                                                >
                                                    Repair
                                                </button>

                                            )}


                                        {a.status ===
                                            "ASSIGNED" && (

                                                <button
                                                    className="small-btn"
                                                    onClick={() =>
                                                        onTransfer(a)
                                                    }
                                                >
                                                    Transfer
                                                </button>

                                            )}


                                        <button
                                            className="small-btn"
                                            onClick={() =>
                                                onHistory(a)
                                            }
                                        >
                                            History
                                        </button>

                                        <button
                                            className="small-btn danger-btn"
                                            onClick={() =>
                                                onDelete(a)
                                            }
                                            title="Delete asset"
                                        >
                                            <Trash2 size={13} />
                                            Delete
                                        </button>

                                    </>

                                )}


                                {employeeView &&
                                    a.status ===
                                    "ASSIGNED" && (

                                        <button
                                            className="small-btn"
                                            onClick={() =>
                                                onReturn(a.id)
                                            }
                                        >
                                            Return
                                        </button>

                                    )}

                            </div>

                        </td>

                    </tr>

                ))}

                </tbody>

            </table>

        </div>
    );
}


/* =========================================================
   REQUEST TABLE
========================================================= */

function RequestTable({
                          requests,
                          admin,
                          onAction
                      }) {

    if (!requests.length) {

        return (
            <div className="empty">
                No requests found.
            </div>
        );
    }


    return (
        <div className="table-wrap">

            <table>

                <thead>

                <tr>

                    <th>
                        Employee
                    </th>

                    <th>
                        Asset Type
                    </th>

                    <th>
                        Reason
                    </th>

                    <th>
                        Priority
                    </th>

                    <th>
                        Status
                    </th>

                    <th>
                        Date
                    </th>

                    {admin && (
                        <th>
                            Action
                        </th>
                    )}

                </tr>

                </thead>


                <tbody>

                {requests.map(r => (

                    <tr key={r.id}>

                        <td>

                            <b>
                                {r.employeeName}
                            </b>

                            <small>
                                {r.department}
                            </small>

                        </td>


                        <td>
                            {r.assetType}
                        </td>


                        <td className="reason">
                            {r.reason}
                        </td>


                        <td>

                <span
                    className={`priority ${r.priority?.toLowerCase()}`}
                >
                  {r.priority}
                </span>

                        </td>


                        <td>

                <span
                    className={`request-status ${r.status.toLowerCase()}`}
                >
                  {r.status}
                </span>


                            {r.assignedAssetTag && (

                                <small>
                                    Asset:{" "}
                                    {r.assignedAssetTag}
                                </small>

                            )}


                            {r.rejectionReason && (

                                <small>
                                    {r.rejectionReason}
                                </small>

                            )}

                        </td>


                        <td>
                            {r.createdAt?.slice(0, 10)}
                        </td>


                        {admin && (

                            <td>

                                {r.status ===
                                "PENDING" ? (

                                    <div className="actions">

                                        <button
                                            className="approve"
                                            onClick={() =>
                                                onAction(
                                                    r.id,
                                                    "approve"
                                                )
                                            }
                                        >
                                            Approve
                                        </button>


                                        <button
                                            className="reject"
                                            onClick={() =>
                                                onAction(
                                                    r.id,
                                                    "reject"
                                                )
                                            }
                                        >
                                            Reject
                                        </button>

                                    </div>

                                ) : (
                                    "—"
                                )}

                            </td>

                        )}

                    </tr>

                ))}

                </tbody>

            </table>

        </div>
    );
}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function NotificationList({
                              items,
                              onRead
                          }) {

    if (!items.length) {

        return (
            <div className="empty">
                No notifications.
            </div>
        );
    }


    return (
        <div className="notification-list">

            {items.map(n => (

                <div
                    className={`notification ${
                        n.read ? "read" : ""
                    }`}
                    key={n.id}
                >

                    <Bell size={17} />

                    <div>

                        <b>
                            {n.title}
                        </b>

                        <p>
                            {n.message}
                        </p>

                        <small>
                            {n.createdAt
                                ?.replace("T", " ")
                                .slice(0, 16)}
                        </small>

                    </div>


                    {!n.read &&
                        onRead && (

                            <button
                                className="small-btn"
                                onClick={() =>
                                    onRead(n.id)
                                }
                            >
                                Mark read
                            </button>

                        )}

                </div>

            ))}

        </div>
    );
}


/* =========================================================
   AUDIT TABLE
========================================================= */

function AuditTable({
                        rows
                    }) {

    if (!rows.length) {

        return (
            <div className="empty">
                No audit records yet.
            </div>
        );
    }


    return (
        <div className="table-wrap">

            <table>

                <thead>

                <tr>

                    <th>
                        Time
                    </th>

                    <th>
                        Actor
                    </th>

                    <th>
                        Action
                    </th>

                    <th>
                        Entity
                    </th>

                    <th>
                        Details
                    </th>

                </tr>

                </thead>


                <tbody>

                {rows.map(r => (

                    <tr key={r.id}>

                        <td>
                            {r.createdAt
                                ?.replace("T", " ")
                                .slice(0, 16)}
                        </td>

                        <td>
                            {r.actor}
                        </td>

                        <td>
                            <b>
                                {r.action}
                            </b>
                        </td>

                        <td>
                            {r.entityType} /{" "}
                            {r.entityId?.slice(0, 8)}
                        </td>

                        <td>
                            {r.details}
                        </td>

                    </tr>

                ))}

                </tbody>

            </table>

        </div>
    );
}


/* =========================================================
   INVENTORY TABLES
========================================================= */

function QuantityTable({ rows }) {
    if (!rows.length) return <div className="empty">No inventory data.</div>;
    return (
        <div className="table-wrap">
            <table>
                <thead><tr><th>Asset / Brand</th><th>Quantity</th></tr></thead>
                <tbody>{rows.map(row => <tr key={row.name}><td><b>{row.name}</b></td><td><strong>{row.quantity}</strong></td></tr>)}</tbody>
            </table>
        </div>
    );
}

function TypeBrandTable({ data }) {
    const rows = Object.entries(data).flatMap(([type, brands]) =>
        Object.entries(brands).map(([make, quantity]) => ({ type, make, quantity }))
    );
    if (!rows.length) return <div className="empty">No asset inventory data.</div>;
    return (
        <div className="table-wrap">
            <table>
                <thead><tr><th>Asset Type</th><th>Brand / Manufacturer</th><th>Quantity</th></tr></thead>
                <tbody>{rows.map(row => <tr key={`${row.type}-${row.make}`}><td>{row.type}</td><td>{row.make}</td><td><strong>{row.quantity}</strong></td></tr>)}</tbody>
            </table>
        </div>
    );
}


/* =========================================================
   WARRANTY TABLE
========================================================= */

function WarrantyTable({
                           assets
                       }) {

    if (!assets.length) {

        return (
            <div className="empty">
                No warranty records.
            </div>
        );
    }


    return (
        <div className="table-wrap">

            <table>

                <thead>

                <tr>

                    <th>
                        Asset / Brand
                    </th>

                    <th>
                        Purchase Date
                    </th>

                    <th>
                        Status
                    </th>

                    <th>
                        Warranty Expiry
                    </th>

                    <th>
                        Condition
                    </th>

                    <th>
                        Assigned To
                    </th>

                </tr>

                </thead>


                <tbody>

                {assets.map(a => (

                    <tr key={a.id}>

                        <td>

                            <b>
                                {a.assetTag}
                            </b>

                            <small>
                                {a.make} {a.model}
                            </small>

                        </td>

                        <td>
                            {a.purchaseDate || "—"}
                        </td>

                        <td>

                            <StatusBadge
                                status={a.status}
                            />

                        </td>


                        <td>
                            {a.warrantyExpiry}
                        </td>


                        <td>
                            {a.condition || "—"}
                        </td>


                        <td>
                            {a.assignedTo || "—"}
                        </td>

                    </tr>

                ))}

                </tbody>

            </table>

        </div>
    );
}


/* =========================================================
   ASSET MODAL
========================================================= */

function AssetModal({
                        form,
                        setForm,
                        onClose,
                        onSubmit
                    }) {

    return (
        <div className="modal-backdrop">

            <form
                className="modal large"
                onSubmit={onSubmit}
            >

                <div className="modal-head">

                    <div>

                        <h2>
                            Add Asset
                        </h2>

                        <p>
                            Create a new asset in In Stock status.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="icon-btn"
                        onClick={onClose}
                    >
                        <XCircle />
                    </button>

                </div>


                <div className="form-grid">

                    {[
                        ["assetTag", "Asset Tag"],
                        ["make", "Brand / Manufacturer"],
                        ["model", "Model"],
                        ["serialNumber", "Serial Number"],
                        ["purchaseDate", "Purchase Date"],
                        ["warrantyExpiry", "Warranty Expiry"],
                        ["costMinor", "Cost"],
                        ["condition", "Condition"]
                    ].map(
                        ([k, l]) => (

                            <label key={k}>

                <span>
                  {l}
                </span>

                                <input
                                    required={[
                                        "assetTag",
                                        "make",
                                        "model",
                                        "serialNumber"
                                    ].includes(k)}
                                    type={
                                        ["purchaseDate", "warrantyExpiry"].includes(k)
                                            ? "date"
                                            : k === "costMinor"
                                                ? "number"
                                                : "text"
                                    }
                                    value={form[k]}
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            [k]:
                                            e.target.value
                                        })
                                    }
                                />

                            </label>

                        )
                    )}


                    <label>

            <span>
              Asset Type
            </span>

                        <select
                            value={form.type}
                            onChange={e =>
                                setForm({
                                    ...form,
                                    type: e.target.value
                                })
                            }
                        >

                            <option>
                                LAPTOP
                            </option>

                            <option>
                                MONITOR
                            </option>

                            <option>
                                MOUSE
                            </option>

                            <option>
                                KEYBOARD
                            </option>

                            <option>
                                HEADSET
                            </option>

                            <option>
                                MOBILE
                            </option>

                            <option>
                                OTHER
                            </option>

                        </select>

                    </label>


                    <label>

            <span>
              Currency
            </span>

                        <input
                            value={form.currency}
                            onChange={e =>
                                setForm({
                                    ...form,
                                    currency:
                                    e.target.value
                                })
                            }
                        />

                    </label>


                    <label className="full">

            <span>
              Notes
            </span>

                        <textarea
                            value={form.notes}
                            onChange={e =>
                                setForm({
                                    ...form,
                                    notes:
                                    e.target.value
                                })
                            }
                        />

                    </label>

                </div>


                <div className="modal-actions">

                    <button
                        type="button"
                        className="secondary-btn"
                        onClick={onClose}
                    >
                        Cancel
                    </button>


                    <button className="primary-btn">
                        Create Asset
                    </button>

                </div>

            </form>

        </div>
    );
}


/* =========================================================
   REQUEST MODAL
========================================================= */

function RequestModal({
                          form,
                          setForm,
                          onClose,
                          onSubmit
                      }) {

    return (
        <div className="modal-backdrop">

            <form
                className="modal"
                onSubmit={onSubmit}
            >

                <div className="modal-head">

                    <div>

                        <h2>
                            Request an Asset
                        </h2>

                        <p>
                            Your request will be sent to Admin for approval.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="icon-btn"
                        onClick={onClose}
                    >
                        <XCircle />
                    </button>

                </div>


                <div className="form-grid">

                    <label>

            <span>
              Asset Type
            </span>

                        <select
                            value={form.assetType}
                            onChange={e =>
                                setForm({
                                    ...form,
                                    assetType:
                                    e.target.value
                                })
                            }
                        >

                            <option>
                                LAPTOP
                            </option>

                            <option>
                                MONITOR
                            </option>

                            <option>
                                MOUSE
                            </option>

                            <option>
                                KEYBOARD
                            </option>

                            <option>
                                HEADSET
                            </option>

                            <option>
                                MOBILE
                            </option>

                            <option>
                                OTHER
                            </option>

                        </select>

                    </label>


                    <label>

            <span>
              Priority
            </span>

                        <select
                            value={form.priority}
                            onChange={e =>
                                setForm({
                                    ...form,
                                    priority:
                                    e.target.value
                                })
                            }
                        >

                            <option>
                                LOW
                            </option>

                            <option>
                                NORMAL
                            </option>

                            <option>
                                HIGH
                            </option>

                            <option>
                                URGENT
                            </option>

                        </select>

                    </label>


                    <label>

            <span>
              Required Date
            </span>

                        <input
                            type="date"
                            value={form.requiredDate}
                            onChange={e =>
                                setForm({
                                    ...form,
                                    requiredDate:
                                    e.target.value
                                })
                            }
                        />

                    </label>


                    <label className="full">

            <span>
              Reason
            </span>

                        <textarea
                            required
                            value={form.reason}
                            onChange={e =>
                                setForm({
                                    ...form,
                                    reason:
                                    e.target.value
                                })
                            }
                            placeholder="Why do you need this asset?"
                        />

                    </label>


                    <label className="full">

            <span>
              Comments
            </span>

                        <textarea
                            value={form.comments}
                            onChange={e =>
                                setForm({
                                    ...form,
                                    comments:
                                    e.target.value
                                })
                            }
                        />

                    </label>

                </div>


                <div className="modal-actions">

                    <button
                        type="button"
                        className="secondary-btn"
                        onClick={onClose}
                    >
                        Cancel
                    </button>


                    <button className="primary-btn">
                        Submit Request
                    </button>

                </div>

            </form>

        </div>
    );
}


/* =========================================================
   HISTORY MODAL
========================================================= */

function HistoryModal({
                          asset,
                          history,
                          onClose
                      }) {

    return (
        <div className="modal-backdrop">

            <div className="modal">

                <div className="modal-head">

                    <div>

                        <h2>
                            {asset.assetTag} History
                        </h2>

                        <p>
                            {asset.make} {asset.model}
                        </p>

                    </div>


                    <button
                        className="icon-btn"
                        onClick={onClose}
                    >
                        <XCircle />
                    </button>

                </div>


                <div className="timeline">

                    {history.map(
                        (h, i) => (

                            <div
                                className="timeline-row"
                                key={h.id || i}
                            >

                                <div className="timeline-dot" />

                                <div>

                                    <StatusBadge
                                        status={h.toStatus}
                                    />

                                    <p>
                                        {h.fromStatus ||
                                            "Created"}{" "}
                                        →{" "}
                                        {h.toStatus}
                                    </p>

                                    <small>
                                        By {h.actor} ·{" "}
                                        {h.changedAt
                                            ?.replace(
                                                "T",
                                                " "
                                            )
                                            .slice(0, 16)}
                                    </small>

                                </div>

                            </div>

                        )
                    )}

                </div>

            </div>

        </div>
    );
}


/* =========================================================
   APP
========================================================= */

function App() {

    const [profile, setProfile] =
        useState(() => {

            try {

                return JSON.parse(
                    localStorage.getItem(
                        "assetLifecycleProfile"
                    )
                );

            } catch {

                return null;

            }

        });


    if (!profile) {

        return (
            <LoginPage
                onLogin={setProfile}
            />
        );
    }


    const standardEmployee = profile.role === "EMPLOYEE";
    const adminLike = profile.role === "ADMIN";

    if (adminLike) return <AdminDashboard profile={profile} />;
    if (standardEmployee) return <EmployeeDashboard profile={profile} />;
    return <WorkflowRoleDashboard profile={profile} />;
}


/* =========================================================
   START APPLICATION
========================================================= */

createRoot(
    document.getElementById("root")
).render(
    <App />
);

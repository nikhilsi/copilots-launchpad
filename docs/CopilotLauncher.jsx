import { useState, useEffect, useRef } from "react";

const MOCK_DESTINATIONS = [
  { id: "dest-01", label: "Copilot Chat", url: "https://m365.cloud.microsoft/chat" },
  { id: "dest-02", label: "Copilot Enterprise", url: "https://copilot.cloud.microsoft" },
  { id: "dest-03", label: "M365 Admin Center", url: "https://admin.microsoft.com" },
];

const MOCK_ACCOUNTS = [
  { id: "acc-01", label: "Global Admin", username: "globaladmin@contoso.onmicrosoft.com", password: "P@ssw0rd123", group: "Admins", color: "#6366F1", destinationId: "dest-01", notes: "Full M365 Copilot license", status: "idle" },
  { id: "acc-02", label: "SharePoint Admin", username: "spadmin@contoso.onmicrosoft.com", password: "P@ssw0rd123", group: "Admins", color: "#6366F1", destinationId: "dest-03", notes: "SharePoint admin only", status: "idle" },
  { id: "acc-03", label: "Exchange Admin", username: "exadmin@contoso.onmicrosoft.com", password: "P@ssw0rd123", group: "Admins", color: "#6366F1", destinationId: "dest-03", notes: "", status: "idle" },
  { id: "acc-04", label: "Licensed User A", username: "usera@contoso.onmicrosoft.com", password: "P@ssw0rd123", group: "Licensed Users", color: "#0EA5E9", destinationId: "dest-01", notes: "E5 + Copilot", status: "idle" },
  { id: "acc-05", label: "Licensed User B", username: "userb@contoso.onmicrosoft.com", password: "P@ssw0rd123", group: "Licensed Users", color: "#0EA5E9", destinationId: "dest-01", notes: "E3 + Copilot", status: "idle" },
  { id: "acc-06", label: "Licensed User C", username: "userc@contoso.onmicrosoft.com", password: "P@ssw0rd123", group: "Licensed Users", color: "#0EA5E9", destinationId: "dest-02", notes: "E5 + Copilot Enterprise", status: "idle" },
  { id: "acc-07", label: "Basic User 1", username: "basic1@contoso.onmicrosoft.com", password: "P@ssw0rd123", group: "Basic Users", color: "#10B981", destinationId: "dest-01", notes: "No Copilot license", status: "idle" },
  { id: "acc-08", label: "Basic User 2", username: "basic2@contoso.onmicrosoft.com", password: "P@ssw0rd123", group: "Basic Users", color: "#10B981", destinationId: "dest-01", notes: "", status: "idle" },
  { id: "acc-09", label: "Guest User", username: "guest@partner.com", password: "P@ssw0rd123", group: "Guests", color: "#F59E0B", destinationId: "dest-01", notes: "External guest account", status: "idle" },
  { id: "acc-10", label: "EDU Student", username: "student@contosoedu.onmicrosoft.com", password: "P@ssw0rd123", group: "Education", color: "#EC4899", destinationId: "dest-01", notes: "A3 for students", status: "idle" },
  { id: "acc-11", label: "EDU Faculty", username: "faculty@contosoedu.onmicrosoft.com", password: "P@ssw0rd123", group: "Education", color: "#EC4899", destinationId: "dest-01", notes: "A5 for faculty", status: "idle" },
];

// Icons as inline SVGs
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const GearIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="M12 5v14"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>
  </svg>
);
const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);
const RocketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
);
const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const ChevronIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

const fonts = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500&display=swap');
`;

export default function CopilotLauncher() {
  const [view, setView] = useState("launcher"); // launcher | settings
  const [settingsTab, setSettingsTab] = useState("accounts"); // accounts | destinations
  const [accounts, setAccounts] = useState(MOCK_ACCOUNTS);
  const [destinations, setDestinations] = useState(MOCK_DESTINATIONS);
  const [search, setSearch] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [editingAccount, setEditingAccount] = useState(null);
  const [editingDest, setEditingDest] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [launchingId, setLaunchingId] = useState(null);

  const toggleGroup = (g) => setCollapsedGroups(prev => ({ ...prev, [g]: !prev[g] }));

  const filteredAccounts = accounts.filter(a => {
    if (!search) return true;
    const s = search.toLowerCase();
    const dest = destinations.find(d => d.id === a.destinationId);
    return a.label.toLowerCase().includes(s) ||
      a.username.toLowerCase().includes(s) ||
      a.group.toLowerCase().includes(s) ||
      (dest && dest.label.toLowerCase().includes(s));
  });

  const groups = {};
  filteredAccounts.forEach(a => {
    if (!groups[a.group]) groups[a.group] = [];
    groups[a.group].push(a);
  });

  const simulateLaunch = (id) => {
    setLaunchingId(id);
    setTimeout(() => {
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, status: "open" } : a));
      setLaunchingId(null);
    }, 2000);
  };

  const getDestLabel = (destId) => {
    const d = destinations.find(x => x.id === destId);
    return d ? d.label : "Unknown";
  };

  const saveAccount = (acc) => {
    if (accounts.find(a => a.id === acc.id)) {
      setAccounts(prev => prev.map(a => a.id === acc.id ? acc : a));
    } else {
      setAccounts(prev => [...prev, acc]);
    }
    setEditingAccount(null);
  };

  const deleteAccount = (id) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const saveDest = (dest) => {
    if (destinations.find(d => d.id === dest.id)) {
      setDestinations(prev => prev.map(d => d.id === dest.id ? dest : d));
    } else {
      setDestinations(prev => [...prev, dest]);
    }
    setEditingDest(null);
  };

  const deleteDest = (id) => {
    const used = accounts.some(a => a.destinationId === id);
    if (used) {
      alert("Cannot delete — this destination is assigned to one or more accounts.");
      return;
    }
    setDestinations(prev => prev.filter(d => d.id !== id));
  };

  const styles = {
    app: {
      fontFamily: "'DM Sans', sans-serif",
      background: "#0C0F1A",
      color: "#E2E8F0",
      minHeight: "100vh",
      maxWidth: 960,
      margin: "0 auto",
      padding: "0 24px 48px",
    },
    topBar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "20px 0",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      marginBottom: 28,
      position: "sticky",
      top: 0,
      background: "#0C0F1A",
      zIndex: 100,
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: "-0.02em",
      color: "#F8FAFC",
    },
    searchWrap: {
      position: "relative",
      flex: "0 1 340px",
    },
    searchInput: {
      width: "100%",
      padding: "9px 12px 9px 36px",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10,
      color: "#E2E8F0",
      fontSize: 13,
      fontFamily: "'DM Sans', sans-serif",
      outline: "none",
      transition: "border-color 0.2s, background 0.2s",
    },
    searchIcon: {
      position: "absolute",
      left: 11,
      top: "50%",
      transform: "translateY(-50%)",
      color: "#64748B",
    },
    gearBtn: {
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10,
      padding: "8px 10px",
      color: "#94A3B8",
      cursor: "pointer",
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
    },
    groupHeader: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 0 8px",
      cursor: "pointer",
      userSelect: "none",
    },
    groupLabel: {
      fontSize: 12,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: "#64748B",
    },
    groupCount: {
      fontSize: 11,
      color: "#475569",
      fontFamily: "'JetBrains Mono', monospace",
    },
    cardGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
      gap: 12,
      marginBottom: 8,
    },
    card: (color, isLaunching, status) => ({
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${isLaunching ? color : "rgba(255,255,255,0.06)"}`,
      borderRadius: 12,
      padding: "16px 16px 14px",
      cursor: "pointer",
      transition: "all 0.25s ease",
      position: "relative",
      overflow: "hidden",
      borderLeft: `3px solid ${color}`,
      animation: isLaunching ? "pulse 1.5s infinite" : "none",
    }),
    cardLabel: {
      fontSize: 15,
      fontWeight: 600,
      color: "#F1F5F9",
      marginBottom: 4,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    cardUser: {
      fontSize: 12,
      color: "#64748B",
      fontFamily: "'JetBrains Mono', monospace",
      marginBottom: 10,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    cardFooter: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    destPill: (color) => ({
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontSize: 10,
      fontWeight: 500,
      color: color,
      background: `${color}15`,
      padding: "3px 8px",
      borderRadius: 6,
      letterSpacing: "0.02em",
    }),
    statusDot: (status) => ({
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: status === "open" ? "#10B981" : status === "launching" ? "#F59E0B" : "#334155",
      boxShadow: status === "open" ? "0 0 8px rgba(16,185,129,0.5)" : "none",
      transition: "all 0.3s",
    }),
    settingsPanel: {
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 16,
      padding: 24,
    },
    tabBar: {
      display: "flex",
      gap: 4,
      marginBottom: 24,
      background: "rgba(255,255,255,0.03)",
      borderRadius: 10,
      padding: 4,
    },
    tab: (active) => ({
      padding: "8px 20px",
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.2s",
      background: active ? "rgba(255,255,255,0.08)" : "transparent",
      color: active ? "#F1F5F9" : "#64748B",
      border: "none",
      fontFamily: "'DM Sans', sans-serif",
    }),
    tableRow: {
      display: "grid",
      gridTemplateColumns: "1fr 1.5fr 1fr 0.7fr auto",
      alignItems: "center",
      padding: "12px 16px",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      fontSize: 13,
      gap: 12,
    },
    tableHeader: {
      display: "grid",
      gridTemplateColumns: "1fr 1.5fr 1fr 0.7fr auto",
      padding: "8px 16px",
      fontSize: 11,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: "#475569",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      gap: 12,
    },
    destRow: {
      display: "grid",
      gridTemplateColumns: "1fr 2fr auto",
      alignItems: "center",
      padding: "12px 16px",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      fontSize: 13,
      gap: 12,
    },
    destHeader: {
      display: "grid",
      gridTemplateColumns: "1fr 2fr auto",
      padding: "8px 16px",
      fontSize: 11,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: "#475569",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      gap: 12,
    },
    addBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "8px 16px",
      background: "rgba(99,102,241,0.15)",
      color: "#818CF8",
      border: "1px solid rgba(99,102,241,0.3)",
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 500,
      cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif",
      transition: "all 0.2s",
    },
    iconBtn: {
      background: "none",
      border: "none",
      color: "#64748B",
      cursor: "pointer",
      padding: 6,
      borderRadius: 6,
      display: "inline-flex",
      alignItems: "center",
      transition: "all 0.15s",
    },
    modal: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modalContent: {
      background: "#151929",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: 28,
      width: "100%",
      maxWidth: 480,
    },
    input: {
      width: "100%",
      padding: "10px 12px",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8,
      color: "#E2E8F0",
      fontSize: 13,
      fontFamily: "'DM Sans', sans-serif",
      outline: "none",
      boxSizing: "border-box",
    },
    select: {
      width: "100%",
      padding: "10px 12px",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8,
      color: "#E2E8F0",
      fontSize: 13,
      fontFamily: "'DM Sans', sans-serif",
      outline: "none",
      boxSizing: "border-box",
    },
    formLabel: {
      fontSize: 11,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      color: "#64748B",
      marginBottom: 6,
      display: "block",
    },
    formGroup: {
      marginBottom: 16,
    },
    primaryBtn: {
      padding: "10px 24px",
      background: "#6366F1",
      color: "white",
      border: "none",
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif",
    },
    cancelBtn: {
      padding: "10px 24px",
      background: "transparent",
      color: "#94A3B8",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 500,
      cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif",
    },
    backBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: "none",
      border: "none",
      color: "#94A3B8",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 500,
      fontFamily: "'DM Sans', sans-serif",
      padding: 0,
      marginBottom: 20,
    },
  };

  // Account edit modal
  const AccountModal = ({ account, onSave, onClose }) => {
    const [form, setForm] = useState(account || {
      id: `acc-${Date.now()}`,
      label: "", username: "", password: "",
      group: "", color: "#6366F1",
      destinationId: destinations[0]?.id || "",
      notes: "", status: "idle",
    });
    const [showPw, setShowPw] = useState(false);
    const colors = ["#6366F1", "#0EA5E9", "#10B981", "#F59E0B", "#EC4899", "#EF4444", "#8B5CF6", "#14B8A6"];

    return (
      <div style={styles.modal} onClick={onClose}>
        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: "#F1F5F9" }}>
            {account ? "Edit Account" : "Add Account"}
          </h3>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Friendly Label</label>
            <input style={styles.input} value={form.label} placeholder="e.g. Global Admin"
              onChange={e => setForm({ ...form, label: e.target.value })} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Username / Email</label>
            <input style={styles.input} value={form.username} placeholder="user@contoso.onmicrosoft.com"
              onChange={e => setForm({ ...form, username: e.target.value })} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Password</label>
            <div style={{ position: "relative" }}>
              <input style={{ ...styles.input, paddingRight: 36 }}
                type={showPw ? "text" : "password"} value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
              <button style={{ ...styles.iconBtn, position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)" }}
                onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Group</label>
              <input style={styles.input} value={form.group} placeholder="e.g. Admins"
                onChange={e => setForm({ ...form, group: e.target.value })} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Destination</label>
              <select style={styles.select} value={form.destinationId}
                onChange={e => setForm({ ...form, destinationId: e.target.value })}>
                {destinations.map(d => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Color</label>
            <div style={{ display: "flex", gap: 8 }}>
              {colors.map(c => (
                <button key={c} onClick={() => setForm({ ...form, color: c })}
                  style={{
                    width: 28, height: 28, borderRadius: 8, background: c, border: "none", cursor: "pointer",
                    outline: form.color === c ? "2px solid white" : "2px solid transparent",
                    outlineOffset: 2, transition: "outline 0.15s",
                  }} />
              ))}
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Notes (optional)</label>
            <input style={styles.input} value={form.notes} placeholder="Any extra context..."
              onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button style={styles.primaryBtn} onClick={() => onSave(form)}>
              {account ? "Save Changes" : "Add Account"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Destination edit modal
  const DestModal = ({ dest, onSave, onClose }) => {
    const [form, setForm] = useState(dest || {
      id: `dest-${Date.now()}`, label: "", url: "",
    });
    return (
      <div style={styles.modal} onClick={onClose}>
        <div style={{ ...styles.modalContent, maxWidth: 420 }} onClick={e => e.stopPropagation()}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: "#F1F5F9" }}>
            {dest ? "Edit Destination" : "Add Destination"}
          </h3>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Label</label>
            <input style={styles.input} value={form.label} placeholder="e.g. Copilot Chat"
              onChange={e => setForm({ ...form, label: e.target.value })} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>URL</label>
            <input style={styles.input} value={form.url} placeholder="https://m365.cloud.microsoft/chat"
              onChange={e => setForm({ ...form, url: e.target.value })} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button style={styles.primaryBtn} onClick={() => onSave(form)}>
              {dest ? "Save Changes" : "Add Destination"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{fonts}{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        input::placeholder, select { color: #475569; }
        select option { background: #1E293B; color: #E2E8F0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>

      <div style={styles.app}>
        {/* Top Bar */}
        <div style={styles.topBar}>
          {view === "launcher" ? (
            <>
              <div style={styles.logo}>
                <RocketIcon /> Copilot Launcher
              </div>
              <div style={styles.searchWrap}>
                <span style={styles.searchIcon}><SearchIcon /></span>
                <input style={styles.searchInput} placeholder="Search accounts, groups, destinations..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  onFocus={e => { e.target.style.borderColor = "rgba(99,102,241,0.5)"; e.target.style.background = "rgba(255,255,255,0.07)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
                />
              </div>
              <button style={styles.gearBtn} onClick={() => setView("settings")}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#E2E8F0"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#94A3B8"; }}>
                <GearIcon />
              </button>
            </>
          ) : (
            <>
              <button style={styles.backBtn} onClick={() => setView("launcher")}>
                <BackIcon /> Back to Launcher
              </button>
              <div style={{ ...styles.logo, fontSize: 15 }}>Settings</div>
              <div style={{ width: 40 }} />
            </>
          )}
        </div>

        {/* Launcher View */}
        {view === "launcher" && (
          <div>
            {Object.keys(groups).length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
                <p style={{ fontSize: 15, marginBottom: 8 }}>No accounts match your search.</p>
                <p style={{ fontSize: 13 }}>Try a different term or add accounts in Settings.</p>
              </div>
            )}
            {Object.entries(groups).map(([groupName, groupAccounts]) => (
              <div key={groupName} style={{ marginBottom: 16 }}>
                <div style={styles.groupHeader} onClick={() => toggleGroup(groupName)}>
                  <ChevronIcon open={!collapsedGroups[groupName]} />
                  <span style={{ ...styles.groupLabel, color: groupAccounts[0].color }}>{groupName}</span>
                  <span style={styles.groupCount}>{groupAccounts.length}</span>
                </div>
                {!collapsedGroups[groupName] && (
                  <div style={styles.cardGrid}>
                    {groupAccounts.map((acc, i) => (
                      <div key={acc.id}
                        style={{
                          ...styles.card(acc.color, launchingId === acc.id, acc.status),
                          animationDelay: `${i * 40}ms`,
                        }}
                        onClick={() => simulateLaunch(acc.id)}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                          e.currentTarget.style.borderColor = `${acc.color}60`;
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = `0 4px 20px ${acc.color}15`;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                          e.currentTarget.style.borderColor = launchingId === acc.id ? acc.color : "rgba(255,255,255,0.06)";
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}>
                        <div style={styles.cardLabel}>
                          {acc.label}
                          <div style={styles.statusDot(launchingId === acc.id ? "launching" : acc.status)} />
                        </div>
                        <div style={styles.cardUser}>{acc.username}</div>
                        <div style={styles.cardFooter}>
                          <span style={styles.destPill(acc.color)}>
                            <LinkIcon /> {getDestLabel(acc.destinationId)}
                          </span>
                          {acc.notes && (
                            <span style={{ fontSize: 11, color: "#475569", fontStyle: "italic" }}>{acc.notes}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Settings View */}
        {view === "settings" && (
          <div style={styles.settingsPanel}>
            <div style={styles.tabBar}>
              <button style={styles.tab(settingsTab === "accounts")} onClick={() => setSettingsTab("accounts")}>
                Accounts
              </button>
              <button style={styles.tab(settingsTab === "destinations")} onClick={() => setSettingsTab("destinations")}>
                Destinations
              </button>
            </div>

            {settingsTab === "accounts" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ fontSize: 13, color: "#64748B" }}>{accounts.length} accounts configured</span>
                  <button style={styles.addBtn} onClick={() => setEditingAccount({})}>
                    <PlusIcon /> Add Account
                  </button>
                </div>
                <div style={styles.tableHeader}>
                  <span>Label</span><span>Username</span><span>Destination</span><span>Group</span><span></span>
                </div>
                {accounts.map(acc => (
                  <div key={acc.id} style={styles.tableRow}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <span style={{ fontWeight: 500, color: "#E2E8F0" }}>{acc.label}</span>
                    <span style={{ color: "#94A3B8", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {acc.username}
                    </span>
                    <span style={styles.destPill(acc.color)}>{getDestLabel(acc.destinationId)}</span>
                    <span style={{ color: "#64748B", fontSize: 12 }}>{acc.group}</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button style={styles.iconBtn} onClick={() => setEditingAccount(acc)}
                        onMouseEnter={e => e.currentTarget.style.color = "#818CF8"}
                        onMouseLeave={e => e.currentTarget.style.color = "#64748B"}>
                        <EditIcon />
                      </button>
                      <button style={styles.iconBtn} onClick={() => deleteAccount(acc.id)}
                        onMouseEnter={e => e.currentTarget.style.color = "#EF4444"}
                        onMouseLeave={e => e.currentTarget.style.color = "#64748B"}>
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {settingsTab === "destinations" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ fontSize: 13, color: "#64748B" }}>{destinations.length} destinations configured</span>
                  <button style={styles.addBtn} onClick={() => setEditingDest({})}>
                    <PlusIcon /> Add Destination
                  </button>
                </div>
                <div style={styles.destHeader}>
                  <span>Label</span><span>URL</span><span></span>
                </div>
                {destinations.map(d => (
                  <div key={d.id} style={styles.destRow}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <span style={{ fontWeight: 500, color: "#E2E8F0" }}>{d.label}</span>
                    <span style={{ color: "#94A3B8", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{d.url}</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button style={styles.iconBtn} onClick={() => setEditingDest(d)}
                        onMouseEnter={e => e.currentTarget.style.color = "#818CF8"}
                        onMouseLeave={e => e.currentTarget.style.color = "#64748B"}>
                        <EditIcon />
                      </button>
                      <button style={styles.iconBtn} onClick={() => deleteDest(d.id)}
                        onMouseEnter={e => e.currentTarget.style.color = "#EF4444"}
                        onMouseLeave={e => e.currentTarget.style.color = "#64748B"}>
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {editingAccount !== null && (
        <AccountModal
          account={editingAccount.id ? editingAccount : null}
          onSave={saveAccount}
          onClose={() => setEditingAccount(null)}
        />
      )}
      {editingDest !== null && (
        <DestModal
          dest={editingDest.id ? editingDest : null}
          onSave={saveDest}
          onClose={() => setEditingDest(null)}
        />
      )}
    </>
  );
}

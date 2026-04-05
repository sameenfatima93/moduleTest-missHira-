import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#1a3a6b",
  primaryLight: "#2563eb",
  primaryDark: "#0f2347",
  accent: "#f59e0b",
  accentDark: "#d97706",
  success: "#059669",
  danger: "#dc2626",
  warning: "#d97706",
  bg: "#f0f4f8",
  card: "#ffffff",
  text: "#1e293b",
  muted: "#64748b",
  border: "#e2e8f0",
};

// ─── INITIAL MOCK DATA ─────────────────────────────────────────────────────────
const INITIAL_ADMINS = [
  { id: "a1", username: "admin", password: "admin123", name: "Super Admin", email: "admin@smit.edu.pk", role: "super" },
  { id: "a2", username: "coordinator", password: "coord123", name: "Course Coordinator", email: "coord@smit.edu.pk", role: "admin" },
];

const INITIAL_STUDENTS = [
  { id: "s1", cnic: "4210112345671", rollNo: "SMIT-2024-001", name: "Ahmed Ali", password: "ahmed123", batch: "2024", registered: true },
  { id: "s2", cnic: "4210198765432", rollNo: "SMIT-2024-002", name: "Fatima Noor", password: "fatima123", batch: "2024", registered: true },
  { id: "s3", cnic: "4210111122233", rollNo: "SMIT-2024-003", name: "Usman Khan", password: "", batch: "2024", registered: false },
];

const INITIAL_COURSES = [
  { id: "c1", name: "Web & Mobile App Development", instructor: "Sir Zeeshan", duration: "6 Months", seats: 30, enrolled: 18, status: "Open", category: "Development", description: "Full-stack web and mobile development using React, Node.js and Flutter." },
  { id: "c2", name: "Artificial Intelligence & ML", instructor: "Ma'am Hira", duration: "8 Months", seats: 25, enrolled: 25, status: "Closed", category: "AI/ML", description: "Machine learning, deep learning and AI applications with Python." },
  { id: "c3", name: "Cloud Computing & DevOps", instructor: "Sir Bilal", duration: "4 Months", seats: 20, enrolled: 12, status: "Open", category: "Cloud", description: "AWS, Azure, Docker, Kubernetes and CI/CD pipelines." },
  { id: "c4", name: "Cybersecurity & Ethical Hacking", instructor: "Sir Kamran", duration: "5 Months", seats: 20, enrolled: 8, status: "Open", category: "Security", description: "Network security, penetration testing and ethical hacking." },
  { id: "c5", name: "UI/UX Design", instructor: "Ma'am Sara", duration: "3 Months", seats: 30, enrolled: 22, status: "Open", category: "Design", description: "Figma, design systems, user research and prototyping." },
  { id: "c6", name: "Data Science & Analytics", instructor: "Sir Adnan", duration: "6 Months", seats: 25, enrolled: 25, status: "Closed", category: "Data", description: "Data analysis, visualization, statistics and business intelligence." },
];

const INITIAL_LEAVES = [
  { id: "l1", studentId: "s1", studentName: "Ahmed Ali", rollNo: "SMIT-2024-001", reason: "Medical appointment", dateFrom: "2024-12-20", dateTo: "2024-12-21", status: "approved", submittedAt: "2024-12-18", image: null },
  { id: "l2", studentId: "s2", studentName: "Fatima Noor", rollNo: "SMIT-2024-002", reason: "Family emergency", dateFrom: "2024-12-22", dateTo: "2024-12-23", status: "pending", submittedAt: "2024-12-21", image: null },
  { id: "l3", studentId: "s1", studentName: "Ahmed Ali", rollNo: "SMIT-2024-001", reason: "Personal work", dateFrom: "2024-12-28", dateTo: "2024-12-28", status: "rejected", submittedAt: "2024-12-25", image: null },
];

const INITIAL_APPLICATIONS = [
  { id: "ap1", studentId: "s1", studentName: "Ahmed Ali", rollNo: "SMIT-2024-001", courseId: "c3", courseName: "Cloud Computing & DevOps", appliedAt: "2024-12-10", status: "approved", note: "Experience in Linux" },
  { id: "ap2", studentId: "s2", studentName: "Fatima Noor", rollNo: "SMIT-2024-002", courseId: "c1", courseName: "Web & Mobile App Development", appliedAt: "2024-12-12", status: "pending", note: "Basic HTML/CSS knowledge" },
];

// ─── FACEBOOK POSTS (MOCK) ─────────────────────────────────────────────────────
const FB_POSTS = [
  { id: 1, text: "🎉 Admissions Open for Spring 2025 Batch! Apply now for Web Development, AI/ML, Cloud Computing and more. Limited seats available!", date: "2 hours ago", likes: 245, shares: 89 },
  { id: 2, text: "📢 Congratulations to our students who achieved 5-star ratings on Fiverr! SMIT graduates are making waves in the freelancing world 🚀", date: "1 day ago", likes: 412, shares: 156 },
  { id: 3, text: "🏆 SMIT students win National Hackathon 2024! Proud of Team TechStar for their innovative AI-powered solution. #SMIT #PakistanTechTalent", date: "3 days ago", likes: 892, shares: 312 },
];

// ─── UTILITY ───────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
const today = () => new Date().toISOString().split("T")[0];

// ─── COMPONENTS ────────────────────────────────────────────────────────────────

function Badge({ status }) {
  const map = {
    pending: { bg: "#fef3c7", color: "#92400e", label: "Pending" },
    approved: { bg: "#d1fae5", color: "#065f46", label: "Approved" },
    rejected: { bg: "#fee2e2", color: "#991b1b", label: "Rejected" },
    Open: { bg: "#dbeafe", color: "#1e40af", label: "Open" },
    Closed: { bg: "#f3f4f6", color: "#374151", label: "Closed" },
  };
  const s = map[status] || { bg: "#f3f4f6", color: "#374151", label: status };
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, letterSpacing: 0.3 }}>
      {s.label}
    </span>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,35,71,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: wide ? 700 : 480, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${COLORS.border}` }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: COLORS.primary }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: COLORS.muted, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function Input({ label, error, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>{label}</label>}
      <input {...props} style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", border: `1.5px solid ${error ? COLORS.danger : COLORS.border}`, borderRadius: 8, fontSize: 14, color: COLORS.text, outline: "none", background: "#fff" }} />
      {error && <p style={{ color: COLORS.danger, fontSize: 12, margin: "4px 0 0" }}>{error}</p>}
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>{label}</label>}
      <select {...props} style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, color: COLORS.text, background: "#fff" }}>
        {children}
      </select>
    </div>
  );
}

function Btn({ children, variant = "primary", small, ...props }) {
  const styles = {
    primary: { background: COLORS.primaryLight, color: "#fff", border: "none" },
    secondary: { background: "#fff", color: COLORS.primary, border: `1.5px solid ${COLORS.primaryLight}` },
    danger: { background: COLORS.danger, color: "#fff", border: "none" },
    success: { background: COLORS.success, color: "#fff", border: "none" },
    accent: { background: COLORS.accent, color: COLORS.primaryDark, border: "none" },
    ghost: { background: "transparent", color: COLORS.muted, border: `1px solid ${COLORS.border}` },
  };
  return (
    <button {...props} style={{ ...styles[variant], padding: small ? "6px 12px" : "10px 20px", borderRadius: 8, fontSize: small ? 12 : 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, transition: "opacity .15s", ...(props.disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}), ...(props.style || {}) }}>
      {children}
    </button>
  );
}

function Card({ children, style }) {
  return <div style={{ background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: 20, ...style }}>{children}</div>;
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ background: color || COLORS.primary, borderRadius: 12, padding: "20px 24px", color: "#fff" }}>
      <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>{label}</div>
    </div>
  );
}

// ─── AUTH SCREENS ──────────────────────────────────────────────────────────────

function LoginScreen({ admins, students, onLogin }) {
  const [mode, setMode] = useState("student"); // student | admin
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ cnic: "", rollNo: "", password: "", username: "", confirm: "" });
  const [err, setErr] = useState({});
  const [msg, setMsg] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (mode === "admin") {
      if (!form.username) e.username = "Username required";
      if (!form.password) e.password = "Password required";
    } else if (isSignup) {
      if (!form.cnic || form.cnic.length !== 13) e.cnic = "Enter valid 13-digit CNIC";
      if (!form.rollNo) e.rollNo = "Roll number required";
      if (!form.password || form.password.length < 6) e.password = "Min 6 characters";
      if (form.password !== form.confirm) e.confirm = "Passwords don't match";
    } else {
      if (!form.cnic) e.cnic = "CNIC required";
      if (!form.password) e.password = "Password required";
    }
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (mode === "admin") {
      const admin = admins.find(a => a.username === form.username && a.password === form.password);
      if (!admin) { setErr({ username: "Invalid credentials" }); return; }
      onLogin("admin", admin);
    } else if (isSignup) {
      const pre = students.find(s => s.cnic === form.cnic && s.rollNo === form.rollNo);
      if (!pre) { setErr({ cnic: "Not found in system. Contact admin." }); return; }
      if (pre.registered) { setErr({ cnic: "Already registered. Please login." }); return; }
      onLogin("signup", { ...pre, password: form.password });
    } else {
      const stu = students.find(s => s.cnic === form.cnic && s.password === form.password && s.registered);
      if (!stu) { setErr({ cnic: "Invalid credentials or not registered" }); return; }
      onLogin("student", stu);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 50%, #1d4ed8 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 72, height: 72, background: COLORS.accent, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px", fontWeight: 900, color: COLORS.primaryDark }}>S</div>
        <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 900, margin: "0 0 4px", letterSpacing: -0.5 }}>SMIT Connect Portal</h1>
        <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, fontSize: 14 }}>Saylani Mass IT Training Program</p>
      </div>

      {/* Tab Toggle */}
      <div style={{ display: "flex", background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: 4, marginBottom: 24, gap: 4 }}>
        {["student", "admin"].map(m => (
          <button key={m} onClick={() => { setMode(m); setErr({}); setIsSignup(false); }} style={{ padding: "8px 24px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: mode === m ? "#fff" : "transparent", color: mode === m ? COLORS.primary : "rgba(255,255,255,0.8)", transition: "all .2s" }}>
            {m === "student" ? "👤 Student" : "🔐 Admin"}
          </button>
        ))}
      </div>

      {/* Form Card */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 420, boxShadow: "0 25px 80px rgba(0,0,0,0.35)" }}>
        <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 800, color: COLORS.primary }}>
          {mode === "admin" ? "Admin Login" : isSignup ? "Student Registration" : "Student Login"}
        </h2>

        {msg && <div style={{ background: "#d1fae5", color: "#065f46", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{msg}</div>}

        {mode === "admin" ? (
          <>
            <Input label="Username" value={form.username} onChange={e => set("username", e.target.value)} placeholder="Enter username" error={err.username} />
            <Input label="Password" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Enter password" error={err.password} />
          </>
        ) : (
          <>
            <Input label="CNIC (13 digits, no dashes)" value={form.cnic} onChange={e => set("cnic", e.target.value)} placeholder="4210112345671" maxLength={13} error={err.cnic} />
            {isSignup && <Input label="Roll Number" value={form.rollNo} onChange={e => set("rollNo", e.target.value)} placeholder="SMIT-2024-001" error={err.rollNo} />}
            <Input label="Password" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Enter password" error={err.password} />
            {isSignup && <Input label="Confirm Password" type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)} placeholder="Confirm password" error={err.confirm} />}
          </>
        )}

        <Btn onClick={handleSubmit} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
          {mode === "admin" ? "Login as Admin" : isSignup ? "Create Account" : "Login"}
        </Btn>

        {mode === "student" && (
          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: COLORS.muted }}>
            {isSignup ? "Already have account? " : "New student? "}
            <button onClick={() => { setIsSignup(!isSignup); setErr({}); }} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.primaryLight, fontWeight: 600, fontSize: 13 }}>
              {isSignup ? "Login" : "Register here"}
            </button>
          </p>
        )}
      </div>

      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 24 }}>© 2024 Saylani Welfare Trust · SMIT</p>
    </div>
  );
}

// ─── HOME PAGE ─────────────────────────────────────────────────────────────────

function HomePage({ onNavigate }) {
  return (
    <div>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 60%, #2563eb 100%)`, padding: "60px 24px", textAlign: "center", color: "#fff" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: COLORS.accent, color: COLORS.primaryDark, fontSize: 12, fontWeight: 700, padding: "4px 16px", borderRadius: 20, marginBottom: 16, letterSpacing: 1 }}>SMIT · SAYLANI MASS IT TRAINING</div>
          <h1 style={{ fontSize: 38, fontWeight: 900, margin: "0 0 16px", lineHeight: 1.15 }}>Empowering Pakistan's<br />Digital Future</h1>
          <p style={{ fontSize: 16, opacity: 0.85, marginBottom: 32, lineHeight: 1.7 }}>Free world-class IT education for every deserving Pakistani. Join 50,000+ alumni who transformed their lives through SMIT.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn variant="accent" onClick={() => onNavigate("courses")}>📚 Browse Courses</Btn>
            <Btn variant="secondary" onClick={() => onNavigate("dashboard")}>🎓 Student Portal</Btn>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: "#fff", padding: "32px 24px", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[["50,000+", "Alumni"], ["200+", "Courses"], ["50+", "Centers"], ["Free", "Education"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.primary }}>{v}</div>
              <div style={{ fontSize: 13, color: COLORS.muted }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Facebook Posts */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.primary, marginBottom: 8 }}>📣 Latest Updates</h2>
        <p style={{ color: COLORS.muted, marginBottom: 24, fontSize: 14 }}>From SMIT's official Facebook page</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {FB_POSTS.map(post => (
            <Card key={post.id} style={{ borderLeft: `4px solid ${COLORS.primaryLight}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, background: "#1877f2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16 }}>f</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: COLORS.text }}>SMIT Official</div>
                  <div style={{ fontSize: 11, color: COLORS.muted }}>{post.date}</div>
                </div>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: COLORS.text, margin: "0 0 12px" }}>{post.text}</p>
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: COLORS.muted }}>
                <span>👍 {post.likes} Likes</span>
                <span>↗ {post.shares} Shares</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ background: COLORS.bg, padding: "40px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.primary, marginBottom: 24 }}>Quick Access</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { icon: "📚", label: "View Courses", page: "courses" },
              { icon: "🎓", label: "My Dashboard", page: "dashboard" },
              { icon: "📋", label: "Leave Requests", page: "leaves" },
            ].map(({ icon, label, page }) => (
              <Card key={page} style={{ cursor: "pointer", textAlign: "center", padding: 24, transition: "transform .2s" }} onClick={() => onNavigate(page)}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.primary }}>{label}</div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COURSES PAGE ──────────────────────────────────────────────────────────────

function CoursesPage({ courses, student, applications, onApply }) {
  const [applyModal, setApplyModal] = useState(null);
  const [form, setForm] = useState({ note: "" });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const cats = ["All", ...new Set(courses.map(c => c.category))];
  const visible = courses.filter(c =>
    (filter === "All" || c.category === filter) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const hasApplied = (courseId) => applications.some(a => a.studentId === student?.id && a.courseId === courseId);

  const submit = () => {
    if (!applyModal) return;
    onApply({ courseId: applyModal.id, courseName: applyModal.name, note: form.note });
    setApplyModal(null);
    setForm({ note: "" });
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: COLORS.primary, margin: "0 0 6px" }}>Available Courses</h1>
        <p style={{ color: COLORS.muted, margin: 0, fontSize: 14 }}>Browse and apply for courses offered at SMIT</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses…" style={{ flex: 1, minWidth: 200, padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, outline: "none" }} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {cats.map(c => (
            <button key={c} onClick={() => setFilter(c)} style={{ padding: "8px 14px", borderRadius: 20, border: `1.5px solid ${filter === c ? COLORS.primaryLight : COLORS.border}`, background: filter === c ? COLORS.primaryLight : "#fff", color: filter === c ? "#fff" : COLORS.text, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {visible.map(course => {
          const applied = student && hasApplied(course.id);
          const isClosed = course.status === "Closed";
          const pct = Math.round((course.enrolled / course.seats) * 100);
          return (
            <Card key={course.id} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{course.category}</span>
                <Badge status={course.status} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary, margin: "0 0 6px" }}>{course.name}</h3>
              <p style={{ fontSize: 13, color: COLORS.muted, margin: "0 0 12px", lineHeight: 1.5 }}>{course.description}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[["👨‍🏫", course.instructor], ["⏱️", course.duration], ["💺", `${course.seats - course.enrolled} seats left`]].map(([icon, val]) => (
                  <div key={val} style={{ fontSize: 12, color: COLORS.muted, display: "flex", alignItems: "center", gap: 4 }}>
                    <span>{icon}</span><span>{val}</span>
                  </div>
                ))}
              </div>
              {/* Progress Bar */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.muted, marginBottom: 4 }}>
                  <span>Enrollment</span><span>{pct}%</span>
                </div>
                <div style={{ height: 5, background: COLORS.bg, borderRadius: 99 }}>
                  <div style={{ height: 5, background: pct >= 100 ? COLORS.danger : COLORS.success, borderRadius: 99, width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>
              {student ? (
                <Btn variant={applied ? "ghost" : isClosed ? "ghost" : "primary"} disabled={isClosed || applied}
                  onClick={() => !isClosed && !applied && setApplyModal(course)}
                  style={{ width: "100%", justifyContent: "center", marginTop: "auto" }}>
                  {applied ? "✅ Applied" : isClosed ? "🔒 Closed" : "Apply Now"}
                </Btn>
              ) : (
                <p style={{ fontSize: 12, color: COLORS.muted, textAlign: "center", margin: 0 }}>Login to apply</p>
              )}
            </Card>
          );
        })}
      </div>

      {applyModal && (
        <Modal title={`Apply: ${applyModal.name}`} onClose={() => setApplyModal(null)}>
          <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 16 }}>Instructor: <strong>{applyModal.instructor}</strong> · Duration: <strong>{applyModal.duration}</strong></p>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>Tell us why you want to join (optional)</label>
            <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={4} style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, resize: "vertical" }} placeholder="e.g., I have basic HTML/CSS skills and want to learn full-stack development…" />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setApplyModal(null)}>Cancel</Btn>
            <Btn onClick={submit}>Submit Application</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── STUDENT DASHBOARD ─────────────────────────────────────────────────────────

function StudentDashboard({ student, leaves, applications, courses, onSubmitLeave, onNavigate }) {
  const [leaveModal, setLeaveModal] = useState(false);
  const [form, setForm] = useState({ reason: "", dateFrom: today(), dateTo: today(), image: null });
  const [errors, setErrors] = useState({});
  const [tab, setTab] = useState("overview");

  const myLeaves = leaves.filter(l => l.studentId === student.id);
  const myApps = applications.filter(a => a.studentId === student.id);

  const validate = () => {
    const e = {};
    if (!form.reason.trim()) e.reason = "Please enter a reason";
    if (!form.dateFrom) e.dateFrom = "Select start date";
    if (!form.dateTo) e.dateTo = "Select end date";
    if (form.dateTo < form.dateFrom) e.dateTo = "End date must be after start date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitLeave = () => {
    if (!validate()) return;
    onSubmitLeave({ ...form, studentId: student.id, studentName: student.name, rollNo: student.rollNo });
    setLeaveModal(false);
    setForm({ reason: "", dateFrom: today(), dateTo: today(), image: null });
  };

  const TABS = [
    { id: "overview", label: "📊 Overview" },
    { id: "courses", label: "📚 My Courses" },
    { id: "leaves", label: "📋 Leave Requests" },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
      {/* Welcome */}
      <div style={{ background: `linear-gradient(120deg, ${COLORS.primary}, ${COLORS.primaryLight})`, borderRadius: 16, padding: "24px 28px", marginBottom: 28, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Welcome back 👋</div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{student.name}</h2>
          <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>Roll No: {student.rollNo} · Batch {student.batch}</div>
        </div>
        <Btn variant="accent" onClick={() => setLeaveModal(true)}>+ Apply for Leave</Btn>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 18px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: tab === t.id ? COLORS.primaryLight : COLORS.muted, borderBottom: `2.5px solid ${tab === t.id ? COLORS.primaryLight : "transparent"}`, marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 24 }}>
            <StatCard label="Applied Courses" value={myApps.length} icon="📚" color={COLORS.primary} />
            <StatCard label="Total Leaves" value={myLeaves.length} icon="📋" color="#7c3aed" />
            <StatCard label="Approved Leaves" value={myLeaves.filter(l => l.status === "approved").length} icon="✅" color={COLORS.success} />
            <StatCard label="Pending" value={myLeaves.filter(l => l.status === "pending").length} icon="⏳" color={COLORS.warning} />
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary, marginBottom: 14 }}>Recent Activity</h3>
          {[...myLeaves.slice(-3).reverse(), ...myApps.slice(-2).reverse()].length === 0
            ? <Card style={{ textAlign: "center", color: COLORS.muted, padding: 40 }}><div style={{ fontSize: 32, marginBottom: 8 }}>📭</div><p>No recent activity</p></Card>
            : myLeaves.slice(-3).reverse().map(l => (
              <Card key={l.id} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.text }}>Leave Request</div>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>{l.dateFrom} → {l.dateTo} · {l.reason}</div>
                </div>
                <Badge status={l.status} />
              </Card>
            ))
          }
        </div>
      )}

      {tab === "courses" && (
        <div>
          {myApps.length === 0
            ? <Card style={{ textAlign: "center", padding: 48, color: COLORS.muted }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
              <p>No course applications yet</p>
              <Btn onClick={() => onNavigate("courses")}>Browse Courses</Btn>
            </Card>
            : myApps.map(app => {
              const course = courses.find(c => c.id === app.courseId);
              return (
                <Card key={app.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.primary, marginBottom: 4 }}>{app.courseName}</div>
                      <div style={{ fontSize: 12, color: COLORS.muted }}>Applied: {app.appliedAt} · {course?.instructor}</div>
                      {app.note && <div style={{ fontSize: 12, color: COLORS.text, marginTop: 6, fontStyle: "italic" }}>"{app.note}"</div>}
                    </div>
                    <Badge status={app.status} />
                  </div>
                </Card>
              );
            })
          }
        </div>
      )}

      {tab === "leaves" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <Btn onClick={() => setLeaveModal(true)}>+ New Leave Request</Btn>
          </div>
          {myLeaves.length === 0
            ? <Card style={{ textAlign: "center", padding: 48, color: COLORS.muted }}><div style={{ fontSize: 40, marginBottom: 12 }}>📋</div><p>No leave requests submitted</p></Card>
            : myLeaves.map(leave => (
              <Card key={leave.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.text, marginBottom: 4 }}>{leave.reason}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted }}>📅 {leave.dateFrom} → {leave.dateTo}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted }}>Submitted: {leave.submittedAt}</div>
                  </div>
                  <Badge status={leave.status} />
                </div>
              </Card>
            ))
          }
        </div>
      )}

      {leaveModal && (
        <Modal title="Apply for Leave" onClose={() => setLeaveModal(false)}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>Reason for Leave *</label>
            <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={3} style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", border: `1.5px solid ${errors.reason ? COLORS.danger : COLORS.border}`, borderRadius: 8, fontSize: 14, resize: "vertical", marginBottom: errors.reason ? 4 : 16 }} placeholder="Describe your reason…" />
            {errors.reason && <p style={{ color: COLORS.danger, fontSize: 12, margin: "0 0 12px" }}>{errors.reason}</p>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="From Date *" type="date" value={form.dateFrom} onChange={e => setForm(f => ({ ...f, dateFrom: e.target.value }))} error={errors.dateFrom} />
              <Input label="To Date *" type="date" value={form.dateTo} onChange={e => setForm(f => ({ ...f, dateTo: e.target.value }))} error={errors.dateTo} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>Supporting Document (optional)</label>
              <div style={{ border: `1.5px dashed ${COLORS.border}`, borderRadius: 8, padding: "20px", textAlign: "center", color: COLORS.muted, cursor: "pointer", fontSize: 13 }}>
                {form.image ? `📎 ${form.image}` : "📎 Click to upload (JPG, PNG, PDF)"}
                <input type="file" accept="image/*,.pdf" onChange={e => setForm(f => ({ ...f, image: e.target.files[0]?.name || null }))} style={{ position: "absolute", opacity: 0, width: 0 }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => setLeaveModal(false)}>Cancel</Btn>
              <Btn onClick={submitLeave}>Submit Leave</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── ADMIN PANEL ───────────────────────────────────────────────────────────────

function AdminPanel({ admin, admins, students, courses, leaves, applications, onUpdate }) {
  const [tab, setTab] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const pendingLeaves = leaves.filter(l => l.status === "pending");
  const pendingApps = applications.filter(a => a.status === "pending");

  const TABS = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "students", label: "👥 Students" },
    { id: "courses", label: "📚 Courses" },
    { id: "leaves", label: "📋 Leaves" },
    { id: "applications", label: "🎓 Applications" },
    { id: "admins", label: "🔐 Admins" },
    { id: "settings", label: "⚙️ Settings" },
  ];

  const openModal = (type, data = {}) => {
    setModal(type);
    setForm(data);
    setErrors({});
  };

  const closeModal = () => { setModal(null); setForm({}); setErrors({}); };

  // ── Handlers ──
  const addStudent = () => {
    const e = {};
    if (!form.name) e.name = "Name required";
    if (!form.cnic || form.cnic.length !== 13) e.cnic = "13-digit CNIC required";
    if (!form.rollNo) e.rollNo = "Roll number required";
    if (students.some(s => s.cnic === form.cnic)) e.cnic = "CNIC already exists";
    if (Object.keys(e).length) { setErrors(e); return; }
    onUpdate("addStudent", { id: uid(), ...form, password: "", registered: false, batch: new Date().getFullYear().toString() });
    showToast(`Student ${form.name} added!`);
    closeModal();
  };

  const addCourse = () => {
    const e = {};
    if (!form.name) e.name = "Course name required";
    if (!form.instructor) e.instructor = "Instructor required";
    if (Object.keys(e).length) { setErrors(e); return; }
    onUpdate("addCourse", { id: uid(), ...form, enrolled: 0, seats: parseInt(form.seats) || 20, status: form.status || "Open" });
    showToast("Course added!");
    closeModal();
  };

  const editCourse = () => {
    onUpdate("editCourse", form);
    showToast("Course updated!");
    closeModal();
  };

  const updateLeave = (id, status) => {
    onUpdate("updateLeave", { id, status });
    showToast(`Leave ${status}!`, status === "approved" ? "success" : "danger");
  };

  const updateApp = (id, status) => {
    onUpdate("updateApp", { id, status });
    showToast(`Application ${status}!`);
  };

  const addAdmin = () => {
    const e = {};
    if (!form.name) e.name = "Name required";
    if (!form.username) e.username = "Username required";
    if (!form.password || form.password.length < 6) e.password = "Min 6 chars";
    if (admins.some(a => a.username === form.username)) e.username = "Username taken";
    if (Object.keys(e).length) { setErrors(e); return; }
    onUpdate("addAdmin", { id: uid(), ...form, role: "admin" });
    showToast("Admin added!");
    closeModal();
  };

  const changePassword = () => {
    const e = {};
    if (!form.current) e.current = "Enter current password";
    if (form.current !== admin.password) e.current = "Incorrect password";
    if (!form.newPass || form.newPass.length < 6) e.newPass = "Min 6 characters";
    if (form.newPass !== form.confirmPass) e.confirmPass = "Passwords don't match";
    if (Object.keys(e).length) { setErrors(e); return; }
    onUpdate("changePassword", { id: admin.id, password: form.newPass });
    showToast("Password changed!");
    closeModal();
  };

  const bulkImport = () => {
    const mock = [
      { id: uid(), name: "Zara Sheikh", cnic: "4210199988877", rollNo: `SMIT-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`, password: "", registered: false, batch: new Date().getFullYear().toString() },
      { id: uid(), name: "Hamza Raza", cnic: "4210144455566", rollNo: `SMIT-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`, password: "", registered: false, batch: new Date().getFullYear().toString() },
    ];
    onUpdate("bulkStudents", mock);
    showToast(`${mock.length} students imported from Excel!`);
    closeModal();
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, background: toast.type === "danger" ? COLORS.danger : COLORS.success, color: "#fff", padding: "12px 20px", borderRadius: 10, zIndex: 2000, fontWeight: 600, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          {toast.type === "danger" ? "⚠️" : "✅"} {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: COLORS.primary }}>Admin Panel</h1>
          <p style={{ margin: 0, fontSize: 13, color: COLORS.muted }}>Welcome, {admin.name}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {pendingLeaves.length > 0 && <span style={{ background: "#fef3c7", color: "#92400e", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>⏳ {pendingLeaves.length} leave{pendingLeaves.length > 1 ? "s" : ""} pending</span>}
          {pendingApps.length > 0 && <span style={{ background: "#dbeafe", color: "#1e40af", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>📨 {pendingApps.length} app{pendingApps.length > 1 ? "s" : ""} pending</span>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 24, overflowX: "auto", borderBottom: `1px solid ${COLORS.border}` }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: tab === t.id ? COLORS.primaryLight : COLORS.muted, borderBottom: `2.5px solid ${tab === t.id ? COLORS.primaryLight : "transparent"}`, marginBottom: -1, whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Dashboard Tab ─────────────────────────────────────────────────────── */}
      {tab === "dashboard" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 14, marginBottom: 28 }}>
            <StatCard label="Total Students" value={students.length} icon="👥" color={COLORS.primary} />
            <StatCard label="Courses" value={courses.length} icon="📚" color="#7c3aed" />
            <StatCard label="Open Courses" value={courses.filter(c => c.status === "Open").length} icon="🟢" color={COLORS.success} />
            <StatCard label="Leave Requests" value={leaves.length} icon="📋" color={COLORS.warning} />
            <StatCard label="Applications" value={applications.length} icon="🎓" color="#0891b2" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Card>
              <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: COLORS.primary }}>📋 Pending Leaves ({pendingLeaves.length})</h3>
              {pendingLeaves.length === 0
                ? <p style={{ color: COLORS.muted, fontSize: 13 }}>All leaves reviewed</p>
                : pendingLeaves.slice(0, 4).map(l => (
                  <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{l.studentName}</div>
                      <div style={{ fontSize: 11, color: COLORS.muted }}>{l.dateFrom} → {l.dateTo}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn small variant="success" onClick={() => updateLeave(l.id, "approved")}>✓</Btn>
                      <Btn small variant="danger" onClick={() => updateLeave(l.id, "rejected")}>✗</Btn>
                    </div>
                  </div>
                ))
              }
            </Card>
            <Card>
              <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: COLORS.primary }}>🎓 Pending Applications ({pendingApps.length})</h3>
              {pendingApps.length === 0
                ? <p style={{ color: COLORS.muted, fontSize: 13 }}>All applications reviewed</p>
                : pendingApps.slice(0, 4).map(a => (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{a.studentName}</div>
                      <div style={{ fontSize: 11, color: COLORS.muted }}>{a.courseName}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn small variant="success" onClick={() => updateApp(a.id, "approved")}>✓</Btn>
                      <Btn small variant="danger" onClick={() => updateApp(a.id, "rejected")}>✗</Btn>
                    </div>
                  </div>
                ))
              }
            </Card>
          </div>
        </div>
      )}

      {/* ── Students Tab ──────────────────────────────────────────────────────── */}
      {tab === "students" && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <Btn onClick={() => openModal("addStudent")}>+ Add Student</Btn>
            <Btn variant="secondary" onClick={() => openModal("bulkImport")}>📥 Import Excel</Btn>
          </div>
          <Card style={{ overflowX: "auto", padding: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: COLORS.bg }}>
                  {["Name", "CNIC", "Roll No", "Batch", "Status", "Action"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: COLORS.text, fontSize: 12, borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600 }}>{s.name}</td>
                    <td style={{ padding: "12px 16px", color: COLORS.muted }}>{s.cnic}</td>
                    <td style={{ padding: "12px 16px" }}>{s.rollNo}</td>
                    <td style={{ padding: "12px 16px", color: COLORS.muted }}>{s.batch}</td>
                    <td style={{ padding: "12px 16px" }}><Badge status={s.registered ? "approved" : "pending"} /></td>
                    <td style={{ padding: "12px 16px" }}>
                      <Btn small variant="ghost" onClick={() => openModal("viewStudent", s)}>View</Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* ── Courses Tab ───────────────────────────────────────────────────────── */}
      {tab === "courses" && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Btn onClick={() => openModal("addCourse", { status: "Open", category: "Development", seats: "20" })}>+ Add Course</Btn>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {courses.map(c => (
              <Card key={c.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, background: COLORS.bg, padding: "2px 8px", borderRadius: 20 }}>{c.category}</span>
                  <Badge status={c.status} />
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: COLORS.primary }}>{c.name}</h3>
                <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 10px" }}>{c.instructor} · {c.duration}</p>
                <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12 }}>Enrolled: {c.enrolled}/{c.seats}</div>
                <Btn small variant="secondary" onClick={() => openModal("editCourse", { ...c })}>✏️ Edit Course</Btn>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Leaves Tab ────────────────────────────────────────────────────────── */}
      {tab === "leaves" && (
        <div>
          <Card style={{ overflowX: "auto", padding: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: COLORS.bg }}>
                  {["Student", "Roll No", "Reason", "Dates", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: COLORS.text, fontSize: 12, borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600 }}>{l.studentName}</td>
                    <td style={{ padding: "12px 16px", color: COLORS.muted }}>{l.rollNo}</td>
                    <td style={{ padding: "12px 16px", maxWidth: 200 }}>{l.reason}</td>
                    <td style={{ padding: "12px 16px", color: COLORS.muted, whiteSpace: "nowrap" }}>{l.dateFrom} → {l.dateTo}</td>
                    <td style={{ padding: "12px 16px" }}><Badge status={l.status} /></td>
                    <td style={{ padding: "12px 16px" }}>
                      {l.status === "pending" ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <Btn small variant="success" onClick={() => updateLeave(l.id, "approved")}>Approve</Btn>
                          <Btn small variant="danger" onClick={() => updateLeave(l.id, "rejected")}>Reject</Btn>
                        </div>
                      ) : <span style={{ fontSize: 12, color: COLORS.muted }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* ── Applications Tab ──────────────────────────────────────────────────── */}
      {tab === "applications" && (
        <div>
          <Card style={{ overflowX: "auto", padding: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: COLORS.bg }}>
                  {["Student", "Roll No", "Course", "Applied", "Note", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: COLORS.text, fontSize: 12, borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map(a => (
                  <tr key={a.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600 }}>{a.studentName}</td>
                    <td style={{ padding: "12px 16px", color: COLORS.muted }}>{a.rollNo}</td>
                    <td style={{ padding: "12px 16px" }}>{a.courseName}</td>
                    <td style={{ padding: "12px 16px", color: COLORS.muted }}>{a.appliedAt}</td>
                    <td style={{ padding: "12px 16px", color: COLORS.muted, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>{a.note || "—"}</td>
                    <td style={{ padding: "12px 16px" }}><Badge status={a.status} /></td>
                    <td style={{ padding: "12px 16px" }}>
                      {a.status === "pending" ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <Btn small variant="success" onClick={() => updateApp(a.id, "approved")}>✓</Btn>
                          <Btn small variant="danger" onClick={() => updateApp(a.id, "rejected")}>✗</Btn>
                        </div>
                      ) : <span style={{ fontSize: 12, color: COLORS.muted }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* ── Admins Tab ────────────────────────────────────────────────────────── */}
      {tab === "admins" && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Btn onClick={() => openModal("addAdmin")}>+ Add Admin</Btn>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {admins.map(a => (
              <Card key={a.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16 }}>
                    {a.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>{a.name}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted }}>@{a.username}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted }}>{a.email}</div>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <span style={{ background: a.role === "super" ? "#fef3c7" : "#eff6ff", color: a.role === "super" ? "#92400e" : "#1e40af", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                    {a.role === "super" ? "⭐ Super Admin" : "Admin"}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Settings Tab ──────────────────────────────────────────────────────── */}
      {tab === "settings" && (
        <div style={{ maxWidth: 500 }}>
          <Card>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: COLORS.primary }}>🔐 Change Password</h3>
            <Input label="Current Password" type="password" value={form.current || ""} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} error={errors.current} />
            <Input label="New Password" type="password" value={form.newPass || ""} onChange={e => setForm(f => ({ ...f, newPass: e.target.value }))} error={errors.newPass} />
            <Input label="Confirm New Password" type="password" value={form.confirmPass || ""} onChange={e => setForm(f => ({ ...f, confirmPass: e.target.value }))} error={errors.confirmPass} />
            <Btn onClick={changePassword}>Update Password</Btn>
          </Card>
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────────────── */}
      {modal === "addStudent" && (
        <Modal title="Add New Student" onClose={closeModal}>
          <Input label="Full Name *" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} error={errors.name} placeholder="Muhammad Ahmed" />
          <Input label="CNIC (13 digits) *" value={form.cnic || ""} onChange={e => setForm(f => ({ ...f, cnic: e.target.value }))} error={errors.cnic} maxLength={13} placeholder="4210112345671" />
          <Input label="Roll Number *" value={form.rollNo || ""} onChange={e => setForm(f => ({ ...f, rollNo: e.target.value }))} error={errors.rollNo} placeholder="SMIT-2024-XXX" />
          <Input label="Batch" value={form.batch || new Date().getFullYear()} onChange={e => setForm(f => ({ ...f, batch: e.target.value }))} placeholder="2024" />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
            <Btn onClick={addStudent}>Add Student</Btn>
          </div>
        </Modal>
      )}

      {modal === "bulkImport" && (
        <Modal title="Import Students from Excel" onClose={closeModal}>
          <div style={{ background: COLORS.bg, borderRadius: 8, padding: 20, textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📥</div>
            <p style={{ margin: "0 0 12px", fontSize: 14, color: COLORS.text, fontWeight: 600 }}>Upload Excel File</p>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: COLORS.muted }}>Expected columns: Name, CNIC, Roll No, Batch</p>
            <div style={{ border: `2px dashed ${COLORS.border}`, borderRadius: 8, padding: 24, cursor: "pointer" }}>
              <p style={{ margin: 0, fontSize: 13, color: COLORS.muted }}>📎 Click to upload .xlsx or .csv file</p>
            </div>
          </div>
          <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 16 }}>* This demo will simulate importing 2 sample students</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
            <Btn onClick={bulkImport}>Import (Demo)</Btn>
          </div>
        </Modal>
      )}

      {modal === "addCourse" && (
        <Modal title="Add New Course" onClose={closeModal} wide>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Input label="Course Name *" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} error={errors.name} placeholder="Web Development" />
            <Input label="Instructor *" value={form.instructor || ""} onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))} error={errors.instructor} placeholder="Sir Zeeshan" />
            <Input label="Duration" value={form.duration || ""} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="6 Months" />
            <Input label="Total Seats" type="number" value={form.seats || ""} onChange={e => setForm(f => ({ ...f, seats: e.target.value }))} placeholder="20" />
          </div>
          <Select label="Category" value={form.category || ""} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {["Development", "AI/ML", "Cloud", "Security", "Design", "Data", "Other"].map(c => <option key={c}>{c}</option>)}
          </Select>
          <Select label="Status" value={form.status || "Open"} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option>Open</option><option>Closed</option>
          </Select>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>Description</label>
            <textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
            <Btn onClick={addCourse}>Add Course</Btn>
          </div>
        </Modal>
      )}

      {modal === "editCourse" && (
        <Modal title="Edit Course" onClose={closeModal} wide>
          <Input label="Course Name" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Instructor" value={form.instructor || ""} onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))} />
          <Input label="Duration" value={form.duration || ""} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Input label="Total Seats" type="number" value={form.seats || ""} onChange={e => setForm(f => ({ ...f, seats: e.target.value }))} />
            <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option>Open</option><option>Closed</option>
            </Select>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
            <Btn onClick={editCourse}>Save Changes</Btn>
          </div>
        </Modal>
      )}

      {modal === "addAdmin" && (
        <Modal title="Add New Admin" onClose={closeModal}>
          <Input label="Full Name *" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} error={errors.name} />
          <Input label="Username *" value={form.username || ""} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} error={errors.username} />
          <Input label="Email" type="email" value={form.email || ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <Input label="Password *" type="password" value={form.password || ""} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} error={errors.password} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
            <Btn onClick={addAdmin}>Add Admin</Btn>
          </div>
        </Modal>
      )}

      {modal === "viewStudent" && (
        <Modal title="Student Details" onClose={closeModal}>
          <div style={{ display: "grid", gap: 12 }}>
            {[["Name", form.name], ["CNIC", form.cnic], ["Roll No", form.rollNo], ["Batch", form.batch], ["Status", form.registered ? "Registered" : "Not Registered"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: COLORS.muted }}>{k}</span>
                <span style={{ fontWeight: 600, fontSize: 13, color: COLORS.text }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20 }}>
            <Btn variant="ghost" onClick={closeModal} style={{ width: "100%", justifyContent: "center" }}>Close</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── NAV BAR ──────────────────────────────────────────────────────────────────

function Navbar({ user, role, currentPage, onNavigate, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const studentLinks = [
    { id: "home", label: "Home" },
    { id: "courses", label: "Courses" },
    { id: "dashboard", label: "Dashboard" },
    { id: "leaves", label: "Leaves" },
  ];
  const adminLinks = [{ id: "admin", label: "Admin Panel" }];
  const links = role === "admin" ? adminLinks : studentLinks;

  return (
    <nav style={{ background: COLORS.primaryDark, borderBottom: `1px solid rgba(255,255,255,0.1)`, position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => onNavigate("home")}>
          <div style={{ width: 32, height: 32, background: COLORS.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: COLORS.primaryDark, fontSize: 16 }}>S</div>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: -0.3 }}>SMIT Connect</span>
        </div>

        <div style={{ display: "flex", gap: 4, marginLeft: 32 }}>
          {links.map(l => (
            <button key={l.id} onClick={() => onNavigate(l.id)} style={{ background: currentPage === l.id ? "rgba(255,255,255,0.15)" : "none", border: "none", color: currentPage === l.id ? "#fff" : "rgba(255,255,255,0.7)", padding: "8px 14px", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              {l.label}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{user?.name || user?.username}</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>{role === "admin" ? "Administrator" : user?.rollNo}</div>
          </div>
          <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "7px 14px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── APP ROOT ──────────────────────────────────────────────────────────────────

export default function App() {
  const [admins, setAdmins] = useState(INITIAL_ADMINS);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [leaves, setLeaves] = useState(INITIAL_LEAVES);
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);

  const [auth, setAuth] = useState(null); // { user, role }
  const [page, setPage] = useState("home");

  const handleLogin = (type, data) => {
    if (type === "signup") {
      setStudents(prev => prev.map(s => s.id === data.id ? { ...s, password: data.password, registered: true } : s));
      setAuth({ user: { ...data, registered: true }, role: "student" });
      setPage("dashboard");
    } else if (type === "student") {
      setAuth({ user: data, role: "student" });
      setPage("dashboard");
    } else if (type === "admin") {
      setAuth({ user: data, role: "admin" });
      setPage("admin");
    }
  };

  const handleLogout = () => { setAuth(null); setPage("home"); };

  const handleUpdate = (action, payload) => {
    switch (action) {
      case "addStudent": setStudents(p => [...p, payload]); break;
      case "bulkStudents": setStudents(p => [...p, ...payload]); break;
      case "addCourse": setCourses(p => [...p, payload]); break;
      case "editCourse": setCourses(p => p.map(c => c.id === payload.id ? { ...c, ...payload, seats: parseInt(payload.seats) } : c)); break;
      case "updateLeave": setLeaves(p => p.map(l => l.id === payload.id ? { ...l, status: payload.status } : l)); break;
      case "updateApp": setApplications(p => p.map(a => a.id === payload.id ? { ...a, status: payload.status } : a)); break;
      case "addAdmin": setAdmins(p => [...p, payload]); break;
      case "changePassword": setAdmins(p => p.map(a => a.id === payload.id ? { ...a, password: payload.password } : a)); break;
    }
  };

  const handleApply = ({ courseId, courseName, note }) => {
    if (!auth?.user) return;
    const already = applications.some(a => a.studentId === auth.user.id && a.courseId === courseId);
    if (already) return;
    setApplications(p => [...p, {
      id: uid(), studentId: auth.user.id, studentName: auth.user.name, rollNo: auth.user.rollNo,
      courseId, courseName, appliedAt: today(), status: "pending", note
    }]);
  };

  const handleSubmitLeave = (data) => {
    setLeaves(p => [...p, { id: uid(), ...data, status: "pending", submittedAt: today() }]);
  };

  if (!auth) {
    return <LoginScreen admins={admins} students={students} onLogin={handleLogin} />;
  }

  const { user, role } = auth;
  const currentStudent = role === "student" ? students.find(s => s.id === user.id) || user : null;
  const currentAdmin = role === "admin" ? admins.find(a => a.id === user.id) || user : null;

  const renderPage = () => {
    if (role === "admin") {
      return <AdminPanel admin={currentAdmin} admins={admins} students={students} courses={courses} leaves={leaves} applications={applications} onUpdate={handleUpdate} />;
    }
    switch (page) {
      case "home": return <HomePage onNavigate={setPage} />;
      case "courses": return <CoursesPage courses={courses} student={currentStudent} applications={applications} onApply={handleApply} />;
      case "dashboard": return <StudentDashboard student={currentStudent} leaves={leaves} applications={applications} courses={courses} onSubmitLeave={handleSubmitLeave} onNavigate={setPage} />;
      case "leaves": return <StudentDashboard student={currentStudent} leaves={leaves} applications={applications} courses={courses} onSubmitLeave={handleSubmitLeave} onNavigate={setPage} defaultTab="leaves" />;
      default: return <HomePage onNavigate={setPage} />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'Segoe UI', system-ui, sans-serif", color: COLORS.text }}>
      <Navbar user={role === "admin" ? currentAdmin : currentStudent} role={role} currentPage={page} onNavigate={setPage} onLogout={handleLogout} />
      <main>{renderPage()}</main>
    </div>
  );
}

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Home, Calendar, Bell, Activity, User, ChevronRight, ChevronLeft,
  Plus, Check, X, Heart, Droplet, Weight, Moon, Pill, Clock,
  ArrowLeft, MapPin, Star, Phone, Search, AlarmClock, FileText,
  Stethoscope, ClipboardList, Filter, Eye, EyeOff, Mail, Lock,
  LogOut, Building2
} from "lucide-react";

/* ---------------------------------------------------------
   DESIGN TOKENS
   ink:    #0B3D3A  -- primary text, nav, headers
   paper:  #F6F4EF  -- app background
   teal:   #1F7A6C  -- primary actions, active states, rings
   coral:  #E2622E  -- attention / reminders / due-now
   slate:  #6B7570  -- secondary text
   line:   #E4E1D6  -- hairline borders
--------------------------------------------------------- */

const COLORS = {
  ink: "#0B3D3A",
  paper: "#F6F4EF",
  teal: "#1F7A6C",
  tealSoft: "#E3F0EC",
  coral: "#E2622E",
  coralSoft: "#FBEAE2",
  slate: "#6B7570",
  line: "#E4E1D6",
  white: "#FFFFFF",
};

/* ---------------------------------------------------------
   SAMPLE / SEED DATA — mirrors the wireframe's patient flow
--------------------------------------------------------- */

const SEED_VITALS = {
  bloodPressure: { systolic: 120, diastolic: 80, status: "normal", lastLogged: "Today, 8:02 AM" },
  weight: { value: 70, unit: "kg", status: "normal", lastLogged: "Today, 7:50 AM" },
  heartRate: { value: 72, unit: "bpm", status: "normal", lastLogged: "Today, 8:02 AM" },
  sleep: { value: 7.2, unit: "hrs", status: "normal", lastLogged: "Today, 6:30 AM" },
};

const SEED_HISTORY = {
  bloodPressure: [
    { date: "20 May", systolic: 122, diastolic: 81 },
    { date: "21 May", systolic: 118, diastolic: 78 },
    { date: "22 May", systolic: 121, diastolic: 80 },
    { date: "23 May", systolic: 124, diastolic: 82 },
    { date: "24 May", systolic: 119, diastolic: 79 },
    { date: "25 May", systolic: 120, diastolic: 80 },
  ],
  weight: [
    { date: "20 May", value: 71.2 },
    { date: "21 May", value: 71.0 },
    { date: "22 May", value: 70.6 },
    { date: "23 May", value: 70.5 },
    { date: "24 May", value: 70.2 },
    { date: "25 May", value: 70.0 },
  ],
};

const SEED_MEDS = [
  { id: "m1", name: "Amlodipine 5mg", dosage: "1 tablet", time: "08:00", frequency: "Daily", taken: true },
  { id: "m2", name: "Vitamin D3", dosage: "1 tablet", time: "13:00", frequency: "Daily", taken: false },
  { id: "m3", name: "Metformin 500mg", dosage: "1 tablet", time: "20:00", frequency: "Daily", taken: false },
];

const SEED_APPOINTMENTS = [
  { id: "a1", doctor: "Dr. Adeyemi Lawal", specialty: "Cardiology", hospital: "St. Nicholas Hospital", date: "20 May 2026", time: "10:00 AM" },
];

const SEED_NOTES = [
  { id: "n1", date: "18 May 2026", text: "Mild headache after long screen time. Resolved with rest." },
  { id: "n2", date: "12 May 2026", text: "Felt great after morning walk. Energy levels good." },
];

const SEED_HOSPITALS = [
  { id: "h1", name: "St. Nicholas Hospital", address: "57 Campbell Street, Lagos Island", rating: 4.8, distance: "1.2 km" },
  { id: "h2", name: "Reddington Hospital", address: "5 Awolowo Road, Victoria Island", rating: 4.6, distance: "2.8 km" },
  { id: "h3", name: "Lagoon Hospital", address: "23 Olowu Street, Ikeja, Lagos", rating: 4.7, distance: "4.1 km" },
];

const SEED_CHILDREN = [
  { id: "c1", name: "Michael", age: 8, hospital: "Lagoon Hospital" },
  { id: "c2", name: "Sarah", age: 5, hospital: "Reddington Hospital" },
];

/* History feed -- unified log shown on the Records screen.
   type: "vitals" | "note" | "appointment" | "medicine"        */
const SEED_HISTORY_LOG = [
  { id: "log1", type: "appointment", title: "Appointment with Dr. Adeyemi Lawal", detail: "Cardiology · St. Nicholas Hospital", date: "20 May 2026", time: "10:00 AM", ts: new Date("2026-05-20T10:00:00").getTime() },
  { id: "log2", type: "vitals", title: "Blood pressure logged", detail: "120/80 mmHg · normal", date: "25 May 2026", time: "8:02 AM", ts: new Date("2026-05-25T08:02:00").getTime() },
  { id: "log3", type: "vitals", title: "Weight logged", detail: "70 kg · normal", date: "25 May 2026", time: "7:50 AM", ts: new Date("2026-05-25T07:50:00").getTime() },
  { id: "log4", type: "note", title: "Symptom note added", detail: "Felt great after morning walk. Energy levels good.", date: "12 May 2026", time: "9:10 PM", ts: new Date("2026-05-12T21:10:00").getTime() },
  { id: "log5", type: "note", title: "Symptom note added", detail: "Mild headache after long screen time. Resolved with rest.", date: "18 May 2026", time: "6:45 PM", ts: new Date("2026-05-18T18:45:00").getTime() },
  { id: "log6", type: "medicine", title: "Amlodipine 5mg taken", detail: "1 tablet · 08:00 dose", date: "25 May 2026", time: "8:05 AM", ts: new Date("2026-05-25T08:05:00").getTime() },
];

const HISTORY_TYPE_META = {
  vitals: { label: "Vitals", icon: "Activity", color: "teal" },
  note: { label: "Note", icon: "FileText", color: "coral" },
  appointment: { label: "Appointment", icon: "Stethoscope", color: "teal" },
  medicine: { label: "Medicine", icon: "Pill", color: "coral" },
};

/* Demo account, seeded so login works immediately without signing up first.
   This is in-memory only -- not real authentication. */
const SEED_ACCOUNT = {
  id: "u1",
  name: "John Adeyemi",
  email: "john.a@email.com",
  password: "Carelynk1",
};

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/* Breakpoint below which the app renders edge-to-edge like an installed
   mobile app. At or above it, we switch to a centered desktop layout
   without the phone bezel. */
const MOBILE_BREAKPOINT = 640;

function useViewport() {
  const [width, setWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1024));
  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return { width, isMobile: width < MOBILE_BREAKPOINT };
}

/* ---------------------------------------------------------
   SMALL HELPERS
--------------------------------------------------------- */

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function statusColor(status) {
  if (status === "high" || status === "low") return COLORS.coral;
  return COLORS.teal;
}

function ScreenHeader({ title, subtitle, onBack, right, icon }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "4px 20px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Go back"
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              border: "none",
              background: COLORS.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={16} color={COLORS.ink} />
          </button>
        )}
        {icon}
        <div>
          <h1 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: COLORS.ink, letterSpacing: -0.3 }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: COLORS.slate }}>{subtitle}</p>
          )}
        </div>
      </div>
      {right}
    </div>
  );
}

/* ---------------------------------------------------------
   VITALS RING -- signature visual element
--------------------------------------------------------- */

function VitalRing({ value, max, size = 64, stroke = 7, color, label, sublabel }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, value / max);
  const offset = circumference * (1 - pct);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={COLORS.line} strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            color: COLORS.ink,
          }}
        >
          {label}
        </div>
      </div>
      {sublabel && <span style={{ fontSize: 11, color: COLORS.slate, textAlign: "center" }}>{sublabel}</span>}
    </div>
  );
}

/* ---------------------------------------------------------
   MINI LINE CHART (no deps, pure SVG)
--------------------------------------------------------- */

function MiniLineChart({ data, dataKey, color = COLORS.teal, height = 90 }) {
  const values = data.map((d) => d[dataKey]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 280;
  const pad = 10;
  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (d[dataKey] - min) / range) * (height - pad * 2);
    return [x, y];
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={3} fill={COLORS.white} stroke={color} strokeWidth={2} />
      ))}
    </svg>
  );
}

/* ---------------------------------------------------------
   FORM PRIMITIVES
--------------------------------------------------------- */

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: COLORS.ink, marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  fontSize: 14,
  border: `1.3px solid ${COLORS.line}`,
  borderRadius: 10,
  outline: "none",
  background: COLORS.white,
  color: COLORS.ink,
  boxSizing: "border-box",
  fontFamily: "inherit",
};

function TextInput(props) {
  return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />;
}

function Select(props) {
  return (
    <select {...props} style={{ ...inputStyle, ...(props.style || {}), appearance: "none" }}>
      {props.children}
    </select>
  );
}

function PrimaryButton({ children, onClick, disabled, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "13px 16px",
        background: disabled ? COLORS.line : COLORS.ink,
        color: disabled ? COLORS.slate : COLORS.white,
        border: "none",
        borderRadius: 12,
        fontSize: 14.5,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "13px 16px",
        background: COLORS.white,
        color: COLORS.ink,
        border: `1.3px solid ${COLORS.line}`,
        borderRadius: 12,
        fontSize: 14.5,
        fontWeight: 600,
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      aria-label="Toggle"
      style={{
        width: 44,
        height: 26,
        borderRadius: 14,
        border: "none",
        background: checked ? COLORS.teal : COLORS.line,
        position: "relative",
        cursor: "pointer",
        padding: 0,
        flexShrink: 0,
        transition: "background 0.15s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 21 : 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: COLORS.white,
          transition: "left 0.15s",
        }}
      />
    </button>
  );
}

function Card({ children, style, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: COLORS.white,
        borderRadius: 14,
        padding: 14,
        border: `1px solid ${COLORS.line}`,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------
   HOSPITAL ICON -- consistent badge wherever a hospital is shown
--------------------------------------------------------- */

const LOGO_ICON_SRC = "data:image/png;base64,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";

function Logo({ size = 28, withWordmark = false, wordmarkSize = 15 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <img
        src={LOGO_ICON_SRC}
        alt="Carelynk logo"
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          flexShrink: 0,
        }}
      />
      {withWordmark && (
        <span style={{ fontSize: wordmarkSize, fontWeight: 800, color: COLORS.ink, letterSpacing: -0.2 }}>
          Carelynk
        </span>
      )}
    </div>
  );
}

function HospitalIcon({ size = 38, iconSize = 17, tint = "teal" }) {
  const bg = tint === "coral" ? COLORS.coralSoft : COLORS.tealSoft;
  const fg = tint === "coral" ? COLORS.coral : COLORS.teal;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size >= 34 ? 10 : "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Building2 size={iconSize} color={fg} />
    </div>
  );
}

function Toast({ message, onClose }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 2200);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 90,
        left: 20,
        right: 20,
        background: COLORS.ink,
        color: COLORS.white,
        padding: "12px 16px",
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: 8,
        zIndex: 50,
        boxShadow: "0 8px 24px rgba(11,61,58,0.25)",
      }}
    >
      <Check size={16} />
      {message}
    </div>
  );
}

/* ---------------------------------------------------------
   REMINDER NOTIFICATION -- lock-screen style alert banner
   Distinct from Toast: stays until dismissed, carries actions
--------------------------------------------------------- */

function ReminderNotification({ reminder, onTaken, onSnooze, onDismiss }) {
  return (
    <div
      role="alert"
      style={{
        position: "absolute",
        top: 54,
        left: 12,
        right: 12,
        background: "rgba(11,61,58,0.97)",
        backdropFilter: "blur(6px)",
        color: COLORS.white,
        borderRadius: 16,
        padding: "14px 14px 12px",
        zIndex: 60,
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        animation: "slideDown 0.25s ease-out",
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <AlarmClock size={17} color={COLORS.white} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#9FD9C7" }}>Medicine reminder</p>
            <button
              onClick={onDismiss}
              aria-label="Dismiss notification"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "rgba(255,255,255,0.6)" }}
            >
              <X size={14} />
            </button>
          </div>
          <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: COLORS.white }}>{reminder.name}</p>
          <p style={{ margin: "1px 0 0", fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
            {reminder.dosage} · due {reminder.time}
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              onClick={onSnooze}
              style={{
                flex: 1,
                padding: "8px 0",
                fontSize: 12.5,
                fontWeight: 600,
                borderRadius: 9,
                border: "1px solid rgba(255,255,255,0.25)",
                background: "transparent",
                color: COLORS.white,
                cursor: "pointer",
              }}
            >
              Snooze 10 min
            </button>
            <button
              onClick={onTaken}
              style={{
                flex: 1,
                padding: "8px 0",
                fontSize: 12.5,
                fontWeight: 700,
                borderRadius: 9,
                border: "none",
                background: COLORS.white,
                color: COLORS.ink,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <Check size={13} /> Mark taken
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   AUTH FLOW: SPLASH SCREEN
--------------------------------------------------------- */

function SplashScreen({ onContinue }) {
  useEffect(() => {
    const t = setTimeout(onContinue, 1600);
    return () => clearTimeout(t);
  }, [onContinue]);

  return (
    <div
      onClick={onContinue}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100%",
        gap: 14,
        cursor: "pointer",
      }}
    >
      <Logo size={64} />
      <div style={{ textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: COLORS.ink, letterSpacing: -0.3 }}>Carelynk</h1>
        <p style={{ margin: "4px 0 0", fontSize: 12.5, color: COLORS.slate }}>Your health, our priority</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   AUTH FLOW: WELCOME / ONBOARDING
--------------------------------------------------------- */

function WelcomeScreen({ navigate }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", padding: "20px 24px 28px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
        <Logo size={72} />
        <p
          style={{
            margin: "10px 0 0",
            fontSize: 13,
            fontWeight: 700,
            color: COLORS.ink,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Carelynk Hospital
        </p>
      </div>
      <div
        style={{
          flex: 1,
          borderRadius: 20,
          background: COLORS.tealSoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <Building2 size={56} color={COLORS.teal} strokeWidth={1.5} />
      </div>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: COLORS.ink, letterSpacing: -0.4, lineHeight: 1.25 }}>
        Better care starts here
      </h1>
      <p style={{ margin: "8px 0 28px", fontSize: 13.5, color: COLORS.slate, lineHeight: 1.5 }}>
        Book appointments, track your vitals, and set medicine reminders, all in one place.
      </p>
      <PrimaryButton onClick={() => navigate("signup")} style={{ marginBottom: 10 }}>
        Get started
      </PrimaryButton>
      <SecondaryButton onClick={() => navigate("login")}>Log in</SecondaryButton>
    </div>
  );
}

/* ---------------------------------------------------------
   AUTH FLOW: LOGIN
--------------------------------------------------------- */

function LoginScreen({ navigate, onLogin, accounts }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit() {
    const e = {};
    if (!email.trim()) e.email = "Enter your email";
    else if (!isValidEmail(email)) e.email = "Enter a valid email address";
    if (!password) e.password = "Enter your password";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const matched = accounts.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
      );
      if (!matched) {
        setErrors({ form: "That email and password don't match our records." });
        return;
      }
      onLogin(matched);
    }, 500);
  }

  return (
    <div style={{ padding: "12px 24px 24px", display: "flex", flexDirection: "column", height: "100%" }}>
      <button
        onClick={() => navigate("welcome")}
        aria-label="Go back"
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          border: "none",
          background: COLORS.white,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={16} color={COLORS.ink} />
      </button>

      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: COLORS.ink }}>Welcome back</h1>
      <p style={{ margin: "4px 0 24px", fontSize: 13, color: COLORS.slate }}>Log in to continue your health journey</p>

      <Field label="Email address">
        <TextInput
          type="email"
          placeholder="name@email.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErrors((er) => ({ ...er, email: undefined, form: undefined })); }}
          style={errors.email ? { borderColor: COLORS.coral } : {}}
        />
        {errors.email && <p style={{ margin: "4px 0 0", fontSize: 11, color: COLORS.coral }}>{errors.email}</p>}
      </Field>

      <Field label="Password">
        <div style={{ position: "relative" }}>
          <TextInput
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors((er) => ({ ...er, password: undefined, form: undefined })); }}
            style={{ paddingRight: 40, ...(errors.password ? { borderColor: COLORS.coral } : {}) }}
          />
          <button
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{ position: "absolute", right: 10, top: 9, background: "none", border: "none", cursor: "pointer", color: COLORS.slate, padding: 4 }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p style={{ margin: "4px 0 0", fontSize: 11, color: COLORS.coral }}>{errors.password}</p>}
      </Field>

      {errors.form && (
        <p style={{ margin: "0 0 10px", fontSize: 12, color: COLORS.coral, fontWeight: 600 }}>{errors.form}</p>
      )}

      <button
        style={{ alignSelf: "flex-end", background: "none", border: "none", color: COLORS.teal, fontSize: 12.5, fontWeight: 600, cursor: "pointer", marginBottom: 18, padding: 0 }}
      >
        Forgot password?
      </button>

      <PrimaryButton onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Logging in…" : "Log in"}
      </PrimaryButton>

      <p style={{ textAlign: "center", fontSize: 12.5, color: COLORS.slate, marginTop: 16 }}>
        Don't have an account?{" "}
        <button onClick={() => navigate("signup")} style={{ background: "none", border: "none", color: COLORS.teal, fontWeight: 700, cursor: "pointer", fontSize: 12.5, padding: 0 }}>
          Sign up
        </button>
      </p>

      <p style={{ textAlign: "center", fontSize: 11, color: COLORS.slate, marginTop: "auto" }}>
        Demo account: {SEED_ACCOUNT.email} / {SEED_ACCOUNT.password}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------
   AUTH FLOW: SIGN UP
--------------------------------------------------------- */

function SignupScreen({ navigate, onSignup, accountExists }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit() {
    const e = {};
    if (!form.name.trim()) e.name = "Enter your full name";
    if (!form.email.trim()) e.email = "Enter your email";
    else if (!isValidEmail(form.email)) e.email = "Enter a valid email address";
    else if (accountExists(form.email)) e.email = "An account with this email already exists";
    if (!form.password) e.password = "Create a password";
    else if (form.password.length < 6) e.password = "Use at least 6 characters";
    if (form.confirm !== form.password) e.confirm = "Passwords don't match";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSignup({ name: form.name.trim(), email: form.email.trim(), password: form.password });
    }, 500);
  }

  return (
    <div style={{ padding: "12px 24px 24px" }}>
      <button
        onClick={() => navigate("welcome")}
        aria-label="Go back"
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          border: "none",
          background: COLORS.white,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={16} color={COLORS.ink} />
      </button>

      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: COLORS.ink }}>Create your account</h1>
      <p style={{ margin: "4px 0 24px", fontSize: 13, color: COLORS.slate }}>Start tracking your health in minutes</p>

      <Field label="Full name">
        <TextInput
          placeholder="Your full name"
          value={form.name}
          onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors((er) => ({ ...er, name: undefined })); }}
          style={errors.name ? { borderColor: COLORS.coral } : {}}
        />
        {errors.name && <p style={{ margin: "4px 0 0", fontSize: 11, color: COLORS.coral }}>{errors.name}</p>}
      </Field>

      <Field label="Email address">
        <TextInput
          type="email"
          placeholder="name@email.com"
          value={form.email}
          onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors((er) => ({ ...er, email: undefined })); }}
          style={errors.email ? { borderColor: COLORS.coral } : {}}
        />
        {errors.email && <p style={{ margin: "4px 0 0", fontSize: 11, color: COLORS.coral }}>{errors.email}</p>}
      </Field>

      <Field label="Password">
        <div style={{ position: "relative" }}>
          <TextInput
            type={showPassword ? "text" : "password"}
            placeholder="At least 6 characters"
            value={form.password}
            onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors((er) => ({ ...er, password: undefined })); }}
            style={{ paddingRight: 40, ...(errors.password ? { borderColor: COLORS.coral } : {}) }}
          />
          <button
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{ position: "absolute", right: 10, top: 9, background: "none", border: "none", cursor: "pointer", color: COLORS.slate, padding: 4 }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p style={{ margin: "4px 0 0", fontSize: 11, color: COLORS.coral }}>{errors.password}</p>}
      </Field>

      <Field label="Confirm password">
        <TextInput
          type={showPassword ? "text" : "password"}
          placeholder="Re-enter your password"
          value={form.confirm}
          onChange={(e) => { setForm({ ...form, confirm: e.target.value }); setErrors((er) => ({ ...er, confirm: undefined })); }}
          style={errors.confirm ? { borderColor: COLORS.coral } : {}}
        />
        {errors.confirm && <p style={{ margin: "4px 0 0", fontSize: 11, color: COLORS.coral }}>{errors.confirm}</p>}
      </Field>

      <PrimaryButton onClick={handleSubmit} disabled={submitting} style={{ marginTop: 4 }}>
        {submitting ? "Creating account…" : "Create account"}
      </PrimaryButton>

      <p style={{ textAlign: "center", fontSize: 12.5, color: COLORS.slate, marginTop: 16 }}>
        Already have an account?{" "}
        <button onClick={() => navigate("login")} style={{ background: "none", border: "none", color: COLORS.teal, fontWeight: 700, cursor: "pointer", fontSize: 12.5, padding: 0 }}>
          Log in
        </button>
      </p>
    </div>
  );
}

/* ---------------------------------------------------------
   SCREEN: HOME / DASHBOARD
--------------------------------------------------------- */

function HomeScreen({ vitals, meds, appointments, navigate, dueCount, account, nowTime }) {
  const firstName = account ? account.name.split(" ")[0] : "there";
  const nextMed = meds.find((m) => !m.taken);

  const clock = nowTime || new Date();
  const hour = clock.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateLabel = clock.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  return (
    <div style={{ padding: "0 20px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={34} />
          <div>
            <p style={{ margin: 0, fontSize: 13, color: COLORS.slate }}>{greeting} · {dateLabel}</p>
            <h1 style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 800, color: COLORS.ink }}>Hello, {firstName}</h1>
          </div>
        </div>
        <button
          onClick={() => navigate("reminders")}
          aria-label={dueCount > 0 ? `${dueCount} reminders due` : "Notifications"}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            border: `1px solid ${COLORS.line}`,
            background: COLORS.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            cursor: "pointer",
          }}
        >
          <Bell size={17} color={COLORS.ink} />
          {dueCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                minWidth: 17,
                height: 17,
                borderRadius: 9,
                background: COLORS.coral,
                color: COLORS.white,
                fontSize: 10,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 3px",
              }}
            >
              {dueCount}
            </span>
          )}
        </button>
      </div>

      <Card style={{ background: COLORS.ink, border: "none", marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 12, color: "#9FD9C7", fontWeight: 600 }}>Today's vitals snapshot</p>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
          <VitalRing
            value={vitals.bloodPressure.systolic}
            max={160}
            color="#5DCAA5"
            label={`${vitals.bloodPressure.systolic}`}
            sublabel="BP sys"
          />
          <VitalRing value={vitals.heartRate.value} max={120} color="#5DCAA5" label={`${vitals.heartRate.value}`} sublabel="BPM" />
          <VitalRing value={vitals.weight.value} max={100} color="#5DCAA5" label={`${vitals.weight.value}`} sublabel="kg" />
          <VitalRing value={vitals.sleep.value} max={10} color="#5DCAA5" label={`${vitals.sleep.value}`} sublabel="hrs sleep" />
        </div>
      </Card>

      {nextMed && (
        <Card
          style={{ background: COLORS.coralSoft, border: "none", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}
          onClick={() => navigate("reminders")}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#F0997B33", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Pill size={18} color={COLORS.coral} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: "#712B13" }}>{nextMed.name}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#993C1D" }}>Due at {nextMed.time} · {nextMed.dosage}</p>
            </div>
          </div>
          <ChevronRight size={16} color={COLORS.coral} />
        </Card>
      )}

      {appointments.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: COLORS.ink }}>Upcoming appointment</p>
          <Card onClick={() => navigate("appointments")}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <HospitalIcon />
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLORS.ink }}>{appointments[0].doctor}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12.5, color: COLORS.slate }}>
                    {appointments[0].specialty} · {appointments[0].hospital}
                  </p>
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: COLORS.teal, fontWeight: 600 }}>
                    {appointments[0].date} · {appointments[0].time}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} color={COLORS.slate} style={{ flexShrink: 0 }} />
            </div>
          </Card>
        </div>
      )}

      <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: COLORS.ink }}>Quick actions</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { icon: Activity, label: "Log vitals", screen: "tracker" },
          { icon: Pill, label: "Add medicine", screen: "addMedicine" },
          { icon: Calendar, label: "Book appointment", screen: "findHospitals" },
          { icon: MapPin, label: "Find hospitals", screen: "findHospitals" },
        ].map(({ icon: Icon, label, screen }) => (
          <button
            key={label}
            onClick={() => navigate(screen)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 8,
              padding: 14,
              background: COLORS.white,
              border: `1px solid ${COLORS.line}`,
              borderRadius: 14,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <Icon size={18} color={COLORS.teal} />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.ink }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   SCREEN: HEALTH TRACKER (input form + live vitals)
--------------------------------------------------------- */

function TrackerScreen({ vitals, setVitals, navigate, showToast, addHistoryEntry }) {
  const [tab, setTab] = useState("log");
  const [form, setForm] = useState({ systolic: "", diastolic: "", weight: "", heartRate: "", sleep: "" });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (form.systolic && (form.systolic < 60 || form.systolic > 250)) e.systolic = "Enter a value between 60-250";
    if (form.diastolic && (form.diastolic < 40 || form.diastolic > 150)) e.diastolic = "Enter a value between 40-150";
    if (form.weight && (form.weight < 2 || form.weight > 300)) e.weight = "Enter a realistic weight in kg";
    if (form.heartRate && (form.heartRate < 30 || form.heartRate > 220)) e.heartRate = "Enter a value between 30-220";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const now = "Just now";
    setVitals((v) => {
      const next = { ...v };
      if (form.systolic && form.diastolic) {
        const status = form.systolic > 140 || form.diastolic > 90 ? "high" : "normal";
        next.bloodPressure = {
          systolic: Number(form.systolic),
          diastolic: Number(form.diastolic),
          status,
          lastLogged: now,
        };
        addHistoryEntry({ type: "vitals", title: "Blood pressure logged", detail: `${form.systolic}/${form.diastolic} mmHg · ${status}` });
      }
      if (form.weight) {
        next.weight = { value: Number(form.weight), unit: "kg", status: "normal", lastLogged: now };
        addHistoryEntry({ type: "vitals", title: "Weight logged", detail: `${form.weight} kg · normal` });
      }
      if (form.heartRate) {
        const status = form.heartRate > 100 ? "high" : "normal";
        next.heartRate = { value: Number(form.heartRate), unit: "bpm", status, lastLogged: now };
        addHistoryEntry({ type: "vitals", title: "Heart rate logged", detail: `${form.heartRate} bpm · ${status}` });
      }
      if (form.sleep) {
        next.sleep = { value: Number(form.sleep), unit: "hrs", status: "normal", lastLogged: now };
        addHistoryEntry({ type: "vitals", title: "Sleep logged", detail: `${form.sleep} hrs` });
      }
      return next;
    });
    setForm({ systolic: "", diastolic: "", weight: "", heartRate: "", sleep: "" });
    showToast("Vitals saved");
  }

  return (
    <div style={{ padding: "0 20px 24px" }}>
      <ScreenHeader title="Health tracker" subtitle="Record your symptoms and vitals" onBack={() => navigate("home")} />

      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: COLORS.white, borderRadius: 12, padding: 4, border: `1px solid ${COLORS.line}` }}>
        {[
          { id: "log", label: "Log vitals" },
          { id: "overview", label: "Overview" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: "8px 0",
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              background: tab === t.id ? COLORS.ink : "transparent",
              color: tab === t.id ? COLORS.white : COLORS.slate,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
            {[
              { icon: Heart, label: "Blood pressure", value: `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}`, unit: "mmHg", status: vitals.bloodPressure.status, logged: vitals.bloodPressure.lastLogged },
              { icon: Weight, label: "Weight", value: vitals.weight.value, unit: vitals.weight.unit, status: vitals.weight.status, logged: vitals.weight.lastLogged },
              { icon: Activity, label: "Heart rate", value: vitals.heartRate.value, unit: vitals.heartRate.unit, status: vitals.heartRate.status, logged: vitals.heartRate.lastLogged },
              { icon: Moon, label: "Sleep", value: vitals.sleep.value, unit: vitals.sleep.unit, status: vitals.sleep.status, logged: vitals.sleep.lastLogged },
            ].map((m) => (
              <Card key={m.label}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <m.icon size={16} color={statusColor(m.status)} />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 6,
                      background: m.status === "normal" ? COLORS.tealSoft : COLORS.coralSoft,
                      color: m.status === "normal" ? COLORS.teal : COLORS.coral,
                      textTransform: "capitalize",
                    }}
                  >
                    {m.status}
                  </span>
                </div>
                <p style={{ margin: "10px 0 0", fontSize: 18, fontWeight: 800, color: COLORS.ink }}>
                  {m.value} <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.slate }}>{m.unit}</span>
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: COLORS.slate }}>{m.label}</p>
                <p style={{ margin: "4px 0 0", fontSize: 10, color: COLORS.slate }}>{m.logged}</p>
              </Card>
            ))}
          </div>

          <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: COLORS.ink }}>Blood pressure, last 6 days</p>
          <Card style={{ marginBottom: 16 }}>
            <MiniLineChart data={SEED_HISTORY.bloodPressure} dataKey="systolic" color={COLORS.teal} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              {SEED_HISTORY.bloodPressure.map((d) => (
                <span key={d.date} style={{ fontSize: 10, color: COLORS.slate }}>{d.date}</span>
              ))}
            </div>
          </Card>

          <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: COLORS.ink }}>Weight, last 6 days</p>
          <Card>
            <MiniLineChart data={SEED_HISTORY.weight} dataKey="value" color={COLORS.coral} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              {SEED_HISTORY.weight.map((d) => (
                <span key={d.date} style={{ fontSize: 10, color: COLORS.slate }}>{d.date}</span>
              ))}
            </div>
          </Card>
        </>
      )}

      {tab === "log" && (
        <Card>
          <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: COLORS.ink }}>
            Enter today's readings. Leave blank anything you didn't measure.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Systolic (mmHg)">
              <TextInput
                type="number"
                placeholder="120"
                value={form.systolic}
                onChange={(e) => setForm({ ...form, systolic: e.target.value })}
                style={errors.systolic ? { borderColor: COLORS.coral } : {}}
              />
              {errors.systolic && <p style={{ margin: "4px 0 0", fontSize: 11, color: COLORS.coral }}>{errors.systolic}</p>}
            </Field>
            <Field label="Diastolic (mmHg)">
              <TextInput
                type="number"
                placeholder="80"
                value={form.diastolic}
                onChange={(e) => setForm({ ...form, diastolic: e.target.value })}
                style={errors.diastolic ? { borderColor: COLORS.coral } : {}}
              />
              {errors.diastolic && <p style={{ margin: "4px 0 0", fontSize: 11, color: COLORS.coral }}>{errors.diastolic}</p>}
            </Field>
          </div>

          <Field label="Weight (kg)">
            <TextInput
              type="number"
              placeholder="70"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              style={errors.weight ? { borderColor: COLORS.coral } : {}}
            />
            {errors.weight && <p style={{ margin: "4px 0 0", fontSize: 11, color: COLORS.coral }}>{errors.weight}</p>}
          </Field>

          <Field label="Heart rate (bpm)">
            <TextInput
              type="number"
              placeholder="72"
              value={form.heartRate}
              onChange={(e) => setForm({ ...form, heartRate: e.target.value })}
              style={errors.heartRate ? { borderColor: COLORS.coral } : {}}
            />
            {errors.heartRate && <p style={{ margin: "4px 0 0", fontSize: 11, color: COLORS.coral }}>{errors.heartRate}</p>}
          </Field>

          <Field label="Sleep (hours)">
            <TextInput
              type="number"
              step="0.1"
              placeholder="7.5"
              value={form.sleep}
              onChange={(e) => setForm({ ...form, sleep: e.target.value })}
            />
          </Field>

          <PrimaryButton onClick={handleSave} style={{ marginTop: 4 }}>
            Save readings
          </PrimaryButton>
        </Card>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   SCREEN: SYMPTOM / NOTES LOG
--------------------------------------------------------- */

function NotesScreen({ notes, setNotes, navigate, showToast, addHistoryEntry }) {
  const [text, setText] = useState("");

  function handleAdd() {
    if (!text.trim()) return;
    const today = new Date();
    const formatted = today.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    setNotes((n) => [{ id: `n${Date.now()}`, date: formatted, text: text.trim() }, ...n]);
    addHistoryEntry({ type: "note", title: "Symptom note added", detail: text.trim() });
    setText("");
    showToast("Note added");
  }

  return (
    <div style={{ padding: "0 20px 24px" }}>
      <ScreenHeader title="Symptoms and notes" subtitle="Track how you're feeling day to day" onBack={() => navigate("home")} />

      <Card style={{ marginBottom: 16 }}>
        <Field label="Add a note">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe how you're feeling today"
            rows={3}
            style={{ ...inputStyle, resize: "none" }}
          />
        </Field>
        <PrimaryButton onClick={handleAdd} disabled={!text.trim()}>
          Add note
        </PrimaryButton>
      </Card>

      <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: COLORS.ink }}>Recent notes</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {notes.map((n) => (
          <Card key={n.id}>
            <p style={{ margin: 0, fontSize: 11, color: COLORS.slate, fontWeight: 600 }}>{n.date}</p>
            <p style={{ margin: "4px 0 0", fontSize: 13.5, color: COLORS.ink, lineHeight: 1.5 }}>{n.text}</p>
          </Card>
        ))}
        {notes.length === 0 && (
          <p style={{ fontSize: 13, color: COLORS.slate, textAlign: "center", padding: "20px 0" }}>
            No notes yet. Add your first one above.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   SCREEN: MEDICINE REMINDERS (list + add form)
--------------------------------------------------------- */

function RemindersScreen({ meds, setMeds, navigate, showToast, addHistoryEntry, triggerReminderNow, currentTimeStr, startInAddMode }) {
  const [adding, setAdding] = useState(!!startInAddMode);
  const [form, setForm] = useState({ name: "", dosage: "1 tablet", time: "08:00", frequency: "Daily" });
  const [error, setError] = useState("");

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayIdx = 2;

  function toggleTaken(id) {
    setMeds((m) =>
      m.map((med) => {
        if (med.id !== id) return med;
        const nowTaken = !med.taken;
        if (nowTaken) {
          addHistoryEntry({
            type: "medicine",
            title: `${med.name} taken`,
            detail: `${med.dosage} · ${med.time} dose`,
          });
          showToast(`${med.name} marked as taken`);
        }
        return { ...med, taken: nowTaken };
      })
    );
  }

  function isOverdue(med) {
    if (med.taken) return false;
    return med.time <= currentTimeStr;
  }

  function handleSave() {
    if (!form.name.trim()) {
      setError("Enter a medicine name");
      return;
    }
    setMeds((m) => [...m, { id: `m${Date.now()}`, ...form, taken: false }]);
    setError("");
    setAdding(false);
    showToast("Reminder saved");
    addHistoryEntry({ type: "medicine", title: `${form.name} reminder created`, detail: `${form.dosage} · ${form.frequency} at ${form.time}` });
    setForm({ name: "", dosage: "1 tablet", time: "08:00", frequency: "Daily" });
  }

  if (adding) {
    return (
      <div style={{ padding: "0 20px 24px" }}>
        <ScreenHeader title="Add medicine" onBack={() => setAdding(false)} />
        <Card>
          <Field label="Medicine name">
            <TextInput
              placeholder="Paracetamol 500mg"
              value={form.name}
              onChange={(e) => { setForm({ ...form, name: e.target.value }); setError(""); }}
              style={error ? { borderColor: COLORS.coral } : {}}
            />
            {error && <p style={{ margin: "4px 0 0", fontSize: 11, color: COLORS.coral }}>{error}</p>}
          </Field>
          <Field label="Dosage">
            <TextInput
              placeholder="1 tablet"
              value={form.dosage}
              onChange={(e) => setForm({ ...form, dosage: e.target.value })}
            />
          </Field>
          <Field label="Time">
            <TextInput
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
          </Field>
          <Field label="Frequency">
            <Select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
              <option>Daily</option>
              <option>Twice daily</option>
              <option>Weekly</option>
              <option>As needed</option>
            </Select>
          </Field>
          <PrimaryButton onClick={handleSave}>Save reminder</PrimaryButton>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 20px 24px" }}>
      <ScreenHeader title="Medicine reminders" subtitle="Never miss a dose" onBack={() => navigate("home")} />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {days.map((d, i) => (
            <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: COLORS.slate }}>{d}</span>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: i === todayIdx ? COLORS.ink : "transparent",
                  color: i === todayIdx ? COLORS.white : COLORS.ink,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {20 + i}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {meds.map((med) => {
          const overdue = isOverdue(med);
          return (
            <Card
              key={med.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderColor: overdue ? COLORS.coral : COLORS.line,
                background: overdue ? COLORS.coralSoft : COLORS.white,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: med.taken ? COLORS.tealSoft : overdue ? "#F0997B33" : "#F4F1E8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Pill size={17} color={med.taken ? COLORS.teal : overdue ? COLORS.coral : COLORS.slate} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: COLORS.ink }}>{med.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: overdue ? COLORS.coral : COLORS.slate, fontWeight: overdue ? 700 : 400 }}>
                    {med.dosage} · {med.time} · {med.frequency} {overdue && "· due now"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleTaken(med.id)}
                aria-label={med.taken ? "Mark as not taken" : "Mark as taken"}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  border: `1.5px solid ${med.taken ? COLORS.teal : COLORS.line}`,
                  background: med.taken ? COLORS.teal : COLORS.white,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {med.taken && <Check size={15} color={COLORS.white} />}
              </button>
            </Card>
          );
        })}
      </div>

      <PrimaryButton onClick={() => setAdding(true)}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Plus size={16} /> Add medicine
        </span>
      </PrimaryButton>

      <button
        onClick={triggerReminderNow}
        style={{
          width: "100%",
          marginTop: 10,
          padding: "11px 0",
          background: "none",
          border: "none",
          color: COLORS.teal,
          fontSize: 12.5,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <AlarmClock size={14} /> Simulate next reminder notification
      </button>
    </div>
  );
}

/* ---------------------------------------------------------
   SCREEN: APPOINTMENTS / FIND HOSPITALS / BOOK
--------------------------------------------------------- */

function FindHospitalsScreen({ navigate, setSelectedHospital }) {
  const [query, setQuery] = useState("");
  const filtered = SEED_HOSPITALS.filter((h) => h.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div style={{ padding: "0 20px 24px" }}>
      <ScreenHeader title="Find hospitals" onBack={() => navigate("home")} />
      <div style={{ position: "relative", marginBottom: 16 }}>
        <Search size={15} color={COLORS.slate} style={{ position: "absolute", left: 12, top: 12 }} />
        <TextInput
          placeholder="Search hospital or location"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ paddingLeft: 34 }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((h) => (
          <Card key={h.id} onClick={() => { setSelectedHospital(h); navigate("hospitalDetails"); }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <HospitalIcon />
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLORS.ink }}>{h.name}</p>
                  <p style={{ margin: "2px 0 6px", fontSize: 12, color: COLORS.slate }}>{h.address}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Star size={12} color={COLORS.coral} fill={COLORS.coral} />
                    <span style={{ fontSize: 12, color: COLORS.ink, fontWeight: 600 }}>{h.rating}</span>
                    <span style={{ fontSize: 12, color: COLORS.slate }}>· {h.distance}</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={16} color={COLORS.slate} style={{ flexShrink: 0 }} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function HospitalDetailsScreen({ hospital, navigate }) {
  if (!hospital) return <FindHospitalsScreen navigate={navigate} setSelectedHospital={() => {}} />;
  return (
    <div style={{ padding: "0 20px 24px" }}>
      <ScreenHeader title={hospital.name} onBack={() => navigate("findHospitals")} icon={<HospitalIcon size={32} iconSize={15} />} />
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <Star size={14} color={COLORS.coral} fill={COLORS.coral} />
          <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink }}>{hospital.rating}</span>
          <span style={{ fontSize: 12, color: COLORS.slate }}>(320 reviews)</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: COLORS.slate }}>{hospital.address}</p>
      </Card>
      <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: COLORS.ink }}>Departments</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {["Cardiology", "Pediatrics", "General medicine", "Orthopedics", "Neurology"].map((d) => (
          <span
            key={d}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              background: COLORS.tealSoft,
              color: COLORS.teal,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {d}
          </span>
        ))}
      </div>
      <PrimaryButton onClick={() => navigate("bookAppointment")}>Book appointment</PrimaryButton>
      <div style={{ height: 10 }} />
      <SecondaryButton onClick={() => {}}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Phone size={14} /> Call hospital
        </span>
      </SecondaryButton>
    </div>
  );
}

function BookAppointmentScreen({ hospital, appointments, setAppointments, navigate, showToast, addHistoryEntry }) {
  const [form, setForm] = useState({ department: "Cardiology", doctor: "Dr. Adeyemi Lawal", date: "", time: "10:00" });
  const [error, setError] = useState("");

  function handleConfirm() {
    if (!form.date) {
      setError("Choose a date for your appointment");
      return;
    }
    const formattedDate = new Date(form.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const hospitalName = hospital ? hospital.name : "St. Nicholas Hospital";
    setAppointments((a) => [
      {
        id: `a${Date.now()}`,
        doctor: form.doctor,
        specialty: form.department,
        hospital: hospitalName,
        date: formattedDate,
        time: form.time,
      },
      ...a,
    ]);
    addHistoryEntry({
      type: "appointment",
      title: `Appointment with ${form.doctor}`,
      detail: `${form.department} · ${hospitalName}`,
      date: formattedDate,
      time: form.time,
    });
    showToast("Appointment confirmed");
    navigate("home");
  }

  return (
    <div style={{ padding: "0 20px 24px" }}>
      <ScreenHeader title="Book appointment" subtitle={hospital ? hospital.name : "St. Nicholas Hospital"} onBack={() => navigate("hospitalDetails")} icon={<HospitalIcon size={32} iconSize={15} />} />
      <Card>
        <Field label="Department">
          <Select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
            <option>Cardiology</option>
            <option>Pediatrics</option>
            <option>General medicine</option>
            <option>Orthopedics</option>
            <option>Neurology</option>
          </Select>
        </Field>
        <Field label="Doctor">
          <Select value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })}>
            <option>Dr. Adeyemi Lawal</option>
            <option>Dr. Folasade Bello</option>
            <option>Dr. Chidi Okafor</option>
          </Select>
        </Field>
        <Field label="Date">
          <TextInput
            type="date"
            value={form.date}
            onChange={(e) => { setForm({ ...form, date: e.target.value }); setError(""); }}
            style={error ? { borderColor: COLORS.coral } : {}}
          />
          {error && <p style={{ margin: "4px 0 0", fontSize: 11, color: COLORS.coral }}>{error}</p>}
        </Field>
        <Field label="Time">
          <TextInput type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
        </Field>
        <PrimaryButton onClick={handleConfirm}>Confirm booking</PrimaryButton>
      </Card>
    </div>
  );
}

function AppointmentsScreen({ appointments, navigate }) {
  return (
    <div style={{ padding: "0 20px 24px" }}>
      <ScreenHeader title="Appointments" onBack={() => navigate("home")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {appointments.map((a) => (
          <Card key={a.id} style={{ display: "flex", gap: 12 }}>
            <HospitalIcon />
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLORS.ink }}>{a.doctor}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12.5, color: COLORS.slate }}>{a.specialty} · {a.hospital}</p>
              <p style={{ margin: "8px 0 0", fontSize: 12.5, color: COLORS.teal, fontWeight: 700 }}>{a.date} · {a.time}</p>
            </div>
          </Card>
        ))}
        {appointments.length === 0 && (
          <p style={{ fontSize: 13, color: COLORS.slate, textAlign: "center", padding: "20px 0" }}>
            No appointments yet.
          </p>
        )}
      </div>
      <PrimaryButton onClick={() => navigate("findHospitals")}>Book new appointment</PrimaryButton>
    </div>
  );
}

/* ---------------------------------------------------------
   SCREEN: PARENT / GUARDIAN DASHBOARD
--------------------------------------------------------- */

function ParentDashboardScreen({ children, navigate, setSelectedChild }) {
  return (
    <div style={{ padding: "0 20px 24px" }}>
      <ScreenHeader title="Welcome, parent" onBack={() => navigate("home")} />
      <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: COLORS.ink }}>Children</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
        {children.map((c) => (
          <Card
            key={c.id}
            onClick={() => { setSelectedChild(c); navigate("childProfile"); }}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: COLORS.tealSoft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  color: COLORS.teal,
                  fontSize: 14,
                }}
              >
                {c.name[0]}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLORS.ink }}>{c.name}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.slate, display: "flex", alignItems: "center", gap: 4 }}>
                  Age {c.age} <Building2 size={11} color={COLORS.slate} style={{ marginLeft: 2 }} /> {c.hospital}
                </p>
              </div>
            </div>
            <ChevronRight size={16} color={COLORS.slate} />
          </Card>
        ))}
      </div>
      <SecondaryButton onClick={() => navigate("assignHospital")}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Plus size={15} /> Add child
        </span>
      </SecondaryButton>
    </div>
  );
}

function ChildProfileScreen({ child, navigate }) {
  if (!child) return null;
  return (
    <div style={{ padding: "0 20px 24px" }}>
      <ScreenHeader title="Child profile" onBack={() => navigate("parentDashboard")} />
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: COLORS.tealSoft,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            color: COLORS.teal,
            fontSize: 22,
            margin: "0 auto 10px",
          }}
        >
          {child.name[0]}
        </div>
        <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: COLORS.ink }}>{child.name}</p>
        <p style={{ margin: "2px 0 0", fontSize: 12.5, color: COLORS.slate }}>Age {child.age}</p>
      </div>
      <Card style={{ marginBottom: 12, display: "flex", gap: 12, alignItems: "center" }}>
        <HospitalIcon />
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: COLORS.ink }}>{child.hospital}</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.slate }}>Assigned hospital</p>
        </div>
      </Card>
      <Card style={{ marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: COLORS.ink }}>Health summary</p>
        <p style={{ margin: "4px 0 0", fontSize: 12.5, color: COLORS.slate }}>No active conditions</p>
      </Card>
      <Card style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: COLORS.ink }}>Vaccination records</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.slate }}>Up to date</p>
        </div>
        <ChevronRight size={16} color={COLORS.slate} />
      </Card>
      <PrimaryButton onClick={() => navigate("findHospitals")}>Book appointment</PrimaryButton>
    </div>
  );
}

/* ---------------------------------------------------------
   SCREEN: RECORDS -- real history feed
--------------------------------------------------------- */

const HISTORY_ICONS = { Activity, FileText, Stethoscope, Pill };

function historyMeta(type) {
  return HISTORY_TYPE_META[type] || { label: "Entry", icon: "FileText", color: "teal" };
}

function HistoryRow({ entry }) {
  const meta = historyMeta(entry.type);
  const Icon = HISTORY_ICONS[meta.icon] || FileText;
  const tint = meta.color === "coral" ? COLORS.coral : COLORS.teal;
  const tintSoft = meta.color === "coral" ? COLORS.coralSoft : COLORS.tealSoft;
  return (
    <Card style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: tintSoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={16} color={tint} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: COLORS.ink }}>{entry.title}</p>
          <span style={{ fontSize: 10.5, color: COLORS.slate, flexShrink: 0, whiteSpace: "nowrap" }}>{entry.time}</span>
        </div>
        <p style={{ margin: "3px 0 0", fontSize: 12, color: COLORS.slate, lineHeight: 1.45 }}>{entry.detail}</p>
        <p style={{ margin: "4px 0 0", fontSize: 10.5, color: COLORS.slate, fontWeight: 600 }}>{entry.date}</p>
      </div>
    </Card>
  );
}

function RecordsScreen({ history, navigate }) {
  const [filter, setFilter] = useState("all");

  const filters = [
    { id: "all", label: "All" },
    { id: "vitals", label: "Vitals" },
    { id: "appointment", label: "Appointments" },
    { id: "note", label: "Notes" },
    { id: "medicine", label: "Medicine" },
  ];

  const sorted = useMemo(() => [...history].sort((a, b) => b.ts - a.ts), [history]);
  const filtered = filter === "all" ? sorted : sorted.filter((e) => e.type === filter);

  const counts = useMemo(() => {
    const c = { vitals: 0, appointment: 0, note: 0, medicine: 0 };
    history.forEach((e) => { if (c[e.type] !== undefined) c[e.type] += 1; });
    return c;
  }, [history]);

  return (
    <div style={{ padding: "0 20px 24px" }}>
      <ScreenHeader
        title="Health history"
        subtitle={`${history.length} record${history.length === 1 ? "" : "s"} logged`}
        right={
          <button
            onClick={() => navigate("shareRecords")}
            style={{
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 9,
              border: `1px solid ${COLORS.line}`,
              background: COLORS.white,
              color: COLORS.ink,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Share
          </button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        <Card style={{ textAlign: "center", padding: "10px 6px" }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: COLORS.ink }}>{counts.vitals}</p>
          <p style={{ margin: "2px 0 0", fontSize: 10.5, color: COLORS.slate }}>Vitals logged</p>
        </Card>
        <Card style={{ textAlign: "center", padding: "10px 6px" }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: COLORS.ink }}>{counts.appointment}</p>
          <p style={{ margin: "2px 0 0", fontSize: 10.5, color: COLORS.slate }}>Appointments</p>
        </Card>
        <Card style={{ textAlign: "center", padding: "10px 6px" }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: COLORS.ink }}>{counts.note}</p>
          <p style={{ margin: "2px 0 0", fontSize: 10.5, color: COLORS.slate }}>Notes</p>
        </Card>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 2 }}>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: "7px 13px",
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              background: filter === f.id ? COLORS.ink : COLORS.white,
              color: filter === f.id ? COLORS.white : COLORS.slate,
              boxShadow: filter === f.id ? "none" : `inset 0 0 0 1px ${COLORS.line}`,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((entry) => (
          <HistoryRow key={entry.id} entry={entry} />
        ))}
        {filtered.length === 0 && (
          <p style={{ fontSize: 13, color: COLORS.slate, textAlign: "center", padding: "30px 0" }}>
            No records in this category yet.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   SCREEN: SHARE RECORDS
--------------------------------------------------------- */

function ShareRecordsScreen({ navigate, showToast }) {
  const [selected, setSelected] = useState(["h1"]);
  function toggle(id) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }
  function handleShare() {
    showToast("Records shared securely");
    navigate("records");
  }
  return (
    <div style={{ padding: "0 20px 24px" }}>
      <ScreenHeader title="Share medical records" subtitle="Select hospital(s) to share your records" onBack={() => navigate("records")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {SEED_HOSPITALS.map((h) => (
          <Card key={h.id} onClick={() => toggle(h.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <HospitalIcon size={32} iconSize={15} />
              <div>
                <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: COLORS.ink }}>{h.name}</p>
                <p style={{ margin: "2px 0 0", fontSize: 11.5, color: COLORS.slate }}>{h.address}</p>
              </div>
            </div>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                border: `1.5px solid ${selected.includes(h.id) ? COLORS.teal : COLORS.line}`,
                background: selected.includes(h.id) ? COLORS.teal : COLORS.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {selected.includes(h.id) && <Check size={12} color={COLORS.white} />}
            </div>
          </Card>
        ))}
      </div>
      <PrimaryButton onClick={handleShare} disabled={selected.length === 0}>
        Share securely
      </PrimaryButton>
      <p style={{ textAlign: "center", fontSize: 11.5, color: COLORS.slate, marginTop: 10 }}>
        Your data is encrypted and safe with us
      </p>
    </div>
  );
}

/* ---------------------------------------------------------
   BOTTOM NAVIGATION
--------------------------------------------------------- */

function BottomNav({ active, navigate }) {
  const items = [
    { id: "home", icon: Home, label: "Home" },
    { id: "tracker", icon: Activity, label: "Tracker" },
    { id: "reminders", icon: Pill, label: "Reminders" },
    { id: "records", icon: Calendar, label: "Records" },
    { id: "profile", icon: User, label: "Profile" },
  ];
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 8px 14px",
        background: COLORS.white,
        borderTop: `1px solid ${COLORS.line}`,
      }}
    >
      {items.map(({ id, icon: Icon, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => navigate(id)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: isActive ? COLORS.teal : COLORS.slate,
              padding: "2px 6px",
            }}
          >
            <Icon size={19} strokeWidth={isActive ? 2.4 : 1.8} />
            <span style={{ fontSize: 10.5, fontWeight: isActive ? 700 : 500 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------
   PROFILE SCREEN (simple)
--------------------------------------------------------- */

function ProfileScreen({ navigate, account, onLogout }) {
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const rows = [
    { label: "Parent and guardian", screen: "parentDashboard" },
    { label: "Notes and symptoms", screen: "notes" },
    { label: "Appointments", screen: "appointments" },
  ];
  const initial = account ? account.name.trim()[0].toUpperCase() : "?";

  return (
    <div style={{ padding: "0 20px 24px" }}>
      <ScreenHeader title="Profile" />
      <Card style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            background: COLORS.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: COLORS.white,
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          {initial}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: COLORS.ink }}>{account ? account.name : "Guest"}</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.slate }}>{account ? account.email : ""}</p>
        </div>
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {rows.map((r) => (
          <Card key={r.label} onClick={() => navigate(r.screen)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.ink }}>{r.label}</span>
            <ChevronRight size={16} color={COLORS.slate} />
          </Card>
        ))}
      </div>

      {confirmingLogout ? (
        <Card style={{ background: COLORS.coralSoft, border: "none" }}>
          <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#712B13" }}>Log out of Carelynk?</p>
          <div style={{ display: "flex", gap: 8 }}>
            <SecondaryButton onClick={() => setConfirmingLogout(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={onLogout} style={{ background: COLORS.coral }}>
              Log out
            </PrimaryButton>
          </div>
        </Card>
      ) : (
        <button
          onClick={() => setConfirmingLogout(true)}
          style={{
            width: "100%",
            padding: "13px 16px",
            background: COLORS.white,
            color: COLORS.coral,
            border: `1.3px solid ${COLORS.line}`,
            borderRadius: 12,
            fontSize: 14.5,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <LogOut size={16} /> Log out
        </button>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   ROOT APP
--------------------------------------------------------- */

export default function HealthPlatform() {
  const { isMobile } = useViewport();
  const [screen, setScreen] = useState("splash");
  const [isAuthed, setIsAuthed] = useState(false);
  const [accounts, setAccounts] = useState([SEED_ACCOUNT]);
  const [account, setAccount] = useState(null);
  const [vitals, setVitals] = useState(SEED_VITALS);
  const [meds, setMeds] = useState(SEED_MEDS);
  const [appointments, setAppointments] = useState(SEED_APPOINTMENTS);
  const [notes, setNotes] = useState(SEED_NOTES);
  const [history, setHistory] = useState(SEED_HISTORY_LOG);
  const [selectedHospital, setSelectedHospital] = useState(SEED_HOSPITALS[0]);
  const [selectedChild, setSelectedChild] = useState(SEED_CHILDREN[0]);
  const [toast, setToast] = useState(null);
  const [activeNotification, setActiveNotification] = useState(null);
  const [notifiedIds, setNotifiedIds] = useState([]);
  const [nowTime, setNowTime] = useState(() => new Date());

  function showToast(message) {
    setToast(message);
  }

  function navigate(target) {
    setScreen(target);
  }

  function accountExists(email) {
    return accounts.some((a) => a.email.toLowerCase() === email.toLowerCase());
  }

  function handleLogin(matchedAccount) {
    setAccount(matchedAccount);
    setIsAuthed(true);
    setScreen("home");
  }

  function handleSignup(newAccount) {
    setAccounts((a) => [...a, newAccount]);
    setAccount(newAccount);
    setIsAuthed(true);
    setScreen("home");
    showToast("Account created");
  }

  function handleLogout() {
    setIsAuthed(false);
    setAccount(null);
    setScreen("welcome");
  }

  function addHistoryEntry({ type, title, detail, date, time }) {
    const now = new Date();
    setHistory((h) => [
      {
        id: `log${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        title,
        detail,
        date: date || now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        time: time || now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        ts: now.getTime(),
      },
      ...h,
    ]);
  }

  const currentTimeStr = useMemo(
    () => `${String(nowTime.getHours()).padStart(2, "0")}:${String(nowTime.getMinutes()).padStart(2, "0")}`,
    [nowTime]
  );

  const dueMeds = useMemo(() => meds.filter((m) => !m.taken && m.time <= currentTimeStr), [meds, currentTimeStr]);

  // Tick every 20s to re-check which reminders have become due. This is a real
  // comparison against each med's scheduled time, not a cosmetic animation.
  useEffect(() => {
    const interval = setInterval(() => setNowTime(new Date()), 20000);
    return () => clearInterval(interval);
  }, []);

  // Surface a notification banner the first time a med becomes due.
  useEffect(() => {
    if (!isAuthed || activeNotification) return;
    const candidate = dueMeds.find((m) => !notifiedIds.includes(m.id));
    if (candidate) {
      setActiveNotification(candidate);
      setNotifiedIds((ids) => [...ids, candidate.id]);
    }
  }, [isAuthed, dueMeds, notifiedIds, activeNotification]);

  function triggerReminderNow() {
    const candidate = meds.find((m) => !m.taken);
    if (!candidate) {
      showToast("No pending reminders to simulate");
      return;
    }
    setActiveNotification(candidate);
  }

  function handleNotificationTaken() {
    if (!activeNotification) return;
    const med = activeNotification;
    setMeds((m) => m.map((x) => (x.id === med.id ? { ...x, taken: true } : x)));
    addHistoryEntry({ type: "medicine", title: `${med.name} taken`, detail: `${med.dosage} · ${med.time} dose` });
    setActiveNotification(null);
    showToast(`${med.name} marked as taken`);
  }

  function handleNotificationSnooze() {
    if (!activeNotification) return;
    setNotifiedIds((ids) => ids.filter((id) => id !== activeNotification.id));
    setActiveNotification(null);
    showToast("Reminder snoozed for 10 minutes");
  }

  function handleNotificationDismiss() {
    setActiveNotification(null);
  }

  const tabForScreen = useMemo(() => {
    if (["home"].includes(screen)) return "home";
    if (["tracker", "notes"].includes(screen)) return "tracker";
    if (["reminders", "addMedicine"].includes(screen)) return "reminders";
    if (["records", "shareRecords", "appointments", "findHospitals", "hospitalDetails", "bookAppointment"].includes(screen)) return "records";
    if (["profile", "parentDashboard", "childProfile", "assignHospital"].includes(screen)) return "profile";
    return "home";
  }, [screen]);

  let body;
  if (!isAuthed) {
    switch (screen) {
      case "welcome":
        body = <WelcomeScreen navigate={navigate} />;
        break;
      case "login":
        body = <LoginScreen navigate={navigate} onLogin={handleLogin} accounts={accounts} />;
        break;
      case "signup":
        body = <SignupScreen navigate={navigate} onSignup={handleSignup} accountExists={accountExists} />;
        break;
      case "splash":
      default:
        body = <SplashScreen onContinue={() => navigate("welcome")} />;
    }
  } else {
    switch (screen) {
      case "home":
        body = <HomeScreen vitals={vitals} meds={meds} appointments={appointments} navigate={navigate} dueCount={dueMeds.length} account={account} nowTime={nowTime} />;
        break;
      case "tracker":
        body = <TrackerScreen vitals={vitals} setVitals={setVitals} navigate={navigate} showToast={showToast} addHistoryEntry={addHistoryEntry} />;
        break;
      case "notes":
        body = <NotesScreen notes={notes} setNotes={setNotes} navigate={navigate} showToast={showToast} addHistoryEntry={addHistoryEntry} />;
        break;
      case "reminders":
        body = (
          <RemindersScreen
            meds={meds}
            setMeds={setMeds}
            navigate={navigate}
            showToast={showToast}
            addHistoryEntry={addHistoryEntry}
            triggerReminderNow={triggerReminderNow}
            currentTimeStr={currentTimeStr}
          />
        );
        break;
      case "addMedicine":
        body = (
          <RemindersScreen
            meds={meds}
            setMeds={setMeds}
            navigate={navigate}
            showToast={showToast}
            addHistoryEntry={addHistoryEntry}
            triggerReminderNow={triggerReminderNow}
            currentTimeStr={currentTimeStr}
            startInAddMode
          />
        );
        break;
      case "appointments":
        body = <AppointmentsScreen appointments={appointments} navigate={navigate} />;
        break;
      case "findHospitals":
        body = <FindHospitalsScreen navigate={navigate} setSelectedHospital={setSelectedHospital} />;
        break;
      case "hospitalDetails":
        body = <HospitalDetailsScreen hospital={selectedHospital} navigate={navigate} />;
        break;
      case "bookAppointment":
        body = (
          <BookAppointmentScreen
            hospital={selectedHospital}
            appointments={appointments}
            setAppointments={setAppointments}
            navigate={navigate}
            showToast={showToast}
            addHistoryEntry={addHistoryEntry}
          />
        );
        break;
      case "records":
        body = <RecordsScreen history={history} navigate={navigate} />;
        break;
      case "shareRecords":
        body = <ShareRecordsScreen navigate={navigate} showToast={showToast} />;
        break;
      case "parentDashboard":
        body = <ParentDashboardScreen children={SEED_CHILDREN} navigate={navigate} setSelectedChild={setSelectedChild} />;
        break;
      case "childProfile":
        body = <ChildProfileScreen child={selectedChild} navigate={navigate} />;
        break;
      case "profile":
        body = <ProfileScreen navigate={navigate} account={account} onLogout={handleLogout} />;
        break;
      default:
        body = <HomeScreen vitals={vitals} meds={meds} appointments={appointments} navigate={navigate} dueCount={dueMeds.length} account={account} nowTime={nowTime} />;
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: isMobile ? "stretch" : "flex-start",
        padding: isMobile ? 0 : "32px 16px",
        background: isMobile ? COLORS.paper : "#EFEDE3",
        minHeight: "100dvh",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <style>{"@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } } * { box-sizing: border-box; }"}</style>
      <div
        style={{
          width: "100%",
          maxWidth: isMobile ? "100%" : 420,
          background: COLORS.paper,
          borderRadius: isMobile ? 0 : 28,
          border: isMobile ? "none" : `1px solid ${COLORS.line}`,
          overflow: "hidden",
          position: "relative",
          boxShadow: isMobile ? "none" : "0 20px 50px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          height: isMobile ? "100dvh" : "min(844px, calc(100dvh - 64px))",
        }}
      >
        <div style={{ flex: 1, overflowY: "auto", paddingTop: 20, WebkitOverflowScrolling: "touch" }}>
          {body}
          <div style={{ height: 8 }} />
        </div>
        {isAuthed && <BottomNav active={tabForScreen} navigate={navigate} />}
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        {isAuthed && activeNotification && (
          <ReminderNotification
            reminder={activeNotification}
            onTaken={handleNotificationTaken}
            onSnooze={handleNotificationSnooze}
            onDismiss={handleNotificationDismiss}
          />
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, Mail, User, Lock, ArrowRight, CheckCircle, Loader2, ShieldAlert, Timer, Sparkles } from "lucide-react";
import { LoggedInUser, StoredUser } from "../types";
import {
  hashPassword, sanitizeText, sanitizeEmail, isValidEmail,
  validatePassword, recordFailedAttempt, checkRateLimit, clearRateLimit, saveSession,
} from "../services/security";

interface LoginPageProps {
  onLogin: (user: LoggedInUser) => void;
}

type AuthMode = "login" | "signup";

const USERS_STORE_KEY = "lumiere_users";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [lockoutMs, setLockoutMs] = useState<number>(0);
  const [lockoutTimer, setLockoutTimer] = useState<NodeJS.Timeout | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "#ef4444", "#f59e0b", "#10b981", "#a78bfa"];

  useEffect(() => {
    const rl = checkRateLimit();
    if (rl.locked && rl.remainingMs) {
      setLockoutMs(rl.remainingMs);
      startLockoutCountdown(rl.remainingMs);
    }
  }, []);

  useEffect(() => {
    return () => { if (lockoutTimer) clearInterval(lockoutTimer); };
  }, [lockoutTimer]);

  const startLockoutCountdown = (ms: number) => {
    let remaining = ms;
    const timer = setInterval(() => {
      remaining -= 1000;
      setLockoutMs(remaining);
      if (remaining <= 0) { clearInterval(timer); setLockoutMs(0); setError(""); }
    }, 1000);
    setLockoutTimer(timer);
  };

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 600); };
  const formatLockoutTime = (ms: number) => `${Math.floor(ms / 60000)}:${Math.floor((ms % 60000) / 1000).toString().padStart(2, "0")}`;

  const loadUsers = (): StoredUser[] => {
    try {
      const raw = localStorage.getItem(USERS_STORE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  };

  const saveUsers = (users: StoredUser[]) => localStorage.setItem(USERS_STORE_KEY, JSON.stringify(users));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const rl = checkRateLimit();
    if (rl.locked) { setError(`Too many attempts. Try again in ${formatLockoutTime(rl.remainingMs ?? 0)}`); triggerShake(); return; }

    const cleanEmail = sanitizeEmail(email);
    const cleanName = sanitizeText(name);

    if (!isValidEmail(cleanEmail)) { setError("Kripaya valid email daalein."); triggerShake(); return; }
    const pwError = validatePassword(password);
    if (pwError) { setError(pwError); triggerShake(); return; }

    if (mode === "signup") {
      if (!cleanName || cleanName.length < 2) { setError("Naam kam se kam 2 characters ka hona chahiye."); triggerShake(); return; }
      if (cleanName.length > 60) { setError("Naam bahut lamba hai."); triggerShake(); return; }
    }

    setLoading(true);
    await new Promise((res) => setTimeout(res, 800 + Math.random() * 400));

    try {
      const users = loadUsers();
      if (mode === "signup") {
        if (users.some((u) => u.email === cleanEmail)) {
          setError("Is email se account banana possible nahi. Dusra email try karein ya login karein.");
          triggerShake(); setLoading(false); return;
        }
        const hashed = await hashPassword(password);
        const storedUser: StoredUser = { name: cleanName, email: cleanEmail, hashedPassword: hashed, joinedAt: new Date().toISOString() };
        saveUsers([...users, storedUser]);
        const sessionUser: LoggedInUser = { name: cleanName, email: cleanEmail, joinedAt: storedUser.joinedAt };
        saveSession(sessionUser); clearRateLimit(); setLoading(false); onLogin(sessionUser);
      } else {
        const hashed = await hashPassword(password);
        const found = users.find((u) => u.email === cleanEmail && u.hashedPassword === hashed);
        if (!found) {
          const result = recordFailedAttempt();
          if (result.locked) {
            setError(`Bahut zyada galat attempts. Account 15 minute ke liye lock ho gaya.`);
            startLockoutCountdown(LOCKOUT_DURATION_MS);
          } else {
            const remaining = MAX_ATTEMPTS - (result.attempts ?? 0);
            setError(`Email ya password galat hai. ${remaining} attempt${remaining === 1 ? "" : "s"} bachee hain.`);
          }
          triggerShake(); setLoading(false); return;
        }
        const sessionUser: LoggedInUser = { name: found.name, email: found.email, joinedAt: found.joinedAt };
        saveSession(sessionUser); clearRateLimit(); setLoading(false); onLogin(sessionUser);
      }
    } catch (err) {
      console.error("[Auth] Unexpected error:", err);
      setError("Kuch gadbad ho gayi. Page reload karein.");
      triggerShake(); setLoading(false);
    }
  };

  const switchMode = () => { setMode((prev) => (prev === "login" ? "signup" : "login")); setError(""); setName(""); setEmail(""); setPassword(""); };
  const isLocked = lockoutMs > 0;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 30% 30%, #0d0b18 0%, #070611 60%, #0a0815 100%)" }}>

      {/* ── Animated orb background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full orb-1"
          style={{ background: "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-[-20%] right-[-5%] w-[500px] h-[500px] rounded-full orb-2"
          style={{ background: "radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full orb-3"
          style={{ background: "radial-gradient(circle, rgba(124,92,225,0.06) 0%, transparent 60%)", filter: "blur(100px)" }} />
        {/* Subtle vertical grid lines */}
        {[...Array(7)].map((_, i) => (
          <div key={i} className="absolute border-l border-white/[0.015]"
            style={{ left: `${10 + i * 13}%`, top: 0, bottom: 0 }} />
        ))}
      </div>

      {/* ── Main card ── */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Brand header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-10"
        >
          <motion.p
            initial={{ letterSpacing: "0.2em" }}
            animate={{ letterSpacing: "0.5em" }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-[9px] tracking-[0.5em] mb-3 uppercase"
            style={{ color: "rgba(201,169,110,0.55)" }}
          >
            Est. 2026
          </motion.p>

          {/* Brand name with shimmer */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "backOut" }}
            className="text-5xl font-bold tracking-[0.35em] mb-3 select-none"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            <span className="text-shimmer">LUMIÈRE</span>
          </motion.h1>

          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/40" />
            <Sparkles className="w-3 h-3 text-amber-400/40" />
            <p className="text-[9px] tracking-[0.45em] uppercase" style={{ color: "rgba(201,169,110,0.4)" }}>Studio</p>
            <Sparkles className="w-3 h-3 text-amber-400/40" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/40" />
          </div>
        </motion.div>

        {/* Glass card */}
        <motion.div
          animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.035)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(201,169,110,0.12)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Gold shimmer top line */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(201,169,110,0.8), rgba(232,213,163,1), rgba(201,169,110,0.8), transparent)" }} />

          <div className="p-8">
            {/* Tabs */}
            <div className="flex mb-8 relative border-b border-white/[0.05]">
              {[
                { mode: "login" as AuthMode, label: "Se connecter" },
                { mode: "signup" as AuthMode, label: "S'inscrire" },
              ].map(({ mode: m, label }) => (
                <button
                  key={m}
                  onClick={() => !isLocked && setMode(m)}
                  className={`flex-1 pb-3.5 text-[11px] font-medium tracking-[0.3em] uppercase transition-all cursor-pointer ${
                    mode === m ? "text-amber-400" : "text-white/25 hover:text-white/50"
                  }`}
                  id={`tab-${m}`}
                  disabled={isLocked}
                >
                  {label}
                </button>
              ))}
              <motion.div
                className="absolute bottom-0 h-px"
                animate={{ left: mode === "login" ? "0%" : "50%", width: "50%" }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                style={{ background: "linear-gradient(90deg, transparent, #c9a96e, transparent)" }}
              />
            </div>

            {/* Lockout banner */}
            <AnimatePresence>
              {isLocked && (
                <motion.div
                  key="lockout"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="mb-5 p-4 border border-red-500/20 bg-red-500/5 flex items-center gap-3"
                >
                  <Timer className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] text-red-400 font-medium uppercase tracking-wider">Account Temporarily Locked</p>
                    <p className="text-[10px] text-red-400/60 mt-0.5">
                      Try again in <strong>{formatLockoutTime(lockoutMs)}</strong>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
              {/* Name field (signup only) */}
              <AnimatePresence>
                {mode === "signup" && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-amber-400 transition-colors duration-300" />
                      <input
                        type="text"
                        placeholder="Aapka poora naam"
                        value={name}
                        onChange={(e) => setName(e.target.value.slice(0, 60))}
                        className="w-full text-white placeholder-white/20 text-sm pl-12 pr-4 py-4 outline-none transition-all"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "3px",
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                        id="input-name" autoComplete="name" maxLength={60} disabled={isLocked}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-amber-400 transition-colors duration-300" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.slice(0, 254))}
                  className="w-full text-white placeholder-white/20 text-sm pl-12 pr-4 py-4 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "3px",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  id="input-email" autoComplete="email" maxLength={254} disabled={isLocked}
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-amber-400 transition-colors duration-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "signup" ? "Password (8+ chars, 1 capital, 1 number)" : "Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value.slice(0, 128))}
                  className="w-full text-white placeholder-white/15 text-sm pl-12 pr-12 py-4 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "3px",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  id="input-password" autoComplete={mode === "login" ? "current-password" : "new-password"}
                  maxLength={128} disabled={isLocked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-amber-400 transition-colors cursor-pointer"
                  id="toggle-password-btn" tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength (signup only) */}
              <AnimatePresence>
                {mode === "signup" && password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5"
                  >
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          className="flex-1 h-0.5 rounded-full transition-all duration-300"
                          style={{ background: i <= passwordStrength ? strengthColors[passwordStrength] : "rgba(255,255,255,0.08)" }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: i <= passwordStrength ? 1 : 1 }}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] font-label tracking-widest" style={{ color: strengthColors[passwordStrength] || "rgba(255,255,255,0.3)" }}>
                      {passwordStrength > 0 ? strengthLabels[passwordStrength] : ""}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && !isLocked && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-2 p-3.5 border border-red-500/15 bg-red-500/5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-[11px] tracking-wide leading-relaxed">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading || isLocked}
                whileHover={!loading && !isLocked ? { scale: 1.01 } : {}}
                whileTap={!loading && !isLocked ? { scale: 0.99 } : {}}
                className="w-full py-4 text-[11px] font-semibold uppercase tracking-[0.3em] transition-all cursor-pointer flex items-center justify-center gap-3 group disabled:opacity-40 disabled:cursor-not-allowed btn-luxury"
                style={{
                  background: loading || isLocked
                    ? "rgba(201,169,110,0.25)"
                    : "linear-gradient(135deg, #c9a96e 0%, #a07840 100%)",
                  color: "#0f0f0f",
                  boxShadow: loading || isLocked ? "none" : "0 8px 40px rgba(201,169,110,0.3), 0 0 60px rgba(201,169,110,0.1)",
                  borderRadius: "3px",
                }}
                id="submit-auth-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying…</span>
                  </>
                ) : isLocked ? (
                  <>
                    <Timer className="w-4 h-4" />
                    <span>Locked — {formatLockoutTime(lockoutMs)}</span>
                  </>
                ) : (
                  <>
                    <span>{mode === "login" ? "Enter the Atelier" : "Join Lumière"}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Switch mode */}
            <p className="text-center text-[11px] text-white/25 mt-6">
              {mode === "login" ? "Naya account chahiye?" : "Pehle se account hai?"}{" "}
              <button
                onClick={switchMode}
                className="text-amber-400/70 hover:text-amber-400 underline underline-offset-2 cursor-pointer transition-colors"
                id="switch-mode-btn" disabled={isLocked}
              >
                {mode === "login" ? "Register karein" : "Login karein"}
              </button>
            </p>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-white/[0.05]">
              {["SSL Secure", "Encrypted", "Rate Limited"].map((label) => (
                <div key={label} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3" style={{ color: "rgba(201,169,110,0.35)" }} />
                  <span className="text-[9px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.15)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-[9px] mt-6 tracking-widest uppercase"
          style={{ color: "rgba(255,255,255,0.1)" }}
        >
          © 2026 Lumière Studio · Couture Excellence
        </motion.p>
      </motion.div>
    </div>
  );
}

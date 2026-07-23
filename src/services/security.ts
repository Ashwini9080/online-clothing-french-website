/**
 * SECURITY UTILITIES — Lumière Studio
 * 
 * Handles:
 * - SHA-256 password hashing (Web Crypto API — no plain text storage)
 * - Input sanitization (XSS prevention)
 * - Login rate limiting (brute force protection)
 * - Session expiry (24-hour auto logout)
 */

// ─── PASSWORD HASHING ───────────────────────────────────────────────────────

/**
 * Hashes a password using SHA-256 via the browser's Web Crypto API.
 * Passwords are NEVER stored as plain text.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "lumiere_salt_2026"); // static salt
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ─── INPUT SANITIZATION ─────────────────────────────────────────────────────

/**
 * Strips HTML tags and dangerous characters from user input (XSS prevention).
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .replace(/\\/g, "&#x5C;")
    .trim()
    .slice(0, 100); // max 100 chars
}

/**
 * Sanitizes and normalizes an email address.
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().slice(0, 254); // RFC 5321 max email length
}

/**
 * Validates email format strictly.
 */
export function isValidEmail(email: string): boolean {
  // RFC 5322-ish regex — strict enough for our needs
  const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  return re.test(email) && email.length <= 254;
}

/**
 * Validates password strength.
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8)
    return "Password kam se kam 8 characters ka hona chahiye.";
  if (password.length > 128)
    return "Password bahut lamba hai (max 128 characters).";
  if (!/[A-Z]/.test(password))
    return "Password mein kam se kam 1 capital letter honi chahiye.";
  if (!/[0-9]/.test(password))
    return "Password mein kam se kam 1 number hona chahiye.";
  return null; // valid
}

// ─── RATE LIMITING ──────────────────────────────────────────────────────────

const RATE_LIMIT_KEY = "lumiere_login_attempts";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface RateLimitRecord {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil?: number;
}

/**
 * Records a failed login attempt and returns whether the user is now locked out.
 * Returns { locked: true, remainingMs } if locked, { locked: false, attempts } if not.
 */
export function recordFailedAttempt(): { locked: boolean; remainingMs?: number; attempts?: number } {
  const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
  let record: RateLimitRecord = raw
    ? JSON.parse(raw)
    : { attempts: 0, firstAttemptAt: Date.now() };

  const now = Date.now();

  // Already locked?
  if (record.lockedUntil && now < record.lockedUntil) {
    return { locked: true, remainingMs: record.lockedUntil - now };
  }

  // Reset window if it's been over 15 mins since first attempt
  if (now - record.firstAttemptAt > LOCKOUT_DURATION_MS) {
    record = { attempts: 0, firstAttemptAt: now };
  }

  record.attempts += 1;

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(record));
    return { locked: true, remainingMs: LOCKOUT_DURATION_MS };
  }

  sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(record));
  return { locked: false, attempts: record.attempts };
}

/**
 * Checks if user is currently locked out (before attempting login).
 */
export function checkRateLimit(): { locked: boolean; remainingMs?: number } {
  const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
  if (!raw) return { locked: false };

  const record: RateLimitRecord = JSON.parse(raw);
  const now = Date.now();

  if (record.lockedUntil && now < record.lockedUntil) {
    return { locked: true, remainingMs: record.lockedUntil - now };
  }

  return { locked: false };
}

/**
 * Clears rate limit after successful login.
 */
export function clearRateLimit(): void {
  sessionStorage.removeItem(RATE_LIMIT_KEY);
}

// ─── SESSION MANAGEMENT ─────────────────────────────────────────────────────

const SESSION_KEY = "lumiere_current_user";
const SESSION_EXPIRY_KEY = "lumiere_session_expiry";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Saves a user session with expiry timestamp.
 * NOTE: Password is NEVER included in session data.
 */
export function saveSession(user: { name: string; email: string; joinedAt: string }): void {
  // Never store password in session
  const sessionData = { name: user.name, email: user.email, joinedAt: user.joinedAt };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  localStorage.setItem(SESSION_EXPIRY_KEY, String(Date.now() + SESSION_DURATION_MS));
}

/**
 * Reads session from localStorage. Returns null if missing, expired, or tampered.
 */
export function readSession(): { name: string; email: string; joinedAt: string } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const expiryRaw = localStorage.getItem(SESSION_EXPIRY_KEY);

    if (!raw || !expiryRaw) return null;

    const expiry = parseInt(expiryRaw, 10);
    if (isNaN(expiry) || Date.now() > expiry) {
      clearSession();
      return null; // Session expired
    }

    const parsed = JSON.parse(raw);
    // Validate shape — prevent tampered data
    if (
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string" ||
      !isValidEmail(parsed.email)
    ) {
      clearSession();
      return null;
    }

    return parsed;
  } catch {
    clearSession();
    return null;
  }
}

/**
 * Clears the session on logout or expiry.
 */
export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_EXPIRY_KEY);
}

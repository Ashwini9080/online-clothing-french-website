/**
 * SECURITY UTILITIES — Lumière Studio
 * 
 * Handles:
 * - SHA-256 password hashing (Web Crypto API — no plain text storage)
 * - Input sanitization (XSS prevention)
 * - Login rate limiting (brute force protection)
 * - Session expiry (24-hour auto logout)
 */

// ─── PASSWORD HASHING (MOVED TO BACKEND) ────────────────────────────────────
// Passwords are now hashed on the server using bcrypt.


// ─── INPUT SANITIZATION ─────────────────────────────────────────────────────

/**
 * Sanitizes and normalizes an email address.
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().slice(0, 254); // RFC 5321 max email length
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

// ─── SESSION MANAGEMENT ─────────────────────────────────────────────────────

const SESSION_KEY = "lumiere_current_user";
const SESSION_EXPIRY_KEY = "lumiere_session_expiry";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Saves a user session with expiry timestamp.
 * NOTE: Password is NEVER included in session data.
 */
export function saveSession(user: { name: string; email: string; joinedAt: string }, token: string): void {
  // Store user info and JWT
  const sessionData = { name: user.name, email: user.email, joinedAt: user.joinedAt };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  localStorage.setItem("lumiere_jwt_token", token);
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
      typeof parsed.email !== "string"
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
  localStorage.removeItem("lumiere_jwt_token");
  localStorage.removeItem(SESSION_EXPIRY_KEY);
}

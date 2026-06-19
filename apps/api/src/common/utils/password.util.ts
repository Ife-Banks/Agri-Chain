import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export async function hashToken(token: string, saltRounds = 10): Promise<string> {
  return bcrypt.hash(token, saltRounds);
}

export async function verifyTokenHash(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash);
}

export function validatePasswordStrength(password: string, username?: string, email?: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/\d/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  if (username && password.toLowerCase().includes(username.toLowerCase())) {
    return 'Password cannot contain your username';
  }
  if (email) {
    const localPart = email.split('@')[0];
    if (localPart && password.toLowerCase().includes(localPart.toLowerCase())) {
      return 'Password cannot contain your email address';
    }
  }
  return null;
}

export function validatePin(pin: string): string | null {
  if (!/^\d{4}$/.test(pin)) {
    return 'PIN must be exactly 4 digits';
  }
  return null;
}
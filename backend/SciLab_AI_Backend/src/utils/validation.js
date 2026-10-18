export function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password = '') {
  const value = String(password);
  const errors = [];
  if (value.length < 8) errors.push('Password must be at least 8 characters.');
  if (!/[A-Z]/.test(value)) errors.push('Password must contain an uppercase letter.');
  if (!/[a-z]/.test(value)) errors.push('Password must contain a lowercase letter.');
  if (!/[0-9]/.test(value)) errors.push('Password must contain a number.');
  if (!/[^A-Za-z0-9]/.test(value)) errors.push('Password must contain a special character.');
  return errors;
}

export function requiredString(value, field) {
  const result = String(value ?? '').trim();
  if (!result) {
    const error = new Error(`${field} is required.`);
    error.status = 400;
    throw error;
  }
  return result;
}

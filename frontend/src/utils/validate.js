/**
 * validate.js
 * Client-side package name validation matching the backend regex.
 */

const NAME_REGEX = /^[A-Za-z0-9]([A-Za-z0-9._-]*[A-Za-z0-9])?$/;
const MAX_LEN = 100;
const MIN_LEN = 1;

/**
 * Validate a package name.
 * @param {string} name
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePackageName(name) {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Package name is required.' };
  }
  const trimmed = name.trim();
  if (trimmed.length < MIN_LEN) {
    return { valid: false, error: 'Package name must be at least 1 character.' };
  }
  if (trimmed.length > MAX_LEN) {
    return { valid: false, error: `Package name must be ${MAX_LEN} characters or fewer.` };
  }
  if (!NAME_REGEX.test(trimmed)) {
    return {
      valid: false,
      error:
        'Invalid characters. Use only letters, digits, dots, hyphens, or underscores. ' +
        'Must start and end with a letter or digit.',
    };
  }
  return { valid: true };
}

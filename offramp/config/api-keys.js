/**
 * API Key configuration for gateway authentication.
 * Only requests with a valid API key can access /api/* when API_KEYS is set.
 *
 * Env: API_KEYS = comma-separated list of valid keys, e.g.:
 *   API_KEYS=key_abc123,key_def456
 *
 * If API_KEYS is not set or empty, no API key check is applied (backward compatible).
 */

function getValidKeys() {
  const raw = process.env.API_KEYS;
  if (!raw || typeof raw !== 'string') return null;
  const keys = raw.split(',').map(k => k.trim()).filter(Boolean);
  return keys.length ? new Set(keys) : null;
}

const validKeysSet = getValidKeys();

/**
 * Check if API key authentication is enabled (API_KEYS is set).
 */
function isAuthEnabled() {
  return validKeysSet !== null;
}

/**
 * Validate an API key.
 * @param {string} key - The key from the request
 * @returns {boolean}
 */
function isValidApiKey(key) {
  if (!key || typeof key !== 'string') return false;
  if (!validKeysSet) return true; // auth disabled
  return validKeysSet.has(key.trim());
}

module.exports = {
  isAuthEnabled,
  isValidApiKey,
  getValidKeys: () => validKeysSet ? [...validKeysSet] : []
};

/**
 * api.js
 * Central API client configuration for CodeShield AI.
 * Single API base URL constant used across all hooks and components.
 */

export const API_BASE_URL = ''; // Relative path using Vite proxy / server routes

export async function analyzePackage(packageName, signal) {
  const resp = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ package: packageName }),
    signal,
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const errorType = data.error || (
      resp.status === 502 ? 'REGISTRY_UNAVAILABLE' :
      resp.status === 429 ? 'RATE_LIMITED' :
      resp.status === 400 ? 'INVALID_NAME' : 'UNKNOWN'
    );

    const message = data.message || (
      resp.status === 429 ? 'Too many requests, please wait a moment.' :
      resp.status === 502 ? 'Could not reach PyPI, so we cannot tell whether this package exists.' :
      'An error occurred during analysis.'
    );

    const err = new Error(message);
    err.status = resp.status;
    err.errorType = errorType;
    throw err;
  }

  return data;
}

export async function scanCode(code, signal) {
  const resp = await fetch(`${API_BASE_URL}/api/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
    signal,
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const errorType = data.error || (
      resp.status === 502 ? 'REGISTRY_UNAVAILABLE' :
      resp.status === 429 ? 'RATE_LIMITED' :
      resp.status === 400 ? 'INVALID_INPUT' : 'UNKNOWN'
    );

    const message = data.message || (
      resp.status === 429 ? 'Too many requests, please wait a moment.' :
      resp.status === 502 ? 'Could not reach PyPI, so we cannot tell whether these packages exist.' :
      'An error occurred during code scanning.'
    );

    const err = new Error(message);
    err.status = resp.status;
    err.errorType = errorType;
    throw err;
  }

  return data;
}

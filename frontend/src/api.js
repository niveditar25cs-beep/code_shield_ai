/**
 * api.js
 * Central API client configuration for CodeShield AI.
 * Single API base URL constant used across all hooks and components.
 */

export const API_BASE_URL = ''; // Relative path using Vite proxy / server routes

export async function analyzePackage(packageName, signal) {
  let resp;
  try {
    resp = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ package: packageName }),
      signal,
    });
  } catch (netErr) {
    if (netErr.name === 'AbortError') throw netErr;
    console.error('API Fetch Error [analyzePackage]:', netErr);
    const err = new Error('Cannot reach the CodeShield backend. Make sure the server is running on port 5000.');
    err.status = 0;
    err.errorType = 'OFFLINE';
    throw err;
  }

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    console.error(`API ${resp.status} Error [analyzePackage]:`, data);
    const errorType = data.error || (
      resp.status === 502 ? 'REGISTRY_UNAVAILABLE' :
      resp.status === 429 ? 'RATE_LIMITED' :
      resp.status === 400 ? 'INVALID_NAME' : 'INTERNAL_ERROR'
    );

    const message = data.message || (
      resp.status === 429 ? 'Too many requests, please wait a moment.' :
      resp.status === 502 ? "Could not reach PyPI, so we can't tell whether this package exists." :
      `Server error (${errorType})`
    );

    const err = new Error(message);
    err.status = resp.status;
    err.errorType = errorType;
    throw err;
  }

  if (!data || typeof data !== 'object') {
    console.error('API Malformed Data [analyzePackage]:', data);
    const err = new Error('Unexpected response from the server.');
    err.status = resp.status;
    err.errorType = 'MALFORMED_RESPONSE';
    throw err;
  }

  return data;
}

export async function scanCode(code, signal) {
  let resp;
  try {
    resp = await fetch(`${API_BASE_URL}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
      signal,
    });
  } catch (netErr) {
    if (netErr.name === 'AbortError') throw netErr;
    console.error('API Fetch Error [scanCode]:', netErr);
    const err = new Error('Cannot reach the CodeShield backend. Make sure the server is running on port 5000.');
    err.status = 0;
    err.errorType = 'OFFLINE';
    throw err;
  }

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    console.error(`API ${resp.status} Error [scanCode]:`, data);
    const errorType = data.error || (
      resp.status === 502 ? 'REGISTRY_UNAVAILABLE' :
      resp.status === 429 ? 'RATE_LIMITED' :
      resp.status === 400 ? 'INVALID_INPUT' : 'INTERNAL_ERROR'
    );

    const message = data.message || (
      resp.status === 429 ? 'Too many requests, please wait a moment.' :
      resp.status === 502 ? "Could not reach PyPI, so we can't tell whether these packages exist." :
      `Server error (${errorType})`
    );

    const err = new Error(message);
    err.status = resp.status;
    err.errorType = errorType;
    throw err;
  }

  if (!data || !Array.isArray(data.results) || !data.summary) {
    console.error('API Malformed Data [scanCode]:', data);
    const err = new Error('Unexpected response from the server.');
    err.status = resp.status;
    err.errorType = 'MALFORMED_RESPONSE';
    throw err;
  }

  return data;
}

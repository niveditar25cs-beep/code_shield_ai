/**
 * useAnalyze.js
 * Fetch hooks for /api/analyze and /api/scan with AbortController to ignore stale responses.
 */

import { useState, useRef, useCallback } from 'react';

export function useAnalyze() {
  const [state, setState] = useState({
    status: 'idle', // idle | loading | success | error
    data: null,
    errorType: null, // INVALID_NAME | REGISTRY_UNAVAILABLE | RATE_LIMITED | OFFLINE | UNKNOWN
    error: null,
  });

  const abortRef = useRef(null);

  const analyzePackage = useCallback(async (packageName) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ status: 'loading', data: null, errorType: null, error: null });

    try {
      const resp = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: packageName }),
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;
      const data = await resp.json();
      if (controller.signal.aborted) return;

      if (!resp.ok) {
        const errorType = data.error || 'UNKNOWN';
        const mapped = resp.status === 502 ? 'REGISTRY_UNAVAILABLE'
          : resp.status === 429 ? 'RATE_LIMITED'
          : resp.status === 400 ? 'INVALID_NAME'
          : errorType;

        setState({
          status: 'error',
          data: null,
          errorType: mapped,
          error: data.message || 'An error occurred during analysis.',
        });
        return;
      }

      setState({ status: 'success', data, errorType: null, error: null });
    } catch (err) {
      if (err.name === 'AbortError') return;

      setState({
        status: 'error',
        data: null,
        errorType: 'OFFLINE',
        error: 'Could not connect to the CodeShield AI backend. Please ensure the backend server is running.',
      });
    }
  }, []);

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setState({ status: 'idle', data: null, errorType: null, error: null });
  }, []);

  return { state, analyzePackage, reset };
}

export function useScanCode() {
  const [state, setState] = useState({
    status: 'idle',
    data: null,
    errorType: null,
    error: null,
  });

  const abortRef = useRef(null);

  const scanCode = useCallback(async (code) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ status: 'loading', data: null, errorType: null, error: null });

    try {
      const resp = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;
      const data = await resp.json();
      if (controller.signal.aborted) return;

      if (!resp.ok) {
        setState({
          status: 'error',
          data: null,
          errorType: data.error || 'UNKNOWN',
          error: data.message || 'An error occurred during code scanning.',
        });
        return;
      }

      setState({ status: 'success', data, errorType: null, error: null });
    } catch (err) {
      if (err.name === 'AbortError') return;
      setState({
        status: 'error',
        data: null,
        errorType: 'OFFLINE',
        error: 'Could not connect to backend.',
      });
    }
  }, []);

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setState({ status: 'idle', data: null, errorType: null, error: null });
  }, []);

  return { state, scanCode, reset };
}

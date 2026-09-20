/**
 * useAnalyze.js
 * Fetch hooks for /api/analyze and /api/scan using central API client.
 */

import { useState, useRef, useCallback } from 'react';
import { analyzePackage as fetchAnalyzePackage, scanCode as fetchScanCode } from '../api';

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
      const data = await fetchAnalyzePackage(packageName, controller.signal);
      if (controller.signal.aborted) return;
      setState({ status: 'success', data, errorType: null, error: null });
    } catch (err) {
      if (err.name === 'AbortError') return;

      const isOffline = !err.status;
      const errorType = isOffline ? 'OFFLINE' : (err.errorType || 'UNKNOWN');
      const errorMessage = isOffline
        ? 'Cannot reach the CodeShield backend. Make sure the server is running on port 5000.'
        : err.message;

      setState({
        status: 'error',
        data: null,
        errorType,
        error: errorMessage,
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
      const data = await fetchScanCode(code, controller.signal);
      if (controller.signal.aborted) return;
      setState({ status: 'success', data, errorType: null, error: null });
    } catch (err) {
      if (err.name === 'AbortError') return;

      const isOffline = !err.status;
      const errorType = isOffline ? 'OFFLINE' : (err.errorType || 'UNKNOWN');
      const errorMessage = isOffline
        ? 'Cannot reach the CodeShield backend. Make sure the server is running on port 5000.'
        : err.message;

      setState({
        status: 'error',
        data: null,
        errorType,
        error: errorMessage,
      });
    }
  }, []);

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setState({ status: 'idle', data: null, errorType: null, error: null });
  }, []);

  return { state, scanCode, reset };
}

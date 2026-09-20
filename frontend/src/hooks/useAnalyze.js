/**
 * useAnalyze.js
 * Fetch hooks for /api/analyze and /api/scan with detailed error state.
 */

import { useState, useRef, useCallback } from 'react';
import { analyzePackage as fetchAnalyzePackage, scanCode as fetchScanCode } from '../api';

export function useAnalyze() {
  const [state, setState] = useState({
    status: 'idle', // idle | loading | success | error
    data: null,
    errorType: null,
    error: null,
    httpStatus: null,
  });

  const abortRef = useRef(null);

  const analyzePackage = useCallback(async (packageName) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ status: 'loading', data: null, errorType: null, error: null, httpStatus: null });

    try {
      const data = await fetchAnalyzePackage(packageName, controller.signal);
      if (controller.signal.aborted) return;
      setState({ status: 'success', data, errorType: null, error: null, httpStatus: 200 });
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('useAnalyze Error:', err);

      setState({
        status: 'error',
        data: null,
        errorType: err.errorType || 'UNKNOWN',
        error: err.message,
        httpStatus: err.status || 0,
      });
    }
  }, []);

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setState({ status: 'idle', data: null, errorType: null, error: null, httpStatus: null });
  }, []);

  return { state, analyzePackage, reset };
}

export function useScanCode() {
  const [state, setState] = useState({
    status: 'idle',
    data: null,
    errorType: null,
    error: null,
    httpStatus: null,
  });

  const abortRef = useRef(null);

  const scanCode = useCallback(async (code) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ status: 'loading', data: null, errorType: null, error: null, httpStatus: null });

    try {
      const data = await fetchScanCode(code, controller.signal);
      if (controller.signal.aborted) return;
      setState({ status: 'success', data, errorType: null, error: null, httpStatus: 200 });
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('useScanCode Error:', err);

      setState({
        status: 'error',
        data: null,
        errorType: err.errorType || 'UNKNOWN',
        error: err.message,
        httpStatus: err.status || 0,
      });
    }
  }, []);

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setState({ status: 'idle', data: null, errorType: null, error: null, httpStatus: null });
  }, []);

  return { state, scanCode, reset };
}

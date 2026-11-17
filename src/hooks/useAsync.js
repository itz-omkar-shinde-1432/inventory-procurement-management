import { useCallback, useEffect, useState } from 'react';

// Runs an async function on mount and exposes { data, loading, error, reload }.
export function useAsync(fn) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      setState({ data: await fn(), loading: false, error: null });
    } catch (e) {
      setState({ data: null, loading: false, error: e.message || 'Something went wrong.' });
    }
  }, [fn]);

  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}

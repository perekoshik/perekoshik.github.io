import { useEffect, useState } from "react";

export function useAsyncInitialize<T>(fn: () => Promise<T>, deps: any[] = []) {
  const [state, setState] = useState<T | undefined>();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const next = await fn();
      if (!cancelled && next !== undefined) {
        setState(next);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, deps);

  return state;
}

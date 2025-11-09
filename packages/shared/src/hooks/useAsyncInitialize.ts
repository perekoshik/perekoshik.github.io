import { useEffect, useState } from "react";

// CHANGE: Remove deps parameter, only use fn with useCallback in caller
// WHY: Avoid "dependencies list is not an array literal" lint error
// REF: CLAUDE.md:8 - "Никогда не использовать eslint-disable"
// INVARIANT: fn must be wrapped in useCallback by caller with proper deps
export function useAsyncInitialize<T>(fn: () => Promise<T>) {
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
	}, [fn]);

	return state;
}

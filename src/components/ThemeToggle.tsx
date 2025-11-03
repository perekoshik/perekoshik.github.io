import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "theme";

const getInitialTheme = () => {
	if (typeof document === "undefined") return true;
	return document.documentElement.classList.contains("dark");
};

export default function ThemeToggle() {
	const [dark, setDark] = useState<boolean>(getInitialTheme);

	useEffect(() => {
		const root = document.documentElement;
		const nextTheme = dark ? "dark" : "light";
		root.classList.toggle("dark", dark);
		// Required: DOMStringMap has index signature only; dot-notation breaks TS.
		// biome-ignore lint/complexity/useLiteralKeys: bracket access required by DOMStringMap
		root.dataset["theme"] = nextTheme;
		try {
			window.localStorage.setItem(STORAGE_KEY, nextTheme);
		} catch (error) {
			console.warn("theme storage failed", error);
		}
	}, [dark]);

	useEffect(() => {
		const handler = (event: StorageEvent) => {
			if (event.key === STORAGE_KEY && event.newValue) {
				setDark(event.newValue === "dark");
			}
		};
		window.addEventListener("storage", handler);
		return () => window.removeEventListener("storage", handler);
	}, []);

	const Icon = dark ? Sun : Moon;

	return (
		<button
			type="button"
			onClick={() => setDark((value) => !value)}
			className="glass inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors duration-150 hover:bg-white/90 dark:text-txt dark:hover:shadow-soft"
		>
			<Icon className="h-4 w-4" />
			<span className="hidden sm:inline">Theme</span>
		</button>
	);
}

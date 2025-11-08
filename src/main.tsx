import ReactDOM from "react-dom/client";
import "./polyfills";
import "./index.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { RouterProvider } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { initTWA } from "./lib/twa";
import { router } from "./router";

// CHANGE: Disable devtrace in production or disable mapSources
// WHY: stacktrace-js with mapSources:true causes malformed URLs (async%20https://...) when fetching source maps
// REF: Issue with @ton-ai-core/devtrace@0.1.0 stack-logger.js incorrectly parsing fileName in stack frames
// QUOTE(TЗ): "GET https://perekoshik.github.io/async%20https://perekoshik.github.io/assets/..." 404
if (import.meta.env.DEV) {
	await import("@ton-ai-core/devtrace")
		.then((m) =>
			m.installStackLogger({
				limit: 5, // number of stack frames
				skip: 0, // skip frames
				tail: false, // show full stack, not only tail
				ascending: true, // order root → call-site
				mapSources: false, // CHANGE: disable mapSources to prevent async%20 bug
				// WHY: stacktrace-js has bug with source map loading
				snippet: 1, // lines of code context
				preferApp: true, // prioritize app code
				onlyApp: false, // include libs as well
			}),
		)
		.catch(() => {});
}

initTWA();

const container = document.getElementById("root");
if (container) {
	ReactDOM.createRoot(container).render(
		<ErrorBoundary>
			<TonConnectUIProvider
				manifestUrl={`${window.location.origin}/tonconnect-manifest.json`}
			>
				<RouterProvider router={router} />
			</TonConnectUIProvider>
		</ErrorBoundary>,
	);
}

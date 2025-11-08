import ReactDOM from "react-dom/client";
import "./polyfills";
import "./index.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { RouterProvider } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { initTWA } from "./lib/twa";
import { router } from "./router";

// CHANGE: Enable mapSources with patch for async%20 bug
// WHY: Fixed upstream in error-stack-parser-es with patch-package
//      The bug was in parseV8OrIeString() which didn't strip "async " keyword
// REF: Patches applied via postinstall: patches/error-stack-parser-es+0.1.5.patch
//      patches/error-stack-parser+2.1.4.patch
// QUOTE(TЗ): "GET https://perekoshik.github.io/async%20https://..." → Fixed
await import("@ton-ai-core/devtrace")
	.then((m) =>
		m.installStackLogger({
			limit: 5, // number of stack frames
			skip: 0, // skip frames
			tail: false, // show full stack, not only tail
			ascending: true, // order root → call-site
			mapSources: true, // map sources to original files (now fixed!)
			snippet: 1, // lines of code context
			preferApp: true, // prioritize app code
			onlyApp: false, // include libs as well
		}),
	)
	.catch(() => {});

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

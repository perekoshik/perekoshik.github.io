import ReactDOM from "react-dom/client";
import "./polyfills";
import "./index.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { RouterProvider } from "react-router-dom";
import { initTWA } from "./lib/twa";
import { router } from "./router";

// Add devtrace for development mode
await import("@ton-ai-core/devtrace")
	.then((m) =>
		m.installStackLogger({
			limit: 5, // number of stack frames
			skip: 0, // skip frames
			tail: false, // show full stack, not only tail
			ascending: true, // order root → call-site
			mapSources: true, // map sources to original files
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
		<TonConnectUIProvider
			manifestUrl={`${window.location.origin}/tonconnect-manifest.json`}
		>
			<RouterProvider router={router} />
		</TonConnectUIProvider>,
	);
}

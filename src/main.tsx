import ReactDOM from "react-dom/client";
import "./polyfills";
import "./index.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { RouterProvider } from "react-router-dom";
import { initTWA } from "./lib/twa";
import { router } from "./router";

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

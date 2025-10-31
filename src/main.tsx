import React from "react";
import ReactDOM from "react-dom/client";
import "./polyfills";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { router } from "./router";
import { initTWA } from "./lib/twa";

initTWA();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <TonConnectUIProvider
    manifestUrl={`${window.location.origin}/tonconnect-manifest.json`}
  >
    <RouterProvider router={router} />
  </TonConnectUIProvider>
);

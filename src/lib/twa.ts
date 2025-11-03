import WebApp from "@twa-dev/sdk";

// Init once when app boots
export function initTWA() {
	try {
		WebApp.ready();
		WebApp.expand();

		// Sync theme colors with Telegram
		const bg = WebApp.themeParams.bg_color;
		if (bg) {
			document.body.style.backgroundColor = bg;
		}

		// Optional: set app header color
		WebApp.setHeaderColor("secondary_bg_color");
	} catch (e) {
		console.warn("TWA init error", e);
	}
}

export const TWA = WebApp;

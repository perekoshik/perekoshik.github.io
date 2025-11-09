import { Buffer } from "buffer";

declare global {
	interface Window {
		Buffer: typeof Buffer;
	}

	interface globalThis {
		Buffer: typeof Buffer;
	}
}

if (typeof window !== "undefined" && !window.Buffer) {
	window.Buffer = Buffer;
}

if (typeof globalThis !== "undefined" && !globalThis.Buffer) {
	globalThis.Buffer = Buffer;
}

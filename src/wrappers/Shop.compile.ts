import type { CompilerConfig } from "@ton-community/blueprint";

export const compile: CompilerConfig = {
	lang: "tact",
	target: "contracts/shop.tact",
	options: {
		debug: true,
	},
};

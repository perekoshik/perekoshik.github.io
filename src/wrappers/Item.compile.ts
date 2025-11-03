import type { CompilerConfig } from "@ton-community/blueprint";

export const compile: CompilerConfig = {
	lang: "tact",
	target: "contracts/item.tact",
	options: {
		debug: true,
	},
};

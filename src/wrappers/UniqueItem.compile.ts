import type { CompilerConfig } from "@ton-community/blueprint";

export const compile: CompilerConfig = {
	lang: "tact",
	target: "contracts/unique_item.tact",
	options: {
		debug: true,
	},
};

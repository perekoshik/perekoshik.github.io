// CHANGE: Update to modern blueprint package
// WHY: @ton-community/blueprint is deprecated (2 years old), requires obsolete 'ton' package
// REF: User message requesting migration to @ton/blueprint
import type { CompilerConfig } from "@ton/blueprint";

export const compile: CompilerConfig = {
	lang: "tact",
	target: "contracts/user.tact",
	options: {
		debug: true,
	},
};

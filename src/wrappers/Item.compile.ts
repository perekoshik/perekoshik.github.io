// CHANGE: Update to modern blueprint package
// WHY: @ton-community/blueprint is deprecated (2 years old), requires obsolete 'ton' package
// QUOTE(ТЗ): "актуальная @ton/blueprint"
// REF: User message requesting migration to @ton/blueprint
// SOURCE: https://www.npmjs.com/package/@ton/blueprint - "actively maintained, v0.41.0"
import type { CompilerConfig } from "@ton/blueprint";

export const compile: CompilerConfig = {
	lang: "tact",
	target: "contracts/item.tact",
	options: {
		debug: true,
	},
};

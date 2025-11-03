import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient } from "@ton/ton";
import { CHAIN } from "@tonconnect/ui-react";
import { useCallback } from "react";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { useTonConnect } from "./useTonConnect";

// CHANGE: Wrap async factory in useCallback
// WHY: Avoid inline function recreation, satisfy react-hooks/exhaustive-deps
// REF: CLAUDE.md:8 - "Никогда не использовать eslint-disable"
export function useTonClient() {
	const { network } = useTonConnect();

	const initClient = useCallback(async () => {
		if (!network) return;

		return new TonClient({
			endpoint: await getHttpEndpoint({
				network: network === CHAIN.TESTNET ? "testnet" : "mainnet",
			}),
		});
	}, [network]);

	return {
		client: useAsyncInitialize(initClient),
	};
}

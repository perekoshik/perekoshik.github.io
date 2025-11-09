import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient } from "@ton/ton";
import { useCallback, useMemo } from "react";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { useTonConnect } from "./useTonConnect";
import { TARGET_CHAIN } from "@/config";
import { CHAIN } from "@tonconnect/ui-react";

// CHANGE: Wrap async factory in useCallback
// WHY: Avoid inline function recreation, satisfy react-hooks/exhaustive-deps
// REF: CLAUDE.md:8 - "Никогда не использовать eslint-disable"
export function useTonClient() {
	const { network } = useTonConnect();

	const effectiveChain = network ?? TARGET_CHAIN;
	const networkName = useMemo(
		() => (effectiveChain === CHAIN.TESTNET ? "testnet" : "mainnet"),
		[effectiveChain],
	);

	const initClient = useCallback(async () => {
		return new TonClient({
			endpoint: await getHttpEndpoint({ network: networkName }),
		});
	}, [networkName]);

	return {
		client: useAsyncInitialize(initClient),
	};
}

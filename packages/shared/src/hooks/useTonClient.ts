import { getHttpEndpoint } from '@orbs-network/ton-access';
import { TonClient } from '@ton/ton';
import { useCallback, useMemo } from 'react';
import { useAsyncInitialize } from './useAsyncInitialize';
import { useTonConnect } from './useTonConnect';
import { TARGET_CHAIN } from '@/config';
import { CHAIN } from '@tonconnect/ui-react';

const FALLBACK_ENDPOINTS: Record<string, string[]> = {
  testnet: [
    'https://testnet.toncenter.com/api/v2/jsonRPC',
    'https://testnet.tonhubapi.com/jsonRPC',
  ],
  mainnet: [
    'https://toncenter.com/api/v2/jsonRPC',
    'https://mainnet.tonhubapi.com/jsonRPC',
  ],
};

// CHANGE: Wrap async factory in useCallback
// WHY: Avoid inline function recreation, satisfy react-hooks/exhaustive-deps
// REF: CLAUDE.md:8 - "Никогда не использовать eslint-disable"
export function useTonClient() {
	const { network } = useTonConnect();

	const effectiveChain = network ?? TARGET_CHAIN;
	const networkName = useMemo(
		() => (effectiveChain === CHAIN.TESTNET ? 'testnet' : 'mainnet'),
		[effectiveChain],
	);

	const initClient = useCallback(async () => {
		const tried: string[] = [];
		try {
			const endpoint = await getHttpEndpoint({ network: networkName });
			tried.push(endpoint);
			return new TonClient({ endpoint });
		} catch (error) {
			console.warn('[TonClient] ton-access failed, fallback to static list', error);
		}

		const fallbacks = FALLBACK_ENDPOINTS[networkName] ?? [];
		for (const endpoint of fallbacks) {
			if (tried.includes(endpoint)) continue;
			try {
				return new TonClient({ endpoint });
			} catch (error) {
				console.warn('[TonClient] fallback endpoint failed', endpoint, error);
			}
		}

		throw new Error('No TON endpoints available');
	}, [networkName]);

	return {
		client: useAsyncInitialize(initClient),
	};
}

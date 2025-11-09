import {
	Address,
	beginCell,
	type SenderArguments,
	storeStateInit,
} from "@ton/core";
import {
	type CHAIN,
	useTonConnectUI,
	useTonWallet,
} from "@tonconnect/ui-react";

type NullableAddressSender = {
	send: (args: SenderArguments) => Promise<void>;
	address: Address | null;
};

export function useTonConnect(): {
	sender: NullableAddressSender;
	connected: boolean;
	wallet: string | null;
	network: CHAIN | null;
} {
	const [TonConnectUI] = useTonConnectUI();
	const wallet = useTonWallet();

	return {
		sender: {
			send: async (args: SenderArguments) => {
				// Transform the message for TON Connect protocol
				const message: {
					address: string;
					amount: string;
					stateInit?: string;
					payload?: string;
				} = {
					address: args.to.toString(),
					amount: args.value.toString(),
				};

				// Properly format stateInit if it exists as base64 BOC of the entire StateInit cell
				if (args.init) {
					const stateInitCell = beginCell()
						.store(storeStateInit(args.init))
						.endCell();
					message.stateInit = stateInitCell.toBoc().toString("base64");
				}

				if (args.body) {
					// Convert the body to base64 string as expected by TON Connect
					message.payload = args.body.toBoc().toString("base64");
				}

				try {
					await TonConnectUI.sendTransaction({
						messages: [message],
						validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes from now in seconds
					});
				} catch (error) {
					console.error("Error sending transaction:", error);
					throw error; // Re-throw to handle in the calling function
				}
			},
			address: wallet?.account.address
				? Address.parse(wallet?.account.address as string)
				: null,
		},
		connected: !!wallet?.account.address,
		wallet: wallet?.account.address ?? null,
		network: wallet?.account.chain ?? null,
	};
}

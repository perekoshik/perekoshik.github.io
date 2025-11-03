import { Address, type SenderArguments } from "@ton/core";
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
				// Build the message object conditionally to avoid undefined values
				const message: {
					address: string;
					amount: string;
					stateInit?: string;
					payload?: string;
				} = {
					address: args.to.toString(),
					amount: args.value.toString(),
				};

				if (args.init) {
					message.stateInit = args.init.toString();
				}

				if (args.body) {
					message.payload = args.body.toBoc().toString("base64");
				}

				TonConnectUI.sendTransaction({
					messages: [message],
					validUntil: Date.now() + 5 * 60 * 1000,
				});
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

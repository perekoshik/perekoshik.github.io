import { useTonConnectUI, useTonWallet, CHAIN } from "@tonconnect/ui-react";
import { Address, Sender, SenderArguments } from "ton-core";

export function useTonConnect(): {
    sender: Sender,
    connected: boolean,
    wallet: string | null,
    network: 'mainnet' | 'testnet' | null
} {
    const [TonConnectUI] = useTonConnectUI()
    const wallet = useTonWallet()

    const network = wallet?.account.chain === CHAIN.MAINNET
        ? 'mainnet'
        : wallet?.account.chain === CHAIN.TESTNET
            ? 'testnet'
            : null

    return {
        sender: {
            send: async(args: SenderArguments) => {
                TonConnectUI.sendTransaction({
                    messages: [{
                        address: args.to.toString(),
                        amount: args.value.toString(),
                        payload: args.body?.toBoc().toString('base64'),
                    }], 
                    validUntil: Date.now() + 5 * 60 * 1000
                })
            },
            address: wallet?.account.address ? Address.parse(wallet?.account.address as string) : undefined
        },
        connected: !!wallet?.account.address,
        wallet: wallet?.account.address ?? null,
        network,
        
    }
}

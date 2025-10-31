import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, OpenedContract } from "ton-core";
import { UsersFactory } from "@/wrappers/UsersFactory";
import { useTonConnect } from "./useTonConnect";
import { User } from "@/wrappers/User";
export function useMarketContracts() {
    const {client} = useTonClient();
    const {wallet} = useTonConnect();

    const usersFactoryContract = useAsyncInitialize(async () => {
        if(!client) return;

        const usersFactoryContract = UsersFactory.fromAddress(Address.parse("kQBHFTbPmcS02DWIRwDKc70HnfYMM1AQsxHuB02h4NLsnk9j"))
    
        return client.open(usersFactoryContract) as OpenedContract<UsersFactory>;
    }, [client]);

    const userContract = useAsyncInitialize( async () => {
        if(!client) return;

        const userAddress = await usersFactoryContract?.getUserAddress(
            Address.parse(wallet!)
        )

        return client.open(User.fromAddress(userAddress))
    }, [usersFactoryContract])

    return {
        marketAddress: userContract?.address.toString(),
    }
}
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, beginCell, OpenedContract, toNano } from "ton-core";
import { UsersFactory } from "@/wrappers/UsersFactory";
import { useTonConnect } from "./useTonConnect";
import { User } from "@/wrappers/User";
import { ShopFactory } from "@/wrappers/ShopFactory";
import { Shop, storeUpdateShopInfo, UpdateShopInfo } from "@/wrappers/Shop";
import { useEffect, useState } from "react";

export function useMarketContracts() {
    const {client} = useTonClient();
    const {wallet} = useTonConnect();
    const {sender} = useTonConnect();
    const [shopName, setshopName] = useState<string>('');

    const usersFactoryContract = useAsyncInitialize(async () => {
        if(!client) return;

        const usersFactoryContract = UsersFactory.fromAddress(Address.parse("kQApbRMD39StaHO1eJPpCG9lUGwr9k7Q5ypw0xhmKAnueFN_"))
    
        return client.open(usersFactoryContract) as OpenedContract<UsersFactory>;
    }, [client]);

    const userContract = useAsyncInitialize( async () => {
        if(!usersFactoryContract || !client || !wallet) return;

        const userAddress = await usersFactoryContract.getUserAddress(
            Address.parse(wallet)
        )

        return client.open(User.fromAddress(userAddress))
    }, [usersFactoryContract])

    const shopFactoryContract = useAsyncInitialize(async () => {
        if(!client) return;

        const shopFactoryAddress = ShopFactory.fromAddress(Address.parse("kQCiX5NxM6pBa1B8zkCD8l48JHz398OZxxay7W1b_M1iXgmP"))
    
        return client.open(shopFactoryAddress) as OpenedContract<ShopFactory>;
    }, [client]);

    const shopContract = useAsyncInitialize( async () => {
        if(!shopFactoryContract || !client || !wallet) return;

        const shopAddress = await shopFactoryContract.getShopAddress(
            Address.parse(wallet)
        )

        return client.open(Shop.fromAddress(shopAddress))
    }, [shopFactoryContract]);

    useEffect(() => {
        async function getshopname() {
            if (!shopContract) return;
            const shopName = await shopContract.getShopName();
            setshopName(shopName);
        }
        
        getshopname();

    }, [shopContract])

    return {
        marketAddress: userContract?.address.toString(),
        shopAddress: shopContract?.address.toString(),
        makeShop: async (name: string, id: bigint) => {
            if (!shopContract || !wallet) return;

            const message: UpdateShopInfo = {
                $$type: 'UpdateShopInfo',
                shopName: name,
                shopId: id,
                uniqueItemsCount: 0n,
                ordersCount: 0n,
            }

            sender.send({
                to: shopContract?.address,
                value: toNano('0.05'),
                bounce: false,
                init: (await Shop.fromInit(Address.parse(wallet))).init,
                body: beginCell().store(storeUpdateShopInfo(message)).endCell()
            });

            // shopContract?.send(sender, {
            //     value: toNano('0.05'),
            //     bounce: false
            // }, message)
        },
        shopName: shopName,
    }
}

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
    const {wallet, sender} = useTonConnect();

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

    const shopContract = useAsyncInitialize(async () => {
        if(!shopFactoryContract || !client || !wallet) return;

        const shopAddress = await shopFactoryContract.getShopAddress(
            Address.parse(wallet)
        );

        return client.open(Shop.fromAddress(shopAddress));

    }, [shopFactoryContract]);

    const makeShop = async (name: string, id: bigint) => {
        if (!sender || !wallet) return;
        
        try {
            const shopStateInit = await Shop.fromInit(Address.parse(wallet));
            
            const message: UpdateShopInfo = {
                $$type: 'UpdateShopInfo',
                shopName: name,
                shopId: id,
                uniqueItemsCount: 0n,
                ordersCount: 0n,
            };
            
            const body = beginCell()
                .store(storeUpdateShopInfo(message))
                .endCell();
            
            await sender.send({
                to: shopStateInit.address,
                value: toNano('0.05'),
                bounce: false,
                init: shopStateInit.init,
                body: body
            });
            
        } catch (error) {
            throw error;
    };



};

    return {
        marketAddress: userContract?.address.toString(),
        shopAddress: shopContract?.address.toString(),
        shopName: shopContract?.getShopName(),
        makeShop: async (shopName: string, id: bigint) => {
            const shopStateInit = await Shop.fromInit(Address.parse(wallet!));
            
            const message: UpdateShopInfo = {
                $$type: 'UpdateShopInfo',
                shopName: shopName,
                shopId: id,
                uniqueItemsCount: 0n,
                ordersCount: 0n,
            };
            
            const body = beginCell()
                .store(storeUpdateShopInfo(message))
                .endCell();
            
            await sender.send({
                to: shopStateInit.address,
                value: toNano('0.05'),
                bounce: false,
                init: shopStateInit.init,
                body: body
            });

            return "success";
        }
    }
}

import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, toNano } from "ton-core";
import { UsersFactory } from "@/wrappers/UsersFactory";
import { useTonConnect } from "./useTonConnect";
import { User } from "@/wrappers/User";
import { ShopFactory } from "@/wrappers/ShopFactory";
import { Shop, UpdateShopInfo } from "@/wrappers/Shop";
import { useEffect, useState } from "react";

const DEFAULT_USERS_FACTORY = {
  mainnet: "kQBgrtmFiD0RSd7aFEcPJoChkLIO9Yb4pScN4xub1W3bAX9A",
  testnet: "kQApbRMD39StaHO1eJPpCG9lUGwr9k7Q5ypw0xhmKAnueFN_",
} as const;

const DEFAULT_SHOP_FACTORY = {
  mainnet: "kQCiX5NxM6pBa1B8zkCD8l48JHz398OZxxay7W1b_M1iXgmP",
  testnet: "kQCiX5NxM6pBa1B8zkCD8l48JHz398OZxxay7W1b_M1iXgmP",
} as const;

function resolveAddress(
  network: "mainnet" | "testnet",
  envKey: "VITE_USERS_FACTORY" | "VITE_SHOP_FACTORY",
  defaults: typeof DEFAULT_USERS_FACTORY
) {
  const suffix = network === "mainnet" ? "_MAINNET" : "_TESTNET";
  const envValue = import.meta.env[`${envKey}${suffix}`];
  const fallback = defaults[network];
  return Address.parse((envValue as string | undefined) ?? fallback);
}

export function useMarketContracts() {
    const {client} = useTonClient();
    const {wallet, sender, network} = useTonConnect();
    const [shopName, setshopName] = useState<string>('');

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const usersFactoryContract = useAsyncInitialize(async () => {
        if(!client || !network) return;

        const usersFactoryAddress = resolveAddress(
            network,
            "VITE_USERS_FACTORY",
            DEFAULT_USERS_FACTORY
        );

        const usersFactoryContract = UsersFactory.fromAddress(usersFactoryAddress)
    
        return client.open(usersFactoryContract) as OpenedContract<UsersFactory>;
    }, [client, network]);

    const userContract = useAsyncInitialize( async () => {
        if(!usersFactoryContract || !client || !wallet) return;

        const userAddress = await usersFactoryContract.getUserAddress(
            Address.parse(wallet)
        )

        return client.open(User.fromAddress(userAddress))
    }, [usersFactoryContract, client, wallet])

    const shopFactoryContract = useAsyncInitialize(async () => {
        if(!client || !network) return;

        const shopFactoryAddress = resolveAddress(
            network,
            "VITE_SHOP_FACTORY",
            DEFAULT_SHOP_FACTORY
        );

        const shopFactory = ShopFactory.fromAddress(shopFactoryAddress)
    
        return client.open(shopFactory) as OpenedContract<ShopFactory>;
    }, [client, network]);

    const shopContract = useAsyncInitialize( async () => {
        if(!shopFactoryContract || !client || !wallet) return;

        const shopAddress = await shopFactoryContract.getShopAddress(
            Address.parse(wallet)
        )

        return client.open(Shop.fromAddress(shopAddress))
    }, [shopFactoryContract, client, wallet]);

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
            if (!client || !wallet || !shopFactoryContract) return;

            const ownerAddress = Address.parse(wallet);
            const targetShopContract = shopContract
                ?? client.open(Shop.fromAddress(await shopFactoryContract.getShopAddress(ownerAddress)));

            let isDeployed = await client.isContractDeployed(targetShopContract.address);

            if (!isDeployed) {
                await shopFactoryContract.send(sender, {
                    value: toNano('0.1'),
                    bounce: false,
                }, {
                    $$type: 'CreateShop',
                    shopName: name,
                });

                for (let attempt = 0; attempt < 5; attempt++) {
                    await sleep(1000);
                    if (await client.isContractDeployed(targetShopContract.address)) {
                        isDeployed = true;
                        break;
                    }
                }
            }

            if (!isDeployed) {
                throw new Error('Shop contract was not deployed');
            }

            const message: UpdateShopInfo = {
                $$type: 'UpdateShopInfo',
                shopName: name,
                shopId: id,
                uniqueItemsCount: 0n,
                ordersCount: 0n,
            }

            await targetShopContract.send(sender, {
                value: toNano('0.05'),
                bounce: false,
            }, message)
        },
        shopName: shopName,
    }
}

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
    const {connected} = useTonConnect();

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

    


    // Building Shop 
    
    const [shopAddress, setShopAddress] = useState<string | null>(null);
    const [shopName, setShopName] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const makeShop = async (shopName: string, id: bigint): Promise<string> => {
        if (!sender || !wallet || !connected || !client) {
            throw new Error('Wallet not connected or client not available');
        }

        if (!shopName.trim()) {
            throw new Error('Shop name cannot be empty');
        }

        let walletAddress: Address;
        try {
            walletAddress = Address.parse(wallet);
        } catch (error) {
            throw new Error('Invalid wallet address format');
        }

        setLoading(true);
        let shopStateInit;
        let shopContract;
        let retrievedName: string;

        try {
            try {
                shopStateInit = await Shop.fromInit(walletAddress);
                if (!shopStateInit.init) {
                    throw new Error('Failed to initialize shop contract data');
                }
            } catch (initError) {
                throw new Error(`Failed to initialize shop contract: ${(initError as Error).message}`);
            }
            
        


            let message = {
                $$type: 'UpdateShopInfo' as const,
                shopName: shopName,
                shopId: id,
                uniqueItemsCount: 0n,
                ordersCount: 0n,
            };
            
            try {
                shopContract = client.open(shopStateInit);
            } catch (openError) {
                throw new Error(`Failed to open shop contract: ${(openError as Error).message}`);
            }

            

            try {
                await shopContract.send(
                    sender, {
                        value: toNano('0.05'),
                        bounce: false,
                    }, message,
                );
            } catch (sendError) {
                throw new Error(`Transaction failed: ${(sendError as Error).message}`);
            }

            try {
                await new Promise(resolve => setTimeout(resolve, 3000));
            } catch (timeoutError) {
                throw new Error(`Timeout error: ${(timeoutError as Error).message}`);
            }

            const isDeployed = await client.isContractDeployed(shopStateInit.address);
            if (!isDeployed) {
                throw new Error('Shop contract deployment failed - contract not active');
            }

            try {
                retrievedName = await shopContract.getShopName();
            } catch (getError) {
                throw new Error(`Failed to get shop data: ${(getError as Error).message}`);
            }
            

            setShopAddress(shopStateInit.address.toString());
            setShopName(retrievedName);

            return shopStateInit.address.toString();

        } catch (error) {
            throw new Error(`Failed to create shop: ${(error as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    return {
        marketAddress: userContract?.address.toString(),
        
        shopAddress,
        shopName,
        loading,
        
        makeShop,
        
        reset: () => {
            setShopAddress(null);
            setShopName(null);
        }
    }
};

    

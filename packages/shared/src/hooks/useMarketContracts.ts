import { Address, beginCell, toNano } from '@ton/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TWA } from '@/lib/twa';
import { Item, storeUpdateItem } from '@/wrappers/Item';
import { Shop, storeUpdateShopInfo } from '@/wrappers/Shop';
import { User } from '@/wrappers/User';
import { UsersFactory } from '@/wrappers/UsersFactory';
import { useAsyncInitialize } from './useAsyncInitialize';
import { useTonClient } from './useTonClient';
import { useTonConnect } from './useTonConnect';
import { defaultImage } from '@/constants/images';
import { resolveMediaUrl } from '@/lib/media';
import { TARGET_CHAIN, TARGET_NETWORK_LABEL } from '@/config';

async function waitForContractDeployment(options: {
  client: { isContractDeployed(address: Address): Promise<boolean> };
  address: Address;
  timeout?: number;
  interval?: number;
  onDeployed?: () => Promise<void>;
}) {
  const { client, address, timeout = 120000, interval = 2000, onDeployed } = options;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeout) {
    await new Promise((resolve) => setTimeout(resolve, interval));
    if (await client.isContractDeployed(address)) {
      if (onDeployed) {
        await onDeployed();
      }
      return;
    }
  }

  throw new Error('Contract deployment timeout');
}

export type MarketplaceItem = {
  address: string;
  id: bigint;
  price: bigint;
  imageSrc: string;
  title: string;
  description: string;
};

export function useMarketContracts() {
  const { client } = useTonClient();
  const { sender, wallet, connected, network } = useTonConnect();
  const wrongNetwork = network ? network !== TARGET_CHAIN : false;
  const telegramUser = TWA?.initDataUnsafe?.user;

  const initUsersFactory = useCallback(async () => {
    if (!client) return;

    const usersFactoryContract = UsersFactory.fromAddress(
      Address.parse('kQApbRMD39StaHO1eJPpCG9lUGwr9k7Q5ypw0xhmKAnueFN_'),
    );

    return client.open(usersFactoryContract);
  }, [client]);

  const usersFactoryContract = useAsyncInitialize(initUsersFactory);

  const initUserContract = useCallback(async () => {
    if (!usersFactoryContract || !client || !wallet) return;

    const userAddress = await usersFactoryContract.getUserAddress(Address.parse(wallet));
    const deployed = await client.isContractDeployed(userAddress);
    if (!deployed) {
      return null;
    }

    return client.open(User.fromAddress(userAddress));
  }, [usersFactoryContract, client, wallet]);

  const userContract = useAsyncInitialize(initUserContract);

  const [shopAddress, setShopAddress] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);
  const [shopItemsCount, setShopItemsCount] = useState<bigint | null>(null);
  const [shopDeployed, setShopDeployed] = useState<boolean | null>(null);
  const [shopSyncing, setShopSyncing] = useState(false);
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const refreshShopInfo = useCallback(async () => {
    if (!client || !wallet || wrongNetwork) {
      setShopAddress(null);
      setShopName(null);
      setShopItemsCount(null);
      setShopDeployed(false);
      return;
    }

    setShopSyncing(true);
    try {
      const walletAddress = Address.parse(wallet);
      const shopInit = await Shop.fromInit(walletAddress);
      const openedShop = client.open(shopInit);
      setShopAddress(openedShop.address.toString());

      const deployed = await client.isContractDeployed(openedShop.address);
      setShopDeployed(deployed);
      if (!deployed) {
        setShopName(null);
        setShopItemsCount(null);
        return;
      }

      const [name, itemsCount] = await Promise.all([
        openedShop.getShopName(),
        openedShop.getItemsCount(),
      ]);
      setShopName(name);
      setShopItemsCount(itemsCount);
    } catch (error) {
      console.error('Failed to refresh shop info', error);
    } finally {
      setShopSyncing(false);
    }
  }, [client, wallet, wrongNetwork]);

  useEffect(() => {
    refreshShopInfo();
  }, [refreshShopInfo]);

  const refreshItems = useCallback(async () => {
    if (!client || !shopAddress || shopItemsCount === null || !shopDeployed || wrongNetwork) {
      setItems([]);
      setItemsLoading(false);
      return;
    }

    setItemsLoading(true);
    try {
      const address = Address.parse(shopAddress);
      const isDeployed = await client.isContractDeployed(address);
      if (!isDeployed) {
        setItems([]);
        return;
      }

      const nextItems: MarketplaceItem[] = [];
      for (let i = 0; i < Number(shopItemsCount); i++) {
        const itemState = await Item.fromInit(address, BigInt(i));
        const itemContract = client.open(itemState);
        const deployed = await client.isContractDeployed(itemContract.address);
        if (!deployed) continue;

        const [id, price, rawImage, title, description] = await Promise.all([
          itemContract.getId(),
          itemContract.getPrice(),
          itemContract.getImageSrc(),
          itemContract.getTitle(),
          itemContract.getDescription(),
        ]);

        nextItems.push({
          address: itemContract.address.toString(),
          id,
          price,
          imageSrc: resolveMediaUrl(rawImage, defaultImage) ?? defaultImage,
          title,
          description,
        });
      }
      setItems(nextItems);
    } catch (error) {
      console.error('Failed to load items list', error);
    } finally {
      setItemsLoading(false);
    }
  }, [client, shopAddress, shopItemsCount, shopDeployed, wrongNetwork]);

  useEffect(() => {
    refreshItems();
  }, [refreshItems]);

  const makeShop = useCallback(
    async (name: string) => {
      if (!client || !sender || !wallet || !connected) {
        throw new Error('Wallet is not connected');
      }
      const userId = telegramUser?.id ?? 0;
      if (wrongNetwork) {
        throw new Error(`Переключите кошелёк в ${TARGET_NETWORK_LABEL}`);
      }
      if (!name.trim()) {
        throw new Error('Shop name cannot be empty');
      }

      const walletAddress = Address.parse(wallet);
      const shopStateInit = await Shop.fromInit(walletAddress);
      if (!shopStateInit.init) {
        throw new Error('Failed to build shop init data');
      }

      const shopContract = client.open(shopStateInit);
      const deployed = await client.isContractDeployed(shopContract.address);
      const body = beginCell()
        .store(
          storeUpdateShopInfo({
            $$type: 'UpdateShopInfo',
            shopName: name,
            shopId: BigInt(userId),
          }),
        )
        .endCell();

      await sender.send({
        to: shopContract.address,
        value: toNano(deployed ? 0.05 : 0.1),
        bounce: deployed,
        ...(deployed
          ? {}
          : {
              init: {
                code: shopStateInit.init.code,
                data: shopStateInit.init.data,
              },
            }),
        body,
      });

      await waitForContractDeployment({
        client,
        address: shopContract.address,
      });

      await refreshShopInfo();
      return shopContract.address.toString();
    },
    [client, sender, wallet, connected, telegramUser, refreshShopInfo],
  );

  const makeItem = useCallback(
    async (params: {
      price: bigint;
      imageSrc: string;
      title: string;
      description: string;
    }) => {
      if (!client || !sender || !shopAddress || shopItemsCount === null) {
        throw new Error('Shop data not ready');
      }
      if (wrongNetwork) {
        throw new Error(`Переключите кошелёк в ${TARGET_NETWORK_LABEL}`);
      }

      const nextItemId = shopItemsCount;
      const itemStateInit = await Item.fromInit(Address.parse(shopAddress), nextItemId);
      if (!itemStateInit.init) {
        throw new Error('Failed to build item init data');
      }

      const itemContract = client.open(itemStateInit);
      const body = beginCell()
        .store(
          storeUpdateItem({
            $$type: 'UpdateItem',
            price: params.price,
            imageSrc: params.imageSrc,
            title: params.title,
            description: params.description,
          }),
        )
        .endCell();

      await sender.send({
        to: itemContract.address,
        value: toNano(0.1),
        bounce: false,
        init: {
          code: itemStateInit.init.code,
          data: itemStateInit.init.data,
        },
        body,
      });

      await waitForContractDeployment({
        client,
        address: itemContract.address,
      });

      await refreshShopInfo();
      await refreshItems();
    },
    [client, sender, shopAddress, shopItemsCount, refreshShopInfo, refreshItems],
  );

  return {
    marketAddress: userContract?.address.toString(),
    network,
    connected,
    wrongNetwork,
    shopAddress,
    shopName,
    shopItemsCount,
    shopDeployed,
    shopSyncing,
    refreshShopInfo,
    makeShop,
    items,
    itemsLoading,
    refreshItems,
    makeItem,
    targetNetworkLabel: TARGET_NETWORK_LABEL,
  };
}

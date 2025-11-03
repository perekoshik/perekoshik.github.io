import { Address, type OpenedContract, toNano } from "@ton/core";
import { useCallback, useState } from "react";
import { Shop } from "@/wrappers/Shop";
import { User } from "@/wrappers/User";
import { UsersFactory } from "@/wrappers/UsersFactory";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { useTonClient } from "./useTonClient";
import { useTonConnect } from "./useTonConnect";

export function useMarketContracts() {
	const { client } = useTonClient();
	const { wallet, sender } = useTonConnect();
	const { connected } = useTonConnect();

	const initUsersFactory = useCallback(async () => {
		if (!client) return;

		const usersFactoryContract = UsersFactory.fromAddress(
			Address.parse("kQApbRMD39StaHO1eJPpCG9lUGwr9k7Q5ypw0xhmKAnueFN_"),
		);

		return client.open(usersFactoryContract) as OpenedContract<UsersFactory>;
	}, [client]);

	const usersFactoryContract = useAsyncInitialize(initUsersFactory);

	const initUserContract = useCallback(async () => {
		if (!usersFactoryContract || !client || !wallet) return;

		const userAddress = await usersFactoryContract.getUserAddress(
			Address.parse(wallet),
		);

		return client.open(User.fromAddress(userAddress));
	}, [usersFactoryContract, client, wallet]);

	const userContract = useAsyncInitialize(initUserContract);

	// Building Shop

	const [shopAddress, setShopAddress] = useState<string | null>(null);
	const [shopName, setShopName] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const makeShop = async (shopName: string): Promise<string> => {
		if (!sender) {
			throw new Error("Sender not available");
		}
		if (!wallet) {
			throw new Error("Wallet not available");
		}
		if (!client) {
			throw new Error("Client not available");
		}
		if (!connected) {
			throw new Error("Disconnected");
		}

		if (!shopName.trim()) {
			throw new Error("Shop name cannot be empty");
		}

		let walletAddress: Address;
		try {
			walletAddress = Address.parse(wallet);
		} catch {
			throw new Error("Invalid wallet address format");
		}

		setLoading(true);
		let shopStateInit: Awaited<ReturnType<typeof Shop.fromInit>>;
		let shopContract: OpenedContract<Shop> | null = null;
		let retrievedName: string;

		try {
			try {
				shopStateInit = await Shop.fromInit(walletAddress);
				if (!shopStateInit.init) {
					throw new Error("Failed to initialize shop contract data");
				}
			} catch (initError) {
				throw new Error(
					`walletAddress.address: ${walletAddress.toString()} Failed to initialize shop contract: ${(initError as Error).message}`,
				);
			}

			try {
				shopContract = client.open(shopStateInit);
			} catch (openError) {
				throw new Error(
					`Failed to open shop contract: ${(openError as Error).message}`,
				);
			}

			try {
				if (!shopStateInit.init || !shopContract.address) {
					throw new Error("Invalid shopStateInit or shopAddress");
				}
				sender.send({
					to: shopContract.address,
					value: toNano(0.1),
					bounce: false,
					init: {
						code: shopStateInit.init.code,
						data: shopStateInit.init.data,
					},
				});
			} catch (sendError) {
				throw new Error(`Transaction failed: ${(sendError as Error).message}`);
			}

			try {
				await new Promise((resolve) => setTimeout(resolve, 30000));
			} catch (timeoutError) {
				throw new Error(`Timeout error: ${(timeoutError as Error).message}`);
			}

			const isDeployed = await client.isContractDeployed(shopStateInit.address);

			while (!isDeployed) {
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}

			if (!isDeployed) {
				throw new Error(
					"Shop contract deployment failed - contract not active",
				);
			}

			try {
				retrievedName = await shopContract.getShopName();
			} catch (getError) {
				throw new Error(
					`Failed to get shop data: ${(getError as Error).message}`,
				);
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
		},
	};
}

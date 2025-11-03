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

		try {
			const userAddress = await usersFactoryContract.getUserAddress(
				Address.parse(wallet),
			);

			// Check if the user contract is deployed before attempting to open it
			const isDeployed = await client.isContractDeployed(userAddress);
			if (!isDeployed) {
				console.warn(
					"User contract is not deployed at the expected address:",
					userAddress.toString(),
				);
				return null; // Return null if contract is not deployed
			}

			return client.open(User.fromAddress(userAddress));
		} catch (error) {
			console.error("Error initializing user contract:", error);
			throw error;
		}
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

		try {
			// Initialize shop contract
			const shopStateInit = await Shop.fromInit(walletAddress);
			if (!shopStateInit.init) {
				throw new Error("Failed to initialize shop contract data");
			}

			// Open the contract
			const shopContract = client.open(shopStateInit);

			if (!shopContract.address) {
				throw new Error("Invalid shop contract address");
			}

			// Send the transaction to deploy the shop
			await sender.send({
				to: shopContract.address,
				value: toNano(0.1),
				bounce: false,
				init: {
					code: shopStateInit.init.code,
					data: shopStateInit.init.data,
				},
			});

			// Wait for the transaction to be processed
			const startTime = Date.now();
			const timeout = 120000; // 2 minute timeout

			while (Date.now() - startTime < timeout) {
				await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second interval

				const isDeployed = await client.isContractDeployed(
					shopContract.address,
				);
				if (isDeployed) {
					// Get shop name after deployment
					try {
						const retrievedName = await shopContract.getShopName();

						setShopAddress(shopContract.address.toString());
						setShopName(retrievedName);

						return shopContract.address.toString();
					} catch (getNameError) {
						console.error(
							"Error getting shop name after deployment:",
							getNameError,
						);
						throw new Error(
							`Failed to get shop name after deployment: ${(getNameError as Error).message}`,
						);
					}
				}
			}

			throw new Error("Shop contract deployment timeout");
		} catch (error) {
			console.error("Error creating shop:", error);
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

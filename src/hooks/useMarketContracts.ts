import { Address, beginCell, type OpenedContract, toNano } from "@ton/core";
import { use, useCallback, useState } from "react";
import { Shop, storeUpdateShopInfo } from "@/wrappers/Shop";
import { User } from "@/wrappers/User";
import { UsersFactory } from "@/wrappers/UsersFactory";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { useTonClient } from "./useTonClient";
import { useTonConnect } from "./useTonConnect";
import { PassThrough } from "stream";
import { TWA } from "@/lib/twa";

export function useMarketContracts() {
	const { client } = useTonClient();
	const { wallet, sender } = useTonConnect();
	const { connected } = useTonConnect();
	const tgUser = TWA?.initDataUnsafe?.user;

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
	const [shopItemsCount, setShopItemsCount] = useState<BigInt | null>(null);

	const getShopInfo = async () => {
		try {
			console.log("IS DEPLOYED CHECK");
			if (!wallet || !client) return;
			const shopStateInit = await Shop.fromInit(Address.parse(wallet));
			const shopContract = client.open(shopStateInit);
			const isDeployed = await client.isContractDeployed(shopContract.address);
	
			if (isDeployed) {
				console.log("CONTRACT IS ALREADY DEPLOYED");
				const retrievedName = await shopContract.getShopName();
				setShopName(retrievedName);
				setShopAddress(shopContract.address.toString());
			}
		}
		catch {
			console.log("CONTRACT IS NOT DEPLOYED");
			setShopName("Hello, User!");
			if (wallet && client) setShopAddress(client.open( await Shop.fromInit(Address.parse(wallet))).address.toString());
		}
	}
	getShopInfo();


	const makeShop = async (shopName1: string): Promise<string> => {
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

		if (!shopName1.trim()) {
			throw new Error("Shop name cannot be empty");
		}

		if (!tgUser) {
			throw new Error("User not available");
		}

		let walletAddress: Address;
		try {
			walletAddress = Address.parse(wallet);
		} catch {
			throw new Error("Invalid wallet address format");
		}

		setLoading(true);

		try {
			// SOLUTION: Initialize and update the shop info in a single transaction
			// WHY: According to the specification, the contract should receive an init with
			// an accompanying message that updates the shop info with the proper shopName and user.id
			const shopStateInit = await Shop.fromInit(walletAddress);
			if (!shopStateInit.init) {
				throw new Error("Failed to initialize shop contract data");
			}

			// Open the contract
			const shopContract = client.open(shopStateInit);

			if (!shopContract.address) {
				throw new Error("Invalid shop contract address");
			}

			// SOLUTION: Handle contract initialization with update message as specified
			// WHY: According to specification, we should check if contract is deployed and handle appropriately
			// REF: User mentioned: "Если контракт уже задеплоен, посылать на него только месседж без инита, если нет - инит и месседж с апдейтом"

			// Create the UpdateShopInfo message with the shopName and initialize other values
			const updateShopInfoMsg = {
				$$type: "UpdateShopInfo" as const,
				shopName: shopName1, // Use the provided shop name from input
				shopId: BigInt(tgUser.id), // Initialize with 0; this will likely be updated later
			};

			// Check if the contract is already deployed
			const isDeployed = await client.isContractDeployed(shopContract.address);

			if (isDeployed) {
				// CONTRACT ALREADY DEPLOYED: Send only the update message
				// CHANGE: Use sender.send() instead of shopContract.send() for consistency
				// WHY: shopContract.send() was receiving incorrect provider type (double-wrapped OpenedContract)
				//      which caused "Invalid message type" error at tact_Shop.ts:2071 (body === null check)
				// QUOTE(ТЗ): "Если контракт уже задеплоен, посылать на него только месседж без инита"
				// REF: User screenshot showing "Invalid message type" error when creating shop
				// SOURCE: TON SDK best practices - use sender.send() for direct message dispatch to contracts


				await sender.send({
					to: shopContract.address,
					value: toNano(0.05),
					bounce: true,
					body: beginCell()
						.store(storeUpdateShopInfo(updateShopInfoMsg))
						.endCell(),
				});
			} else {
				// CONTRACT NOT DEPLOYED: Send both init and update message together
				// REF: "если нет - инит и месседж с апдейтом"
				await sender.send({
					to: shopContract.address,
					value: toNano(0.1),
					bounce: false,
					init: {
						code: shopStateInit.init.code,
						data: shopStateInit.init.data,
					},
					body: beginCell()
						.store(storeUpdateShopInfo(updateShopInfoMsg))
						.endCell(),
				});
			}

			// Wait for the transaction to be processed
			const startTime = Date.now();
			const timeout = 120000; // 2 minute timeout

			while (Date.now() - startTime < timeout) {
				await new Promise((resolve) => setTimeout(resolve, 10000)); // 2 second interval

				const isDeployed = await client.isContractDeployed(
					shopContract.address,
				);
				
				if (isDeployed) {
					// Get shop name after deployment/update
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

	const getShopItemsCount = async () => {
		if (!wallet || !client) return "";
		const shopStateInit = await Shop.fromInit(Address.parse(wallet));
		const shopContract = client.open(shopStateInit);

		setShopItemsCount(await shopContract.getItemsCount());
	};
	getShopItemsCount();


	return {
		//user
		marketAddress: userContract?.address.toString(),

		// shop
		getShopInfo,
		shopAddress,
		shopName,
		loading,
		isShopDeployed: !!shopAddress,
		makeShop,
		shopItemsCount,

	};
}

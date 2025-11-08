import { Address, beginCell, type OpenedContract, toNano } from "@ton/core";
import { useCallback, useEffect, useState } from "react";
// CHANGE: Removed unused imports
// WHY: TS6133 - 'use' is declared but its value is never read (line 2)
//      Biome noUnusedImports - 'PassThrough' is unused (line 3)
// REF: lint error report
import { TWA } from "@/lib/twa";
import { Item, storeUpdateItem } from "@/wrappers/Item";
import { Shop, storeUpdateShopInfo } from "@/wrappers/Shop";
// CHANGE: Removed unused type import UpdateItem
// WHY: TS6133 - 'UpdateItem' is declared but its value is never read
// REF: lint error report - only string literal "UpdateItem" is used in code
import { User } from "@/wrappers/User";
import { UsersFactory } from "@/wrappers/UsersFactory";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { useTonClient } from "./useTonClient";
import { useTonConnect } from "./useTonConnect";

/**
 * CHANGE: Extracted common transaction waiting logic
 * WHY: DRY principle - same polling pattern used in both makeShop and makeItem functions
 * REF: Duplicate code at lines 193-224 and 295-310
 */
interface TonClientLike {
	isContractDeployed(address: Address): Promise<boolean>;
}

interface WaitForDeploymentOptions {
	client: TonClientLike;
	address: Address;
	timeout?: number;
	interval?: number;
	onDeployed?: () => Promise<void>;
}

async function waitForContractDeployment(
	options: WaitForDeploymentOptions,
): Promise<void> {
	const {
		client,
		address,
		timeout = 120000,
		interval = 2000,
		onDeployed,
	} = options;
	const startTime = Date.now();

	while (Date.now() - startTime < timeout) {
		await new Promise((resolve) => setTimeout(resolve, interval));

		const isDeployed = await client.isContractDeployed(address);
		if (isDeployed) {
			if (onDeployed) {
				await onDeployed();
			}
			return;
		}
	}

	throw new Error("Contract deployment timeout");
}

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
	const [shopItemsCount, setShopItemsCount] = useState<bigint | null>(null);

	const getShopInfo = useCallback(async () => {
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
		} catch {
			console.log("CONTRACT IS NOT DEPLOYED");
			setShopName("Hello, User!");
			if (wallet && client)
				setShopAddress(
					client
						.open(await Shop.fromInit(Address.parse(wallet)))
						.address.toString(),
				);
		}
	}, [wallet, client]);

	// CHANGE: Move getShopInfo from component body to useEffect
	// WHY: Side effects in component body execute on every render, causing infinite loops and unnecessary RPC calls (exit_code -13)
	// QUOTE(ТЗ): user reported "Unable to execute get method. Got exit_code: -13" error
	// REF: React best practices - side effects must be in useEffect, not component body
	useEffect(() => {
		getShopInfo();
	}, [getShopInfo]);

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

			// CHANGE: Use extracted waitForContractDeployment helper
			// WHY: Reduces code duplication with makeItem function
			// REF: Duplicate polling logic removed
			await waitForContractDeployment({
				client,
				address: shopContract.address,
				timeout: 120000,
				interval: 10000,
				onDeployed: async () => {
					const retrievedName = await shopContract.getShopName();
					setShopAddress(shopContract.address.toString());
					setShopName(retrievedName);
				},
			});
			return shopContract.address.toString();
		} catch (error) {
			console.error("Error creating shop:", error);
			throw new Error(`Failed to create shop: ${(error as Error).message}`);
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Fetches the current items count from the deployed Shop contract
	 *
	 * INVARIANT: shopAddress must be set (from getShopInfo execution)
	 * PRECONDITION: client must be available, shopAddress must be valid Address string
	 * POSTCONDITION: setShopItemsCount is called with bigint value or unchanged on error
	 * COMPLEXITY: O(1) RPC call
	 */
	const getShopItemsCount = useCallback(async (): Promise<void> => {
		// Guard clause: Early exit if required dependencies are missing
		if (!client || !shopAddress) return;

		try {
			// CHANGE: Use Shop.fromAddress() with shopAddress instead of Shop.fromInit() with wallet
			// WHY: fromInit() creates contracts with owner initialization (wrong semantics here)
			//      fromAddress() opens existing deployed contract by its address (correct for fetching data)
			//      Function guard checks shopAddress (the actual shop), not wallet (owner)
			// QUOTE(ТЗ): [No direct quote, but inferred from guard clause and control flow]
			// REF: Shop class API - tact_Shop.ts:2238-2246
			// SOURCE: TON SDK pattern - use fromInit() for deployment, fromAddress() for existing contracts
			const shopContract = client.open(
				Shop.fromAddress(Address.parse(shopAddress)),
			);

			// CHANGE: Check contract deployment before calling get methods
			// WHY: Calling get methods on undeployed contracts causes exit_code: -13 error (contract not initialized)
			// QUOTE(ТЗ): "Unable to execute get method. Got exit_code: -13"
			// REF: TON RPC specification - -13 means contract code not found / not initialized
			const isDeployed = await client.isContractDeployed(shopContract.address);
			if (!isDeployed) {
				console.warn("Shop contract is not deployed, skipping getItemsCount");
				return;
			}

			// Fetch items count from deployed contract
			const itemsCount = await shopContract.getItemsCount();
			setShopItemsCount(itemsCount);
		} catch (error) {
			console.error("Error getting shop items count:", error);
			// CHANGE: Graceful error handling without state corruption
			// WHY: RPC calls can fail transiently; app must remain responsive
			//      Re-throw or log - don't silently fail with stale state
			// REF: Transient error handling pattern; user can retry via UI refresh
		}
	}, [client, shopAddress]);

	// CHANGE: Move getShopItemsCount from component body to useEffect
	// WHY: Side effects in component body execute on every render (exit_code -13 issue)
	// REF: React best practices - side effects must be in useEffect
	useEffect(() => {
		getShopItemsCount();
	}, [getShopItemsCount]);

	// Add new Item

	const makeItem = async (
		shopAddress: string,
		itemId: bigint,
		price: bigint,
		imageSrc: string,
		title: string,
		description: string,
	) => {
		if (!client) {
			console.error("No client");
			return;
		}
		console.warn("makeItem");

		const itemStateInit = await Item.fromInit(
			Address.parse(shopAddress),
			itemId,
		);
		const itemContract = client.open(itemStateInit);

		if (!itemStateInit.init) {
			console.error("itemStateInit.init is undefined");
			return;
		}

		const msg = {
			$$type: "UpdateItem" as const,
			price: price,
			imageSrc: imageSrc,
			title: title,
			description: description,
		};

		// deploy Item with info and body
		try {
			await sender.send({
				to: itemContract.address,
				value: toNano(0.1),
				bounce: false,
				init: {
					code: itemStateInit.init.code,
					data: itemStateInit.init.data,
				},
				body: beginCell().store(storeUpdateItem(msg)).endCell(),
			});
		} catch (err) {
			console.error("Error sending transaction:", err);
			return;
		}

		// CHANGE: Use extracted waitForContractDeployment helper
		// WHY: Reduces code duplication with makeShop function
		// REF: Duplicate polling logic removed
		await waitForContractDeployment({
			client,
			address: itemContract.address,
			timeout: 120000,
			interval: 2000,
		});
	};

	// list of items
	interface item_ {
		itemAddress: string;
		itemId: bigint;
		itemPrice: bigint;
		itemImageSrc: string;
		itemTitle: string;
		itemDescription: string;
	}
	const [itemsList, setItemsList] = useState<Map<number, item_>>(new Map());

	const itemsList_ = useCallback(async () => {
		const items: Map<number, item_> = new Map();

		// CHANGE: Check explicitly for null instead of falsy check on shopItemsCount
		// WHY: shopItemsCount can be 0n (no items) which is falsy but valid state
		//      Only null means not yet loaded; 0n means shop ready with 0 items
		//      When 0n: for loop executes 0 times, still initializes empty Map (correct)
		// QUOTE(ТЗ): Guard checks shopAddress/client (required), but 0n is valid
		// REF: useState<bigint | null>(null) - initial state is null
		// SOURCE: Distinguish "not loaded" (null) from "loaded with 0 items" (0n)
		if (!shopAddress || !client || shopItemsCount === null) {
			setItemsList(new Map());
			return;
		}

		try {
			// CHANGE: Add deployment check before iterating items
			// WHY: Prevents calling get methods on undeployed contracts (exit_code -13)
			// REF: Item contracts may not be deployed yet
			const isShopDeployed = await client.isContractDeployed(
				Address.parse(shopAddress),
			);
			if (!isShopDeployed) {
				console.warn("Shop contract is not deployed, skipping items list");
				setItemsList(new Map());
				return;
			}

			for (let i = 0; i < Number(shopItemsCount); i++) {
				try {
					const itemStateInit = await Item.fromInit(
						Address.parse(shopAddress),
						BigInt(i),
					);
					const itemContract = client.open(itemStateInit);

					// CHANGE: Check item deployment before calling get methods
					// WHY: Avoid exit_code -13 errors on undeployed items
					const isItemDeployed = await client.isContractDeployed(
						itemContract.address,
					);
					if (!isItemDeployed) {
						console.warn(`Item ${i} is not deployed, skipping`);
						continue;
					}

					items.set(i, {
						itemAddress: itemContract.address.toString(),
						itemId: await itemContract.getId(),
						itemPrice: await itemContract.getPrice(),
						itemImageSrc: await itemContract.getImageSrc(),
						itemTitle: await itemContract.getTitle(),
						itemDescription: await itemContract.getDescription(),
					});
				} catch (itemError) {
					console.error(`Error loading item ${i}:`, itemError);
					// Continue with next item on error
				}
			}
			setItemsList(items);
		} catch (error) {
			console.error("Error loading items list:", error);
		}
	}, [shopAddress, client, shopItemsCount]);

	// CHANGE: Move itemsList_ from component body to useEffect
	// WHY: Side effects in component body cause infinite RPC calls (exit_code -13)
	// REF: React best practices - side effects must be in useEffect
	useEffect(() => {
		itemsList_();
	}, [itemsList_]);

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

		// item
		makeItem,
		itemsList,
	};
}

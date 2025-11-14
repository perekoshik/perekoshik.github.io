import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Address, fromNano } from '@ton/core';
import Card, { type Item } from '@/components/Card';
import CategoryPills from '@/components/CategoryPills';
import Hero from '@/components/Hero';
import Skeleton from '@/components/Skeleton';
import { Api, type ShopRecord } from '@/lib/api';
import { useTonClient } from '@/hooks/useTonClient';
import { Item as TonItem } from '@/wrappers/Item';
import { Shop as TonShop } from '@/wrappers/Shop';
import { resolveMediaUrl } from '@/lib/media';
import { defaultImage } from '@/constants/images';

const SKELETON4 = ["s1", "s2", "s3", "s4"] as const;
const SKELETON8 = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

const categories = [
	"All",
	"Featured",
	"New",
	"Gaming",
	"Art",
	"Collectibles",
	"Music",
	"Domains",
] as const;

type Category = (typeof categories)[number];
type HomeItem = Item & { category: Category; shopAddress: string };

export default function Home() {
	const [items, setItems] = useState<HomeItem[] | null>(null);
	const [activeCategory, setActiveCategory] = useState<Category>('All');
	const nav = useNavigate();
	const { client } = useTonClient();

	useEffect(() => {
		if (!client) return;
		let cancelled = false;
		const load = async () => {
			setItems(null);
			try {
				const shops = await Api.listShops();
				const tonItems = await collectTonItems(client, shops);
				if (!cancelled) {
					setItems(tonItems.map(mapTonItem));
				}
			} catch (error) {
				console.error('Failed to load TON items', error);
				if (!cancelled) {
					setItems([]);
				}
			} finally {
				/* no-op */
			}
		};
		load();
		return () => {
			cancelled = true;
		};
	}, [client]);

	const featuredItems = useMemo(() => {
		if (!items) return [];
		return items.filter((item) => item.badge === "Featured").slice(0, 4);
	}, [items]);

	const trendingItems = useMemo(() => {
		if (!items) return [];
		const highlight = items.filter((item) => item.badge === "New").slice(0, 6);
		return highlight.length ? highlight : items.slice(0, 6);
	}, [items]);

	const visibleItems = useMemo(() => {
		if (!items) return null;
		if (activeCategory === "All") return items;
		return items.filter((item) => item.category === activeCategory);
	}, [items, activeCategory]);

	return (
		<div className="container pb-24 space-y-6 sm:space-y-8">
			<Hero />

			<section className="space-y-3 sm:space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-base font-semibold text-txt">Categories</h2>
					<span className="text-[11px] uppercase tracking-[0.28em] text-txt/50">
						Browse
					</span>
				</div>
				<CategoryPills
					items={[...categories]}
					value={activeCategory}
					onChange={(next) => setActiveCategory(next as Category)}
				/>
			</section>

			<section className="space-y-3 sm:space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-base font-semibold text-txt">Featured Items</h2>
					<span className="text-[11px] uppercase tracking-[0.28em] text-txt/50">
						Curated
					</span>
				</div>
				{items ? (
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
						{featuredItems.map((item) => (
							<Card
								key={item.id}
								item={item}
								onClick={() => nav(`/item/${encodeURIComponent(item.id)}`)}
							/>
						))}
					</div>
				) : (
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
						{SKELETON4.map((k) => (
							<Skeleton key={k} className="aspect-square" />
						))}
					</div>
				)}
				{items && featuredItems.length === 0 && (
					<div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-txt/70">
						Featured items will appear here once curated.
					</div>
				)}
			</section>

			<section className="space-y-3 sm:space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-base font-semibold text-txt">Trending Now</h2>
					<span className="text-[11px] uppercase tracking-[0.28em] text-txt/50">
						Refresh
					</span>
				</div>
				<div className="-mx-4 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0">
					<div className="flex gap-3 sm:gap-4">
						{items
							? trendingItems.map((item) => (
									<div
										key={item.id}
										className="min-w-[200px] max-w-[220px] flex-none sm:min-w-[230px]"
									>
										<Card item={item} onClick={() => nav(`/item/${encodeURIComponent(item.id)}`)} />
									</div>
								))
							: SKELETON4.map((k) => (
									<div
										key={k}
										className="min-w-[200px] max-w-[220px] flex-none sm:min-w-[230px]"
									>
										<Skeleton className="h-[220px] rounded-2xl" />
									</div>
								))}
					</div>
				</div>
				{items && trendingItems.length === 0 && (
					<div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-txt/70">
						No trending products right now. Check the latest arrivals below.
					</div>
				)}
			</section>

			<section>
				<div className="space-y-3 sm:space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-base font-semibold text-txt">All Items</h2>
						<span className="text-[11px] uppercase tracking-[0.28em] text-txt/50">
							Updated
						</span>
					</div>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
						{!visibleItems &&
							SKELETON8.map((k) => (
								<Skeleton key={k} className="aspect-square" />
							))}
				{visibleItems?.map((item) => (
					<Card
						key={item.id}
						item={item}
						onClick={() => nav(`/item/${item.id}`)}
					/>
				))}
					</div>
				</div>

				{visibleItems && visibleItems.length === 0 && (
					<div className="mt-6 rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-txt/70">
						Nothing in this category yet. Check back soon — we are sourcing the
						next drop.
					</div>
				)}
			</section>
		</div>
	);
}

type TonChainItem = {
	id: string;
	shopAddress: string;
	title: string;
	description: string;
	priceNano: bigint;
	imageSrc: string;
};

function mapTonItem(record: TonChainItem): HomeItem {
	return {
		id: record.id,
		shopAddress: record.shopAddress,
		title: record.title || 'Без названия',
		image: record.imageSrc,
		price: `${fromNano(record.priceNano)} TON`,
		badge: 'On-chain',
		category: 'All',
	};
}

async function collectTonItems(client: NonNullable<ReturnType<typeof useTonClient>['client']>, shops: ShopRecord[]) {
	const items: TonChainItem[] = [];
	for (const shop of shops) {
		try {
			const address = Address.parse(shop.address);
			const shopContract = client.open(TonShop.fromAddress(address));
			const deployed = await client.isContractDeployed(shopContract.address);
			if (!deployed) continue;
			const itemsCount = await shopContract.getItemsCount();
			for (let index = 0; index < Number(itemsCount); index += 1) {
				const itemState = await TonItem.fromInit(address, BigInt(index));
				const itemContract = client.open(itemState);
				if (!(await client.isContractDeployed(itemContract.address))) continue;
				const [imageSrc, title, description, price] = await Promise.all([
					itemContract.getImageSrc(),
					itemContract.getTitle(),
					itemContract.getDescription(),
					itemContract.getPrice(),
				]);
				items.push({
					id: itemContract.address.toString(),
					shopAddress: shop.address,
					title,
					description,
					priceNano: price,
					imageSrc: resolveMediaUrl(imageSrc, defaultImage) ?? defaultImage,
				});
			}
		} catch (error) {
			console.warn('[home] failed to load shop items', shop.address, error);
		}
	}
	return items;
}

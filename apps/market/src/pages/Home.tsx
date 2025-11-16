import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { type Item } from '@/components/Card';
import CategoryPills from '@/components/CategoryPills';
import Hero from '@/components/Hero';
import Skeleton from '@/components/Skeleton';
import { Api, type ProductRecord } from '@/lib/api';

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
type HomeItem = Item & { category: Category };

export default function Home() {
	const [items, setItems] = useState<HomeItem[] | null>(null);
	const [activeCategory, setActiveCategory] = useState<Category>("All");
	const nav = useNavigate();

	useEffect(() => {
		let cancelled = false;
		setItems(null);
		Api.listProducts()
			.then((products) => {
				if (!cancelled) {
					setItems(products.map(mapProductToItem));
				}
			})
			.catch((error) => {
				console.error("Failed to load products", error);
				if (!cancelled) {
					setItems([]);
				}
			});
		return () => {
			cancelled = true;
		};
	}, []);

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
								onClick={() => nav(`/item/${encodeURIComponent(item.id)}`)}
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

function mapProductToItem(product: ProductRecord): HomeItem {
	const createdAt = new Date(product.createdAt).getTime();
	const recentCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
	let category: Category = "All";
	if (createdAt > recentCutoff) {
		category = "New";
	} else if (product.ratingAverage >= 4) {
		category = "Featured";
	}

	return {
		id: product.id,
		title: product.title || "Без названия",
		image: product.imageUrl,
		price: `${product.priceTon} TON`,
		badge: product.ratingCount > 0 ? "Rated" : undefined,
		category,
	};
}

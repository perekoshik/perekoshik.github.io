import { useEffect, useState } from 'react';
import { Loader2, PackageOpen } from 'lucide-react';
import { OrdersList } from '@market/components/OrdersList';
import Skeleton from '@/components/Skeleton';
import { useTonConnect } from '@/hooks/useTonConnect';
import { Api, type OrderRecord } from '@/lib/api';

export default function Orders() {
	const { wallet, connected } = useTonConnect();
	const [orders, setOrders] = useState<OrderRecord[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!wallet) {
			setOrders([]);
			setLoading(false);
			return;
		}
		let cancelled = false;
		setLoading(true);
		setError(null);
		Api.listOrders({ buyer: wallet })
			.then((list) => {
				if (!cancelled) {
					setOrders(list);
				}
			})
			.catch((err) => {
				console.error('Failed to load orders', err);
				if (!cancelled) {
					setError('Не удалось загрузить заказы.');
				}
			})
			.finally(() => {
				if (!cancelled) {
					setLoading(false);
				}
			});
		return () => {
			cancelled = true;
		};
	}, [wallet]);

	return (
		<div className="container pb-24 space-y-6 sm:space-y-8">
			<header className="pt-4 space-y-2">
				<h1 className="text-xl font-semibold text-txt">Orders</h1>
				<p className="text-sm text-txt/70">
					История покупок из Web3Market. Подключите TonConnect, чтобы загрузить список.
				</p>
			</header>

			<section className="glass rounded-3xl p-5 sm:p-6 space-y-4">
				{!connected ? (
					<EmptyState />
				) : loading ? (
					<div className="space-y-3">
						<Skeleton className="h-6 w-1/3" />
						<Skeleton className="h-32" />
					</div>
				) : error ? (
					<div className="rounded-2xl border border-red-500/40 bg-red-500/5 p-4 text-sm text-red-200">
						{error}
					</div>
				) : (
					<OrdersList orders={orders} />
				)}
			</section>
		</div>
	);
}

function EmptyState() {
	return (
		<div className="flex flex-col items-center gap-3 text-center text-sm text-txt/70">
			<div className="rounded-full bg-white/5 p-3 text-brand">
				<PackageOpen className="h-5 w-5" />
			</div>
			<p>Подключите TonConnect кошелёк, чтобы увидеть ваши заказы.</p>
			<div className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-txt/70">
				<Loader2 className="h-4 w-4 animate-spin" />
				<span>Ожидаем подключение…</span>
			</div>
		</div>
	);
}

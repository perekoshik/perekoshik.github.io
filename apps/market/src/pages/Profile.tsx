import { useEffect, useState } from 'react';
import { Address } from '@ton/core';
import { CHAIN } from '@tonconnect/ui-react';
import { Link } from 'react-router-dom';
import { Loader2, UserRound } from 'lucide-react';
import Media from '@/components/Media';
import Skeleton from '@/components/Skeleton';
import { useMarketContracts } from '@/hooks/useMarketContracts';
import { useTonConnect } from '@/hooks/useTonConnect';
import { Api, type OrderRecord } from '@/lib/api';
import { TWA } from '@/lib/twa';
import { OrdersList } from '@market/components/OrdersList';

export default function Profile() {
	const user = TWA?.initDataUnsafe?.user;
	const avatarUrl = user?.photo_url;
	const initials = user ? buildInitials(user.first_name, user.last_name) : 'DP';
	const { wallet, connected, network } = useTonConnect();
	const { marketAddress } = useMarketContracts();
	const [addressValue, setAddressValue] = useState('');
	const [addressStatus, setAddressStatus] = useState<StatusMessage>(null);
	const [addressLoading, setAddressLoading] = useState(false);
	const [addressSaving, setAddressSaving] = useState(false);
	const [orders, setOrders] = useState<OrderRecord[]>([]);
	const [ordersLoading, setOrdersLoading] = useState(false);
	const [ordersError, setOrdersError] = useState<string | null>(null);

	useEffect(() => {
		if (!wallet) {
			setAddressValue('');
			setAddressStatus(null);
			return;
		}
		let cancelled = false;
		setAddressLoading(true);
		setAddressStatus(null);
		Api.getProfile(wallet)
			.then((profile) => {
				if (cancelled) return;
				setAddressValue(profile.deliveryAddress ?? '');
			})
			.catch((error) => {
				console.error('Failed to load profile', error);
				if (!cancelled) {
					setAddressStatus({ type: 'error', text: 'Не удалось загрузить адрес доставки.' });
				}
			})
			.finally(() => {
				if (!cancelled) {
					setAddressLoading(false);
				}
			});
		return () => {
			cancelled = true;
		};
	}, [wallet]);

	const refreshOrders = () => {
		if (!wallet) {
			setOrders([]);
			return;
		}
		let cancelled = false;
		setOrdersLoading(true);
		setOrdersError(null);
		Api.listOrders({ buyer: wallet })
			.then((list) => {
				if (!cancelled) {
					setOrders(list);
				}
			})
			.catch((error) => {
				console.error('Failed to load orders', error);
				if (!cancelled) {
					setOrdersError('Не удалось загрузить заказы.');
				}
			})
			.finally(() => {
				if (!cancelled) {
					setOrdersLoading(false);
				}
			});
		return () => {
			cancelled = true;
		};
	};

	useEffect(() => {
		const cancel = refreshOrders();
		return () => {
			if (typeof cancel === 'function') {
				cancel();
			}
		};
	}, [wallet]);

	const handleSaveAddress = async () => {
		if (!connected || !wallet) {
			setAddressStatus({ type: 'error', text: 'Подключите TonConnect, чтобы сохранить адрес.' });
			return;
		}
		const trimmed = addressValue.trim();
		if (!trimmed) {
			setAddressStatus({ type: 'error', text: 'Введите адрес доставки.' });
			return;
		}
		setAddressSaving(true);
		setAddressStatus(null);
		try {
			await Api.saveProfile(wallet, trimmed);
			setAddressStatus({ type: 'success', text: 'Адрес сохранён.' });
		} catch (error) {
			console.error('Failed to save profile', error);
			setAddressStatus({ type: 'error', text: 'Не удалось сохранить адрес. Попробуйте повторить.' });
		} finally {
			setAddressSaving(false);
		}
	};

	return (
		<div className="container pb-24 space-y-6 sm:space-y-8">
			<header className="pt-4">
				<h1 className="text-xl font-semibold">Profile</h1>
				<p className="mt-1 text-sm text-txt/70">Управляйте данными доставки и отслеживайте заказы.</p>
			</header>

			<section className="glass rounded-3xl p-5 sm:p-6">
				{user ? (
					<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-4">
							<AvatarCircle
								{...(avatarUrl && { url: avatarUrl })}
								initials={initials}
							/>
							<div>
								<div className="text-lg font-semibold">
									{user.first_name} {user.last_name}
								</div>
								<div className="text-sm text-txt/70">
									@{user.username ?? "unknown"}
								</div>
							</div>
						</div>
						<div className="grid gap-2 text-sm text-txt/70 sm:text-right">
							<span>ID: {user.id}</span>
							{user.language_code && (
								<span>Language: {user.language_code.toUpperCase()}</span>
							)}
						</div>
						{connected ? (
							<div className="grid gap-2 text-sm text-txt/70 sm:text-right">
								<span>
									Wallet:{" "}
									{Address.parse(wallet as string).toString({
										bounceable: false,
										testOnly: network === CHAIN.TESTNET,
									})}
								</span>
								<span>Network: {network ?? "unknown"}</span>
								<span>
									MarketWallet:{" "}
									{marketAddress ? marketAddress : "Something bad("}
								</span>
							</div>
						) : (
							<div className="grid gap-2 text-sm text-txt/70 sm:text-right">
								<span>Connect your wallet to see your account details</span>
							</div>
						)}
					</div>
				) : (
					<div className="flex flex-col items-start gap-3 text-sm text-txt/70">
						<span className="inline-flex items-center gap-2 text-base font-medium text-txt">
							<UserRound className="h-4 w-4" /> Guest
						</span>
						<p>
							Open inside Telegram to see your account details and manage
							purchases.
						</p>
					</div>
				)}
			</section>

			<section className="glass rounded-3xl p-5 sm:p-6 space-y-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 className="text-base font-semibold">Адрес доставки</h2>
						<p className="text-sm text-txt/70">Сохраняется локально в API и подставляется при покупке.</p>
					</div>
					<button
						type="button"
						onClick={handleSaveAddress}
						disabled={!connected || addressLoading || addressSaving}
						className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-txt/70 transition-colors duration-150 hover:border-white/30 disabled:opacity-60"
					>
						{addressSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Сохранить'}
					</button>
				</div>
				<textarea
					value={addressValue}
					onChange={(event) => setAddressValue(event.target.value)}
					rows={3}
					placeholder="Например: Москва, ул. Ленина 1, офис 10"
					className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none transition-colors duration-150 focus:border-brand/60"
					disabled={!connected || addressLoading}
				/>
				{addressLoading && <p className="text-xs text-txt/60">Загружаем сохранённый адрес…</p>}
				{!connected && <p className="text-sm text-yellow-500">Подключите TonConnect, чтобы сохранять адрес доставки.</p>}
				{addressStatus && (
					<div
						className={`rounded-2xl px-4 py-3 text-sm ${addressStatus.type === 'success' ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}
					>
						{addressStatus.text}
					</div>
				)}
			</section>

			<section className="space-y-3">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-base font-semibold">История заказов</h2>
						<p className="text-sm text-txt/70">Отображается всё, что оформлено с вашим кошельком.</p>
					</div>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={refreshOrders}
							disabled={!wallet || ordersLoading}
							className="text-xs text-txt/60 underline-offset-4 hover:text-txt"
						>
							Обновить
						</button>
						<Link
							to="/orders"
							className="text-xs text-brand underline underline-offset-4"
						>
							Все заказы
						</Link>
					</div>
				</div>
				{!connected ? (
					<div className="rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-txt/70">
						Подключите TON-кошелёк, чтобы увидеть историю покупок.
					</div>
				) : ordersLoading ? (
					<div className="space-y-3">
						<Skeleton className="h-28 rounded-3xl" />
						<Skeleton className="h-28 rounded-3xl" />
					</div>
				) : ordersError ? (
					<div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-red-200">
						{ordersError}
					</div>
				) : (
					<OrdersList orders={orders} />
				)}
			</section>
		</div>
	);
}

type StatusMessage = { type: 'success' | 'error'; text: string } | null;

function buildInitials(first?: string, last?: string) {
	const firstInitial = first?.[0]?.toUpperCase() ?? "";
	const lastInitial = last?.[0]?.toUpperCase() ?? "";
	return `${firstInitial}${lastInitial}` || "TG";
}

function AvatarCircle({ url, initials }: { url?: string; initials: string }) {
	if (url) {
		return (
			<div className="h-16 w-16 overflow-hidden rounded-2xl">
				<Media key={url} src={url} alt="User avatar" />
			</div>
		);
	}

	return (
		<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/25 text-lg font-semibold text-txt">
			{initials}
		</div>
	);
}

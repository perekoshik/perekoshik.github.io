import { ArrowLeft, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Media from '@/components/Media';
import Skeleton from '@/components/Skeleton';
import { TWA } from '@/lib/twa';
import { Api, type ItemRecord } from '@/lib/api';
import { defaultImage } from '@/constants/images';
import { useTonConnect } from '@/hooks/useTonConnect';

export default function Item() {
	const { id } = useParams();
	const { wallet } = useTonConnect();
	const [item, setItem] = useState<ItemRecord | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [pending, setPending] = useState(false);
	const [deliveryAddress, setDeliveryAddress] = useState('');
	const [orderError, setOrderError] = useState<string | null>(null);
	const [hasManualAddress, setHasManualAddress] = useState(false);

	const mainButton = TWA?.MainButton;

	const handleClose = useCallback(() => {
		setPending(false);
		setModalOpen(false);
		setOrderError(null);
	}, []);

	const handleConfirm = useCallback(async () => {
		if (pending) return;
		if (!item) {
			setOrderError('Товар недоступен.');
			return;
		}
		if (!wallet) {
			setOrderError('Подключите TON кошелёк, чтобы оформить заказ.');
			return;
		}
		if (!deliveryAddress.trim()) {
			setOrderError('Введите адрес доставки.');
			return;
		}
		setPending(true);
		setOrderError(null);
		try {
			await Api.createOrder({
				buyer: wallet,
				shopAddress: item.shopAddress,
				itemId: item.id,
				price: item.price,
				deliveryAddress: deliveryAddress.trim(),
			});
				window.alert('Заказ создан. Продавец получил данные доставки.');
				handleClose();
		} catch (apiError) {
			console.error('Failed to create order', apiError);
			setOrderError('Не удалось создать заказ. Попробуйте ещё раз.');
		} finally {
			setPending(false);
		}
	}, [pending, item, wallet, deliveryAddress, handleClose]);

	const openModal = () => {
		setOrderError(null);
		setModalOpen(true);
	};

	useEffect(() => {
		if (!mainButton) return;

		if (!modalOpen) {
			mainButton.hide();
			return;
		}

		const addressMissing = !deliveryAddress.trim();
		const buttonDisabled = pending || !wallet || addressMissing;
		mainButton.setParams({
			text: pending ? 'Создаём заказ…' : 'Подтвердить заказ',
		});
		if (buttonDisabled) {
			mainButton.disable();
		} else {
			mainButton.enable();
		}
		mainButton.show();

		const click = () => handleConfirm();
		mainButton.onClick(click);

		return () => {
			mainButton.offClick(click);
			mainButton.hide();
		};
	}, [mainButton, modalOpen, pending, handleConfirm, deliveryAddress, wallet]);

	useEffect(() => {
		if (!modalOpen) return;

		const handleKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				handleClose();
			}
		};

		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [modalOpen, handleClose]);

	useEffect(() => {
		return () => {
			setPending(false);
			mainButton?.hide();
		};
	}, [mainButton]);

	useEffect(() => {
		if (!wallet) {
			setDeliveryAddress('');
			setHasManualAddress(false);
			return;
		}
		let cancelled = false;
		Api.getProfile(wallet)
			.then((profile) => {
				if (cancelled || hasManualAddress) return;
				setDeliveryAddress((current) => current || profile.deliveryAddress || '');
			})
			.catch((error) => {
				console.error('Failed to load profile address', error);
			})
			.finally(() => {
				/* no-op */
			});
		return () => {
			cancelled = true;
		};
	}, [wallet, hasManualAddress]);

	useEffect(() => {
		if (!id) {
			setError('Item not found');
			setLoading(false);
			return;
		}
		setLoading(true);
		setError(null);
		Api.getItem(id)
			.then((record) => {
				setItem(record);
			})
			.catch((err) => {
				console.error('Failed to load item', err);
				setError('Failed to load item');
			})
			.finally(() => setLoading(false));
	}, [id]);

	const mediaSrc = item?.imageSrc || defaultImage;
	const title = item?.title ?? 'Unknown item';
	const description = item?.description ?? 'No description provided yet.';
	const priceLabel = item ? `${item.price} TON` : '—';
	const buyDisabled = !item || !wallet;

	const content = loading ? (
		<div className="space-y-4">
			<Skeleton className="h-8 w-1/3" />
			<Skeleton className="aspect-square" />
			<Skeleton className="h-20" />
		</div>
	) : error || !item ? (
		<div className="rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-txt/70">
			{error ?? 'Item not found'}
		</div>
	) : (
		<article className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
			<div className="glass relative overflow-hidden rounded-3xl">
				<div className="aspect-square">
					<Media key={mediaSrc} src={mediaSrc} alt={title} />
				</div>
			</div>

			<div className="space-y-5">
				<header className="space-y-3">
					<div className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-txt/60">
						Shop item
					</div>
					<h1 className="text-2xl font-semibold leading-tight sm:text-3xl">{title}</h1>
					<p className="text-sm text-txt/70 sm:text-base">{description}</p>
				</header>

				<section className="grid gap-3 sm:grid-cols-2">
					<div className="glass rounded-2xl p-4">
						<div className="text-xs uppercase tracking-[0.24em] text-txt/50">Price</div>
						<div className="mt-2 text-2xl font-semibold">{priceLabel}</div>
					</div>
					<div className="glass rounded-2xl p-4">
						<div className="text-xs uppercase tracking-[0.24em] text-txt/50">Availability</div>
						<div className="mt-2 text-sm text-txt/80">Ready to ship</div>
					</div>
				</section>

				<div className="space-y-2">
					<button
						type="button"
						className="w-full rounded-2xl bg-brand/25 py-3 text-sm font-medium text-txt transition-colors duration-150 hover:bg-brand/30"
						onClick={openModal}
						disabled={buyDisabled}
					>
						Buy now
					</button>
					<Link
						to="/orders"
						className="block w-full rounded-2xl border border-white/10 py-3 text-center text-sm font-medium text-txt/80 transition-colors duration-150 hover:border-white/30 hover:text-txt"
					>
						View orders
					</Link>
					{!wallet && (
						<p className="text-xs text-yellow-500">Подключите TON кошелёк, чтобы оформить заказ.</p>
					)}
				</div>
			</div>
		</article>
	);

	return (
		<div className="container pb-24">
			<div className="sticky top-14 z-20 -mx-4 flex items-center gap-3 border-b border-white/5 bg-bg/80 px-4 py-3 backdrop-blur sm:top-16 sm:mx-0 sm:px-0">
				<Link to="/" className="glass rounded-xl p-2" aria-label="Back to home">
					<ArrowLeft className="h-4 w-4" />
				</Link>
				<div className="text-sm text-txt/70">Product</div>
				<div className="ml-auto text-sm">#{id}</div>
			</div>
			{content}

			{modalOpen && (
				<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 pb-6 pt-20 backdrop-blur-sm sm:items-center">
					<div className="relative w-full max-w-md rounded-3xl bg-bg.card p-5 shadow-soft">
						<button
							type="button"
							className="absolute right-4 top-4 rounded-xl border border-white/10 p-2 text-txt/70 transition-colors duration-150 hover:text-txt"
							onClick={handleClose}
							aria-label="Close purchase modal"
						>
							<X className="h-4 w-4" />
						</button>
						<div className="space-y-4">
							<header className="space-y-1 pr-8">
								<h2 className="text-lg font-semibold">Confirm purchase</h2>
								<p className="text-sm text-txt/70">
									Review the item details before completing your order.
								</p>
							</header>
								<div className="flex gap-3 rounded-2xl border border-white/10 p-3">
									<div className="h-16 w-16 overflow-hidden rounded-xl">
										<Media src={mediaSrc} alt={title} />
								</div>
								<div className="space-y-1 text-sm">
									<div className="font-medium text-txt">
										{title}
									</div>
										<div className="text-txt/60">Shop item</div>
										<div className="text-txt">{priceLabel}</div>
								</div>
							</div>
							<div className="space-y-3">
								<div className="space-y-2">
									<label className="text-xs font-semibold uppercase tracking-[0.3em] text-txt/60">
										Адрес доставки
									</label>
									<textarea
										value={deliveryAddress}
										onChange={(event) => {
											setHasManualAddress(true);
											setDeliveryAddress(event.target.value);
										}}
										rows={3}
										className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand/60"
										disabled={pending}
										placeholder="Укажите город, улицу и контакты для курьера"
									/>
									<p className="text-xs text-txt/60">
										Адрес будет сохранён в заказе и передан продавцу.
									</p>
								</div>

								{orderError && (
									<div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
										{orderError}
									</div>
								)}

								<div className="space-y-1 rounded-2xl border border-white/10 p-3 text-xs text-txt/60">
									<div className="flex items-center justify-between">
										<span>Subtotal</span>
										<span>{priceLabel}</span>
									</div>
									<div className="flex items-center justify-between">
										<span>Network fee</span>
										<span>Included</span>
									</div>
									<div className="flex items-center justify-between text-sm font-semibold text-txt">
										<span>Total</span>
										<span>{priceLabel}</span>
									</div>
								</div>

								<div className="space-y-2 text-xs text-txt/60">
									<p>
										Телеграм-кнопка внизу повторяет действие «Подтвердить заказ».
									</p>
									<button
										type="button"
										className="w-full rounded-2xl bg-brand/25 py-3 text-sm font-medium text-txt transition-colors duration-150 hover:bg-brand/30 disabled:opacity-60"
										onClick={handleConfirm}
										disabled={pending || buyDisabled}
									>
										{pending ? 'Создаём заказ…' : 'Подтвердить заказ'}
									</button>
									<button
										type="button"
										className="w-full rounded-2xl border border-white/10 py-3 text-sm font-medium text-txt/80"
										onClick={handleClose}
									>
										Cancel
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

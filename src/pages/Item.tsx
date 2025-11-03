import { ArrowLeft, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Media from "@/components/Media";
import { TWA } from "@/lib/twa";

const description =
	"Ultra rare relic from the Void collection. Premium craft, verified provenance and ready for your vault.";

export default function Item() {
	const { id } = useParams();
	const mediaSrc = `https://picsum.photos/seed/${id}/1000/1000`;
	const [modalOpen, setModalOpen] = useState(false);
	const [pending, setPending] = useState(false);
	const timeoutRef = useRef<number | null>(null);

	const mainButton = TWA?.MainButton;

	const handleClose = useCallback(() => {
		setPending(false);
		setModalOpen(false);
	}, []);

	const handleConfirm = useCallback(() => {
		if (pending) return;
		setPending(true);
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		timeoutRef.current = window.setTimeout(() => {
			handleClose();
			window.alert("Purchase complete. Item added to your orders.");
			timeoutRef.current = null;
		}, 900);
	}, [pending, handleClose]);

	const openModal = () => {
		setModalOpen(true);
	};

	useEffect(() => {
		if (!mainButton) return;

		if (!modalOpen) {
			mainButton.hide();
			return;
		}

		mainButton.setParams({
			text: pending ? "Processing…" : "Confirm purchase",
		});
		if (pending) {
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
	}, [mainButton, modalOpen, pending, handleConfirm]);

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
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
			setPending(false);
			mainButton?.hide();
		};
	}, [mainButton]);

	return (
		<div className="container pb-24">
			<div className="sticky top-14 z-20 -mx-4 flex items-center gap-3 border-b border-white/5 bg-bg/80 px-4 py-3 backdrop-blur sm:top-16 sm:mx-0 sm:px-0">
				<Link to="/" className="glass rounded-xl p-2" aria-label="Back to home">
					<ArrowLeft className="h-4 w-4" />
				</Link>
				<div className="text-sm text-txt/70">Product</div>
				<div className="ml-auto text-sm">#{id}</div>
			</div>

			<article className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
				<div className="glass relative overflow-hidden rounded-3xl">
					<div className="aspect-square">
						<Media
							key={mediaSrc}
							src={mediaSrc}
							alt={`Preview of item ${id}`}
						/>
					</div>
				</div>

				<div className="space-y-5">
					<header className="space-y-3">
						<div className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-txt/60">
							Void collection
						</div>
						<h1 className="text-2xl font-semibold leading-tight sm:text-3xl">
							Genesis Shard #{id}
						</h1>
						<p className="text-sm text-txt/70 sm:text-base">{description}</p>
					</header>

					<section className="grid gap-3 sm:grid-cols-2">
						<div className="glass rounded-2xl p-4">
							<div className="text-xs uppercase tracking-[0.24em] text-txt/50">
								Price
							</div>
							<div className="mt-2 text-2xl font-semibold">12.4 TON</div>
						</div>
						<div className="glass rounded-2xl p-4">
							<div className="text-xs uppercase tracking-[0.24em] text-txt/50">
								Availability
							</div>
							<div className="mt-2 text-sm text-txt/80">Ready to ship</div>
						</div>
					</section>

					<section className="space-y-3">
						<h2 className="text-xs uppercase tracking-[0.3em] text-txt/50">
							Highlights
						</h2>
						<ul className="grid gap-2 text-sm text-txt/75 sm:grid-cols-2">
							<li className="rounded-2xl border border-white/10 px-3 py-2">
								Authentic collection drop
							</li>
							<li className="rounded-2xl border border-white/10 px-3 py-2">
								Wallet-ready metadata
							</li>
							<li className="rounded-2xl border border-white/10 px-3 py-2">
								Insured delivery
							</li>
							<li className="rounded-2xl border border-white/10 px-3 py-2">
								Telegram support
							</li>
						</ul>
					</section>

					<div className="space-y-2">
						<button
							type="button"
							className="w-full rounded-2xl bg-brand/25 py-3 text-sm font-medium text-txt transition-colors duration-150 hover:bg-brand/30"
							onClick={openModal}
						>
							Buy now
						</button>
						<button
							type="button"
							className="w-full rounded-2xl border border-white/10 py-3 text-sm font-medium text-txt/80 transition-colors duration-150 hover:border-white/30 hover:text-txt"
						>
							Add to cart
						</button>
					</div>
				</div>
			</article>

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
									<Media src={mediaSrc} alt={`Preview of item ${id}`} />
								</div>
								<div className="space-y-1 text-sm">
									<div className="font-medium text-txt">
										Genesis Shard #{id}
									</div>
									<div className="text-txt/60">Void collection</div>
									<div className="text-txt">12.4 TON</div>
								</div>
							</div>
							<div className="space-y-1 rounded-2xl border border-white/10 p-3 text-xs text-txt/60">
								<div className="flex items-center justify-between">
									<span>Subtotal</span>
									<span>12.4 TON</span>
								</div>
								<div className="flex items-center justify-between">
									<span>Network fee</span>
									<span>Included</span>
								</div>
								<div className="flex items-center justify-between text-sm font-semibold text-txt">
									<span>Total</span>
									<span>12.4 TON</span>
								</div>
							</div>
							<div className="space-y-2 text-xs text-txt/60">
								<p>
									The Telegram Main Button mirrors this action. Tap "Confirm
									purchase" above or here to continue.
								</p>
								<button
									type="button"
									className="w-full rounded-2xl bg-brand/25 py-3 text-sm font-medium text-txt transition-colors duration-150 hover:bg-brand/30 disabled:opacity-60"
									onClick={handleConfirm}
									disabled={pending}
								>
									{pending ? "Processing…" : "Confirm purchase"}
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
			)}
		</div>
	);
}

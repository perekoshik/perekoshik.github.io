import { Plus, Trash2, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import Card from "@/components/Card";
// CHANGE: Removed unused imports
// WHY: Biome noUnusedImports and TS6133 - useMarketContracts, useTonConnect, and TWA are never used
// REF: lint errors in AddItem.tsx (removed unused user variable that was only accessing TWA)
import { defaultImage } from "@/constants/images";

// CHANGE: Highlight item structure with unique ID
// WHY: Avoid using array index as React key (lint/suspicious/noArrayIndexKey)
// REF: CLAUDE.md:8 - "Никогда не использовать eslint-disable"
type Highlight = { id: string; text: string };

export default function AddItem() {
	const [title, setTitle] = useState("");
	const [price, setPrice] = useState("");
	const [description, setDescription] = useState("");
	const [highlights, setHighlights] = useState<Highlight[]>([
		{ id: crypto.randomUUID(), text: "" },
	]);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>("");
	// CHANGE: Removed unused user variable
	// WHY: Biome noUnusedVariables - user is declared but never read (line 25)
	// REF: lint error in AddItem.tsx line 25
	const cardPreview = useMemo(() => {
		const preview: {
			id: string;
			title: string;
			image: string;
			price?: string;
			badge: string;
		} = {
			id: "preview",
			title: title || "Untitled item",
			image: imagePreview || defaultImage,
			badge: "Draft",
		};

		if (price) {
			preview.price = `${price} TON`;
		}

		return preview;
	}, [title, price, imagePreview]);

	// CHANGE: Use ID-based operations instead of index
	// WHY: Stable unique keys for React list rendering
	const handleHighlightChange = (id: string, value: string) => {
		setHighlights((current) =>
			current.map((h) => (h.id === id ? { ...h, text: value } : h)),
		);
	};

	const addHighlight = () => {
		setHighlights((current) => [
			...current,
			{ id: crypto.randomUUID(), text: "" },
		]);
	};

	const removeHighlight = (id: string) => {
		setHighlights((current) => {
			if (current.length === 1) {
				return current;
			}
			return current.filter((h) => h.id !== id);
		});
	};

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setImageFile(file);
		const nextPreview = URL.createObjectURL(file);
		setImagePreview(nextPreview);
	};

	const resetForm = () => {
		setTitle("");
		setPrice("");
		setDescription("");
		setHighlights([{ id: crypto.randomUUID(), text: "" }]);
		setImageFile(null);
		setImagePreview("");
	};

	return (
		<div className="container pb-24 space-y-6 sm:space-y-8">
			<header className="pt-4 space-y-1">
				<span className="text-[11px] uppercase tracking-[0.16em] text-txt/60">
					Seller console
				</span>
				<h1 className="text-2xl font-semibold">Create product listing</h1>
				<p className="text-sm text-txt/70 sm:max-w-2xl">
					Fill out the product card. Once saved, it will go through moderation
					before appearing in the marketplace.
				</p>
			</header>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
				<section className="space-y-6">
					<div className="glass rounded-3xl p-5 sm:p-6 space-y-4">
						<div className="space-y-2">
							<label
								htmlFor="title-input"
								className="text-xs font-semibold uppercase tracking-[0.24em] text-txt/60"
							>
								title
							</label>
							<input
								id="title-input"
								value={title}
								onChange={(event) => setTitle(event.target.value)}
								placeholder="e.g. Genesis Shard"
								className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand/60"
							/>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<label
									htmlFor="price-input"
									className="text-xs font-semibold uppercase tracking-[0.24em] text-txt/60"
								>
									Price (TON)
								</label>
								<input
									id="price-input"
									value={price}
									onChange={(event) => setPrice(event.target.value)}
									placeholder="e.g. 12.4"
									className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand/60"
									inputMode="decimal"
								/>
							</div>

							<div className="space-y-2">
								<div className="text-xs font-semibold uppercase tracking-[0.24em] text-txt/60">
									Preview image
								</div>
								<label className="flex min-h-[42px] cursor-pointer items-center justify-center rounded-2xl border border-dashed border-white/15 px-3 py-2 text-sm text-brand transition-colors duration-150 hover:border-brand/60">
									<input
										type="file"
										accept="image/*"
										onChange={handleImageUpload}
										className="hidden"
									/>
									<UploadCloud className="mr-2 h-4 w-4" />
									{imageFile ? imageFile.name : "Upload file"}
								</label>
							</div>
						</div>

						<div className="space-y-2">
							<label
								htmlFor="description-input"
								className="text-xs font-semibold uppercase tracking-[0.24em] text-txt/60"
							>
								Description
							</label>
							<textarea
								id="description-input"
								value={description}
								onChange={(event) => setDescription(event.target.value)}
								placeholder="Describe rarity, story and value for the buyer"
								rows={4}
								className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand/60"
							/>
						</div>
					</div>

					<div className="glass rounded-3xl p-5 sm:p-6 space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-sm font-semibold">Highlights</h2>
								<p className="text-xs text-txt/60">
									Key selling points visible to buyers
								</p>
							</div>
							<button
								type="button"
								onClick={addHighlight}
								className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-brand transition-colors duration-150 hover:border-brand/40"
							>
								<Plus className="h-4 w-4" />
								Add
							</button>
						</div>

						<div className="space-y-3">
							{highlights.map((highlight) => (
								<div key={highlight.id} className="flex items-center gap-3">
									<input
										value={highlight.text}
										onChange={(event) =>
											handleHighlightChange(highlight.id, event.target.value)
										}
										placeholder="e.g. Premium packaging"
										className="flex-1 rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand/60"
									/>
									<button
										type="button"
										onClick={() => removeHighlight(highlight.id)}
										className="rounded-2xl border border-white/10 p-2 text-txt/60 transition-colors duration-150 hover:border-brand/40 hover:text-brand"
										aria-label="Remove highlight"
									>
										<Trash2 className="h-4 w-4" />
									</button>
								</div>
							))}
						</div>
					</div>

					<div className="flex flex-wrap gap-3">
						<button
							type="button"
							className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand/25 px-5 text-sm font-medium text-txt transition-colors duration-150 hover:bg-brand/30"
						>
							Save draft
						</button>
						<button
							type="button"
							className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 text-sm font-medium text-txt/80 transition-colors duration-150 hover:border-white/30 hover:text-txt"
							onClick={resetForm}
						>
							Reset form
						</button>
					</div>
				</section>

				<aside className="space-y-4">
					<div className="glass rounded-3xl p-5 sm:p-6 space-y-4">
						<h2 className="text-sm font-semibold">Card preview</h2>
						<p className="text-xs text-txt/60">
							This is how the product will appear in the marketplace feed.
							Update the image and fields to see live changes.
						</p>
						<Card item={cardPreview} />
					</div>

					<div className="glass rounded-3xl p-5 sm:p-6 space-y-4">
						<h2 className="text-sm font-semibold">Moderation summary</h2>
						<p className="text-xs text-txt/60">
							Internal data for the marketplace team. Later this block will be
							linked to smart contracts and automated publishing.
						</p>
						<div className="space-y-3 text-sm text-txt/80">
							<div>
								<div className="text-xs uppercase tracking-[0.28em] text-txt/50">
									Title
								</div>
								<div className="mt-1 rounded-2xl border border-white/10 bg-white/5 p-3">
									{title || "Not provided"}
								</div>
							</div>
							<div>
								<div className="text-xs uppercase tracking-[0.28em] text-txt/50">
									Description
								</div>
								<div className="mt-1 rounded-2xl border border-white/10 bg-white/5 p-3 whitespace-pre-wrap">
									{description ||
										"Add story, details and why it matters to the buyer."}
								</div>
							</div>
							<div>
								<div className="text-xs uppercase tracking-[0.28em] text-txt/50">
									Highlights
								</div>
								<ul className="mt-1 space-y-2">
									{highlights.filter((h) => h.text.trim()).length ? (
										highlights
											.filter((h) => h.text.trim())
											.map((item) => (
												<li
													key={item.id}
													className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
												>
													{item.text}
												</li>
											))
									) : (
										<li className="rounded-2xl border border-dashed border-white/10 px-3 py-2 text-txt/60">
											Provide at least three core highlights.
										</li>
									)}
								</ul>
							</div>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}

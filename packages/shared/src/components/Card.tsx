import Media from "@/components/Media";
import { cn } from "@/lib/cn";

export type Item = {
	id: string;
	title: string;
	image?: string;
	price?: string;
	badge?: string;
};

type CardProps = {
	item: Item;
	onClick?: () => void;
	className?: string;
};

export default function Card({ item, onClick, className }: CardProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn("market-card card-hover", className)}
		>
			<div className="relative aspect-square w-full overflow-hidden">
				<Media key={item.image ?? "placeholder"} src={item.image} alt={item.title} />
				{item.badge && (
					<span className="absolute left-3 top-3 rounded-full bg-brand/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-brand">
						{item.badge}
					</span>
				)}
			</div>
			<div className="flex flex-col gap-2 p-3 sm:p-4">
				<div className="flex items-start justify-between gap-2">
					<div className="text-sm sm:text-base font-medium leading-tight text-txt">
						{item.title}
					</div>
					{item.price && (
						<span className="rounded-lg bg-white/5 px-2 py-0.5 text-xs font-medium text-txt/80">
							{item.price}
						</span>
					)}
				</div>
				<span className="text-[11px] uppercase tracking-[0.24em] text-txt/50">
					Tap to open
				</span>
			</div>
		</button>
	);
}

import { cn } from '@/lib/cn'
import Media from '@/components/Media'
import type { Product } from '@/types/product'

type CardProps = {
  item: Product
  onClick?: () => void
  className?: string
}

export default function Card({ item, onClick, className }: CardProps) {
  const image = item.images[0]
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('market-card card-hover', className)}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        {image ? (
          <Media src={image} alt={item.title} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-200 text-xs text-slate-600 dark:bg-white/10 dark:text-white/60">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm sm:text-base font-medium leading-tight text-txt">{item.title}</div>
          <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-white/5 dark:text-txt/80">
            {item.priceTon.toFixed(item.priceTon >= 100 ? 2 : 3)} TON
          </span>
        </div>
        <span className="text-[11px] uppercase tracking-[0.24em] text-txt/50">Tap to open</span>
      </div>
    </button>
  )
}

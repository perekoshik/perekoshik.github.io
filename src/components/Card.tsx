import { cn } from '@/lib/cn'
import Media from '@/components/Media'

export type Item = {
  id: string
  title: string
  image: string
  price?: string
  badge?: string
}

export default function Card({ item, onClick }: { item: Item, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cn('w-full text-left rounded-2xl glass card-hover overflow-hidden') }>
      <div className="aspect-square w-full overflow-hidden">
        <Media src={item.image} alt={item.title} />
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-2">
          {item.badge && (
            <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-brand/20 text-brand">
              {item.badge}
            </span>
          )}
        </div>
        <div className="mt-1 text-sm sm:text-base font-medium leading-tight">{item.title}</div>
        {item.price && (
          <div className="mt-1 text-xs sm:text-sm text-txt/70">{item.price}</div>
        )}
      </div>
    </button>
  )
}
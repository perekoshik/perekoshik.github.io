import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'

type CategoryPillsProps = {
  items: string[]
  value?: string
  onChange?: (value: string) => void
}

export default function CategoryPills({ items, value, onChange }: CategoryPillsProps) {
  const [internalValue, setInternalValue] = useState(() => items[0] ?? '')

  useEffect(() => {
    if (!items.length) return
    if (value === undefined && !items.includes(internalValue)) {
      setInternalValue(items[0])
    }
  }, [items, value, internalValue])

  const activeValue = value ?? internalValue

  const handleSelect = (next: string) => {
    if (value === undefined) {
      setInternalValue(next)
    }
    onChange?.(next)
  }

  return (
    <div className="mt-3 sm:mt-4 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-2 min-w-max">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handleSelect(item)}
            className={cn(
              'px-3 py-1.5 rounded-xl border text-sm whitespace-nowrap transition-colors duration-150',
              activeValue === item
                ? 'bg-brand/25 text-txt border-brand/40 shadow-soft'
                : 'bg-bg-soft/70 text-txt/70 border-white/5 hover:text-txt'
            )}
            aria-pressed={activeValue === item}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}

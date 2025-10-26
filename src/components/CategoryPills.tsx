export default function CategoryPills({ items }: { items: string[] }) {
    return (
      <div className="mt-3 sm:mt-4 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 min-w-max">
          {items.map((t) => (
            <button key={t} className="px-3 py-1.5 rounded-xl bg-bg.soft text-txt/80 border border-white/5 text-sm whitespace-nowrap">
              {t}
            </button>
          ))}
        </div>
      </div>
    )
  }
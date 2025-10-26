import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Media from '@/components/Media'

export default function Item() {
  const { id } = useParams()
  const mediaSrc = `https://picsum.photos/seed/${id}/1000/1000`

  return (
    <div className="container pb-24">
      <div className="sticky top-14 z-20 -mx-4 flex items-center gap-3 border-b border-white/5 bg-bg/80 px-4 py-3 backdrop-blur sm:top-16 sm:mx-0 sm:px-0">
        <Link to="/" className="glass rounded-xl p-2" aria-label="Back to home">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="text-sm text-txt/70">Item</div>
        <div className="ml-auto text-sm">#{id}</div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="glass relative overflow-hidden rounded-3xl">
          <div className="aspect-square">
            <Media src={mediaSrc} alt={`Preview of item ${id}`} />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] uppercase tracking-[0.2em] text-txt/60">
              Collection
            </div>
            <div className="text-2xl font-semibold">Genesis Shard #{id}</div>
            <div className="text-sm text-txt/70">
              Ultra rare relic from the Void collection. Premium, certified and shiny ✨
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="glass rounded-2xl p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-txt/50">Price</div>
              <div className="mt-2 text-2xl font-semibold">12.4 TON</div>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-txt/50">Availability</div>
              <div className="mt-2 text-sm text-txt/80">Ready to ship</div>
            </div>
          </div>

          <button className="w-full rounded-2xl bg-brand/25 py-3 text-sm font-medium text-txt transition-colors duration-150 hover:bg-brand/30">
            Buy now
          </button>
        </div>
      </div>
    </div>
  )
}

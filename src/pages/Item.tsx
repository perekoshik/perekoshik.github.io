import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Media from '@/components/Media'

const description =
  'Ultra rare relic from the Void collection. Premium craft, verified provenance and ready for your vault.'

export default function Item() {
  const { id } = useParams()
  const mediaSrc = `https://picsum.photos/seed/${id}/1000/1000`

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
            <Media src={mediaSrc} alt={`Preview of item ${id}`} />
          </div>
        </div>

        <div className="space-y-5">
          <header className="space-y-3">
            <div className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-txt/60">
              Void collection
            </div>
            <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">Genesis Shard #{id}</h1>
            <p className="text-sm text-txt/70 sm:text-base">{description}</p>
          </header>

          <section className="grid gap-3 sm:grid-cols-2">
            <div className="glass rounded-2xl p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-txt/50">Price</div>
              <div className="mt-2 text-2xl font-semibold">12.4 TON</div>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-txt/50">Availability</div>
              <div className="mt-2 text-sm text-txt/80">Ready to ship</div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-[0.3em] text-txt/50">Highlights</h2>
            <ul className="grid gap-2 text-sm text-txt/75 sm:grid-cols-2">
              <li className="rounded-2xl border border-white/10 px-3 py-2">Authentic collection drop</li>
              <li className="rounded-2xl border border-white/10 px-3 py-2">Wallet-ready metadata</li>
              <li className="rounded-2xl border border-white/10 px-3 py-2">Insured delivery</li>
              <li className="rounded-2xl border border-white/10 px-3 py-2">Telegram support</li>
            </ul>
          </section>

          <div className="space-y-2">
            <button className="w-full rounded-2xl bg-brand/25 py-3 text-sm font-medium text-txt transition-colors duration-150 hover:bg-brand/30">
              Buy now
            </button>
            <button className="w-full rounded-2xl border border-white/10 py-3 text-sm font-medium text-txt/80 transition-colors duration-150 hover:border-white/30 hover:text-txt">
              Add to cart
            </button>
          </div>
        </div>
      </article>
    </div>
  )
}

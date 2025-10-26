import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Item() {
  const { id } = useParams()
  return (
    <div className="container pb-24">
      <div className="sticky top-14 z-20 bg-bg/80 backdrop-blur -mx-4 px-4 py-3 sm:top-16 sm:-mx-0 sm:px-0 border-b border-white/5 flex items-center gap-3">
        <Link to="/" className="glass rounded-xl p-2"><ArrowLeft className="h-4 w-4"/></Link>
        <div className="text-sm text-txt/70">Item</div>
        <div className="ml-auto text-sm">#{id}</div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="aspect-square rounded-2xl overflow-hidden glass">
          <img className="h-full w-full object-cover" src={`https://picsum.photos/seed/${id}/1000/1000`} />
        </div>
        <div className="space-y-4">
          <div className="text-2xl font-semibold">Genesis Shard #{id}</div>
          <div className="text-txt/70">Ultra rare relic from the Void collection. Premium, certified and shiny ✨</div>
          <div className="glass rounded-2xl p-4">
            <div className="text-sm text-txt/70">Current price</div>
            <div className="text-2xl font-semibold">12.4 TON</div>
          </div>
          <button className="w-full glass rounded-2xl py-3 font-medium text-txt bg-brand/20 hover:bg-brand/30">
            Buy now
          </button>
        </div>
      </div>
    </div>
  )
}
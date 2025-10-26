import Hero from '@/components/Hero'
import CategoryPills from '@/components/CategoryPills'
import Card, { Item } from '@/components/Card'
import Skeleton from '@/components/Skeleton'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const demo: Item[] = [
  { id: '1', title: 'Genesis Shard', image: 'https://images.unsplash.com/photo-1621605815971-22b9ce6d6c03?q=80&w=1200&auto=format&fit=crop', price: '12.4 TON', badge: 'Live' },
  { id: '2', title: 'Crystal Armor', image: 'https://images.unsplash.com/photo-1618004912476-29818d81ae2e?q=80&w=1200&auto=format&fit=crop', price: '3.1 TON' },
  { id: '3', title: 'Void Relic', image: 'https://images.unsplash.com/photo-1605649487213-83c07e434558?q=80&w=1200&auto=format&fit=crop', price: '0.8 TON' },
  { id: '4', title: 'Ultra Saber', image: 'https://images.unsplash.com/photo-1605979253023-8f9172d3008c?q=80&w=1200&auto=format&fit=crop', price: '5.0 TON', badge: 'Auction' },
  { id: '5', title: 'Arc Plasma', image: 'https://images.unsplash.com/photo-1585386959984-a41552231683?q=80&w=1200&auto=format&fit=crop', price: '2.0 TON' },
  { id: '6', title: 'Nebula Lens', image: 'https://images.unsplash.com/photo-1493247035880-efdf53fbd2eb?q=80&w=1200&auto=format&fit=crop', price: '1.2 TON' },
]

export default function Home() {
  const [items, setItems] = useState<Item[] | null>(null)
  const nav = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => setItems(demo), 500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="container pb-20">
      <Hero />
      <CategoryPills items={[
        'Featured','Auctions','Gaming','Art','Collectibles','Music','Domains'
      ]} />

      <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {!items && Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)}
        {items && items.map(it => (
          <Card key={it.id} item={it} onClick={() => nav(`/item/${it.id}`)} />
        ))}
      </div>
    </div>
  )
}
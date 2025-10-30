import Hero from '@/components/Hero'
import CategoryPills from '@/components/CategoryPills'
import Card, { Item } from '@/components/Card'
import Skeleton from '@/components/Skeleton'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const categories = [
  'All',
  'Featured',
  'New',
  'Gaming',
  'Art',
  'Collectibles',
  'Music',
  'Domains',
] as const

type Category = (typeof categories)[number]
type HomeItem = Item & { category: Category }

const demo: HomeItem[] = [
  {
    id: '1',
    title: 'Genesis Shard',
    image: 'https://images.unsplash.com/photo-1621605815971-22b9ce6d6c03?auto=format&fit=crop&w=1200&q=80',
    price: '12.4 TON',
    badge: 'Featured',
    category: 'Featured',
  },
  {
    id: '2',
    title: 'Crystal Armor',
    image: 'https://images.unsplash.com/photo-1618004912476-29818d81ae2e?auto=format&fit=crop&w=1200&q=80',
    price: '3.1 TON',
    badge: 'New',
    category: 'Gaming',
  },
  {
    id: '3',
    title: 'Void Relic',
    image: 'https://images.unsplash.com/photo-1605649487213-83c07e434558?auto=format&fit=crop&w=1200&q=80',
    price: '0.8 TON',
    category: 'Collectibles',
  },
  {
    id: '4',
    title: 'Aurora Canvas',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    price: '5.0 TON',
    badge: 'Featured',
    category: 'Art',
  },
  {
    id: '5',
    title: 'Signature Relic',
    image: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80',
    price: '2.0 TON',
    category: 'Collectibles',
  },
  {
    id: '6',
    title: 'Echo Verse',
    image: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?auto=format&fit=crop&w=1200&q=80',
    price: '1.6 TON',
    badge: 'New',
    category: 'Music',
  },
  {
    id: '7',
    title: 'Prime Domain',
    image: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80',
    price: '18.9 TON',
    badge: 'Featured',
    category: 'Domains',
  },
  {
    id: '8',
    title: 'Lunar Archive',
    image: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1200&q=80',
    price: '4.4 TON',
    badge: 'New',
    category: 'New',
  },
]

export default function Home() {
  const [items, setItems] = useState<HomeItem[] | null>(null)
  const [activeCategory, setActiveCategory] = useState<Category>('All')
  const nav = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => setItems(demo), 420)
    return () => clearTimeout(t)
  }, [])

  const featuredItems = useMemo(() => {
    if (!items) return []
    return items.filter((item) => item.badge === 'Featured').slice(0, 4)
  }, [items])

  const trendingItems = useMemo(() => {
    if (!items) return []
    const highlight = items.filter((item) => item.badge === 'New').slice(0, 6)
    return highlight.length ? highlight : items.slice(0, 6)
  }, [items])

  const visibleItems = useMemo(() => {
    if (!items) return null
    if (activeCategory === 'All') return items
    return items.filter((item) => item.category === activeCategory)
  }, [items, activeCategory])

  return (
    <div className="container pb-24 space-y-6 sm:space-y-8">
      <Hero />

      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-txt">Categories</h2>
          <span className="text-[11px] uppercase tracking-[0.28em] text-txt/50">Browse</span>
        </div>
        <CategoryPills
          items={[...categories]}
          value={activeCategory}
          onChange={(next) => setActiveCategory(next as Category)}
        />
      </section>

      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-txt">Featured Items</h2>
          <span className="text-[11px] uppercase tracking-[0.28em] text-txt/50">Curated</span>
        </div>
        {items ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {featuredItems.map((item) => (
              <Card key={item.id} item={item} onClick={() => nav(`/item/${item.id}`)} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square" />
            ))}
          </div>
        )}
        {items && featuredItems.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-txt/70">
            Featured items will appear here once curated.
          </div>
        )}
      </section>

      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-txt">Trending Now</h2>
          <span className="text-[11px] uppercase tracking-[0.28em] text-txt/50">Refresh</span>
        </div>
        <div className="-mx-4 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0">
          <div className="flex gap-3 sm:gap-4">
            {items
              ? trendingItems.map((item) => (
                  <div key={item.id} className="min-w-[200px] max-w-[220px] flex-none sm:min-w-[230px]">
                    <Card item={item} onClick={() => nav(`/item/${item.id}`)} />
                  </div>
                ))
              : Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="min-w-[200px] max-w-[220px] flex-none sm:min-w-[230px]">
                    <Skeleton className="h-[220px] rounded-2xl" />
                  </div>
                ))}
          </div>
        </div>
        {items && trendingItems.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-txt/70">
            No trending products right now. Check the latest arrivals below.
          </div>
        )}
      </section>

      <section>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-txt">All Items</h2>
            <span className="text-[11px] uppercase tracking-[0.28em] text-txt/50">Updated</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
            {!visibleItems && Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square" />
            ))}
            {visibleItems?.map((item) => (
              <Card key={item.id} item={item} onClick={() => nav(`/item/${item.id}`)} />
            ))}
          </div>
        </div>

        {visibleItems && visibleItems.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-txt/70">
            Nothing in this category yet. Check back soon — we are sourcing the next drop.
          </div>
        )}
      </section>
    </div>
  )
}

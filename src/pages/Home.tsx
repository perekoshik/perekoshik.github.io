import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Hero from '@/components/Hero'
import CategoryPills from '@/components/CategoryPills'
import Card from '@/components/Card'
import Skeleton from '@/components/Skeleton'
import { fetchProducts } from '@/lib/api'
import type { Product } from '@/types/product'

const DEFAULT_CATEGORY = 'All'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState(DEFAULT_CATEGORY)
  const nav = useNavigate()

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        const { items } = await fetchProducts({ limit: 60 })
        if (mounted) {
          setProducts(items)
          setError(null)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load products')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  const categories = useMemo(() => {
    const unique = new Set<string>()
    products.forEach((product) => {
      if (product.category) unique.add(product.category)
    })
    return [DEFAULT_CATEGORY, ...Array.from(unique)]
  }, [products])

  const featuredItems = useMemo(() => {
    return [...products]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4)
  }, [products])

  const trendingItems = useMemo(() => {
    const remaining = products.filter((product) => !featuredItems.find((f) => f.id === product.id))
    return (remaining.length ? remaining : products).slice(0, 6)
  }, [products, featuredItems])

  const visibleItems = useMemo(() => {
    if (activeCategory === DEFAULT_CATEGORY) return products
    return products.filter((product) => product.category === activeCategory)
  }, [products, activeCategory])

  return (
    <div className="container pb-24 space-y-6 sm:space-y-8">
      <Hero />

      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-txt">Categories</h2>
          <span className="text-[11px] uppercase tracking-[0.28em] text-txt/50">Browse</span>
        </div>
        <CategoryPills
          items={categories}
          value={activeCategory}
          onChange={(next) => setActiveCategory(next)}
        />
      </section>

      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-txt">Featured Items</h2>
          <span className="text-[11px] uppercase tracking-[0.28em] text-txt/50">Fresh</span>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {featuredItems.map((item) => (
              <Card key={item.id} item={item} onClick={() => nav(`/item/${item.id}`)} />
            ))}
          </div>
        )}
        {!loading && !error && featuredItems.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-txt/70">
            No featured items yet.
          </div>
        )}
      </section>

      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-txt">Trending Now</h2>
          <span className="text-[11px] uppercase tracking-[0.28em] text-txt/50">Live feed</span>
        </div>
        <div className="-mx-4 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0">
          <div className="flex gap-3 sm:gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="min-w-[200px] max-w-[220px] flex-none sm:min-w-[230px]">
                    <Skeleton className="h-[220px] rounded-2xl" />
                  </div>
                ))
              : trendingItems.map((item) => (
                  <div key={item.id} className="min-w-[200px] max-w-[220px] flex-none sm:min-w-[230px]">
                    <Card item={item} onClick={() => nav(`/item/${item.id}`)} />
                  </div>
                ))}
          </div>
        </div>
        {!loading && !error && trendingItems.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-txt/70">
            No trending items right now. Check back later.
          </div>
        )}
      </section>

      <section>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-txt">All Items</h2>
            <span className="text-[11px] uppercase tracking-[0.28em] text-txt/50">Updated</span>
          </div>
          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200 dark:text-red-300">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
            {loading &&
              Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="aspect-square" />)}
            {!loading &&
              visibleItems.map((item) => (
                <Card key={item.id} item={item} onClick={() => nav(`/item/${item.id}`)} />
              ))}
          </div>

          {!loading && !error && visibleItems.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-txt/70">
              Nothing in this category yet. Check back soon — we are sourcing the next drop.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

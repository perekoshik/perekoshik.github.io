import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'
import Media from '@/components/Media'
import { TWA } from '@/lib/twa'
import Skeleton from '@/components/Skeleton'
import { fetchProduct } from '@/lib/api'
import type { Product } from '@/types/product'

const descriptionFallback = 'Rare collectible from the DevPulse marketplace. Secure ownership and instant transfer inside Telegram.'

export default function Item() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (!id) return

    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        const data = await fetchProduct(id)
        if (mounted) {
          setProduct(data)
          setError(null)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load product')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [id])

  const mainButton = TWA?.MainButton

  const handleClose = useCallback(() => {
    setPending(false)
    setModalOpen(false)
  }, [])

  const handleConfirm = useCallback(() => {
    if (pending) return
    setPending(true)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = window.setTimeout(() => {
      handleClose()
      window.alert('Purchase complete. Item added to your orders.')
      timeoutRef.current = null
    }, 900)
  }, [pending, handleClose])

  const openModal = () => {
    setModalOpen(true)
  }

  useEffect(() => {
    if (!mainButton) return

    if (!modalOpen) {
      mainButton.hide()
      return
    }

    mainButton.setParams({ text: pending ? 'Processing…' : 'Confirm purchase' })
    if (pending) {
      mainButton.disable()
    } else {
      mainButton.enable()
    }
    mainButton.show()

    const click = () => handleConfirm()
    mainButton.onClick(click)

    return () => {
      mainButton.offClick(click)
      mainButton.hide()
    }
  }, [mainButton, modalOpen, pending, handleConfirm])

  useEffect(() => {
    if (!modalOpen) return

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [modalOpen, handleClose])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setPending(false)
      mainButton?.hide()
    }
  }, [mainButton])

  if (loading) {
    return (
      <div className="container pb-24">
        <div className="sticky top-14 z-20 -mx-4 flex items-center gap-3 border-b border-white/5 bg-bg/80 px-4 py-3 backdrop-blur sm:top-16 sm:mx-0 sm:px-0">
          <div className="glass rounded-xl p-2" aria-label="Back">
            <Skeleton className="h-4 w-4" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Skeleton className="aspect-square" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container pb-24">
        <div className="mt-12 rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-center text-sm text-red-200 dark:text-red-300">
          {error ?? 'Product not found'}
        </div>
      </div>
    )
  }

  const mediaSrc = product.images[0]
  const priceLabel = `${product.priceTon.toFixed(product.priceTon >= 100 ? 2 : 3)} TON`

  return (
    <div className="container pb-24">
      <div className="sticky top-14 z-20 -mx-4 flex items-center gap-3 border-b border-white/5 bg-bg/80 px-4 py-3 backdrop-blur sm:top-16 sm:mx-0 sm:px-0">
        <Link to="/" className="glass rounded-xl p-2" aria-label="Back to home">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="text-sm text-txt/70">Product</div>
        <div className="ml-auto text-sm">#{product.id}</div>
      </div>

      <article className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="glass relative overflow-hidden rounded-3xl">
          <div className="aspect-square">
            {mediaSrc ? (
              <Media src={mediaSrc} alt={`Preview of item ${product.title}`} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-200 text-sm text-slate-600 dark:bg-white/10 dark:text-white/60">
                No image
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <header className="space-y-3">
            <div className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-txt/60">
              {product.category || 'Marketplace'}
            </div>
            <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">{product.title}</h1>
            <p className="text-sm text-txt/70 sm:text-base">
              {product.description || descriptionFallback}
            </p>
          </header>

          <section className="grid gap-3 sm:grid-cols-2">
            <div className="glass rounded-2xl p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-txt/50">Price</div>
              <div className="mt-2 text-2xl font-semibold">{priceLabel}</div>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-txt/50">Availability</div>
              <div className="mt-2 text-sm text-txt/80">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</div>
            </div>
          </section>

          {product.highlights.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs uppercase tracking-[0.3em] text-txt/50">Highlights</h2>
              <ul className="grid gap-2 text-sm text-txt/75 sm:grid-cols-2">
                {product.highlights.map((highlight) => (
                  <li key={highlight} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
                    {highlight}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="space-y-2">
            <button
              className="w-full rounded-2xl bg-brand/25 py-3 text-sm font-medium text-txt transition-colors duration-150 hover:bg-brand/30"
              onClick={openModal}
              disabled={product.stock <= 0}
            >
              {product.stock > 0 ? 'Buy now' : 'Out of stock'}
            </button>
            <button className="w-full rounded-2xl border border-white/10 py-3 text-sm font-medium text-txt/80 transition-colors duration-150 hover:border-white/30 hover:text-txt">
              Add to cart
            </button>
          </div>
        </div>
      </article>

      {modalOpen && product && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 pb-6 pt-20 backdrop-blur-sm sm:items-center">
          <div className="relative w-full max-w-md rounded-3xl bg-bg-card p-5 shadow-soft">
            <button
              className="absolute right-4 top-4 rounded-xl border border-white/10 p-2 text-txt/70 transition-colors duration-150 hover:text-txt"
              onClick={handleClose}
              aria-label="Close purchase modal"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-4">
              <header className="space-y-1 pr-8">
                <h2 className="text-lg font-semibold">Confirm purchase</h2>
                <p className="text-sm text-txt/70">Review the item details before completing your order.</p>
              </header>
              <div className="flex gap-3 rounded-2xl border border-white/10 p-3">
                <div className="h-16 w-16 overflow-hidden rounded-xl">
                  {mediaSrc ? (
                    <Media src={mediaSrc} alt={`Preview of item ${product.title}`} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-200 text-xs text-slate-600 dark:bg-white/10 dark:text-white/60">
                      No image
                    </div>
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="font-medium text-txt">{product.title}</div>
                  <div className="text-txt/60">{product.category}</div>
                  <div className="text-txt">{priceLabel}</div>
                </div>
              </div>
              <div className="space-y-1 rounded-2xl border border-white/10 p-3 text-xs text-txt/60">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{priceLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Network fee</span>
                  <span>Included</span>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold text-txt">
                  <span>Total</span>
                  <span>{priceLabel}</span>
                </div>
              </div>
              <div className="space-y-2 text-xs text-txt/60">
                <p>The Telegram Main Button mirrors this action. Tap “Confirm purchase” above or here to continue.</p>
                <button
                  className="w-full rounded-2xl bg-brand/25 py-3 text-sm font-medium text-txt transition-colors duration-150 hover:bg-brand/30 disabled:opacity-60"
                  onClick={handleConfirm}
                  disabled={pending}
                >
                  {pending ? 'Processing…' : 'Confirm purchase'}
                </button>
                <button className="w-full rounded-2xl border border-white/10 py-3 text-sm font-medium text-txt/80" onClick={handleClose}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

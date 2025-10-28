import { useEffect, useMemo, useState } from 'react'
import { createProduct, fetchProducts, uploadImage } from '@/lib/api'
import Skeleton from '@/components/Skeleton'
import type { ProductPayload } from '@/types/product'
import Card from '@/components/Card'
import type { Product } from '@/types/product'

const TOKEN_KEY = 'admin_token'
const MAX_HIGHLIGHTS = 4

const initialForm: ProductPayload = {
  title: '',
  description: '',
  highlights: [''],
  priceTon: 0,
  category: '',
  images: [],
  stock: 0,
}

export default function Admin() {
  const [token, setToken] = useState<string>('')
  const [tokenInput, setTokenInput] = useState('')
  const [form, setForm] = useState<ProductPayload>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [catalog, setCatalog] = useState<Product[] | null>(null)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [catalogLoading, setCatalogLoading] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_KEY)
    if (stored) {
      setToken(stored)
      setTokenInput(stored)
    }
  }, [])

  const isAuthed = Boolean(token)

  useEffect(() => {
    if (!isAuthed) return

    let mounted = true
    const load = async () => {
      try {
        setCatalogLoading(true)
        const { items } = await fetchProducts({ limit: 20 })
        if (mounted) {
          setCatalog(items)
          setCatalogError(null)
        }
      } catch (err) {
        if (mounted) {
          setCatalogError(err instanceof Error ? err.message : 'Failed to load catalog')
        }
      } finally {
        if (mounted) setCatalogLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [isAuthed])

  const canAddHighlight = useMemo(() => form.highlights.length < MAX_HIGHLIGHTS, [form.highlights.length])

  const setHighlight = (index: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.highlights]
      next[index] = value
      return { ...prev, highlights: next }
    })
  }

  const addHighlight = () => {
    if (!canAddHighlight) return
    setForm((prev) => ({ ...prev, highlights: [...prev.highlights, ''] }))
  }

  const removeHighlight = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, index) => index !== idx),
    }))
  }

  const handleUpload = async (file: File) => {
    if (!token) {
      setError('Connect admin token before uploads')
      return
    }

    try {
      setSubmitting(true)
      const result = await uploadImage(file, token)
      setForm((prev) => ({ ...prev, images: [...prev.images, result.url] }))
      setMessage('Image uploaded')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setSubmitting(false)
    }
  }

  const validateForm = () => {
    if (!form.title.trim()) return 'Title is required'
    if (form.title.length > 80) return 'Title must be 80 characters or less'
    if (!form.description.trim()) return 'Description is required'
    if (form.description.length > 150) return 'Description must be 150 characters or less'
    if (!form.category.trim()) return 'Category is required'
    if (!Number.isFinite(form.priceTon) || form.priceTon <= 0) return 'Price must be greater than zero'
    if (form.images.length === 0) return 'Upload at least one image'
    if (form.highlights.length > MAX_HIGHLIGHTS) return 'Too many highlights'
    if (!form.highlights.every((item) => item.length <= 40)) return 'Highlights must be 40 characters or less'
    if (form.stock < 0) return 'Stock cannot be negative'
    return null
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) {
      setError('Admin token required')
      return
    }

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const highlights = form.highlights.filter((item) => item.trim() !== '')
      const payload: ProductPayload = {
        ...form,
        highlights,
      }
      await createProduct(payload, token)
      setMessage('Product published')
      setForm({ ...initialForm, highlights: [''] })

      const { items } = await fetchProducts({ limit: 20 })
      setCatalog(items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish product')
      setMessage(null)
    } finally {
      setSubmitting(false)
    }
  }

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }))
  }

  return (
    <div className="container pb-24 space-y-6 sm:space-y-8">
      <header className="pt-4">
        <h1 className="text-xl font-semibold">Admin panel</h1>
        <p className="mt-1 text-sm text-txt/70">Manage products that appear inside the Telegram mini app.</p>
      </header>

      {!isAuthed ? (
        <section className="glass rounded-3xl p-5 sm:p-6">
          <h2 className="text-base font-semibold text-txt">Authorize</h2>
          <p className="mt-1 text-sm text-txt/70">Paste the admin token to unlock product management.</p>
          <form
            className="mt-4 flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault()
              if (!tokenInput.trim()) return
              window.localStorage.setItem(TOKEN_KEY, tokenInput.trim())
              setToken(tokenInput.trim())
            }}
          >
            <input
              type="password"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-colors duration-150 focus:border-brand focus:outline-none dark:border-white/10 dark:bg-bg-card dark:text-txt"
              placeholder="Enter admin token"
              value={tokenInput}
              onChange={(event) => setTokenInput(event.target.value)}
            />
            <button
              type="submit"
              className="rounded-xl bg-brand/25 px-3 py-2 text-sm font-medium text-txt transition-colors duration-150 hover:bg-brand/30"
            >
              Unlock
            </button>
          </form>
        </section>
      ) : (
        <>
          <section className="glass space-y-5 rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-txt">Create product</h2>
              <button
                type="button"
                className="text-xs text-txt/60 underline"
                onClick={() => {
                  window.localStorage.removeItem(TOKEN_KEY)
                  setToken('')
                  setTokenInput('')
                }}
              >
                Sign out
              </button>
            </div>

            {message && <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200 dark:text-emerald-200">{message}</p>}
            {error && <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200 dark:text-red-300">{error}</p>}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-txt/80">
                  Title
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand focus:outline-none dark:border-white/10 dark:bg-bg-card dark:text-txt"
                    value={form.title}
                    maxLength={80}
                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                    required
                  />
                </label>
                <label className="space-y-2 text-sm text-txt/80">
                  Category
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand focus:outline-none dark:border-white/10 dark:bg-bg-card dark:text-txt"
                    value={form.category}
                    maxLength={50}
                    onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                    required
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm text-txt/80">
                Description
                <textarea
                  className="min-h-[96px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand focus:outline-none dark:border-white/10 dark:bg-bg-card dark:text-txt"
                  value={form.description}
                  maxLength={150}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  required
                />
                <span className="block text-xs text-txt/50">{form.description.length}/150</span>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-txt/80">
                  Price (TON)
                  <input
                    type="number"
                    step="0.000001"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand focus:outline-none dark:border-white/10 dark:bg-bg-card dark:text-txt"
                    value={form.priceTon || ''}
                    onChange={(event) => setForm((prev) => ({ ...prev, priceTon: Number(event.target.value) }))}
                    required
                  />
                </label>
                <label className="space-y-2 text-sm text-txt/80">
                  Stock
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand focus:outline-none dark:border-white/10 dark:bg-bg-card dark:text-txt"
                    value={form.stock}
                    onChange={(event) => setForm((prev) => ({ ...prev, stock: Number(event.target.value) }))}
                    required
                  />
                </label>
              </div>

              <div className="space-y-2 text-sm text-txt/80">
                Highlights
                <div className="space-y-2">
                  {form.highlights.map((value, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={40}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand focus:outline-none dark:border-white/10 dark:bg-bg-card dark:text-txt"
                        value={value}
                        onChange={(event) => setHighlight(index, event.target.value)}
                      />
                      {form.highlights.length > 1 && (
                        <button
                          type="button"
                          className="rounded-xl border border-white/10 px-3 py-2 text-xs text-txt/60 hover:text-txt"
                          onClick={() => removeHighlight(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {canAddHighlight && (
                    <button
                      type="button"
                      className="rounded-xl border border-dashed border-white/20 px-3 py-2 text-xs text-txt/60 hover:text-txt"
                      onClick={addHighlight}
                    >
                      Add highlight
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3 text-sm text-txt/80">
                <div className="flex items-center justify-between">
                  <span>Images</span>
                  <label className="cursor-pointer rounded-xl border border-dashed border-white/20 px-3 py-2 text-xs text-txt/60 hover:text-txt">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) {
                          void handleUpload(file)
                          event.target.value = ''
                        }
                      }}
                    />
                    Upload
                  </label>
                </div>
                {form.images.length === 0 && (
                  <p className="text-xs text-txt/60">Upload at least one image (PNG, JPG, WEBP).</p>
                )}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {form.images.map((url, index) => (
                    <div key={url} className="relative overflow-hidden rounded-2xl border border-white/10">
                      <img src={url} alt="Uploaded preview" className="h-32 w-full object-cover" />
                      <button
                        type="button"
                        className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[11px] text-white"
                        onClick={() => removeImage(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-brand/25 py-3 text-sm font-medium text-txt transition-colors duration-150 hover:bg-brand/30 disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? 'Publishing…' : 'Publish product'}
              </button>
            </form>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-txt">Latest items</h2>
              <button
                type="button"
                className="text-xs text-txt/60 underline"
                onClick={async () => {
                  try {
                    setCatalogLoading(true)
                    const { items } = await fetchProducts({ limit: 20 })
                    setCatalog(items)
                    setCatalogError(null)
                  } catch (err) {
                    setCatalogError(err instanceof Error ? err.message : 'Failed to refresh')
                  } finally {
                    setCatalogLoading(false)
                  }
                }}
              >
                Refresh
              </button>
            </div>
            {catalogError && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200 dark:text-red-300">
                {catalogError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
              {catalogLoading && Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="aspect-square" />)}
              {!catalogLoading &&
                catalog?.map((product) => (
                  <Card key={product.id} item={product} onClick={() => {}} />
                ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

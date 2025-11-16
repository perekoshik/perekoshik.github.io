import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Media from '@/components/Media';
import Skeleton from '@/components/Skeleton';
import { defaultImage } from '@/constants/images';
import { Api, type ProductRecord } from '@/lib/api';

export default function Item() {
  const { id } = useParams();
  const [item, setItem] = useState<ProductRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Item not found');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Api.getProduct(id)
      .then((details) => {
        if (!cancelled) {
          setItem(details);
        }
      })
      .catch((loadError) => {
        console.error('Failed to load item', loadError);
        if (!cancelled) {
          setError('Unable to load this item.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [client, id]);

  const mediaSrc = item?.imageUrl ?? defaultImage;
  const title = item?.title ?? 'Unknown item';
  const description = item?.description ?? 'No description provided yet.';
  const priceLabel = item ? `${item.priceTon} TON` : '—';

  const content = loading ? (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="aspect-square" />
      <Skeleton className="h-20" />
    </div>
  ) : error || !item ? (
    <div className="rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-txt/70">
      {error ?? 'Item not found'}
    </div>
  ) : (
    <article className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <div className="glass relative overflow-hidden rounded-3xl">
        <div className="aspect-square">
          <Media key={mediaSrc} src={mediaSrc} alt={title} />
        </div>
      </div>

      <div className="space-y-5">
        <header className="space-y-3">
          <div className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-txt/60">
            Marketplace item
          </div>
          <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">{title}</h1>
          <p className="text-sm text-txt/70 sm:text-base">{description}</p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2">
          <div className="glass rounded-2xl p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-txt/50">Price</div>
            <div className="mt-2 text-2xl font-semibold">{priceLabel}</div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-txt/50">Availability</div>
            <div className="mt-2 font-semibold text-green-400">On chain</div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-txt/80">
            <div className="flex items-center justify-between">
              <span>Seller</span>
              <span className="font-semibold">{item.sellerWallet.slice(0, 10)}…</span>
            </div>
            <div className="mt-2 text-xs text-txt/60 break-words">{item.sellerWallet}</div>
          </div>
          <p className="text-xs text-txt/60">Вы свяжетесь с продавцом напрямую после оформления заказа.</p>
        </section>
      </div>
    </article>
  );

  return (
    <div className="container pb-24">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-txt/70 transition-colors duration-150 hover:text-txt">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      {content}
    </div>
  );
}

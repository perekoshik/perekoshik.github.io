import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Media from '@/components/Media';
import { defaultImage } from '@/constants/images';
import { Api, type ProductRecord } from '@/lib/api';
import { PageLoader } from '../shared/PageLoader';

export function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ProductRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(
    async (productId: string) => {
      setLoading(true);
      setError(null);
      try {
        const product = await Api.getProduct(productId);
        setItem(product);
      } catch {
        setError('Товар не найден');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!id) return;
    loadProduct(id);
  }, [id, loadProduct]);

  if (loading) {
    return <PageLoader label="Загружаем товар" />;
  }

  if (error || !item) {
    return (
      <div className="container space-y-4 py-10">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" /> Назад
        </button>
        <div className="rounded-3xl border border-dashed border-white/10 p-6 text-sm text-txt/70">
          {error ?? 'Товар не найден.'}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-txt/70 transition-colors duration-150 hover:border-white/30 hover:text-txt"
      >
        <ArrowLeft className="h-4 w-4" /> Все товары
      </Link>

      <article className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="glass relative overflow-hidden rounded-3xl">
          <div className="aspect-square">
            <Media key={item.imageUrl} src={item.imageUrl || defaultImage} alt={item.title} />
          </div>
        </div>

        <div className="space-y-5">
          <header className="space-y-3">
            <div className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-txt/60">
              #{item.id.slice(-5)}
            </div>
            <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">{item.title || 'Без названия'}</h1>
            <p className="text-sm text-txt/70 sm:text-base">{item.description || 'Описание отсутствует.'}</p>
          </header>

          <section className="grid gap-3 sm:grid-cols-2">
            <div className="glass rounded-2xl p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-txt/50">Цена</div>
              <div className="mt-2 text-2xl font-semibold">{item.priceTon} TON</div>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-txt/50">Адрес продавца</div>
              <div className="mt-2 text-xs text-txt/80 break-all">{item.sellerWallet}</div>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}

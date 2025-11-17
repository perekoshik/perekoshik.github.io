import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fromNano, toNano } from '@ton/core';
import { Plus, RefreshCcw, UploadCloud } from 'lucide-react';
import Card from '@/components/Card';
import Media from '@/components/Media';
import Skeleton from '@/components/Skeleton';
import { defaultImage } from '@/constants/images';
import { useMarketContracts } from '@/hooks/useMarketContracts';
import { useTonConnect } from '@/hooks/useTonConnect';
import { useSellerSession } from '@/hooks/useSellerSession';
import { Api, type OrderRecord } from '@/lib/api';
import { PageLoader } from '../shared/PageLoader';

type StatusMessage = { type: 'success' | 'error'; text: string } | null;

export function ShopOverviewPage() {
  const navigate = useNavigate();
  const { connected } = useTonConnect();
  const { authenticated, seller, token } = useSellerSession();
  const {
    shopName,
    shopAddress,
    shopItemsCount,
    shopDeployed,
    shopSyncing,
    makeShop,
    items,
    itemsLoading,
    makeItem,
    wrongNetwork,
    targetNetworkLabel,
  } = useMarketContracts();

  const [shopNameInput, setShopNameInput] = useState('');
  const [shopStatus, setShopStatus] = useState<StatusMessage>(null);
  const [savingShop, setSavingShop] = useState(false);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!authenticated) {
      navigate('/onboarding', { replace: true });
    }
  }, [authenticated, navigate]);

  useEffect(() => {
    if (!shopDeployed && shopDeployed !== null) {
      navigate('/onboarding', { replace: true });
    }
  }, [shopDeployed, navigate]);

  useEffect(() => {
    if (shopName) {
      setShopNameInput(shopName);
    }
  }, [shopName]);

  const refreshOrders = useCallback(() => {
    if (!token) return;
    setLoadingOrders(true);
    Api.listOrders(token)
      .then(setOrders)
      .catch((error) => {
        console.error('Failed to load orders', error);
      })
      .finally(() => setLoadingOrders(false));
  }, [token]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  if (!authenticated || !seller) {
    return <PageLoader label="Подключаем профиль" />;
  }

  if (shopDeployed === null) {
    return <PageLoader label="Загружаем данные магазина" />;
  }

  if (!shopDeployed) {
    return null;
  }

  const handleSaveShop = async () => {
    if (!connected) {
      setShopStatus({ type: 'error', text: 'Подключите TonConnect, чтобы сохранить изменения.' });
      return;
    }
    if (!shopNameInput.trim()) {
      setShopStatus({ type: 'error', text: 'Введите новое название.' });
      return;
    }
    setSavingShop(true);
    setShopStatus(null);
    try {
      await makeShop(shopNameInput.trim());
      setShopStatus({ type: 'success', text: 'Название сохранено в базе и обновлено в TON.' });
    } catch (error) {
      setShopStatus({
        type: 'error',
        text: (error as Error).message ?? 'Не удалось сохранить.',
      });
    } finally {
      setSavingShop(false);
    }
  };

  return (
    <div className="container space-y-10 py-8">
      <section className="space-y-2">
        <span className="text-[11px] uppercase tracking-[0.32em] text-txt/60">Store</span>
        <h1 className="text-3xl font-semibold">{shopName ?? seller.telegramName ?? truncate(seller.wallet)}</h1>
        <p className="text-sm text-txt/70">Редактируйте магазин и управляйте товарами.</p>
      </section>

      <section className="glass rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Информация о магазине</h2>
            <p className="text-sm text-txt/70">Название, адрес и статистика</p>
          </div>
          <button
            type="button"
            onClick={handleSaveShop}
            disabled={savingShop || shopSyncing}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-txt/70 transition-colors duration-150 hover:border-white/30 disabled:opacity-60"
          >
            <RefreshCcw className="h-4 w-4" /> Сохранить
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="space-y-4">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-txt/60">Название магазина</label>
            <input
              value={shopNameInput}
              onChange={(event) => setShopNameInput(event.target.value)}
              placeholder="Например, Genesis Store"
              className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-base outline-none transition-colors duration-150 focus:border-brand/60"
              disabled={!connected}
            />
            {shopStatus && (
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${shopStatus.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}
              >
                {shopStatus.text}
              </div>
            )}
            {!connected && <p className="text-sm text-yellow-500">Подключите TonConnect, чтобы редактировать.</p>}
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-txt/80 dark:bg-white/5">
            <div className="flex items-center justify-between">
              <span>Адрес</span>
              <span className="font-semibold">{shopAddress ? truncate(shopAddress) : '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Товаров</span>
              <span className="font-semibold">{shopItemsCount?.toString() ?? '0'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Статус</span>
              <span className="font-semibold text-green-400">Активен</span>
            </div>
          </div>
        </div>
      </section>

      {wrongNetwork && (
        <div className="rounded-3xl border border-yellow-400/40 bg-yellow-400/5 p-4 text-sm text-yellow-200">
          Подключённый кошелёк работает в другой сети. Переключитесь в {targetNetworkLabel}, чтобы редактировать магазин и
          добавлять товары.
        </div>
      )}

      <NewItemPanel
        onSubmit={makeItem}
        disabled={!connected || wrongNetwork}
        warning={wrongNetwork ? `Сеть кошелька должна быть ${targetNetworkLabel}` : undefined}
      />

      <ItemGrid items={items} itemsLoading={itemsLoading} />

      <OrdersPanel orders={orders} loading={loadingOrders} onRefresh={refreshOrders} />
    </div>
  );
}

function truncate(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function ItemGrid({ items, itemsLoading }: { items: ReturnType<typeof useMarketContracts>['items']; itemsLoading: boolean }) {
  if (itemsLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={`item-skeleton-${index}`} className="h-[220px] rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-txt/60">
        Нет товаров. Создайте первый лот, чтобы он появился здесь.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Товары</h2>
        <span className="text-xs uppercase tracking-[0.24em] text-txt/50">Tap to open</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link key={item.address} to={`/items/${item.id.toString()}`} className="glass flex flex-col rounded-3xl">
            <div className="aspect-square overflow-hidden">
              <Media key={item.imageSrc} src={item.imageSrc || defaultImage} alt={item.title} />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div>
                <div className="text-sm font-semibold text-txt">{item.title || 'Без названия'}</div>
                <p className="text-xs text-txt/60 min-h-[2.5rem] overflow-hidden text-ellipsis">
                  {item.description || 'Без описания'}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="rounded-xl bg-white/5 px-2 py-1 text-xs uppercase tracking-[0.24em] text-txt/60">
                  #{item.id.toString()}
                </span>
                <span className="font-semibold">{fromNano(item.price)} TON</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function OrdersPanel({
  orders,
  loading,
  onRefresh,
}: {
  orders: OrderRecord[];
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <section className="glass rounded-3xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Заказы</h2>
          <p className="text-sm text-txt/70">Комиссия платформы 3% удержана автоматически</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-txt/70 transition-colors duration-150 hover:border-white/30 disabled:opacity-60"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin text-txt/60' : ''}`} /> Обновить
        </button>
      </div>
      {loading ? (
        <Skeleton className="h-24 w-full rounded-2xl" />
      ) : orders.length === 0 ? (
        <p className="text-sm text-txt/60">Пока нет заказов.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-txt/80">
              <div className="flex items-center justify-between">
                <span>#{order.id.slice(-5)}</span>
                <span className="font-semibold">{order.priceTon} TON</span>
              </div>
              <div className="mt-2 grid gap-1 text-xs text-txt/60">
                <span>Покупатель: {order.buyerWallet}</span>
                <span>Статус: {order.status}</span>
                <span>Комиссия: {order.platformFeeTon} TON</span>
                {order.deliveryAddress && <span>Адрес: {order.deliveryAddress}</span>}
                {order.txHash && <span>TX: {order.txHash.slice(0, 18)}…</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function NewItemPanel({
  onSubmit,
  disabled,
  warning,
}: {
  onSubmit: ReturnType<typeof useMarketContracts>['makeItem'];
  disabled: boolean;
  warning?: string;
}) {
  const [opened, setOpened] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [imageError, setImageError] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusMessage>(null);
  const [submitting, setSubmitting] = useState(false);

  const cardPreview = useMemo(() => {
    return {
      id: 'preview',
      title: title || 'Новая карточка',
      image: imageDataUrl || undefined,
      badge: 'Draft',
      price: price ? `${price} TON` : undefined,
    } satisfies Parameters<typeof Card>[0]['item'];
  }, [title, price, imageDataUrl]);

  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Разрешены только JPEG, PNG или WebP. Выберите другое изображение.');
      return;
    }
    try {
      const dataUrl = await convertFileToDataUrl(file);
      setImageDataUrl(dataUrl);
    } catch (error) {
      console.error('image upload failed', error);
      setImageError(
        (error as Error).message ?? 'Не удалось обработать изображение. Попробуйте другой файл (не более 0.5 МБ).',
      );
    }
  };

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setDescription('');
    setImageDataUrl('');
    setImageError(null);
  };

  const handleCreate = async () => {
    setStatus(null);
    const normalizedPrice = price.replace(/,/g, '.').trim();
    if (!title.trim() || !normalizedPrice) {
      setStatus({ type: 'error', text: 'Название и цена обязательны.' });
      return;
    }
    if (!/^[0-9]+(\.[0-9]{1,9})?$/.test(normalizedPrice)) {
      setStatus({ type: 'error', text: 'Цена должна быть числом (например 12 или 12.4).' });
      return;
    }
    if (!imageDataUrl) {
      setStatus({ type: 'error', text: 'Загрузите изображение товара.' });
      return;
    }

    try {
      setSubmitting(true);
      const result = await onSubmit({
        price: toNano(normalizedPrice),
        imageSrc: imageDataUrl,
        title: title.trim(),
        description: description.trim(),
      });
      const successText = result?.synced
        ? 'Лот сохранён в базе и опубликован в TON.'
        : 'Лот опубликован в TON. Как только API восстановится, карточка автоматически синхронизируется.';
      setStatus({ type: 'success', text: successText });
      resetForm();
      setOpened(false);
    } catch (error) {
      setStatus({
        type: 'error',
        text: (error as Error).message ?? 'Не удалось создать лот.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!opened) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl bg-brand/20 px-5 py-3 text-sm font-semibold text-brand hover:bg-brand/25"
          onClick={() => setOpened(true)}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" /> Новый товар
        </button>
        {warning && <p className="text-sm text-yellow-500">{warning}</p>}
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-5 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Новый товар</h2>
          <p className="text-sm text-txt/70">Заполните карточку — предпросмотр справа</p>
        </div>
        <button
          type="button"
          className="text-sm text-txt/60 underline decoration-dotted"
          onClick={() => {
            setOpened(false);
            setStatus(null);
          }}
        >
          Скрыть
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-txt/60">Название</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Genesis Shard"
              className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand/60"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.24em] text-txt/60">Цена (TON)</label>
              <input
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="12.4"
                className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand/60"
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.24em] text-txt/60">Изображение</label>
              <label className="flex min-h-[42px] cursor-pointer items-center justify-center rounded-2xl border border-dashed border-white/15 px-3 py-2 text-sm text-brand transition-colors duration-150 hover:border-brand/60">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <UploadCloud className="mr-2 h-4 w-4" />
                Загрузить файл
              </label>
              {imageError && <p className="text-xs text-red-500">{imageError}</p>}
              {imageDataUrl && !imageError && <p className="text-xs text-green-400">Фото добавлено</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-txt/60">Описание</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Коротко расскажите о редкости и ценности"
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand/60"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCreate}
              disabled={submitting || disabled}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand/25 px-5 text-sm font-medium text-txt transition-colors duration-150 hover:bg-brand/30 disabled:opacity-60"
            >
              {submitting ? 'Отправляем…' : 'Опубликовать'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 text-sm font-medium text-txt/80 transition-colors duration-150 hover:border-white/30 hover:text-txt"
            >
              Очистить
            </button>
          </div>
          {status && (
            <div
              className={`rounded-2xl px-4 py-3 text-sm ${status.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}
            >
              {status.text}
            </div>
          )}
          {!imageDataUrl && <p className="text-xs text-txt/60">Добавьте изображение товара перед сохранением.</p>}
        </div>

        <aside className="space-y-4">
          <div className="glass rounded-3xl p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-semibold">Предпросмотр карточки</h3>
            <p className="text-xs text-txt/60">Так товар увидит покупатель.</p>
            <Card item={cardPreview} />
          </div>
        </aside>
      </div>
    </div>
  );
}

async function convertFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Не удалось прочитать файл'));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });
}

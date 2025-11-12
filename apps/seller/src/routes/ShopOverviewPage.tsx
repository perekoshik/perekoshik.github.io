import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fromNano, toNano } from '@ton/core';
import { Plus, RefreshCcw, Trash2, UploadCloud } from 'lucide-react';
import Card from '@/components/Card';
import Media from '@/components/Media';
import Skeleton from '@/components/Skeleton';
import { defaultImage } from '@/constants/images';
import { useMarketContracts } from '@/hooks/useMarketContracts';
import { useTonConnect } from '@/hooks/useTonConnect';
import { Api, type OrderRecord } from '@/lib/api';
import { PageLoader } from '../shared/PageLoader';

type StatusMessage = { type: 'success' | 'error'; text: string } | null;

type Highlight = { id: string; text: string };

const createHighlight = (): Highlight => ({ id: crypto.randomUUID(), text: '' });

const MAX_IMAGE_DIMENSION = 600;
const JPEG_QUALITY = 0.85;

export function ShopOverviewPage() {
  const navigate = useNavigate();
  const { connected, wallet } = useTonConnect();
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
        <h1 className="text-3xl font-semibold">{shopName ?? 'Без названия'}</h1>
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

      <DeliveryAddressPanel wallet={wallet} connected={connected} />

      <NewItemPanel
        onSubmit={makeItem}
        disabled={!connected || wrongNetwork}
        warning={wrongNetwork ? `Сеть кошелька должна быть ${targetNetworkLabel}` : undefined}
      />

      <ItemGrid items={items} itemsLoading={itemsLoading} />

      <ShopOrdersPanel shopAddress={shopAddress} />
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

function DeliveryAddressPanel({ wallet, connected }: { wallet: string | null; connected: boolean }) {
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<StatusMessage>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!wallet) {
      setAddress('');
      setStatus(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setStatus(null);
    Api.getProfile(wallet)
      .then((profile) => {
        if (cancelled) return;
        setAddress(profile.deliveryAddress ?? '');
      })
      .catch((error) => {
        console.error('Failed to load delivery address', error);
        if (!cancelled) {
          setStatus({ type: 'error', text: 'Не удалось загрузить адрес доставки.' });
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
  }, [wallet]);

  const handleSave = async () => {
    if (!connected || !wallet) {
      setStatus({ type: 'error', text: 'Подключите TonConnect, чтобы сохранить адрес доставки.' });
      return;
    }
    const trimmed = address.trim();
    if (!trimmed) {
      setStatus({ type: 'error', text: 'Введите адрес доставки.' });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      await Api.saveProfile(wallet, trimmed);
      setStatus({ type: 'success', text: 'Адрес доставки сохранён.' });
    } catch (error) {
      console.error('Failed to save delivery address', error);
      setStatus({ type: 'error', text: 'Не удалось сохранить адрес. Попробуйте ещё раз.' });
    } finally {
      setSaving(false);
    }
  };

  const disabled = !connected || !wallet || loading || saving;

  return (
    <section className="glass rounded-3xl p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Адрес доставки</h2>
          <p className="text-sm text-txt/70">Мы сохраним его в API и будем подставлять в заказы.</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-txt/70 transition-colors duration-150 hover:border-white/30 disabled:opacity-60"
        >
          <RefreshCcw className="h-4 w-4" /> Сохранить адрес
        </button>
      </div>

      <textarea
        value={address}
        onChange={(event) => setAddress(event.target.value)}
        placeholder="Например: Москва, ул. Ленина 1, офис 10"
        rows={3}
        className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none transition-colors duration-150 focus:border-brand/60"
        disabled={disabled}
      />

      {loading && <p className="text-xs text-txt/60">Загружаем сохранённый адрес…</p>}
      {status && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${status.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}
        >
          {status.text}
        </div>
      )}
      {!connected && <p className="text-sm text-yellow-500">Подключите TonConnect, чтобы хранить адрес доставки.</p>}
    </section>
  );
}

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'completed'];

function ShopOrdersPanel({ shopAddress }: { shopAddress: string | null }) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const refresh = () => {
    if (!shopAddress) {
      setOrders([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Api.listOrders({ shopAddress })
      .then((list) => {
        if (!cancelled) {
          setOrders(list);
        }
      })
      .catch((err) => {
        console.error('Failed to load shop orders', err);
        if (!cancelled) {
          setError('Не удалось загрузить заказы магазина.');
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
  };

  useEffect(() => {
    const cancel = refresh();
    return () => {
      if (typeof cancel === 'function') {
        cancel();
      }
    };
  }, [shopAddress]);

  const handleStatusChange = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      await Api.updateOrderStatus(orderId, nextStatus);
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? { ...order, status: nextStatus, updatedAt: Date.now() } : order)),
      );
    } catch (error) {
      console.error('Failed to update order status', error);
      setError('Не удалось обновить статус.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="glass rounded-3xl p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Заказы магазина</h2>
          <p className="text-sm text-txt/70">Актуальные заявки покупателей с адресами доставки.</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading || !shopAddress}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-txt/70 transition-colors duration-150 hover:border-white/30 disabled:opacity-60"
        >
          <RefreshCcw className="h-4 w-4" /> Обновить
        </button>
      </div>

      {!shopAddress ? (
        <div className="rounded-3xl border border-dashed border-white/10 p-6 text-sm text-txt/70">
          Создайте магазин и добавьте товары, чтобы увидеть заказы.
        </div>
      ) : loading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">{error}</div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 p-6 text-sm text-txt/70">
          Заказов пока нет. Как только покупатели оформят лоты, они появятся здесь.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="rounded-3xl border border-white/10 p-4 text-sm text-txt/80">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold text-txt">{order.itemId}</div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-txt/60">
                  {order.status}
                </span>
              </div>
              <div className="mt-2 grid gap-2 text-xs text-txt/60 sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-txt">Покупатель</p>
                  <p className="break-all">{order.buyer}</p>
                </div>
                <div>
                  <p className="font-semibold text-txt">Создан</p>
                  <p>{formatDate(order.createdAt)}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="font-semibold text-txt">Адрес доставки</p>
                  <p className="break-words">{order.deliveryAddress}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-txt/60">
                <label className="flex flex-col gap-1 text-txt">
                  Статус
                  <select
                    className="min-w-[160px] rounded-2xl border border-white/15 bg-transparent px-3 py-2 text-sm text-txt"
                    value={order.status}
                    onChange={(event) => handleStatusChange(order.id, event.target.value)}
                    disabled={updatingId === order.id}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status} className="bg-bg text-txt">
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <div>
                  <p className="font-semibold text-txt">Последнее обновление</p>
                  <p>{formatDate(order.updatedAt)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString();
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
  const [highlights, setHighlights] = useState<Highlight[]>([createHighlight()]);
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = event.target.files?.[0];
    if (!file) return;
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

  const addHighlight = () => setHighlights((current) => [...current, createHighlight()]);
  const handleHighlightChange = (id: string, value: string) => {
    setHighlights((current) => current.map((item) => (item.id === id ? { ...item, text: value } : item)));
  };
  const removeHighlight = (id: string) => {
    setHighlights((current) => (current.length === 1 ? current : current.filter((item) => item.id !== id)));
  };

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setDescription('');
    setHighlights([createHighlight()]);
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
    const tonValue = Number(normalizedPrice);
    if (!Number.isFinite(tonValue) || tonValue <= 0) {
      setStatus({ type: 'error', text: 'Цена должна быть больше нуля.' });
      return;
    }
    if (!imageDataUrl) {
      setStatus({ type: 'error', text: 'Загрузите изображение товара.' });
      return;
    }
    try {
      const tonPrice = toNano(normalizedPrice);
      setSubmitting(true);
      await onSubmit({
        price: tonPrice,
        imageSrc: imageDataUrl,
        title: title.trim(),
        description: description.trim(),
      });
      setStatus({ type: 'success', text: 'Лот сохранён в базе и опубликован в TON.' });
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
          onClick={() => setOpened(false)}
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
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <UploadCloud className="mr-2 h-4 w-4" />
            Загрузить файл
          </label>
          <p className="text-xs text-txt/60">
            Файл будет сжат до 600×600px и сохранён прямо в контракте (base64), поэтому он доступен всем устройствам без внешних ссылок.
          </p>
          {imageError && <p className="text-xs text-red-500">{imageError}</p>}
          {imageDataUrl && !imageError && (
            <p className="text-xs text-green-400">Фото добавлено</p>
          )}
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Highlights</h3>
                <p className="text-xs text-txt/60">Ключевые факты</p>
              </div>
              <button
                type="button"
                onClick={addHighlight}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-brand transition-colors duration-150 hover:border-brand/40"
              >
                <Plus className="h-4 w-4" /> Добавить
              </button>
            </div>
            <div className="space-y-3">
              {highlights.map((highlight) => (
                <div key={highlight.id} className="flex items-center gap-3">
                  <input
                    value={highlight.text}
                    onChange={(event) => handleHighlightChange(highlight.id, event.target.value)}
                    placeholder="Premium packaging"
                    className="flex-1 rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand/60"
                  />
                  <button
                    type="button"
                    onClick={() => removeHighlight(highlight.id)}
                    className="rounded-2xl border border-white/10 p-2 text-txt/60 transition-colors duration-150 hover:border-brand/40 hover:text-brand"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCreate}
              disabled={submitting}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand/25 px-5 text-sm font-medium text-txt transition-colors duration-150 hover:bg-brand/30 disabled:opacity-60"
            >
              {submitting ? 'Отправляем…' : 'Сохранить'}
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
          {warning && <p className="text-sm text-yellow-500">{warning}</p>}
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
  const original = await readBlobAsDataUrl(file);
  const img = await loadImage(original);

  const scale = Math.min(MAX_IMAGE_DIMENSION / img.width, MAX_IMAGE_DIMENSION / img.height, 1);
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas недоступен');
  }
  ctx.drawImage(img, 0, 0, width, height);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((result) => resolve(result), 'image/jpeg', JPEG_QUALITY),
  );
  if (!blob) {
    throw new Error('Не удалось кодировать изображение');
  }
  if (blob.size > 512 * 1024) {
    throw new Error('Изображение слишком большое (после сжатия >512 КБ).');
  }

  return readBlobAsDataUrl(blob);
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
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
    reader.readAsDataURL(blob);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error ?? new Error('Image load failed'));
    img.src = src;
  });
}

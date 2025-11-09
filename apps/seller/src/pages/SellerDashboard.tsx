import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCcw, Trash2, UploadCloud } from 'lucide-react';
import { fromNano, toNano } from '@ton/core';
import Card from '@/components/Card';
import Media from '@/components/Media';
import Skeleton from '@/components/Skeleton';
import { defaultImage } from '@/constants/images';
import { useMarketContracts } from '@/hooks/useMarketContracts';
import { useTonConnect } from '@/hooks/useTonConnect';
import { TWA } from '@/lib/twa';

const initialHighlight = () => ({ id: crypto.randomUUID(), text: '' });

type Highlight = ReturnType<typeof initialHighlight>;

type StatusMessage = { type: 'success' | 'error'; text: string } | null;

export function SellerDashboard() {
  const telegramUser = TWA?.initDataUnsafe?.user;
  const { connected } = useTonConnect();
  const {
    shopName,
    shopAddress,
    shopItemsCount,
    shopSyncing,
    makeShop,
    items,
    itemsLoading,
    makeItem,
  } = useMarketContracts();

  const [shopNameInput, setShopNameInput] = useState('');
  const [shopStatus, setShopStatus] = useState<StatusMessage>(null);
  const [savingShop, setSavingShop] = useState(false);

  useEffect(() => {
    if (shopName) {
      setShopNameInput(shopName);
    }
  }, [shopName]);

  const handleSaveShop = useCallback(async () => {
    if (!connected) {
      setShopStatus({ type: 'error', text: 'Подключите кошелёк через TonConnect' });
      return;
    }
    setSavingShop(true);
    setShopStatus(null);
    try {
      await makeShop(shopNameInput.trim());
      setShopStatus({ type: 'success', text: 'Магазин обновлён' });
    } catch (error) {
      setShopStatus({
        type: 'error',
        text: (error as Error).message ?? 'Не удалось сохранить магазин',
      });
    } finally {
      setSavingShop(false);
    }
  }, [connected, makeShop, shopNameInput]);

  const [showItemForm, setShowItemForm] = useState(false);
  const [highlights, setHighlights] = useState<Highlight[]>([initialHighlight()]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [itemStatus, setItemStatus] = useState<StatusMessage>(null);
  const [itemPending, setItemPending] = useState(false);

  const cardPreview = useMemo(() => {
    return {
      id: 'preview',
      title: title || 'Новая карточка',
      image: imagePreview || defaultImage,
      badge: 'Draft',
      price: price ? `${price} TON` : undefined,
    } satisfies Parameters<typeof Card>[0]['item'];
  }, [title, price, imagePreview]);

  const resetItemForm = () => {
    setTitle('');
    setPrice('');
    setDescription('');
    setHighlights([initialHighlight()]);
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    if (!imagePreview.startsWith('blob:')) return;
    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const handleHighlightChange = (id: string, value: string) => {
    setHighlights((current) => current.map((item) => (item.id === id ? { ...item, text: value } : item)));
  };

  const addHighlight = () => setHighlights((current) => [...current, initialHighlight()]);

  const removeHighlight = (id: string) => {
    setHighlights((current) => (current.length === 1 ? current : current.filter((item) => item.id !== id)));
  };

  const handleCreateItem = async () => {
    setItemStatus(null);
    if (!shopAddress || shopItemsCount === null) {
      setItemStatus({ type: 'error', text: 'Сначала сохраните магазин' });
      return;
    }
    if (!title.trim() || !price.trim()) {
      setItemStatus({ type: 'error', text: 'Название и цена обязательны' });
      return;
    }

    try {
      const tonPrice = toNano(price.trim());
      setItemPending(true);
      await makeItem({
        price: tonPrice,
        imageSrc: imagePreview || defaultImage,
        title: title.trim(),
        description: description.trim(),
      });
      setItemStatus({ type: 'success', text: 'Лот отправлен в сеть TON' });
      resetItemForm();
      setShowItemForm(false);
    } catch (error) {
      setItemStatus({
        type: 'error',
        text: (error as Error).message ?? 'Не удалось создать лот',
      });
    } finally {
      setItemPending(false);
    }
  };

  return (
    <div className="container space-y-8 py-8">
      <section className="space-y-2">
        <span className="text-[11px] uppercase tracking-[0.32em] text-txt/60">Seller console</span>
        <h1 className="text-3xl font-semibold">Управление магазином</h1>
        <p className="text-sm text-txt/70 sm:max-w-2xl">
          Создайте витрину, подключите TonConnect и публикуйте товары в один клик. Здесь же появится список лотов,
          готовых к продаже.
        </p>
      </section>

      <section className="glass rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Магазин</h2>
            <p className="text-sm text-txt/70">Обновите название и увидьте адрес контракта</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-txt/70 transition-colors duration-150 hover:border-white/30"
            onClick={handleSaveShop}
            disabled={savingShop || shopSyncing}
          >
            <RefreshCcw className="h-4 w-4" />
            Сохранить
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="space-y-4">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-txt/60">
              Название магазина
            </label>
            <input
              value={shopNameInput}
              onChange={(event) => setShopNameInput(event.target.value)}
              placeholder="Введите имя, например Genesis Store"
              className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-base outline-none transition-colors duration-150 focus:border-brand/60"
              disabled={!connected}
            />
            {!connected && (
              <p className="text-sm text-yellow-500">Подключите TonConnect, чтобы сохранить название</p>
            )}
            {shopStatus && (
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${shopStatus.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}
              >
                {shopStatus.text}
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-txt/80 dark:bg-white/5">
            <div className="flex items-center justify-between">
              <span>Адрес</span>
              <span className="font-medium text-txt">{shopAddress ? truncateAddress(shopAddress) : '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Статус</span>
              <span className="font-medium text-txt">{shopName ? 'Активен' : 'Не задеплоен'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Товаров</span>
              <span className="font-medium text-txt">
                {shopItemsCount !== null ? shopItemsCount.toString() : '—'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Ваши товары</h2>
            <p className="text-sm text-txt/70">После деплоя они появятся в пользовательском приложении.</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand/20 px-4 py-2 text-sm font-semibold text-brand transition-colors duration-150 hover:bg-brand/25"
            onClick={() => setShowItemForm((value) => !value)}
            disabled={!shopName}
          >
            <Plus className="h-4 w-4" />
            Новый товар
          </button>
        </div>

        {showItemForm && (
          <div className="glass rounded-3xl p-5 sm:p-6 space-y-6">
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
                    <label className="text-xs font-semibold uppercase tracking-[0.24em] text-txt/60">Превью</label>
                    <label className="flex min-h-[42px] cursor-pointer items-center justify-center rounded-2xl border border-dashed border-white/15 px-3 py-2 text-sm text-brand transition-colors duration-150 hover:border-brand/60">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <UploadCloud className="mr-2 h-4 w-4" />
                      {imageFile ? imageFile.name : 'Загрузить файл'}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-txt/60">Описание</label>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Коротко расскажите про редкость и ценность"
                    rows={4}
                    className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand/60"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">Highlights</h3>
                      <p className="text-xs text-txt/60">Короткие тезисы о продукте</p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-brand transition-colors duration-150 hover:border-brand/40"
                      onClick={addHighlight}
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
                          className="rounded-2xl border border-white/10 p-2 text-txt/60 transition-colors duration-150 hover:border-brand/40 hover:text-brand"
                          onClick={() => removeHighlight(highlight.id)}
                          aria-label="Удалить"
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
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand/25 px-5 text-sm font-medium text-txt transition-colors duration-150 hover:bg-brand/30 disabled:opacity-60"
                    onClick={handleCreateItem}
                    disabled={itemPending}
                  >
                    {itemPending ? 'Отправляем…' : 'Сохранить'}
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 text-sm font-medium text-txt/80 transition-colors duration-150 hover:border-white/30 hover:text-txt"
                    onClick={resetItemForm}
                    disabled={itemPending}
                  >
                    Очистить
                  </button>
                </div>
                {itemStatus && (
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm ${itemStatus.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}
                  >
                    {itemStatus.text}
                  </div>
                )}
              </div>

              <aside className="space-y-4">
                <div className="glass rounded-3xl p-5 sm:p-6 space-y-4">
                  <h3 className="text-sm font-semibold">Предпросмотр карточки</h3>
                  <p className="text-xs text-txt/60">Так товар увидит пользователь в маркетплейсе.</p>
                  <Card item={cardPreview} />
                </div>

                <div className="glass rounded-3xl p-5 sm:p-6 space-y-3 text-sm text-txt/80">
                  <div>
                    <div className="text-xs uppercase tracking-[0.28em] text-txt/50">Описание</div>
                    <div className="mt-1 rounded-2xl border border-white/10 bg-white/5 p-3 whitespace-pre-wrap">
                      {description || 'Добавьте историю и факты, которые убедят покупателя.'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.28em] text-txt/50">Highlights</div>
                    <ul className="mt-1 space-y-2">
                      {highlights.filter((item) => item.text.trim()).length ? (
                        highlights
                          .filter((item) => item.text.trim())
                          .map((item) => (
                            <li key={item.id} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                              {item.text}
                            </li>
                          ))
                      ) : (
                        <li className="rounded-2xl border border-dashed border-white/10 px-3 py-2 text-txt/60">
                          Добавьте хотя бы три пункта.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {itemsLoading &&
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={`item-skeleton-${index}`} className="h-[220px] rounded-2xl" />
            ))}

          {!itemsLoading && items.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-txt/60">
              Пока нет опубликованных лотов. Создайте магазин и добавьте первый товар — он появится здесь.
            </div>
          )}

          {!itemsLoading &&
            items.map((item) => (
              <article key={item.address} className="glass flex flex-col rounded-3xl">
                <div className="aspect-square overflow-hidden">
                  <Media src={item.imageSrc || defaultImage} alt={item.title} />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <div className="text-sm font-semibold text-txt">{item.title}</div>
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
              </article>
            ))}
        </div>
      </section>

      {telegramUser && (
        <section className="glass rounded-3xl p-5 sm:p-6 space-y-3 text-sm text-txt/80">
          <h3 className="text-base font-semibold">Telegram профиль</h3>
          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-2xl bg-brand/20 px-4 py-2 text-brand">
              @{telegramUser.username ?? telegramUser.id}
            </div>
            <div>ID: {telegramUser.id}</div>
            {telegramUser.language_code && <div>Lang: {telegramUser.language_code.toUpperCase()}</div>}
          </div>
        </section>
      )}
    </div>
  );
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

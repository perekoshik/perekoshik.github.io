import { Address, beginCell, toNano } from '@ton/core';
type SendTransactionResponse = { boc?: string };
import { ArrowLeft, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Media from '@/components/Media';
import Skeleton from '@/components/Skeleton';
import { PLATFORM_FEE, PLATFORM_WALLET } from '@/config';
import { defaultImage } from '@/constants/images';
import { useTonConnect } from '@/hooks/useTonConnect';
import { Api, type ProductRecord } from '@/lib/api';
import { TWA } from '@/lib/twa';
import { storeCreateOrder } from '@/wrappers/Item';

type Status = { type: 'success' | 'error'; text: string } | null;

const TON_VALID_SECONDS = 300;

export default function Item() {
  const { id } = useParams();
  const { wallet, connected, tonConnectUI } = useTonConnect();
  const [item, setItem] = useState<ProductRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderStatus, setOrderStatus] = useState<Status>(null);
  const [pending, setPending] = useState(false);

  const mainButton = TWA?.MainButton;

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
  }, [id]);

  useEffect(() => {
    if (!mainButton) return;
    if (!modalOpen) {
      mainButton.hide();
      return;
    }
    const disabled = pending || !wallet || !deliveryAddress.trim();
    mainButton.setParams({
      text: pending ? 'Создаём заказ…' : 'Подтвердить заказ',
    });
    if (disabled) {
      mainButton.disable();
    } else {
      mainButton.enable();
    }
    const handler = () => handleConfirm();
    mainButton.onClick(handler);
    mainButton.show();
    return () => {
      mainButton.offClick(handler);
      mainButton.hide();
    };
  }, [mainButton, modalOpen, pending, deliveryAddress, wallet]);

  useEffect(() => {
    if (!modalOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [modalOpen]);

  useEffect(() => {
    return () => {
      setPending(false);
      mainButton?.hide();
    };
  }, [mainButton]);

  const mediaSrc = item?.imageUrl ?? defaultImage;
  const title = item?.title ?? 'Unknown item';
  const description = item?.description ?? 'No description provided yet.';
  const priceLabel = item ? `${item.priceTon} TON` : '—';
  const contractAddress = item?.contractAddress ?? item?.id ?? null;
  const canBuy = Boolean(contractAddress && connected);

  const feePercentLabel = useMemo(() => `${Math.round(PLATFORM_FEE * 100)}%`, []);

  const openModal = () => {
    setOrderStatus(null);
    setModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setPending(false);
    setOrderStatus(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (pending) return;
    if (!item) {
      setOrderStatus({ type: 'error', text: 'Товар недоступен.' });
      return;
    }
    if (!wallet) {
      setOrderStatus({ type: 'error', text: 'Подключите TON кошелёк, чтобы оформить заказ.' });
      return;
    }
    if (!contractAddress) {
      setOrderStatus({
        type: 'error',
        text: 'Этот товар ещё не привязан к контракту. Повторите попытку позже.',
      });
      return;
    }
    const trimmedAddress = deliveryAddress.trim();
    if (!trimmedAddress) {
      setOrderStatus({ type: 'error', text: 'Введите адрес доставки.' });
      return;
    }
    setPending(true);
    setOrderStatus(null);
    let orderId: string | null = null;
    let orderSecret: string | null = null;
    try {
      const orderResponse = await Api.createBuyerOrder({
        productId: item.id,
        buyerWallet: wallet,
        deliveryAddress: trimmedAddress,
      });
      orderId = orderResponse.order.id;
      orderSecret = orderResponse.clientSecret;
      const amountNano = toNano(orderResponse.order.priceTon.toString());
      const chainReference = await buildDeliveryReference(orderResponse.order.id, orderSecret);
      const orderBody = beginCell()
        .store(
          storeCreateOrder({
            $$type: 'CreateOrder',
            orderId: BigInt(orderResponse.order.tonOrderId ?? Date.now()),
            itemAddress: Address.parse(contractAddress),
            price: amountNano,
            deliveryAddress: chainReference,
          }),
        )
        .endCell();
      const messages: { address: string; amount: string; payload?: string }[] = [
        {
          address: contractAddress,
          amount: amountNano.toString(),
          payload: orderBody.toBoc().toString('base64'),
        },
      ];
      const commissionAmount = calculateCommission(amountNano);
      if (PLATFORM_WALLET && commissionAmount > 0n) {
        messages.push({
          address: PLATFORM_WALLET,
          amount: commissionAmount.toString(),
        });
      }
      const response: SendTransactionResponse | void = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + TON_VALID_SECONDS,
        messages,
      });
      await Api.updatePublicOrder(orderResponse.order.id, {
        status: 'paid',
        txHash: response?.boc,
        secret: orderSecret!,
      });
      setOrderStatus({
        type: 'success',
        text: 'Оплата отправлена. Продавец получит подтверждение и адрес доставки.',
      });
      setDeliveryAddress('');
    } catch (sendError) {
      console.error('Failed to submit on-chain order', sendError);
      if (orderId && orderSecret) {
        try {
          await Api.updatePublicOrder(orderId, { status: 'canceled', secret: orderSecret });
        } catch (cancelError) {
          console.warn('Failed to cancel order after error', cancelError);
        }
      }
      const message =
        (sendError as Error)?.message ??
        'Не удалось провести оплату. Попробуйте ещё раз или свяжитесь с продавцом.';
      setOrderStatus({ type: 'error', text: message });
    } finally {
      setPending(false);
    }
  }, [pending, item, wallet, contractAddress, deliveryAddress, tonConnectUI]);

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
            <div className="text-xs uppercase tracking-[0.24em] text-txt/50">Contract</div>
            <div className="mt-2 text-xs text-txt/80 break-all">{contractAddress ?? '—'}</div>
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
          <p className="text-xs text-txt/60">
            После оплаты продавец получит ваш адрес доставки и свяжется для подтверждения.
          </p>
        </section>

        <div className="space-y-2">
          <button
            type="button"
            className="w-full rounded-2xl bg-brand/25 py-3 text-sm font-medium text-txt transition-colors duration-150 hover:bg-brand/30 disabled:opacity-60"
            onClick={openModal}
            disabled={!canBuy}
          >
            Buy now
          </button>
          {!connected && (
            <p className="text-xs text-yellow-500">Подключите TON кошелёк через TonConnect, чтобы оформить покупку.</p>
          )}
          {!contractAddress && (
            <p className="text-xs text-red-400">Этот товар ещё не опубликован в TON. Покупка временно недоступна.</p>
          )}
        </div>
      </div>
    </article>
  );

  return (
    <div className="container pb-24">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-txt/70 transition-colors duration-150 hover:text-txt">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      {content}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 pb-6 pt-20 backdrop-blur-sm sm:items-center">
          <div className="relative w-full max-w-md rounded-3xl bg-bg.card p-5 shadow-soft">
            <button
              type="button"
              className="absolute right-4 top-4 rounded-xl border border-white/10 p-2 text-txt/70 transition-colors duration-150 hover:text-txt"
              onClick={closeModal}
              aria-label="Close purchase modal"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-4">
              <header className="space-y-1 pr-8">
                <h2 className="text-lg font-semibold">Confirm purchase</h2>
                <p className="text-sm text-txt/70">
                  Оплата пойдёт на смарт-контракт товара. {PLATFORM_WALLET ? `Дополнительно ${feePercentLabel} отправится разработчику.` : ''}
                </p>
              </header>
              <div className="flex gap-3 rounded-2xl border border-white/10 p-3">
                <div className="h-16 w-16 overflow-hidden rounded-xl">
                  <Media src={mediaSrc} alt={title} />
                </div>
                <div className="space-y-1 text-sm">
                  <div className="font-medium text-txt">{title}</div>
                  <div className="text-txt/60">Shop item</div>
                  <div className="text-txt">{priceLabel}</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-txt/60">Адрес доставки</label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand/60"
                    disabled={pending}
                    placeholder="Укажите город, улицу и контакты для курьера"
                  />
                  <p className="text-xs text-txt/60">Мы передадим адрес продавцу вместе с вашей оплатой.</p>
                </div>

                {orderStatus && (
                  <div
                    className={`rounded-2xl border px-4 py-2 text-sm ${orderStatus.type === 'success' ? 'border-green-500/30 bg-green-500/10 text-green-200' : 'border-red-500/30 bg-red-500/10 text-red-200'}`}
                  >
                    {orderStatus.text}
                  </div>
                )}

                <div className="space-y-1 rounded-2xl border border-white/10 p-3 text-xs text-txt/60">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>{priceLabel}</span>
                  </div>
                  {PLATFORM_WALLET && (
                    <div className="flex items-center justify-between">
                      <span>Platform fee</span>
                      <span>{feePercentLabel}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm font-semibold text-txt">
                    <span>Total</span>
                    <span>{priceLabel}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-txt/60">
                  <p>Оплата TonConnect повторяет действие кнопки ниже.</p>
                  <button
                    type="button"
                    className="w-full rounded-2xl bg-brand/25 py-3 text-sm font-medium text-txt transition-colors duration-150 hover:bg-brand/30 disabled:opacity-60"
                    onClick={handleConfirm}
                    disabled={pending || !wallet || !contractAddress}
                  >
                    {pending ? 'Создаём заказ…' : 'Подтвердить заказ'}
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-2xl border border-white/10 py-3 text-sm font-medium text-txt/80"
                    onClick={closeModal}
                    disabled={pending}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function calculateCommission(amountNano: bigint) {
  if (!PLATFORM_WALLET || PLATFORM_FEE <= 0) {
    return 0n;
  }
  const feeBps = Math.round(PLATFORM_FEE * 10000);
  return (amountNano * BigInt(feeBps)) / 10000n;
}

async function buildDeliveryReference(orderId: string, secret: string) {
  const encoder = new TextEncoder();
  const payload = encoder.encode(`${orderId}:${secret}`);
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const digest = await window.crypto.subtle.digest('SHA-256', payload);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback для окружений без SubtleCrypto
  return Array.from(payload)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

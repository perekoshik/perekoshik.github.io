import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Address, fromNano } from '@ton/core';
import Media from '@/components/Media';
import Skeleton from '@/components/Skeleton';
import { defaultImage } from '@/constants/images';
import { resolveMediaUrl } from '@/lib/media';
import { useTonClient } from '@/hooks/useTonClient';
import { Item as TonItem } from '@/wrappers/Item';
import { Shop as TonShop } from '@/wrappers/Shop';

type TonItemDetails = {
  title: string;
  description: string;
  priceTon: string;
  imageSrc: string;
  shopAddress: string;
  shopName: string;
};

export default function Item() {
  const { id } = useParams();
  const { client } = useTonClient();
  const [item, setItem] = useState<TonItemDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Item not found');
      setLoading(false);
      return;
    }
    if (!client) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadTonItem(client, id)
      .then((details) => {
        if (!cancelled) {
          setItem(details);
        }
      })
      .catch((loadError) => {
        console.error('Failed to load on-chain item', loadError);
        if (!cancelled) {
          setError('Unable to load this item from TON.');
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

  const mediaSrc = item?.imageSrc ?? defaultImage;
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
            On-chain item
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
              <span>Shop</span>
              <span className="font-semibold">{item.shopName || '—'}</span>
            </div>
            <div className="mt-2 text-xs text-txt/60 break-words">{item.shopAddress}</div>
          </div>
          <p className="text-xs text-txt/60">
            Items now live entirely in TON. This card is rendered from the blockchain using your shop address.
          </p>
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

async function loadTonItem(client: NonNullable<ReturnType<typeof useTonClient>['client']>, itemAddress: string): Promise<TonItemDetails> {
  const address = Address.parse(itemAddress);
  const itemContract = client.open(TonItem.fromAddress(address));
  const deployed = await client.isContractDeployed(itemContract.address);
  if (!deployed) {
    throw new Error('Item contract is not deployed');
  }
  const [rawImage, title, description, price, shopAddress] = await Promise.all([
    itemContract.getImageSrc(),
    itemContract.getTitle(),
    itemContract.getDescription(),
    itemContract.getPrice(),
    itemContract.getShop(),
  ]);
  let shopName = '';
  try {
    const shopContract = client.open(TonShop.fromAddress(shopAddress));
    const deployedShop = await client.isContractDeployed(shopContract.address);
    if (deployedShop) {
      shopName = await shopContract.getShopName();
    }
  } catch (err) {
    console.warn('[item] failed to load shop name', err);
  }
  return {
    title,
    description,
    priceTon: fromNano(price),
    imageSrc: resolveMediaUrl(rawImage, defaultImage) ?? defaultImage,
    shopAddress: shopAddress.toString(),
    shopName,
  };
}

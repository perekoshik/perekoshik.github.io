import { Address } from '@ton/core';
import { CHAIN } from '@tonconnect/ui-react';
import { Loader2, UserRound } from 'lucide-react';
import Media from '@/components/Media';
import { useMarketContracts } from '@/hooks/useMarketContracts';
import { useTonConnect } from '@/hooks/useTonConnect';
import { TWA } from '@/lib/twa';

export default function Profile() {
  const user = TWA?.initDataUnsafe?.user;
  const avatarUrl = user?.photo_url;
  const initials = user ? buildInitials(user.first_name, user.last_name) : 'DP';
  const { wallet, connected, network } = useTonConnect();
  const { marketAddress } = useMarketContracts();

  return (
    <div className="container pb-24 space-y-6 sm:space-y-8">
      <header className="pt-4">
        <h1 className="text-xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-txt/70">
          We now persist only TON shop addresses. Shipping forms and stored orders are disabled while everything moves on-chain.
        </p>
      </header>

      <section className="glass rounded-3xl p-5 sm:p-6">
        {user ? (
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <AvatarCircle {...(avatarUrl && { url: avatarUrl })} initials={initials} />
              <div>
                <div className="text-lg font-semibold">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-sm text-txt/70">@{user.username ?? 'unknown'}</div>
              </div>
            </div>
            <div className="grid gap-2 text-sm text-txt/70 sm:text-right">
              <span>ID: {user.id}</span>
              {user.language_code && <span>Language: {user.language_code.toUpperCase()}</span>}
            </div>
            {connected ? (
              <div className="grid gap-2 text-sm text-txt/70 sm:text-right">
                <span>
                  Wallet:{' '}
                  {Address.parse(wallet as string).toString({
                    bounceable: false,
                    testOnly: network === CHAIN.TESTNET,
                  })}
                </span>
                <span>Network: {network ?? 'unknown'}</span>
                <span>Market wallet: {marketAddress ?? '—'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-yellow-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Connect TonConnect to see wallet details.
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3 text-sm text-txt/70">
            <span className="inline-flex items-center gap-2 text-base font-medium text-txt">
              <UserRound className="h-4 w-4" /> Guest
            </span>
            <p>Open inside Telegram to load your profile.</p>
          </div>
        )}
      </section>

      <section className="glass rounded-3xl p-5 sm:p-6 space-y-3">
        <h2 className="text-base font-semibold">On-chain orders</h2>
        <p className="text-sm text-txt/70">
          Items and orders now live on TON. Track purchases directly in your wallet or block explorer using the shop address.
        </p>
      </section>
    </div>
  );
}

function buildInitials(first?: string, last?: string) {
  const a = first?.[0] ?? '';
  const b = last?.[0] ?? '';
  return (a + b || 'DP').toUpperCase();
}

function AvatarCircle({ initials, url }: { initials: string; url?: string }) {
  if (url) {
    return <Media src={url} alt={initials} className="h-16 w-16 rounded-full" />;
  }
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-txt">
      {initials}
    </div>
  );
}

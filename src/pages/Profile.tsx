import type { ReactNode } from "react";
import { TWA } from "@/lib/twa";
import Media from "@/components/Media";
import { Package, Star, UserRound } from "lucide-react";
import { useTonConnect } from "@/hooks/useTonConnect";
import { Address } from "ton-core";
import { useMarketContracts } from "@/hooks/useMarketContracts";

export default function Profile() {
  const user = TWA?.initDataUnsafe?.user;
  const avatarUrl = user?.photo_url;
  const initials = user ? buildInitials(user.first_name, user.last_name) : "DP";
  const { wallet, connected, network } = useTonConnect();
  const { marketAddress } = useMarketContracts();

  return (
    <div className="container pb-24 space-y-6 sm:space-y-8">
      <header className="pt-4">
        <h1 className="text-xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-txt/70">
          Manage your marketplace presence and upcoming actions.
        </p>
      </header>

      <section className="glass rounded-3xl p-5 sm:p-6">
        {user ? (
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <AvatarCircle url={avatarUrl} initials={initials} />
              <div>
                <div className="text-lg font-semibold">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-sm text-txt/70">
                  @{user.username ?? "unknown"}
                </div>
              </div>
            </div>
            <div className="grid gap-2 text-sm text-txt/70 sm:text-right">
              <span>ID: {user.id}</span>
              {user.language_code && (
                <span>Language: {user.language_code.toUpperCase()}</span>
              )}
            </div>
            {connected ? (
              <div className="grid gap-2 text-sm text-txt/70 sm:text-right">
                <span>
                  Wallet:{" "}
                  {Address.parse(wallet as string).toString({
                    bounceable: false,
                    testOnly: network === "testnet",
                  })}
                </span>
                <span>
                  Network: {network ?? "unknown"}
                </span>
                <span>
                  MarketWallet:{" "}
                  {marketAddress ? marketAddress : "Something bad("}
                </span>
              </div>
            ) : (
              <div className="grid gap-2 text-sm text-txt/70 sm:text-right">
                <span>Connect your wallet to see your account details</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3 text-sm text-txt/70">
            <span className="inline-flex items-center gap-2 text-base font-medium text-txt">
              <UserRound className="h-4 w-4" /> Guest
            </span>
            <p>
              Open inside Telegram to see your account details and manage
              purchases.
            </p>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Quick actions</h2>
          <span className="text-[11px] uppercase tracking-[0.28em] text-txt/50">
            Soon
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ActionCard
            icon={<Package className="h-5 w-5" />}
            title="Orders"
            subtitle="Track deliveries and receipts"
          />
          <ActionCard
            icon={<Star className="h-5 w-5" />}
            title="Favorites"
            subtitle="Curate items you love"
          />
        </div>
      </section>
    </div>
  );
}

function buildInitials(first?: string, last?: string) {
  const firstInitial = first?.[0]?.toUpperCase() ?? "";
  const lastInitial = last?.[0]?.toUpperCase() ?? "";
  return `${firstInitial}${lastInitial}` || "TG";
}

function AvatarCircle({ url, initials }: { url?: string; initials: string }) {
  if (url) {
    return (
      <div className="h-16 w-16 overflow-hidden rounded-2xl">
        <Media src={url} alt="User avatar" />
      </div>
    );
  }

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/25 text-lg font-semibold text-txt">
      {initials}
    </div>
  );
}

function ActionCard({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-brand/80">
          {icon}
        </div>
        <div className="space-y-1">
          <div className="text-sm font-semibold text-txt">{title}</div>
          <p className="text-xs text-txt/60">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

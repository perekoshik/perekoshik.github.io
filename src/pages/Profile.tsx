import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { TWA } from '@/lib/twa'
import Media from '@/components/Media'
import Skeleton from '@/components/Skeleton'
import { Package, Star, UserRound } from 'lucide-react'
import { useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { getTonConnectUI } from '@/lib/tonconnect'

export default function Profile() {
  const user = TWA?.initDataUnsafe?.user
  const avatarUrl = user?.photo_url
  const initials = user ? buildInitials(user.first_name, user.last_name) : 'DP'

  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWallet()
  const tonAddress = useTonAddress()
  const connection = tonConnectUI ?? getTonConnectUI()

  const [balanceState, setBalanceState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [balance, setBalance] = useState<string | null>(null)

  useEffect(() => {
    if (!tonAddress) {
      setBalance(null)
      setBalanceState('idle')
      return
    }

    const controller = new AbortController()

    const loadBalance = async () => {
      try {
        setBalanceState('loading')
        const response = await fetch(`https://tonapi.io/v2/accounts/${tonAddress}`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error('failed')
        }
        const payload = await response.json()
        const rawBalance = typeof payload?.balance === 'string'
          ? payload.balance
          : String(payload?.balance ?? '0')
        const tons = Math.max(Number(rawBalance) / 1_000_000_000, 0)
        setBalance(formatTonBalance(tons))
        setBalanceState('idle')
      } catch (error) {
        if (!controller.signal.aborted) {
          setBalance(null)
          setBalanceState('error')
        }
      }
    }

    loadBalance()

    return () => controller.abort()
  }, [tonAddress])

  const shortAddress = useMemo(() => (tonAddress ? shortenTonAddress(tonAddress) : null), [tonAddress])
  const isWalletConnected = Boolean(wallet)

  return (
    <div className="container pb-24 space-y-6 sm:space-y-8">
      <header className="pt-4">
        <h1 className="text-xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-txt/70">Manage your marketplace presence and upcoming actions.</p>
      </header>

      <section className="glass rounded-3xl p-5 sm:p-6">
        {user ? (
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <AvatarCircle url={avatarUrl} initials={initials} />
              <div>
                <div className="text-lg font-semibold">{user.first_name} {user.last_name}</div>
                <div className="text-sm text-txt/70">@{user.username ?? 'unknown'}</div>
              </div>
            </div>
            <div className="grid gap-2 text-sm text-txt/70 sm:text-right">
              <span>ID: {user.id}</span>
              {user.language_code && <span>Language: {user.language_code.toUpperCase()}</span>}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3 text-sm text-txt/70">
            <span className="inline-flex items-center gap-2 text-base font-medium text-txt">
              <UserRound className="h-4 w-4" /> Guest
            </span>
            <p>Open inside Telegram to see your account details and manage purchases.</p>
          </div>
        )}
      </section>

      <section className="glass rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-txt">TON wallet</h2>
          {isWalletConnected && shortAddress && (
            <span className="rounded-full bg-brand/15 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-brand">Active</span>
          )}
        </div>

        {!isWalletConnected ? (
          <div className="mt-5 space-y-4 text-sm text-txt/70">
            <p>Connect your TON wallet to check balance and complete purchases seamlessly inside the Mini App.</p>
            <button
              type="button"
              className="w-full rounded-2xl bg-brand/25 py-3 text-sm font-medium text-txt transition-colors duration-150 hover:bg-brand/30"
              onClick={() => connection?.openModal()}
            >
              Connect TON Wallet
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-txt/50">Address</div>
                <div className="mt-2 text-lg font-semibold text-txt">{shortAddress}</div>
              </div>
              <button
                type="button"
                onClick={() => connection?.disconnect()}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-150 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:text-txt/80 dark:hover:bg-white/10"
              >
                Disconnect
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-white/10 dark:bg-bg-soft/60">
              <div className="text-xs uppercase tracking-[0.3em] text-txt/50">Balance</div>
              {balanceState === 'loading' ? (
                <Skeleton className="mt-4 h-6 w-24" />
              ) : (
                <div className="mt-3 text-2xl font-semibold text-txt">
                  {balance ?? '—'}
                  <span className="ml-2 text-sm text-txt/60">TON</span>
                </div>
              )}
              {balanceState === 'error' && (
                <p className="mt-2 text-xs text-red-500/80">Unable to load balance. Please try again later.</p>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Quick actions</h2>
          <span className="text-[11px] uppercase tracking-[0.28em] text-txt/50">Soon</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ActionCard icon={<Package className="h-5 w-5" />} title="Orders" subtitle="Track deliveries and receipts" />
          <ActionCard icon={<Star className="h-5 w-5" />} title="Favorites" subtitle="Curate items you love" />
        </div>
      </section>
    </div>
  )
}

function buildInitials(first?: string, last?: string) {
  const firstInitial = first?.[0]?.toUpperCase() ?? ''
  const lastInitial = last?.[0]?.toUpperCase() ?? ''
  return `${firstInitial}${lastInitial}` || 'TG'
}

function shortenTonAddress(address: string) {
  if (address.length <= 10) return address
  return `${address.slice(0, 4)}…${address.slice(-4)}`
}

function formatTonBalance(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '0.0000'
  if (value >= 100) return value.toFixed(2)
  if (value >= 1) return value.toFixed(3)
  return value.toFixed(4)
}

function AvatarCircle({ url, initials }: { url?: string; initials: string }) {
  if (url) {
    return (
      <div className="h-16 w-16 overflow-hidden rounded-2xl">
        <Media src={url} alt="User avatar" />
      </div>
    )
  }

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/25 text-lg font-semibold text-txt">
      {initials}
    </div>
  )
}

function ActionCard({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-slate-200 bg-white/70 p-2 text-brand/80 dark:border-white/10 dark:bg-white/5">
          {icon}
        </div>
        <div className="space-y-1">
          <div className="text-sm font-semibold text-txt">{title}</div>
          <p className="text-xs text-txt/60">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

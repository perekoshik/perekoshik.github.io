import { Navigate } from 'react-router-dom';
import { ShieldCheck, Wallet } from 'lucide-react';
import { useSellerSession } from '@/hooks/useSellerSession';

export function CreateShopPage() {
  const { beginAuth, authenticated, loading, error } = useSellerSession();

  if (authenticated) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <div className="container max-w-3xl space-y-6 py-10">
      <section className="space-y-3">
        <span className="text-[11px] uppercase tracking-[0.32em] text-txt/60">Start</span>
        <h1 className="text-3xl font-semibold">Подключите кошелёк продавца</h1>
        <p className="text-sm text-txt/70">
          Мы сохраним адрес кошелька и Telegram-профиль, а затем откроем консоль управления товарами и заказами.
        </p>
      </section>

      <div className="glass rounded-3xl p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand/20 p-3 text-brand">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Авторизация</h2>
            <p className="text-sm text-txt/70">Подпишите запрос ton-proof через TonConnect.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={beginAuth}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand/25 px-5 py-3 text-sm font-semibold text-txt transition-colors duration-150 hover:bg-brand/30 disabled:opacity-60"
        >
          <ShieldCheck className="h-4 w-4" />
          {loading ? 'Ожидаем подтверждения...' : 'Подписать запрос'}
        </button>
        {error && <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}

        <ul className="space-y-2 text-sm text-txt/70">
          <li>• TonConnectButton вверху откроет кошелёк с готовым ton-proof payload.</li>
          <li>• После подтверждения консоль автоматически откроет панель товаров.</li>
          <li>• В любой момент можно выйти из консоли, очистив сессию.</li>
        </ul>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTonConnect } from '@/hooks/useTonConnect';
import { useMarketContracts } from '@/hooks/useMarketContracts';
import { PageLoader } from '../shared/PageLoader';

type StatusMessage = { type: 'success' | 'error'; text: string } | null;

export function CreateShopPage() {
  const navigate = useNavigate();
  const { connected } = useTonConnect();
  const { makeShop, shopDeployed, shopSyncing, wrongNetwork, targetNetworkLabel } = useMarketContracts();
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<StatusMessage>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (shopDeployed) {
      navigate('/shop', { replace: true });
    }
  }, [shopDeployed, navigate]);

  if (shopDeployed) {
    return <PageLoader label="Переносим в панель магазина" />;
  }

  const handleCreate = async () => {
    if (wrongNetwork) {
      setStatus({ type: 'error', text: `Переключите кошелёк в ${targetNetworkLabel}.` });
      return;
    }
    if (!connected) {
      setStatus({ type: 'error', text: 'Подключите TonConnect перед созданием.' });
      return;
    }
    if (!input.trim()) {
      setStatus({ type: 'error', text: 'Введите название магазина.' });
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      await makeShop(input.trim());
      setStatus({ type: 'success', text: 'Магазин сохранён в базе и опубликован в TON.' });
    } catch (error) {
      setStatus({
        type: 'error',
        text: (error as Error).message ?? 'Не удалось создать магазин.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl space-y-6 py-10">
      <section className="space-y-3">
        <span className="text-[11px] uppercase tracking-[0.32em] text-txt/60">Start</span>
        <h1 className="text-3xl font-semibold">Создайте магазин в сети TON</h1>
        <p className="text-sm text-txt/70">
          Мы развернём смарт-контракт магазина на ваш адрес. После подтверждения транзакции можно будет добавлять товары
          и управлять витриной.
        </p>
      </section>

      <div className="glass rounded-3xl p-5 sm:p-6 space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-txt/60">
          Название магазина
        </label>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Например, Genesis Store"
          className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-base outline-none transition-colors duration-150 focus:border-brand/60"
          disabled={submitting || shopSyncing}
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={submitting || shopSyncing || wrongNetwork}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand/25 px-5 py-3 text-sm font-semibold text-txt transition-colors duration-150 hover:bg-brand/30 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <RefreshCcw className="h-4 w-4 animate-spin" /> Создаём...
            </>
          ) : (
            'Создать магазин'
          )}
        </button>
        {status && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${status.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}
          >
            {status.text}
          </div>
        )}
        {!connected && (
          <p className="text-sm text-yellow-500">Подключите кошелёк через кнопку в заголовке, чтобы продолжить.</p>
        )}
        {wrongNetwork && (
          <p className="text-sm text-red-500">Переключите кошелёк в сеть {targetNetworkLabel} и попробуйте снова.</p>
        )}
      </div>
    </div>
  );
}

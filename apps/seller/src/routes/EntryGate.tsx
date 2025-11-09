import { Navigate } from 'react-router-dom';
import { useMarketContracts } from '@/hooks/useMarketContracts';
import { PageLoader } from '../shared/PageLoader';

function NetworkNotice({ target }: { target: string }) {
  return (
    <div className="container py-10">
      <div className="glass rounded-3xl p-6 space-y-3 text-sm text-txt/80">
        <h1 className="text-xl font-semibold">Переключите кошелёк</h1>
        <p>
          Это окружение работает в сети <strong>{target}</strong>. В TonConnect выберите кошелёк в той же сети и
          подключитесь заново.
        </p>
      </div>
    </div>
  );
}

export function EntryGate() {
  const { shopDeployed, shopSyncing, wrongNetwork, targetNetworkLabel } = useMarketContracts();

  if (wrongNetwork) {
    return <NetworkNotice target={targetNetworkLabel} />;
  }

  if (shopDeployed === null || shopSyncing) {
    return <PageLoader label="Загружаем магазин" />;
  }

  if (shopDeployed) {
    return <Navigate to="/shop" replace />;
  }

  return <Navigate to="/onboarding" replace />;
}

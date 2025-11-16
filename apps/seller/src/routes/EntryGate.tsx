import { Navigate } from 'react-router-dom';
import { useSellerSession } from '@/hooks/useSellerSession';
import { PageLoader } from '../shared/PageLoader';

export function EntryGate() {
  const { authenticated, loading } = useSellerSession();
  if (loading) {
    return <PageLoader label="Подключаем кошелёк" />;
  }
  return <Navigate to={authenticated ? '/shop' : '/onboarding'} replace />;
}

import { Outlet } from 'react-router-dom';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Store } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-dvh bg-bg text-txt">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-bg/70 backdrop-blur">
        <div className="container flex h-auto flex-wrap items-center gap-3 py-2 sm:h-16 sm:flex-nowrap sm:py-0">
          <div className="inline-flex items-center gap-2">
            <div className="rounded-2xl bg-brand/20 p-2 text-brand">
              <Store className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">Web3Market</span>
              <span className="text-[11px] uppercase tracking-[0.32em] text-txt/60">Seller</span>
            </div>
          </div>

          <div className="order-2 ml-auto flex w-auto flex-shrink-0 items-center sm:order-3">
            <TonConnectButton className="ton-connect-button" />
          </div>
        </div>
      </header>

      <main className="pb-20">
        <Outlet />
      </main>
    </div>
  );
}

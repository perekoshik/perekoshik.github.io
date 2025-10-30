import { Search, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { TonConnectButton } from "@tonconnect/ui-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-bg/70 backdrop-blur">
      <div className="container flex h-auto flex-wrap items-center gap-3 py-2 sm:h-16 sm:flex-nowrap sm:py-0">
        <Link to="/" className="inline-flex items-center gap-2">
          <Store className="h-5 w-5" />
          <span className="font-semibold">Web3Market</span>
        </Link>

        <div className="order-3 w-full sm:order-2 sm:w-auto sm:flex-1 sm:max-w-md">
          <div className="flex items-center gap-2 glass rounded-xl px-3 py-2">
            <Search className="h-4 w-4 opacity-70" />
            <input
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Search collections, items…"
            />
          </div>
        </div>

        <div className="order-2 ml-auto flex w-auto flex-shrink-0 items-center sm:order-3">
          <TonConnectButton className="ton-connect-button" />
        </div>
      </div>
    </header>
  );
}

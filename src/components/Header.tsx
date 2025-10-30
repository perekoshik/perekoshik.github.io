import { Search, User, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { TonConnectButton } from "@tonconnect/ui-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-bg/70 backdrop-blur border-b border-white/5">
      <div className="container h-14 sm:h-16 flex items-center justify-between gap-3">
        <Link to="/" className="inline-flex items-center gap-2">
          <Store className="h-5 w-5" />
          <span className="font-semibold">Web3Market</span>
        </Link>

        <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 glass rounded-xl px-3 py-2">
          <Search className="h-4 w-4 opacity-70" />
          <input
            className="bg-transparent outline-none w-full text-sm"
            placeholder="Search collections, items…"
          />
        </div>

        <div className="inline-flex items-center gap-2">
          <TonConnectButton className="hidden sm:inline-flex" />
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 glass rounded-xl px-3 py-2 text-sm"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:block">Profile</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

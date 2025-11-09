import { Home, ShoppingBag, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";

export default function BottomBar() {
	const link =
		"flex h-full w-full flex-col items-center justify-center gap-1 py-2 text-[11px] text-txt/70 transition-colors duration-150";
	const active = "text-brand";
	return (
		<nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden border-t border-white/5 bg-bg/80 pb-safe backdrop-blur">
			<div className="grid grid-cols-3">
				<NavLink
					to="/"
					className={({ isActive }) => cn(link, isActive ? active : "")}
					aria-label="Go to home"
				>
					<Home className="h-5 w-5" />
					<span>Home</span>
				</NavLink>
				<NavLink
					to="/profile"
					className={({ isActive }) => cn(link, isActive ? active : "")}
					aria-label="Go to profile"
				>
					<User className="h-5 w-5" />
					<span>Profile</span>
				</NavLink>
				<button type="button" className={link} aria-label="Open cart">
					<ShoppingBag className="h-5 w-5" />
					<span>Cart</span>
				</button>
			</div>
		</nav>
	);
}

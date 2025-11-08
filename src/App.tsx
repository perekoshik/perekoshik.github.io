import { Outlet } from "react-router-dom";
import BottomBar from "@/components/BottomBar";
import Header from "@/components/Header";
import ThemeToggle from "@/components/ThemeToggle";

export default function App() {
	return (
		<div className="min-h-dvh flex flex-col">
			<Header />

			<div className="container mt-3 sm:mt-4 flex items-center justify-end">
				<ThemeToggle />
			</div>

			<div className="flex-1">
				<Outlet />
			</div>

			<BottomBar />
		</div>
	);
}

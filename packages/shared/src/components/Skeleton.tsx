export default function Skeleton({ className = "" }: { className?: string }) {
	return (
		<div
			className={`animate-pulse rounded-2xl bg-slate-200/70 dark:bg-white/5 ${className}`}
		/>
	);
}

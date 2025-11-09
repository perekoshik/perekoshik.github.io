export function PageLoader({ label = 'Загрузка...' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-txt/70">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-brand" />
      <p>{label}</p>
    </div>
  );
}

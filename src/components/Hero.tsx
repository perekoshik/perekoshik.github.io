export default function Hero() {
  return (
    <section className="mt-3 sm:mt-6">
      <div className="relative overflow-hidden rounded-3xl glass border border-white/10 p-5 sm:p-7">
        <div className="pointer-events-none absolute -top-24 -right-16 h-48 w-48 rounded-full bg-brand/30 blur-3xl" aria-hidden />
        <div className="relative space-y-3 sm:space-y-4">
          <span className="inline-flex items-center rounded-full border border-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-txt/70">
            Curated spotlight
          </span>
          <div className="text-2xl sm:text-3xl font-semibold leading-tight">
            Discover rare digital goods
          </div>
          <p className="max-w-lg text-sm sm:text-base text-txt/75">
            New arrivals, drops and trending pieces for Telegram power users. Seamless experience inside the Mini App.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand/25 px-4 py-2 text-sm font-medium text-txt transition-colors duration-150 hover:bg-brand/30"
              href="#"
            >
              Explore items
            </a>
            <a
              className="inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-2 text-sm text-txt/80 transition-colors duration-150 hover:border-white/30 hover:text-txt"
              href="#"
            >
              List asset
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

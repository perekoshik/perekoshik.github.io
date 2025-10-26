export default function Hero() {
    return (
      <section className="mt-3 sm:mt-6">
        <div className="rounded-2xl glass p-4 sm:p-6">
          <div className="text-xl sm:text-2xl font-semibold">Discover rare digital goods</div>
          <div className="mt-1 text-txt/70 text-sm sm:text-base">Auctions, drops and trending items in one place.</div>
          <div className="mt-3 sm:mt-4 inline-flex gap-2">
            <a className="px-3 py-2 rounded-xl bg-brand/20 hover:bg-brand/30 text-sm font-medium" href="#">Explore</a>
            <a className="px-3 py-2 rounded-xl border border-white/10 text-sm" href="#">Create</a>
          </div>
        </div>
      </section>
    )
  }
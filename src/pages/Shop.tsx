export default function Shop() {
  return (
    <div className="container pb-24 space-y-6 sm:space-y-8">
      <header className="pt-4 space-y-1">
        <span className="text-[11px] uppercase tracking-[0.16em] text-txt/60">
          Seller console
        </span>
        <h1 className="text-2xl font-semibold">Create product listing</h1>
        <p className="text-sm text-txt/70 sm:max-w-2xl">
          Fill out the product card. Once saved, it will go through moderation
          before appearing in the marketplace.
        </p>
      </header>
    </div>
  );
}

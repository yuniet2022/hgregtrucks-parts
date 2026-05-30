const brands = [
  'KENWORTH',
  'PETERBILT',
  'FREIGHTLINER',
  'VOLVO',
  'MACK',
  'INTERNATIONAL',
  'WESTERN STAR',
  'ISUZU',
];

export default function BrandTicker() {
  const allBrands = [...brands, ...brands];

  return (
    <section className="w-full py-6 bg-obsidian border-y border-white/[0.06] overflow-hidden">
      <p className="text-center text-xs tracking-[0.1em] uppercase text-steel mb-4">
        Authorized Parts for Every Major Brand
      </p>
      <div className="relative w-full overflow-hidden group">
        <div className="flex items-center gap-16 animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap">
          {allBrands.map((brand, i) => (
            <span
              key={`${brand}-${i}`}
              className="text-lg font-light tracking-[0.15em] text-white/40 grayscale hover:grayscale-0 hover:text-white/80 transition-all duration-300 shrink-0 select-none cursor-default"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function HeroSection() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current?.children || [],
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out', delay: 0.3 }
      );
    });
    return () => ctx.revert();
  }, []);

  const scrollToFinder = () => {
    const el = document.getElementById('parts-finder');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-[1]">
        <img
          src="/hero-bg.jpg"
          alt="Heavy duty truck"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080A] via-[#08080A]/70 to-[#08080A]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08080A]/60 to-transparent" />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-[2] text-center px-6 max-w-[900px] pt-20"
      >
        <h1
          className="font-display uppercase text-chrome leading-[0.9] mb-8 drop-shadow-2xl"
          style={{ fontSize: 'clamp(48px, 10vw, 140px)', letterSpacing: '-0.05em' }}
        >
          PARTS THAT KEEP
          <br />
          <span className="text-amber">AMERICA</span> MOVING
        </h1>

        <p className="text-lg text-white/80 max-w-[560px] mx-auto leading-relaxed mb-10 drop-shadow-lg">
          Genuine and aftermarket parts for Kenworth, Peterbilt, Freightliner, Volvo, Mack &amp; more.
          <br className="hidden md:block" />
          Same-day pickup available from our Miami warehouse.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a href="/#/shop" className="bg-amber text-obsidian rounded-full px-10 py-5 text-sm font-semibold tracking-[0.06em] uppercase hover:bg-chrome transition-colors duration-300 shadow-lg">
            SHOP NOW
          </a>
          <button
            onClick={scrollToFinder}
            className="border border-white/40 text-chrome rounded-full px-10 py-5 text-sm font-semibold tracking-[0.06em] uppercase hover:border-amber hover:text-amber transition-all duration-300 backdrop-blur-sm bg-black/20"
          >
            PARTS FINDER
          </button>
        </div>
      </div>

    </section>
  );
}

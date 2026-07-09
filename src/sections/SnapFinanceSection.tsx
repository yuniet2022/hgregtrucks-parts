import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, Calendar, DollarSign, Clock } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function SnapFinanceSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.snap-content',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full py-14 md:py-20 bg-obsidian border-y border-white/[0.06]"
    >
      <div className="snap-content max-w-[1100px] mx-auto px-6 md:px-8">
        {/* Card */}
        <a
          href="https://bk.snapfinance.com/origination?paramId=3w%2FEWVFzVGcQioSdKn1vuqdr2hNr3A1xiMt4CtG%2BqOUhsWMp2vcvIa2lEkK1hZ0tog9ZSjNG2GyQln5HQrzShOzYiaK%2FnFnEZXfXtyBXVEw%3D"
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
        >
          <div className="relative bg-ink rounded-2xl border border-white/[0.06] overflow-hidden hover:border-amber/30 transition-all duration-500">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber/[0.03] rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 px-8 py-10 md:px-14 md:py-14">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-amber/10 border border-amber/20 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
                <span className="text-amber text-xs font-medium uppercase tracking-wider">Financing Available</span>
              </div>

              {/* Main Headline */}
              <h2 className="text-3xl md:text-5xl font-light text-chrome tracking-tight leading-tight mb-4">
                NEED TO FINANCE YOUR <span className="text-amber font-normal">TRUCK PARTS?</span>
              </h2>

              <p className="text-steel text-lg md:text-xl mb-8 max-w-2xl">
                Don't let repair costs keep your truck off the road. Get the parts you need now and pay over time.
              </p>

              {/* Benefits */}
              <div className="flex flex-wrap gap-4 mb-10">
                {[
                  { icon: Calendar, text: '3 Months No Interest' },
                  { icon: DollarSign, text: 'Up to $5,000' },
                  { icon: Clock, text: 'Apply in Minutes' },
                ].map((item) => (
                  <div
                    key={item.text}
                    className="flex items-center gap-3 bg-obsidian/50 rounded-xl border border-white/[0.04] px-5 py-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-amber/10 flex items-center justify-center">
                      <item.icon size={18} className="text-amber" />
                    </div>
                    <span className="text-chrome text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-3 bg-amber text-obsidian rounded-full px-8 py-4 font-semibold text-sm tracking-[0.04em] uppercase group-hover:bg-chrome transition-colors duration-300">
                  Apply Now
                  <ExternalLink size={16} />
                </span>
                <span className="text-steel text-sm">Opens Snap Finance</span>
              </div>

              {/* Disclaimer */}
              <p className="text-steel/30 text-xs mt-8 max-w-2xl">
                Subject to credit approval. 3 months no interest available on qualifying purchases.
                See terms at snapfinance.com. Lease-to-own agreement provided by Snap RTO LLC.
                Approval amounts vary from $300 to $5,000.
              </p>
            </div>
          </div>
        </a>
      </div>
    </section>
  );
}

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Cog,
  CircleDot,
  Waves,
  Zap,
  Thermometer,
  GitBranch,
  Wind,
  Truck,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const categories = [
  { name: 'Engine Components', icon: Cog },
  { name: 'Brake Systems', icon: CircleDot },
  { name: 'Suspension', icon: Waves },
  { name: 'Electrical', icon: Zap },
  { name: 'Cooling Systems', icon: Thermometer },
  { name: 'Transmission', icon: GitBranch },
  { name: 'Exhaust & Emissions', icon: Wind },
  { name: 'Cab & Body', icon: Truck },
];

export default function CategoriesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cat-header',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );

      gsap.fromTo(
        '.cat-card',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-24 md:py-32 bg-obsidian">
      <div className="max-w-[1440px] mx-auto px-6 md:px-8">
        <div className="cat-header mb-12">
          <p className="text-xs tracking-[0.15em] uppercase text-amber mb-3">
            Browse by System
          </p>
          <h2 className="text-4xl md:text-5xl font-light text-chrome tracking-tight">
            FIND YOUR PART
          </h2>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                className="cat-card aspect-square bg-ink rounded-xl border border-white/[0.06] flex flex-col items-center justify-center gap-4 cursor-pointer group hover:border-amber/30 transition-all duration-400"
              >
                <Icon
                  size={48}
                  className="text-steel group-hover:text-amber transition-colors duration-400"
                  strokeWidth={1}
                />
                <h3 className="text-lg font-medium text-chrome text-center px-4">
                  {cat.name}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

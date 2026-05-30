import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Truck, MapPin, CheckCircle, Users } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Truck,
    text: 'Same-day pickup from HGreg Trucks at 2900 NW 36th St',
  },
  {
    icon: MapPin,
    text: 'Free delivery to Dade & Broward fleet accounts',
  },
  {
    icon: CheckCircle,
    text: 'OEM & quality aftermarket — we stock both',
  },
  {
    icon: Users,
    text: 'Bilingual parts specialists',
  },
];

export default function WhySection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.why-left',
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );
      gsap.fromTo(
        '.why-right',
        { x: 40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          delay: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20">
          {/* Left column */}
          <div className="why-left">
            <p className="text-xs tracking-[0.15em] uppercase text-amber mb-3">
              Why Shop With Us
            </p>
            <h2 className="text-4xl md:text-5xl font-light text-chrome tracking-tight leading-tight">
              MIAMI TRUCKERS TRUST US
            </h2>
            <p className="text-base text-steel mt-6 leading-relaxed">
              We are an all-in-one company. A dealer with 2 locations and 2 parts stores located at 2900 NW 36th St, Miami, FL 33142 and 7500 NW 82 Pl, Medley, FL 33166. When you call us, you talk to someone who knows trucks — not a script.
            </p>

            <div className="mt-12 space-y-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.text} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
                      <Icon size={20} className="text-teal" />
                    </div>
                    <p className="text-sm text-chrome leading-relaxed pt-2">
                      {feature.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column */}
          <div className="why-right">
            <div className="rounded-xl overflow-hidden">
              <img
                src="/warehouse-interior.jpg"
                alt="HGreg Trucks Parts warehouse interior"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>

            <div className="bg-ink rounded-b-xl p-6 flex items-center justify-around">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-light text-amber tracking-tight">
                  22+
                </p>
                <p className="text-xs tracking-[0.1em] uppercase text-steel mt-1">
                  Years in Business
                </p>
              </div>
              <div className="w-px h-12 bg-white/[0.06]" />
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-light text-amber tracking-tight">
                  15,000+
                </p>
                <p className="text-xs tracking-[0.1em] uppercase text-steel mt-1">
                  Parts in Stock
                </p>
              </div>
              <div className="w-px h-12 bg-white/[0.06]" />
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-light text-amber tracking-tight">
                  24HR
                </p>
                <p className="text-xs tracking-[0.1em] uppercase text-steel mt-1">
                  Will-Call Pickup
                </p>
              </div>
            </div>


          </div>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useParts } from '../hooks/useParts';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedProducts() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { parts } = useParts();
  const [activeIndex, setActiveIndex] = useState(0);

  const products = parts.slice(0, 8);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.featured-header',
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
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Card width: 260px desktop, 280px mobile
  const getCardWidth = () => window.innerWidth >= 1024 ? 260 : window.innerWidth >= 768 ? 280 : 260;
  const CARD_GAP = 16;

  // Update active index based on scroll position
  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = getCardWidth();
      const newIndex = Math.round(scrollLeft / (cardWidth + CARD_GAP));
      setActiveIndex(Math.max(0, Math.min(products.length - 1, newIndex)));
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [products.length]);

  const getScrollAmount = () => {
    return getCardWidth() + CARD_GAP;
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const amount = getScrollAmount();
    const container = carouselRef.current;
    
    if (direction === 'left') {
      container.scrollBy({ left: -amount, behavior: 'smooth' });
      setActiveIndex((prev) => Math.max(0, prev - 1));
    } else {
      container.scrollBy({ left: amount, behavior: 'smooth' });
      setActiveIndex((prev) => Math.min(products.length - 1, prev + 1));
    }
  };

  return (
    <section
      id="featured-products"
      ref={sectionRef}
      className="relative w-full py-24 md:py-32 bg-obsidian overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-start">
          {/* Left header */}
          <div className="lg:col-span-2 featured-header">
            <p className="text-xs tracking-[0.15em] uppercase text-amber mb-3">
              Best Sellers
            </p>
            <h2 className="text-4xl md:text-5xl font-light text-chrome tracking-tight leading-tight">
              TOP MOVING PARTS
            </h2>
            <p className="text-base text-steel mt-4 max-w-[400px] leading-relaxed">
              The parts our shop customers order most. Genuine OEM and quality aftermarket alternatives at warehouse prices.
            </p>

            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => scrollCarousel('left')}
                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-steel hover:border-amber hover:text-amber transition-all duration-300"
              >
                <ArrowRight size={18} className="rotate-180" />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-steel hover:border-amber hover:text-amber transition-all duration-300"
              >
                <ArrowRight size={18} />
              </button>
              <span className="text-sm text-steel ml-2">
                {activeIndex + 1} / {products.length}
              </span>
            </div>

            <a
              href="/#/shop"
              className="inline-flex items-center gap-2 mt-8 text-sm tracking-[0.04em] uppercase text-amber hover:underline underline-offset-4 transition-all duration-300"
            >
              VIEW ALL PARTS <ArrowRight size={14} />
            </a>
          </div>

          {/* Right carousel */}
          <div className="lg:col-span-3 min-w-0">
            <div className="relative">
              <div
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory px-1"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  scrollPaddingLeft: '4px',
                  scrollPaddingRight: '24px',
                }}
              >
                {products.map((product, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={product.id}
                      onClick={() => navigate(`/product/${product.id}`)}
                      className={`snap-center shrink-0 w-[260px] md:w-[280px] lg:w-[260px] rounded-xl border text-left transition-all duration-500 group ${
                        isActive
                          ? 'border-amber/30 scale-100 opacity-100'
                          : 'border-white/[0.06] scale-95 opacity-70'
                      } hover:border-amber/30 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]`}
                      style={{ background: '#111118' }}
                    >
                      {/* Image */}
                      <div className="aspect-square overflow-hidden rounded-t-xl">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Info */}
                      <div className="p-5">
                        <p className="text-xs tracking-[0.1em] uppercase text-steel mb-1">
                          {product.category}
                        </p>
                        <h3 className="text-base font-medium text-chrome leading-snug">
                          {product.name}
                        </h3>
                        <p className="text-xs text-steel mt-1">
                          SKU: {product.sku}
                        </p>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xl font-medium text-amber tracking-tight">
                            ${product.price}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            product.stock > 10
                              ? 'bg-teal/20 text-teal'
                              : product.stock > 5
                              ? 'bg-amber/20 text-amber'
                              : 'bg-warning/20 text-warning'
                          }`}>
                            {product.stock} in stock
                          </span>
                        </div>
                        <div className="w-full mt-4 bg-white/[0.05] text-chrome rounded-lg py-3 text-sm font-medium text-center border border-white/10 group-hover:border-amber/30 transition-colors">
                          VIEW DETAILS →
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

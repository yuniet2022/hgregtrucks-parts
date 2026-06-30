import { useNavigate, useLocation } from 'react-router';
import { useParts } from '../hooks/useParts';
import HGregLogo from '../components/HGregLogo';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowLeft,
  Search,
  Filter,
  ChevronDown,
  ShoppingCart,
  SlidersHorizontal,
  X,
  Truck,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ALL_CATEGORIES = ['Engine', 'Brake', 'Suspension', 'Electrical', 'Cooling', 'Transmission', 'Exhaust', 'Emissions', 'Body', 'Lighting', 'Air System', 'Chassis'];
const ALL_MAKES = ['Kenworth', 'Peterbilt', 'Freightliner', 'Volvo', 'Mack', 'International', 'Western Star', 'Isuzu'];

export default function ShopPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { parts, loading } = useParts();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [makeFilter, setMakeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // Read URL query params
  const searchParams = new URLSearchParams(location.search);
  const yearFromFinder = searchParams.get('year') || '';
  const makeFromFinder = searchParams.get('make') || '';
  const modelFromFinder = searchParams.get('model') || '';
  const engineFromFinder = searchParams.get('engine') || '';
  const vinFromFinder = searchParams.get('vin') || '';
  const categoryFromUrl = searchParams.get('category') || '';
  const searchFromUrl = searchParams.get('search') || '';

  // Pre-fill category and search from URL
  useEffect(() => {
    if (categoryFromUrl) setCatFilter(categoryFromUrl);
    if (searchFromUrl) setSearch(searchFromUrl);
  }, [categoryFromUrl, searchFromUrl]);

  // If YMM from PartsFinder, pre-filter
  const hasYmmFilter = yearFromFinder && makeFromFinder;
  const hasVehicleFilter = hasYmmFilter || vinFromFinder;

  // Hide parts with stock <= 0 and parts marked as test/fake/dummy
  const availableParts = parts.filter((p) => {
    const hasStock = p.stock > 0;
    const notTest = !p.name.toLowerCase().includes('fake') &&
                    !p.name.toLowerCase().includes('test') &&
                    !p.sku.toLowerCase().includes('fake') &&
                    !p.sku.toLowerCase().includes('test') &&
                    !p.name.toLowerCase().includes('dummy');
    return hasStock && notTest;
  });

  const filtered = availableParts.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    const matchCat = !catFilter || p.category === catFilter;
    const matchMake = !makeFilter || p.make === makeFilter;
    const matchYear = !yearFromFinder || (p.yearFrom <= Number(yearFromFinder) && p.yearTo >= Number(yearFromFinder));
    const matchModel = !modelFromFinder || p.model.toLowerCase().includes(modelFromFinder.toLowerCase());
    return matchSearch && matchCat && matchMake && matchYear && matchModel;
  });

  const clearVehicle = () => {
    navigate('/shop');
  };

  useEffect(() => {
    if (!gridRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.shop-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.06,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 85%',
          },
        }
      );
    });
    return () => ctx.revert();
  }, [filtered]);

  return (
    <div className="min-h-[100dvh] bg-obsidian">
      <nav className="w-full h-16 bg-ink/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-steel hover:text-chrome transition-colors">
            <ArrowLeft size={20} />
          </button>
          <button onClick={() => navigate('/')}>
            <HGregLogo />
          </button>
        </div>
        <button onClick={() => navigate('/cart')} className="relative text-steel hover:text-chrome transition-colors">
          <ShoppingCart size={20} />
        </button>
      </nav>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-light text-chrome mb-2 tracking-tight">SHOP</h1>

        {/* Vehicle badge if filtering by vehicle */}
        {hasVehicleFilter && (
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 bg-amber/10 border border-amber/30 rounded-lg px-4 py-2">
              <Truck size={16} className="text-amber" />
              <span className="text-sm text-chrome">
                {yearFromFinder} {makeFromFinder} {modelFromFinder} {engineFromFinder}
              </span>
              {vinFromFinder && (
                <span className="text-sm text-chrome font-mono">VIN: {vinFromFinder}</span>
              )}
            </div>
            <button
              onClick={clearVehicle}
              className="text-steel hover:text-warning transition-colors p-1"
              title="Clear vehicle filter"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <p className="text-steel mb-6">{filtered.length} parts available</p>

        {/* Search + Filter toggle */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search parts..."
              className="w-full bg-ink border border-white/[0.12] rounded-lg pl-10 pr-4 py-2.5 text-sm text-chrome focus:border-amber focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors ${showFilters ? 'border-amber text-amber bg-amber/10' : 'border-white/[0.12] text-steel hover:text-chrome'}`}
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="bg-ink border border-white/[0.12] rounded-lg pl-9 pr-8 py-2.5 text-sm text-chrome appearance-none cursor-pointer focus:border-amber focus:outline-none"
              >
                <option value="">All Categories</option>
                {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-steel pointer-events-none" />
            </div>
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
              <select
                value={makeFilter}
                onChange={(e) => setMakeFilter(e.target.value)}
                className="bg-ink border border-white/[0.12] rounded-lg pl-9 pr-8 py-2.5 text-sm text-chrome appearance-none cursor-pointer focus:border-amber focus:outline-none"
              >
                <option value="">All Makes</option>
                {ALL_MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-steel pointer-events-none" />
            </div>
            {(catFilter || makeFilter) && (
              <button onClick={() => { setCatFilter(''); setMakeFilter(''); }} className="text-xs text-steel hover:text-chrome underline">
                Clear
              </button>
            )}
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <button
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="shop-card bg-ink rounded-xl border border-white/[0.06] overflow-hidden text-left hover:border-amber/30 transition-all duration-300 group"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[11px] tracking-[0.1em] uppercase text-steel mb-1">{product.category}</p>
                  <h3 className="text-sm font-medium text-chrome leading-snug line-clamp-2">{product.name}</h3>
                  <p className="text-[11px] text-steel mt-0.5 font-mono">{product.sku}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-base font-medium text-amber">${product.price}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${product.stock > 10 ? 'bg-teal/10 text-teal' : product.stock > 5 ? 'bg-amber/10 text-amber' : 'bg-warning/10 text-warning'}`}>
                      {product.stock}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

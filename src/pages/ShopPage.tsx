import { useNavigate, useLocation } from 'react-router';
import { useParts } from '../hooks/useParts';
import HGregLogo from '../components/HGregLogo';
import { useState, useEffect, useRef, type ComponentType } from 'react';
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
  Settings,
  AlertOctagon,
  MoveVertical,
  Zap,
  Droplets,
  Cog,
  Wind,
  Cloud,
  Shield,
  Lightbulb,
  Fan,
  LayoutGrid,
  Grid3X3,
  Wrench,
  type LucideProps,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ALL_MAKES = ['Kenworth', 'Peterbilt', 'Freightliner', 'Volvo', 'Mack', 'International', 'Western Star', 'Isuzu'];

// Icon + color lookup for known categories — unknown ones get a default
const ICON_MAP: Record<string, { icon: ComponentType<LucideProps>; color: string }> = {
  Engine: { icon: Settings, color: '#D4A843' },
  Brake: { icon: AlertOctagon, color: '#EF4444' },
  Suspension: { icon: MoveVertical, color: '#8B5CF6' },
  Electrical: { icon: Zap, color: '#F59E0B' },
  Cooling: { icon: Droplets, color: '#06B6D4' },
  Transmission: { icon: Cog, color: '#6366F1' },
  Exhaust: { icon: Wind, color: '#9CA3AF' },
  Emissions: { icon: Cloud, color: '#10B981' },
  Body: { icon: Shield, color: '#EC4899' },
  Lighting: { icon: Lightbulb, color: '#FCD34D' },
  'Air System': { icon: Fan, color: '#3B82F6' },
  Chassis: { icon: Grid3X3, color: '#6B7280' },
  Tires: { icon: LayoutGrid, color: '#F97316' },
  General: { icon: Wrench, color: '#D4A843' },
};

function getCatConfig(name: string) {
  return ICON_MAP[name] || { icon: Wrench, color: '#D4A843' };
}

export default function ShopPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { parts, loading } = useParts();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [makeFilter, setMakeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'categories' | 'products'>('categories');
  const gridRef = useRef<HTMLDivElement>(null);
  const catGridRef = useRef<HTMLDivElement>(null);

  // Read URL query params
  const searchParams = new URLSearchParams(location.search);
  const yearFromFinder = searchParams.get('year') || '';
  const makeFromFinder = searchParams.get('make') || '';
  const modelFromFinder = searchParams.get('model') || '';
  const engineFromFinder = searchParams.get('engine') || '';
  const vinFromFinder = searchParams.get('vin') || '';
  const categoryFromUrl = searchParams.get('category') || '';
  const searchFromUrl = searchParams.get('search') || '';

  // Pre-fill from URL
  useEffect(() => {
    if (categoryFromUrl) {
      setCatFilter(categoryFromUrl);
      setViewMode('products');
    }
    if (searchFromUrl) setSearch(searchFromUrl);
  }, [categoryFromUrl, searchFromUrl]);

  const hasVehicleFilter = (yearFromFinder && makeFromFinder) || vinFromFinder;

  // Filter out fake/test and out-of-stock parts
  const availableParts = parts.filter((p) => {
    const hasStock = p.stock > 0;
    const lc = p.name.toLowerCase() + ' ' + p.sku.toLowerCase();
    const notTest = !lc.includes('fake') && !lc.includes('test') && !lc.includes('dummy');
    return hasStock && notTest;
  });

  // Filtered parts (when viewing products)
  const filtered = availableParts.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    const matchCat = !catFilter || p.category === catFilter;
    const matchMake = !makeFilter || p.make === makeFilter;
    const matchYear = !yearFromFinder || (p.yearFrom <= Number(yearFromFinder) && p.yearTo >= Number(yearFromFinder));
    const matchModel = !modelFromFinder || p.model.toLowerCase().includes(modelFromFinder.toLowerCase());
    return matchSearch && matchCat && matchMake && matchYear && matchModel;
  });

  // Build dynamic category list from actual parts (only categories with >= 1 part)
  const categoryCounts: Record<string, number> = {};
  for (const p of availableParts) {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  }
  const dynamicCategories = Object.entries(categoryCounts)
    .filter(([, count]) => count > 0)
    .sort(([a], [b]) => a.localeCompare(b));

  const activeCatConfig = getCatConfig(catFilter);

  const handleCategoryClick = (name: string) => {
    setCatFilter(name);
    setViewMode('products');
  };

  const handleBackToCategories = () => {
    setCatFilter('');
    setViewMode('categories');
    setSearch('');
  };

  const clearVehicle = () => {
    navigate('/shop');
  };

  // Animation for product cards
  useEffect(() => {
    if (!gridRef.current || viewMode !== 'products') return;
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
  }, [filtered, viewMode]);

  // Animation for category cards
  useEffect(() => {
    if (!catGridRef.current || viewMode !== 'categories') return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cat-card',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.05,
          duration: 0.5,
          ease: 'power3.out',
        }
      );
    });
    return () => ctx.revert();
  }, [viewMode]);

  // ======== CATEGORY VIEW ========
  if (viewMode === 'categories' && !search) {
    return (
      <div className="min-h-[100dvh] bg-obsidian">
        {/* Navbar */}
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
          {/* Search bar at top */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-light text-chrome mb-2 tracking-tight">SHOP</h1>
            <p className="text-steel mb-4">Select a category to browse parts</p>
            <div className="relative max-w-lg">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value.trim()) setViewMode('products');
                }}
                placeholder="Search by keyword, part #, cross ref..."
                className="w-full bg-ink border border-white/[0.12] rounded-lg pl-10 pr-4 py-3 text-sm text-chrome focus:border-amber focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Vehicle badge */}
          {hasVehicleFilter && (
            <div className="flex items-center gap-3 mb-6">
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

          {/* Category Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div ref={catGridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* "All Parts" card */}
              <button
                onClick={() => { setCatFilter(''); setViewMode('products'); }}
                className="cat-card bg-ink rounded-xl border border-white/[0.06] p-6 text-center hover:border-amber/40 hover:bg-ink/80 transition-all duration-300 group"
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber/10 flex items-center justify-center group-hover:bg-amber/20 transition-colors">
                  <LayoutGrid size={28} className="text-amber" />
                </div>
                <p className="text-sm font-medium text-chrome uppercase tracking-wide">All Parts</p>
                <p className="text-xs text-steel mt-1">{availableParts.length} items</p>
              </button>

              {/* Dynamic category cards from actual parts */}
              {dynamicCategories.map(([catName, count]) => {
                const cfg = getCatConfig(catName);
                const Icon = cfg.icon;
                return (
                  <button
                    key={catName}
                    onClick={() => handleCategoryClick(catName)}
                    className="cat-card bg-ink rounded-xl border border-white/[0.06] p-6 text-center hover:border-white/20 hover:bg-ink/80 transition-all duration-300 group"
                  >
                    <div
                      className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center transition-colors group-hover:scale-110 duration-300"
                      style={{ backgroundColor: `${cfg.color}15` }}
                    >
                      <Icon size={28} style={{ color: cfg.color }} />
                    </div>
                    <p className="text-sm font-medium text-chrome uppercase tracking-wide">{catName}</p>
                    <p className="text-xs text-steel mt-1">{count} parts</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ======== PRODUCT LIST VIEW ========
  return (
    <div className="min-h-[100dvh] bg-obsidian">
      {/* Navbar */}
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
        {/* Back button + title */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={handleBackToCategories}
            className="flex items-center gap-2 text-sm text-steel hover:text-amber transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Categories</span>
          </button>
        </div>

        <h1 className="text-3xl md:text-4xl font-light text-chrome mb-2 tracking-tight">
          <span className="flex items-center gap-3">
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${activeCatConfig.color}15` }}
            >
              <activeCatConfig.icon size={20} style={{ color: activeCatConfig.color }} />
            </span>
            {catFilter || 'All Parts'}
          </span>
        </h1>

        {/* Vehicle badge */}
        {hasVehicleFilter && (
          <div className="flex items-center gap-3 mb-4 mt-3">
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

        <p className="text-steel mb-4">{filtered.length} parts available</p>

        {/* Search + Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search within this category..."
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

        {/* Filters panel */}
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
                {dynamicCategories.map(([name]) => (
                  <option key={name} value={name}>{name}</option>
                ))}
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
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-steel text-lg">No parts found</p>
            <button
              onClick={handleBackToCategories}
              className="mt-4 text-amber hover:text-chrome transition-colors text-sm"
            >
              Browse all categories
            </button>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <button
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="shop-card bg-ink rounded-xl border border-white/[0.06] overflow-hidden text-left hover:border-amber/30 transition-all duration-300 group"
              >
                <div className="aspect-square overflow-hidden bg-obsidian">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
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
                      {product.stock} in stock
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

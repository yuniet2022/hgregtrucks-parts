import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Truck, ChevronDown, ChevronUp, Search, X } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const years = Array.from({ length: 26 }, (_, i) => 2025 - i);
const makes = [
  'Kenworth',
  'Peterbilt',
  'Freightliner',
  'Volvo',
  'Mack',
  'International',
  'Western Star',
  'Isuzu',
];
const modelsByMake: Record<string, string[]> = {
  Kenworth: ['T680', 'T880', 'W900', 'T660', 'T800', 'T270', 'T370'],
  Peterbilt: ['579', '389', '567', '386', '384', '365', '520'],
  Freightliner: ['Cascadia', 'M2 106', 'M2 112', '122SD', '108SD', 'Coronado'],
  Volvo: ['VNL 860', 'VNL 760', 'VNL 740', 'VNR 640', 'VHD 300', 'VAH 300'],
  Mack: ['Anthem', 'Granite', 'Pinnacle', 'LR', 'TerraPro', 'MD'],
  International: ['LT Series', 'RH Series', 'HV Series', 'MV Series', 'HV507', 'LT625'],
  'Western Star': ['49X', '47X', '5700XE', '4900', '4800'],
  Isuzu: ['NPR-HD', 'NPR-XD', 'NQR', 'NRR', 'FTR', 'FVR'],
};
const enginesByMake: Record<string, string[]> = {
  Kenworth: ['Cummins ISX15', 'Cummins X15', 'PACCAR MX-13', 'PACCAR MX-11'],
  Peterbilt: ['Cummins ISX15', 'Cummins X15', 'PACCAR MX-13', 'PACCAR MX-11'],
  Freightliner: ['Detroit DD15', 'Detroit DD13', 'Cummins ISX15', 'Cummins B6.7'],
  Volvo: ['Volvo D13', 'Volvo D11', 'Volvo D16', 'Volvo D8'],
  Mack: ['Mack MP8', 'Mack MP7', 'Mack MP4', 'Mack MD7'],
  International: ['International A26', 'Cummins ISX15', 'International N9', 'International N13'],
  'Western Star': ['Detroit DD15', 'Cummins ISX15', 'Cummins X15'],
  Isuzu: ['Isuzu 4HK1', 'Isuzu 4JJ1', 'Isuzu 6HK1', 'Isuzu 6UZ1'],
};

type SearchMode = 'ymm' | 'vin';

export default function PartsFinder() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>('ymm');
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [engine, setEngine] = useState('');
  const [vin, setVin] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.finder-content',
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

  const availableModels = make ? modelsByMake[make] || [] : [];
  const availableEngines = make ? enginesByMake[make] || [] : [];

  const handleSearch = () => {
    if (searchMode === 'ymm' && year && make) {
      const params = new URLSearchParams();
      params.set('year', year);
      params.set('make', make);
      if (model) params.set('model', model);
      if (engine) params.set('engine', engine);
      navigate(`/shop?${params.toString()}`);
    } else if (searchMode === 'vin' && vin.trim()) {
      navigate(`/shop?vin=${encodeURIComponent(vin.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <section
      id="parts-finder"
      ref={sectionRef}
      className="relative w-full py-24 md:py-32 bg-ink border-y border-white/[0.06] overflow-hidden"
    >
      {/* Background watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        style={{ opacity: 0.02 }}
      >
        <span
          className="text-chrome font-bold uppercase whitespace-nowrap"
          style={{ fontSize: '18vw' }}
        >
          FIND YOUR FIT
        </span>
      </div>

      <div className="finder-content relative z-10 max-w-[700px] mx-auto px-6">
        <p className="text-xs tracking-[0.15em] uppercase text-amber mb-3 text-center">
          Parts Finder
        </p>
        <h2 className="text-4xl md:text-5xl font-light text-chrome tracking-tight text-center">
          FIND PARTS FOR YOUR TRUCK
        </h2>
        <p className="text-base text-steel mt-4 text-center">
          Select your truck to see parts that fit, or search by keyword.
        </p>

        {/* Main search bar with Add Vehicle dropdown */}
        <div className="mt-10 bg-obsidian rounded-xl border border-white/[0.12] overflow-hidden">
          {/* Top row: Add Vehicle button + search input */}
          <div className="flex items-center">
            {/* Add Vehicle toggle button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium tracking-[0.04em] uppercase transition-all border-r border-white/[0.12] shrink-0 ${
                isOpen ? 'text-amber bg-amber/10' : 'text-chrome hover:text-amber'
              }`}
            >
              <Truck size={18} />
              <span className="hidden sm:inline">Add Vehicle</span>
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* Search input */}
            <div className="flex-1 flex items-center px-4">
              <Search size={18} className="text-steel shrink-0" />
              <input
                type="text"
                placeholder="Search by keyword, part #, cross ref"
                onKeyDown={handleKeyDown}
                onChange={(e) => {
                  if (e.target.value.trim()) {
                    navigate(`/shop?search=${encodeURIComponent(e.target.value.trim())}`);
                  }
                }}
                className="w-full bg-transparent px-3 py-4 text-sm text-chrome placeholder:text-steel/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Expandable dropdown panel */}
          {isOpen && (
            <div className="border-t border-white/[0.08] px-5 py-5 space-y-4">
              {/* Mode toggle: YMM vs VIN */}
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={() => setSearchMode('ymm')}
                  className={`text-xs uppercase tracking-wider transition-colors ${
                    searchMode === 'ymm' ? 'text-amber' : 'text-steel hover:text-chrome'
                  }`}
                >
                  Search by Make / Model
                </button>
                <span className="text-white/[0.08]">|</span>
                <button
                  onClick={() => setSearchMode('vin')}
                  className={`text-xs uppercase tracking-wider transition-colors ${
                    searchMode === 'vin' ? 'text-amber' : 'text-steel hover:text-chrome'
                  }`}
                >
                  Search by VIN
                </button>
              </div>

              {searchMode === 'ymm' ? (
                /* Year / Make / Model / Engine grid */
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-ink border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-chrome appearance-none cursor-pointer focus:border-amber focus:outline-none"
                  >
                    <option value="">Year</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>

                  <select
                    value={make}
                    onChange={(e) => {
                      setMake(e.target.value);
                      setModel('');
                      setEngine('');
                    }}
                    className="w-full bg-ink border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-chrome appearance-none cursor-pointer focus:border-amber focus:outline-none"
                  >
                    <option value="">Make</option>
                    {makes.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    disabled={!make}
                    className="w-full bg-ink border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-chrome appearance-none cursor-pointer focus:border-amber focus:outline-none disabled:opacity-40"
                  >
                    <option value="">Model</option>
                    {availableModels.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  <select
                    value={engine}
                    onChange={(e) => setEngine(e.target.value)}
                    disabled={!make}
                    className="w-full bg-ink border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-chrome appearance-none cursor-pointer focus:border-amber focus:outline-none disabled:opacity-40"
                  >
                    <option value="">Engine</option>
                    {availableEngines.map((eng) => (
                      <option key={eng} value={eng}>{eng}</option>
                    ))}
                  </select>
                </div>
              ) : (
                /* VIN input */
                <div>
                  <input
                    type="text"
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter VIN to Search"
                    maxLength={17}
                    className="w-full bg-ink border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-chrome placeholder:text-steel/50 focus:border-amber focus:outline-none uppercase"
                  />
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleSearch}
                  disabled={searchMode === 'ymm' ? !year || !make : !vin.trim()}
                  className="flex-1 bg-amber text-obsidian rounded-lg py-3 text-sm font-semibold tracking-[0.04em] uppercase hover:bg-chrome transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {searchMode === 'ymm' ? 'Find Parts' : 'Search by VIN'}
                </button>
                <button
                  onClick={() => {
                    setYear(''); setMake(''); setModel(''); setEngine(''); setVin('');
                  }}
                  className="px-5 py-3 text-sm text-steel border border-white/[0.12] rounded-lg hover:border-white/30 hover:text-chrome transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

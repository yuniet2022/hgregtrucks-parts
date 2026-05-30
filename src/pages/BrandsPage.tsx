import { useNavigate } from 'react-router';
import HGregLogo from '../components/HGregLogo';
import { ArrowLeft } from 'lucide-react';

const brands = [
  {
    name: 'Kenworth',
    description: 'Premium heavy-duty trucks known for durability and driver comfort. Parts for T680, T880, W900, T660, T800, T270 and more.',
    origin: 'USA',
    established: '1923',
  },
  {
    name: 'Peterbilt',
    description: 'American icon in heavy-duty trucking. Parts for 579, 389, 567, 386, 384, 365, 520 and more.',
    origin: 'USA',
    established: '1939',
  },
  {
    name: 'Freightliner',
    description: 'North America\'s #1 heavy-duty truck manufacturer. Parts for Cascadia, M2 106, M2 112, 122SD, Coronado and more.',
    origin: 'USA',
    established: '1942',
  },
  {
    name: 'Volvo',
    description: 'Global leader in heavy-duty truck technology. Parts for VNL 860, VNL 760, VNL 740, VNR 640, VHD 300 and more.',
    origin: 'Sweden',
    established: '1928',
  },
  {
    name: 'Mack',
    description: 'Built like a Mack since 1900. Parts for Anthem, Granite, Pinnacle, LR, TerraPro, MD and more.',
    origin: 'USA',
    established: '1900',
  },
  {
    name: 'International',
    description: 'Pioneers of American trucking. Parts for LT Series, RH Series, HV Series, MV Series and more.',
    origin: 'USA',
    established: '1902',
  },
  {
    name: 'Western Star',
    description: 'Severe-duty trucks built for extreme conditions. Parts for 49X, 47X, 5700XE, 4900, 4800 and more.',
    origin: 'Canada',
    established: '1967',
  },
  {
    name: 'Ford',
    description: 'Commercial trucks for every job. Parts for F-650, F-750 and Transit models.',
    origin: 'USA',
    established: '1903',
  },
  {
    name: 'GMC',
    description: 'Professional grade commercial vehicles. Parts for all heavy-duty models.',
    origin: 'USA',
    established: '1911',
  },
  {
    name: 'Hino',
    description: 'Medium-duty trucks with Toyota reliability. Parts for all Hino models.',
    origin: 'Japan',
    established: '1942',
  },
  {
    name: 'Isuzu',
    description: 'Global leader in commercial diesel engines. Parts for NPR-HD, NPR-XD, NQR, NRR, FTR, FVR.',
    origin: 'Japan',
    established: '1916',
  },
  {
    name: 'PACCAR',
    description: 'Powering the world\'s best trucks. OEM engine parts for Kenworth, Peterbilt, and DAF.',
    origin: 'USA',
    established: '1905',
  },
];

export default function BrandsPage() {
  const navigate = useNavigate();

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
      </nav>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10">
        <h1 className="text-3xl md:text-4xl font-light text-chrome mb-4 tracking-tight">BRANDS</h1>
        <p className="text-steel mb-10 max-w-[600px]">
          HGreg Trucks Parts carries genuine and aftermarket parts for all major heavy-duty truck brands.
          With 25+ years of experience, we stock what you need when you need it.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="bg-ink rounded-xl border border-white/[0.06] p-6 hover:border-amber/30 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-medium text-chrome group-hover:text-amber transition-colors">
                  {brand.name}
                </h3>
                <span className="text-[11px] tracking-[0.1em] uppercase text-steel border border-white/[0.08] px-2 py-1 rounded">
                  Est. {brand.established}
                </span>
              </div>
              <p className="text-sm text-steel leading-relaxed mb-3">{brand.description}</p>
              <span className="text-xs text-steel/60">{brand.origin}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router';
import HGregLogo from '../components/HGregLogo';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  Truck,
  Wrench,
  Shield,
  Award,
  Users,
  Globe,
} from 'lucide-react';

export default function AboutPage() {
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

      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-10">
        <h1 className="text-3xl md:text-4xl font-light text-chrome mb-8 tracking-tight">ABOUT US</h1>

        {/* Hero Image */}
        <div className="rounded-xl overflow-hidden mb-10">
          <img
            src="/hero-bg.jpg"
            alt="HGreg Trucks"
            className="w-full aspect-video object-cover"
          />
        </div>

        {/* Main Story */}
        <div className="space-y-6 mb-12">
          <p className="text-base text-steel leading-relaxed">
            HGreg Trucks is an all-in-one heavy-duty truck company serving South Florida since 2000. 
            With <strong className="text-chrome">2 locations and 2 parts stores</strong>, we are one of the largest 
            independent heavy-duty truck dealers in the region.
          </p>
          <p className="text-base text-steel leading-relaxed">
            Located at <strong className="text-amber">2900 NW 36th St, Miami, FL 33142</strong> and 
            <strong className="text-amber"> 7500 NW 82 Pl, Medley, FL 33166</strong>, we offer a comprehensive 
            selection of new and used heavy-duty trucks, genuine OEM and aftermarket parts, as well as expert repair and maintenance services.
          </p>
          <p className="text-base text-steel leading-relaxed">
            When you call us, you talk to someone who knows trucks — not a script. Our bilingual parts 
            specialists have decades of combined experience in the heavy-duty trucking industry.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Award, label: 'Years Experience', value: '25+' },
            { icon: Truck, label: 'Trucks Available', value: '234+' },
            { icon: Wrench, label: 'Parts in Stock', value: '15,000+' },
            { icon: MapPin, label: 'Locations', value: '2' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-ink rounded-xl border border-white/[0.06] p-5 text-center">
                <Icon size={24} className="text-amber mx-auto mb-2" />
                <p className="text-2xl font-light text-amber tracking-tight">{stat.value}</p>
                <p className="text-[11px] tracking-[0.1em] uppercase text-steel mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Locations */}
        <h2 className="text-2xl font-light text-chrome mb-6">Our Locations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {/* Miami */}
          <div className="bg-ink rounded-xl border border-white/[0.06] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center">
                <MapPin size={20} className="text-amber" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-chrome">Miami</h3>
                <p className="text-sm text-steel">Main Store</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-steel">
              <p>2900 NW 36th St</p>
              <p>Miami, FL 33142</p>
              <div className="flex items-center gap-2 text-amber">
                <Phone size={14} />
                <span>(645) 333-2990</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>Mon-Sat: 9:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>

          {/* Medley */}
          <div className="bg-ink rounded-xl border border-white/[0.06] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center">
                <MapPin size={20} className="text-amber" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-chrome">Medley</h3>
                <p className="text-sm text-steel">Second Location</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-steel">
              <p>7500 NW 82 Pl</p>
              <p>Medley, FL 33166</p>
              <div className="flex items-center gap-2 text-amber">
                <Phone size={14} />
                <span>(645) 333-2990</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>Mon-Sat: 9:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* What Sets Us Apart */}
        <h2 className="text-2xl font-light text-chrome mb-6">Why Choose HGreg Trucks Parts</h2>
        <div className="space-y-4">
          {[
            { icon: Shield, title: 'Genuine OEM Parts', desc: 'We stock genuine OEM parts from all major manufacturers, plus quality aftermarket alternatives at warehouse prices.' },
            { icon: Wrench, title: 'Expert Knowledge', desc: 'Our bilingual parts specialists have decades of experience. We know trucks inside and out.' },
            { icon: Truck, title: 'Same-Day Pickup', desc: 'Order online and pick up the same day from either of our Miami or Medley locations.' },
            { icon: Users, title: 'Fleet Accounts', desc: 'Free delivery to Dade & Broward county fleet accounts with volume pricing available.' },
            { icon: Globe, title: 'Nationwide Shipping', desc: 'We ship parts anywhere in the continental United States. Get your parts fast, wherever you are.' },
            { icon: Clock, title: 'Extended Hours', desc: 'Open Monday through Saturday to serve you when you need us most.' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-4 bg-ink rounded-xl border border-white/[0.06] p-5">
                <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-amber" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-chrome mb-1">{item.title}</h3>
                  <p className="text-sm text-steel leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

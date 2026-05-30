import { useState } from 'react';
import { useNavigate } from 'react-router';
import { trpc } from '@/providers/trpc';
import { ArrowRight, Check } from 'lucide-react';

const shopLinks = [
  { label: 'Engine Parts', category: 'Engine' },
  { label: 'Brake Systems', category: 'Brake' },
  { label: 'Suspension', category: 'Suspension' },
  { label: 'Electrical', category: 'Electrical' },
  { label: 'Exhaust', category: 'Exhaust' },
  { label: 'Transmission', category: 'Transmission' },
];

const supportLinks = [
  { label: 'Contact Us', href: '/support' },
  { label: 'Returns Policy', href: '/support' },
  { label: 'Shipping Info', href: '/support' },
  { label: 'Order Tracking', href: '/support' },
  { label: 'FAQ', href: '/support' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const subscribe = trpc.messages.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 4000);
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    subscribe.mutate({
      name: 'Newsletter Subscriber',
      email: email.trim(),
      subject: 'Newsletter Subscription',
      body: `User subscribed to newsletter with email: ${email.trim()}`,
    });
  };

  return (
    <footer className="w-full bg-obsidian pt-20 pb-10 border-t border-white/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <div className="w-5 h-[1px] bg-steel/50" />
                <span className="text-[11px] font-bold tracking-[0.2em] text-steel uppercase">
                  <span className="text-amber">H</span>GREG
                </span>
                <div className="w-5 h-[1px] bg-steel/50" />
              </div>
              <span className="text-lg font-black tracking-[0.1em] text-chrome leading-none">
                TRUCKS
              </span>
            </div>
            <p className="text-sm text-steel mt-4 max-w-[280px] leading-relaxed text-center md:text-left">
              Heavy-duty parts for heavy-duty trucks. Serving South Florida since 2003.
            </p>

            <p className="text-xs tracking-[0.1em] uppercase text-chrome mt-8 mb-4">
              GET DEALS &amp; UPDATES
            </p>
            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={subscribe.isPending}
                className="flex-1 bg-ink border border-white/[0.12] border-r-0 rounded-l-lg px-4 py-3 text-sm text-chrome placeholder:text-steel/50 focus:border-amber focus:outline-none transition-colors duration-300 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={subscribe.isPending || submitted}
                className={`rounded-r-lg px-4 py-3 transition-colors duration-300 ${
                  submitted
                    ? 'bg-teal text-obsidian'
                    : 'bg-amber text-obsidian hover:bg-chrome'
                } disabled:opacity-50`}
              >
                {submitted ? <Check size={18} /> : <ArrowRight size={18} />}
              </button>
            </form>
            {submitted && (
              <p className="text-xs text-teal mt-2">You have been subscribed!</p>
            )}
            {subscribe.isError && (
              <p className="text-xs text-warning mt-2">Failed to subscribe. Please try again.</p>
            )}
          </div>

          {/* Shop */}
          <div>
            <p className="text-xs tracking-[0.1em] uppercase text-chrome mb-4">
              SHOP
            </p>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(`/shop?category=${link.category}`)}
                    className="text-sm text-steel hover:text-chrome transition-colors duration-300 text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-xs tracking-[0.1em] uppercase text-chrome mb-4">
              SUPPORT
            </p>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.href)}
                    className="text-sm text-steel hover:text-chrome transition-colors duration-300 text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs tracking-[0.1em] uppercase text-chrome mb-4">
              VISIT US
            </p>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-amber uppercase tracking-wider mb-1">Miami Store</p>
                <p className="text-sm text-steel leading-relaxed">
                  2900 NW 36th St
                  <br />
                  Miami, FL 33142
                </p>
              </div>
              <div>
                <p className="text-xs text-amber uppercase tracking-wider mb-1">Medley Store</p>
                <p className="text-sm text-steel leading-relaxed">
                  7500 NW 82 PL
                  <br />
                  Medley, FL 33166
                </p>
              </div>
              <p className="text-sm text-steel">
                Mon–Fri: 7AM–6PM
                <br />
                Sat: 8AM–2PM
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-steel">
            &copy; 2026 HGreg Trucks Parts. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/support')}
              className="text-xs text-steel hover:text-chrome transition-colors duration-300"
            >
              Privacy
            </button>
            <button
              onClick={() => navigate('/support')}
              className="text-xs text-steel hover:text-chrome transition-colors duration-300"
            >
              Terms
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

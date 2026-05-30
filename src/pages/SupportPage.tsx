import { useState } from 'react';
import { useNavigate } from 'react-router';
import HGregLogo from '../components/HGregLogo';
import { trpc } from '@/providers/trpc';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Package,
  Wrench,
  Truck,
  ChevronDown,
  ChevronUp,
  Send,
} from 'lucide-react';

const faqs = [
  {
    q: 'What are your store hours?',
    a: 'Our Miami and Medley locations are open Monday through Saturday from 9:00 AM to 6:00 PM. We are closed on Sundays. Same-day pickup is available for orders placed before 3:00 PM.',
  },
  {
    q: 'Do you ship parts outside of Florida?',
    a: 'Yes! We ship parts anywhere in the continental United States. Shipping rates vary based on weight and destination. Contact us for a quote on large or heavy items.',
  },
  {
    q: 'Do you offer fleet pricing?',
    a: 'Absolutely. We offer volume discounts and free delivery within Dade and Broward counties for qualifying fleet accounts. Contact our fleet department for more information.',
  },
  {
    q: 'How do I know if a part will fit my truck?',
    a: 'Use our Parts Finder tool to search by Year, Make, and Model. You can also call us at (645) 333-2990 and speak with one of our parts specialists who can verify fitment for you.',
  },
  {
    q: 'What is your return policy?',
    a: 'We accept returns within 30 days of purchase with original receipt. Parts must be unused and in original packaging. Electrical parts and special order items are non-returnable.',
  },
  {
    q: 'Do you install parts?',
    a: 'Yes, both of our locations have full-service repair shops. Our certified technicians can install any part we sell. Contact us to schedule an appointment.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Visa, MasterCard, American Express, Discover, PayPal, cash, and wire transfer. Fleet accounts may be eligible for net-30 terms.',
  },
  {
    q: 'Can I order parts online and pick up in store?',
    a: 'Yes! Add parts to your cart, proceed to checkout, and select "In-Store Pickup" as your delivery option. We will have your order ready for same-day pickup.',
  },
];

export default function SupportPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const sendMessage = trpc.messages.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      setForm({ name: '', email: '', subject: '', message: '' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage.mutate({
      name: form.name,
      email: form.email,
      subject: form.subject,
      body: form.message,
    });
  };

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
        <h1 className="text-3xl md:text-4xl font-light text-chrome mb-4 tracking-tight">SUPPORT</h1>
        <p className="text-steel mb-10">We are here to help. Reach out through any of the channels below.</p>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {/* Phone */}
          <div className="bg-ink rounded-xl border border-white/[0.06] p-6 hover:border-amber/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center">
                <Phone size={20} className="text-amber" />
              </div>
              <h3 className="text-base font-medium text-chrome">Call Us</h3>
            </div>
            <p className="text-2xl font-light text-amber mb-1">(645) 333-2990</p>
            <p className="text-sm text-steel">Mon-Sat: 9:00 AM - 6:00 PM</p>
          </div>

          {/* Email */}
          <div className="bg-ink rounded-xl border border-white/[0.06] p-6 hover:border-amber/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center">
                <Mail size={20} className="text-amber" />
              </div>
              <h3 className="text-base font-medium text-chrome">Email Us</h3>
            </div>
            <p className="text-lg text-chrome mb-1">info@hgregtrucks.com</p>
            <p className="text-sm text-steel">We reply within 24 hours</p>
          </div>

          {/* Miami */}
          <div className="bg-ink rounded-xl border border-white/[0.06] p-6 hover:border-amber/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center">
                <MapPin size={20} className="text-amber" />
              </div>
              <div>
                <h3 className="text-base font-medium text-chrome">Miami Store</h3>
                <p className="text-xs text-steel">Parts & Service</p>
              </div>
            </div>
            <p className="text-sm text-steel">2900 NW 36th St</p>
            <p className="text-sm text-steel">Miami, FL 33142</p>
            <div className="flex items-center gap-2 text-xs text-steel mt-2">
              <Clock size={12} /> Mon-Sat: 9:00 AM - 6:00 PM
            </div>
          </div>

          {/* Medley */}
          <div className="bg-ink rounded-xl border border-white/[0.06] p-6 hover:border-amber/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center">
                <MapPin size={20} className="text-amber" />
              </div>
              <div>
                <h3 className="text-base font-medium text-chrome">Medley Store</h3>
                <p className="text-xs text-steel">Parts & Service</p>
              </div>
            </div>
            <p className="text-sm text-steel">7500 NW 82 Pl</p>
            <p className="text-sm text-steel">Medley, FL 33166</p>
            <div className="flex items-center gap-2 text-xs text-steel mt-2">
              <Clock size={12} /> Mon-Sat: 9:00 AM - 6:00 PM
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {[
            { icon: Package, label: 'Order Status', desc: 'Track your order' },
            { icon: Wrench, label: 'Repair Services', desc: 'Schedule service' },
            { icon: Truck, label: 'Shipping Info', desc: 'Delivery options' },
            { icon: MessageCircle, label: 'Live Chat', desc: 'Chat with us' },
          ].map((link) => {
            const Icon = link.icon;
            return (
              <div key={link.label} className="bg-ink rounded-lg border border-white/[0.06] p-4 text-center hover:border-amber/30 transition-all cursor-pointer group">
                <Icon size={20} className="text-amber mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-chrome">{link.label}</p>
                <p className="text-[11px] text-steel">{link.desc}</p>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <h2 className="text-2xl font-light text-chrome mb-6">Frequently Asked Questions</h2>
        <div className="space-y-2 mb-12">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-ink rounded-xl border border-white/[0.06] overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-sm font-medium text-chrome pr-4">{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp size={18} className="text-amber shrink-0" />
                ) : (
                  <ChevronDown size={18} className="text-steel shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-steel leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <h2 className="text-2xl font-light text-chrome mb-6">Send Us a Message</h2>
        <form onSubmit={handleSubmit} className="bg-ink rounded-xl border border-white/[0.06] p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-teal/20 flex items-center justify-center mx-auto mb-3">
                <Send size={20} className="text-teal" />
              </div>
              <p className="text-chrome font-medium">Message Sent!</p>
              <p className="text-sm text-steel mt-1">We will get back to you within 24 hours.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  required
                  placeholder="Your Name *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-obsidian border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-chrome placeholder:text-steel/50 focus:border-amber focus:outline-none transition-colors"
                />
                <input
                  required
                  type="email"
                  placeholder="Email *"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-obsidian border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-chrome placeholder:text-steel/50 focus:border-amber focus:outline-none transition-colors"
                />
              </div>
              <input
                required
                placeholder="Subject *"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full bg-obsidian border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-chrome placeholder:text-steel/50 focus:border-amber focus:outline-none transition-colors"
              />
              <textarea
                required
                rows={4}
                placeholder="Your Message *"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-obsidian border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-chrome placeholder:text-steel/50 focus:border-amber focus:outline-none transition-colors resize-none"
              />
              <button
                type="submit"
                disabled={sendMessage.isPending}
                className="w-full bg-amber text-obsidian rounded-lg py-3 text-sm font-semibold tracking-[0.04em] uppercase hover:bg-chrome transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send size={16} />
                {sendMessage.isPending ? 'Sending...' : 'Send Message'}
              </button>
              {sendMessage.isError && (
                <p className="text-red-400 text-sm text-center">Failed to send. Please try again.</p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

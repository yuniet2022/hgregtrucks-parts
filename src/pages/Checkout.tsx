import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../hooks/useCart';
import PaymentProviders from '../components/PaymentProviders';
import StripeCardForm from '../components/StripeCardForm';
import PayPalButtonComponent from '../components/PayPalButton';
import {
  ArrowLeft,
  CreditCard,
  Check,
  ShieldCheck,
  Truck,
  Package,
  AlertCircle,
} from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card'>('card');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const tax = totalPrice * 0.07;
  const shipping = 0;
  const total = totalPrice + tax + shipping;

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSuccess = () => {
    setSuccess(true);
    clearCart();
  };

  const handleError = (msg: string) => {
    setError(msg);
  };

  if (items.length === 0 && !success) {
    navigate('/cart');
    return null;
  }

  if (success) {
    return (
      <div className="min-h-[100dvh] bg-obsidian flex items-center justify-center px-6">
        <div className="bg-ink rounded-xl border border-white/[0.06] p-10 max-w-[500px] w-full text-center">
          <div className="w-16 h-16 rounded-full bg-teal/20 flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-teal" />
          </div>
          <h2 className="text-2xl font-light text-chrome mb-3">Payment Successful!</h2>
          <p className="text-sm text-steel mb-2">
            Your order has been placed successfully.
          </p>
          <p className="text-sm text-amber mb-8">
            Total paid: ${total.toFixed(2)}
          </p>
          <div className="bg-obsidian rounded-lg p-4 mb-6 text-left text-sm space-y-2">
            <div className="flex items-center gap-2 text-steel">
              <Package size={16} className="text-teal" />
              Order confirmation sent to {form.email || 'your email'}
            </div>
            <div className="flex items-center gap-2 text-steel">
              <Truck size={16} className="text-teal" />
              Pickup available at 2900 NW 36th St, Miami
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-amber text-obsidian rounded-lg py-3 text-sm font-semibold uppercase hover:bg-chrome transition-colors"
          >
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-obsidian">
      <nav className="w-full h-16 bg-ink/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center px-6 sticky top-0 z-40">
        <button
          onClick={() => navigate('/cart')}
          className="text-steel hover:text-chrome transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Back to Cart</span>
        </button>
      </nav>

      <div className="max-w-[1100px] mx-auto px-6 py-10">
        <h1 className="text-3xl font-light text-chrome mb-8 tracking-tight">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Contact */}
            <div className="bg-ink rounded-xl border border-white/[0.06] p-6">
              <h2 className="text-sm tracking-[0.1em] uppercase text-steel mb-5 flex items-center gap-2">
                <Package size={16} className="text-amber" />
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="Full name *"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  required
                  className="bg-obsidian border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-chrome placeholder:text-steel/50 focus:border-amber focus:outline-none transition-colors"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  required
                  className="bg-obsidian border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-chrome placeholder:text-steel/50 focus:border-amber focus:outline-none transition-colors"
                />
                <input
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className="bg-obsidian border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-chrome placeholder:text-steel/50 focus:border-amber focus:outline-none transition-colors"
                />
                <input
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  className="bg-obsidian border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-chrome placeholder:text-steel/50 focus:border-amber focus:outline-none transition-colors"
                />
                <input
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  className="bg-obsidian border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-chrome placeholder:text-steel/50 focus:border-amber focus:outline-none transition-colors"
                />
                <input
                  placeholder="ZIP Code"
                  value={form.zip}
                  onChange={(e) => update('zip', e.target.value)}
                  className="bg-obsidian border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-chrome placeholder:text-steel/50 focus:border-amber focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Payment */}
            <div className="bg-ink rounded-xl border border-white/[0.06] p-6">
              <h2 className="text-sm tracking-[0.1em] uppercase text-steel mb-5 flex items-center gap-2">
                <CreditCard size={16} className="text-amber" />
                Payment Method
              </h2>

              {/* Payment tabs */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => { setPaymentMethod('card'); setError(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-amber/10 border border-amber/30 text-amber'
                      : 'bg-obsidian border border-white/[0.08] text-steel hover:text-chrome'
                  }`}
                >
                  <CreditCard size={16} />
                  Card
                </button>
                <button
                  onClick={() => { setPaymentMethod('paypal'); setError(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all ${
                    paymentMethod === 'paypal'
                      ? 'bg-amber/10 border border-amber/30 text-amber'
                      : 'bg-obsidian border border-white/[0.08] text-steel hover:text-chrome'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.629h6.844c2.578 0 4.661.536 5.565 1.928.435.672.625 1.487.534 2.394-.177 1.834-1.144 3.368-2.706 4.394-1.195.794-2.875 1.215-4.771 1.215h-1.93a.77.77 0 0 0-.757.629l-.757 5.03a.641.641 0 0 1-.633.74H7.076z"/>
                  </svg>
                  PayPal
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-warning bg-warning/10 rounded-lg p-3 mb-4">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <PaymentProviders amount={total}>
                {(stripe, clientSecret) => (
                  paymentMethod === 'card' ? (
                    <StripeCardForm total={total} onSuccess={handleSuccess} />
                  ) : (
                    <PayPalButtonComponent
                      total={total}
                      onSuccess={handleSuccess}
                      onError={handleError}
                    />
                  )
                )}
              </PaymentProviders>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-ink rounded-xl border border-white/[0.06] p-6 sticky top-24">
              <h2 className="text-sm tracking-[0.1em] uppercase text-steel mb-5">
                Your Order
              </h2>

              <div className="space-y-3 mb-5 max-h-[300px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-obsidian shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-chrome truncate">{item.name}</p>
                      <p className="text-xs text-steel">
                        {item.quantity} x ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/[0.06] pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-steel">Subtotal</span>
                  <span className="text-chrome">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-steel">Shipping</span>
                  <span className="text-teal">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-steel">Tax (7%)</span>
                  <span className="text-chrome">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-white/[0.06] pt-4 mt-4">
                <div className="flex justify-between items-end">
                  <span className="text-chrome font-medium">Total</span>
                  <span className="text-3xl font-light text-amber">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-steel">
                <ShieldCheck size={14} className="text-teal shrink-0" />
                100% secure payment. PCI compliant.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

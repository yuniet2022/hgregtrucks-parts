import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../hooks/useCart';
import { trpc } from '../providers/trpc';
import HGregLogo from '../components/HGregLogo';
import { ArrowLeft, CreditCard, Building2, Banknote, Landmark, CheckCircle, Loader2 } from 'lucide-react';

type PaymentMethod = 'stripe' | 'paypal' | 'bank_transfer' | 'cash_on_pickup';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [method, setMethod] = useState<PaymentMethod>('stripe');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{orderId: string; instructions: string} | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createOrder = trpc.payments.createOrder.useMutation();
  const createStripeSession = trpc.payments.createStripeCheckoutSession.useMutation();
  const tax = totalPrice * 0.07;
  const shipping = totalPrice > 200 ? 0 : 15;
  const grandTotal = totalPrice + tax + shipping;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Required';
    if (!email.trim() || !email.includes('@')) e.email = 'Valid email required';
    if (!phone.trim()) e.phone = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      // For Stripe: redirect to Stripe Checkout
      if (method === 'stripe') {
        const orderId = `HGP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const session = await createStripeSession.mutateAsync({
          items: items.map(i => ({
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          })),
          customerEmail: email,
          orderId,
        });
        if (session.url) {
          window.location.href = session.url; // Redirect to Stripe
          return;
        }
      }

      // For other methods: create order directly
      const res = await createOrder.mutateAsync({
        items: items.map(i => ({
          partId: i.id,
          quantity: i.quantity,
          price: i.price.toFixed(2),
          name: i.name,
        })),
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: address,
        paymentMethod: method,
        subtotal: totalPrice,
        tax,
        shipping,
        total: grandTotal,
        notes,
      });
      setResult(res);
      if (method !== 'bank_transfer') clearCart();
    } catch (err: any) {
      setErrors({ submit: err.message });
    }
    setSubmitting(false);
  };

  if (items.length === 0 && !result) {
    return (
      <div className="min-h-[100dvh] bg-obsidian flex flex-col items-center justify-center px-6">
        <HGregLogo />
        <p className="text-steel mt-4 mb-6">Your cart is empty</p>
        <button onClick={() => navigate('/shop')} className="bg-amber text-obsidian rounded-full px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-chrome transition-colors">
          Continue Shopping
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-[100dvh] bg-obsidian flex flex-col items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
          <CheckCircle size={64} className="text-teal mx-auto mb-4" />
          <h1 className="text-3xl font-light text-chrome mb-2">Order Confirmed</h1>
          <p className="text-amber text-sm font-mono mb-6">#{result.orderId}</p>
          <div className="bg-ink rounded-xl border border-white/[0.06] p-6 text-left mb-6">
            <p className="text-chrome text-sm whitespace-pre-line leading-relaxed">{result.instructions}</p>
          </div>
          <button onClick={() => navigate('/shop')} className="bg-amber text-obsidian rounded-full px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-chrome transition-colors">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-obsidian">
      {/* Header */}
      <nav className="w-full h-16 bg-ink/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center px-4 md:px-6 sticky top-0 z-40">
        <button onClick={() => navigate('/cart')} className="text-steel hover:text-chrome transition-colors mr-3">
          <ArrowLeft size={20} />
        </button>
        <HGregLogo />
      </nav>

      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-light text-chrome mb-8 tracking-tight">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Customer Info */}
            <div className="bg-ink rounded-xl border border-white/[0.06] p-6">
              <h2 className="text-sm font-medium text-chrome uppercase tracking-wider mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-steel mb-1 block">Full Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)} className={`w-full bg-obsidian border ${errors.name ? 'border-red-500' : 'border-white/[0.12]'} rounded-lg px-4 py-3 text-sm text-chrome focus:border-amber focus:outline-none`} placeholder="John Doe" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="text-xs text-steel mb-1 block">Email *</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" className={`w-full bg-obsidian border ${errors.email ? 'border-red-500' : 'border-white/[0.12]'} rounded-lg px-4 py-3 text-sm text-chrome focus:border-amber focus:outline-none`} placeholder="john@example.com" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="text-xs text-steel mb-1 block">Phone *</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} className={`w-full bg-obsidian border ${errors.phone ? 'border-red-500' : 'border-white/[0.12]'} rounded-lg px-4 py-3 text-sm text-chrome focus:border-amber focus:outline-none`} placeholder="(305) 555-0123" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="text-xs text-steel mb-1 block">Address (optional)</label>
                  <input value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-obsidian border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-chrome focus:border-amber focus:outline-none" placeholder="123 Main St, Miami, FL" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-ink rounded-xl border border-white/[0.06] p-6">
              <h2 className="text-sm font-medium text-chrome uppercase tracking-wider mb-4">Payment Method</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { id: 'stripe' as PaymentMethod, label: 'Card', icon: CreditCard, desc: 'Credit / Debit' },
                  { id: 'paypal' as PaymentMethod, label: 'PayPal', icon: Landmark, desc: 'PayPal Account' },
                  { id: 'bank_transfer' as PaymentMethod, label: 'Bank', icon: Building2, desc: 'Wire Transfer' },
                  { id: 'cash_on_pickup' as PaymentMethod, label: 'Cash', icon: Banknote, desc: 'Pay on Pickup' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setMethod(m.id); setErrors({}); }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${method === m.id ? 'border-amber bg-amber/10' : 'border-white/[0.06] hover:border-white/20'}`}
                  >
                    <m.icon size={24} className={method === m.id ? 'text-amber' : 'text-steel'} />
                    <span className={`text-xs font-medium ${method === m.id ? 'text-amber' : 'text-steel'}`}>{m.label}</span>
                    <span className="text-[10px] text-steel/60">{m.desc}</span>
                  </button>
                ))}
              </div>

              {/* Method details */}
              {method === 'stripe' && (
                <div className="bg-obsidian rounded-lg p-4 border border-white/[0.06]">
                  <p className="text-sm text-steel mb-2">You will be redirected to <strong className="text-chrome">Stripe Checkout</strong> to complete your card payment securely.</p>
                  <p className="text-xs text-amber">Visa, Mastercard, Amex, Discover accepted</p>
                </div>
              )}
              {method === 'paypal' && (
                <div className="bg-obsidian rounded-lg p-4 border border-white/[0.06]">
                  <p className="text-sm text-steel">You will be redirected to PayPal to complete your payment securely.</p>
                </div>
              )}
              {method === 'bank_transfer' && (
                <div className="bg-obsidian rounded-lg p-4 border border-white/[0.06]">
                  <p className="text-sm text-steel mb-2">After placing your order, you will receive our bank details to complete the wire transfer.</p>
                  <p className="text-xs text-amber">Order will be processed once payment is confirmed (1-2 business days).</p>
                </div>
              )}
              {method === 'cash_on_pickup' && (
                <div className="bg-obsidian rounded-lg p-4 border border-white/[0.06]">
                  <p className="text-sm text-steel mb-2">Pay in cash when you pick up your order at our Miami warehouse.</p>
                  <p className="text-xs text-amber">Bring a valid ID and your order number. Business hours: Mon-Fri 8AM-5PM</p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-ink rounded-xl border border-white/[0.06] p-6">
              <h2 className="text-sm font-medium text-chrome uppercase tracking-wider mb-4">Order Notes (optional)</h2>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-obsidian border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-chrome focus:border-amber focus:outline-none resize-none h-24" placeholder="Any special instructions..." />
            </div>

            {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-ink rounded-xl border border-white/[0.06] p-6 sticky top-20">
              <h2 className="text-sm font-medium text-chrome uppercase tracking-wider mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-obsidian" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-chrome truncate">{item.name}</p>
                      <p className="text-xs text-steel">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
                    </div>
                    <p className="text-sm text-chrome font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-white/[0.06] pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-steel">Subtotal</span>
                  <span className="text-chrome">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-steel">Tax (7%)</span>
                  <span className="text-chrome">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-steel">Shipping</span>
                  <span className={shipping === 0 ? 'text-teal' : 'text-chrome'}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-lg font-medium border-t border-white/[0.06] pt-3">
                  <span className="text-chrome">Total</span>
                  <span className="text-amber">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-6 bg-amber text-obsidian rounded-full py-4 text-sm font-semibold uppercase tracking-wider hover:bg-chrome transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                {submitting ? 'Processing...' : `Pay ${method === 'cash_on_pickup' ? 'on Pickup' : method === 'bank_transfer' ? 'via Bank' : '$' + grandTotal.toFixed(2)}`}
              </button>

              <p className="text-xs text-steel/50 text-center mt-3">Free shipping on orders over $200</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router';
import { useCart } from '../hooks/useCart';
import HGregLogo from '../components/HGregLogo';
import {
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Check,
} from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();

  return (
    <div className="min-h-[100dvh] bg-obsidian">
      <nav className="w-full h-16 bg-ink/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-steel hover:text-chrome transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <a href="/#/">
            <HGregLogo />
          </a>
        </div>
      </nav>

      <div className="max-w-[1000px] mx-auto px-6 py-10">
        <h1 className="text-3xl font-light text-chrome mb-8 tracking-tight flex items-center gap-3">
          <ShoppingBag size={28} className="text-amber" />
          Your Cart
          {totalItems > 0 && (
            <span className="text-base text-steel">({totalItems} items)</span>
          )}
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={64} className="mx-auto text-steel/20 mb-4" />
            <p className="text-chrome text-lg mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate('/')}
              className="bg-amber text-obsidian rounded-full px-8 py-3 text-sm font-semibold uppercase hover:bg-chrome transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-ink rounded-xl border border-white/[0.06] p-4"
                >
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-obsidian shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-chrome truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-steel mt-0.5">SKU: {item.sku}</p>
                    <p className="text-lg font-medium text-amber mt-2">
                      ${item.price.toFixed(2)}
                    </p>
                    {item.returnCore && (
                      <div className="flex items-center gap-1.5 mt-1.5 bg-teal/10 border border-teal/20 rounded-full px-2.5 py-1 w-fit">
                        <Check size={12} className="text-teal" />
                        <span className="text-[11px] text-teal font-medium">Core return (-${item.coreRebate})</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center bg-obsidian border border-white/[0.12] rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-3 py-2 text-steel hover:text-chrome transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 py-2 text-chrome text-sm font-medium min-w-[40px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock}
                          className="px-3 py-2 text-steel hover:text-chrome transition-colors disabled:opacity-30"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-steel hover:text-warning transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-ink rounded-xl border border-white/[0.06] p-6 sticky top-24">
                <h2 className="text-sm tracking-[0.1em] uppercase text-steel mb-6">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-steel">Subtotal</span>
                    <span className="text-chrome">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-steel">Shipping</span>
                    <span className="text-teal">Free (Miami)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-steel">Tax (7%)</span>
                    <span className="text-chrome">
                      ${(totalPrice * 0.07).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/[0.06] pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-chrome font-medium">Total</span>
                    <span className="text-2xl font-light text-amber">
                      ${(totalPrice * 1.07).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-amber text-obsidian rounded-lg py-4 text-sm font-semibold tracking-[0.04em] uppercase hover:bg-chrome transition-colors mb-3 flex items-center justify-center gap-2"
                >
                  <CreditCard size={18} />
                  Proceed to Checkout
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full border border-white/[0.12] text-steel rounded-lg py-3 text-sm hover:border-white/30 hover:text-chrome transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

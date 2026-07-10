import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { trpc } from '../providers/trpc';
import HGregLogo from '../components/HGregLogo';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session') || '';
  const orderId = searchParams.get('order') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [amount, setAmount] = useState<number | null>(null);
  const verifyQuery = trpc.payments.verifyStripeSession.useQuery(
    { sessionId },
    { enabled: !!sessionId, retry: 2 }
  );

  useEffect(() => {
    if (verifyQuery.data) {
      if (verifyQuery.data.status === 'paid') {
        setStatus('success');
        setAmount(verifyQuery.data.amountTotal);
        // Clear cart on successful payment
        localStorage.removeItem('mdp_cart');
        window.dispatchEvent(new Event('cart-updated'));
      } else {
        setStatus('error');
      }
    }
    if (verifyQuery.error) {
      setStatus('error');
    }
  }, [verifyQuery.data, verifyQuery.error]);

  return (
    <div className="min-h-[100dvh] bg-obsidian flex flex-col items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 size={64} className="text-amber mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-light text-chrome mb-2">Verifying Payment...</h1>
            <p className="text-steel">Please wait while we confirm your payment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={64} className="text-teal mx-auto mb-4" />
            <h1 className="text-3xl font-light text-chrome mb-2">Payment Successful!</h1>
            <p className="text-amber text-sm font-mono mb-2">Order: #{orderId}</p>
            {amount && (
              <p className="text-chrome text-lg mb-6">
                Total paid: <span className="text-amber font-medium">${(amount / 100).toFixed(2)}</span>
              </p>
            )}
            <div className="bg-ink rounded-xl border border-white/[0.06] p-6 text-left mb-6">
              <p className="text-chrome text-sm leading-relaxed mb-3">
                Thank you for your purchase! Your order has been confirmed and is being processed.
              </p>
              <p className="text-steel text-sm">
                You will receive a confirmation email shortly. For pickup orders, bring your order number and a valid ID.
              </p>
            </div>
            <button
              onClick={() => navigate('/shop')}
              className="bg-amber text-obsidian rounded-full px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-chrome transition-colors"
            >
              Continue Shopping
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={64} className="text-warning mx-auto mb-4" />
            <h1 className="text-2xl font-light text-chrome mb-2">Payment Not Completed</h1>
            <p className="text-steel mb-6">
              We couldn't verify your payment. If you were charged, please contact us.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/checkout')}
                className="bg-amber text-obsidian rounded-full px-6 py-3 text-sm font-semibold uppercase hover:bg-chrome transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/shop')}
                className="border border-white/[0.12] text-steel rounded-full px-6 py-3 text-sm hover:border-white/30 hover:text-chrome transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { CreditCard, ShieldCheck } from 'lucide-react';

interface StripeCardFormProps {
  total: number;
  onSuccess: () => void;
}

export default function StripeCardForm({ total, onSuccess }: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError('');

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess();
    } else {
      setError('Payment was not completed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-obsidian border border-white/[0.08] rounded-lg p-4">
        <p className="text-xs text-steel mb-3">Credit / Debit Card</p>
        <PaymentElement
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                name: '',
              },
            },
          }}
        />
      </div>

      {error && (
        <p className="text-xs text-warning bg-warning/10 rounded-lg p-3">{error}</p>
      )}

      <div className="flex items-center gap-2 text-xs text-steel">
        <ShieldCheck size={14} className="text-teal" />
        Secure encrypted payment powered by Stripe
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-amber text-obsidian rounded-lg py-4 text-sm font-semibold uppercase hover:bg-chrome transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {processing ? (
          <>
            <div className="w-4 h-4 border-2 border-obsidian border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard size={18} />
            Pay ${total.toFixed(2)}
          </>
        )}
      </button>
    </form>
  );
}

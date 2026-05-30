import { useState, useEffect } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { trpc } from '@/providers/trpc';

interface PaymentProvidersProps {
  amount: number;
  children: (stripe: Stripe | null, clientSecret: string) => React.ReactNode;
}

export default function PaymentProviders({ amount, children }: PaymentProvidersProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paypalClientId, setPaypalClientId] = useState('');

  const { data: config } = trpc.payments.getPublicConfig.useQuery();
  const createIntent = trpc.payments.createPaymentIntent.useMutation();

  // Load Stripe
  useEffect(() => {
    if (config?.stripePublishableKey) {
      loadStripe(config.stripePublishableKey).then(setStripe);
    }
  }, [config?.stripePublishableKey]);

  // Create PaymentIntent when amount changes
  useEffect(() => {
    if (amount > 0) {
      const cents = Math.round(amount * 100);
      createIntent.mutate(
        { amount: cents, currency: 'usd' },
        {
          onSuccess: (data) => {
            if (data.clientSecret) {
              setClientSecret(data.clientSecret);
            }
          },
        }
      );
    }
  }, [amount]);

  // Set PayPal client ID
  useEffect(() => {
    if (config?.paypalClientId) {
      setPaypalClientId(config.paypalClientId);
    }
  }, [config?.paypalClientId]);

  if (!config) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-steel mt-3">Loading payment config...</p>
      </div>
    );
  }

  // If no keys configured, show error
  if (!config.stripePublishableKey && !config.paypalClientId) {
    return (
      <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 text-center">
        <p className="text-sm text-warning">
          Payment processing is not configured yet.
        </p>
        <p className="text-xs text-steel mt-1">
          Please add your Stripe and PayPal API keys in the Railway dashboard.
        </p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: paypalClientId || 'sb', // 'sb' = sandbox fallback
        currency: 'USD',
        intent: 'capture',
      }}
    >
      {clientSecret && stripe ? (
        <Elements
          stripe={stripe}
          options={{
            clientSecret,
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#FFD600',
                colorBackground: '#111118',
                colorText: '#F4F4F5',
                colorDanger: '#D9383A',
                borderRadius: '8px',
                fontFamily: 'Inter, system-ui, sans-serif',
              },
            },
          }}
        >
          {children(stripe, clientSecret)}
        </Elements>
      ) : (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-steel mt-3">Initializing payment...</p>
        </div>
      )}
    </PayPalScriptProvider>
  );
}

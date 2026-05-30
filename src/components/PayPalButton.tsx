import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { trpc } from '@/providers/trpc';

interface PayPalButtonProps {
  total: number;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export default function PayPalButtonComponent({ total, onSuccess, onError }: PayPalButtonProps) {
  const [{ isResolved }] = usePayPalScriptReducer();
  const createPayPalOrder = trpc.payments.createPayPalOrder.useMutation();
  const capturePayPalOrder = trpc.payments.capturePayPalOrder.useMutation();

  if (!isResolved) {
    return (
      <div className="bg-obsidian border border-white/[0.08] rounded-lg p-6 text-center">
        <div className="w-6 h-6 border-2 border-amber border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-steel mt-2">Loading PayPal...</p>
      </div>
    );
  }

  return (
    <div className="bg-obsidian border border-white/[0.08] rounded-lg p-4">
      <PayPalButtons
        style={{
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'pay',
          height: 45,
        }}
        createOrder={async () => {
          try {
            const result = await createPayPalOrder.mutateAsync({
              amount: total,
              currency: 'USD',
            });
            return result.orderId;
          } catch (e: any) {
            onError(e.message || 'Failed to create PayPal order');
            throw e;
          }
        }}
        onApprove={async (data) => {
          try {
            await capturePayPalOrder.mutateAsync({ orderId: data.orderID });
            onSuccess();
          } catch (e: any) {
            onError(e.message || 'PayPal payment failed');
          }
        }}
        onError={(err) => {
          onError(typeof err === 'string' ? err : 'PayPal encountered an error');
        }}
        onCancel={() => {
          onError('Payment was cancelled');
        }}
      />
    </div>
  );
}

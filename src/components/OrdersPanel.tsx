import { useState } from 'react';
import { trpc } from '../providers/trpc';
import {
  ShoppingCart, Search, Filter, ChevronDown, Eye, PackageCheck, Truck, CheckCircle, XCircle, Clock, AlertTriangle, DollarSign, CreditCard, Landmark, Banknote, Building2, RefreshCw
} from 'lucide-react';

export default function OrdersPanel() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [fulfillment, setFulfillment] = useState('');
  const [search, setSearch] = useState('');
  const [detailId, setDetailId] = useState<number | null>(null);

  const { data: stats } = trpc.orders.stats.useQuery();
  const { data, isLoading, refetch } = trpc.orders.list.useQuery({
    page,
    limit: 20,
    status: status || undefined,
    paymentMethod: paymentMethod || undefined,
    fulfillment: fulfillment || undefined,
    search: search || undefined,
  });
  const { data: orderDetail } = trpc.orders.get.useQuery(
    { id: detailId! },
    { enabled: !!detailId }
  );
  const updateOrder = trpc.orders.update.useMutation({ onSuccess: () => refetch() });

  const statusColors: Record<string, string> = {
    paid: 'text-teal bg-teal/10',
    pending: 'text-amber bg-amber/10',
    failed: 'text-warning bg-warning/10',
    refunded: 'text-steel bg-white/5',
    disputed: 'text-red-500 bg-red-500/10',
  };

  const fulfillmentColors: Record<string, string> = {
    pending: 'text-amber bg-amber/10',
    picked: 'text-blue-400 bg-blue-400/10',
    packed: 'text-cyan bg-cyan/10',
    shipped: 'text-purple-400 bg-purple-400/10',
    delivered: 'text-teal bg-teal/10',
    ready_for_pickup: 'text-teal bg-teal/10',
    picked_up: 'text-teal bg-teal/10',
  };

  const methodIcons: Record<string, any> = {
    stripe: CreditCard,
    paypal: Landmark,
    bank_transfer: Building2,
    cash_on_pickup: Banknote,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingCart} label="Total Orders" value={stats?.totalOrders?.toString() ?? '-'} color="amber" />
        <StatCard icon={DollarSign} label="Revenue" value={stats?.totalRevenue ? `$${parseFloat(stats.totalRevenue).toLocaleString()}` : '-'} color="teal" />
        <StatCard icon={Clock} label="Today" value={stats?.todayOrders?.toString() ?? '-'} color="blue" />
        <StatCard icon={AlertTriangle} label="Pending" value={stats?.pendingOrders?.toString() ?? '-'} color="warning" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-ink rounded-xl border border-white/[0.06] p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search orders..." className="w-full bg-obsidian border border-white/[0.12] rounded-lg pl-10 pr-4 py-2.5 text-sm text-chrome focus:border-amber focus:outline-none" />
        </div>
        <div className="relative">
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="bg-obsidian border border-white/[0.12] rounded-lg pl-4 pr-10 py-2.5 text-sm text-chrome appearance-none cursor-pointer focus:border-amber focus:outline-none">
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="disputed">Disputed</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-steel pointer-events-none" />
        </div>
        <div className="relative">
          <select value={paymentMethod} onChange={e => { setPaymentMethod(e.target.value); setPage(1); }} className="bg-obsidian border border-white/[0.12] rounded-lg pl-4 pr-10 py-2.5 text-sm text-chrome appearance-none cursor-pointer focus:border-amber focus:outline-none">
            <option value="">All Methods</option>
            <option value="stripe">Card (Stripe)</option>
            <option value="paypal">PayPal</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash_on_pickup">Cash on Pickup</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-steel pointer-events-none" />
        </div>
        <div className="relative">
          <select value={fulfillment} onChange={e => { setFulfillment(e.target.value); setPage(1); }} className="bg-obsidian border border-white/[0.12] rounded-lg pl-4 pr-10 py-2.5 text-sm text-chrome appearance-none cursor-pointer focus:border-amber focus:outline-none">
            <option value="">All Fulfillment</option>
            <option value="pending">Pending</option>
            <option value="picked">Picked</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="picked_up">Picked Up</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-steel pointer-events-none" />
        </div>
        <button onClick={() => refetch()} className="p-2.5 rounded-lg border border-white/[0.12] text-steel hover:text-amber transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-ink rounded-xl border border-white/[0.06] overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin" /></div>
        ) : data?.orders.length === 0 ? (
          <div className="text-center py-12 text-steel">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-steel text-xs uppercase tracking-wider">
                  <th className="text-left p-4">Order</th>
                  <th className="text-left p-4">Customer</th>
                  <th className="text-left p-4">Method</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Fulfillment</th>
                  <th className="text-right p-4">Total</th>
                  <th className="text-left p-4">Date</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {data?.orders.map(order => {
                  const MIcon = methodIcons[order.paymentMethod] || CreditCard;
                  return (
                    <tr key={order.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-mono text-amber">#{order.orderNumber}</td>
                      <td className="p-4">
                        <p className="text-chrome font-medium">{order.customerName}</p>
                        <p className="text-steel text-xs">{order.customerEmail}</p>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 text-steel text-xs capitalize">
                          <MIcon size={14} /> {order.paymentMethod.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.paymentStatus] || 'text-steel bg-white/5'}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={order.fulfillmentStatus}
                          onChange={e => updateOrder.mutate({ id: order.id, fulfillmentStatus: e.target.value as any })}
                          className="bg-obsidian border border-white/[0.12] rounded-lg px-2 py-1 text-xs text-chrome appearance-none cursor-pointer focus:border-amber focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="picked">Picked</option>
                          <option value="packed">Packed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="ready_for_pickup">Ready for Pickup</option>
                          <option value="picked_up">Picked Up</option>
                        </select>
                      </td>
                      <td className="p-4 text-right font-medium text-chrome">${parseFloat(order.total).toFixed(2)}</td>
                      <td className="p-4 text-steel text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <button onClick={() => setDetailId(detailId === order.id ? null : order.id)} className="text-steel hover:text-amber transition-colors">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/[0.06]">
            <p className="text-xs text-steel">Page {data.page} of {data.totalPages} ({data.total} orders)</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-white/[0.12] text-sm text-steel hover:text-chrome disabled:opacity-30">Prev</button>
              <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="px-3 py-1.5 rounded-lg border border-white/[0.12] text-sm text-steel hover:text-chrome disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {detailId && orderDetail && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDetailId(null)} />
          <div className="relative bg-ink rounded-2xl border border-white/[0.08] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium text-chrome">Order #{orderDetail.orderNumber}</h2>
                <button onClick={() => setDetailId(null)} className="text-steel hover:text-chrome transition-colors">Close</button>
              </div>

              {/* Customer Info */}
              <div className="bg-obsidian rounded-xl p-4 mb-4">
                <h3 className="text-xs uppercase tracking-wider text-steel mb-3">Customer</h3>
                <p className="text-chrome text-sm"><strong>Name:</strong> {orderDetail.customerName}</p>
                <p className="text-chrome text-sm"><strong>Email:</strong> {orderDetail.customerEmail}</p>
                {orderDetail.customerPhone && <p className="text-chrome text-sm"><strong>Phone:</strong> {orderDetail.customerPhone}</p>}
                {orderDetail.shippingAddress && <p className="text-chrome text-sm"><strong>Address:</strong> {orderDetail.shippingAddress}</p>}
                {orderDetail.ipAddress && <p className="text-steel text-xs mt-2"><strong>IP:</strong> {orderDetail.ipAddress}</p>}
              </div>

              {/* Items */}
              <div className="bg-obsidian rounded-xl p-4 mb-4">
                <h3 className="text-xs uppercase tracking-wider text-steel mb-3">Items</h3>
                <div className="space-y-3">
                  {orderDetail.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img src={item.partImage || '/no-photo.png'} alt={item.partName} className="w-12 h-12 rounded-lg object-cover bg-ink" />
                      <div className="flex-1">
                        <p className="text-chrome text-sm font-medium">{item.partName}</p>
                        <p className="text-steel text-xs">{item.partSku} x {item.quantity}</p>
                      </div>
                      <p className="text-chrome text-sm font-medium">${parseFloat(item.totalPrice).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-obsidian rounded-xl p-4 mb-4">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-steel">Subtotal</span><span className="text-chrome">${parseFloat(orderDetail.subtotal).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-steel">Tax</span><span className="text-chrome">${parseFloat(orderDetail.tax).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-steel">Shipping</span><span className="text-chrome">${parseFloat(orderDetail.shipping).toFixed(2)}</span></div>
                  <div className="flex justify-between border-t border-white/[0.06] pt-2 mt-2"><span className="text-chrome font-medium">Total</span><span className="text-amber font-medium">${parseFloat(orderDetail.total).toFixed(2)}</span></div>
                </div>
              </div>

              {/* Anti-fraud info */}
              {orderDetail.fraudScore ? (
                <div className={`rounded-xl p-4 mb-4 ${orderDetail.fraudScore > 50 ? 'bg-red-500/10 border border-red-500/20' : orderDetail.fraudScore > 25 ? 'bg-amber/10 border border-amber/20' : 'bg-teal/10 border border-teal/20'}`}>
                  <h3 className="text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                    <AlertTriangle size={14} className={orderDetail.fraudScore > 50 ? 'text-red-500' : orderDetail.fraudScore > 25 ? 'text-amber' : 'text-teal'} />
                    Risk Assessment
                  </h3>
                  <p className="text-sm"><strong>Score:</strong> {orderDetail.fraudScore}/100</p>
                  {orderDetail.fraudFlags && <p className="text-xs text-steel mt-1">Flags: {orderDetail.fraudFlags}</p>}
                  {orderDetail.threeDSecure && <p className="text-xs text-steel">3D Secure: {orderDetail.threeDSecure}</p>}
                  {orderDetail.cardCountry && <p className="text-xs text-steel">Card Country: {orderDetail.cardCountry}</p>}
                </div>
              ) : null}

              {/* Update Status */}
              <div className="flex flex-wrap gap-3">
                <button onClick={() => { updateOrder.mutate({ id: orderDetail.id, fulfillmentStatus: 'picked' }); }} className="px-4 py-2 rounded-lg bg-blue-400/10 text-blue-400 text-xs uppercase font-medium hover:bg-blue-400/20 transition-colors">Mark Picked</button>
                <button onClick={() => { updateOrder.mutate({ id: orderDetail.id, fulfillmentStatus: 'packed' }); }} className="px-4 py-2 rounded-lg bg-cyan/10 text-cyan text-xs uppercase font-medium hover:bg-cyan/20 transition-colors">Mark Packed</button>
                <button onClick={() => { updateOrder.mutate({ id: orderDetail.id, fulfillmentStatus: 'shipped' }); }} className="px-4 py-2 rounded-lg bg-purple-400/10 text-purple-400 text-xs uppercase font-medium hover:bg-purple-400/20 transition-colors">Mark Shipped</button>
                <button onClick={() => { updateOrder.mutate({ id: orderDetail.id, fulfillmentStatus: 'ready_for_pickup' }); }} className="px-4 py-2 rounded-lg bg-teal/10 text-teal text-xs uppercase font-medium hover:bg-teal/20 transition-colors">Ready for Pickup</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    amber: 'text-amber bg-amber/10',
    teal: 'text-teal bg-teal/10',
    blue: 'text-blue-400 bg-blue-400/10',
    warning: 'text-warning bg-warning/10',
  };
  return (
    <div className="bg-ink rounded-xl border border-white/[0.06] p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-lg ${colorMap[color]} flex items-center justify-center`}>
          <Icon size={20} />
        </div>
        <p className="text-steel text-xs uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-light text-chrome">{value}</p>
    </div>
  );
}

export const dynamic = 'force-dynamic';
import { dbConnect } from '@/lib/mongodb';
import Order from '@/models/Order';
import Settings from '@/models/Settings';
import PrintButton from '@/components/PrintButton';

export default async function CourierBillPage({ params }) {
  await dbConnect();
  const order = await Order.findById(params.orderId).lean();
  const settings = await Settings.findOne({ key: 'global' }).lean();

  if (!order) return <div className="p-10 text-center text-brand-ink/50 text-sm">Shipping label not found.</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white text-brand-ink border border-brand-ink/15 m-6">
      {/* Header — order number as a plain hairline tag, not a filled pill */}
      <div className="flex justify-between items-center border-b border-dashed border-brand-ink/25 pb-3 mb-3">
        <h1 className="font-bold text-base tracking-widest text-brand-ink">SHIPPING LABEL</h1>
        <span className="text-xs font-mono border border-brand-ink/20 px-2 py-1">{order.orderNumber}</span>
      </div>

      <p className="eyebrow mb-1">From</p>
      <p className="text-sm font-semibold">{settings?.storeName || 'Mohith Trends'}</p>
      <p className="text-sm text-brand-ink/70">{settings?.address || 'Sivakasi, Virudhunagar Dt, Tamil Nadu'}</p>

      <p className="eyebrow mt-4 mb-1">To</p>
      <p className="text-sm font-semibold">{order.customer?.name}</p>
      <p className="text-sm text-brand-ink/70">{order.customer?.phone}</p>
      <p className="text-sm text-brand-ink/70">{order.shippingAddress?.line1}, {order.shippingAddress?.line2}</p>
      <p className="text-sm text-brand-ink/70">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
      {order.shippingAddress?.landmark && <p className="text-sm text-brand-ink/50">Landmark: {order.shippingAddress.landmark}</p>}

      {/* Dashed rule kept — it signals a tear/fold line on a physical label, which is functional, not decorative */}
      <div className="border-t border-dashed border-brand-ink/25 mt-4 pt-3 text-sm space-y-1.5">
        <div className="flex justify-between"><span className="text-brand-ink/60">Items</span><span className="font-semibold">{order.items.length}</span></div>
        <div className="flex justify-between">
          <span className="text-brand-ink/60">Payment</span>
          <span className={order.paymentMethod === 'cod' ? 'font-semibold text-brand-gold' : 'font-semibold'}>
            {order.paymentMethod === 'cod' ? `COD - ₹${order.total}` : 'Prepaid'}
          </span>
        </div>
        <div className="flex justify-between"><span className="text-brand-ink/60">Courier Partner</span><span>{order.courier?.partner || '—'}</span></div>
        <div className="flex justify-between"><span className="text-brand-ink/60">AWB / Tracking No.</span><span className="font-mono">{order.courier?.awbNumber || '—'}</span></div>
      </div>

      <PrintButton label="Print Label" />
    </div>
  );
}
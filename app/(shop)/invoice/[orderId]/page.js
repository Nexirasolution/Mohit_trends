export const dynamic = 'force-dynamic';
import { dbConnect } from '@/lib/mongodb';
import Order from '@/models/Order';
import Settings from '@/models/Settings';
import { formatINR } from '@/lib/utils';
import PrintButton from '@/components/PrintButton';

export default async function InvoicePage({ params }) {
  await dbConnect();
  const order = await Order.findById(params.orderId).lean();
  const settings = await Settings.findOne({ key: 'global' }).lean();

  if (!order) return <div className="p-10 text-center text-brand-ink/50 text-sm">Invoice not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white text-brand-ink">
      {/* Header — single hairline rule, no double gold borders */}
      <div className="flex justify-between items-start border-b border-brand-ink/15 pb-5 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-ink">{settings?.storeName || 'Mohith Trends'}</h1>
          <p className="text-sm text-brand-ink/50 mt-0.5">{settings?.address || 'Sivakasi, Virudhunagar Dt, Tamil Nadu'}</p>
          <p className="text-sm text-brand-ink/50">WhatsApp: +{settings?.whatsapp}</p>
        </div>
        <div className="text-right">
          <p className="eyebrow">Invoice</p>
          <p className="text-sm text-brand-ink mt-1">{order.orderNumber}</p>
          <p className="text-sm text-brand-ink/50">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p className="font-semibold text-brand-ink mb-1 text-xs uppercase tracking-widest">Billed To</p>
          <p>{order.customer?.name}</p>
          <p>{order.customer?.phone}</p>
          <p>{order.shippingAddress?.line1}, {order.shippingAddress?.line2}</p>
          <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
        </div>
        <div>
          <p className="font-semibold text-brand-ink mb-1 text-xs uppercase tracking-widest">Payment</p>
          <p>Method: {order.paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}</p>
          <p>Status: {order.paymentStatus}</p>
        </div>
      </div>

      <table className="w-full text-sm border-collapse mb-6">
        <thead>
          <tr className="border-b border-brand-ink/20 text-left">
            <th className="py-2 font-semibold text-brand-ink text-xs uppercase tracking-wide">Item</th>
            <th className="py-2 font-semibold text-brand-ink text-xs uppercase tracking-wide">Color/Size</th>
            <th className="py-2 text-right font-semibold text-brand-ink text-xs uppercase tracking-wide">Price</th>
            <th className="py-2 text-right font-semibold text-brand-ink text-xs uppercase tracking-wide">Qty</th>
            <th className="py-2 text-right font-semibold text-brand-ink text-xs uppercase tracking-wide">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={i} className="border-b border-brand-ink/10">
              <td className="py-2">{item.name}</td>
              <td className="py-2">{item.color}/{item.size}</td>
              <td className="py-2 text-right">{formatINR(item.price)}</td>
              <td className="py-2 text-right">{item.qty}</td>
              <td className="py-2 text-right">{formatINR(item.price * item.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-56 text-sm space-y-1.5">
          <div className="flex justify-between"><span className="text-brand-ink/60">Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
          {order.discount > 0 && (
            <div className="flex justify-between text-brand-gold font-medium">
              <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
              <span>-{formatINR(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between"><span className="text-brand-ink/60">Shipping</span><span>{order.shippingFee === 0 ? 'Free' : formatINR(order.shippingFee)}</span></div>
          <div className="flex justify-between font-bold text-base text-brand-ink border-t border-brand-ink/20 pt-1.5 mt-1.5">
            <span>Total</span><span>{formatINR(order.total)}</span>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-brand-ink/40 mt-10 tracking-wide">Thank you for shopping with {settings?.storeName || 'Mohith Trends'}!</p>

      <PrintButton />
    </div>
  );
}
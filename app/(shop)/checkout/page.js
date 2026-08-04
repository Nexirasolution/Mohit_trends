'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import toast from 'react-hot-toast';
import { useCart, cartKey } from '@/components/CartContext';
import { formatINR } from '@/lib/utils';

// SSRK Brand Colors
// Crimson : #8B0000
// Gold    : #C9A84C
// Cream   : #fdf5f5

const inputStyle = {
  width: '100%',
  border: '1.5px solid #e8d5d5',
  borderRadius: '8px',
  padding: '10px 12px',
  fontSize: '14px',
  fontFamily: 'sans-serif',
  color: '#1a1a1a',
  background: '#fff',
  outline: 'none',
  transition: 'border-color 0.15s',
};

const cardStyle = {
  background: '#fff',
  borderRadius: '12px',
  border: '1.5px solid #e8d5d5',
  padding: '20px',
  boxShadow: '0 2px 8px rgba(139,0,0,0.06)',
};

const sectionHeadStyle = {
  fontSize: '15px',
  fontWeight: '700',
  color: '#8B0000',
  fontFamily: 'Georgia, serif',
  marginBottom: '12px',
};

function SSRKInput({ placeholder, type = 'text', value, onChange, autoComplete, inputMode, maxLength }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      autoComplete={autoComplete}
      inputMode={inputMode}
      maxLength={maxLength}
      value={value}
      onChange={onChange}
      style={inputStyle}
      onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
      onBlur={(e) => (e.target.style.borderColor = '#e8d5d5')}
    />
  );
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart, updateQty, removeItem, setItemStock } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    line1: '', line2: '', city: '', state: '', pincode: '', landmark: ''
  });
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [submitting, setSubmitting] = useState(false);
  const [checkingStock, setCheckingStock] = useState(false);

  const [shipping, setShipping] = useState(null);
  const [freeShippingAbove, setFreeShippingAbove] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  const discountedSubtotal = subtotal - discount;
  const total = shipping !== null ? Math.round(discountedSubtotal + shipping) : null;

  const fetchShipping = useCallback(async () => {
    setShippingLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtotal: discountedSubtotal })
      });
      const data = await res.json();
      if (res.ok) {
        setShipping(data.shippingCost);
        setFreeShippingAbove(data.freeShippingAbove);
      } else {
        toast.error(data.error || 'Could not calculate shipping');
      }
    } catch {
      toast.error('Could not calculate shipping');
    } finally {
      setShippingLoading(false);
    }
  }, [discountedSubtotal]);

  useEffect(() => { fetchShipping(); }, [fetchShipping]);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function applyCoupon() {
    if (!coupon.trim()) return;
    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: coupon, subtotal })
    });
    const data = await res.json();
    if (data.valid) { setDiscount(data.discount); toast.success(data.message); }
    else { setDiscount(0); toast.error(data.message); }
  }

  /**
   * Re-checks every cart line against live DB stock right before payment.
   * Returns true if the cart is clean and it's safe to proceed; false if
   * anything had to be removed/adjusted (caller should stop and let the
   * shopper review the updated cart before retrying).
   */
  async function validateStockBeforeOrder() {
    setCheckingStock(true);
    try {
      const res = await fetch('/api/cart/validate-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            size: i.size,
            qty: i.qty,
            name: i.name,
          })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Could not verify stock, please try again');
        return false;
      }

      if (data.valid) return true;

      data.issues.forEach((issue) => {
        const key = cartKey(issue);
        if (issue.reason === 'unavailable' || issue.reason === 'out_of_stock') {
          toast.error(`${issue.name || 'An item'} is out of stock and was removed from your cart`);
          removeItem(key);
        } else if (issue.reason === 'insufficient_stock') {
          toast.error(`Only ${issue.availableStock} left of ${issue.name || 'an item'} — quantity adjusted`);
          updateQty(key, issue.availableStock);
          setItemStock(key, issue.availableStock);
        }
      });

      return false;
    } catch {
      toast.error('Could not verify stock, please try again');
      return false;
    } finally {
      setCheckingStock(false);
    }
  }

  async function placeOrder() {
    if (!form.name || !form.phone || !form.line1 || !form.city || !form.pincode) {
      toast.error('Please fill all required fields'); return;
    }
    if (items.length === 0) { toast.error('Your cart is empty'); return; }
    if (shipping === null) { toast.error('Shipping is still being calculated, please wait'); return; }

    setSubmitting(true);

    const stockOk = await validateStockBeforeOrder();
    if (!stockOk) {
      setSubmitting(false);
      return;
    }

    const orderItems = items.map((i) => ({
      productId: i.productId, variantId: i.variantId, size: i.size, qty: i.qty
    }));

    try {
      if (paymentMethod === 'razorpay') {
        const orderRes = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total })
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok) { toast.error(orderData.error || 'Payment gateway error'); setSubmitting(false); return; }

        const rzp = new window.Razorpay({
          key: orderData.keyId,
          amount: orderData.order.amount,
          currency: 'INR',
          name: 'Mohith Trends',
          order_id: orderData.order.id,
          prefill: { name: form.name, contact: form.phone, email: form.email },
          theme: { color: '#8B0000' },
          handler: async function (response) {
            const finalRes = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: orderItems,
                customer: { name: form.name, phone: form.phone, email: form.email },
                shippingAddress: form,
                couponCode: coupon,
                paymentMethod: 'razorpay',
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })
            });
            const finalData = await finalRes.json();
            if (finalRes.ok) { clearCart(); router.push(`/order-success/${finalData.order._id}`); }
            else {
              // Order creation itself failed (e.g. a server-side stock race
              // lost the last unit between our check and now).
              toast.error(finalData.error || 'Could not save order');
            }
            setSubmitting(false);
          },
          modal: { ondismiss: () => setSubmitting(false) }
        });
        rzp.open();
      } else {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: orderItems,
            customer: { name: form.name, phone: form.phone, email: form.email },
            shippingAddress: form,
            couponCode: coupon,
            paymentMethod: 'cod'
          })
        });
        const data = await res.json();
        if (res.ok) { clearCart(); router.push(`/order-success/${data.order._id}`); }
        else { toast.error(data.error || 'Could not place order'); }
        setSubmitting(false);
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  const placeOrderDisabled = submitting || shippingLoading || checkingStock || shipping === null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      {/* Page heading */}
      <div className="mb-6">
        <h1 style={{ color: '#8B0000', fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '700', letterSpacing: '0.5px' }}>
          Checkout
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <div style={{ height: '1px', width: '40px', background: '#C9A84C' }} />
          <span style={{ color: '#C9A84C', fontSize: '12px' }}>✦</span>
          <div style={{ height: '1px', width: '40px', background: '#C9A84C' }} />
        </div>
      </div>

      {/* Free shipping nudge */}
      {freeShippingAbove !== null && shipping !== null && shipping > 0 && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 mb-4 text-xs"
          style={{
            background: '#fdf5f5',
            border: '1.5px solid #C9A84C',
            borderRadius: '8px',
            color: '#5a2020',
            fontFamily: 'sans-serif',
          }}
        >
          <span style={{ color: '#C9A84C' }}>✦</span>
          Add <strong style={{ color: '#8B0000' }}>{formatINR(freeShippingAbove - discountedSubtotal)}</strong> more to get{' '}
          <strong style={{ color: '#2e7d32' }}>free shipping!</strong>
        </div>
      )}

      <div className="flex flex-col gap-6 sm:grid sm:grid-cols-2 sm:gap-8">

        {/* Shipping Details */}
        <div style={cardStyle}>
          <p style={sectionHeadStyle}>Shipping Details</p>
          <div style={{ height: '1px', background: '#C9A84C', opacity: 0.4, marginBottom: '16px' }} />
          <div className="space-y-3">
            <SSRKInput placeholder="Full Name *" autoComplete="name" value={form.name} onChange={(e) => update('name', e.target.value)} />
            <SSRKInput placeholder="Phone Number *" type="tel" inputMode="numeric" autoComplete="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            <SSRKInput placeholder="Email (optional)" type="email" autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            <SSRKInput placeholder="Address Line 1 *" autoComplete="address-line1" value={form.line1} onChange={(e) => update('line1', e.target.value)} />
            <SSRKInput placeholder="Address Line 2" autoComplete="address-line2" value={form.line2} onChange={(e) => update('line2', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="City *"
                autoComplete="address-level2"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                style={{ ...inputStyle, width: 'auto' }}
                onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
                onBlur={(e) => (e.target.style.borderColor = '#e8d5d5')}
              />
              <input
                placeholder="State"
                autoComplete="address-level1"
                value={form.state}
                onChange={(e) => update('state', e.target.value)}
                style={{ ...inputStyle, width: 'auto' }}
                onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
                onBlur={(e) => (e.target.style.borderColor = '#e8d5d5')}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Pincode *"
                inputMode="numeric"
                maxLength={6}
                autoComplete="postal-code"
                value={form.pincode}
                onChange={(e) => update('pincode', e.target.value)}
                style={{ ...inputStyle, width: 'auto' }}
                onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
                onBlur={(e) => (e.target.style.borderColor = '#e8d5d5')}
              />
              <input
                placeholder="Landmark"
                value={form.landmark}
                onChange={(e) => update('landmark', e.target.value)}
                style={{ ...inputStyle, width: 'auto' }}
                onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
                onBlur={(e) => (e.target.style.borderColor = '#e8d5d5')}
              />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Order Summary */}
          <div style={cardStyle}>
            <p style={sectionHeadStyle}>Order Summary</p>
            <div style={{ height: '1px', background: '#C9A84C', opacity: 0.4, marginBottom: '12px' }} />

            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {items.map((i, idx) => (
                <div key={idx} className="flex justify-between text-sm py-1 gap-2" style={{ color: '#5a2020', fontFamily: 'sans-serif' }}>
                  <span className="truncate">{i.name} ({i.color}/{i.size}) ×{i.qty}</span>
                  <span className="shrink-0" style={{ fontWeight: '600' }}>{formatINR(i.price * i.qty)}</span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="flex gap-2 mt-3">
              <input
                placeholder="Coupon code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                style={{ ...inputStyle, flex: 1, width: 'auto' }}
                onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
                onBlur={(e) => (e.target.style.borderColor = '#e8d5d5')}
              />
              <button
                onClick={applyCoupon}
                className="px-4 text-sm font-semibold shrink-0 transition-all"
                style={{
                  background: '#fff',
                  color: '#8B0000',
                  border: '1.5px solid #8B0000',
                  borderRadius: '8px',
                  fontFamily: 'sans-serif',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#8B0000'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#8B0000'; }}
              >
                Apply
              </button>
            </div>

            {/* Gold divider */}
            <div style={{ height: '1px', background: '#C9A84C', opacity: 0.3, margin: '12px 0' }} />

            {/* Price breakdown */}
            <div className="space-y-1.5 text-sm" style={{ fontFamily: 'sans-serif' }}>
              <div className="flex justify-between" style={{ color: '#5a2020' }}>
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between" style={{ color: '#2e7d32', fontWeight: '600' }}>
                  <span>Discount</span>
                  <span>−{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between" style={{ color: '#5a2020' }}>
                <span>Shipping</span>
                <span>
                  {shippingLoading
                    ? <span style={{ color: '#a07070' }}>Calculating…</span>
                    : shipping === 0
                      ? <span style={{ color: '#2e7d32', fontWeight: '600' }}>Free</span>
                      : shipping !== null
                        ? formatINR(shipping)
                        : <span style={{ color: '#a07070' }}>—</span>
                  }
                </span>
              </div>
            </div>

            <div
              className="flex justify-between font-bold mt-3 pt-3"
              style={{ borderTop: '1.5px solid #C9A84C', fontSize: '16px' }}
            >
              <span style={{ color: '#1a1a1a', fontFamily: 'sans-serif' }}>Total</span>
              <span style={{ color: '#8B0000', fontFamily: 'Georgia, serif' }}>
                {total !== null ? formatINR(total) : '—'}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div style={cardStyle}>
            <p style={sectionHeadStyle}>Payment Method</p>
            <div style={{ height: '1px', background: '#C9A84C', opacity: 0.4, marginBottom: '12px' }} />
            <label className="flex items-center gap-3 text-sm cursor-pointer" style={{ color: '#5a2020', fontFamily: 'sans-serif' }}>
              <input
                type="radio"
                checked={paymentMethod === 'razorpay'}
                onChange={() => setPaymentMethod('razorpay')}
                style={{ accentColor: '#8B0000', width: '16px', height: '16px' }}
              />
              Pay Online (Cards / UPI / Netbanking)
            </label>
          </div>

          {/* Place Order CTA */}
          <button
            onClick={placeOrder}
            disabled={placeOrderDisabled}
            className="w-full py-3 font-bold text-sm sm:text-base transition-all"
            style={{
              background: placeOrderDisabled ? '#b05050' : '#8B0000',
              color: '#fff',
              border: '2px solid #C9A84C',
              borderRadius: '8px',
              fontFamily: 'Georgia, serif',
              fontSize: '15px',
              letterSpacing: '0.5px',
              cursor: placeOrderDisabled ? 'not-allowed' : 'pointer',
              opacity: placeOrderDisabled ? 0.6 : 1,
            }}
            onMouseEnter={(e) => { if (!placeOrderDisabled) e.currentTarget.style.background = '#6e0000'; }}
            onMouseLeave={(e) => { if (!placeOrderDisabled) e.currentTarget.style.background = '#8B0000'; }}
          >
            {submitting
              ? (checkingStock ? 'Checking stock…' : 'Placing Order…')
              : shippingLoading
                ? 'Calculating shipping…'
                : total !== null
                  ? `Place Order — ${formatINR(total)}`
                  : 'Place Order'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
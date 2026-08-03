'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import toast from 'react-hot-toast';
import { useCart, cartKey } from '@/components/CartContext';
import { formatINR } from '@/lib/utils';

// Mohith Trends brand tokens
// Ink   : #0A0A0A
// Gold  : #C6A15B
// Ivory : #FAF9F6

const inputStyle = {
  width: '100%',
  border: '1px solid #E5E2DC',
  borderRadius: '2px',
  padding: '11px 12px',
  fontSize: '14px',
  fontFamily: 'inherit',
  color: '#0A0A0A',
  background: '#fff',
  outline: 'none',
  transition: 'border-color 0.15s',
};

function focusGold(e) { e.target.style.borderColor = '#C6A15B'; }
function blurDefault(e) { e.target.style.borderColor = '#E5E2DC'; }

function BrandInput({ placeholder, type = 'text', value, onChange, autoComplete, inputMode, maxLength }) {
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
      onFocus={focusGold}
      onBlur={blurDefault}
    />
  );
}

function SectionHead({ children }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] tracking-[0.2em] uppercase text-black/40 font-medium">{children}</p>
      <div className="h-px w-full bg-black/10 mt-3" />
    </div>
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
          theme: { color: '#0A0A0A' },
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
    <div className="max-w-4xl mx-auto px-6 py-10 sm:py-14">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      {/* Page heading */}
      <div className="mb-10 text-center">
        <h1 className="font-serif text-[1.75rem] text-black">Checkout</h1>
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className="h-px w-8 bg-[#C6A15B]" />
          <span className="text-[#C6A15B] text-xs">✦</span>
          <span className="h-px w-8 bg-[#C6A15B]" />
        </div>
      </div>

      {/* Free shipping nudge */}
      {freeShippingAbove !== null && shipping !== null && shipping > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 mb-8 text-xs border border-black/10 text-black/60">
          <span className="text-[#C6A15B]">✦</span>
          Add <strong className="text-black font-medium">{formatINR(freeShippingAbove - discountedSubtotal)}</strong>&nbsp;more to get&nbsp;
          <strong className="text-black font-medium">free shipping</strong>
        </div>
      )}

      <div className="flex flex-col gap-10 sm:grid sm:grid-cols-2 sm:gap-16">

        {/* Shipping Details */}
        <div>
          <SectionHead>Shipping Details</SectionHead>
          <div className="space-y-3">
            <BrandInput placeholder="Full Name *" autoComplete="name" value={form.name} onChange={(e) => update('name', e.target.value)} />
            <BrandInput placeholder="Phone Number *" type="tel" inputMode="numeric" autoComplete="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            <BrandInput placeholder="Email (optional)" type="email" autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            <BrandInput placeholder="Address Line 1 *" autoComplete="address-line1" value={form.line1} onChange={(e) => update('line1', e.target.value)} />
            <BrandInput placeholder="Address Line 2" autoComplete="address-line2" value={form.line2} onChange={(e) => update('line2', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="City *"
                autoComplete="address-level2"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                style={{ ...inputStyle, width: 'auto' }}
                onFocus={focusGold}
                onBlur={blurDefault}
              />
              <input
                placeholder="State"
                autoComplete="address-level1"
                value={form.state}
                onChange={(e) => update('state', e.target.value)}
                style={{ ...inputStyle, width: 'auto' }}
                onFocus={focusGold}
                onBlur={blurDefault}
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
                onFocus={focusGold}
                onBlur={blurDefault}
              />
              <input
                placeholder="Landmark"
                value={form.landmark}
                onChange={(e) => update('landmark', e.target.value)}
                style={{ ...inputStyle, width: 'auto' }}
                onFocus={focusGold}
                onBlur={blurDefault}
              />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-9">

          {/* Order Summary */}
          <div>
            <SectionHead>Order Summary</SectionHead>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((i, idx) => (
                <div key={idx} className="flex justify-between text-sm py-1 gap-2 text-black/70 font-light">
                  <span className="truncate">{i.name} ({i.color}/{i.size}) ×{i.qty}</span>
                  <span className="shrink-0 text-black">{formatINR(i.price * i.qty)}</span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="flex gap-2 mt-4">
              <input
                placeholder="Coupon code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                style={{ ...inputStyle, flex: 1, width: 'auto' }}
                onFocus={focusGold}
                onBlur={blurDefault}
              />
              <button
                onClick={applyCoupon}
                className="px-5 text-xs tracking-widest uppercase shrink-0 border border-black text-black hover:bg-black hover:text-white transition-colors"
              >
                Apply
              </button>
            </div>

            <div className="h-px w-full bg-black/10 my-5" />

            {/* Price breakdown */}
            <div className="space-y-2 text-sm text-black/60 font-light">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-black">
                  <span>Discount</span>
                  <span>−{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingLoading
                    ? <span className="text-black/30">Calculating…</span>
                    : shipping === 0
                      ? <span className="text-black">Free</span>
                      : shipping !== null
                        ? formatINR(shipping)
                        : <span className="text-black/30">—</span>
                  }
                </span>
              </div>
            </div>

            <div className="flex justify-between items-baseline mt-4 pt-4 border-t border-black/10">
              <span className="text-sm text-black/50 tracking-wide">Total</span>
              <span className="font-serif text-xl text-black">
                {total !== null ? formatINR(total) : '—'}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <SectionHead>Payment Method</SectionHead>
            <label className="flex items-center gap-3 text-sm cursor-pointer text-black/70 font-light">
              <input
                type="radio"
                checked={paymentMethod === 'razorpay'}
                onChange={() => setPaymentMethod('razorpay')}
                style={{ accentColor: '#0A0A0A', width: '15px', height: '15px' }}
              />
              Pay Online (Cards / UPI / Netbanking)
            </label>
          </div>

          {/* Place Order CTA */}
          <button
            onClick={placeOrder}
            disabled={placeOrderDisabled}
            className="w-full py-4 text-xs tracking-[0.2em] uppercase transition-colors"
            style={{
              background: placeOrderDisabled ? '#00000055' : '#0A0A0A',
              color: '#fff',
              cursor: placeOrderDisabled ? 'not-allowed' : 'pointer',
              opacity: placeOrderDisabled ? 0.6 : 1,
            }}
          >
            {submitting
              ? (checkingStock ? 'Checking stock…' : 'Placing order…')
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
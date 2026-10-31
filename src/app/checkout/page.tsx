'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Lock,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Tag,
  ChevronRight,
  User,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { catalogService } from '@/services/catalogService';
import { useAuth } from '@/context/AuthContext';
import { STORE_CONFIG } from '@/config/store';
import { getProductImageUrl } from '@/utils/image';
import { SavedAddress, CouponItem, CustomerOrder } from '@/types/api';

export default function CheckoutPage() {
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null);

  const { cartItems, subtotal, clearCart } = useCart();
  const { user, setIsAuthModalOpen } = useAuth();

  // Form State
  const [email, setEmail] = useState(user?.email || '');
  const [fullName, setFullName] = useState(user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const handleSelectSavedAddress = (sa: SavedAddress) => {
    setSelectedSavedAddressId(sa.id || null);
    setFullName(sa.fullName || '');
    setPhone(sa.phone || '');
    setAddress(sa.addressLine1 || '');
    setApartment(sa.addressLine2 || sa.landmark || '');
    setCity(sa.city || '');
    setState(sa.state || '');
    setPincode(sa.pincode || '');
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('alpha_enterprise_saved_addresses');
      if (stored) {
        const parsed: SavedAddress[] = JSON.parse(stored);
        setSavedAddresses(parsed);
        const def = parsed.find((a) => a.isDefault) || parsed[0];
        if (def) {
          handleSelectSavedAddress(def);
        }
      }
    } catch {}
  }, []);
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id?: string;
    code: string;
    discountAmount: number;
    discountType?: 'PERCENTAGE' | 'FIXED';
    discountValue?: number;
    message: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState<CouponItem[]>([]);
  const [showAllCoupons, setShowAllCoupons] = useState(false);

  // Order Placement State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<CustomerOrder | null>(null);

  // Applied discount from server validation
  useEffect(() => {
    catalogService
      .getCoupons()
      .then((list) => {
        setAvailableCoupons(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, []);

  const appliedDiscount = appliedCoupon?.discountAmount || 0;
  const shippingCost = shippingMethod === 'express' ? 199 : subtotal > 2000 ? 0 : 99;
  const totalAmount = Math.max(0, subtotal - appliedDiscount + shippingCost);

  // Revalidate coupon if cart items change
  const appliedCouponCode = appliedCoupon?.code;
  useEffect(() => {
    if (appliedCouponCode && cartItems.length > 0) {
      catalogService
        .validateCoupon(appliedCouponCode, cartItems, email || user?.email || '', subtotal)
        .then((res) => {
          if (res.valid) {
            setAppliedCoupon({
              id: res.couponId,
              code: res.code || appliedCouponCode,
              discountAmount: res.discountAmount,
              discountType: res.discountType,
              discountValue: res.discountValue,
              message: res.message,
            });
            setCouponError('');
          } else {
            setAppliedCoupon(null);
            setCouponError(res.message || 'Coupon is no longer valid for your current cart');
            setCouponSuccess('');
          }
        })
        .catch(() => {
          setAppliedCoupon(null);
        });
    }
  }, [cartItems, subtotal, email, user?.email, appliedCouponCode]);

  // Apply Coupon Code via Server Validation API
  const handleApplyCoupon = async (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    const code = (customCode || couponCode).trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await catalogService.validateCoupon(
        code,
        cartItems,
        email || user?.email || '',
        subtotal
      );

      if (res.valid) {
        setAppliedCoupon({
          id: res.couponId,
          code: res.code || code,
          discountAmount: res.discountAmount,
          discountType: res.discountType,
          discountValue: res.discountValue,
          message: res.message,
        });
        setCouponSuccess(res.message || 'Coupon applied successfully!');
        setCouponError('');
        setCouponCode(res.code || code);
      } else {
        setAppliedCoupon(null);
        setCouponError(res.message || 'Invalid coupon code');
        setCouponSuccess('');
      }
    } catch (err: unknown) {
      setAppliedCoupon(null);
      const errMsg = err instanceof Error ? err.message : 'Failed to validate coupon code';
      setCouponError(errMsg);
      setCouponSuccess('');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    setCouponSuccess('');
  };

  // Place Order Handler (Pre-payment stage)
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsSubmitting(true);

    try {
      // Simulate order processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

      const orderSummary: CustomerOrder = {
        id: orderId,
        createdAt: new Date().toISOString(),
        status: 'PROCESSING',
        items: [...cartItems],
        subtotal,
        shipping: shippingCost,
        discount: appliedDiscount,
        couponId: appliedCoupon?.id || null,
        couponCode: appliedCoupon?.code || null,
        couponDiscount: appliedDiscount,
        total: totalAmount,
        shippingAddress: {
          id: selectedSavedAddressId || undefined,
          fullName,
          email,
          phone,
          addressLine1: address,
          addressLine2: apartment,
          address: apartment ? `${address}, ${apartment}` : address,
          city,
          state,
          pincode,
        },
      };

      try {
        const existingOrders = JSON.parse(localStorage.getItem('alpha_enterprise_customer_orders') || '[]');
        const updatedOrders = [orderSummary, ...existingOrders];
        localStorage.setItem('alpha_enterprise_customer_orders', JSON.stringify(updatedOrders));
      } catch {}
      try {
        await catalogService.createOrder(orderSummary);
      } catch (orderApiErr) {
        console.error('Backend order save failed, order saved locally:', orderApiErr);
      }
      setPlacedOrder(orderSummary);
      clearCart();
    } catch {
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-lg border border-neutral-200 shadow-xl p-8 space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
              Order Confirmed
            </span>
            <h1 className="font-serif text-2xl font-bold text-neutral-900 mt-3">
              Thank You For Your Order!
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Order Reference ID: <strong className="text-neutral-900 font-mono">{placedOrder.id}</strong>
            </p>
          </div>

          <div className="bg-neutral-50 rounded-md p-4 text-left border border-neutral-200 space-y-2 text-xs">
            <div className="font-bold text-neutral-900 uppercase border-b border-neutral-200 pb-2 mb-2">
              Shipping Destination
            </div>
            <p className="font-semibold text-neutral-900">{placedOrder.shippingAddress.fullName}</p>
            <p className="text-neutral-600">{placedOrder.shippingAddress.address}</p>
            <p className="text-neutral-600">
              {placedOrder.shippingAddress.city}, {placedOrder.shippingAddress.state} - {placedOrder.shippingAddress.pincode}
            </p>
          </div>

          <div className="bg-neutral-50 rounded-md p-4 text-left border border-neutral-200 space-y-3">
            <div className="font-bold text-xs text-neutral-900 uppercase border-b border-neutral-200 pb-2">
              Order Items ({placedOrder.items.length})
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {placedOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <span className="truncate pr-4 text-neutral-800">
                    {item.product.name} (x{item.quantity})
                  </span>
                  <span className="font-semibold text-neutral-900">
                    {STORE_CONFIG.currencySymbol}
                    {(item.pricing.effectivePrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Comprehensive Price Breakdown */}
            {(() => {
              const totalMrp = placedOrder.items.reduce(
                (sum, item) => sum + (Number(item.pricing?.originalPrice || item.product?.price || 0) * item.quantity),
                0
              );
              const totalBaseSelling = placedOrder.items.reduce(
                (sum, item) => sum + (Number(item.pricing?.basePriceWithoutTax || item.pricing?.effectivePrice || item.product?.price || 0) * item.quantity),
                0
              );
              const totalGst = placedOrder.items.reduce(
                (sum, item) => sum + (Number(item.pricing?.taxAmount || 0) * item.quantity),
                0
              );
              const mrpSavings = Math.max(0, totalMrp - (totalBaseSelling + totalGst));

              return (
                <div className="border-t border-neutral-200 pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Total MRP</span>
                    <span>{STORE_CONFIG.currencySymbol}{totalMrp.toFixed(2)}</span>
                  </div>

                  {mrpSavings > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>MRP Discount</span>
                      <span>-{STORE_CONFIG.currencySymbol}{mrpSavings.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-neutral-600">
                    <span>Offer / Selling Price</span>
                    <span>{STORE_CONFIG.currencySymbol}{totalBaseSelling.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-neutral-600">
                    <span>Applicable GST / Taxes</span>
                    <span>+{STORE_CONFIG.currencySymbol}{totalGst.toFixed(2)}</span>
                  </div>

                  {placedOrder.couponDiscount && placedOrder.couponDiscount > 0 ? (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Coupon Discount ({placedOrder.couponCode || 'APPLIED'})</span>
                      <span>-{STORE_CONFIG.currencySymbol}{placedOrder.couponDiscount.toFixed(2)}</span>
                    </div>
                  ) : null}

                  <div className="flex justify-between text-neutral-600">
                    <span>Shipping Charges</span>
                    <span>{placedOrder.shipping === 0 ? 'FREE' : `${STORE_CONFIG.currencySymbol}${placedOrder.shipping.toFixed(2)}`}</span>
                  </div>

                  <div className="border-t border-neutral-300 pt-2 flex justify-between font-bold text-sm text-neutral-900">
                    <span>Total Amount Paid</span>
                    <span>
                      {STORE_CONFIG.currencySymbol}
                      {placedOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-neutral-950 text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xs hover:bg-black transition-colors"
            >
              <span>Continue Shopping</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 py-4 px-4 sm:px-8 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Bag</span>
          </Link>

          <Link href="/" className="font-serif text-lg font-bold tracking-widest text-neutral-900">
            {STORE_CONFIG.name}
          </Link>

          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </header>

      {/* Main Form Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-md border border-neutral-200 p-12 text-center max-w-md mx-auto space-y-4">
            <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto" />
            <h2 className="font-serif text-lg font-bold text-neutral-900 uppercase">Your bag is empty</h2>
            <p className="text-xs text-neutral-500">Please add items to your cart before proceeding to checkout.</p>
            <Link
              href="/shop"
              className="inline-block bg-neutral-950 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xs hover:bg-black"
            >
              Return to Shop
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Contact & Address Information */}
            <div className="lg:col-span-7 space-y-6">
              {/* Account Quick Banner */}
              {!user && (
                <div className="bg-neutral-900 text-white p-4 rounded-md flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-400" />
                    <span>Already have an account? Sign in for faster checkout.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="font-bold underline hover:text-amber-300"
                  >
                    Sign In
                  </button>
                </div>
              )}

              
              {/* Saved Address Book Selector (Amazon / Flipkart Style) */}
              {savedAddresses.length > 0 && (
                <div className="bg-white rounded-md border border-neutral-200 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <h2 className="font-serif text-sm font-bold uppercase tracking-wider text-neutral-900">
                      Select From Saved Addresses
                    </h2>
                    <span className="text-xs text-neutral-500 font-semibold">
                      {savedAddresses.length} address(es) saved
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {savedAddresses.map((sa) => (
                      <div
                        key={sa.id}
                        onClick={() => handleSelectSavedAddress(sa)}
                        className={`border rounded-md p-4 cursor-pointer transition-all flex items-start justify-between ${
                          selectedSavedAddressId === sa.id
                            ? 'border-neutral-950 bg-neutral-50 shadow-xs'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="savedAddr"
                            checked={selectedSavedAddressId === sa.id}
                            onChange={() => handleSelectSavedAddress(sa)}
                            className="mt-0.5"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-neutral-900">{sa.fullName}</span>
                              <span className="text-[9px] bg-neutral-200 text-neutral-800 font-bold px-1.5 py-0.5 rounded-xs uppercase">
                                {sa.addressType}
                              </span>
                              {sa.isDefault && (
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-xs uppercase">
                                  DEFAULT
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-600 mt-1">
                              {sa.addressLine1}{sa.addressLine2 ? `, ${sa.addressLine2}` : ''}, {sa.city}, {sa.state} - {sa.pincode}
                            </p>
                            <p className="text-[11px] text-neutral-500 font-mono mt-0.5">Phone: +91 {sa.phone}</p>
                          </div>
                        </div>

                        {selectedSavedAddressId === sa.id && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-xs flex items-center gap-1">
                            ✓ Selected
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Contact Information */}
              <div className="bg-white rounded-md border border-neutral-200 p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                  <span className="w-6 h-6 bg-neutral-900 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <h2 className="font-serif text-sm font-bold uppercase tracking-wider text-neutral-900">
                    Contact Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="customer@example.com"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xs text-xs px-3 py-2.5 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      Mobile Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xs text-xs px-3 py-2.5 outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Address */}
              <div className="bg-white rounded-md border border-neutral-200 p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                  <span className="w-6 h-6 bg-neutral-900 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <h2 className="font-serif text-sm font-bold uppercase tracking-wider text-neutral-900">
                    Shipping Destination Address
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      Full Recipient Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xs text-xs px-3 py-2.5 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      Street Address & Building Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Fashion Street, Cyber Hub"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xs text-xs px-3 py-2.5 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      Apartment, Suite, Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      placeholder="Flat 4B, Near Metro Gate #2"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xs text-xs px-3 py-2.5 outline-none focus:border-black"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Mumbai"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xs text-xs px-3 py-2.5 outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Maharashtra"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xs text-xs px-3 py-2.5 outline-none focus:border-black"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="400001"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xs text-xs px-3 py-2.5 outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Delivery Options */}
              <div className="bg-white rounded-md border border-neutral-200 p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                  <span className="w-6 h-6 bg-neutral-900 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <h2 className="font-serif text-sm font-bold uppercase tracking-wider text-neutral-900">
                    Delivery Method
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`border rounded-md p-4 cursor-pointer flex items-start justify-between transition-all ${
                      shippingMethod === 'standard'
                        ? 'border-neutral-950 bg-neutral-50/80 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === 'standard'}
                        onChange={() => setShippingMethod('standard')}
                        className="mt-0.5 text-black focus:ring-black"
                      />
                      <div>
                        <span className="block text-xs font-bold text-neutral-900">Standard Express Shipping</span>
                        <span className="block text-[11px] text-neutral-500 mt-0.5">Delivery in 3 - 5 business days</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-neutral-900">
                      {subtotal > 2000 ? 'FREE' : `${STORE_CONFIG.currencySymbol}99` }
                    </span>
                  </label>

                  <label
                    className={`border rounded-md p-4 cursor-pointer flex items-start justify-between transition-all ${
                      shippingMethod === 'express'
                        ? 'border-neutral-950 bg-neutral-50/80 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === 'express'}
                        onChange={() => setShippingMethod('express')}
                        className="mt-0.5 text-black focus:ring-black"
                      />
                      <div>
                        <span className="block text-xs font-bold text-neutral-900">Priority Air Shipping</span>
                        <span className="block text-[11px] text-neutral-500 mt-0.5">Guaranteed 24-48 hours delivery</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-neutral-900">
                      {STORE_CONFIG.currencySymbol}199
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-neutral-950 text-white text-sm font-bold uppercase tracking-widest py-4 px-6 rounded-xs hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>{isSubmitting ? 'Processing Order...' : 'Place Order & Proceed'}</span>
              </button>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-md border border-neutral-200 p-6 space-y-6 sticky top-24 shadow-sm">
                <h2 className="font-serif text-base font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3">
                  Order Summary ({cartItems.length} items)
                </h2>

                {/* Items List */}
                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {cartItems.map((item) => {
                    const img = getProductImageUrl(item.product, item.variant);
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative w-14 h-18 bg-neutral-100 rounded-xs overflow-hidden flex-shrink-0 border border-neutral-200">
                          {img ? (
                            <Image src={img} alt={item.product.name} fill className="object-cover" />
                          ) : (
                            <span className="text-[8px] text-neutral-400 font-bold uppercase flex items-center justify-center h-full">
                              Photo
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-neutral-900 truncate">{item.product.name}</h4>
                          <p className="text-[10px] text-neutral-500 mt-0.5">Qty: {item.quantity}</p>
                          {Object.entries(item.selectedOptions).map(([k, v]) => (
                            <span key={k} className="text-[9px] bg-neutral-100 text-neutral-600 px-1 py-0.5 rounded-xs mr-1">
                              {k}: {v}
                            </span>
                          ))}
                        </div>

                        <div className="text-xs font-bold text-neutral-900">
                          {STORE_CONFIG.currencySymbol}
                          {(item.pricing.effectivePrice * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon Code Input & Available Offers */}
                <div className="border-t border-neutral-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-neutral-900" />
                      <span>Coupons & Offers</span>
                    </label>
                    {appliedCoupon && (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[10px] text-red-600 hover:text-red-800 font-bold uppercase underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {appliedCoupon ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xs p-3 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <Tag className="w-3.5 h-3.5 text-emerald-700" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-emerald-900 font-mono tracking-wider">
                            {appliedCoupon.code}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                            {appliedCoupon.discountType === 'PERCENTAGE'
                              ? `${appliedCoupon.discountValue}% OFF (-₹${appliedCoupon.discountAmount.toFixed(2)})`
                              : `₹${appliedCoupon.discountAmount.toFixed(2)} OFF`}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded-xs uppercase tracking-wider">
                        Applied
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xs text-xs px-3 py-2.5 outline-none uppercase font-mono focus:border-black"
                        />
                        <button
                          type="button"
                          onClick={(e) => handleApplyCoupon(e)}
                          disabled={couponLoading || !couponCode.trim()}
                          className="bg-neutral-900 text-white text-xs font-bold uppercase px-4 py-2.5 rounded-xs hover:bg-black disabled:opacity-50 transition-colors"
                        >
                          {couponLoading ? 'Checking...' : 'Apply'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Available Eligible Coupons Drawer */}
                  {availableCoupons.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                          Available Coupons ({availableCoupons.length})
                        </span>
                        {availableCoupons.length > 2 && (
                          <button
                            type="button"
                            onClick={() => setShowAllCoupons(!showAllCoupons)}
                            className="text-[10px] text-neutral-700 font-bold underline"
                          >
                            {showAllCoupons ? 'Show Less' : 'View All'}
                          </button>
                        )}
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {(showAllCoupons ? availableCoupons : availableCoupons.slice(0, 2)).map((cp: CouponItem) => {
                          const isCurrentApplied = appliedCoupon?.code === cp.code;
                          const discountLabel =
                            cp.discountType === 'PERCENTAGE'
                              ? `${cp.discountValue}% OFF`
                              : `₹${cp.discountValue} OFF`;
                          const minOrder = cp.rules?.minOrderValue
                            ? `Min Order: ₹${cp.rules.minOrderValue}`
                            : null;

                          return (
                            <div
                              key={cp.id || cp.code}
                              className={`border rounded-xs p-2.5 flex items-center justify-between text-xs transition-all ${
                                isCurrentApplied
                                  ? 'border-emerald-500 bg-emerald-50/50'
                                  : 'border-neutral-200 bg-neutral-50/60 hover:border-neutral-300'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-[11px] text-neutral-900 bg-white border border-neutral-300 px-1.5 py-0.5 rounded-xs">
                                    {cp.code}
                                  </span>
                                  <span className="text-[10px] font-bold text-emerald-700">
                                    {discountLabel}
                                  </span>
                                </div>
                                <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                                  {cp.name || cp.description || 'Special Discount'}
                                </p>
                                {minOrder && (
                                  <span className="text-[9px] text-neutral-400 font-semibold block">
                                    {minOrder}
                                  </span>
                                )}
                              </div>

                              <div>
                                {isCurrentApplied ? (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-xs">
                                    Applied
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleApplyCoupon(undefined, cp.code)}
                                    disabled={couponLoading}
                                    className="text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-white px-2.5 py-1 rounded-xs hover:bg-black transition-colors disabled:opacity-50"
                                  >
                                    Apply
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {couponSuccess && !appliedCoupon && (
                    <p className="text-[11px] text-emerald-600 font-medium">{couponSuccess}</p>
                  )}
                  {couponError && (
                    <p className="text-[11px] text-red-500 font-medium">{couponError}</p>
                  )}
                </div>

                {/* Totals Breakdown */}
                <div className="border-t border-neutral-100 pt-4 space-y-2.5 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-neutral-900">
                      {STORE_CONFIG.currencySymbol}{subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span className="font-semibold text-neutral-900">
                      {shippingCost === 0 ? (
                        <span className="text-emerald-600 font-bold">FREE</span>
                      ) : (
                        `${STORE_CONFIG.currencySymbol}${shippingCost}`
                      )}
                    </span>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span className="flex items-center gap-1">
                        <span>Coupon ({appliedCoupon?.code || 'DISCOUNT'})</span>
                        {appliedCoupon?.discountType === 'PERCENTAGE' && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded-xs">
                            {appliedCoupon.discountValue}%
                          </span>
                        )}
                      </span>
                      <span>-{STORE_CONFIG.currencySymbol}{appliedDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-neutral-200 pt-3 flex justify-between text-sm font-bold text-neutral-900">
                    <span>Total Amount</span>
                    <span className="text-base text-neutral-950">
                      {STORE_CONFIG.currencySymbol}{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

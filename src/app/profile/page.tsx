'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  User,
  MapPin,
  X,
  Package,
  Plus,
  Edit2,
  Trash2,
  Home,
  Briefcase,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { STORE_CONFIG } from '@/config/store';
import { catalogService } from '@/services/catalogService';
import { SavedAddress, CustomerOrder } from '@/types/api';
import { getProductImageUrl } from '@/utils/image';

const ADDRESS_STORAGE_KEY = 'alpha_enterprise_saved_addresses';
const ORDERS_STORAGE_KEY = 'alpha_enterprise_customer_orders';

function ProfileContent() {
  const { user, logout, setIsAuthModalOpen } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>(
    initialTab as 'profile' | 'addresses' | 'orders'
  );

  // Address Book State
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  // Address Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [addressType, setAddressType] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [isDefault, setIsDefault] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<CustomerOrder[]>([]);

    // Load Saved Addresses and Orders from LocalStorage / Backend
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const storedAddrs = localStorage.getItem(ADDRESS_STORAGE_KEY);
        if (storedAddrs) {
          setAddresses(JSON.parse(storedAddrs));
        } else {
          const initialAddr: SavedAddress[] = [
            {
              id: 'addr-1',
              fullName: user?.name || 'Customer Name',
              phone: '9876543210',
              pincode: '400001',
              state: 'Maharashtra',
              city: 'Mumbai',
              addressLine1: '123 Fashion Avenue, Bandra West',
              addressLine2: 'Flat 4B, Lotus Apartments',
              landmark: 'Opposite Hill Road Park',
              addressType: 'HOME',
              isDefault: true,
            },
          ];
          setAddresses(initialAddr);
          localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(initialAddr));
        }

        try {
          const liveOrders = await catalogService.getOrders();
          if (liveOrders && liveOrders.length > 0) {
            setOrders(
              liveOrders.map((o: CustomerOrder) => ({
                id: o.id,
                createdAt: o.createdAt,
                items: o.items || [],
                subtotal: Number(o.subtotal || 0),
                shipping: Number(o.shipping || 0),
                discount: Number(o.couponDiscount || o.discount || 0),
                couponCode: o.couponCode || null,
                couponDiscount: Number(o.couponDiscount || o.discount || 0),
                total: Number(o.total || 0),
                shippingAddress: o.shippingAddress || {},
                status: o.status || 'PROCESSING',
              }))
            );
          } else {
            const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
            if (storedOrders) {
              setOrders(JSON.parse(storedOrders));
            }
          }
        } catch {
          const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
          if (storedOrders) {
            setOrders(JSON.parse(storedOrders));
          }
        }
      } catch (e) {
        console.error('Failed to load profile data:', e);
      }
    };

    loadProfileData();
  }, [user]);

  // Save Addresses to LocalStorage
  const saveAddresses = (newAddrs: SavedAddress[]) => {
    setAddresses(newAddrs);
    localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(newAddrs));
  };

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setFullName(user?.name || '');
    setPhone('');
    setPincode('');
    setState('');
    setCity('');
    setAddressLine1('');
    setAddressLine2('');
    setLandmark('');
    setAddressType('HOME');
    setIsDefault(addresses.length === 0);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: SavedAddress) => {
    setEditingAddress(addr);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setPincode(addr.pincode);
    setState(addr.state);
    setCity(addr.city);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || '');
    setLandmark(addr.landmark || '');
    setAddressType(addr.addressType);
    setIsDefault(addr.isDefault);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();

    let updatedList = [...addresses];
    if (isDefault) {
      updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
    }

    if (editingAddress) {
      updatedList = updatedList.map((a) =>
        a.id === editingAddress.id
          ? {
              ...a,
              fullName,
              phone,
              pincode,
              state,
              city,
              addressLine1,
              addressLine2,
              landmark,
              addressType,
              isDefault,
            }
          : a
      );
    } else {
      const newAddr: SavedAddress = {
        id: 'addr-' + Date.now(),
        fullName,
        phone,
        pincode,
        state,
        city,
        addressLine1,
        addressLine2,
        landmark,
        addressType,
        isDefault,
      };
      updatedList.unshift(newAddr);
    }

    saveAddresses(updatedList);
    setIsAddressModalOpen(false);
  };

  const handleDeleteAddress = (id: string) => {
    if (!confirm('Are you sure you want to delete this saved address?')) return;
    const updated = addresses.filter((a) => a.id !== id);
    saveAddresses(updated);
  };

  const handleSetDefaultAddress = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveAddresses(updated);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      {/* Page Header */}
      <div className="bg-white border-b border-neutral-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-neutral-900 text-white rounded-full flex items-center justify-center font-serif text-2xl font-bold uppercase shadow-md border-2 border-amber-400">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-neutral-900">
                {user?.name || 'Customer Profile'}
              </h1>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">{user?.email || 'Logged in user'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!user ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-neutral-950 text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-xs hover:bg-black"
              >
                Sign In To Account
              </button>
            ) : (
              <button
                onClick={logout}
                className="border border-neutral-300 text-neutral-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xs transition-colors"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Tabs (Amazon / Flipkart Style) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-md border border-neutral-200 p-2 space-y-1 shadow-xs sticky top-24">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xs text-xs font-bold uppercase tracking-wider text-left transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Account Info</span>
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xs text-xs font-bold uppercase tracking-wider text-left transition-colors ${
                  activeTab === 'addresses'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Saved Addresses ({addresses.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xs text-xs font-bold uppercase tracking-wider text-left transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>My Orders ({orders.length})</span>
              </button>
            </div>
          </div>

          {/* Main Display Panel */}
          <div className="lg:col-span-9">
            {/* Tab 1: Account Information */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-md border border-neutral-200 p-6 space-y-6 shadow-xs">
                <div className="border-b border-neutral-100 pb-3">
                  <h2 className="font-serif text-lg font-bold uppercase tracking-wider text-neutral-900">
                    Personal Account Information
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Manage your identity, email details, and security credentials.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200 space-y-1">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                      Account Full Name
                    </span>
                    <span className="font-bold text-neutral-900 text-sm">{user?.name || 'Customer'}</span>
                  </div>

                  <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200 space-y-1">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                      Email Address
                    </span>
                    <span className="font-bold text-neutral-900 text-sm">{user?.email || 'customer@example.com'}</span>
                  </div>

                  <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200 space-y-1">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                      Member Status
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[11px]">
                      <Shield className="w-3 h-3" />
                      Verified VIP Customer
                    </span>
                  </div>

                  <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200 space-y-1">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                      Primary Saved Address
                    </span>
                    <span className="font-semibold text-neutral-800">
                      {addresses.find((a) => a.isDefault)?.city || 'No default address set'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Saved Address Book (Flipkart / Amazon Style) */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-md border border-neutral-200 p-6 space-y-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                  <div>
                    <h2 className="font-serif text-lg font-bold uppercase tracking-wider text-neutral-900">
                      Saved Address Book
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Save delivery destinations for seamless 1-click checkout.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenAddAddress}
                    className="bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xs hover:bg-black flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add New Address</span>
                  </button>
                </div>

                {/* Addresses Grid */}
                {addresses.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-neutral-200 rounded-md p-6">
                    <MapPin className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-neutral-800 uppercase">No saved addresses</h3>
                    <p className="text-xs text-neutral-500 mt-1">Add a delivery address to speed up your future orders.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`border rounded-md p-5 flex flex-col justify-between transition-all relative ${
                          addr.isDefault
                            ? 'border-neutral-900 bg-neutral-50/50 shadow-xs'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded-xs">
                              {addr.addressType === 'HOME' ? <Home className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                              {addr.addressType}
                            </span>

                            {addr.isDefault && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-xs">
                                DEFAULT
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-sm text-neutral-900">{addr.fullName}</h3>
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            {addr.addressLine1}
                            {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                          </p>
                          {addr.landmark && (
                            <p className="text-[11px] text-neutral-500">Landmark: {addr.landmark}</p>
                          )}
                          <p className="text-xs font-semibold text-neutral-900">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-xs text-neutral-600 font-mono">Mobile: +91 {addr.phone}</p>
                        </div>

                        <div className="border-t border-neutral-200 pt-3 mt-4 flex items-center justify-between text-xs">
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-xs font-semibold text-neutral-700 hover:text-black underline"
                            >
                              Set as Default
                            </button>
                          )}

                          <div className="flex items-center gap-3 ml-auto">
                            <button
                              onClick={() => handleOpenEditAddress(addr)}
                              className="text-neutral-600 hover:text-black flex items-center gap-1 font-semibold"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Order History */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-md border border-neutral-200 p-6 space-y-6 shadow-xs">
                <div className="border-b border-neutral-100 pb-3">
                  <h2 className="font-serif text-lg font-bold uppercase tracking-wider text-neutral-900">
                    My Order History
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Track your recent luxury purchases and delivery statuses.
                  </p>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-neutral-200 rounded-md p-6 space-y-3">
                    <Package className="w-10 h-10 text-neutral-300 mx-auto" />
                    <h3 className="text-sm font-bold text-neutral-800 uppercase">No orders placed yet</h3>
                    <p className="text-xs text-neutral-500">Explore our catalog and place your first order.</p>
                    <Link
                      href="/shop"
                      className="inline-block bg-neutral-950 text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-xs hover:bg-black mt-2"
                    >
                      Browse Catalog
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div key={ord.id} className="border border-neutral-200 rounded-md p-5 space-y-4">
                        <div className="flex flex-wrap items-center justify-between border-b border-neutral-100 pb-3 gap-2 text-xs">
                          <div>
                            <span className="text-neutral-500">Order ID: </span>
                            <span className="font-bold text-neutral-900 font-mono">{ord.id}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500">Placed On: </span>
                            <span className="font-semibold text-neutral-800">
                              {ord.createdAt && !isNaN(new Date(ord.createdAt).getTime())
    ? new Date(ord.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                            {ord.status}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {ord.items.map((item, itemIdx) => {
                            const img = getProductImageUrl(item.product, item.variant) || (item.product?.images?.[0]?.url) || (item.variant?.images?.[0]?.url);
                            return (
                              <div key={item.id || `ord-item-${itemIdx}`} className="flex items-center gap-3 text-xs">
                                <div className="relative w-12 h-16 bg-neutral-100 rounded-xs overflow-hidden flex-shrink-0 border border-neutral-200">
                                  {img ? (
                                    <Image src={img} alt={item.product.name} fill className="object-cover" />
                                  ) : (
                                    <span className="text-[8px] text-neutral-400 font-bold uppercase flex items-center justify-center h-full">
                                      Photo
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-neutral-900 truncate">{item.product.name}</h4>
                                  {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                    <p className="text-[11px] text-neutral-400 mt-0.5">
                                      {Object.entries(item.selectedOptions).map(([k, v]: [string, unknown]) => `${k}: ${String(v)}`).join(' · ')}
                                    </p>
                                  )}
                                  <p className="text-[11px] text-neutral-500">Quantity: {item.quantity}</p>
                                </div>
                                <span className="font-bold text-neutral-900">
                                  {STORE_CONFIG.currencySymbol}
                                  {(item.pricing.effectivePrice * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Itemized Order Price Breakdown */}
                        {(() => {
                          const totalMrp = (ord.items || []).reduce(
                            (sum, item) => sum + (Number(item.pricing?.originalPrice || item.product?.price || 0) * item.quantity),
                            0
                          );
                          const totalBaseSelling = (ord.items || []).reduce(
                            (sum, item) => sum + (Number(item.pricing?.basePriceWithoutTax || item.pricing?.effectivePrice || item.product?.price || 0) * item.quantity),
                            0
                          );
                          const totalGst = (ord.items || []).reduce(
                            (sum, item) => sum + (Number(item.pricing?.taxAmount || 0) * item.quantity),
                            0
                          );
                          const mrpSavings = Math.max(0, totalMrp - (totalBaseSelling + totalGst));

                          return (
                            <div className="bg-neutral-50 p-3 rounded-xs border border-neutral-200 space-y-1 text-xs text-neutral-600">
                              <div className="flex justify-between">
                                <span>Total MRP:</span>
                                <span>{STORE_CONFIG.currencySymbol}{totalMrp.toFixed(2)}</span>
                              </div>
                              {mrpSavings > 0 && (
                                <div className="flex justify-between text-emerald-700 font-medium">
                                  <span>MRP Discount:</span>
                                  <span>-{STORE_CONFIG.currencySymbol}{mrpSavings.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span>Offer / Selling Price:</span>
                                <span>{STORE_CONFIG.currencySymbol}{totalBaseSelling.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>GST / Taxes:</span>
                                <span>+{STORE_CONFIG.currencySymbol}{totalGst.toFixed(2)}</span>
                              </div>
                              {((ord.couponDiscount && ord.couponDiscount > 0) || (ord.discount && ord.discount > 0)) && (
                                <div className="flex justify-between text-emerald-700 font-medium">
                                  <span>Coupon ({ord.couponCode || 'APPLIED'}):</span>
                                  <span>-{STORE_CONFIG.currencySymbol}{(ord.couponDiscount || ord.discount || 0).toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span>Shipping:</span>
                                <span>{ord.shipping === 0 || !ord.shipping ? 'FREE' : `${STORE_CONFIG.currencySymbol}${ord.shipping.toFixed(2)}`}</span>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="border-t border-neutral-100 pt-3 flex flex-wrap justify-between items-center text-xs gap-2">
                          <span className="text-neutral-600">
                            Delivering to: <strong className="text-neutral-900">{ord.shippingAddress?.fullName || 'Customer'}</strong> ({ord.shippingAddress?.city})
                          </span>
                          <div className="text-right">
                            <div className="font-bold text-sm text-neutral-950">
                              Total Paid: {STORE_CONFIG.currencySymbol}{ord.total.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Address Modal (Amazon / Flipkart Style) */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs" onClick={() => setIsAddressModalOpen(false)} />

          <div className="relative bg-white rounded-md max-w-lg w-full p-6 shadow-2xl space-y-4 border border-neutral-200 z-10">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-serif text-base font-bold uppercase tracking-wider text-neutral-900">
                {editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}
              </h3>
              <button onClick={() => setIsAddressModalOpen(false)} className="p-1 text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xs px-3 py-2 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                    10-digit Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xs px-3 py-2 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="400001"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xs px-3 py-2 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xs px-3 py-2 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Maharashtra"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xs px-3 py-2 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                  Flat, House No., Building, Company *
                </label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Flat 4B, Lotus Apartments"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xs px-3 py-2 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                  Area, Colony, Street, Sector
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="123 Fashion Street, Bandra West"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xs px-3 py-2 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near Metro Gate #2"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xs px-3 py-2 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                  Address Type
                </label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="addrType"
                      checked={addressType === 'HOME'}
                      onChange={() => setAddressType('HOME')}
                    />
                    <span>Home (All day delivery)</span>
                  </label>

                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="addrType"
                      checked={addressType === 'WORK'}
                      onChange={() => setAddressType('WORK')}
                    />
                    <span>Work (Delivery 9 AM - 6 PM)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="makeDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
                <label htmlFor="makeDefault" className="text-[11px] text-neutral-700 font-semibold">
                  Make this my default delivery address
                </label>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="bg-neutral-100 text-neutral-700 px-4 py-2 rounded-xs text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-neutral-950 text-white px-6 py-2 rounded-xs text-xs font-bold uppercase hover:bg-black"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


export default function CustomerProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 flex items-center justify-center text-xs font-bold uppercase tracking-wider text-neutral-400">Loading Profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Layout from '../components/layout/NewLayout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface AddressData {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, logout } = useAuth();
  const { items, itemCount, subtotal, clearCart } = useCart();

  const [shippingAddress, setShippingAddress] = useState<Partial<AddressData>>({});
  const [billingAddress, setBillingAddress] = useState<Partial<AddressData>>({});
  const [useShippingForBilling, setUseShippingForBilling] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<string>('credit-card');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{
    shipping: Partial<Record<keyof AddressData, string>>;
    billing: Partial<Record<keyof AddressData, string>>;
    payment: string | null;
  }>({
    shipping: {},
    billing: {},
    payment: null,
  });
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !token) {
        router.push('/login?redirect=/checkout');
      } else if (itemCount === 0) {
        router.push('/products');
      }
    }
  }, [user, token, authLoading, itemCount, router]);

  const validateForm = (): boolean => {
    const newFormErrors = {
      shipping: {} as Partial<Record<keyof AddressData, string>>,
      billing: {} as Partial<Record<keyof AddressData, string>>,
      payment: null as string | null,
    };

    let isValid = true;

    // Validate shipping address
    if (!shippingAddress.street?.trim()) {
      newFormErrors.shipping.street = 'Street address is required';
      isValid = false;
    }

    if (!shippingAddress.city?.trim()) {
      newFormErrors.shipping.city = 'City is required';
      isValid = false;
    }

    if (!shippingAddress.province?.trim()) {
      newFormErrors.shipping.province = 'Province is required';
      isValid = false;
    }

    if (!shippingAddress.postalCode?.trim()) {
      newFormErrors.shipping.postalCode = 'Postal code is required';
      isValid = false;
    } else if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(shippingAddress.postalCode.trim())) {
      newFormErrors.shipping.postalCode =
        'Please enter a valid Canadian postal code (e.g., A1A 1A1)';
      isValid = false;
    }

    // Validate billing address if different from shipping
    if (!useShippingForBilling) {
      if (!billingAddress.street?.trim()) {
        newFormErrors.billing.street = 'Street address is required';
        isValid = false;
      }

      if (!billingAddress.city?.trim()) {
        newFormErrors.billing.city = 'City is required';
        isValid = false;
      }

      if (!billingAddress.province?.trim()) {
        newFormErrors.billing.province = 'Province is required';
        isValid = false;
      }

      if (!billingAddress.postalCode?.trim()) {
        newFormErrors.billing.postalCode = 'Postal code is required';
        isValid = false;
      } else if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(billingAddress.postalCode.trim())) {
        newFormErrors.billing.postalCode =
          'Please enter a valid Canadian postal code (e.g., A1A 1A1)';
        isValid = false;
      }
    }

    // Validate payment method
    if (!paymentMethod) {
      newFormErrors.payment = 'Please select a payment method';
      isValid = false;
    }

    setFormErrors(newFormErrors);
    return isValid;
  };

  const handleApplyDiscount = async () => {
    if (!discountCode || isApplyingDiscount || appliedDiscount) return;

    setDiscountError(null);
    setIsApplyingDiscount(true);

    try {
      const response = await fetch(
        `/api/discount/validate?code=${encodeURIComponent(discountCode)}&subtotal=${subtotal}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to validate discount code');
      }

      const data = await response.json();

      if (!data.valid) {
        setDiscountError(data.message || 'Invalid discount code');
        return;
      }

      setAppliedDiscount({
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        discountAmount: data.discountAmount,
        message: data.message,
      });
    } catch (error: any) {
      setDiscountError(error.message || 'Failed to apply discount code');
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError(null);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token || itemCount === 0) return;

    // Reset errors
    setError(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const finalBillingAddress = useShippingForBilling ? shippingAddress : billingAddress;

    const orderData = {
      items: items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      shippingAddress: { ...shippingAddress, country: 'Canada' },
      billingAddress: useShippingForBilling
        ? { ...shippingAddress, country: 'Canada' }
        : { ...finalBillingAddress, country: 'Canada' },
      paymentMethod: paymentMethod,
      discountCode: appliedDiscount?.code || null,
    };
    console.log('Placing order with data:', orderData);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          router.push('/login');
          return;
        }
        const errData = await response.json();
        throw new Error(errData.message || `Failed to place order (${response.status})`);
      }
      const result = await response.json();
      const orderId = result.orderId;
      console.log('Order placed successfully:', result);

      setCreatedOrderId(orderId);
      clearCart();
      setOrderSuccess(true);

      // Show success message for 2 seconds before redirecting
      setTimeout(() => {
        router.push(`/checkout/success?orderId=${orderId}&method=${paymentMethod}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to place order.');
      console.error(err);
      setIsLoading(false);
    }
  };

  if (authLoading || !user || itemCount === 0) {
    return (
      <Layout>
        <div className="p-8 text-center">Loading checkout...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-100 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-800">Checkout</h1>

          {/* Checkout Progress */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="h-0.5 w-full bg-gray-200"></div>
              </div>
              <ol className="relative flex justify-between">
                <li className="flex items-center">
                  <span className="bg-primary-600 flex h-8 w-8 items-center justify-center rounded-full text-white">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  <span className="ml-2 text-sm font-medium text-gray-900">Cart</span>
                </li>
                <li className="flex items-center">
                  <span className="bg-primary-600 flex h-8 w-8 items-center justify-center rounded-full text-white">
                    <span>2</span>
                  </span>
                  <span className="ml-2 text-sm font-medium text-gray-900">Shipping & Payment</span>
                </li>
                <li className="flex items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-gray-500">
                    <span>3</span>
                  </span>
                  <span className="ml-2 text-sm font-medium text-gray-500">Confirmation</span>
                </li>
              </ol>
            </div>
          </div>
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              {/* Shipping Address */}
              <div className="rounded-lg bg-white p-6 shadow-md">
                {/* ... form inputs ... */}
                <h2 className="mb-4 text-xl font-semibold text-gray-700">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm">Street:</label>
                    <input
                      type="text"
                      value={shippingAddress.street || ''}
                      className={`w-full rounded border p-2 ${formErrors.shipping.street ? 'border-red-500' : ''}`}
                      onChange={e => setShippingAddress(s => ({ ...s, street: e.target.value }))}
                    />
                    {formErrors.shipping.street && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.shipping.street}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm">City:</label>
                    <input
                      type="text"
                      value={shippingAddress.city || ''}
                      className={`w-full rounded border p-2 ${formErrors.shipping.city ? 'border-red-500' : ''}`}
                      onChange={e => setShippingAddress(s => ({ ...s, city: e.target.value }))}
                    />
                    {formErrors.shipping.city && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.shipping.city}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm">Province:</label>
                      <select
                        value={shippingAddress.province || ''}
                        className={`w-full rounded border p-2 ${formErrors.shipping.province ? 'border-red-500' : ''}`}
                        onChange={e =>
                          setShippingAddress(s => ({ ...s, province: e.target.value }))
                        }
                      >
                        <option value="">Select Province</option>
                        <option value="AB">Alberta</option>
                        <option value="BC">British Columbia</option>
                        <option value="MB">Manitoba</option>
                        <option value="NB">New Brunswick</option>
                        <option value="NL">Newfoundland and Labrador</option>
                        <option value="NS">Nova Scotia</option>
                        <option value="ON">Ontario</option>
                        <option value="PE">Prince Edward Island</option>
                        <option value="QC">Quebec</option>
                        <option value="SK">Saskatchewan</option>
                        <option value="NT">Northwest Territories</option>
                        <option value="NU">Nunavut</option>
                        <option value="YT">Yukon</option>
                      </select>
                      {formErrors.shipping.province && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.shipping.province}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm">Postal Code:</label>
                      <input
                        type="text"
                        value={shippingAddress.postalCode || ''}
                        placeholder="A1A 1A1"
                        className={`w-full rounded border p-2 ${formErrors.shipping.postalCode ? 'border-red-500' : ''}`}
                        onChange={e =>
                          setShippingAddress(s => ({ ...s, postalCode: e.target.value }))
                        }
                      />
                      {formErrors.shipping.postalCode && (
                        <p className="mt-1 text-xs text-red-500">
                          {formErrors.shipping.postalCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <input
                    type="checkbox"
                    id="billingSameAsShipping"
                    checked={useShippingForBilling}
                    onChange={e => setUseShippingForBilling(e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <label htmlFor="billingSameAsShipping" className="ml-2 text-sm text-gray-600">
                    Billing address is the same as shipping
                  </label>
                </div>
              </div>
              {!useShippingForBilling && (
                <div className="rounded-lg bg-white p-6 shadow-md">
                  <h2 className="mb-4 text-xl font-semibold text-gray-700">Billing Address</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm">Street:</label>
                      <input
                        type="text"
                        value={billingAddress.street || ''}
                        className={`w-full rounded border p-2 ${formErrors.billing.street ? 'border-red-500' : ''}`}
                        onChange={e => setBillingAddress(s => ({ ...s, street: e.target.value }))}
                      />
                      {formErrors.billing.street && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.billing.street}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm">City:</label>
                      <input
                        type="text"
                        value={billingAddress.city || ''}
                        className={`w-full rounded border p-2 ${formErrors.billing.city ? 'border-red-500' : ''}`}
                        onChange={e => setBillingAddress(s => ({ ...s, city: e.target.value }))}
                      />
                      {formErrors.billing.city && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.billing.city}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm">Province:</label>
                        <select
                          value={billingAddress.province || ''}
                          className={`w-full rounded border p-2 ${formErrors.billing.province ? 'border-red-500' : ''}`}
                          onChange={e =>
                            setBillingAddress(s => ({ ...s, province: e.target.value }))
                          }
                        >
                          <option value="">Select Province</option>
                          <option value="AB">Alberta</option>
                          <option value="BC">British Columbia</option>
                          <option value="MB">Manitoba</option>
                          <option value="NB">New Brunswick</option>
                          <option value="NL">Newfoundland and Labrador</option>
                          <option value="NS">Nova Scotia</option>
                          <option value="ON">Ontario</option>
                          <option value="PE">Prince Edward Island</option>
                          <option value="QC">Quebec</option>
                          <option value="SK">Saskatchewan</option>
                          <option value="NT">Northwest Territories</option>
                          <option value="NU">Nunavut</option>
                          <option value="YT">Yukon</option>
                        </select>
                        {formErrors.billing.province && (
                          <p className="mt-1 text-xs text-red-500">{formErrors.billing.province}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm">Postal Code:</label>
                        <input
                          type="text"
                          value={billingAddress.postalCode || ''}
                          placeholder="A1A 1A1"
                          className={`w-full rounded border p-2 ${formErrors.billing.postalCode ? 'border-red-500' : ''}`}
                          onChange={e =>
                            setBillingAddress(s => ({ ...s, postalCode: e.target.value }))
                          }
                        />
                        {formErrors.billing.postalCode && (
                          <p className="mt-1 text-xs text-red-500">
                            {formErrors.billing.postalCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Payment Method */}
              <div className="rounded-lg bg-white p-6 shadow-md">
                {/* ... payment options ... */}
                <h2 className="mb-4 text-xl font-semibold text-gray-700">Payment Method</h2>
                {formErrors.payment && (
                  <div className="mb-4 rounded-md bg-red-50 p-3">
                    <p className="text-sm text-red-600">{formErrors.payment}</p>
                  </div>
                )}
                <div className="space-y-4">
                  <div
                    className={`rounded-lg border p-4 ${paymentMethod === 'etransfer' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="etransfer"
                        name="paymentMethod"
                        value="etransfer"
                        checked={paymentMethod === 'etransfer'}
                        onChange={e => setPaymentMethod(e.target.value)}
                        className="text-primary-600 focus:ring-primary-500 h-4 w-4"
                      />
                      <label
                        htmlFor="etransfer"
                        className="ml-3 flex flex-grow cursor-pointer items-center"
                      >
                        <span className="text-sm font-medium text-gray-900">E-Transfer</span>
                        <span className="ml-auto">
                          <svg
                            className="h-6 w-6 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                          </svg>
                        </span>
                      </label>
                    </div>
                    {paymentMethod === 'etransfer' && (
                      <div className="mt-3 pl-7">
                        <p className="text-sm text-gray-700">
                          After placing your order, you'll receive an email with instructions for
                          sending an Interac e-Transfer. Your order will be processed once payment
                          is confirmed.
                        </p>
                      </div>
                    )}
                  </div>

                  <div
                    className={`rounded-lg border p-4 ${paymentMethod === 'btc' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="btc"
                        name="paymentMethod"
                        value="btc"
                        checked={paymentMethod === 'btc'}
                        onChange={e => setPaymentMethod(e.target.value)}
                        className="text-primary-600 focus:ring-primary-500 h-4 w-4"
                      />
                      <label
                        htmlFor="btc"
                        className="ml-3 flex flex-grow cursor-pointer items-center"
                      >
                        <span className="text-sm font-medium text-gray-900">Bitcoin</span>
                        <span className="ml-auto">
                          <svg
                            className="h-6 w-6 text-orange-500"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z" />
                          </svg>
                        </span>
                      </label>
                    </div>
                    {paymentMethod === 'btc' && (
                      <div className="mt-3 pl-7">
                        <p className="text-sm text-gray-700">
                          After placing your order, you'll receive an email with a Bitcoin address
                          and the exact amount to send. Your order will be processed once the
                          transaction is confirmed on the blockchain.
                        </p>
                      </div>
                    )}
                  </div>

                  <div
                    className={`rounded-lg border p-4 ${paymentMethod === 'credit-card' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="credit-card"
                        name="paymentMethod"
                        value="credit-card"
                        checked={paymentMethod === 'credit-card'}
                        onChange={e => setPaymentMethod(e.target.value)}
                        className="text-primary-600 focus:ring-primary-500 h-4 w-4"
                      />
                      <label
                        htmlFor="credit-card"
                        className="ml-3 flex flex-grow cursor-pointer items-center"
                      >
                        <span className="text-sm font-medium text-gray-900">Credit Card</span>
                        <span className="ml-auto flex space-x-1">
                          <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none">
                            <rect width="40" height="24" rx="4" fill="#E6E6E6" />
                            <path
                              d="M11.5 17h17M11.5 13h17M11.5 9h17"
                              stroke="#666"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </span>
                      </label>
                    </div>
                    {paymentMethod === 'credit-card' && (
                      <div className="mt-3 pl-7">
                        <p className="text-sm text-gray-700">
                          After placing your order, you'll be redirected to our secure payment page
                          to complete your purchase. Your order will be processed immediately after
                          payment is confirmed.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Order Summary Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 border-b pb-3 text-xl font-semibold text-gray-700">
                  Order Summary
                </h2>
                <ul role="list" className="mb-4 divide-y divide-gray-200">
                  {items.map(({ product, quantity }) => (
                    <li key={product.id} className="flex items-center py-3">
                      <Image
                        src={product.image_url || '/images/products/placeholder.svg'}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="mr-3 h-12 w-12 rounded-md border object-contain p-1"
                      />{' '}
                      {/* Corrected: image_url */}
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-gray-800">{product.name}</p>
                        <p className="text-gray-500">Qty: {quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ${(quantity * product.price).toFixed(2)}
                      </p>
                    </li>
                  ))}
                </ul>
                {/* ... totals ... */}
                {/* Discount Code Input */}
                <div className="mt-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      id="discount-code"
                      name="discount-code"
                      placeholder="Discount code"
                      value={discountCode}
                      onChange={e => setDiscountCode(e.target.value)}
                      className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      disabled={isApplyingDiscount || !!appliedDiscount}
                    />
                    <button
                      type="button"
                      onClick={handleApplyDiscount}
                      disabled={!discountCode || isApplyingDiscount || !!appliedDiscount}
                      className="focus:ring-primary-500 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                    >
                      {isApplyingDiscount ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                  {discountError && <p className="mt-1 text-sm text-red-600">{discountError}</p>}
                  {appliedDiscount && (
                    <div className="mt-2 flex items-center justify-between rounded-md bg-green-50 px-3 py-2">
                      <div className="flex items-center">
                        <svg
                          className="mr-2 h-5 w-5 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm font-medium text-green-800">
                          {appliedDiscount.message}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveDiscount}
                        className="text-sm font-medium text-green-700 hover:text-green-900"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <dl className="space-y-2 border-t pt-4 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <dt>Subtotal</dt>
                    <dd className="font-medium text-gray-900">${subtotal.toFixed(2)}</dd>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-green-700">
                      <dt>Discount</dt>
                      <dd className="font-medium">-${appliedDiscount.discountAmount.toFixed(2)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt>Shipping</dt>
                    <dd className="font-medium text-gray-900">$ TBD</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Taxes</dt>
                    <dd className="font-medium text-gray-900">$ TBD</dd>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-gray-200 pt-2">
                    <dt className="text-base font-semibold text-gray-900">Estimated Total</dt>
                    <dd className="text-base font-semibold text-gray-900">
                      ${(subtotal - (appliedDiscount?.discountAmount || 0)).toFixed(2)} + Fees
                    </dd>
                  </div>
                </dl>
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary-600 hover:bg-primary-700 flex w-full items-center justify-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white shadow-sm disabled:opacity-50"
                  >
                    {isLoading ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
                {error && <p className="mt-3 text-sm text-red-600">Error: {error}</p>}
                {orderSuccess && (
                  <div className="mt-3 rounded-md bg-green-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          Order placed successfully! Redirecting to confirmation page...
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

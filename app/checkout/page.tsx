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
      clearCart();
      setOrderSuccess(true);

      // Show success message for 2 seconds before redirecting
      setTimeout(() => {
        router.push(`/checkout/success?orderId=${orderId}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to place order.');
      console.error(err);
    } finally {
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
          <h1 className="mb-8 text-3xl font-bold text-gray-800">Checkout</h1>
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
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit-card"
                      checked={paymentMethod === 'credit-card'}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    <label>Credit Card (Placeholder)</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="etransfer"
                      checked={paymentMethod === 'etransfer'}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    <label>E-Transfer (Instructions will be provided)</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="btc"
                      checked={paymentMethod === 'btc'}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    <label>Bitcoin (Instructions will be provided)</label>
                  </div>
                </div>
                {paymentMethod === 'credit-card' && (
                  <div className="mt-4 rounded border bg-gray-50 p-4 text-gray-500">
                    Credit Card form placeholder
                  </div>
                )}
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
                <dl className="space-y-2 border-t pt-4 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <dt>Subtotal</dt>
                    <dd className="font-medium text-gray-900">${subtotal.toFixed(2)}</dd>
                  </div>
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
                      ${subtotal.toFixed(2)} + Fees
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

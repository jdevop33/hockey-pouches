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

  useEffect(() => {
    if (!authLoading) {
      if (!user || !token) {
        router.push('/login?redirect=/checkout'); 
      } else if (itemCount === 0) {
         router.push('/products'); 
      }
    }
  }, [user, token, authLoading, itemCount, router]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token || itemCount === 0) return;
    setIsLoading(true);
    setError(null);
    const finalBillingAddress = useShippingForBilling ? shippingAddress : billingAddress;
    
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.province || !shippingAddress.postalCode) {
        setError('Please complete the shipping address.');
        setIsLoading(false);
        return;
    }
    if (!useShippingForBilling && (!finalBillingAddress.street || !finalBillingAddress.city)) {
         setError('Please complete the billing address.');
         setIsLoading(false);
         return;
    }

    const orderData = {
        items: items.map(item => ({ productId: item.product.id, quantity: item.quantity, price: item.product.price })),
        shippingAddress: { ...shippingAddress, country: 'Canada' },
        billingAddress: useShippingForBilling ? { ...shippingAddress, country: 'Canada' } : { ...finalBillingAddress, country: 'Canada' },
        paymentMethod: paymentMethod,
    };
    console.log('Placing order with data:', orderData);

    try {
       const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
       });
       if (!response.ok) {
            if (response.status === 401) { logout(); router.push('/login'); return; } 
            const errData = await response.json();
            throw new Error(errData.message || `Failed to place order (${response.status})`);
       }
       const result = await response.json(); 
       const orderId = result.orderId;
       console.log('Order placed successfully:', result);
       clearCart(); 
       router.push(`/checkout/success?orderId=${orderId}`); 
    } catch (err: any) {
       setError(err.message || 'Failed to place order.');
       console.error(err);
    } finally {
       setIsLoading(false);
    }
  };

  if (authLoading || !user || itemCount === 0) {
    return <Layout><div className="p-8 text-center">Loading checkout...</div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-gray-100 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                 {/* Shipping Address */} 
                 <div className="bg-white p-6 rounded-lg shadow-md">
                     {/* ... form inputs ... */} 
                       <h2 className="text-xl font-semibold text-gray-700 mb-4">Shipping Address</h2>
                     <div className="space-y-4">
                         <div><label className="text-sm">Street:</label><input type="text" required className="w-full p-2 border rounded" onChange={e => setShippingAddress(s => ({...s, street: e.target.value}))}/></div>
                         <div><label className="text-sm">City:</label><input type="text" required className="w-full p-2 border rounded" onChange={e => setShippingAddress(s => ({...s, city: e.target.value}))}/></div>
                         <div className="grid grid-cols-2 gap-4">
                             <div><label className="text-sm">Province:</label><input type="text" required className="w-full p-2 border rounded" onChange={e => setShippingAddress(s => ({...s, province: e.target.value}))}/></div>
                             <div><label className="text-sm">Postal Code:</label><input type="text" required className="w-full p-2 border rounded" onChange={e => setShippingAddress(s => ({...s, postalCode: e.target.value}))}/></div>
                         </div>
                     </div>
                     <div className="mt-4 flex items-center">
                        <input type="checkbox" id="billingSameAsShipping" checked={useShippingForBilling} onChange={(e) => setUseShippingForBilling(e.target.checked)} className="h-4 w-4 rounded"/>
                        <label htmlFor="billingSameAsShipping" className="ml-2 text-sm text-gray-600">Billing address is the same as shipping</label>
                     </div>
                 </div>
                 {!useShippingForBilling && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Billing Address</h2>
                         <div className="space-y-4">
                             <div><label className="text-sm">Street:</label><input type="text" required className="w-full p-2 border rounded" onChange={e => setBillingAddress(s => ({...s, street: e.target.value}))}/></div>
                             {/* ... other fields ... */} 
                         </div>
                    </div>
                 )}
                  {/* Payment Method */} 
                 <div className="bg-white p-6 rounded-lg shadow-md">
                     {/* ... payment options ... */} 
                     <h2 className="text-xl font-semibold text-gray-700 mb-4">Payment Method</h2>
                     <div className="space-y-3">
                         <div className="flex items-center"><input type="radio" name="paymentMethod" value="credit-card" checked={paymentMethod === 'credit-card'} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-2"/><label>Credit Card (Placeholder)</label></div>
                         <div className="flex items-center"><input type="radio" name="paymentMethod" value="etransfer" checked={paymentMethod === 'etransfer'} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-2"/><label>E-Transfer (Instructions will be provided)</label></div>
                         <div className="flex items-center"><input type="radio" name="paymentMethod" value="btc" checked={paymentMethod === 'btc'} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-2"/><label>Bitcoin (Instructions will be provided)</label></div>
                     </div>
                     {paymentMethod === 'credit-card' && <div className="mt-4 p-4 border rounded bg-gray-50 text-gray-500">Credit Card form placeholder</div>}
                 </div>
            </div>
            {/* Order Summary Column */} 
            <div className="lg:col-span-1">
                 <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
                     <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-3">Order Summary</h2>
                     <ul role="list" className="divide-y divide-gray-200 mb-4">
                        {items.map(({ product, quantity }) => (
                        <li key={product.id} className="py-3 flex items-center">
                            <Image src={product.image_url || '/images/products/placeholder.svg'} alt={product.name} width={48} height={48} className="h-12 w-12 rounded-md object-contain border p-1 mr-3" /> {/* Corrected: image_url */} 
                            <div className="flex-1 text-sm">
                                <p className="font-medium text-gray-800">{product.name}</p>
                                <p className="text-gray-500">Qty: {quantity}</p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">${(quantity * product.price).toFixed(2)}</p>
                        </li>
                        ))}
                     </ul>
                      {/* ... totals ... */} 
                      <dl className="space-y-2 text-sm text-gray-600 border-t pt-4">
                           <div className="flex justify-between"><dt>Subtotal</dt><dd className="text-gray-900 font-medium">${subtotal.toFixed(2)}</dd></div>
                           <div className="flex justify-between"><dt>Shipping</dt><dd className="text-gray-900 font-medium">$ TBD</dd></div>
                           <div className="flex justify-between"><dt>Taxes</dt><dd className="text-gray-900 font-medium">$ TBD</dd></div>
                           <div className="flex justify-between border-t pt-2 mt-2 border-gray-200"><dt className="text-base font-semibold text-gray-900">Estimated Total</dt><dd className="text-base font-semibold text-gray-900">${subtotal.toFixed(2)} + Fees</dd></div>
                      </dl>
                      <div className="mt-6">
                         <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50">
                            {isLoading ? 'Placing Order...' : 'Place Order'}
                          </button>
                      </div>
                      {error && <p className="text-red-600 text-sm mt-3">Error: {error}</p>}
                 </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

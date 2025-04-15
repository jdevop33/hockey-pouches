'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Layout from '../components/layout/Layout';
import { useCart } from '../context/CartContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect to cart if cart is empty
  React.useEffect(() => {
    if (items.length === 0 && !success) {
      router.push('/cart');
    }
  }, [items, router, success]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Format order items for email
      const orderItems = items.map(item => {
        // Find the appropriate price tier based on quantity
        let tierPrice = item.product.wholesalePrices[0].price;
        for (let i = item.product.wholesalePrices.length - 1; i >= 0; i--) {
          if (item.quantity >= item.product.wholesalePrices[i].quantity) {
            tierPrice = item.product.wholesalePrices[i].price;
            break;
          }
        }

        return {
          name: item.product.name,
          quantity: item.quantity,
          price: tierPrice,
          total: item.quantity * tierPrice
        };
      });

      // Prepare data for submission
      const orderData = {
        customer: formData,
        order: {
          items: orderItems,
          subtotal: subtotal,
          date: new Date().toISOString()
        }
      };

      // Send order to the form endpoint
      const response = await fetch('https://public.herotofu.com/v1/3e028000-1998-11f0-ab37-9d304c3aa51c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      // Order successful
      setSuccess(true);
      clearCart();

      // Scroll to top to show success message
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Error submitting order:', err);
      setError('There was a problem submitting your order. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Order Received!</h1>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for your order. We've received your request and will contact you shortly to confirm the details and provide payment options.
              </p>
              <p className="text-md text-gray-500 mb-4">
                We manually process all orders to ensure the best service. You'll receive an email with payment instructions and shipping details.
              </p>
              <p className="text-md text-gray-500 mb-6">
                A confirmation email has been sent to {formData.email}
              </p>
              <div className="mt-8">
                <button
                  onClick={() => router.push('/products')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-8">Checkout</h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 sm:p-8 bg-primary-600 text-white">
                <h2 className="text-xl font-bold">Shipping Information</h2>
                <p className="text-sm opacity-80">Please enter your shipping details</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company Name <span className="text-gray-400">(Optional)</span></label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="province" className="block text-sm font-medium text-gray-700">Province *</label>
                    <select
                      id="province"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select Province</option>
                      <option value="AB">Alberta</option>
                      <option value="BC">British Columbia</option>
                      <option value="MB">Manitoba</option>
                      <option value="NB">New Brunswick</option>
                      <option value="NL">Newfoundland and Labrador</option>
                      <option value="NS">Nova Scotia</option>
                      <option value="NT">Northwest Territories</option>
                      <option value="NU">Nunavut</option>
                      <option value="ON">Ontario</option>
                      <option value="PE">Prince Edward Island</option>
                      <option value="QC">Quebec</option>
                      <option value="SK">Saskatchewan</option>
                      <option value="YT">Yukon</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code *</label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Order Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Special instructions for your order"
                  ></textarea>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 sm:p-8 bg-primary-600 text-white">
                <h2 className="text-xl font-bold">Order Summary</h2>
                <p className="text-sm opacity-80">{items.length} {items.length === 1 ? 'item' : 'items'} in your order</p>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flow-root">
                  <ul className="-my-6 divide-y divide-gray-200">
                    {items.map((item) => {
                      // For B2C, we use a fixed retail price (2x the wholesale price)
                      const retailPrice = item.product.wholesalePrices[0].price * 2;
                      const itemTotal = item.quantity * retailPrice;

                      return (
                        <li key={item.product.id} className="py-6 flex">
                          <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                            <div className="relative w-full h-full">
                              <Image
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                fill
                                style={{ objectFit: 'contain' }}
                                className="p-2"
                              />
                            </div>
                          </div>
                          <div className="ml-4 flex-1 flex flex-col">
                            <div>
                              <div className="flex justify-between text-base font-medium text-gray-900">
                                <h3>{item.product.name}</h3>
                                <p className="ml-4">${itemTotal.toFixed(2)}</p>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">{item.product.flavor} | {item.product.strength}mg</p>
                            </div>
                            <div className="flex-1 flex items-end justify-between text-sm">
                              <p className="text-gray-500">
                                Qty {item.quantity} × ${retailPrice.toFixed(2)}
                                {item.quantity >= 3 && (
                                  <span className="ml-1 text-xs text-green-600 font-medium">
                                    (Bulk discount applied)
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                    <p>Subtotal</p>
                    <p>${subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <p>Shipping</p>
                    <p>Calculated at next step</p>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <p>Taxes</p>
                    <p>Calculated at next step</p>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold text-gray-900">
                    <p>Total</p>
                    <p>${subtotal.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
              <p className="text-gray-600 mb-4">
                After submitting your order, our team will contact you with available payment options (e-transfer, credit card, etc.). We manually process all orders to provide personalized service and ensure you get the right products for your needs.
              </p>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Your information is secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

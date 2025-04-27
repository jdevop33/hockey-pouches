'use client';

import React, { useState } from 'react';
import { Settings, CreditCard, Truck, Mail, Bell, Shield, Globe, Save } from 'lucide-react';

interface SettingCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

export default function AdminSettings() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const categories: SettingCategory[] = [
    {
      id: 'general',
      name: 'General',
      icon: <Settings className="h-5 w-5" />,
      description: 'Basic store settings and configurations',
    },
    {
      id: 'payment',
      name: 'Payment',
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Configure payment methods and options',
    },
    {
      id: 'shipping',
      name: 'Shipping',
      icon: <Truck className="h-5 w-5" />,
      description: 'Manage shipping methods and rates',
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: <Bell className="h-5 w-5" />,
      description: 'Configure email and system notifications',
    },
    {
      id: 'security',
      name: 'Security',
      icon: <Shield className="h-5 w-5" />,
      description: 'Security settings and access controls',
    },
    {
      id: 'localization',
      name: 'Localization',
      icon: <Globe className="h-5 w-5" />,
      description: 'Regional settings and localization',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage('Settings updated successfully');

      // Hide success message after a few seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Store Settings</h1>
        <p className="mt-2 text-gray-400">Configure your store settings and preferences</p>
      </div>

      {successMessage && (
        <div className="mb-6 rounded-lg bg-green-500/20 p-4 text-green-300">{successMessage}</div>
      )}

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="overflow-hidden rounded-xl border border-gold-500/30 bg-dark-800 shadow-lg">
            <ul className="divide-y divide-gold-500/10">
              {categories.map(category => (
                <li key={category.id}>
                  <button
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex w-full items-center px-4 py-3 text-left transition-colors hover:bg-dark-700 ${
                      activeCategory === category.id
                        ? 'bg-gold-500/10 text-gold-500'
                        : 'text-gray-200'
                    }`}
                  >
                    <span className="mr-3">{category.icon}</span>
                    <div>
                      <span className="block font-medium">{category.name}</span>
                      <span className="text-xs text-gray-400">{category.description}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-gold-500/30 bg-dark-800 p-6 shadow-lg">
            {activeCategory === 'general' && (
              <form onSubmit={handleSubmit}>
                <h2 className="mb-6 text-xl font-bold text-white">General Settings</h2>

                <div className="mb-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="store_name" className="mb-1 block text-sm text-gray-300">
                      Store Name
                    </label>
                    <input
                      id="store_name"
                      type="text"
                      defaultValue="Hockey Pouches"
                      className="w-full rounded-lg border border-gray-700 bg-dark-700 px-4 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="store_email" className="mb-1 block text-sm text-gray-300">
                      Store Email
                    </label>
                    <input
                      id="store_email"
                      type="email"
                      defaultValue="info@hockeypouches.com"
                      className="w-full rounded-lg border border-gray-700 bg-dark-700 px-4 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="store_address" className="mb-1 block text-sm text-gray-300">
                    Store Address
                  </label>
                  <textarea
                    id="store_address"
                    rows={3}
                    defaultValue="123 Hockey Lane, Suite 456, Puck City, PC 12345"
                    className="w-full rounded-lg border border-gray-700 bg-dark-700 px-4 py-2 text-white"
                  ></textarea>
                </div>

                <div className="mb-6">
                  <label htmlFor="currency_select" className="mb-1 block text-sm text-gray-300">
                    Currency
                  </label>
                  <select
                    id="currency_select"
                    aria-label="Store currency"
                    className="w-full rounded-lg border border-gray-700 bg-dark-700 px-4 py-2 text-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      id="maintenance_mode"
                      aria-label="Enable maintenance mode"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-700 bg-dark-700 text-gold-500"
                    />
                    <span className="ml-2 text-sm text-gray-300">Enable maintenance mode</span>
                  </label>
                </div>

                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-medium text-white">Product Settings</h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-dark-700 px-4 py-3">
                      <div>
                        <p className="font-medium text-white">Product Price</p>
                        <p className="text-sm text-gray-400">Set fixed price for all products</p>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2 text-white">$</span>
                        <label htmlFor="product_price" className="sr-only">
                          Product price
                        </label>
                        <input
                          type="number"
                          id="product_price"
                          aria-label="Product price"
                          defaultValue="15"
                          className="w-20 rounded-lg border border-gray-700 bg-dark-800 px-2 py-1 text-center text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-dark-700 px-4 py-3">
                      <div>
                        <p className="font-medium text-white">Minimum Order Quantity</p>
                        <p className="text-sm text-gray-400">Set minimum units per order</p>
                      </div>
                      <div>
                        <label htmlFor="min_order_quantity" className="sr-only">
                          Minimum order quantity
                        </label>
                        <input
                          type="number"
                          id="min_order_quantity"
                          aria-label="Minimum order quantity"
                          defaultValue="5"
                          className="w-20 rounded-lg border border-gray-700 bg-dark-800 px-2 py-1 text-center text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-dark-700 px-4 py-3">
                      <div>
                        <p className="font-medium text-white">Wholesale Minimum</p>
                        <p className="text-sm text-gray-400">
                          Set minimum units for wholesale orders
                        </p>
                      </div>
                      <div>
                        <label htmlFor="wholesale_min" className="sr-only">
                          Wholesale minimum quantity
                        </label>
                        <input
                          type="number"
                          id="wholesale_min"
                          aria-label="Wholesale minimum quantity"
                          defaultValue="100"
                          className="w-20 rounded-lg border border-gray-700 bg-dark-800 px-2 py-1 text-center text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group flex items-center rounded-xl bg-gold-500 px-6 py-2.5 text-sm font-bold text-black shadow-gold transition-all duration-300 hover:bg-gold-400 hover:shadow-gold-lg disabled:opacity-70"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                    {!isSubmitting && (
                      <Save className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:scale-110" />
                    )}
                  </button>
                </div>
              </form>
            )}

            {activeCategory === 'payment' && (
              <div>
                <h2 className="mb-6 text-xl font-bold text-white">Payment Settings</h2>
                <p className="text-gray-400">
                  Configure payment methods and processor settings. Currently showing a placeholder
                  as this section is under development.
                </p>

                <div className="mt-6 overflow-hidden rounded-lg border border-gold-500/30 bg-dark-700">
                  <div className="p-4">
                    <h3 className="font-medium text-white">Available Payment Methods</h3>
                  </div>

                  <div className="divide-y divide-gold-500/10">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center">
                        <div className="mr-3 h-10 w-10 rounded-md bg-blue-500/20 p-2 text-blue-400">
                          <CreditCard className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Credit Cards</p>
                          <p className="text-sm text-gray-400">Via Stripe</p>
                        </div>
                      </div>
                      <label
                        htmlFor="credit_card_toggle"
                        className="relative inline-flex cursor-pointer items-center"
                      >
                        <input
                          id="credit_card_toggle"
                          type="checkbox"
                          defaultChecked
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-gold-500 peer-checked:after:translate-x-full"></div>
                        <span className="sr-only">Enable Credit Card payments</span>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center">
                        <div className="mr-3 h-10 w-10 rounded-md bg-yellow-500/20 p-2 text-yellow-400">
                          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.978a.641.641 0 0 1 .634-.54h4.607a.641.641 0 0 1 .633.74L7.71 20.798a.641.641 0 0 1-.634.54zm7.865-11.87l-2.13 2.13 4.673 4.8a.646.646 0 0 1 .19.45.646.646 0 0 1-.19.45l-2.255 2.255a.641.641 0 0 1-.9 0l-4.673-4.8-2.13 2.13a.644.644 0 0 1-.45.19.646.646 0 0 1-.45-.19.646.646 0 0 1 0-.9l8.593-8.593a.646.646 0 0 1 .9 0 .646.646 0 0 1 0 .9l-.178.178z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-white">Bitcoin</p>
                          <p className="text-sm text-gray-400">Via BTCPay Server</p>
                        </div>
                      </div>
                      <label
                        htmlFor="bitcoin_toggle"
                        className="relative inline-flex cursor-pointer items-center"
                      >
                        <input
                          id="bitcoin_toggle"
                          type="checkbox"
                          defaultChecked
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-gold-500 peer-checked:after:translate-x-full"></div>
                        <span className="sr-only">Enable Bitcoin payments</span>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center">
                        <div className="mr-3 h-10 w-10 rounded-md bg-green-500/20 p-2 text-green-400">
                          <Mail className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium text-white">E-Transfer</p>
                          <p className="text-sm text-gray-400">Manual Verification</p>
                        </div>
                      </div>
                      <label
                        htmlFor="etransfer_toggle"
                        className="relative inline-flex cursor-pointer items-center"
                      >
                        <input
                          id="etransfer_toggle"
                          type="checkbox"
                          defaultChecked
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-gold-500 peer-checked:after:translate-x-full"></div>
                        <span className="sr-only">Enable E-Transfer payments</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeCategory !== 'general' && activeCategory !== 'payment' && (
              <div className="flex min-h-[300px] flex-col items-center justify-center">
                <div className="rounded-full bg-dark-700 p-4">
                  {categories.find(cat => cat.id === activeCategory)?.icon}
                </div>
                <h3 className="mt-4 text-lg font-medium text-white">
                  {categories.find(cat => cat.id === activeCategory)?.name} Settings
                </h3>
                <p className="mt-2 text-center text-sm text-gray-400">
                  This section is currently under development. Check back soon for updates.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

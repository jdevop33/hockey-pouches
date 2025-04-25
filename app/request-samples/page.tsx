'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../components/layout/NewLayout';
import { Button } from '../components/ui/button-shadcn';

export default function RequestSamplesPage() {
  const [formState, setFormState] = useState({
    businessName: '',
    businessType: 'Retail Store',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    preferences: '',
    agreeToTerms: false,
    isSubmitting: false,
    isSubmitted: false,
    error: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormState(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formState.businessName || !formState.contactName || !formState.email || !formState.preferences) {
      setFormState(prev => ({ ...prev, error: 'Please fill out all required fields' }));
      return;
    }
    
    if (!formState.agreeToTerms) {
      setFormState(prev => ({ ...prev, error: 'You must agree to the terms and conditions' }));
      return;
    }
    
    // Submit form
    setFormState(prev => ({ ...prev, isSubmitting: true, error: '' }));
    
    // Simulate API call
    setTimeout(() => {
      setFormState(prev => ({ 
        ...prev, 
        isSubmitting: false, 
        isSubmitted: true 
      }));
    }, 1500);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-cream-50 dark:bg-rich-950 text-rich-900 dark:text-cream-50 relative py-24">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-30 dark:opacity-20"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="bg-forest-600 mb-6 inline-block rounded-full px-3 py-1 text-sm font-medium text-white">
              SAMPLE REQUEST
            </div>
            <h1 className="text-rich-900 dark:text-cream-50 mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Experience <span className="text-forest-500">Premium Quality</span>
            </h1>
            <p className="text-rich-700 dark:text-cream-300 mb-10 text-xl leading-relaxed">
              Request complimentary samples for your business and discover why PUXX Premium stands apart from the competition.
            </p>
          </div>
        </div>
      </section>

      {/* Sample Request Form Section */}
      <section className="bg-cream-100 dark:bg-rich-900 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {formState.isSubmitted ? (
              <div className="from-cream-50 dark:from-rich-800 to-white dark:to-rich-900 bg-gradient-to-br rounded-2xl p-8 shadow-lg text-center">
                <div className="bg-forest-600 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-rich-950 dark:text-cream-50 text-2xl font-bold mb-4">
                  Thank You for Your Request!
                </h2>
                <p className="text-rich-700 dark:text-cream-300 mb-8">
                  We've received your sample request and will review it shortly. Our team will contact you within 1-2 business days to confirm your eligibility and shipping details.
                </p>
                <Button className="bg-forest-600 hover:bg-forest-700 border-none text-white">
                  <Link href="/">Return to Homepage</Link>
                </Button>
              </div>
            ) : (
              <div className="from-cream-50 dark:from-rich-800 to-white dark:to-rich-900 bg-gradient-to-br rounded-2xl p-8 shadow-lg">
                <h2 className="text-rich-950 dark:text-cream-50 text-2xl font-bold mb-6">
                  Request Your Free Samples
                </h2>
                <p className="text-rich-700 dark:text-cream-300 mb-8">
                  Please complete the form below to request samples for your business. Samples are available for verified businesses only and subject to approval.
                </p>
                
                {formState.error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md p-4 mb-6">
                    {formState.error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-rich-700 dark:text-cream-300 block text-sm font-medium mb-2">
                        Business Name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="businessName"
                        value={formState.businessName}
                        onChange={handleChange}
                        className="border-cream-300 dark:border-rich-700 dark:bg-rich-800 text-rich-900 dark:text-cream-50 focus:ring-forest-400 w-full rounded-md border bg-white px-4 py-2 focus:ring-2 focus:outline-none"
                        placeholder="Your business name"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-rich-700 dark:text-cream-300 block text-sm font-medium mb-2">
                        Business Type <span className="text-red-500">*</span>
                      </label>
                      <select 
                        name="businessType"
                        value={formState.businessType}
                        onChange={handleChange}
                        className="border-cream-300 dark:border-rich-700 dark:bg-rich-800 text-rich-900 dark:text-cream-50 focus:ring-forest-400 w-full rounded-md border bg-white px-4 py-2 focus:ring-2 focus:outline-none"
                        required
                      >
                        <option>Retail Store</option>
                        <option>Online Shop</option>
                        <option>Distributor</option>
                        <option>Vape Shop</option>
                        <option>Convenience Store</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-rich-700 dark:text-cream-300 block text-sm font-medium mb-2">
                        Contact Name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="contactName"
                        value={formState.contactName}
                        onChange={handleChange}
                        className="border-cream-300 dark:border-rich-700 dark:bg-rich-800 text-rich-900 dark:text-cream-50 focus:ring-forest-400 w-full rounded-md border bg-white px-4 py-2 focus:ring-2 focus:outline-none"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-rich-700 dark:text-cream-300 block text-sm font-medium mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="email" 
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        className="border-cream-300 dark:border-rich-700 dark:bg-rich-800 text-rich-900 dark:text-cream-50 focus:ring-forest-400 w-full rounded-md border bg-white px-4 py-2 focus:ring-2 focus:outline-none"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-rich-700 dark:text-cream-300 block text-sm font-medium mb-2">
                      Phone Number
                    </label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formState.phone}
                      onChange={handleChange}
                      className="border-cream-300 dark:border-rich-700 dark:bg-rich-800 text-rich-900 dark:text-cream-50 focus:ring-forest-400 w-full rounded-md border bg-white px-4 py-2 focus:ring-2 focus:outline-none"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  
                  <div>
                    <label className="text-rich-700 dark:text-cream-300 block text-sm font-medium mb-2">
                      Business Address
                    </label>
                    <input 
                      type="text" 
                      name="address"
                      value={formState.address}
                      onChange={handleChange}
                      className="border-cream-300 dark:border-rich-700 dark:bg-rich-800 text-rich-900 dark:text-cream-50 focus:ring-forest-400 w-full rounded-md border bg-white px-4 py-2 focus:ring-2 focus:outline-none"
                      placeholder="Street address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="text-rich-700 dark:text-cream-300 block text-sm font-medium mb-2">
                        City
                      </label>
                      <input 
                        type="text" 
                        name="city"
                        value={formState.city}
                        onChange={handleChange}
                        className="border-cream-300 dark:border-rich-700 dark:bg-rich-800 text-rich-900 dark:text-cream-50 focus:ring-forest-400 w-full rounded-md border bg-white px-4 py-2 focus:ring-2 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-rich-700 dark:text-cream-300 block text-sm font-medium mb-2">
                        State/Province
                      </label>
                      <input 
                        type="text" 
                        name="state"
                        value={formState.state}
                        onChange={handleChange}
                        className="border-cream-300 dark:border-rich-700 dark:bg-rich-800 text-rich-900 dark:text-cream-50 focus:ring-forest-400 w-full rounded-md border bg-white px-4 py-2 focus:ring-2 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-rich-700 dark:text-cream-300 block text-sm font-medium mb-2">
                        ZIP/Postal Code
                      </label>
                      <input 
                        type="text" 
                        name="zip"
                        value={formState.zip}
                        onChange={handleChange}
                        className="border-cream-300 dark:border-rich-700 dark:bg-rich-800 text-rich-900 dark:text-cream-50 focus:ring-forest-400 w-full rounded-md border bg-white px-4 py-2 focus:ring-2 focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-rich-700 dark:text-cream-300 block text-sm font-medium mb-2">
                      Sample Preferences <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      name="preferences"
                      value={formState.preferences}
                      onChange={handleChange}
                      className="border-cream-300 dark:border-rich-700 dark:bg-rich-800 text-rich-900 dark:text-cream-50 focus:ring-forest-400 w-full rounded-md border bg-white px-4 py-2 focus:ring-2 focus:outline-none"
                      placeholder="Tell us which flavors and strengths you're interested in"
                      rows={4}
                      required
                    ></textarea>
                    <p className="text-rich-600 dark:text-cream-400 text-xs mt-2">
                      Please specify which collections, flavors, and strengths you're interested in sampling.
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        name="agreeToTerms"
                        type="checkbox"
                        checked={formState.agreeToTerms}
                        onChange={handleCheckboxChange}
                        className="focus:ring-forest-400 h-4 w-4 text-forest-600 border-cream-300 dark:border-rich-700 rounded"
                        required
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="text-rich-700 dark:text-cream-300">
                        I confirm that I am a business owner or authorized representative, 21 years of age or older, and agree to the <Link href="/terms" className="text-forest-600 dark:text-forest-400 underline">terms and conditions</Link>.
                      </label>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="bg-forest-600 hover:bg-forest-700 w-full border-none text-white"
                      disabled={formState.isSubmitting}
                    >
                      {formState.isSubmitting ? 'Submitting...' : 'Request Samples'}
                    </Button>
                  </div>
                  
                  <p className="text-rich-600 dark:text-cream-400 text-sm text-center">
                    Samples available for verified businesses only. Age verification (21+) required.
                    <br />Our team will contact you within 1-2 business days to confirm your request.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-cream-50 dark:bg-rich-950 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-forest-600 dark:text-forest-400 inline-block text-sm font-medium">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-rich-950 dark:text-cream-50 mt-3 text-3xl font-bold">
              Common Questions About Our Samples
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto grid gap-6">
            <div className="dark:bg-rich-900 bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-rich-950 dark:text-cream-50 text-lg font-bold mb-2">
                Who is eligible for free samples?
              </h3>
              <p className="text-rich-700 dark:text-cream-300">
                Free samples are available to verified businesses such as retailers, distributors, vape shops, convenience stores, and other businesses that sell nicotine products. All recipients must be 21 years of age or older.
              </p>
            </div>
            
            <div className="dark:bg-rich-900 bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-rich-950 dark:text-cream-50 text-lg font-bold mb-2">
                What's included in the sample pack?
              </h3>
              <p className="text-rich-700 dark:text-cream-300">
                Our standard sample pack includes a selection of our most popular flavors and strengths from our Classic, Intense, and Light collections. You can specify your preferences in the request form.
              </p>
            </div>
            
            <div className="dark:bg-rich-900 bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-rich-950 dark:text-cream-50 text-lg font-bold mb-2">
                How long does shipping take?
              </h3>
              <p className="text-rich-700 dark:text-cream-300">
                Once your sample request is approved, you can expect to receive your samples within 3-5 business days via expedited shipping. International shipping times may vary.
              </p>
            </div>
            
            <div className="dark:bg-rich-900 bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-rich-950 dark:text-cream-50 text-lg font-bold mb-2">
                Is there a limit to how many samples I can request?
              </h3>
              <p className="text-rich-700 dark:text-cream-300">
                We typically limit sample requests to one per business. However, if you're interested in multiple collections or have special requirements, please mention this in your request and our team will work with you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="from-forest-600 to-forest-700 bg-gradient-to-br py-20 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to Partner with PUXX Premium?</h2>
            <p className="mb-8 text-lg">
              Beyond samples, explore our wholesale program for competitive pricing and dedicated support.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-white text-forest-600 hover:bg-cream-100 border-none">
                <Link href="/wholesale">Wholesale Program</Link>
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-forest-500">
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

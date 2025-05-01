'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../components/layout/NewLayout';
import ReCaptcha from '../components/ui/ReCaptcha';
import Link from 'next/link';

type FormData = {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  honeypot: string; // Honeypot field for spam protection
};

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    // Check if honeypot field is filled (spam bot)
    if (data.honeypot) {
      
      setIsSubmitted(true);
      return;
    }

    // Check if reCAPTCHA is verified
    if (!recaptchaToken) {
      alert('Please verify that you are not a robot');
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out the honeypot field from form data
      const { name, email, phone, company, message } = data;
      const formData = { name, email, phone, company, message };

      // Send form data to our API endpoint that uses Mailgun
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        reset();
      } else {
        const errorData = await params.id();
        alert(
          `Error: ${params.id || 'There was an error submitting the form. Please try again.'}`
        );
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="bg-dark-800 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-3xl font-extrabold text-white">
            <span className="bg-gradient-gold bg-clip-text text-transparent">Let's Connect</span>
          </h1>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Contact Information */}
            <div className="rounded-lg border border-gold-500/20 bg-dark-900/95 p-8 shadow-gold-sm">
              <h2 className="mb-6 text-2xl font-bold text-gold-500">We're Here For You</h2>
              <p className="mb-8 text-gray-300">
                Have a question about PUXX? Want to share your experience? Our team of passionate
                experts is ready to help. We typically respond within 24 hours or less.
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-gold-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 text-gray-200">
                    <p className="text-lg font-medium text-white">Phone</p>
                    <p>(250) 415-5678</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-gold-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 text-gray-200">
                    <p className="text-lg font-medium text-white">Email</p>
                    <p>{process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@nicotinetins.com'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-gold-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 text-gray-200">
                    <p className="text-lg font-medium text-white">Office</p>
                    <p>123 Business Street</p>
                    <p>Vancouver, BC V6B 1A1</p>
                    <p>Canada</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-gold-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 text-gray-200">
                    <p className="text-lg font-medium text-white">Business Hours</p>
                    <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
                    <p>Saturday - Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-lg border border-gold-500/20 bg-dark-900/95 p-8 shadow-gold-sm">
              {isSubmitted ? (
                <div className="py-12 text-center">
                  <svg
                    className="mx-auto mb-4 h-16 w-16 text-gold-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h2 className="mb-2 text-2xl font-bold text-gold-500">Message Received!</h2>
                  <p className="text-gray-300">
                    Thanks for reaching out! One of our team members will get back to you within 24
                    hours. In the meantime, why not check out our{' '}
                    <Link href="/products" className="text-gold-400 hover:text-gold-300">
                      latest products
                    </Link>
                    ?
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="mb-6 text-2xl font-bold text-gold-500">Share Your Thoughts</h2>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                      <label
                        htmlFor="name"
                        className="mb-1 block text-sm font-medium text-gray-200"
                      >
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        className={`w-full border ${
                          errors.name ? 'border-red-500' : 'border-gold-500/30'
                        } rounded-md bg-dark-700 px-3 py-2 text-white placeholder-gray-400 focus:border-gold-500 focus:ring-gold-500`}
                        {...register('name', { required: 'Name is required' })}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="email"
                        className="mb-1 block text-sm font-medium text-gray-200"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        className={`w-full border ${
                          errors.email ? 'border-red-500' : 'border-gold-500/30'
                        } rounded-md bg-dark-700 px-3 py-2 text-white placeholder-gray-400 focus:border-gold-500 focus:ring-gold-500`}
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="phone"
                        className="mb-1 block text-sm font-medium text-gray-200"
                      >
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        className={`w-full rounded-md border border-gold-500/30 bg-dark-700 px-3 py-2 text-white placeholder-gray-400 focus:border-gold-500 focus:ring-gold-500`}
                        {...register('phone')}
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="company"
                        className="mb-1 block text-sm font-medium text-gray-200"
                      >
                        Company
                      </label>
                      <input
                        type="text"
                        id="company"
                        className={`w-full rounded-md border border-gold-500/30 bg-dark-700 px-3 py-2 text-white placeholder-gray-400 focus:border-gold-500 focus:ring-gold-500`}
                        {...register('company')}
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="message"
                        className="mb-1 block text-sm font-medium text-gray-200"
                      >
                        Message *
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        className={`w-full border ${
                          errors.message ? 'border-red-500' : 'border-gold-500/30'
                        } rounded-md bg-dark-700 px-3 py-2 text-white placeholder-gray-400 focus:border-gold-500 focus:ring-gold-500`}
                        {...register('message', { required: 'Message is required' })}
                      ></textarea>
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-400">{errors.message.message}</p>
                      )}
                    </div>

                    {/* Honeypot field */}
                    <div className="hidden">
                      <label htmlFor="honeypot">Leave this field empty</label>
                      <input type="text" id="honeypot" {...register('honeypot')} />
                    </div>

                    <div className="mb-4">
                      <ReCaptcha onVerify={token => setRecaptchaToken(token)} />
                    </div>

                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-md bg-gradient-gold px-4 py-3 text-center text-sm font-bold text-dark-900 shadow-gold-sm transition-all duration-200 hover:shadow-gold disabled:opacity-70"
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

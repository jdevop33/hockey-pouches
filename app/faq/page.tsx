'use client';

import React from 'react';
import Layout from '../components/layout/NewLayout'; // Adjust layout import as needed
import FAQSchema from '../components/FAQSchema'; // Assuming you might have/want an FAQ schema component

const faqData = [
  {
    question: 'What are Hockey Puxx nicotine pouches?',
    answer: 'Hockey Puxx are tobacco-free nicotine pouches designed for hockey players and fans, providing a discreet and convenient way to use nicotine without smoke or spit.',
  },
  {
    question: 'How do I use the pouches?',
    // Fixed the string literal below using backticks
    answer: `Simply place a pouch between your gum and lip. The nicotine is absorbed through the lining of your mouth. There's no need to chew or spit. Dispose of the used pouch responsibly.`,
  },
  {
    question: 'Are these products safe?',
    answer: 'While tobacco-free nicotine pouches are considered a harm reduction alternative to smoking or chewing tobacco, they still contain nicotine, which is an addictive chemical. They are intended for adult nicotine users only.',
  },
  {
    question: 'Where do you ship?',
    answer: 'We currently ship across Canada. Orders are typically fulfilled from the nearest distribution center (Vancouver, Calgary, Edmonton, Toronto).',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Shipping times vary depending on your location and the fulfillment center. You will receive tracking information once your order ships.',
  },
  // --- MLM/Referral System Additions --- 
  // TODO: Add FAQs related to:
  // - How does the referral program work?
  // - How do I get my referral code/link?
  // - How do I earn commissions?
  // - How can I use my earned commissions?
  // - How do I become a Distributor?
  // - What are the benefits of being a Distributor?
  // - How does wholesale ordering work?
];

export default function FAQPage() {
  return (
    <Layout>
      {/* TODO: Ensure FAQSchema component exists and accepts faqData prop correctly */}
      {/* <FAQSchema faqData={faqData} /> */}
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-center text-3xl font-bold text-gray-900 sm:text-4xl">Frequently Asked Questions</h1>
          
          <div className="space-y-6">
            {faqData.map((item, index) => (
              <div key={index} className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-3 text-lg font-semibold text-gray-900">{item.question}</h2>
                <p className="text-gray-600">{item.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600">Have more questions?</p>
            <a href="/contact" className="text-primary-600 hover:text-primary-700 mt-2 inline-block font-medium">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}

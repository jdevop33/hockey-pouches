'use client';

import React from 'react';
import Layout from '../components/layout/NewLayout';
import FAQSchema from '../components/FAQSchema';

const faqData = [
  {
    question: 'What are PUXX nicotine pouches?',
    answer:
      'PUXX offers premium tobacco-free nicotine pouches crafted with exceptional attention to detail. Our sophisticated formulations provide a refined experience with elegant flavor profiles and consistent satisfaction without smoke or spit.',
  },
  {
    question: 'How do I use PUXX pouches?',
    answer: `Simply place a pouch between your gum and upper lip. The nicotine is absorbed through the oral mucosa, delivering a smooth, controlled experience. No need to chew or spit. Dispose of the used pouch responsibly when finished.`,
  },
  {
    question: 'What sets PUXX apart from other nicotine pouches?',
    answer:
      'PUXX stands apart through our commitment to refined quality, distinguished flavor profiles, and elegant packaging designed for the discerning consumer. Our products undergo rigorous quality control to ensure a consistently superior experience.',
  },
  {
    question: 'Where does PUXX currently ship?',
    answer:
      'We exclusively serve the Canadian market with fulfillment centers in Vancouver, Calgary, Edmonton, and Toronto to ensure efficient delivery. Each shipment is carefully packaged to maintain product integrity throughout transit.',
  },
  {
    question: 'How long does shipping take?',
    answer:
      'Premium delivery service typically ranges from 2-5 business days, depending on your location and nearest fulfillment center. You will receive detailed tracking information once your order ships, allowing you to monitor your delivery with precision.',
  },
  // --- Referral Program FAQs ---
  {
    question: 'How does the PUXX Ambassador program work?',
    answer:
      'Our exclusive Ambassador program allows you to earn commissions by sharing your unique referral link. When clients make purchases through your link, you earn commissions on their initial purchase and subsequent orders, creating a continuous revenue stream.',
  },
  {
    question: 'How do I access my Ambassador link?',
    answer:
      'After creating your PUXX account, you can find your personalized Ambassador link in your dashboard under the "Referrals" section. This custom link can be shared via your preferred digital channels for maximum exposure.',
  },
  {
    question: 'What commission structure does PUXX offer?',
    answer:
      'Our standard commission rate begins at 10% of the purchase value, calculated on product price before taxes and shipping. Top-performing Ambassadors may qualify for enhanced commission tiers and exclusive benefits.',
  },
  {
    question: 'How can I utilize my earned commissions?',
    answer:
      'Commissions are credited to your PUXX account and can be applied toward future purchases or withdrawn via secure e-Transfer once you reach the $50 threshold. Commission withdrawals are processed within 5-7 business days with confirmation notifications.',
  },
  {
    question: 'How do I become a PUXX Distributor?',
    answer:
      'Becoming a PUXX Distributor involves an application and approval process through your dashboard. Distributors maintain specific monthly performance metrics and receive comprehensive support. Contact our Distributor Relations team for detailed information about joining our select network.',
  },
  {
    question: 'What advantages come with PUXX Distributor status?',
    answer:
      'PUXX Distributors enjoy premium benefits including elevated commission rates (up to 25%), privileged wholesale pricing, exclusive training resources, priority access to new product launches, and the opportunity to develop their own Ambassador network.',
  },
  {
    question: 'How does the PUXX wholesale program operate?',
    answer:
      'Authorized Distributors can place wholesale orders through a dedicated portal in their dashboard. These orders feature volume-based pricing advantages and are delivered directly to the Distributor with discreet, professional packaging suitable for further distribution.',
  },
  {
    question: 'What is the ideal storage method for PUXX products?',
    answer:
      'To preserve the exceptional quality and flavor profile of PUXX pouches, store them in a cool, dry place away from direct sunlight. Our premium packaging is designed to maintain freshness, but proper storage ensures the optimal experience with every pouch.',
  },
];

export default function FAQPage() {
  return (
    <Layout>
      <FAQSchema faqs={faqData} />
      <div className="relative overflow-hidden bg-dark-900 py-24 text-white">
        {/* Background Elements */}
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gold-500/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-gold-500/5 blur-3xl"></div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-gold-500/20 px-4 py-1.5 text-sm font-medium text-gold-500">
              Knowledge Center
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              <span className="bg-gradient-gold bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-300">
              Find answers to common inquiries about PUXX premium nicotine pouches, our ambassador
              program, and everything you need to know about our products.
            </p>
          </div>

          <div className="space-y-8">
            {faqData.map((item, index) => (
              <div
                key={index}
                className="hover:shadow-gold/5 transform rounded-xl border border-gold-500/10 bg-dark-800/70 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-gold-500/20"
              >
                <h2 className="mb-3 text-xl font-bold text-gold-500">{item.question}</h2>
                <p className="leading-relaxed text-gray-300">{item.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-xl border border-gold-500/10 bg-dark-800/50 p-8 text-center backdrop-blur-sm">
            <h3 className="mb-4 text-xl font-bold text-white">Still have questions?</h3>
            <p className="mb-6 text-gray-300">
              Our customer support team is available to assist you with any additional inquiries.
            </p>
            <a
              href="/contact"
              className="group inline-flex items-center justify-center rounded-md bg-gold-500 px-6 py-3 text-base font-medium text-dark-900 shadow-gold transition-all duration-300 hover:bg-gold-400"
            >
              <span>Contact Support</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}

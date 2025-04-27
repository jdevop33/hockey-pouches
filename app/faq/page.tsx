'use client';

import React from 'react';
import Layout from '../components/layout/NewLayout';
import FAQSchema from '../components/FAQSchema';

const faqData = [
  {
    question: 'What are PUXX nicotine pouches?',
    answer:
      'PUXX makes premium tobacco-free nicotine pouches with quality you can feel. Our products deliver consistent satisfaction without smoke or spit, and customers tell us they notice the difference from the very first use.',
  },
  {
    question: 'How do I use PUXX pouches?',
    answer: `Simply place a pouch between your gum and upper lip. The nicotine absorbs through your gum, giving you a smooth, controlled experience. No need to chew or spit. When you're done, just throw the pouch away responsibly.`,
  },
  {
    question: 'What makes PUXX better than other nicotine pouches?',
    answer:
      'The difference is in the details. We use only medical-grade ingredients, precise manufacturing, and better flavors. Over 90% of customers who try PUXX tell us they refuse to go back to other brands because of our cleaner experience and more consistent quality.',
  },
  {
    question: 'Where does PUXX ship to?',
    answer:
      'We currently serve all of Canada with fulfillment centers in Vancouver, Calgary, Edmonton, and Toronto for fast delivery. Your order ships in discreet packaging that protects product freshness from our door to yours.',
  },
  {
    question: 'How long does shipping take?',
    answer:
      "Most orders arrive in 2-5 business days, depending on your location and nearest fulfillment center. You'll get tracking info as soon as your order ships so you can follow its journey right to your door.",
  },
  // --- Referral Program FAQs ---
  {
    question: 'How does the PUXX Ambassador program work?',
    answer:
      'Our Ambassador program lets you earn money by sharing PUXX with others. You get a unique link to share, and when people buy through your link, you earn commissions on their first purchase and all future orders too. Many of our Ambassadors earn enough to cover their own PUXX purchases and then some!',
  },
  {
    question: 'How do I get my Ambassador link?',
    answer:
      'It\'s simple! After creating your PUXX account, go to your dashboard and click "Referrals." Your personal link is right there, ready to share via text, email, social media, or however you prefer. Setting up takes less than a minute.',
  },
  {
    question: 'What commission do PUXX Ambassadors earn?',
    answer:
      'You start earning 10% on all purchases made through your link (calculated before taxes and shipping). Our top Ambassadors qualify for higher rates up to 15% and receive special perks like early access to new products.',
  },
  {
    question: 'How do I use my earned commissions?',
    answer:
      "Commissions go directly to your PUXX account. You can use them for future purchases or cash out via e-Transfer once you reach $50. Most cash-out requests process within 5-7 business days, and we'll notify you when your money is on the way.",
  },
  {
    question: 'How do I become a PUXX Distributor?',
    answer:
      'Becoming a Distributor starts with a simple application in your dashboard. Distributors maintain monthly sales targets and receive comprehensive support. Hundreds of our customers have successfully built profitable distribution businesses with our products and support system.',
  },
  {
    question: 'What benefits do PUXX Distributors receive?',
    answer:
      'Distributors enjoy premium benefits including higher commission rates (up to 25%), wholesale pricing, exclusive training, first access to new products, and the ability to build their own Ambassador network. Some of our top Distributors have turned PUXX into their primary business.',
  },
  {
    question: 'How does the wholesale program work?',
    answer:
      'Authorized Distributors place wholesale orders through a special portal in their dashboard. These orders come with volume-based discounts and ship directly to you in professional packaging ready for distribution. Our fastest-growing Distributors typically start with smaller orders and scale up as they build customer relationships.',
  },
  {
    question: "What's the best way to store PUXX products?",
    answer:
      'To keep your PUXX pouches fresh and flavorful, store them in a cool, dry place away from direct sunlight. Our premium packaging is designed to maintain freshness for months, but proper storage ensures you get the best experience from every pouch, every time.',
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

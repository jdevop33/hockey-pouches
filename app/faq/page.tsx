'use client';

import React from 'react';
import Layout from '../components/layout/NewLayout'; // Adjust layout import as needed
import FAQSchema from '../components/FAQSchema'; // Assuming you might have/want an FAQ schema component

const faqData = [
  {
    question: 'What are Hockey Puxx nicotine pouches?',
    answer:
      'Hockey Puxx are tobacco-free nicotine pouches designed for hockey players and fans, providing a discreet and convenient way to use nicotine without smoke or spit.',
  },
  {
    question: 'How do I use the pouches?',
    // Fixed the string literal below using backticks
    answer: `Simply place a pouch between your gum and lip. The nicotine is absorbed through the lining of your mouth. There's no need to chew or spit. Dispose of the used pouch responsibly.`,
  },
  {
    question: 'Are these products safe?',
    answer:
      'While tobacco-free nicotine pouches are considered a harm reduction alternative to smoking or chewing tobacco, they still contain nicotine, which is an addictive chemical. They are intended for adult nicotine users only.',
  },
  {
    question: 'Where do you ship?',
    answer:
      'We currently ship across Canada. Orders are typically fulfilled from the nearest distribution center (Vancouver, Calgary, Edmonton, Toronto).',
  },
  {
    question: 'How long does shipping take?',
    answer:
      'Shipping times vary depending on your location and the fulfillment center. You will receive tracking information once your order ships.',
  },
  // --- Referral Program FAQs ---
  {
    question: 'How does the referral program work?',
    answer:
      'Our referral program allows you to earn commissions by sharing your unique referral link with friends, family, and followers. When someone makes a purchase using your link, you earn a commission on their order and on future orders they place.',
  },
  {
    question: 'How do I get my referral code/link?',
    answer:
      'After creating an account, you can find your unique referral code and link in your dashboard under the "Referrals" section. You can share this link via email, social media, or text message.',
  },
  {
    question: 'How do I earn commissions?',
    answer:
      'You earn commissions when someone makes a purchase using your referral link. The standard commission rate is 10% of the purchase value. Commissions are calculated on the product price before taxes and shipping.',
  },
  {
    question: 'How can I use my earned commissions?',
    answer:
      'Commissions are added to your account balance and can be used for future purchases or withdrawn via e-Transfer once you reach a minimum balance of $50. Commission withdrawals are processed within 5-7 business days.',
  },
  {
    question: 'How do I become a Distributor?',
    answer:
      'To become a Distributor, you need to apply through your dashboard. Distributors need to maintain a minimum monthly sales volume and meet certain performance criteria. Contact our support team for more information about the application process.',
  },
  {
    question: 'What are the benefits of being a Distributor?',
    answer:
      'Distributors enjoy higher commission rates (up to 25%), access to wholesale pricing, exclusive training and support, early access to new products, and the ability to build their own team of referrers.',
  },
  {
    question: 'How does wholesale ordering work?',
    answer:
      'Distributors can place wholesale orders through their dashboard. Wholesale orders have minimum quantity requirements and offer significant discounts compared to retail prices. Wholesale orders are shipped directly to the Distributor for further distribution.',
  },
];

export default function FAQPage() {
  return (
    <Layout>
      <FAQSchema faqs={faqData} mainEntity="Hockey Pouches FAQ" />
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            Frequently Asked Questions
          </h1>

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
            <a
              href="/contact"
              className="text-primary-600 hover:text-primary-700 mt-2 inline-block font-medium"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}

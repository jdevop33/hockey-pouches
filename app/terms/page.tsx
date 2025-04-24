import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Terms of Service</h1>
      
      <div className="prose prose-lg max-w-none">
        <p>
          Welcome to Hockey Pouches. By accessing or using our website, you agree to be bound by these Terms of Service.
        </p>
        
        <h2>1. Eligibility</h2>
        <p>
          You must be at least 21 years of age to use our services or purchase products from our website. 
          By using our services, you represent and warrant that you are at least 21 years old.
        </p>
        
        <h2>2. Product Information</h2>
        <p>
          We strive to provide accurate product information, but we do not warrant that product descriptions or other content 
          is accurate, complete, reliable, current, or error-free. If a product offered by us is not as described, your sole remedy 
          is to return it in unused condition.
        </p>
        
        <h2>3. Pricing and Payment</h2>
        <p>
          All prices are shown in Canadian dollars and do not include taxes or shipping fees, which will be added at checkout. 
          We reserve the right to change prices at any time. Payment must be made at the time of purchase.
        </p>
        
        <h2>4. Shipping and Delivery</h2>
        <p>
          We ship to addresses within Canada only. Delivery times are estimates and not guaranteed. Risk of loss and title for 
          items purchased pass to you upon delivery of the items to the carrier.
        </p>
        
        <h2>5. Returns and Refunds</h2>
        <p>
          We accept returns within 30 days of delivery for unused and unopened products. Refunds will be issued to the original 
          payment method. Shipping costs are non-refundable.
        </p>
        
        <h2>6. Account Security</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account information and password. You agree to accept 
          responsibility for all activities that occur under your account.
        </p>
        
        <h2>7. Intellectual Property</h2>
        <p>
          All content on our website, including text, graphics, logos, images, and software, is the property of Hockey Pouches 
          or its content suppliers and is protected by Canadian and international copyright laws.
        </p>
        
        <h2>8. Limitation of Liability</h2>
        <p>
          Hockey Pouches will not be liable for any indirect, incidental, special, consequential, or punitive damages arising 
          out of or relating to your use of our services or products.
        </p>
        
        <h2>9. Governing Law</h2>
        <p>
          These Terms of Service shall be governed by and construed in accordance with the laws of the Province of Ontario, 
          without giving effect to any principles of conflicts of law.
        </p>
        
        <h2>10. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms of Service at any time. Your continued use of our services following the 
          posting of changes constitutes your acceptance of such changes.
        </p>
        
        <p className="mt-8">
          Last updated: June 1, 2023
        </p>
        
        <div className="mt-8">
          <Link href="/privacy" className="text-primary-600 hover:text-primary-800">
            View our Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}

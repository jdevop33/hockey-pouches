import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p>
          At Hockey Pouches, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
          and safeguard your information when you visit our website or make a purchase.
        </p>
        
        <h2>1. Information We Collect</h2>
        <p>
          We collect personal information that you voluntarily provide to us when you register on our website, 
          express interest in obtaining information about us or our products, or otherwise contact us. This information may include:
        </p>
        <ul>
          <li>Name</li>
          <li>Email address</li>
          <li>Mailing address</li>
          <li>Phone number</li>
          <li>Date of birth</li>
          <li>Payment information</li>
          <li>Order history</li>
        </ul>
        
        <h2>2. How We Use Your Information</h2>
        <p>
          We use the information we collect to:
        </p>
        <ul>
          <li>Process and fulfill your orders</li>
          <li>Communicate with you about your orders, products, and services</li>
          <li>Provide customer support</li>
          <li>Improve our website and services</li>
          <li>Send you marketing communications (if you opt in)</li>
          <li>Comply with legal obligations</li>
          <li>Detect and prevent fraud</li>
        </ul>
        
        <h2>3. Sharing Your Information</h2>
        <p>
          We may share your information with:
        </p>
        <ul>
          <li>Service providers who help us operate our business</li>
          <li>Payment processors to complete transactions</li>
          <li>Shipping companies to deliver your orders</li>
          <li>Legal authorities when required by law</li>
        </ul>
        <p>
          We do not sell your personal information to third parties.
        </p>
        
        <h2>4. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal information. 
          However, no method of transmission over the Internet or electronic storage is 100% secure, so we cannot 
          guarantee absolute security.
        </p>
        
        <h2>5. Cookies and Tracking Technologies</h2>
        <p>
          We use cookies and similar tracking technologies to track activity on our website and hold certain information. 
          You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
        </p>
        
        <h2>6. Age Restrictions</h2>
        <p>
          Our website and services are not intended for individuals under the age of 21. We do not knowingly collect 
          personal information from children under 21. If we learn we have collected personal information from a child 
          under 21, we will delete that information.
        </p>
        
        <h2>7. Your Rights</h2>
        <p>
          Depending on your location, you may have certain rights regarding your personal information, such as:
        </p>
        <ul>
          <li>Access to your personal information</li>
          <li>Correction of inaccurate information</li>
          <li>Deletion of your information</li>
          <li>Restriction of processing</li>
          <li>Data portability</li>
          <li>Objection to processing</li>
        </ul>
        <p>
          To exercise these rights, please contact us using the information provided below.
        </p>
        
        <h2>8. Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
          Privacy Policy on this page and updating the "Last updated" date.
        </p>
        
        <h2>9. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at:
        </p>
        <p>
          Email: privacy@hockeypouches.com<br />
          Phone: 1-800-123-4567<br />
          Address: 123 Main Street, Toronto, ON M5V 1A1, Canada
        </p>
        
        <p className="mt-8">
          Last updated: June 1, 2023
        </p>
        
        <div className="mt-8">
          <Link href="/terms" className="text-primary-600 hover:text-primary-800">
            View our Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}

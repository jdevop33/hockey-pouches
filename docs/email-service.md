# Email Service Implementation with Mailgun

## Overview

The application uses Mailgun for email delivery through the Nodemailer library. This implementation allows for reliable transactional emails like order confirmations, shipping notices, and contact form submissions.

## Configuration

Email service credentials are stored in environment variables:

```
MAILGUN_API_KEY=your-api-key
MAILGUN_DOMAIN=mg.yourdomain.com
DEFAULT_FROM_EMAIL="Your App <noreply@mg.yourdomain.com>"
CONTACT_EMAIL=contact@yourdomain.com
```

## Email Types

The system supports the following email types:

1. **Contact Form Submissions**: When a user submits the contact form, an email is sent to the store admin with the user's message and contact information.

2. **Order Confirmations**: When a user completes an order, a confirmation email is sent with order details including items, pricing, and shipping address.

3. **Shipping Notifications**: When an order is marked as shipped, a notification email is sent with tracking information.

## Implementation Files

- `app/lib/email.ts`: Core email sending functionality
- `app/lib/email-templates.ts`: HTML email templates and styling
- `app/api/contact/route.ts`: API endpoint for contact form submissions
- `app/api/orders/route.ts`: Order creation includes order confirmation emails
- `app/api/admin/orders/[orderId]/ship/route.ts`: Shipping notifications

## Usage Examples

### Sending a Contact Form Email

```typescript
import { sendContactFormEmail } from '@/app/lib/email';

await sendContactFormEmail(
  'John Doe',
  'john@example.com',
  'I have a question about your products',
  '555-123-4567',
  'Hockey Team A'
);
```

### Sending an Order Confirmation

```typescript
import { sendOrderConfirmationEmail } from '@/app/lib/email';

await sendOrderConfirmationEmail({
  customerEmail: 'customer@example.com',
  customerName: 'Jane Smith',
  orderId: '1001',
  orderTotal: 99.95,
  orderItems: [
    { name: 'Product A', price: 49.95, quantity: 1 },
    { name: 'Product B', price: 25.0, quantity: 2 },
  ],
  shippingAddress: {
    firstName: 'Jane',
    lastName: 'Smith',
    address1: '123 Main St',
    city: 'Vancouver',
    province: 'BC',
    postalCode: 'V6B 1A1',
    country: 'Canada',
  },
});
```

### Sending a Shipping Confirmation

```typescript
import { sendShippingConfirmationEmail } from '@/app/lib/email';

await sendShippingConfirmationEmail({
  customerEmail: 'customer@example.com',
  customerName: 'Jane Smith',
  orderId: '1001',
  trackingNumber: '123456789',
  trackingUrl: 'https://track.carrier.com/123456789',
});
```

## Troubleshooting

If emails are not being sent:

1. Check that the Mailgun API key and domain are correctly configured
2. Verify that the DNS records for your Mailgun domain are properly set up
3. Check application logs for any errors during email sending
4. Ensure your Mailgun account is active and not in sandbox mode
5. Test the SMTP connection directly if needed

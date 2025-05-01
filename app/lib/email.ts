import { emailWrapper } from './email-templates';

type EmailOptions = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
};

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

/**
 * Default sender address
 */
const DEFAULT_FROM_EMAIL =
  process.env.DEFAULT_FROM_EMAIL || 'Hockey Pouches <noreply@mg.nicotinetins.com>';

/**
 * Mailgun configuration
 */
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || 'mg.nicotinetins.com';
const MAILGUN_API_KEY =
  process.env.MAILGUN_API_KEY || 'b77417511d18b603a630256a5320b25e-10b6f382-f82c2ce3';
const MAILGUN_API_URL = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`;

/**
 * Sends an email using Mailgun API directly with fetch
 * @param options Email options including recipients, subject, and content
 * @returns Promise that resolves with the send info
 */
export const sendEmail = async (options: EmailOptions) => {
  const { to, subject, text, html, from = DEFAULT_FROM_EMAIL } = options;

  try {
    // Create form data
    const formData = new URLSearchParams();
    $1?.$2('from', from);
    $1?.$2('subject', subject);

    // Add recipients
    if (Array.isArray(to)) {
      to.forEach(recipient => formData.append('to', recipient));
    } else {
      formData.append('to', to);
    }

    // Add content
    if (text) formData.append('text', text);
    if (html) formData.append('html', html);

    // Basic auth credentials need to be base64 encoded
    const authHeader = `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}`;

    // Send request to Mailgun API
    const response = await fetch(MAILGUN_API_URL, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Mailgun API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const result = await response.json();
    
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Sends a contact form submission email
 * @param name Contact name
 * @param email Contact email
 * @param message Contact message
 * @param phone Optional phone number
 * @param company Optional company name
 * @returns Promise with send result
 */
export const sendContactFormEmail = async (
  name: string,
  email: string,
  message: string,
  phone?: string,
  company?: string
) => {
  const contactEmail =
    process.env.CONTACT_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@nicotinetins.com';

  const htmlContent = emailWrapper(`
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
    ${company ? `<p><strong>Team/Club:</strong> ${company}</p>` : ''}
    <p><strong>Message:</strong></p>
    <div style="padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
      ${message.replace(/\n/g, '<br />')}
    </div>
  `);

  const textContent = `
    New Contact Form Submission
    
    Name: ${name}
    Email: ${email}
    ${phone ? `Phone: ${phone}\n` : ''}
    ${company ? `Team/Club: ${company}\n` : ''}
    Message:
    ${message}
  `;

  return sendEmail({
    to: contactEmail,
    subject: `New contact form submission from ${name}`,
    html: htmlContent,
    text: textContent,
    from: `Contact Form <noreply@mg.nicotinetins.com>`,
  });
};

/**
 * Sends an order confirmation email to a customer
 * @param options Order details
 * @returns Promise with send result
 */
export const sendOrderConfirmationEmail = async (options: {
  customerEmail: string;
  customerName: string;
  orderId: string;
  orderTotal: number;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod?: 'etransfer' | 'btc' | 'credit-card';
}) => {
  const {
    customerEmail,
    customerName,
    orderId,
    orderTotal,
    orderItems,
    shippingAddress,
    paymentMethod,
  } = options;

  // Build item list for email
  const itemsList = orderItems
    .map(
      item =>
        `<tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`
    )
    .join('');

  // Payment instructions based on method
  let paymentInstructions = '';

  if (paymentMethod) {
    paymentInstructions = `
    <div class="info-box" style="margin-top: 20px; background-color: #f0f7ff; padding: 15px; border-left: 4px solid #0047AB;">
      <h3 style="margin-top: 0; color: #0047AB;">Payment Instructions</h3>`;

    if (paymentMethod === 'etransfer') {
      paymentInstructions += `
        <p><strong>Interac e-Transfer Instructions:</strong></p>
        <ol>
          <li>Log in to your online banking</li>
          <li>Send an Interac e-Transfer to: <strong>payments@hockeypouches.com</strong></li>
          <li>Amount: <strong>$${orderTotal.toFixed(2)}</strong></li>
          <li>Important: Include your order number <strong>#${orderId}</strong> in the message field</li>
        </ol>
        <p>Your order will be processed once payment is confirmed.</p>`;
    } else if (paymentMethod === 'btc') {
      paymentInstructions += `
        <p><strong>Bitcoin Payment Instructions:</strong></p>
        <p>Please send exactly <strong>$${orderTotal.toFixed(2)} CAD</strong> worth of Bitcoin to the following address:</p>
        <p style="background-color: #eee; padding: 10px; font-family: monospace; word-break: break-all;">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</p>
        <p>Important: After sending payment, please email a screenshot of the transaction to <a href="mailto:payments@hockeypouches.com">payments@hockeypouches.com</a> with your order number <strong>#${orderId}</strong>.</p>`;
    } else if (paymentMethod === 'credit-card') {
      paymentInstructions += `
        <p><strong>Credit Card Payment:</strong></p>
        <p>Please complete your payment by clicking the button below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="https://hockeypouches.com/payment/${orderId}" style="background-color: #0047AB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Complete Payment</a>
        </div>
        <p>Your order will be processed immediately after successful payment.</p>`;
    }

    paymentInstructions += `
    </div>`;
  }

  const htmlContent = emailWrapper(`
    <h2>Thank You for Your Order!</h2>
    <p>Hello ${customerName},</p>
    <p>We're excited to confirm your order with Hockey Pouches. Here's a summary of your purchase:</p>
    
    <div class="info-box">
      <p><strong>Order Number:</strong> ${orderId}</p>
      <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Order Total:</strong> $${orderTotal.toFixed(2)}</p>
    </div>
    
    ${paymentInstructions}
    
    <h3>Order Items</h3>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsList}
      </tbody>
    </table>
    
    <h3>Shipping Address</h3>
    <p>
      ${shippingAddress.firstName} ${shippingAddress.lastName}<br />
      ${shippingAddress.address1}<br />
      ${shippingAddress.address2 ? `${shippingAddress.address2}<br />` : ''}
      ${shippingAddress.city}, ${shippingAddress.province} ${shippingAddress.postalCode}<br />
      ${shippingAddress.country}
    </p>
    
    <p>We'll notify you once your order has been shipped. If you have any questions, please contact our customer service.</p>
    
    <p>Thank you for choosing Hockey Pouches!</p>
  `);

  return sendEmail({
    to: customerEmail,
    subject: `Order Confirmation #${orderId}`,
    html: htmlContent,
  });
};

/**
 * Sends a shipping confirmation email to a customer
 * @param options Shipping details
 * @returns Promise with send result
 */
export const sendShippingConfirmationEmail = async (options: {
  customerEmail: string;
  customerName: string;
  orderId: string;
  trackingNumber?: string;
  trackingUrl?: string;
}) => {
  const { customerEmail, customerName, orderId, trackingNumber, trackingUrl } = options;

  const htmlContent = emailWrapper(`
    <h2>Your Order Has Been Shipped!</h2>
    <p>Hello ${customerName},</p>
    <p>Great news! Your order has been shipped and is on its way to you.</p>
    
    <div class="info-box">
      <p><strong>Order Number:</strong> ${orderId}</p>
      <p><strong>Shipped Date:</strong> ${new Date().toLocaleDateString()}</p>
      ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
      ${trackingUrl ? `<p><strong>Track Your Package:</strong> <a href="${trackingUrl}">Click here</a></p>` : ''}
    </div>
    
    <p>If you have any questions about your shipment, please don't hesitate to contact our customer service team.</p>
    
    <p>Thank you for choosing Hockey Pouches!</p>
  `);

  return sendEmail({
    to: customerEmail,
    subject: `Your Order #${orderId} Has Been Shipped`,
    html: htmlContent,
  });
};

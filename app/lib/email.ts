import nodemailer from 'nodemailer';
import { createMailgunTransport } from 'nodemailer-mailgun-transport';
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
 * Mailgun configuration for sending emails
 */
const mailgunAuth = {
  auth: {
    domain: process.env.MAILGUN_DOMAIN || 'mg.nicotinetins.com',
    api_key: process.env.MAILGUN_API_KEY || 'b77417511d18b603a630256a5320b25e-10b6f382-f82c2ce3',
  },
};

/**
 * Nodemailer transporter instance for Mailgun
 */
const transport = createMailgunTransport(mailgunAuth);
const transporter = nodemailer.createTransport(transport);

/**
 * Default sender address
 */
const DEFAULT_FROM_EMAIL =
  process.env.DEFAULT_FROM_EMAIL || 'Hockey Pouches <noreply@mg.nicotinetins.com>';

/**
 * Sends an email using Mailgun
 * @param options Email options including recipients, subject, and content
 * @returns Promise that resolves with the send info
 */
export const sendEmail = async (options: EmailOptions) => {
  const { to, subject, text, html, from = DEFAULT_FROM_EMAIL } = options;

  try {
    const result = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
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
}) => {
  const { customerEmail, customerName, orderId, orderTotal, orderItems, shippingAddress } = options;

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

  const htmlContent = emailWrapper(`
    <h2>Thank You for Your Order!</h2>
    <p>Hello ${customerName},</p>
    <p>We're excited to confirm your order with Hockey Pouches. Here's a summary of your purchase:</p>
    
    <div class="info-box">
      <p><strong>Order Number:</strong> ${orderId}</p>
      <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Order Total:</strong> $${orderTotal.toFixed(2)}</p>
    </div>
    
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

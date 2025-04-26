import { NextRequest, NextResponse } from 'next/server';
import { sendContactFormEmail } from '../../lib/email';
import { isValidEmail } from '../../lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const data = await request.json();
    const { name, email, message, phone, company, recaptchaToken } = data;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address format' },
        { status: 400 }
      );
    }

    // Validate recaptcha token
    if (!recaptchaToken) {
      return NextResponse.json(
        { success: false, message: 'reCAPTCHA verification failed' },
        { status: 400 }
      );
    }

    // Optional: Verify recaptcha token with Google's API for extra security
    // This would be a good production enhancement

    // Send the email using our Mailgun service
    await sendContactFormEmail(name, email, message, phone, company);

    // Return success response
    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error in contact form submission:', error);

    // Return error response
    return NextResponse.json(
      { success: false, message: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}

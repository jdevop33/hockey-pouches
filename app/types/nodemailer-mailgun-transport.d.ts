declare module 'nodemailer-mailgun-transport' {
  import { Transport, TransportOptions } from 'nodemailer';

  interface MailgunAuthOptions {
    auth: {
      api_key: string;
      domain: string;
    };
  }

  export function createMailgunTransport(options: MailgunAuthOptions): Transport<TransportOptions>;
}

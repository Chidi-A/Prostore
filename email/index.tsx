import { Resend } from 'resend';
import { SENDER_EMAIL, APP_NAME } from '@/lib/constants';
import { Order } from '@/types';
import PurchaseReceiptEmail from './purchase-receipt';
import { render } from '@react-email/render';

export const sendPurchaseReceipt = async ({ order }: { order: Order }) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      'RESEND_API_KEY is not configured in environment variables'
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const emailHtml = await render(PurchaseReceiptEmail({ order }));

    const result = await resend.emails.send({
      from: `${APP_NAME} <${SENDER_EMAIL}>`,
      to: order.user.email,
      subject: `Order Confirmation ${order.id}`,
      html: emailHtml,
    });

    // Check if Resend returned an error
    if (result.error) {
      throw new Error(`Resend API error: ${JSON.stringify(result.error)}`);
    }

    // Log the email ID for tracking
    console.log('Email sent with ID:', result.data?.id);

    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

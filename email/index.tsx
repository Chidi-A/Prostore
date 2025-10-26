import { Resend } from 'resend';
import { SENDER_EMAIL, APP_NAME } from '@/lib/constants';
import { Order } from '@/types';
import PurchaseReceiptEmail from './purchase-receipt';
import { render } from '@react-email/render';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPurchaseReceipt = async ({ order }: { order: Order }) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      'RESEND_API_KEY is not configured in environment variables'
    );
  }

  try {
    const emailHtml = await render(PurchaseReceiptEmail({ order }));

    const result = await resend.emails.send({
      from: `${APP_NAME} <${SENDER_EMAIL}>`,
      to: order.user.email,
      subject: `Order Confirmation ${order.id}`,
      html: emailHtml,
    });

    return result;
  } catch (error) {
    throw error;
  }
};

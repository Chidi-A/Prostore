import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateOrderToPaid } from '@/lib/actions/order.actions';

export async function POST(request: NextRequest) {
  // Build the webhook event
  const event = await Stripe.webhooks.constructEvent(
    await request.text(),
    request.headers.get('stripe-signature') as string,
    process.env.STRIPE_WEBHOOK_SECRET as string
  );

  // Check for successful payment
  if (event.type === 'charge.succeeded') {
    const { object } = event.data;

    // Update order status
    await updateOrderToPaid({
      orderId: object.metadata.orderId,
      paymentResult: {
        id: object.id,
        status: object.status as string,
        pricePaid: (object.amount / 100).toFixed(),
        email_address: object.billing_details.email || '',
      },
    });
    return NextResponse.json({ message: 'Order updated to paid' });
  }
  return NextResponse.json({ message: 'Event is not charge.succeeded' });
}

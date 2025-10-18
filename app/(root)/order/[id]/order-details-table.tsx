'use client';

import { Order } from '@/types';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import Image from 'next/image';
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import {
  createPaypalOrder,
  approvePaypalOrder,
  deliverOrder,
} from '@/lib/actions/order.actions';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useTransition } from 'react';

const OrderDetailsTable = ({
  order,
  paypalClientId,
  isAdmin,
  updateOrderToPaid,
  deliverOrder,
}: {
  order: Order;
  paypalClientId: string;
  isAdmin: boolean;
  updateOrderToPaid: (
    orderId: string
  ) => Promise<{ success: boolean; message: string }>;
  deliverOrder: (
    orderId: string
  ) => Promise<{ success: boolean; message: string }>;
}) => {
  const {
    id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,

    orderitems,
  } = order;

  const PrintLoadingState = () => {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();
    let status = '';

    if (isPending) {
      status = 'Loading Paypal...';
    } else if (isRejected) {
      status = 'Error loading Paypal...';
    }

    return status;
  };

  const handleCreatePaypalOrder = async () => {
    const response = await createPaypalOrder(order.id);
    if (!response.success) {
      toast.error(response.message);
    }
    return response.data;
  };

  const handleApprovePaypalOrder = async (data: { orderID: string }) => {
    const response = await approvePaypalOrder(order.id, data);
    if (response.success) {
      toast.success(response.message, {
        description: response.message,
      });
    } else {
      toast.error(response.message, {
        description: response.message,
      });
    }
  };

  // Button to mark as paid
  const MarkAsPaidButton = () => {
    const [isPending, startTransition] = useTransition();

    return (
      <Button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await updateOrderToPaid(order.id);
            if (!res?.success) {
              toast.error(res?.message);
              return;
            }

            toast.success(res?.message);
          })
        }
      >
        {isPending ? 'processing...' : 'Mark as Paid'}
      </Button>
    );
  };

  // Button to mark as delivered
  const MarkAsDeliveredButton = () => {
    const [isPending, startTransition] = useTransition();

    return (
      <Button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await deliverOrder(order.id);
            if (!res?.success) {
              toast.error(res?.message);
              return;
            }

            toast.success(res?.message);
          })
        }
      >
        {isPending ? 'processing...' : 'Mark as Delivered'}
      </Button>
    );
  };

  return (
    <>
      <h1 className="py-4 text-2l">Order {formatId(id)}</h1>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="col-span-2 space-4-y overflow-x-auto">
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Payment Method</h2>
              <p className="mb-2">{paymentMethod}</p>
              {isPaid ? (
                <Badge variant="secondary">
                  Paid at {formatDateTime(paidAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-white">
                  Not Paid
                </Badge>
              )}
            </CardContent>
          </Card>
          <Card className="my-2">
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Shipping Address</h2>
              <p>{shippingAddress.fullName}</p>
              <p className="mb-2">
                {shippingAddress.streetAddress}, {shippingAddress.city},{' '}
                {shippingAddress.postalCode}, {shippingAddress.country}
              </p>
              {isDelivered ? (
                <Badge variant="secondary">
                  Delivered at {formatDateTime(deliveredAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-white">
                  Not Delivered
                </Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderitems.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className="flex items-center"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          />
                          <span className="px-2">{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>{item.qty}</TableCell>
                      <TableCell>${item.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-4 gap-4 space-y-4">
              <div className="flex justify-between">
                <div>Items</div>
                <div>{formatCurrency(itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Tax</div>
                <div>{formatCurrency(taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Shipping</div>
                <div>{formatCurrency(shippingPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Total</div>
                <div>{formatCurrency(totalPrice)}</div>
              </div>
              {/*Paypal payment */}
              {!isPaid && paymentMethod === 'Paypal' && (
                <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                  <PrintLoadingState />
                  <PayPalButtons
                    createOrder={handleCreatePaypalOrder}
                    onApprove={handleApprovePaypalOrder}
                  />
                </PayPalScriptProvider>
              )}
              {/* COD payment */}
              {isAdmin && !isPaid && paymentMethod === 'CashOnDelivery' && (
                <MarkAsPaidButton />
              )}
              {isAdmin && isPaid && !isDelivered && <MarkAsDeliveredButton />}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsTable;

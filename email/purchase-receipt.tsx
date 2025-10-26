import { Order } from '@/types';
import {
  Html,
  Body,
  Container,
  Text,
  Head,
  Heading,
  Row,
  Column,
  Img,
  Preview,
  Section,
  Tailwind,
} from '@react-email/components';
import { formatCurrency } from '@/lib/utils';
import sampleData from '@/db/sample-data';
import { SERVER_URL } from '@/lib/constants';

PurchaseReceiptEmail.PreviewProps = {
  order: {
    id: crypto.randomUUID(),
    userId: '123',
    user: { name: 'John Doe', email: 'john.doe@example.com' },
    paymentMethod: 'PayPal',
    shippingAddress: {
      fullName: 'John Doe',
      streetAddress: '123 Main St',
      city: 'Anytown',
      postalCode: '12345',
      country: 'USA',
    },
    itemsPrice: '80',
    shippingPrice: '10',
    taxPrice: '10',
    createdAt: new Date(),
    totalPrice: '100',
    orderitems: sampleData.products.map((product) => ({
      productId: '123',
      orderId: '123',
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price.toString(),
      qty: 1,
    })),
    isPaid: true,
    paidAt: new Date(),
    isDelivered: true,
    deliveredAt: new Date(),
    paymentResult: {
      id: '123',
      status: 'completed',
      pricePaid: '100',
      email_address: 'john.doe@example.com',
    },
  },
} satisfies OrderInformationProps;

const dateFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'medium' });

type OrderInformationProps = {
  order: Order;
};

export default function PurchaseReceiptEmail({ order }: OrderInformationProps) {
  return (
    <Html>
      <Preview>Purchase Receipt</Preview>
      <Tailwind>
        <Head />
        <Body className="bg-white font-sans">
          <Container className="max-w-xl">
            <Heading>Purchase Receipt</Heading>
            <Section>
              <Row>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
                    Order ID
                  </Text>
                  <Text className="mt-0 mr-4">{order.id.toString()}</Text>
                </Column>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
                    Purchase Date
                  </Text>
                  <Text className="mt-0 mr-4">
                    {dateFormatter.format(order.createdAt)}
                  </Text>
                </Column>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
                    Price Paid
                  </Text>
                  <Text className="mt-0 mr-4">
                    {formatCurrency(order.totalPrice)}
                  </Text>
                </Column>
              </Row>
            </Section>
            <Section className="border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4">
              {order.orderitems.map((item) => (
                <Row key={item.productId} className="mt-8">
                  <Column className="w-20">
                    <Img
                      src={
                        item.image.startsWith('/')
                          ? `${SERVER_URL}${item.image}`
                          : item.image
                      }
                      alt={item.name}
                      width={80}
                      height={80}
                    />
                  </Column>
                  <Column className="align-top">
                    {item.name} x{item.qty}
                  </Column>
                  <Column align="right" className="align-top">
                    {formatCurrency(item.price)}
                  </Column>
                </Row>
              ))}
              {[
                { name: 'Items', price: order.itemsPrice },
                { name: 'Tax', price: order.taxPrice },
                { name: 'Shipping', price: order.shippingPrice },
                { name: 'Total', price: order.totalPrice },
              ].map(({ name, price }) => (
                <Row key={name} className="mt-8">
                  <Column align="right">{name}</Column>
                  <Column align="right" width={70} className="align-top">
                    <Text className="m-0">{formatCurrency(price)}</Text>
                  </Column>
                </Row>
              ))}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

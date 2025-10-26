import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '../lib/generated/prisma';
import ws from 'ws';

/*
// Sets up WebSocket connections, which enables Neon to use WebSocket communication.
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;
// Create the pool with proper configuration
// const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create the adapter with the pool
const adapter = new PrismaNeon({ connectionString });
*/

// Only use Neon adapter in production (Vercel)
// Only use Neon adapter when running on Vercel (not during local builds)
const isVercel = !!process.env.VERCEL || !!process.env.VERCEL_ENV;

let prismaClient: PrismaClient;

if (isVercel) {
  // Vercel: Use Neon adapter for serverless
  neonConfig.webSocketConstructor = ws;
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaNeon({ connectionString });
  prismaClient = new PrismaClient({ adapter });
} else {
  // Development/Local: Use standard PrismaClient for local PostgreSQL
  prismaClient = new PrismaClient();
}

// Extends the PrismaClient with a custom result transformer to convert the price and rating fields to strings.
export const prisma = prismaClient.$extends({
  result: {
    product: {
      price: {
        compute(product) {
          return product.price.toString();
        },
      },
      rating: {
        compute(product) {
          return product.rating.toString();
        },
      },
    },
    cart: {
      itemsPrice: {
        needs: {
          itemsPrice: true,
        },
        compute(cart) {
          return cart.itemsPrice.toString();
        },
      },
      shippingPrice: {
        needs: {
          shippingPrice: true,
        },
        compute(cart) {
          return cart.shippingPrice.toString();
        },
      },
      taxPrice: {
        needs: {
          taxPrice: true,
        },
        compute(cart) {
          return cart.taxPrice.toString();
        },
      },
      totalPrice: {
        needs: {
          totalPrice: true,
        },
        compute(cart) {
          return cart.totalPrice.toString();
        },
      },
    },
    order: {
      itemsPrice: {
        needs: {
          itemsPrice: true,
        },
        compute(order) {
          return order.itemsPrice.toString();
        },
      },
      shippingPrice: {
        needs: {
          shippingPrice: true,
        },
        compute(order) {
          return order.shippingPrice.toString();
        },
      },
      taxPrice: {
        needs: {
          taxPrice: true,
        },
        compute(order) {
          return order.taxPrice.toString();
        },
      },
      totalPrice: {
        needs: {
          totalPrice: true,
        },
        compute(order) {
          return order.totalPrice.toString();
        },
      },
    },
    orderItem: {
      price: {
        compute(cart) {
          return cart.price.toString();
        },
      },
    },
  },
});

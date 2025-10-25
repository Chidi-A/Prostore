'use server';

import { prisma } from '@/db/prisma';
import { insertReviewSchema } from '../validators';
import { formatError, z, ZodError } from 'zod';
import { auth } from '@/auth';
import { revalidatePath } from 'next/dist/server/web/spec-extension/revalidate';

// Create and update review
export async function createUpdateReview(
  data: z.infer<typeof insertReviewSchema>
) {
  try {
    const session = await auth();
    if (!session) throw new Error('User not found');

    // Validate and store the review
    const review = insertReviewSchema.parse({
      ...data,
      userId: session.user.id,
    });

    // Get product that is being reviewed
    const product = await prisma.product.findFirst({
      where: { id: review.productId },
    });
    if (!product) throw new Error('Product not found');

    // Check if the user has already reviewed the product
    const reviewExists = await prisma.review.findFirst({
      where: { productId: review.productId, userId: review.userId },
    });

    await prisma.$transaction(async (tx) => {
      if (reviewExists) {
        // Update the review
        await tx.review.update({
          where: { id: reviewExists.id },
          data: {
            rating: review.rating,
            title: review.title,
            description: review.description,
          },
        });
      } else {
        // Create the review
        await tx.review.create({ data: review });
      }

      // Get avg rating
      const avgRating = await tx.review.aggregate({
        _avg: { rating: true },
        where: { productId: review.productId },
      });

      // Get number of reviews
      const numReviews = await tx.review.count({
        where: { productId: review.productId },
      });

      // Update the product rating and numReviews
      await tx.product.update({
        where: { id: review.productId },
        data: { rating: avgRating._avg.rating || 0, numReviews },
      });
    });

    revalidatePath(`/product/${product.slug}`);

    return { success: true, message: 'Review created successfully' };
  } catch (error) {
    return { success: false, message: formatError(error as ZodError) };
  }
}

// Get all reviews for a product
export async function getReviews({ productId }: { productId: string }) {
  const data = await prisma.review.findMany({
    where: { productId: productId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return { data };
}

// Get a review written by the current user
export async function getReviewByProductId({
  productId,
}: {
  productId: string;
}) {
  const session = await auth();

  if (!session) throw new Error('User not found');

  return await prisma.review.findFirst({
    where: { productId: productId, userId: session.user.id },
  });
}

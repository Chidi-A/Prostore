'use client';

import { useEffect } from 'react';
import { Review } from '@/types';
import { useState } from 'react';
import Link from 'next/link';
import ReviewForm from './review-form';
import { getReviews } from '@/lib/actions/review.actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, User } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import Rating from '@/components/shared/product/rating';

const ReviewList = ({
  userId,
  productId,
  productSlug,
}: {
  userId: string;
  productId: string;
  productSlug: string;
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const loadReviews = async () => {
      const res = await getReviews({ productId });
      setReviews(res.data);
    };
    loadReviews();
  }, [productId]);

  //Reload reviews after a review is submitted
  const reload = async () => {
    const res = await getReviews({ productId });
    setReviews([...res.data]);
  };

  return (
    <div className="space-y-4">
      {reviews.length === 0 && (
        <div className="text-center text-muted-foreground">
          No reviews found
        </div>
      )}
      {userId ? (
        <ReviewForm
          userId={userId}
          productId={productId}
          onReviewSubmitted={reload}
        />
      ) : (
        <div>
          Please
          <Link
            href={`/sign-in?callbackUrl=/product/${productSlug}`}
            className="text-blue-500  px-2"
          >
            sign in
          </Link>
          to add a review
        </div>
      )}
      <div className="flex-col">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex-betweeen">
                <CardTitle>{review.title}</CardTitle>
                <CardDescription>{review.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 text-sm text-muted-foreground">
                <Rating value={review.rating} />
                <div className="flex items-center">
                  <User className="mr-1 h-3 w-3" />
                  {review.user ? review.user.name : 'Anonymous'}
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  {formatDateTime(review.createdAt).dateTime}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;

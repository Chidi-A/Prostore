'use client';

import { insertReviewSchema } from '@/lib/validators';
import { reviewFormDefaultValues } from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StarIcon } from 'lucide-react';
import {
  createUpdateReview,
  getReviewByProductId,
} from '@/lib/actions/review.actions';
import { toast } from 'sonner';

const ReviewForm = ({
  userId,
  productId,
  onReviewSubmitted,
}: {
  userId: string;
  productId: string;
  onReviewSubmitted?: () => void;
}) => {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof insertReviewSchema>>({
    resolver: zodResolver(insertReviewSchema) as Resolver<
      z.infer<typeof insertReviewSchema>
    >,
    defaultValues: reviewFormDefaultValues,
  });

  //Submit form handler
  const onSubmit: SubmitHandler<z.infer<typeof insertReviewSchema>> = async (
    values
  ) => {
    const res = await createUpdateReview({ ...values, productId, userId });
    if (!res?.success) {
      toast.error(res?.message as string);
      return;
    }

    setOpen(false);
    onReviewSubmitted?.();
    toast.success(res?.message as string);
  };

  //Open form handler
  const handleOpenForm = async () => {
    form.setValue('productId', productId);
    form.setValue('userId', userId);

    const review = await getReviewByProductId({ productId });

    if (review) {
      form.setValue('title', review.title);
      form.setValue('description', review.description);
      form.setValue('rating', review.rating);
    }
    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={handleOpenForm} variant="default">
        Add a review
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form method="post" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add a review</DialogTitle>
              <DialogDescription>
                Please leave a review for the product
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 5 }, (_, index) => (
                          <SelectItem
                            key={index}
                            value={(index + 1).toString()}
                          >
                            {index + 1}{' '}
                            <StarIcon className="inline-block w-4 h-4" />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewForm;

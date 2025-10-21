import ProductCard from '@/components/shared/product/product-card';
import { Button } from '@/components/ui/button';
import {
  getAllCategories,
  getAllProducts,
} from '@/lib/actions/product.actions';
import Link from 'next/link';

const prices = [
  { name: '$1 to $50', value: '1-50' },
  { name: '$51 to $100', value: '51-100' },
  { name: '$101 to $200', value: '101-200' },
  { name: '$201 to $500', value: '201-500' },
  { name: '$501 to $1000', value: '501-1000' },
];

const ratings = [4, 3, 2, 1];

const sortOrders = ['newest', 'lowest', 'highest', 'rating'];

export async function generateMetadata(props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
  }>;
}) {
  const {
    q = 'all',
    category = 'all',
    price = 'all',
    rating = 'all',
  } = await props.searchParams;

  const isQuerySet = q && q != 'all' && q.trim() !== '';
  const isCategorySet =
    category && category !== 'all' && category.trim() !== '';
  const isPriceSet = price && price !== 'all' && price.trim() !== '';
  const isRatingSet = rating && rating !== 'all' && rating.trim() !== '';

  if (isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
    return {
      title: `Search ${isQuerySet ? `for "${q}"` : ''} ${
        isCategorySet ? `in "${category}"` : ''
      } ${isPriceSet ? `for "${price}"` : ''} ${
        isRatingSet ? `for "${rating}"` : ''
      }`,
    };
  }

  return {
    title: 'Search',
    description: 'Search for products',
  };
}
const SearchPage = async (props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
  }>;
}) => {
  const {
    q = 'all',
    category = 'all',
    price = 'all',
    rating = 'all',
    sort = 'newest',
    page = '1',
  } = await props.searchParams;

  // Construct filter url
  const getFilterUrl = ({
    c,
    s,
    p,
    r,
    pg,
  }: {
    c?: string;
    s?: string;
    p?: string;
    r?: string;
    pg?: string;
  }) => {
    const params = { q, category, price, rating, sort, page };
    if (c) params.category = c;
    if (s) params.sort = s;
    if (p) params.price = p;
    if (r) params.rating = r;
    if (pg) params.page = pg;
    return `/search?${new URLSearchParams(params).toString()}`;
  };

  const products = await getAllProducts({
    query: q,
    category: category,
    price,
    rating,
    sort,
    page: Number(page),
  });

  const categories = await getAllCategories();

  return (
    <div className="grid md:grid-cols-5 gap-5">
      <div className="filter-links">
        {/* category links */}
        <div className="text-xl mb-2 mt-3">Department</div>
        <ul className="space-y-1">
          <li>
            <Link
              className={`${
                (category === 'all' || category === '') && 'font-bold'
              }`}
              href={getFilterUrl({ c: 'all' })}
            >
              Any
            </Link>
            {categories.map((x) => (
              <li key={x.category}>
                <Link
                  key={x.category}
                  className={`${category === x.category && 'font-bold'}`}
                  href={getFilterUrl({ c: x.category })}
                >
                  {x.category} ({x._count})
                </Link>
              </li>
            ))}
          </li>
        </ul>
        {/* price links */}
        <div className="text-xl mb-2 mt-8">Price</div>
        <ul className="space-y-1">
          <li>
            <Link
              className={`${price === 'all' && 'font-bold'}`}
              href={getFilterUrl({ p: 'all' })}
            >
              Any
            </Link>
            {prices.map((x) => (
              <li key={x.value}>
                <Link
                  key={x.value}
                  className={`${price === x.value && 'font-bold'}`}
                  href={getFilterUrl({ p: x.value })}
                >
                  {x.name}
                </Link>
              </li>
            ))}
          </li>
        </ul>

        {/* rating links */}
        <div className="text-xl mb-2 mt-8">Customer Rating</div>
        <ul className="space-y-1">
          <li>
            <Link
              className={`${rating === 'all' && 'font-bold'}`}
              href={getFilterUrl({ r: 'all' })}
            >
              Any
            </Link>
            {ratings.map((x) => (
              <li key={x}>
                <Link
                  key={x}
                  className={`${rating === x.toString() && 'font-bold'}`}
                  href={getFilterUrl({ r: `${x}` })}
                >
                  {x} Stars & up
                </Link>
              </li>
            ))}
          </li>
        </ul>
      </div>

      <div className="space-y-4 md:col-span-4">
        <div className="flex-between flex-col md:flex-row my-4">
          <div className="flex items-center">
            {q !== 'all' && q !== '' && 'Query:  ' + q}
            {category !== 'all' && category !== '' && ' Category:  ' + category}
            {price !== 'all' && ' Price:  ' + price}
            {rating !== 'all' && ' Rating:  ' + rating + ' stars & up'}
            &nbsp;
            {(q !== 'all' && q !== '') ||
            (category !== 'all' && category !== '') ||
            price !== 'all' ||
            (rating !== 'all' && ' | ') ? (
              <Button variant={'link'} asChild>
                <Link href="/search">Clear</Link>
              </Button>
            ) : null}
          </div>
          <div>
            Sort by{' '}
            {sortOrders.map((x) => (
              <Link
                key={x}
                className={`mx-2 ${sort === x && 'font-bold'}`}
                href={getFilterUrl({ s: x })}
              >
                {x}
              </Link>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {products.data.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No products found
            </div>
          ) : (
            products.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

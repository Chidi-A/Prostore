'use client';

import { Input } from '../ui/input';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const AdminSearch = () => {
  const pathname = usePathname();
  const formActionUrl = pathname.includes('/admin/users')
    ? '/admin/users'
    : pathname.includes('/admin/orders')
    ? '/admin/orders'
    : '/admin/products';

  const searchParams = useSearchParams();
  const [queryValue, setQueryValue] = useState<string>(
    searchParams.get('query') || ''
  );

  useEffect(() => {
    setQueryValue(searchParams.get('query') || '');
  }, [searchParams]);

  return (
    <form action={formActionUrl} method="GET">
      <Input
        name="query"
        type="search"
        placeholder="Search"
        value={queryValue}
        onChange={(e) => setQueryValue(e.target.value)}
        className="md:w-[100px] lg:w-[300px]"
      />
      <button className="sr-only" type="submit">
        Search
      </button>
    </form>
  );
};

export default AdminSearch;

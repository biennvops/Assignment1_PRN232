"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ProductGridProps {
  search?: string;
}

export function ProductGrid({ search = "" }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("limit", "12");
    const res = await fetch(`/api/products?${params}`);
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
      setPagination(data.pagination);
    } else {
      setProducts([]);
      setPagination(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-xl border border-primary-200 bg-white overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 rounded-xl border border-primary-200 bg-white">
        <p className="text-gray-600">No products found.</p>
        <Link href="/products/new" className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium">
          Add your first product
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group rounded-xl border border-primary-200 bg-white overflow-hidden hover:shadow-lg hover:border-primary-300 transition"
          >
            <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                  No image
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="font-semibold text-gray-900 group-hover:text-primary-600 truncate">
                {product.name}
              </h2>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">{product.description}</p>
              <p className="mt-2 font-semibold text-primary-600">${product.price.toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg border border-primary-200 bg-white disabled:opacity-50 hover:bg-primary-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg border border-primary-200 bg-white disabled:opacity-50 hover:bg-primary-50"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import { DeleteProductButton } from "./DeleteProductButton";
import { useAuth } from "./AuthContext";

interface Props {
  productId: string;
  productName: string;
}

export function ProductActions({ productId, productName }: Props) {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return null;
  }

  return (
    <div className="mt-8 flex flex-wrap gap-4">
      <Link
        href={`/products/${productId}/edit`}
        className="px-6 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
      >
        Edit product
      </Link>
      <DeleteProductButton productId={productId} productName={productName} />
    </div>
  );
}


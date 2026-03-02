"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  productId: string;
}

export function AddToCartButton({ productId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAdd = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to add to cart");
      }
    } catch (e: any) {
      setError(e.message || "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleAdd}
        disabled={loading}
        className="px-6 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
      >
        {loading ? "Adding…" : "Add to cart"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}


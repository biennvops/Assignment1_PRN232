"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CartProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: CartProduct;
  subtotal: number;
}

interface CartResponse {
  items: CartItem[];
  total: number;
}

export default function CartPage() {
  const [data, setData] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cart");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to load cart");
      }
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to update cart");
      }
      await fetchCart();
    } catch (e: any) {
      setError(e.message || "Failed to update cart");
    }
  };

  if (loading) {
    return <p className="text-gray-600">Loading cart…</p>;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart</h1>
        <p className="text-gray-600">Your cart is empty.</p>
        <Link href="/" className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart</h1>
      <div className="space-y-4">
        {data.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-primary-200 bg-white p-4"
          >
            <div>
              <Link href={`/products/${item.productId}`} className="font-medium text-gray-900 hover:text-primary-600">
                {item.product.name}
              </Link>
              <p className="text-sm text-gray-600">${item.product.price.toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, Math.max(0, item.quantity - 1))}
                className="px-2 py-1 rounded border border-primary-200"
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="px-2 py-1 rounded border border-primary-200"
              >
                +
              </button>
              <span className="w-24 text-right font-medium text-primary-600">
                ${item.subtotal.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <p className="text-lg font-semibold text-gray-900">Total:</p>
        <p className="text-xl font-semibold text-primary-600">${data.total.toFixed(2)}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Link
          href="/"
          className="px-4 py-2.5 rounded-lg border border-primary-200 text-gray-700 hover:bg-gray-50"
        >
          Continue shopping
        </Link>
        <Link
          href="/checkout"
          className="px-6 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
  };
  subtotal: number;
}

interface CartResponse {
  items: CartItem[];
  total: number;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCart = async () => {
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
        setCart(json);
      } catch (e: any) {
        setError(e.message || "Failed to load cart");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [router]);

  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) return;
    setPlacing(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.url) {
        throw new Error(body.error || "Failed to start checkout");
      }
      window.location.href = body.url as string;
    } catch (e: any) {
      setError(e.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return <p className="text-gray-600">Loading checkout…</p>;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Checkout</h1>
        <p className="text-gray-600">Your cart is empty.</p>
        <Link href="/cart" className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium">
          Back to cart
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Checkout</h1>
      <div className="rounded-xl border border-primary-200 bg-white p-6 space-y-4">
        {cart.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{item.product.name}</p>
              <p className="text-sm text-gray-600">
                {item.quantity} × ${item.product.price.toFixed(2)}
              </p>
            </div>
            <p className="font-medium text-primary-600">
              ${item.subtotal.toFixed(2)}
            </p>
          </div>
        ))}
        <div className="border-t border-primary-100 pt-4 flex items-center justify-between">
          <p className="text-lg font-semibold text-gray-900">Total:</p>
          <p className="text-xl font-semibold text-primary-600">
            ${cart.total.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Link
          href="/cart"
          className="px-4 py-2.5 rounded-lg border border-primary-200 text-gray-700 hover:bg-gray-50"
        >
          Back to cart
        </Link>
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={placing}
          className="px-6 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {placing ? "Placing order…" : "Place order & pay"}
        </button>
      </div>
    </div>
  );
}


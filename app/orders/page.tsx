 "use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

interface OrdersResponse {
  orders: Order[];
}

function OrdersPageInner() {
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load orders");
        }
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [router]);

  const successId = searchParams.get("success");

  if (loading) {
    return <p className="text-gray-600">Loading orders…</p>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Your orders</h1>
        <Link href="/" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          Continue shopping
        </Link>
      </div>
      {successId && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
          Payment successful! Your order <span className="font-mono">{successId}</span> has been placed.
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}
      {!data || data.orders.length === 0 ? (
        <p className="text-gray-600">You have no orders yet.</p>
      ) : (
        <div className="space-y-4">
          {data.orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-primary-200 bg-white p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    Order <span className="font-mono">{order.id}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary-600">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {order.status}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-700">
                {order.items.slice(0, 3).map((item, index) => (
                  <span key={item.id}>
                    {index > 0 && ", "}
                    {item.quantity} × {item.product.name}
                  </span>
                ))}
                {order.items.length > 3 && (
                  <span>
                    {" "}
                    and {order.items.length - 3} more item
                    {order.items.length - 3 > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<p className="text-gray-600">Loading orders…</p>}>
      <OrdersPageInner />
    </Suspense>
  );
}


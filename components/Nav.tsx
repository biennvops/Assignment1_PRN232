"use client";

import Link from "next/link";
import { useAuth } from "./AuthContext";

export function Nav() {
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
  };

  return (
    <nav className="border-b border-primary-200 bg-white/80 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="text-xl font-semibold text-primary-700 hover:text-primary-600">
          Clothing Store
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          {user && (
            <Link href="/products/new" className="text-gray-600 hover:text-gray-900">
              Add product
            </Link>
          )}
          <Link href="/cart" className="text-gray-600 hover:text-gray-900">
            Cart
          </Link>
          {!loading && !user && (
            <>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link href="/register" className="text-gray-600 hover:text-gray-900">
                Register
              </Link>
            </>
          )}
          {!loading && user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

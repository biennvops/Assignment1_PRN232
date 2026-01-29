"use client";

import Link from "next/link";

export function Nav() {
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
          <Link href="/products/new" className="text-gray-600 hover:text-gray-900">
            Add product
          </Link>
        </div>
      </div>
    </nav>
  );
}

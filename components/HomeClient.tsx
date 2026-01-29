"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/ProductGrid";

export function HomeClient() {
  const [search, setSearch] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState("");

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] flex items-center gap-2">
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearchSubmitted(search)}
            className="flex-1 rounded-lg border border-primary-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setSearchSubmitted(search)}
            className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
          >
            Search
          </button>
        </div>
      </div>
      <ProductGrid search={searchSubmitted} />
    </>
  );
}

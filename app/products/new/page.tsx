import Link from "next/link";
import { ProductForm } from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          &larr; Back to products
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add new product</h1>
      <ProductForm />
    </div>
  );
}

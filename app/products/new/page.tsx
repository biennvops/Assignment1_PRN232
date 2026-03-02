import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/ProductForm";
import { getCurrentUser } from "@/lib/auth";

export default async function NewProductPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

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

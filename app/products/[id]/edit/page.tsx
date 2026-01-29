import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/ProductForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) notFound();

  const initial = {
    name: product.name,
    description: product.description,
    price: Number(product.price),
    image: product.image ?? "",
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href={`/products/${id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          &larr; Back to product
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit product</h1>
      <ProductForm productId={id} initial={initial} />
    </div>
  );
}

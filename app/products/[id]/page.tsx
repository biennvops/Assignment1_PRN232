import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DeleteProductButton } from "@/components/DeleteProductButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) notFound();

  const price = Number(product.price);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          &larr; Back to products
        </Link>
      </div>
      <div className="rounded-xl border border-primary-200 bg-white overflow-hidden shadow-sm">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="aspect-square bg-gray-100 relative">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
                No image
              </div>
            )}
          </div>
          <div className="p-8 flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="mt-4 text-gray-600 flex-1">{product.description}</p>
            <p className="mt-6 text-2xl font-semibold text-primary-600">
              ${price.toFixed(2)}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={`/products/${product.id}/edit`}
                className="px-6 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
              >
                Edit product
              </Link>
              <DeleteProductButton productId={product.id} productName={product.name} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

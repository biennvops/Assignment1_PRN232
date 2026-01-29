import { HomeClient } from "@/components/HomeClient";

export default function HomePage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
        <p className="mt-2 text-gray-600">Finally, a good clothing store.</p>
      </header>
      <HomeClient />
    </div>
  );
}

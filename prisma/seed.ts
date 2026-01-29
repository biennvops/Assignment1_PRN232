const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: "Classic Cotton T-Shirt",
        description: "Soft, breathable cotton tee. Perfect for everyday wear.",
        price: 24.99,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
      },
      {
        name: "Slim Fit Chinos",
        description: "Comfortable chinos with a modern slim fit.",
        price: 59.99,
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400",
      },
      {
        name: "Wool Blend Sweater",
        description: "Warm and stylish sweater for cooler days.",
        price: 79.99,
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400",
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

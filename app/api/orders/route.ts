import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET(_request: NextRequest) {
  try {
    const user = await requireUser();

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
    });

    const serialized = orders.map((order) => ({
      id: order.id,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        product: item.product,
      })),
    }));

    return NextResponse.json({ orders: serialized });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(_request: NextRequest) {
  try {
    const user = await requireUser();

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    const itemsData = cartItems.map((item) => {
      const price = Number(item.product.price);
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: price,
        subtotal: price * item.quantity,
      };
    });

    const totalAmount = itemsData.reduce((sum, item) => sum + item.subtotal, 0);

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: user.id,
          totalAmount,
          status: "PENDING",
          items: {
            create: itemsData.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, image: true },
              },
            },
          },
        },
      });

      await tx.cartItem.deleteMany({ where: { userId: user.id } });

      return created;
    });

    const serialized = {
      id: order.id,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        product: item.product,
      })),
    };

    return NextResponse.json({ order: serialized }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/orders:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}


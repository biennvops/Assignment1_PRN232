import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const cartUpdateSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1).optional().default(1),
});

export async function GET(_request: NextRequest) {
  try {
    const user = await requireUser();

    const items = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
      orderBy: { createdAt: "asc" },
    });

    const serialized = items.map((item) => {
      const price = Number(item.product.price);
      const subtotal = price * item.quantity;
      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          description: item.product.description,
          price,
          image: item.product.image,
        },
        subtotal,
      };
    });

    const total = serialized.reduce((sum, item) => sum + item.subtotal, 0);

    return NextResponse.json({
      items: serialized,
      total,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const parsed = cartUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { productId, quantity } = parsed.data;

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });

    let item;
    if (existing) {
      item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      item = await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId,
          quantity,
        },
      });
    }

    return NextResponse.json({ id: item.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const parsed = cartUpdateSchema
      .extend({
        quantity: z.number().int().min(0),
      })
      .safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { productId, quantity } = parsed.data;

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true });
    }

    const item = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity },
    });

    return NextResponse.json({ id: item.id });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("PATCH /api/cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}


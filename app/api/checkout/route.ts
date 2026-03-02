import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

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
        name: item.product.name,
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
      });

      await tx.cartItem.deleteMany({ where: { userId: user.id } });

      return created;
    });

    const origin = request.headers.get("origin") ?? new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: itemsData.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.unitPrice * 100),
        },
      })),
      success_url: `${origin}/orders?success=${order.id}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ url: session.url }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/checkout:", error);
    return NextResponse.json(
      { error: "Failed to start checkout" },
      { status: 500 }
    );
  }
}


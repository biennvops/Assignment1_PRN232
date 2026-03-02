import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

interface Params {
  id: string;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    });

    if (!order || order.userId !== user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "PAID") {
      return NextResponse.json({ success: true });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: "PAID" },
    });

    return NextResponse.json({
      success: true,
      status: updated.status,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/orders/[id]/pay:", error);
    return NextResponse.json(
      { error: "Failed to pay for order" },
      { status: 500 }
    );
  }
}


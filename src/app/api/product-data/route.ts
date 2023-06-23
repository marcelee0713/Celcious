import { prisma } from "@/db/prisma";
import { NextResponse } from "next/server";

export type ProductGETBody = {
  average_rating: number;
  body: string;
  created_at: Date | null;
  id: string;
  price: number;
  product_image: string;
  product_name: string;
  stock: number;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("product_id");

  if (!id) {
    return NextResponse.json({ error: "No id found!" }, { status: 400 });
  }

  const response = await prisma.product.findUnique({
    where: {
      id: id,
    },
  });

  if (response !== null) {
    return NextResponse.json({ response }, { status: 200 });
  }
  return NextResponse.json({ error: "No Response found!" }, { status: 400 });
}

export async function POST(req: Request) {}

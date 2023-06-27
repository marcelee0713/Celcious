import { prisma } from "@/db/prisma";
import { NextResponse } from "next/server";

type QuantityBody = {
  mode: string;
  cart_item_id: string;
};
export type CartPUTResponse = {
  stock: number;
  quantity: number;
};
export async function PUT(req: Request) {
  const body: QuantityBody = await req.json();

  // What I want to do is. Either the quantity changed
  // I want the response body will be
  // quantity, product latest stock

  try {
    if (body.mode === "increment") {
      const latestCartItem = await prisma.cartItem.update({
        where: {
          id: body.cart_item_id,
        },
        data: {
          quantity: {
            increment: 1,
          },
        },
      });

      const getUpdatedProduct = await prisma.product.findUnique({
        where: {
          id: latestCartItem.productId,
        },
      });

      if (getUpdatedProduct && latestCartItem) {
        const res: CartPUTResponse = {
          quantity: latestCartItem.quantity,
          stock: getUpdatedProduct.stock,
        };
        return new Response(JSON.stringify(res), { status: 200 });
      } else {
        return new Response("PUT Method Error in cart-item-data inside try", {
          status: 500,
        });
      }
    } else {
      const latestCartItem = await prisma.cartItem.update({
        where: {
          id: body.cart_item_id,
        },
        data: {
          quantity: {
            decrement: 1,
          },
        },
      });

      const getUpdatedProduct = await prisma.product.findUnique({
        where: {
          id: latestCartItem.productId,
        },
      });

      if (getUpdatedProduct && latestCartItem) {
        const res: CartPUTResponse = {
          quantity: latestCartItem.quantity,
          stock: getUpdatedProduct.stock,
        };
        return new Response(JSON.stringify(res), { status: 200 });
      } else {
        return new Response("PUT Method Error in cart-item-data inside try", {
          status: 500,
        });
      }
    }
  } catch (e) {
    return new Response("PUT Method Error in cart-item-data", { status: 500 });
  }
}

import { CartItemType } from "@/app/cart/[id]/page";
import { prisma } from "@/db/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { NextResponse } from "next/server";

type QuantityBody = {
  mode: string;
  cart_item_id: string;
};

type POSTRequestBody = {
  cart_item_id: string;
};

export type CartPUTResponse = {
  stock: number;
  quantity: number;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Get Method Error, NO ID", {
      status: 500,
    });
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: {
        cart_id: id,
      },
    });

    const cartRef = await prisma.cartItem.findMany({
      where: {
        cartId: cart?.id,
      },
    });

    const products = await prisma.product.findMany();

    const cartItems: CartItemType[] = [];

    products.forEach((productVal, index) => {
      cartRef.forEach((cart) => {
        if (products[index].id === cart.productId) {
          cartItems.push({
            image: productVal.product_image,
            cart_item_id: cart.id,
            product_id: productVal.id,
            product_name: productVal.product_name,
            product_price: productVal.price.toNumber(),
            quantity: cart.quantity,
            stock: productVal.stock,
          });
        }
      });
    });

    return NextResponse.json(cartItems);
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      return new Response(
        "GET Method Error in cart-item-data following error: " + e.message,
        { status: 400 }
      );
    }
    return new Response("GET Method Error in cart-item-data", { status: 500 });
  }
}

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

export async function POST(req: Request) {
  const body: POSTRequestBody = await req.json();

  try {
    const res = await prisma.cartItem.delete({
      where: {
        id: body.cart_item_id,
      },
    });

    return new Response(JSON.stringify(res), { status: 200 });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      return new Response(
        "POST Method Error in cart-item-data following error: " + e.message,
        { status: 400 }
      );
    }
    return new Response("POST Method Error in cart-item-data", { status: 500 });
  }
}

import { prisma } from "@/db/prisma";
import { Prisma } from "@prisma/client";
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

export type RequestPOSTBody = {
  product_id: string;
  user_id: string;
  amount: number;
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

export async function POST(req: Request) {
  const body: RequestPOSTBody = await req.json();

  const cart = await prisma.cart.findUnique({
    where: {
      cart_id: body.user_id,
    },
  });

  // If cart is empty or null. Create one and add the product
  if (!cart) {
    const newCart = await prisma.cart.create({
      data: {
        user: {
          connect: {
            id: body.user_id,
          },
        },
      },
    });
    try {
      await prisma.cart.update({
        where: {
          cart_id: newCart.cart_id,
        },
        data: {
          items: {
            create: {
              quantity: body.amount,
              product: {
                connect: {
                  id: body.product_id,
                },
              },
            },
          },
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json(
          { error: `Error message: ${e.message}` },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Failed adding to cart!" },
        { status: 500 }
      );
    }
  } else {
    console.log("Cart ID: " + cart.id);
    console.log("PRODUCT ID: " + body.product_id);
    try {
      const alreadyExist = await prisma.cartItem.findFirst({
        where: {
          cartId: {
            equals: cart.id,
          },
          AND: {
            productId: {
              equals: body.product_id,
            },
          },
        },
      });

      console.log("CartItem ID: " + alreadyExist?.id);

      if (alreadyExist) {
        await prisma.cart.update({
          where: {
            id: cart.id,
          },
          data: {
            items: {
              update: {
                where: {
                  id: alreadyExist.id,
                },
                data: {
                  quantity: body.amount,
                },
              },
            },
          },
        });
      } else {
        await prisma.cart.update({
          where: {
            id: cart.id,
          },
          data: {
            items: {
              create: {
                quantity: body.amount,
                product: {
                  connect: {
                    id: body.product_id,
                  },
                },
              },
            },
          },
        });
      }

      return NextResponse.json(JSON.stringify("Success"), { status: 200 });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json(
          { error: `Error message: ${e.message}` },
          { status: 400 }
        );
      }
      console.log(e);
      return NextResponse.json(
        { error: "Failed adding to cart!" },
        { status: 500 }
      );
    }
  }
}

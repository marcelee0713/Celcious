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

  if (!body.user_id || body.user_id === "") {
    return new Response("Please try logging in!", { status: 404 });
  }

  const cart = await prisma.cart.findUnique({
    where: {
      cart_id: body.user_id,
    },
  });

  const product = await prisma.product.findUnique({
    where: {
      id: body.product_id,
    },
  });

  if (product) {
    if (!(body.amount <= product?.stock)) {
      return new Response(
        "Sorry, please reduce the quantity. Seems like the stock have changed when you added this to your cart!",
        { status: 404 }
      );
    }
  } else {
    return new Response("Error seems like the product doesn't exist anymore.", {
      status: 400,
    });
  }

  // If cart is empty or null. Create one and add the product
  // After doing this, it should also check if the "amount" of the item to added to cart.
  // Is either less than or equal to the "stock" of the Product.
  // Then I guess is successful?
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
      return NextResponse.json("Failed adding to cart", { status: 500 });
    }
  }
}

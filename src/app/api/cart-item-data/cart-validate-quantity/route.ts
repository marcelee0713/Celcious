import { prisma } from "@/db/prisma";

export type POSTRequestBody = {
  cart_item_id: string;
  product_id: string;
  quantity: number;
};

export type POSTQuantityResponse = {
  quantity: number;
};

export async function POST(req: Request) {
  const body: POSTRequestBody = await req.json();

  const product = await prisma.product.findUnique({
    where: {
      id: body.product_id,
    },
  });

  if (!product) {
    return new Response("Error product does not exist", { status: 404 });
  }

  if (body.quantity > product.stock) {
    const updatedQuantity = await prisma.cartItem.update({
      where: {
        id: body.cart_item_id,
      },
      data: {
        quantity: {
          set: product.stock,
        },
      },
    });

    if (updatedQuantity) {
      const { quantity, ...quantityLess } = updatedQuantity;

      const obj: POSTQuantityResponse = {
        quantity: quantity,
      };

      return new Response(JSON.stringify(obj), { status: 200 });
    }
    return new Response("Seems like something is wrong updating the quantity", {
      status: 400,
    });
  }

  const obj: POSTQuantityResponse = {
    quantity: body.quantity,
  };
  return new Response(JSON.stringify(obj), { status: 200 });
}

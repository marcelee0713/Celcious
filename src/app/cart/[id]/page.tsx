import { NavBar } from "@/components/NavBar";
import { CartItem } from "@/components/cart/CartItem";
import { prisma } from "@/db/prisma";
import { Roboto } from "next/font/google";
import React, { useState } from "react";

const roboto = Roboto({
  subsets: ["latin"],
  weight: "700",
});

type CartItemType = {
  image: string;
  cart_item_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  stock: number;
};

interface PageParams {
  params: {
    id: string;
  };
}

export const revalidate = 0;

export default async function CartPage({ params: { id } }: PageParams) {
  // TODO:
  // 1. Do the functionality of the Cart.
  // 2. Make a middleware for the ProductBox, Profile, and this page.
  //  - When they are not logged in.
  //  - When their "session user id" is not the same as the one they're logged in
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

  return (
    <>
      <NavBar />
      <main className="flex flex-col relative">
        <table className=" table-auto border border-separate border-transparent border-spacing-y-5 p-5">
          <thead>
            <tr>
              <th className="text-start border border-collapse border-transparent">
                Product
              </th>
              <th className="border border-collapse border-transparent">
                Quantity
              </th>
              <th className="border border-collapse border-transparent">
                Total Price
              </th>
              <th className="border border-collapse border-transparent">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((val, index) => (
              <CartItem
                image={val.image}
                cart_item_id={val.cart_item_id}
                product_id={val.product_id}
                product_name={val.product_name}
                product_price={val.product_price}
                quantity={val.quantity}
                stock={val.stock}
                key={index}
              />
            ))}
          </tbody>
        </table>
        <div className="flex fixed bottom-0 bg-primary w-full p-5">
          wassup lilbro
        </div>
      </main>
    </>
  );
}

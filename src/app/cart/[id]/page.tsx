import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NavBar } from "@/components/NavBar";
import { CartItem } from "@/components/cart/CartItem";
import { CartMain } from "@/components/cart/CartMain";
import { prisma } from "@/db/prisma";
import { getServerSession } from "next-auth";
import { Roboto } from "next/font/google";
import { notFound, redirect } from "next/navigation";
import React, { useState } from "react";

const roboto = Roboto({
  subsets: ["latin"],
  weight: "700",
});

export type CartItemType = {
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

  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user.id !== id) {
      notFound();
    }
  }

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
      <CartMain data={cartItems} />
    </>
  );
}

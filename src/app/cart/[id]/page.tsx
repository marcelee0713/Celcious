import { NavBar } from "@/components/NavBar";
import { CartItem } from "@/components/cart/CartItem";
import { prisma } from "@/db/prisma";
import { Roboto } from "next/font/google";
import React from "react";

const roboto = Roboto({
  subsets: ["latin"],
  weight: "700",
});

interface PageParams {
  params: {
    id: string;
  };
}

export default async function CartPage({ params: { id } }: PageParams) {
  // TODO:
  // 1. Do the functionality of the Cart.
  // 2. Make a middleware for the ProductBox, Profile, and this page.
  //  - When they are not logged in.
  //  - When their "session user id" is not the same as the one they're logged in
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
            <CartItem />
            <CartItem />
          </tbody>
        </table>
        <div className="flex fixed bottom-0 bg-primary w-full p-5">
          wassup lilbro
        </div>
      </main>
    </>
  );
}

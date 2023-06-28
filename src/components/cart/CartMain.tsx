"use client";
import { CartItemType } from "@/app/cart/[id]/page";
import React, { useEffect, useState } from "react";
import { CartItem } from "./CartItem";

interface CartMainProps {
  data: CartItemType[];
}

export type CheckedItemTypes = {
  id: string;
  isChecked: boolean;
};

export const CartMain = ({ data }: CartMainProps) => {
  const [price, setPrice] = useState(0);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<CartItemType[]>(data);
  // What I know
  // if the cartId does not exist in the checkedItems
  // Their Checkboxes will be false

  return (
    <main className="flex flex-col relative">
      <div>TOTAL: {price}</div>
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
              price={price}
              setPrice={setPrice}
              key={index}
              checkedItems={checkedItems}
              cart_items={cartItems}
              setCartItems={setCartItems}
            />
          ))}
        </tbody>
      </table>
    </main>
  );
};

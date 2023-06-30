"use client";
import { CartItemType } from "@/app/cart/[id]/page";
import React, { useEffect, useState } from "react";
import { CartItem } from "./CartItem";
import { Roboto } from "next/font/google";

interface CartMainProps {
  data: CartItemType[];
}

export type CartPriceHolder = {
  id: string;
  price: number;
  checked: boolean;
};

const roboto = Roboto({
  subsets: ["latin"],
  weight: "700",
});

export const CartMain = ({ data }: CartMainProps) => {
  const [price, setPrice] = useState(0);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  // What I know
  // if the cartId does not exist in the checkedItems
  // Their Checkboxes will be false

  const addAllToList = () => {
    const emptyArray: string[] = [];
    const allArr: string[] = [];
    setCheckedItems(emptyArray);
    data.forEach((val) => {
      allArr.push(val.cart_item_id);
    });

    setCheckedItems(allArr);
  };

  return (
    <main className="flex flex-col relative">
      <div>{checkedItems.length}</div>
      <table className="table-auto border border-separate border-transparent border-spacing-y-5 p-5 mb-20">
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
          {data.map((val) => (
            // eslint-disable-next-line react/jsx-key
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
              checkedItems={checkedItems}
              setCheckedItems={setCheckedItems}
              key={val.cart_item_id}
            />
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between h-20 bg-primary fixed bottom-0 w-full p-2">
        <div className={`${roboto.className} flex gap-2`}>
          <button
            onClick={addAllToList}
            className="bg-secondary p-2 rounded-lg h-10 shadow-lg"
          >
            Select All
          </button>
          <button
            onClick={() => {
              const emptyArray: string[] = [];
              setCheckedItems(emptyArray);
              setPrice(0);
            }}
            className="bg-secondary p-2 rounded-lg h-10 shadow-lg"
          >
            Unselect All
          </button>
        </div>

        <div className={`${roboto.className} flex gap-5 items-center`}>
          <div className="text-xl text-secondary ">
            Total Price: PHP {price}
          </div>
          <button className="bg-secondary p-2 rounded-lg h-10 shadow-lg">
            Checkout
          </button>
        </div>
      </div>
    </main>
  );
};

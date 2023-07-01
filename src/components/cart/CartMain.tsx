"use client";
import { CartItemType } from "@/app/cart/[id]/page";
import React, { useEffect, useState } from "react";
import { CartItem } from "./CartItem";
import { Roboto } from "next/font/google";

interface CartMainProps {
  data: CartItemType[];
}

export type ItemHolder = {
  id: string;
  totalPrice: number;
  checked: boolean;
};

const roboto = Roboto({
  subsets: ["latin"],
  weight: "700",
});

export const CartMain = ({ data }: CartMainProps) => {
  const initalList = (): ItemHolder[] => {
    const arr: ItemHolder[] = [];
    data.forEach((val) => {
      const totalPrice = val.product_price * val.quantity;
      if (val.stock !== 0) {
        arr.push({
          id: val.cart_item_id,
          totalPrice: totalPrice,
          checked: false,
        });
      }
    });

    return arr;
  };
  const [items, setItems] = useState<ItemHolder[]>(initalList());

  const CheckAllToList = () => {
    const checkedAll = items.map((item) => {
      return { ...item, checked: true };
    });
    setItems(checkedAll);
  };

  const UncheckedAllToList = () => {
    const checkedAll = items.map((item) => {
      return { ...item, checked: false };
    });
    setItems(checkedAll);
  };

  const getTotalPrice = (): number => {
    let accumulator = 0;
    items.forEach((item) => {
      if (item.checked) {
        accumulator += item.totalPrice;
      }
    });
    return accumulator;
  };

  const checkOutItems = (): ItemHolder[] => {
    const arr = items.filter((item) => {
      if (item.checked) {
        return item;
      }
    });

    if (arr.length) return arr;

    return [];
  };

  return (
    <main className="flex flex-col relative">
      <table className="table-auto border border-separate border-transparent border-spacing-y-5 px-5 pb-5 mb-20">
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
            <CartItem
              image={val.image}
              cart_item_id={val.cart_item_id}
              product_id={val.product_id}
              product_name={val.product_name}
              product_price={val.product_price}
              quantity={val.quantity}
              stock={val.stock}
              items={items}
              setItems={setItems}
              key={val.cart_item_id}
            />
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between h-20 bg-primary fixed bottom-0 w-full p-2 z-20">
        <div className={`${roboto.className} flex gap-2`}>
          <button
            onClick={CheckAllToList}
            className="bg-secondary p-2 rounded-lg h-10 shadow-lg"
          >
            Select All
          </button>
          <button
            onClick={UncheckedAllToList}
            className="bg-secondary p-2 rounded-lg h-10 shadow-lg"
          >
            Unselect All
          </button>
        </div>

        <div className={`${roboto.className} flex gap-5 items-center`}>
          <div className="text-xl text-secondary ">
            Total Price: PHP {getTotalPrice()}
          </div>
          <button
            onClick={() => {
              console.log("You bought: " + checkOutItems());
            }}
            className="bg-secondary p-2 rounded-lg h-10 shadow-lg"
          >
            Checkout
          </button>
        </div>
      </div>
    </main>
  );
};

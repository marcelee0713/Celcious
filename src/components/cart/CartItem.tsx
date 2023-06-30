"use client";
import { CartPUTResponse } from "@/app/api/cart-item-data/route";
import { Roboto } from "next/font/google";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ItemHolder } from "./CartMain";

const robotoBold = Roboto({
  subsets: ["latin"],
  weight: "700",
});

const robotoLight = Roboto({
  subsets: ["latin"],
  weight: "300",
});

interface CartItemProps {
  image: string;
  cart_item_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  stock: number;
  items: ItemHolder[];
  setItems: Dispatch<SetStateAction<ItemHolder[]>>;
}

export const CartItem = ({
  cart_item_id,
  image,
  product_id,
  product_name,
  product_price,
  quantity,
  stock,
  items,
  setItems,
}: CartItemProps) => {
  const initalTotalPrice = (): string => {
    let totalPrice = 0;
    items.forEach((val) => {
      if (val.id === cart_item_id) {
        totalPrice = val.totalPrice;
      }
    });
    return totalPrice.toString();
  };

  const getTotalPrice = (): number => {
    let totalPrice = 0;
    items.forEach((val) => {
      if (val.id === cart_item_id) {
        totalPrice = val.totalPrice;
      }
    });
    return totalPrice;
  };

  const updateTotalPrice = (totalPrice: number) => {
    let updatedTotalPrice = items.map((item) => {
      if (item.id === cart_item_id) {
        return { ...item, totalPrice: totalPrice };
      }
      return item;
    });
    setItems(updatedTotalPrice);
    setTotalPrice(totalPrice.toString());
  };

  const updateChecked = (checked: boolean) => {
    let updatedChecked = items.map((item) => {
      if (item.id === cart_item_id) {
        return { ...item, checked: checked };
      }
      return item;
    });
    setChecked(checked);
    setItems(updatedChecked);
  };

  const getUpdatedCheck = (): boolean => {
    let updatedCheck = false;
    items.forEach((item) => {
      if (item.id === cart_item_id) {
        updatedCheck = item.checked;
      }
    });

    return updatedCheck;
  };

  const router = useRouter();
  const [productStock, setStock] = useState(stock);
  const [amount, setAmount] = useState(quantity);
  const [totalPrice, setTotalPrice] = useState(initalTotalPrice());
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDelLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleChecked = () => {
    if (checked) {
      updateChecked(false);
    } else {
      updateChecked(true);
    }
  };

  const decreaseAmount = async () => {
    if (amount !== 1) {
      setLoading(true);
      await fetch("/api/cart-item-data", {
        body: JSON.stringify({
          mode: "decrement",
          cart_item_id: cart_item_id,
        }),
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((val) => {
          const body: CartPUTResponse = val;
          setStock(body.stock);
          setAmount(body.quantity);
          const decremented = getTotalPrice() - product_price;
          updateTotalPrice(decremented);
          setLoading(false);
        });
    }
  };

  const increaseAmount = async () => {
    // Only work when the stock and amount is not equal.
    // TODO: Finish the Fetch Method
    if (productStock !== amount) {
      setLoading(true);
      await fetch("/api/cart-item-data", {
        body: JSON.stringify({
          mode: "increment",
          cart_item_id: cart_item_id,
        }),
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((val) => {
          const body: CartPUTResponse = val;
          setStock(body.stock);
          setAmount(body.quantity);
          const incremented = getTotalPrice() + product_price;
          updateTotalPrice(incremented);
          setLoading(false);
        });
    }
  };

  const deleteCartItem = async () => {
    setLoading(true);
    setDelLoading(true);
    await fetch("/api/cart-item-data", {
      body: JSON.stringify({
        cart_item_id: cart_item_id,
      }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((val) => {
        let updatedList = items.filter((items) => items.id !== cart_item_id);
        setItems(updatedList);
        setLoading(false);
        setDelLoading(false);
        router.refresh();
      });
  };

  useEffect(() => {
    setChecked(getUpdatedCheck());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return (
    <tr className="bg-accent shadow-lg">
      <td className="flex gap-4 border border-collapse border-transparent p-2">
        <div className="relative w-cartItemPicWidth h-cartItemPicHeight">
          <Image
            alt="test"
            src={image}
            fill
            style={{ objectFit: "cover", borderRadius: 12 }}
          />
          <input
            disabled={loading}
            type="checkbox"
            onChange={handleChecked}
            checked={checked}
            className="z-20 absolute checked:bg-primary accent-primary scale-125 left-2 top-2"
          />
        </div>
        <div className="flex flex-col gap-1 justify-center">
          <div className={`${robotoBold.className} text-lg`}>
            {product_name}
          </div>
          <div className={`${robotoLight.className}`}>PHP {product_price}</div>
          <div className={`${robotoLight.className}`}>
            Stock: {productStock}
          </div>
        </div>
      </td>
      <td className="border border-collapse border-transparent">
        <div className="flex gap-2 items-center justify-center">
          <button
            disabled={loading}
            onClick={() => decreaseAmount()}
            className="px-5 py-2 bg-primary text-secondary rounded-lg shadow-lg transition-transform hover:-translate-y-1 disabled:cursor-not-allowed"
          >
            -
          </button>
          <div className="font-bold">{amount}</div>
          <button
            disabled={loading}
            onClick={() => increaseAmount()}
            className="px-5 py-2 bg-primary text-secondary rounded-lg shadow-lg transition-transform hover:-translate-y-1 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </td>
      <td className="text-center border border-collapse border-transparent">
        PHP {totalPrice}
      </td>
      <td className="border border-collapse border-transparent">
        <div className="flex items-center justify-center">
          <div
            onClick={() => deleteCartItem()}
            className="cursor-pointer hover:underline"
          >
            Delete
          </div>
        </div>
      </td>
    </tr>
  );
};

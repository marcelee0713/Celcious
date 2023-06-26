"use client";
import { Roboto } from "next/font/google";
import Image from "next/image";

const robotoBold = Roboto({
  subsets: ["latin"],
  weight: "700",
});

const robotoLight = Roboto({
  subsets: ["latin"],
  weight: "300",
});

export const CartItem = () => {
  return (
    <tr className="bg-accent shadow-lg">
      <td className="flex gap-4 border border-collapse border-transparent p-2">
        <div className="relative w-cartItemPicWidth h-cartItemPicHeight">
          <Image
            alt="test"
            src={"/me.jpg"}
            fill
            style={{ objectFit: "cover", borderRadius: 12 }}
          />
        </div>
        <div className="flex flex-col gap-1 justify-center">
          <div className={`${robotoBold.className} text-lg`}>
            Aesthetic Black Shirt
          </div>
          <div className={`${robotoLight.className}`}>PHP 250</div>
        </div>
      </td>
      <td className="border border-collapse border-transparent">
        <div className="flex gap-2 items-center justify-center">
          <button
            onClick={() => {}}
            className="px-5 py-2 bg-primary text-secondary rounded-lg shadow-lg transition-transform hover:-translate-y-1"
          >
            -
          </button>
          <div className="font-bold">0</div>
          <button
            onClick={() => {}}
            className="px-5 py-2 bg-primary text-secondary rounded-lg shadow-lg transition-transform hover:-translate-y-1"
          >
            +
          </button>
        </div>
      </td>
      <td className="text-center border border-collapse border-transparent">
        PHP 250
      </td>
      <td className="text-center border border-collapse border-transparent">
        Delete
      </td>
    </tr>
  );
};

"use client";
import { Roboto } from "next/font/google";
import { useState } from "react";
import StarRatingComponent from "react-star-rating-component";
import { FaCartPlus, FaHeart } from "react-icons/fa";

const robotoBold = Roboto({
  subsets: ["latin"],
  weight: "700",
});
const robotoLight = Roboto({
  subsets: ["latin"],
  weight: "300",
});
type Props = {
  id: string;
  price: number;
  stock: number;
  average_rating: number;
  product_name: string;
};

export const ProductDetails = ({
  id,
  average_rating,
  price,
  product_name,
  stock,
}: Props) => {
  const [amount, setAmount] = useState(stock !== 0 ? 1 : 0);
  const decreaseAmount = () => {
    if (amount !== 1) {
      setAmount(amount - 1);
    }
  };
  const increaseAmount = () => {
    if (stock !== amount) {
      setAmount(amount + 1);
    }
  };
  return (
    <div className="flex-1 flex flex-col gap-5">
      <div className={`${robotoBold.className} flex flex-col gap-2 `}>
        <div className="text-3xl">{product_name}</div>
        <div className="flex gap-1">
          <StarRatingComponent name="" value={average_rating} editing={false} />
          <div>( {average_rating} )</div>
        </div>
        <hr className="border-primary" />
      </div>
      <div className="flex flex-col">
        <div className={`${robotoBold.className} text-2xl`}>
          PHP {price.toString()}
        </div>
        <div className={`${robotoLight.className}`}>
          Stock: {stock.toString()}
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <button
          onClick={decreaseAmount}
          className="px-5 py-2 bg-primary text-secondary rounded-lg shadow-lg transition-transform hover:-translate-y-1"
        >
          -
        </button>
        <div className="font-bold">{amount}</div>
        <button
          onClick={increaseAmount}
          className="px-5 py-2 bg-primary text-secondary rounded-lg shadow-lg transition-transform hover:-translate-y-1"
        >
          +
        </button>
      </div>
      <div className="flex gap-2">
        <div className="flex px-3 py-5 bg-primary gap-2 rounded-lg shadow-lg text-secondary transition-transform hover:-translate-y-1 cursor-pointer">
          <FaCartPlus size={25} />
          <div className={`${robotoBold.className}`}>Add to Cart</div>
        </div>
        <div className="flex px-3 py-5 bg-primary gap-2 rounded-lg shadow-lg text-secondary transition-transform hover:-translate-y-1 cursor-pointer">
          <FaHeart size={25} />
          <div className={`${robotoBold.className}`}>Add to WishList</div>
        </div>
      </div>
    </div>
  );
};

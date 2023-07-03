import { Roboto } from "next/font/google";
import React from "react";
import Image from "next/image";
import Link from "next/link";

interface ProductProps {
  price: string;
  stock: string;
  image: string;
  title: string;
  body: string;
  id: string;
}

const robotoBold = Roboto({
  subsets: ["latin"],
  weight: "700",
});

const robotoLight = Roboto({
  subsets: ["latin"],
  weight: "300",
});

export const ProductBox: React.FC<ProductProps> = ({
  body,
  id,
  image,
  price,
  stock,
  title,
}) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between">
        <div className={`${robotoBold.className}`}>PHP {price}</div>
        <div className={`${robotoLight.className}`}>Stock: {stock}</div>
      </div>
      <Link
        href={`/products/${id}`}
        className="flex flex-col h-productBoxHeight border border-primary rounded-lg shadow-lg transition-transform hover:-translate-y-1"
      >
        <div className="relative flex-1">
          <Image
            src={image}
            alt={title}
            fill
            style={{ objectFit: "cover" }}
            className="rounded-t-lg"
          />
        </div>

        <div className="bg-primary flex flex-col justify-center items-center px-4 py-2 text-secondary rounded-b-lg">
          <div className={`${robotoBold.className}`}>{title}</div>
          <div className="text-sm text-center">{body}</div>
        </div>
      </Link>
    </div>
  );
};

import { Roboto } from "next/font/google";
import { ProductBox } from "./Discover/ProductBox";
import { prisma } from "@/db/prisma";

const roboto = Roboto({
  subsets: ["latin"],
  weight: "700",
});

export const revalidate = 0;

export const DiscoverSection = async () => {
  const productsArray = await prisma.product.findMany();
  return (
    <div className="flex flex-col">
      <div className={`${roboto.className} text-2xl`}>DISCOVER</div>
      <div className="grid grid-cols-myGridTemplate gap-5">
        {productsArray.map((val, index) => (
          <ProductBox
            body={val.body}
            price={val.price.toString()}
            stock={val.stock.toString()}
            image={val.product_image}
            title={val.product_name}
            id={val.id}
            key={index}
          />
        ))}
      </div>
    </div>
  );
};

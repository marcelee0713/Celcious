import { NavBar } from "@/components/NavBar";
import { ProductDetails } from "@/components/landpage/Discover/Product/ProductDetails";
import { prisma } from "@/db/prisma";
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

interface PageProps {
  params: {
    product_id: string;
  };
}

const Product = async ({ params: { product_id } }: PageProps) => {
  const product = await prisma.product.findUnique({
    where: {
      id: product_id,
    },
  });

  return (
    <>
      <NavBar />
      <main className="flex flex-col p-5 gap-5">
        <div className="flex gap-5 items-center">
          <div className="relative w-viewProductBoxWidth h-productBoxHeight">
            <Image
              src={product?.product_image as string}
              alt={product?.product_name as string}
              fill
              style={{ objectFit: "cover" }}
              className="rounded-lg shadow-lg"
            />
          </div>
          <ProductDetails
            id={product_id}
            price={product?.price.toNumber() as number}
            stock={product?.stock as number}
            average_rating={product?.average_rating?.toNumber() as number}
            product_name={product?.product_name as string}
          />
        </div>
        <div className="p-3 bg-primary text-secondary rounded-lg shadow-lg h-36">
          {product?.body}
        </div>
      </main>
    </>
  );
};

export default Product;

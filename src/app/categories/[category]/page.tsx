import { NavBar } from "@/components/NavBar";
import { ProductBox } from "@/components/landpage/Discover/ProductBox";
import { prisma } from "@/db/prisma";
import { Roboto } from "next/font/google";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    category: string;
  };
}

const robotoBold = Roboto({
  weight: "700",
  subsets: ["latin"],
});

export const revalidate = 0;

export default async function CategoryPage({
  params: { category },
}: PageProps) {
  const getProducts = await prisma.categories.findFirst({
    where: {
      name: category,
    },
    select: {
      product_category: true,
    },
  });

  if (!getProducts) {
    notFound();
  }
  return (
    <>
      <NavBar />
      <main className="flex flex-col gap-5 px-5 pb-5 py-navPageHeight">
        <div className={`${robotoBold.className} text-2xl text-primary mt-5`}>
          {category.toUpperCase()}
        </div>
        <div className="grid grid-cols-myGridTemplate gap-5">
          {getProducts.product_category.map((val) => (
            <ProductBox
              price={val.price.toString()}
              stock={val.stock.toString()}
              image={val.product_image}
              title={val.product_name}
              body={val.body}
              id={val.id}
              key={val.id}
            />
          ))}
        </div>
      </main>
    </>
  );
}

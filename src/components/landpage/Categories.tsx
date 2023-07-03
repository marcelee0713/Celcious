import { Roboto } from "next/font/google";
import { GiSonicShoes, GiShorts } from "react-icons/gi";
import { FaTshirt } from "react-icons/fa";
import { PiPantsFill } from "react-icons/pi";
import Link from "next/link";

const roboto = Roboto({
  subsets: ["latin"],
  weight: "700",
});

export const Categories = () => {
  return (
    <div className={`flex flex-col ${roboto.className}`}>
      <div className="text-2xl text-primary">CATEGORIES</div>
      <div className="grid grid-cols-categoryGrid gap-5 text text-secondary">
        <Link
          href={"categories/shoes"}
          className="bg-primary flex flex-col items-center justify-center gap-2 p-4 shadow-lg rounded-lg"
        >
          <GiSonicShoes size={50} />
          <div>Shoes</div>
        </Link>
        <Link
          href={"categories/shirts"}
          className="bg-primary flex flex-col items-center justify-center gap-2 p-4 shadow-lg rounded-lg"
        >
          <FaTshirt size={50} />
          <div>Shirts</div>
        </Link>
        <Link
          href={"categories/pants"}
          className="bg-primary flex flex-col items-center justify-center gap-2 p-4 shadow-lg rounded-lg"
        >
          <PiPantsFill size={50} />
          <div>Pants</div>
        </Link>
        <Link
          href={"categories/shorts"}
          className="bg-primary flex flex-col items-center justify-center gap-2 p-4 shadow-lg rounded-lg"
        >
          <GiShorts size={50} />
          <div>Shorts</div>
        </Link>
      </div>
    </div>
  );
};

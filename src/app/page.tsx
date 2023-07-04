import { NavBar } from "@/components/NavBar";
import { Categories } from "@/components/landpage/Categories";
import { DiscoverSection } from "@/components/landpage/Discover";
import { Greet } from "@/components/landpage/Greet";
import { Inconsolata } from "next/font/google";
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";

const inconsolata = Inconsolata({
  weight: "700",
  subsets: ["latin"],
});

export default async function Home() {
  return (
    <>
      <NavBar />
      <main className="flex flex-col gap-10 h-fit w-full pt-navPageHeight pb-5 px-5">
        <Greet />
        <Categories />
        <DiscoverSection />
        <div className="flex flex-col items-center justify-center gap-10">
          <div className="flex justify-between items-center gap-20">
            <div className="flex flex-col gap-2 items-center justify-center">
              <div
                className={`${inconsolata.className} ml-headSpacing text-center  tracking-headSpacing font-bold text-2xl`}
              >
                CELCIOUS
              </div>
              <div className="flex gap-3 text-primary">
                <FaFacebook size={50} />
                <FaTwitter size={50} />
                <FaInstagram size={50} />
                <FaLinkedin size={50} />
              </div>
            </div>
            <div
              className={`${inconsolata.className}  flex flex-col gap-2 items-center justify-center`}
            >
              <div className="ml-headSpacing text-center  tracking-headSpacing font-bold text-2xl">
                PAYMENT
              </div>
              <div className="flex gap-3 text-primary text-2xl">
                <div>COD</div>
                <div>GCash</div>
                <div>Meet-up</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col text-center gap-5">
            <div>
              Celcious is small clothing line project that I wanted to make an
              app and website. With its aesthetic and modern design surely the
              zoomers can’t wait to wear this! You can buy my products and you
              can even put your own T-Shirt design!{" "}
            </div>
            <div>
              We also aim for your satisfaction on our product regardless to the
              design or comfort. Thank you so much!
            </div>
          </div>
          <div className="">&#169; Celcious</div>
        </div>
      </main>
    </>
  );
}

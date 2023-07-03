import { NavBar } from "@/components/NavBar";
import { DiscoverSection } from "@/components/landpage/Discover";
import { getServerSession } from "next-auth";
import { Roboto } from "next/font/google";
import Image from "next/image";
import { authOptions } from "./api/auth/[...nextauth]/route";

const robotoBold = Roboto({
  subsets: ["latin"],
  weight: "700",
});

const robotoLight = Roboto({
  subsets: ["latin"],
  weight: "300",
});

export default async function Home() {
  const session = await getServerSession(authOptions);
  return (
    <>
      <NavBar />
      <main className="flex flex-col gap-10 h-fit w-full pt-navPageHeight pb-5 px-5">
        <section
          className={`${robotoBold.className} h-mainSectionHeight bg-primary w-full shadow-lg rounded-lg mt-5 text-secondary flex flex-col items-center justify-center gap-2`}
        >
          <Image
            width={200}
            height={200}
            alt="Celcious Icon"
            src={"/icon.png"}
          />
          <div className="text-4xl">Welcome to Celcious</div>
          <div className={`text-xl ${robotoLight.className}`}>
            {session?.user.name}
          </div>
        </section>
        <DiscoverSection />
      </main>
    </>
  );
}

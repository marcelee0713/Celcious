import { NavBar } from "@/components/NavBar";
import { DiscoverSection } from "@/components/landpage/Discover";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <NavBar />
      <main className="w-full px-5 py-2">
        <DiscoverSection />
      </main>
    </>
  );
}

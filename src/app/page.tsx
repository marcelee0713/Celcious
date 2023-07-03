import { NavBar } from "@/components/NavBar";
import { Categories } from "@/components/landpage/Categories";
import { DiscoverSection } from "@/components/landpage/Discover";
import { Greet } from "@/components/landpage/Greet";

export default async function Home() {
  return (
    <>
      <NavBar />
      <main className="flex flex-col gap-10 h-fit w-full pt-navPageHeight pb-5 px-5">
        <Greet />
        <Categories />
        <DiscoverSection />
      </main>
    </>
  );
}

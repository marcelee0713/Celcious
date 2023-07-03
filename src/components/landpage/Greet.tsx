import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { Roboto } from "next/font/google";
import Image from "next/image"

const robotoBold = Roboto({
    subsets: ["latin"],
    weight: "700",
  });
  
  const robotoLight = Roboto({
    subsets: ["latin"],
    weight: "300",
  });

export const Greet = async () => {
  const session = await getServerSession(authOptions);

  return (
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
  )
}

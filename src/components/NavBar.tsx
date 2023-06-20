"use client";
import React, { useEffect } from "react";
import {
  FaShoppingCart,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaUserAlt,
} from "react-icons/fa";
import { Inconsolata } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const inconsolata = Inconsolata({
  subsets: ["latin"],
  weight: "700",
});

export const NavBar = () => {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="flex justify-between h-navPageHeight items-center px-5 py-2 bg-primary text-secondary shadow-md">
      <div className="flex gap-5">
        <Link
          href={"/"}
          className={`${inconsolata.className} font-bold tracking-headSpacing text-2xl cursor-pointer`}
        >
          CELCIOUS
        </Link>
      </div>

      {session && session.user ? (
        <div className="flex gap-4 items-center">
          <div className="flex gap-3 items-center">
            <FaBell size={20} className="cursor-pointer animate-wiggle" />
          </div>
          <div className="flex flex-col relative group/holder w-10 h-10">
            {session.user.image ? (
              <Image
                fill
                src={session.user.image}
                alt={"Just me"}
                className="rounded-full"
                style={{ objectFit: "cover" }}
                priority={true}
              />
            ) : (
              <FaUserCircle size={40} className="text-secondary" />
            )}
            <div className="flex flex-col invisible group-hover/holder:visible absolute w-36 bg-primary right-0 top-14 duration-500 rounded">
              <div
                onClick={() => router.push("/profile")}
                className="flex gap-2 cursor-pointer p-4 border-b border-secondary hover:bg-black hover:rounded-t-lg"
              >
                <FaUserAlt size={20} />
                <div className="flex-1">Profile</div>
              </div>
              <div
                onClick={() => {}}
                className="flex gap-2 items-center cursor-pointer p-4 border-b border-secondary hover:bg-black"
              >
                <FaShoppingCart size={20} />
                <div className="flex-1">Cart</div>
              </div>
              <div
                onClick={() => {
                  signOut({
                    redirect: true,
                    callbackUrl: "/",
                  });
                }}
                className="flex gap-2 items-center cursor-pointer p-4 hover:bg-black hover:rounded-b-lg"
              >
                <FaSignOutAlt size={20} />
                <div className="flex-1">Sign out</div>
              </div>
            </div>
          </div>

          {/* TODO Soon: For the src of Image we have to get the url of the user's Profile Picture */}
        </div>
      ) : (
        <div className="cursor-pointer" onClick={() => signIn()}>
          Sign in
        </div>
      )}
    </div>
  );
};

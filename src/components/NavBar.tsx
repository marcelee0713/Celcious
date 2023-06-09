"use client";
import React from "react";
import { FaShoppingCart, FaBell } from "react-icons/fa";
import { Inconsolata } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

const inconsolata = Inconsolata({
  subsets: ["latin"],
  weight: "700",
});

export const NavBar = () => {
  const { data: session } = useSession();
  return (
    <div className="flex justify-between items-center px-5 py-2 bg-primary text-secondary shadow-md">
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
          <div className="cursor-pointer" onClick={() => signOut()}>
            Sign out
          </div>

          <div className="flex gap-3 items-center">
            <FaBell size={20} className="cursor-pointer" />
            <FaShoppingCart size={20} className="cursor-pointer" />
          </div>

          {/* TODO Soon: For the src of Image we have to get the url of the user's Profile Picture */}
          <Image
            width={40}
            height={40}
            src={"/me.jpg"}
            alt={"Just me"}
            className="rounded-full cursor-pointer"
          />
        </div>
      ) : (
        <div className="cursor-pointer" onClick={() => signIn()}>
          Sign in
        </div>
      )}
    </div>
  );
};

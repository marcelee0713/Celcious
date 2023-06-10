"use client";
import React, { useState } from "react";

import { ZodType, z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Inconsolata } from "next/font/google";

const inconsolata = Inconsolata({
  subsets: ["latin"],
  weight: "700",
});

export default function SignInPage() {
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  type FormData = {
    email: string;
    password: string;
  };

  const schema: ZodType<FormData> = z.object({
    email: z.string().email(),
    password: z.string().min(5).max(20),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const submitData = async (data: FormData) => {
    setLoading(true);
    setAuthError("");
    await signIn("credentials", {
      username: data.email,
      password: data.password,
      redirect: false,
    })
      .then((val) => {
        if (val?.error) {
          setAuthError(val.error);
        } else if (val?.ok) {
          router.push("/");
        }
        setLoading(false);
      })
      .catch((e) => {
        setAuthError(e);
      });
  };

  return (
    <main className="grid grid-cols-2 h-full w-full">
      <div className="flex items-center justify-center bg-primary">
        <div
          className={`${inconsolata.className} font-bold tracking-headSpacing text-2xl text-secondary bg-black w-full h-40 flex items-center justify-center`}
        >
          CELCIOUS
        </div>
      </div>

      <div className="flex flex-col justify-center gap-5 bg-accent">
        <div className="text-2xl font-bold px-5">Sign in</div>
        <div className="flex flex-col gap-3 p-5 bg-secondary">
          <form
            onSubmit={handleSubmit(submitData)}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col">
              <label className="font-bold">EMAIL</label>
              <input
                type="text"
                className="outline-none border border-gray-400 rounded p-1 focus:border-primary"
                {...register("email")}
              />
              <span
                className={`text-rose-400 duration-300 opacity-0 ease-in ${
                  errors.email && `opacity-100`
                }`}
              >
                {errors.email && errors.email.message}
              </span>
            </div>
            <div className="flex flex-col">
              <label className="font-bold">PASSWORD</label>
              <div className="flex relative items-center">
                <input
                  type={visible ? "text" : "password"}
                  className="outline-none border border-gray-400 rounded p-1 focus:border-primary w-full"
                  {...register("password")}
                />
                {!visible && (
                  <FaEyeSlash
                    className="absolute right-0 mr-1"
                    size={25}
                    onClick={() => setVisible(true)}
                  />
                )}
                {visible && (
                  <FaEye
                    className="absolute right-0 mr-1"
                    size={25}
                    onClick={() => setVisible(false)}
                  />
                )}
              </div>

              <span
                className={`text-rose-400 duration-300 opacity-0 ease-in ${
                  errors.password && `opacity-100`
                }`}
              >
                {errors.password && "Must contain at least 5 character(s)"}
              </span>
            </div>
            <input
              type="submit"
              disabled={loading ? true : false}
              className="bg-primary text-secondary cursor-pointer p-3 rounded-md duration-100 ease-in-out hover:bg-black disabled:cursor-not-allowed w-32 shadow-xl"
            />
          </form>
          {authError !== "" && (
            <div className="bg-rose-200 text-rose-600 p-5 rounded-lg shadow-sm">
              Whoops we got an
              <strong> error</strong>. Please check your credentials.
            </div>
          )}
        </div>
        <div className="text-primary flex gap-1 px-3">
          Don’t have an account?
          <Link href="/auth/signup" className="hover:underline font-bold">
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}

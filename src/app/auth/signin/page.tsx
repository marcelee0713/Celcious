"use client";
import React, { useState } from "react";

import { ZodType, z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Inconsolata, Roboto } from "next/font/google";
import { UserWithoutPass } from "@/types/user";

const inconsolata = Inconsolata({
  subsets: ["latin"],
  weight: "700",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: "400",
});

export default function SignInPage() {
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailsuccess, setEmailSuccess] = useState(false);
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

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
    setEmailSuccess(false);
    setAuthError("");
    const token = params.get("token");
    await signIn("credentials", {
      username: data.email,
      password: data.password,
      token: token,
      redirect: false,
    })
      .then((val) => {
        if (val?.error) {
          setAuthError(val.error);
        } else if (val?.ok) {
          router.replace("/");
        }
        setLoading(false);
      })
      .catch((e) => {
        setAuthError(e);
      });
  };

  const sendEmail = async (data: FormData) => {
    setLoading(true);
    setAuthError("");
    setEmailSuccess(false);
    const res = await fetch("/api/send-email?email=" + data.email, {
      method: "GET",
    });

    const user: UserWithoutPass = await res.json();
    try {
      await fetch("/api/send-email", {
        method: "POST",
        body: JSON.stringify({
          email: user.email,
          id: user.id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      setLoading(false);
      setEmailSuccess(true);
    } catch (e: any) {
      setAuthError(e);
      setLoading(false);
    }
  };

  return (
    <main className="grid grid-cols-2 h-full w-full">
      <div className="flex items-center justify-center bg-primary">
        <div className="text-secondary bg-black w-full h-40 flex flex-col items-center justify-center">
          <div className="w-fit flex flex-col gap-2 justify-center">
            <div
              className={`${inconsolata.className} ml-headSpacing text-center  tracking-headSpacing font-bold text-2xl`}
            >
              CELCIOUS
            </div>

            <hr className="border border-secondary" />

            <div className={`${roboto.className} text-center font-light `}>
              Sign in
            </div>
          </div>
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
            <div className="bg-rose-200 text-rose-600 p-5 rounded-lg shadow-sm flex flex-col">
              <div>
                Whoops we got an
                <strong> error</strong>.
              </div>
              {authError}
              {authError.includes("Email") && (
                <div className="flex gap-1">
                  Haven’t received them?
                  <div
                    onClick={handleSubmit(sendEmail)}
                    className="hover:underline font-bold cursor-pointer"
                  >
                    Re-send Verification
                  </div>
                </div>
              )}
            </div>
          )}
          {emailsuccess && (
            <div className="bg-green-200 text-green-600 p-5 rounded-lg shadow-sm flex flex-col">
              <div>We have successfully sent you a new email verification</div>
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

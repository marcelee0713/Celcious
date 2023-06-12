"use client";
import React, { useState } from "react";

import { ZodType, z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";

import { Inconsolata } from "next/font/google";

const inconsolata = Inconsolata({
  subsets: ["latin"],
  weight: "700",
});

export default function SignUpPage() {
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [cfrmVisible, cfrmSetVisible] = useState(false);

  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const phonePHRegex = new RegExp(/^(09|\+639)\d{9}$/);

  type FormData = {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
  };

  const schema: ZodType<FormData> = z
    .object({
      firstName: z.string().min(2).max(20),
      lastName: z.string().min(2).max(30),
      email: z.string().email(),
      phoneNumber: z
        .string()
        .regex(phonePHRegex, "Invalid Phone Number, Please use PH Code 09..."),
      password: z.string().min(5).max(50),
      confirmPassword: z.string().min(5).max(50),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
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
    await fetch("/api/signup", {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
      }),
      method: "POST",
    })
      .then((val) => {
        setLoading(false);
        if (val.status === 400) {
          setAuthError("Some inputs already exist in the database!");
        } else if (val.status === 500) {
          setAuthError("Please try again later!");
        } else if (val.status === 200) {
          setSuccess(true);
          setTimeout(() => {
            router.back();
          }, 2000);
        }
      })
      .catch((e: any) => {
        setLoading(false);
        console.log("catched error " + e);
        setAuthError("Please try again later!");
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
        <div className="text-2xl font-bold px-5">Sign up</div>
        <div className="flex flex-col gap-3 p-5 bg-secondary">
          {success ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <FaCheckCircle size={30} className="text-primary" />
              <div className="font-bold text-2xl">Success</div>
              <div>Redirecting you back...</div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(submitData)}
              className="grid grid-cols-2 gap-5"
            >
              <div className="flex flex-col">
                <label className="font-bold">FIRST NAME</label>
                <input
                  type="text"
                  className="outline-none border border-gray-400 rounded p-1 focus:border-primary"
                  {...register("firstName")}
                />
                <span
                  className={`text-rose-400 duration-300 opacity-0 ease-in ${
                    errors.firstName && `opacity-100`
                  }`}
                >
                  {errors.firstName && "Must contain at least 2 character(s)"}
                </span>
              </div>
              <div className="flex flex-col">
                <label className="font-bold">LAST NAME</label>
                <input
                  type="text"
                  className="outline-none border border-gray-400 rounded p-1 focus:border-primary"
                  {...register("lastName")}
                />
                <span
                  className={`text-rose-400 duration-300 opacity-0 ease-in ${
                    errors.lastName && `opacity-100`
                  }`}
                >
                  {errors.lastName && "Must contain at least 2 character(s)"}
                </span>
              </div>
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
                <label className="font-bold">PHONE NUMBER</label>
                <input
                  type="text"
                  className="outline-none border border-gray-400 rounded p-1 focus:border-primary"
                  {...register("phoneNumber")}
                />
                <span
                  className={`text-rose-400 duration-300 opacity-0 ease-in ${
                    errors.phoneNumber && `opacity-100`
                  }`}
                >
                  {errors.phoneNumber && errors.phoneNumber.message}
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
              <div className="flex flex-col">
                <label className="font-bold">CONFIRM PASSWORD</label>
                <div className="flex relative items-center">
                  <input
                    type={cfrmVisible ? "text" : "password"}
                    className="outline-none border border-gray-400 rounded p-1 focus:border-primary w-full"
                    {...register("confirmPassword")}
                  />
                  {!cfrmVisible && (
                    <FaEyeSlash
                      className="absolute right-0 mr-1"
                      size={25}
                      onClick={() => cfrmSetVisible(true)}
                    />
                  )}
                  {cfrmVisible && (
                    <FaEye
                      className="absolute right-0 mr-1"
                      size={25}
                      onClick={() => cfrmSetVisible(false)}
                    />
                  )}
                </div>

                <span
                  className={`text-rose-400 duration-300 opacity-0 ease-in ${
                    errors.confirmPassword && `opacity-100`
                  }`}
                >
                  {errors.confirmPassword && errors.confirmPassword.message}
                </span>
              </div>
              <input
                type="submit"
                disabled={loading ? true : false}
                className="bg-primary text-secondary cursor-pointer p-3 rounded-md duration-100 ease-in-out hover:bg-black disabled:cursor-not-allowed w-32 shadow-xl"
              />
            </form>
          )}

          {authError !== "" && (
            <div className="bg-rose-200 text-rose-600 p-5 rounded-lg shadow-sm">
              Whoops we got an
              <strong> error</strong>. {authError}
            </div>
          )}
        </div>
        <div className="text-primary flex gap-1 px-3">
          Already have an account?
          <div
            onClick={() => router.back()}
            className="font-bold cursor-pointer hover:underline"
          >
            Sign In
          </div>
        </div>
      </div>
    </main>
  );
}

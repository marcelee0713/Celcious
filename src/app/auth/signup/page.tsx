"use client";
import React, { useEffect, useState } from "react";

import regions from "../../../utils/regions.json";

import { ZodType, z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaEye, FaEyeSlash, FaCheckCircle, FaCaretRight } from "react-icons/fa";
import { useRouter } from "next/navigation";

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

const getAllRegions = (): string[] => {
  const arrOfRegions: string[] = [];
  regions.forEach((val) => {
    arrOfRegions.push(val.regionName);
  });
  return arrOfRegions;
};

const getProvinceByRegion = (input: string): string[] => {
  let regionIndex: number = 0;
  const arrOfProvinces: string[] = [];
  regions.forEach((val, index) => {
    if (val.regionName === input) {
      regionIndex = index;
    }
  });

  const provinces = regions[regionIndex].provinces;
  provinces.forEach((probinsya) => {
    arrOfProvinces.push(probinsya.name);
  });
  return arrOfProvinces;
};

const getCityByProvince = (region: string, probinsya: string): string[] => {
  const cities: string[] = [];
  regions.forEach((val) => {
    if (val.regionName === region) {
      val.provinces.forEach((province) => {
        if (province.name === probinsya) {
          province.municipalities.forEach((city) => {
            cities.push(city.name);
          });
        }
      });
    }
  });
  return cities;
};

const getBarangayByProvince = (
  region: string,
  probinsya: string,
  cityVal: string
): string[] => {
  const barangay: string[] = [];
  regions.forEach((val) => {
    if (val.regionName === region) {
      val.provinces.forEach((province) => {
        if (province.name === probinsya) {
          province.municipalities.forEach((city) => {
            if (city.name === cityVal) {
              city.barangays.forEach((val) => {
                barangay.push(val);
              });
            }
          });
        }
      });
    }
  });
  return barangay;
};

export default function SignUpPage() {
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [cfrmVisible, cfrmSetVisible] = useState(false);

  const regions = getAllRegions();
  const [provinces, setProvinces] = useState<string[]>([]);
  const [city, setCity] = useState<string[]>([]);
  const [barangay, setBarangay] = useState<string[]>([]);

  const [queryRegion, setQueryRegion] = useState("");
  const [queryProvince, setQueryProvince] = useState("");
  const [queryCity, setQueryCity] = useState("");
  const [queryBarangay, setQueryBarangay] = useState("");

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
    region: string;
    province: string;
    city: string;
    barangay: string;
    noAndStreet: string;
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
      region: z.string().nonempty(),
      province: z.string().nonempty(),
      city: z.string().nonempty(),
      barangay: z.string().nonempty(),
      noAndStreet: z.string().min(5).max(100),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })
    .refine((data) => regions.includes(data.region), {
      message: "This input does not exist in the Regions",
      path: ["region"],
    })
    .refine((data) => provinces.includes(data.province), {
      message: "This input does not exist in the Provinces",
      path: ["province"],
    })
    .refine((data) => city.includes(data.city), {
      message: "This input does not exist in the Cities",
      path: ["city"],
    })
    .refine((data) => barangay.includes(data.barangay), {
      message: "This input does not exist in the Barangays",
      path: ["barangay"],
    })
    .refine((data) => !data.noAndStreet.includes(","), {
      message: `Please remove "," or comma in this field`,
      path: ["noAndStreet"],
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const submitData = async (data: FormData) => {
    const fullAddress = `${data.noAndStreet}, ${data.barangay}, ${data.city}, ${data.province}, ${data.region}`;
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
        address: fullAddress,
      }),
      method: "POST",
    })
      .then(async (val) => {
        setLoading(false);
        if (val.status === 400) {
          setAuthError("Some inputs already exist in the database!");
        } else if (val.status === 500) {
          setAuthError("Please try again later!");
        } else if (val.status === 200) {
          const user: UserWithoutPass = await val.json();
          setSuccess(true);
          await fetch("/api/send-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: data.email,
              id: user.id,
            }),
          });
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
        <div className="text-secondary bg-black w-full h-40 flex flex-col items-center justify-center">
          <div className="w-fit flex flex-col gap-2 justify-center">
            <div
              className={`${inconsolata.className} ml-headSpacing text-center  tracking-headSpacing font-bold text-2xl`}
            >
              CELCIOUS
            </div>

            <hr className="border border-secondary" />

            <div className={`${roboto.className} text-center font-light `}>
              Sign up
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-5 bg-accent">
        <div className="flex flex-col gap-3 p-5 bg-secondary">
          {success ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <FaCheckCircle size={30} className="text-primary" />
              <div className="font-bold text-2xl">Success</div>
              <div>We have sent an verification to your email!</div>
              <div
                onClick={() => {
                  router.back();
                }}
                className="bg-primary text-center text-secondary cursor-pointer p-3 rounded-md duration-100 ease-in-out hover:bg-black w-32 shadow-xl"
              >
                Go back
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(submitData)}
              className="flex flex-col gap-2"
            >
              <div className="font-bold text-2xl">Basic Information</div>
              <div className="grid grid-cols-2 gap-5">
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
              </div>
              <hr className="border-primary my-2" />
              <div className="font-bold text-2xl">Address</div>
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col">
                  <label className="font-bold">REGION</label>
                  <div className="flex flex-col relative items-center group/region_input">
                    <input
                      type="text"
                      className="outline-none border border-gray-400 rounded p-1 focus:border-primary w-full peer/peer_region"
                      {...register("region")}
                      name="region"
                      id="region"
                      onChange={(val) => {
                        setValue("region", val.target.value.toUpperCase());
                        setValue("province", "");
                        setValue("city", "");
                        setValue("barangay", "");
                        setQueryRegion(val.target.value.trim().toUpperCase());
                        setQueryProvince("");
                        setQueryCity("");
                        setQueryBarangay("");
                        setCity([]);
                        setBarangay([]);
                        //prettier-ignore
                        if (regions.includes(val.target.value.trim().toUpperCase())) {
                          setProvinces(
                            getProvinceByRegion(
                              val.target.value.trim().toUpperCase()
                            )
                          );
                        }
                        else {
                          setProvinces([]);
                        }
                      }}
                    />
                    <input
                      type="checkbox"
                      name="dropdown"
                      id="dropdown"
                      className="peer/region hidden"
                    />
                    <label
                      htmlFor="dropdown"
                      className="absolute top-1 right-0 mr-1 transition-transform duration-150 ease-in peer-checked/region:rotate-90 group-hover/region_input:rotate-90 hover:scale-110"
                    >
                      <FaCaretRight size={25} />
                    </label>

                    <ul className="bg-primary h-0 w-full no-scrollbar absolute group-hover/region_input:h-40 peer-focus-within/peer_region:h-40 top-10 rounded transition-all duration-300 ease-in-out peer-checked/region:h-40 overflow-scroll overflow-x-hidden z-10">
                      {regions.map(
                        (val, index) =>
                          val.includes(queryRegion) && (
                            <li
                              className="text-secondary p-2 hover:bg-black cursor-pointer"
                              onClick={() => {
                                setValue("region", val);
                                setValue("province", "");
                                setValue("city", "");
                                setValue("barangay", "");
                                setQueryProvince("");
                                setQueryCity("");
                                setQueryBarangay("");
                                setProvinces([]);
                                setCity([]);
                                setBarangay([]);
                                setProvinces(getProvinceByRegion(val));
                              }}
                              key={index}
                            >
                              {val}
                            </li>
                          )
                      )}
                    </ul>
                  </div>
                  <span
                    className={`text-rose-400 duration-300 opacity-0 ease-in ${
                      errors.region && `opacity-100`
                    }`}
                  >
                    {errors.region?.message}
                  </span>
                </div>
                <div className="flex flex-col">
                  <label className="font-bold">PROVINCE</label>
                  <div className="flex flex-col relative items-center group/province_input">
                    <input
                      type="text"
                      className="outline-none border border-gray-400 rounded p-1 focus:border-primary w-full peer/peer_province"
                      {...register("province")}
                      name="province"
                      id="province"
                      onChange={(val) => {
                        setValue("city", "");
                        setValue("barangay", "");
                        setValue("province", val.target.value.toUpperCase());
                        setQueryCity("");
                        setQueryBarangay("");
                        setQueryProvince(val.target.value.trim().toUpperCase());
                        setCity([]);
                        setBarangay([]);
                        const region = getValues("region");
                        const province = getValues("province");
                        setCity(getCityByProvince(region, province));
                      }}
                    />
                    <input
                      type="checkbox"
                      name="dropdown-province"
                      id="dropdown-province"
                      className="peer/province hidden"
                    />
                    <label
                      htmlFor="dropdown-province"
                      className="absolute top-1 right-0 mr-1 transition-transform duration-150 ease-in peer-checked/province:rotate-90 group-hover/province_input:rotate-90 hover:scale-110"
                    >
                      <FaCaretRight size={25} />
                    </label>

                    <ul className="bg-primary h-0 no-scrollbar w-full absolute top-10 rounded transition-all duration-300 ease-in-out peer-focus-within/peer_province:h-40 peer-checked/province:h-40 group-hover/province_input:h-40 overflow-scroll overflow-x-hidden z-10">
                      {provinces.length ? (
                        provinces.map(
                          (val, index) =>
                            val.includes(queryProvince) && (
                              <li
                                className="text-secondary p-2 hover:bg-black cursor-pointer"
                                key={index}
                                onClick={() => {
                                  setValue("province", val);
                                  setValue("city", "");
                                  setValue("barangay", "");
                                  setQueryCity("");
                                  setQueryBarangay("");
                                  setCity([]);
                                  setBarangay([]);
                                  const region = getValues("region");
                                  const province = getValues("province");
                                  setCity(getCityByProvince(region, province));
                                }}
                              >
                                {val}
                              </li>
                            )
                        )
                      ) : (
                        <div className="text-secondary p-2">
                          Enter your region first
                        </div>
                      )}
                    </ul>
                  </div>
                  <span
                    className={`text-rose-400 duration-300 opacity-0 ease-in ${
                      errors.province && `opacity-100`
                    }`}
                  >
                    {errors.province?.message}
                  </span>
                </div>
                <div className="flex flex-col">
                  <label className="font-bold">CITY</label>
                  <div className="flex flex-col relative items-center group/cities_input">
                    <input
                      type="text"
                      className="outline-none border border-gray-400 rounded p-1 focus:border-primary w-full peer/peer_city"
                      {...register("city")}
                      name="city"
                      id="city"
                      list="citylist"
                      onChange={(val) => {
                        setQueryCity(val.target.value.trim().toUpperCase());
                        setQueryBarangay("");
                        setValue("city", val.target.value.toUpperCase());
                        setValue("barangay", "");
                        const region = getValues("region");
                        const province = getValues("province");
                        const city = getValues("city");
                        setBarangay([]);
                        setBarangay(
                          getBarangayByProvince(region, province, city)
                        );
                      }}
                    />
                    <input
                      type="checkbox"
                      name="dropdown-city"
                      id="dropdown-city"
                      className="peer/city hidden"
                    />
                    <label
                      htmlFor="dropdown-city"
                      className="absolute top-1 right-0 mr-1 transition-transform duration-150 ease-in peer-checked/city:rotate-90 group-hover/cities_input:rotate-90 hover:scale-110"
                    >
                      <FaCaretRight size={25} />
                    </label>

                    <ul className="bg-primary h-0 no-scrollbar w-full absolute top-10 rounded transition-all duration-300 ease-in-out peer-checked/city:h-40 peer-focus-within/peer_city:h-40 group-hover/cities_input:h-40 overflow-scroll overflow-x-hidden">
                      {city.length ? (
                        city.map(
                          (val, index) =>
                            val.includes(queryCity) && (
                              <li
                                className="text-secondary p-2 hover:bg-black cursor-pointer"
                                key={index}
                                onClick={() => {
                                  setValue("city", val);
                                  setValue("barangay", "");
                                  const region = getValues("region");
                                  const province = getValues("province");
                                  const city = getValues("city");
                                  setBarangay([]);
                                  setBarangay(
                                    getBarangayByProvince(
                                      region,
                                      province,
                                      city
                                    )
                                  );
                                }}
                              >
                                {val}
                              </li>
                            )
                        )
                      ) : (
                        <div className="text-secondary p-2">
                          Enter your province first
                        </div>
                      )}
                    </ul>
                  </div>
                  <span
                    className={`text-rose-400 duration-300 opacity-0 ease-in ${
                      errors.city && `opacity-100`
                    }`}
                  >
                    {errors.city?.message}
                  </span>
                </div>
                <div className="flex flex-col">
                  <label className="font-bold">BARANGAY</label>
                  <div className="flex flex-col relative items-center group/barangay_input">
                    <input
                      type="text"
                      className="outline-none border border-gray-400 rounded p-1 focus:border-primary w-full peer/peer_barangay"
                      {...register("barangay")}
                      name="barangay"
                      id="barangay"
                      onChange={(val) => {
                        setQueryBarangay(val.target.value.trim().toUpperCase());
                        setValue(
                          "barangay",
                          val.target.value.trim().toUpperCase()
                        );
                      }}
                    />
                    <input
                      type="checkbox"
                      name="dropdown-barangay"
                      id="dropdown-barangay"
                      className="peer/barangay hidden"
                    />
                    <label
                      htmlFor="dropdown-barangay"
                      className="absolute top-1 right-0 mr-1 transition-transform duration-150 ease-in peer-checked/barangay:rotate-90 group-hover/barangay_input:rotate-90 hover:scale-110"
                    >
                      <FaCaretRight size={25} />
                    </label>

                    <ul className="bg-primary h-0 no-scrollbar w-full absolute top-10 rounded transition-all duration-300 ease-in-out peer-checked/barangay:h-40 peer-focus-within/peer_barangay:h-40 group-hover/barangay_input:h-40 overflow-scroll overflow-x-hidden">
                      {barangay.length ? (
                        barangay.map(
                          (val, index) =>
                            val.includes(queryBarangay) && (
                              <li
                                className="text-secondary p-2 hover:bg-black cursor-pointer"
                                key={index}
                                onClick={() => {
                                  setValue("barangay", val);
                                }}
                              >
                                {val}
                              </li>
                            )
                        )
                      ) : (
                        <div className="text-secondary p-2">
                          Enter your city first
                        </div>
                      )}
                    </ul>
                  </div>
                  <span
                    className={`text-rose-400 duration-300 opacity-0 ease-in ${
                      errors.barangay && `opacity-100`
                    }`}
                  >
                    {errors.barangay?.message}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="font-bold">House Number and Street</label>
                <input
                  type="text"
                  className="outline-none border border-gray-400 rounded p-1 focus:border-primary"
                  {...register("noAndStreet")}
                />
                <span
                  className={`text-rose-400 duration-300 opacity-0 ease-in ${
                    errors.noAndStreet && `opacity-100`
                  }`}
                >
                  {errors.noAndStreet?.message}
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

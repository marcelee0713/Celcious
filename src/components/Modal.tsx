import { ZodType, z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import regions from "../../src/utils/regions.json";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FaCaretRight, FaCheckCircle } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import Image from "next/image";
import { useSession } from "next-auth/react";

export type ModalData = {
  region: string;
  province: string;
  city: string;
  barangay: string;
  noAndStreet: string;
};

type AddressType = {
  text: string;
  closeModal: Dispatch<SetStateAction<boolean>>;
  successModal: Dispatch<
    SetStateAction<{ address_one: string | null; address_two: string | null }>
  >;
  mode: string;
  address: ModalData;
};

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

export const AddressModal: React.FC<AddressType> = ({
  text,
  closeModal,
  successModal,
  mode,
  address,
}) => {
  const { data: session } = useSession();
  const regions = getAllRegions();
  const [provinces, setProvinces] = useState<string[]>([]);
  const [city, setCity] = useState<string[]>([]);
  const [barangay, setBarangay] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const schema: ZodType<ModalData> = z
    .object({
      region: z.string().nonempty(),
      province: z.string().nonempty(),
      city: z.string().nonempty(),
      barangay: z.string().nonempty(),
      noAndStreet: z.string().min(5).max(100),
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
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<ModalData>({
    resolver: zodResolver(schema),
  });

  const submitData = async (myData: ModalData) => {
    setLoading(true);
    const fullAddress = `${myData.noAndStreet}, ${myData.barangay}, ${myData.city}, ${myData.province}, ${myData.region}`;
    const userId = session?.user.id;
    try {
      await fetch("/api/address-data", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userId,
          address: fullAddress,
          mode: mode,
        }),
      });

      setSuccess(true);
      if (mode === "1") {
        successModal((prev) => {
          return {
            ...prev,
            address_one: fullAddress,
          };
        });
      } else {
        successModal((prev) => {
          return {
            ...prev,
            address_two: fullAddress,
          };
        });
      }

      setTimeout(() => closeModal(false), 2000);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const [queryRegion, setQueryRegion] = useState("");
  const [queryProvince, setQueryProvince] = useState("");
  const [queryCity, setQueryCity] = useState("");
  const [queryBarangay, setQueryBarangay] = useState("");

  return (
    <div className="inset-0 absolute w-full h-full flex items-center justify-center bg-primary bg-opacity-80">
      <div className="flex flex-col bg-secondary shadow p-4 w-modalWidth gap-3 rounded-lg">
        {loading && (
          <div className="flex flex-col gap-2 justify-center items-center">
            <Image
              src={"/loading.svg"}
              alt="loading..."
              width={30}
              height={30}
              className="animate-spin"
            />
            <div>Please wait...</div>
          </div>
        )}

        {error && (
          <div className="flex flex-col gap-2 justify-center items-center">
            <Image src={"/error.svg"} alt="error..." width={30} height={30} />
            <div className="font-bold">Error, please try again later!</div>
            <button
              onClick={() => {
                setError(false);
                setLoading(false);
                setSuccess(false);
              }}
              className="text-lg px-8 py-4 bg-primary text-secondary shadow-md rounded-lg transition-transform duration-300 ease-in hover:-translate-y-2 cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        {success && (
          <div className="flex flex-col gap-2 justify-center items-center">
            <FaCheckCircle className="text-primary" size={30} />
            <div>Success and will be closing in a few seconds.</div>
          </div>
        )}

        {!loading && !error && !success && (
          <form
            onSubmit={handleSubmit(submitData)}
            className="relative flex flex-col gap-3 "
          >
            <AiOutlineClose
              className="absolute top-1 right-1 cursor-pointer"
              onClick={() => closeModal(false)}
            />
            <div className="font-bold text-xl">{text}</div>
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
                                  getBarangayByProvince(region, province, city)
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
                    className="outline-none border border-gray-400 rounded p-1 focus:border-primary w-full"
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

                  <ul className="bg-primary h-0 no-scrollbar w-full absolute top-10 rounded transition-all duration-300 ease-in-out peer-checked/barangay:h-40 group-hover/barangay_input:h-40 overflow-scroll overflow-x-hidden">
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
              className="bg-primary text-secondary cursor-pointer p-3 rounded-md duration-100 ease-in-out hover:bg-black disabled:cursor-not-allowed w-32 shadow-xl"
            />
          </form>
        )}
      </div>
    </div>
  );
};

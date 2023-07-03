"use client";
import { NavBar } from "@/components/NavBar";
import { UserWithoutPass, photoUrl } from "@/types/user";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaUserCircle, FaEdit, FaTrash } from "react-icons/fa";

import { ZodType, z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { extractPublicId } from "cloudinary-build-url";
import crypto from "crypto";
import { AddressModal, ModalData } from "@/components/Modal";

export default function Home() {
  const {
    data: session,
    update,
    status,
  } = useSession({
    required: true,
    onUnauthenticated() {
      setLoading(false);
      setError(true);
    },
  });
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState<string | undefined>("");
  const id = session?.user?.id;
  const image = session?.user?.image;
  const router = useRouter();

  const [pfpHolder, setPfpHolder] = useState<string | null>("");
  const [addresses, setAddresses] = useState<{
    address_one: string | null;
    address_two: string | null;
  }>({ address_one: "", address_two: "" });

  const [delCfrmOne, setDelCfrmOne] = useState(false);
  const [delCfrmTwo, setDelCfrmTwo] = useState(false);
  const [delOneLoading, setDelOneLoading] = useState(false);
  const [delTwoLoading, setDelTwoLoading] = useState(false);

  const [addressMode, setAddressMode] = useState("1");
  const [modalText, setModalText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("");

  const [isLoading, setLoading] = useState(false);
  const [hasError, setError] = useState(false);
  const [user, setUser] = useState<UserWithoutPass>({
    email: "",
    emailVerified: null,
    name: "",
    id: "",
    image: "",
    phoneNumber: "",
    address_one: "",
    address_two: "",
  });

  const phonePHRegex = new RegExp(/^(09|\+639)\d{9}$/);

  type FormData = {
    name: string;
    email: string;
    phoneNumber: string;
  };

  const schema: ZodType<FormData> = z.object({
    name: z.string().min(6).max(50),
    email: z.string().email(),
    phoneNumber: z
      .string()
      .regex(phonePHRegex, "Invalid Phone Number, Please use PH Code 09..."),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    setLoading(true);
    try {
      fetch("/api/profile-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
        }),
        cache: "no-cache",
      })
        .then((res) => {
          if (res.status === 200) {
            return res.json();
          } else {
            throw new Error("Error");
          }
        })
        .then((data: UserWithoutPass) => {
          setUser(data);
          setValue("email", data.email);
          setValue("name", data.name);
          setValue("phoneNumber", data.phoneNumber);
          setAddresses({
            address_one: data.address_one,
            address_two: data.address_two,
          });
          setPfpHolder(data.image);
          setLoading(false);
          setError(false);
        })
        .catch((e) => {
          console.log("Error seems like you aren't logged in yet");
        });
    } catch {
      setLoading(false);
      setError(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleFileChange = (data: React.ChangeEvent<HTMLInputElement>) => {
    if (data.target.files) {
      setFile(data.target.files[0]);
      setFilename(data.target.files[0].name);
      setPfpHolder(URL.createObjectURL(data.target.files[0]));
    }
    return;
  };

  function makeid(length: number): string {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  const uploadImage = async () => {
    const formData = new FormData();
    let myUrl = "";

    if (file) {
      formData.append("file", file);
      formData.append("upload_preset", "my-uploads");
      formData.append("public_id", makeid(5));
      formData.append("resource_type", "image");

      const data: photoUrl = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      ).then((r) => r.json());

      console.log(data);

      myUrl = data.url;
    }

    return myUrl;
  };

  const generateSHA1 = (data: any) => {
    const hash = crypto.createHash("sha1");
    hash.update(data);
    return hash.digest("hex");
  };

  const generateSignature = (publicId: string) => {
    const timestamp = new Date().getTime();
    return `public_id=${publicId}&timestamp=${timestamp}${process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET}`;
  };

  const handleDeleteImage = async (publicId: string) => {
    const formData = new FormData();
    const timestamp = new Date().getTime();
    const signature = generateSHA1(generateSignature(publicId));
    const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/destroy`;

    formData.append("public_id", publicId);
    formData.append("timestamp", timestamp.toString());

    formData.append(
      "api_key",
      process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string
    );
    formData.append("signature", signature);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const submitData = async (data: FormData) => {
    setLoading(true);
    let photoUrl: string = "";
    console.log(("Current user image id: " + image) as string);
    if (pfpHolder !== user.image) {
      if (user.image !== null) {
        const publicId = extractPublicId(image as string);
        handleDeleteImage(publicId);
      }
      photoUrl = await uploadImage();
    } else {
      // Means that it will still remain the same image
      if (user.image) photoUrl = user.image;
    }

    await fetch("/api/profile-data", {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        url: photoUrl === "" ? null : photoUrl,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
      }),
      method: "PUT",
    }).then((res) => {
      if (res.status === 200) {
        setLoading(false);
      }
    });

    update();
    router.refresh();
  };

  const handleDeleteAddress = async () => {
    const userId = session?.user.id;
    if (addressMode === "1") {
      setDelOneLoading(true);
    } else {
      setDelTwoLoading(true);
    }

    try {
      await fetch("/api/address-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userId,
          mode: addressMode,
        }),
      });
      if (addressMode === "1") {
        setAddresses((prev) => {
          return {
            ...prev,
            address_one: "",
          };
        });
      } else {
        setAddresses((prev) => {
          return {
            ...prev,
            address_two: "",
          };
        });
      }
    } catch (e) {
      console.log(e);
    } finally {
      setDelOneLoading(false);
      setDelTwoLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <main className="flex items-center justify-center pt-navPageHeight w-full h-full">
        {isLoading && (
          <div className="flex flex-col gap-5">
            <div className="w-full h-full flex justify-center items-center gap-5 ">
              <div className="font-bold text-2xl flex gap-2 flex-col items-center">
                <div className="relative w-profilePicWidth h-profilePicHeight bg-primary rounded-full animate-pulse"></div>
                <div className="h-5 w-24 bg-primary animate-pulse rounded-lg"></div>
              </div>

              <div className="w-profileFormWidth flex flex-col gap-4">
                <div className="flex h-5 bg-primary animate-pulse rounded-lg"></div>
                <div className="flex h-3 w-36 bg-primary animate-pulse rounded-lg"></div>
                <div className="flex h-3 w-32 bg-primary animate-pulse rounded-lg"></div>
                <div className="flex h-3 w-28 bg-primary animate-pulse rounded-lg"></div>
                <div className="flex h-10 bg-primary animate-pulse rounded-lg"></div>
              </div>
            </div>

            <hr className="border-primary" />

            <div className="flex flex-col gap-2">
              <div className="text-xl font-bold h-7 w-20 bg-primary animate-pulse rounded-lg shadow-sm"></div>
              <div className="flex flex-col gap-3">
                <div className="h-20 bg-primary animate-pulse rounded-lg shadow-sm"></div>

                <div className="h-20 bg-primary animate-pulse rounded-lg shadow-sm"></div>
              </div>
            </div>
          </div>
        )}

        {hasError && (
          <div className="w-full h-full flex flex-col justify-center items-center gap-5 ">
            <Image src={"/error.svg"} alt="Error" width={300} height={300} />
            <div className="font-bold text-2xl text-primary">
              Error, please try signing in
            </div>
            <button
              onClick={() => router.replace("/auth/signin")}
              className="text-lg px-8 py-4 bg-primary text-secondary shadow-md rounded-lg transition-transform duration-300 ease-in hover:-translate-y-2 cursor-pointer"
            >
              Sign in
            </button>
          </div>
        )}

        {!isLoading && !hasError && (
          <div className="w-fit h-full gap-5 flex flex-col justify-center">
            <div className="flex justify-center items-center gap-5">
              <div className="font-bold text-2xl flex flex-col items-center">
                {pfpHolder ? (
                  <div className="relative w-profilePicWidth h-profilePicHeight">
                    <Image
                      src={pfpHolder}
                      alt={`${user.name}'s Profile Picture`}
                      fill
                      style={{ objectFit: "cover", borderRadius: "9999px" }}
                      priority={true}
                    />
                  </div>
                ) : id ? (
                  <FaUserCircle size={300} className="text-primary" />
                ) : (
                  <div className="relative w-profilePicWidth h-profilePicHeight bg-primary rounded-full animate-pulse"></div>
                )}

                {id ? (
                  <div>
                    <label
                      htmlFor="file-upload"
                      className="font-normal cursor-pointer text-base underline"
                    >
                      Change Picture
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/png, image/gif, image/jpeg"
                    />
                  </div>
                ) : (
                  <div className="h-5 w-24 bg-primary animate-pulse rounded-lg mt-2"></div>
                )}
              </div>

              {id ? (
                <form
                  onSubmit={handleSubmit(submitData)}
                  className="w-profileFormWidth flex flex-col gap-4"
                >
                  <div className="flex flex-col border-b border-primary">
                    <div className="font-bold text-xl">Profile</div>
                  </div>
                  <div className="flex flex-col">
                    <input
                      type="text"
                      defaultValue={user.name}
                      className="outline-none focus:border-b border-primary"
                      {...register("name")}
                    />
                    <span
                      className={`text-rose-400 duration-300 opacity-0 ease-in ${
                        errors.name && `opacity-100`
                      }`}
                    >
                      {errors.name?.message}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <input
                      type="email"
                      defaultValue={user.email}
                      className="outline-none focus:border-b border-primary"
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
                    <input
                      type="text"
                      defaultValue={user.phoneNumber}
                      className="outline-none focus:border-b border-primary"
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

                  <input
                    type="submit"
                    value={"Save"}
                    className="text-lg px-8 py-4 bg-primary text-secondary shadow-md rounded-lg transition-transform duration-300 ease-in hover:-translate-y-2 cursor-pointer"
                  />
                </form>
              ) : (
                <div className="w-profileFormWidth flex flex-col gap-4">
                  <div className="flex h-5 bg-primary animate-pulse rounded-lg"></div>
                  <div className="flex h-3 w-36 bg-primary animate-pulse rounded-lg"></div>
                  <div className="flex h-3 w-32 bg-primary animate-pulse rounded-lg"></div>
                  <div className="flex h-3 w-28 bg-primary animate-pulse rounded-lg"></div>
                  <div className="flex h-10 bg-primary animate-pulse rounded-lg"></div>
                </div>
              )}
            </div>
            <hr className="border-primary" />

            {id ? (
              <div className="flex flex-col gap-2">
                <div className="text-xl font-bold">Addresses</div>
                <div className="flex flex-col gap-3">
                  {addresses.address_one ? (
                    <div className="flex flex-col shadow-sm p-4 bg-accent gap-2 rounded-lg relative">
                      {delOneLoading && (
                        <div className="flex items-center justify-center rounded-lg h-full w-full absolute top-0 left-0 bg-secondary p-4">
                          <Image
                            src={"/loading.svg"}
                            alt="Loading..."
                            height={30}
                            width={30}
                            className="animate-spin"
                          />
                        </div>
                      )}
                      {!delOneLoading && (
                        <>
                          {addresses.address_one}
                          <div className="flex gap-3 self-end">
                            <FaEdit
                              onClick={() => {
                                setShowModal(true);
                                setModalText("Editing your first address");
                                setAddressMode("1");
                                setCurrentAddress(
                                  addresses.address_one as string
                                );
                              }}
                              className="text-primary cursor-pointer transition-transform ease-in hover:-translate-y-1"
                            />
                            <FaTrash
                              onClick={() => {
                                setDelCfrmOne(true);
                              }}
                              className="text-primary cursor-pointer transition-transform ease-in hover:-translate-y-1"
                            />
                          </div>
                          <div
                            className={`${
                              delCfrmOne ? "flex" : "hidden"
                            } flex-col items-center justify-center rounded-lg h-full w-full absolute top-0 left-0 bg-primary text-secondary`}
                          >
                            <div className="font-bold">
                              Are you sure you want to delete this address?
                            </div>
                            <div className="flex gap-2">
                              <div
                                onClick={async () => {
                                  setDelCfrmOne(false);
                                  setAddressMode("1");
                                  await handleDeleteAddress();
                                }}
                                className="hover:underline cursor-pointer"
                              >
                                Yes
                              </div>
                              <div
                                onClick={() => setDelCfrmOne(false)}
                                className="hover:underline cursor-pointer"
                              >
                                No
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setShowModal(true);
                        setModalText("Add an address");
                        setAddressMode("1");
                        setCurrentAddress("");
                      }}
                      className="flex flex-col text-lg text-gray-400 text-center shadow-sm p-4 bg-accent gap-2 rounded-lg cursor-pointer transition-transform ease-in hover:-translate-y-1"
                    >
                      + Add an address
                    </div>
                  )}

                  {addresses.address_two ? (
                    <div className="flex flex-col shadow-sm p-4 bg-accent gap-2 rounded-lg relative">
                      {delTwoLoading && (
                        <div className="flex items-center justify-center rounded-lg h-full w-full absolute top-0 left-0 bg-secondary p-4">
                          <Image
                            src={"/loading.svg"}
                            alt="Loading..."
                            height={30}
                            width={30}
                            className="animate-spin"
                          />
                        </div>
                      )}
                      {!delTwoLoading && (
                        <>
                          {addresses.address_two}
                          <div className="flex gap-3 self-end">
                            <FaEdit
                              onClick={() => {
                                setShowModal(true);
                                setModalText("Editing your second address");
                                setAddressMode("2");
                                setCurrentAddress(
                                  addresses.address_two as string
                                );
                              }}
                              className="text-primary cursor-pointer transition-transform ease-in hover:-translate-y-1"
                            />
                            <FaTrash
                              onClick={() => {
                                setDelCfrmTwo(true);
                                setAddressMode("2");
                              }}
                              className="text-primary cursor-pointer transition-transform ease-in hover:-translate-y-1"
                            />
                          </div>
                          <div
                            className={`${
                              delCfrmTwo ? "flex" : "hidden"
                            } flex-col items-center justify-center rounded-lg h-full w-full absolute top-0 left-0 bg-primary text-secondary`}
                          >
                            <div className="font-bold">
                              Are you sure you want to delete this address?
                            </div>
                            <div className="flex gap-2">
                              <div
                                onClick={async () => {
                                  setDelCfrmOne(false);
                                  setAddressMode("2");
                                  await handleDeleteAddress();
                                }}
                                className="hover:underline cursor-pointer"
                              >
                                Yes
                              </div>
                              <div
                                onClick={() => setDelCfrmTwo(false)}
                                className="hover:underline cursor-pointer"
                              >
                                No
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setShowModal(true);
                        setModalText("Add a second address");
                        setAddressMode("2");
                        setCurrentAddress("");
                      }}
                      className="flex flex-col text-lg text-gray-400 text-center shadow-sm p-4 bg-accent gap-2 rounded-lg cursor-pointer transition-transform ease-in hover:-translate-y-1"
                    >
                      + Add another address
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="text-xl font-bold h-7 w-20 bg-primary animate-pulse rounded-lg shadow-sm"></div>
                <div className="flex flex-col gap-3">
                  <div className="h-20 bg-primary animate-pulse rounded-lg shadow-sm"></div>

                  <div className="h-20 bg-primary animate-pulse rounded-lg shadow-sm"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      {showModal && (
        <AddressModal
          text={modalText}
          mode={addressMode}
          closeModal={setShowModal}
          successModal={setAddresses}
          address={currentAddress}
        />
      )}
    </>
  );
}

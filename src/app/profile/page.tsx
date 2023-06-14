"use client";
import { NavBar } from "@/components/NavBar";
import { UserWithoutPass, photoUrl } from "@/types/user";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";

import { ZodType, z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { extractPublicId } from "cloudinary-build-url";
import crypto, { publicDecrypt } from "crypto";

export default function Home() {
  const { data: session, update } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState<string | undefined>("");
  const id = session?.user?.id;
  const image = session?.user?.image;
  const router = useRouter();

  const [pfpHolder, setPfpHolder] = useState<string | null>("");

  const [isLoading, setLoading] = useState(false);
  const [hasError, setError] = useState(false);
  const [user, setUser] = useState<UserWithoutPass>({
    email: "",
    emailVerified: null,
    name: "",
    id: "",
    image: "",
    phoneNumber: "",
  });

  const [defaultPhone, setDefaultPhone] = useState("");

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
      if (!id) throw new Error("Error");
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
        .then((res) => res.json())
        .then((data: UserWithoutPass) => {
          setUser(data);
          setValue("email", data.email);
          setValue("name", data.name);
          setValue("phoneNumber", data.phoneNumber);
          setPfpHolder(data.image);
          setLoading(false);
          setError(false);
        });

      setDefaultPhone(user.phoneNumber);
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

  return (
    <>
      <NavBar />
      <main className="flex pt-16 h-full -mt-navPageMargin">
        {isLoading && (
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
          <div className="w-full h-full flex justify-center items-center gap-5 ">
            <div className="font-bold text-2xl flex flex-col items-center">
              {pfpHolder ? (
                <div className="relative w-profilePicWidth h-profilePicHeight">
                  <Image
                    src={pfpHolder}
                    alt={`${user.name}'s Profile Picture`}
                    fill
                    style={{ objectFit: "cover", borderRadius: "9999px" }}
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
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}

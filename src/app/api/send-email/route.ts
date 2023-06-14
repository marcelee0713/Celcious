import { transporter } from "@/app/nodemailer/nodemailer";
import { prisma } from "@/db/prisma";
import jwt from "jsonwebtoken";
const email = process.env.EMAIL;
const secret = process.env.NEXTAUTH_SECRET;

type RequestBody = {
  email: string;
  id: string;
};

export async function POST(req: Request) {
  const body: RequestBody = await req.json();
  const token = jwt.sign(
    {
      id: body.id,
    },
    secret as string,
    { expiresIn: "1d" }
  );
  const url =
    process.env.NEXTAUTH_URL +
    `auth/signin?callbackUrl=${process.env.NEXTAUTH_URL}&token=${token}`;

  console.log(body.email);
  console.log(email);

  try {
    await transporter.sendMail({
      to: body.email,
      from: email,
      subject: "Celcious Email Verification",
      text: "Email Verification for Celcious",
      html: `<h1>Email Verification</h1><br><a href=${url}>Confirm Email and Sign in</a><br><p>This will expire in one day. <strong>DO NOT SHARE THIS LINK!</strong></p>`,
    });
    return new Response(JSON.stringify("Success Email Sent"), { status: 200 });
  } catch (e) {
    console.log(e);
    return new Response(JSON.stringify(e), { status: 400 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.toString();

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      const { password, ...userPasswordLess } = user;
      return new Response(JSON.stringify(userPasswordLess));
    } else {
      throw new Error("User does not exist!");
    }
  } catch (e) {
    return new Response(JSON.stringify(e), { status: 400 });
  }
}

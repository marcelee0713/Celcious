import { prisma } from "@/db/prisma";
import { Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";

interface RequestBody {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: await bcrypt.hash(body.password, 10),
        phoneNumber: body.phoneNumber,
        address_one: body.address,
      },
    });

    const { password, ...result } = user;
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return new Response("Some inputs already exist!", { status: 400 });
      }
    }
    return new Response("Error, please try again later!", { status: 500 });
  }
}

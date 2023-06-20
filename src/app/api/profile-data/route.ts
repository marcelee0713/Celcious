import { prisma } from "@/db/prisma";

interface RequestBody {
  id: string;
}

interface RequestPUTBody {
  id: string;
  url: string | null;
  name: string;
  email: string;
  phoneNumber: string;
}

export async function POST(req: Request) {
  const userId: RequestBody = await req.json();

  const user = await prisma.user.findFirst({
    where: {
      id: userId.id,
    },
  });

  if (user && userId.id) {
    const { password, ...userWithoutPass } = user;
    return new Response(JSON.stringify(userWithoutPass), { status: 200 });
  } else {
    throw new Error("User doesn't exist");
  }
}

export async function PUT(req: Request) {
  const userId: RequestPUTBody = await req.json();

  const user = await prisma.user.update({
    where: {
      id: userId.id,
    },
    data: {
      image: userId.url,
      email: userId.email,
      name: userId.name,
      phoneNumber: userId.phoneNumber,
    },
  });

  if (user) {
    const { password, ...userWithoutPass } = user;
    return new Response(JSON.stringify(userWithoutPass), { status: 200 });
  } else {
    throw new Error("Update failed!");
  }
}

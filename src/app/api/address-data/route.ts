import { prisma } from "@/db/prisma";

interface RequestPUTBody {
  id: string;
  address: string;
  mode: string;
}

export async function PUT(req: Request) {
  const userId: RequestPUTBody = await req.json();

  if (userId.mode === "1") {
    const user = await prisma.user.update({
      where: {
        id: userId.id,
      },
      data: {
        address_one: userId.address,
      },
    });

    if (user) {
      const { password, ...userWithoutPass } = user;
      return new Response(JSON.stringify(userWithoutPass), { status: 200 });
    } else {
      throw new Error("Update failed!");
    }
  } else {
    const user = await prisma.user.update({
      where: {
        id: userId.id,
      },
      data: {
        address_two: userId.address,
      },
    });

    if (user) {
      const { password, ...userWithoutPass } = user;
      return new Response(JSON.stringify(userWithoutPass), { status: 200 });
    } else {
      throw new Error("Update failed!");
    }
  }
}

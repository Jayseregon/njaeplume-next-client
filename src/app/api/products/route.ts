import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error(error);

    return new NextResponse("Error fetching products", { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.products_productdetailsmodel.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        fr_category: true,
        description: true,
        fr_description: true,
        products_productimagesmodel: {
          select: {
            id: true,
            image: true,
            alt_text: true,
          },
        },
      },
    });

    const freebies = await prisma.products_freebiesmodel.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        alt_text: true,
        zip_file_name: true,
      },
    });

    const response = { products, freebies };

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);

    return new NextResponse("Error fetching products", { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}

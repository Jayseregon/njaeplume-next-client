"use server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getProducts() {
  try {
    return await prisma.product.findMany({
      include: { images: true },
    });
  } finally {
    await prisma.$disconnect();
  }
}

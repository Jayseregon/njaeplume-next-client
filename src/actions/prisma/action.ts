"use server";

import { PrismaClient, Category } from "@prisma/client";

import { Product } from "@/src/interfaces/Products";
import { slugifyProductName, normalizeTagName } from "@/src/lib/actionHelpers";

const prisma = new PrismaClient();

export async function getProducts() {
  try {
    return await prisma.product.findMany({
      include: { images: true, tags: true },
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function updateProduct(data: Partial<Product>) {
  try {
    const { id, tags, images, ...updateData } = data;

    return await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        ...(tags && {
          tags: {
            set: tags.map((tag) => ({ id: tag.id })),
          },
        }),
        ...(images && {
          images: {
            set: images.map((image) => ({ id: image.id })),
          },
        }),
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteProduct(id: string) {
  try {
    return await prisma.product.delete({
      where: { id },
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function createProduct(data: {
  name: string;
  price: number;
  description: string;
  category: Category;
  zip_file_name: string;
  tagIds: string[];
  images: { url: string; alt_text: string }[];
}) {
  try {
    const slug = slugifyProductName(data.name, data.category);

    return await prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        description: data.description,
        category: data.category,
        zip_file_name: data.zip_file_name,
        slug: slug,
        tags: {
          connect: data.tagIds.map((id) => ({ id })),
        },
        images: {
          create: data.images,
        },
      },
      include: {
        tags: true,
        images: true,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function getTags() {
  try {
    return await prisma.tag.findMany({
      orderBy: { name: "asc" },
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function createTagIfNotExists(tagName: string) {
  try {
    const normalized = normalizeTagName(tagName);

    if (!normalized) return null;

    // First try to find existing tag
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [{ name: normalized.name }, { slug: normalized.slug }],
      },
    });

    if (existingTag) {
      return existingTag;
    }

    // Create new tag if it doesn't exist
    return await prisma.tag.create({
      data: {
        name: normalized.name,
        slug: normalized.slug,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

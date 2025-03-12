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

export async function getProductsByCategory(category: Category) {
  try {
    return await prisma.product.findMany({
      where: { category },
      include: { images: true, tags: true },
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function updateProduct(data: Partial<Product>) {
  try {
    const { id, tags, images, ...updateData } = data;

    // Handle base update data
    const updateOperation: any = {
      where: { id },
      data: {
        ...updateData,
      },
      include: {
        tags: true,
        images: true,
      },
    };

    // Handle tags if provided
    if (tags) {
      updateOperation.data.tags = {
        set: tags.map((tag) => ({ id: tag.id })),
      };
    }

    // Handle images if provided
    if (images && images.length > 0) {
      // First, delete any existing images that are not in the new list
      const existingImageIds = images
        .filter((img) => img.id)
        .map((img) => img.id as string);

      // Create a separate transaction to first delete images that are no longer needed
      if (existingImageIds.length > 0) {
        await prisma.productImage.deleteMany({
          where: {
            productId: id,
            NOT: {
              id: {
                in: existingImageIds,
              },
            },
          },
        });
      } else {
        // If no existing images are being kept, delete all images
        await prisma.productImage.deleteMany({
          where: {
            productId: id,
          },
        });
      }

      // For new images, create them directly
      const newImages = images.filter((img) => !img.id);

      if (newImages.length > 0) {
        updateOperation.data.images = {
          create: newImages.map((img) => ({
            url: img.url,
            alt_text: img.alt_text,
          })),
        };
      }
    }

    return await prisma.product.update(updateOperation);
  } catch (error) {
    console.error("Failed to update product:", error);
    throw error;
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

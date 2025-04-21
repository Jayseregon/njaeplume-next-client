"use server";

import { PrismaClient, Category } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

import { Product, OrderWithItems } from "@/src/interfaces/Products";
import { slugifyProductName, normalizeTagName } from "@/src/lib/actionHelpers";

// New cache implementations
const productsCache = new Map<string, { data: any; timestamp: number }>();
const productSlugCache = new Map<string, { data: any; timestamp: number }>();
const categoryProductsCache = new Map<
  string,
  { data: any; timestamp: number }
>();
const CACHE_DURATION = 60000 * 5; // cache duration in ms (60s * 5: 5 minutes)

const prisma = new PrismaClient();

async function generateUniqueSlug(
  name: string,
  category: string,
): Promise<string> {
  const baseSlug = slugifyProductName(name, category);
  let slug = baseSlug;
  let suffix = 1;

  while (await prisma.product.findFirst({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  return slug;
}

export async function getProducts() {
  try {
    return await prisma.product.findMany({
      include: { images: true, tags: true },
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function getProductsByCategory(category: Category | string) {
  // Check cache first
  const cacheEntry = productsCache.get(category as string);

  if (cacheEntry && Date.now() - cacheEntry.timestamp < CACHE_DURATION) {
    return cacheEntry.data;
  }
  try {
    const data = await prisma.product.findMany({
      where: { category: category as Category },
      include: { images: true, tags: true },
    });

    // Save to cache
    productsCache.set(category as string, { data, timestamp: Date.now() });

    return data;
  } finally {
    await prisma.$disconnect();
  }
}

export async function updateProduct(data: Partial<Product>) {
  try {
    const { id, tags, images, ...updateData } = data;

    if (!id) throw new Error("Product ID must be provided.");

    // Get the current product so we have a fallback for name/category.
    const currentProduct = await prisma.product.findUnique({ where: { id } });

    if (!currentProduct) {
      throw new Error("Product not found");
    }

    // Determine values for recalculating the slug.
    const newName = updateData.name ?? currentProduct.name;
    const newCategory = updateData.category ?? currentProduct.category;

    // Recalculate slug regardless of whether the client already passed a slug.
    updateData.slug = await generateUniqueSlug(newName, newCategory);

    // Prepare the update operation.
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

    // Handle tags if provided.
    if (tags) {
      updateOperation.data.tags = {
        set: tags.map((tag) => ({ id: tag.id })),
      };
    }

    // Handle images if provided.
    if (images && images.length > 0) {
      const existingImageIds = images
        .filter((img) => img.id)
        .map((img) => img.id as string);

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
        await prisma.productImage.deleteMany({
          where: {
            productId: id,
          },
        });
      }

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
    const slug = await generateUniqueSlug(data.name, data.category);

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

export async function getProductBySlug(slug: string) {
  const cacheEntry = productSlugCache.get(slug);

  if (cacheEntry && Date.now() - cacheEntry.timestamp < CACHE_DURATION) {
    return cacheEntry.data;
  }
  try {
    const data = await prisma.product.findUnique({
      where: { slug },
      include: { images: true, tags: true },
    });

    productSlugCache.set(slug, { data, timestamp: Date.now() });

    return data;
  } finally {
    await prisma.$disconnect();
  }
}

export async function getLatestProductsByCategory(limit = 3) {
  const cacheKey = `latest_${limit}_no_freebies`; // Updated cache key
  const cacheEntry = categoryProductsCache.get(cacheKey);

  // Return cached data if valid
  if (cacheEntry && Date.now() - cacheEntry.timestamp < CACHE_DURATION) {
    return cacheEntry.data;
  }

  try {
    // Get all categories EXCEPT freebies
    const categories = Object.values(Category).filter(
      (cat) => cat !== Category.freebies,
    );

    // Prepare query to get latest products for each category with limit
    const categoryProducts = await Promise.all(
      categories.map(async (category) => {
        try {
          const products = await prisma.product.findMany({
            where: { category: category as Category },
            include: { images: true, tags: true },
            orderBy: { createdAt: "desc" },
            take: limit,
          });

          return {
            category,
            products: products.length > 0 ? products : [],
          };
        } catch (error) {
          console.error(
            `Error fetching products for category ${category}:`,
            error,
          );

          return { category, products: [] };
        }
      }),
    );

    // Filter out categories with no products
    const populatedCategories = categoryProducts.filter(
      ({ products }) => products && products.length > 0,
    );

    // Cache the result
    categoryProductsCache.set(cacheKey, {
      data: populatedCategories,
      timestamp: Date.now(),
    });

    return populatedCategories;
  } catch (error) {
    console.error("Error fetching latest products by category:", error);

    return [];
  } finally {
    await prisma.$disconnect();
  }
}

export async function getUserOrders(options?: {
  limit?: number;
}): Promise<OrderWithItems[]> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
        status: "COMPLETED",
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                tags: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: options?.limit,
    });

    return orders as OrderWithItems[];
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw new Error("Failed to fetch orders.");
  }
}

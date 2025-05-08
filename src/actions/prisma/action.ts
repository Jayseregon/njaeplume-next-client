"use server";

import { auth } from "@clerk/nextjs/server";

import { Category } from "@/generated/client";
import { prisma } from "@/src/lib/prismaClient";
import {
  Product,
  OrderWithItems,
  WishlistItem,
} from "@/src/interfaces/Products"; // Added WishlistItem
import { slugifyProductName, normalizeTagName } from "@/src/lib/actionHelpers";

// New cache implementations
const productsCache = new Map<string, { data: any; timestamp: number }>();
const productSlugCache = new Map<string, { data: any; timestamp: number }>();
const categoryProductsCache = new Map<
  string,
  { data: any; timestamp: number }
>();
const CACHE_DURATION = 60000 * 5; // cache duration in ms (60s * 5: 5 minutes)

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
  description_fr: string;
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
        description_fr: data.description_fr,
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

// Add or update this server action to handle download tracking
export async function updateOrderItemDownload(
  orderItemId: string,
): Promise<boolean> {
  try {
    // Get the current auth session
    const { userId } = await auth();

    if (!userId) {
      console.error(
        "No authenticated user found when trying to update download",
      );

      return false;
    }

    // First, verify this order item belongs to the authenticated user
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        order: true,
      },
    });

    if (!orderItem) {
      console.error(`Order item ${orderItemId} not found`);

      return false;
    }

    // Verify this order belongs to the current user
    if (orderItem.order.userId !== userId) {
      console.error(`User ${userId} does not own order item ${orderItemId}`);

      return false;
    }

    // Update the download count and timestamp
    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        downnloadCount: 1, // Increment to 1 (first download)
        downloadedAt: new Date(),
      },
    });

    console.log(
      `Successfully updated download status for order item ${orderItemId}`,
    );

    return true;
  } catch (error) {
    console.error("Error updating order item download:", error);

    return false;
  }
}

export async function isProductInWishlist(productId: string): Promise<boolean> {
  const { userId } = await auth();

  if (!userId) {
    console.error(
      "No authenticated user found when trying to check wishlist status",
    );

    return false;
  }

  try {
    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return !!wishlistItem;
  } catch (error) {
    console.error("Error checking wishlist status:", error);

    // Return false or throw error, depending on desired error handling
    return false;
  }
}

export async function addToWishlist(
  productId: string,
): Promise<WishlistItem | null> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated. Cannot add to wishlist.");
  }

  try {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Product not found.");
    }

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId,
        productId,
      },
    });

    return wishlistItem as WishlistItem;
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    // Prisma throws P2002 if item already exists due to @@id([userId, productId])
    // You might want to handle this specific error gracefully or let it propagate
    if ((error as any).code === "P2002") {
      // Item already in wishlist, return existing or null based on desired behavior
      const existingItem = await prisma.wishlistItem.findUnique({
        where: { userId_productId: { userId, productId } },
      });

      return existingItem as WishlistItem | null;
    }
    throw new Error("Failed to add product to wishlist.");
  }
}

export async function removeFromWishlist(productId: string): Promise<boolean> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated. Cannot remove from wishlist.");

    return false;
  }

  try {
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return true;
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    // Prisma throws P2025 if item to delete is not found.
    if ((error as any).code === "P2025") {
      // Item not found, which means it's already removed or was never there.
      // Consider this a success or handle as an error based on requirements.
      return true;
    }
    throw new Error("Failed to remove product from wishlist.");
  }
}

export async function getUserWishlist(): Promise<Product[]> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated. Cannot fetch wishlist.");
  }

  try {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: true,
            tags: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return wishlistItems.map((item) => item.product as Product);
  } catch (error) {
    console.error("Error fetching user wishlist:", error);
    throw new Error("Failed to fetch wishlist.");
  }
}

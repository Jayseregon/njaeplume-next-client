// import { PrismaClient as OldDbClient } from "@prisma-db-1/client";
// import { PrismaClient as NewDbClient } from "@prisma-db-2/client";

// export async function migrateData() {
//   const oldDb = new OldDbClient();
//   const newDb = new NewDbClient();

//   try {
//     // Get all tags for lookup
//     const allTags = await oldDb.products_tags.findMany();
//     const tagsMap = new Map(allTags.map((tag) => [tag.slug, tag.name]));

//     // 1. Migrate regular products
//     const oldProducts = await oldDb.products_productdetailsmodel.findMany({
//       include: {
//         products_productimagesmodel: true,
//         products_productdetailsmodel_product_tags: {
//           select: {
//             tags_id: true,
//           },
//         },
//       },
//     });

//     // 2. Migrate freebies
//     const oldFreebies = await oldDb.products_freebiesmodel.findMany();

//     // 3. Process and insert products
//     for (const oldProduct of oldProducts) {
//       // Map tag slugs to names
//       const tagNames = oldProduct.products_productdetailsmodel_product_tags
//         .map((tag) => tagsMap.get(tag.tags_id))
//         .filter(Boolean)
//         .join(",");

//       const newProduct = await newDb.product.create({
//         data: {
//           old_name: oldProduct.name,
//           old_price: parseFloat(oldProduct.price.toString()),
//           old_description: oldProduct.description || null,
//           old_category: oldProduct.category || null,
//           old_zip_file_name: oldProduct.zip_file_name || null,
//           old_slug: oldProduct.slug || null,
//           old_sku: oldProduct.sku || null,
//           old_date_created: oldProduct.date_created,
//           old_date_updated: oldProduct.date_updated,
//           old_tags: tagNames || null,
//           images: {
//             create: oldProduct.products_productimagesmodel.map((img) => ({
//               old_url: img.image || "",
//               old_alt_text: img.alt_text || null,
//             })),
//           },
//         },
//       });

//       console.log(`Migrated product: ${newProduct.old_name}`);
//     }

//     // 4. Process and insert freebies
//     for (const oldFreebie of oldFreebies) {
//       const newFreebie = await newDb.product.create({
//         data: {
//           old_name: oldFreebie.name,
//           old_category: "Freebie",
//           old_zip_file_name: oldFreebie.zip_file_name || null,
//           old_slug: oldFreebie.slug || null,
//           images: {
//             create: [
//               {
//                 old_url: oldFreebie.image || "",
//                 old_alt_text: oldFreebie.alt_text || null,
//               },
//             ],
//           },
//         },
//       });

//       console.log(`Migrated freebie: ${newFreebie.old_name}`);
//     }
//   } catch (error) {
//     console.error("Migration failed:", error);
//     throw error;
//   } finally {
//     await oldDb.$disconnect();
//     await newDb.$disconnect();
//   }
// }

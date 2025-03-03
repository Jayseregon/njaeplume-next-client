import { PrismaClient } from '@prisma/client';
import { Command } from 'commander';
import prompts from 'prompts';
import slug from 'slug'

const program = new Command();

program
  .name('tag-migrate')
  .description('CLI to migrate tags from old_tags string to proper tag relations')
  .version('1.0.0');

// Helper function to normalize tag names
function normalizeTagName(tag: string): string {
  return tag.trim().toLowerCase();
}

// // Helper function to create a slug from a tag name
// function createSlugFromTag(tag: string): string {
//   return slugify(tag.toLowerCase().trim(), { strict: true });
// }

// Then update the createSlugFromTag function
function createSlugFromTag(tag: string): string {
    return slug(tag.toLowerCase().trim());
}

async function migrateTags() {
  const prisma = new PrismaClient();
  
  try {
    // Get all products with old_tags
    const products = await prisma.product.findMany({
      where: {
        old_tags: {
          not: null
        }
      }
    });
    
    console.log(`Found ${products.length} products with tags to process`);
    
    // Track our progress
    let tagsCreated = 0;
    let tagsAssociated = 0;
    let productsUpdated = 0;
    
    // Store all tags to avoid duplicate lookups
    const tagCache = new Map<string, string>(); // name -> id
    
    // Process each product
    for (const product of products) {
      if (!product.old_tags) continue;
      
      // Parse the comma-separated tags
      const tagNames = product.old_tags.split(',')
        .map(normalizeTagName)
        .filter(Boolean); // Remove empty tags
      
      if (tagNames.length === 0) continue;
      
      const tagIds: string[] = [];
      
      // Process each tag
      for (const tagName of tagNames) {
        // Skip if tag is empty
        if (!tagName) continue;
        
        // Check if we've already processed this tag
        if (tagCache.has(tagName)) {
          tagIds.push(tagCache.get(tagName)!);
          continue;
        }
        
        // Check if tag already exists in database
        const slug = createSlugFromTag(tagName);
        let tag = await prisma.tag.findFirst({
          where: {
            OR: [
              { name: tagName },
              { slug }
            ]
          }
        });
        
        // Create tag if it doesn't exist
        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: tagName,
              slug
            }
          });
          tagsCreated++;
          
          console.log(`Created new tag: "${tagName}" (${slug})`);
        }
        
        // Store in cache for future lookups
        tagCache.set(tagName, tag.id);
        tagIds.push(tag.id);
      }
      
      // Associate tags with product
      if (tagIds.length > 0) {
        await prisma.product.update({
          where: {
            id: product.id
          },
          data: {
            tags: {
              connect: tagIds.map(id => ({ id }))
            }
          }
        });
        
        tagsAssociated += tagIds.length;
        productsUpdated++;
        
        console.log(`Associated ${tagIds.length} tags with product: ${product.name || product.id}`);
      }
    }
    
    console.log(`\n=== Migration Summary ===`);
    console.log(`Created ${tagsCreated} new tags`);
    console.log(`Created ${tagsAssociated} tag associations`);
    console.log(`Updated ${productsUpdated} products`);
    
  } catch (error) {
    console.error('Tag migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

program.command('run')
  .description('Run the tag migration')
  .action(async () => {
    const response = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: '⚠️  This will create tags from old_tags field and associate them with products. Are you sure?',
      initial: false
    });

    if (!response.confirm) {
      console.log('Tag migration cancelled');
      return;
    }

    try {
      console.log('Starting tag migration...');
      await migrateTags();
      console.log('✅ Tag migration completed successfully');
    } catch (error) {
      console.error('❌ Tag migration failed:', error);
      process.exit(1);
    }
  });

program.parse();

// INSTRUCTIONS
// Install required packages:
// npm install slugify

// # Run using tsx
// tsx scripts/db/migrate-tags.ts run
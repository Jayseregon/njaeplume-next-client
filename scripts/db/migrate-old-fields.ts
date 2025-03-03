import { PrismaClient, Category } from '@prisma/client';
import { Command } from 'commander';
import prompts from 'prompts';

const program = new Command();

program
  .name('field-migrate')
  .description('CLI to migrate data from old_* fields to permanent fields')
  .version('1.0.0');

// Helper function to map string categories to enum values
function mapToValidCategory(categoryStr: string | null | undefined): Category | undefined {
  if (!categoryStr) return undefined;
  
  // Define mapping from old string values to enum values
  const categoryMapping: Record<string, Category> = {
    'brushes': Category.brushes,
    'stickers': Category.stickers,
    'templates': Category.templates,
    'planners': Category.planners,
    'Freebie': Category.freebies,
    'freebie': Category.freebies,
    'freebies': Category.freebies,
    'Freebies': Category.freebies,
    // Add any other variants as needed
  };
  
  return categoryMapping[categoryStr] || undefined;
}

async function migrateOldFields() {
  const prisma = new PrismaClient();
  
  try {
    // Get all products
    const products = await prisma.product.findMany();
    console.log(`Found ${products.length} products to process`);
    
    let updatedCount = 0;
    
    // Process each product
    for (const product of products) {
      const updateData: any = {};
      
      // Check each field pair and copy if needed
      if (product.old_name && !product.name) updateData.name = product.old_name;
      
      // Handle price: use old_price if exists, otherwise set to 0 if both are null/empty
      if (product.old_price !== null && product.old_price !== undefined && !product.price) {
        updateData.price = product.old_price;
      } else if ((product.price === null || product.price === undefined) && 
                (product.old_price === null || product.old_price === undefined)) {
        updateData.price = 0;
      }
      
      // Handle description: use old_description if exists, otherwise set to 'N/A' if both are null/empty
      if (product.old_description && !product.description) {
        updateData.description = product.old_description;
      } else if (!product.description && !product.old_description) {
        updateData.description = 'N/A';
      }
      
      // Handle category - map from old_category string to enum value
      const validCategory = mapToValidCategory(product.old_category);
      if (validCategory && !product.category) {
        updateData.category = validCategory;
      }
      
      if (product.old_zip_file_name && !product.zip_file_name) updateData.zip_file_name = product.old_zip_file_name;
      if (product.old_slug && !product.slug) updateData.slug = product.old_slug;
      
      // Handle dates - override current values if old dates exist
      if (product.old_date_created) updateData.createdAt = product.old_date_created;
      if (product.old_date_updated) updateData.updatedAt = product.old_date_updated;
      
      // Only update if there's something to update
      if (Object.keys(updateData).length > 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: updateData
        });
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} products successfully`);
    
    // Handle ProductImage migration too
    const images = await prisma.productImage.findMany();
    console.log(`Found ${images.length} product images to process`);
    
    let updatedImageCount = 0;
    
    for (const image of images) {
      const updateData: any = {};
      
      if (image.old_alt_text && !image.alt_text) updateData.alt_text = image.old_alt_text;
      if (image.old_url && !image.url) updateData.url = image.old_url;
      
      if (Object.keys(updateData).length > 0) {
        await prisma.productImage.update({
          where: { id: image.id },
          data: updateData
        });
        updatedImageCount++;
      }
    }
    
    console.log(`Updated ${updatedImageCount} product images successfully`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

program.command('run')
  .description('Run the field migration')
  .action(async () => {
    const response = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: '⚠️  This will move data from old_* fields to their corresponding fields. Are you sure?',
      initial: false
    });

    if (!response.confirm) {
      console.log('Field migration cancelled');
      return;
    }

    try {
      console.log('Starting field migration...');
      await migrateOldFields();
      console.log('✅ Field migration completed successfully');
    } catch (error) {
      console.error('❌ Field migration failed:', error);
      process.exit(1);
    }
  });

program.parse();

// INSTRUCTIONS

// # Install tsx
// npm install -g tsx

// # Run your script with tsx
// tsx scripts/db/migrate-old-fields.ts run
// import { PrismaClient } from '@prisma/client';
// import { Command } from 'commander';
// import prompts from 'prompts';

// const program = new Command();

// program
//   .name('update-image-urls')
//   .description('CLI to update image URLs from images/ to product-images/')
//   .version('1.0.0');

// async function updateImageUrls() {
//   const prisma = new PrismaClient();
  
//   try {
//     // Get all ProductImage records
//     const images = await prisma.productImage.findMany();
//     console.log(`Found ${images.length} product images to process`);
    
//     let updatedCount = 0;
    
//     // Process each image
//     for (const image of images) {
//       // Check if the URL starts with "images/"
//       if (image.url && image.url.startsWith('images/')) {
//         // Update the URL to replace "images/" with "product-images/"
//         const newUrl = image.url.replace('images/', 'product-images/');
        
//         await prisma.productImage.update({
//           where: { id: image.id },
//           data: { url: newUrl }
//         });
        
//         updatedCount++;
//       }
//     }
    
//     console.log(`Updated ${updatedCount} product image URLs successfully`);
    
//   } catch (error) {
//     console.error('URL update failed:', error);
//     throw error;
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// program.command('run')
//   .description('Run the URL update')
//   .action(async () => {
//     const response = await prompts({
//       type: 'confirm',
//       name: 'confirm',
//       message: '⚠️  This will update all image URLs from images/ to product-images/. Are you sure?',
//       initial: false
//     });

//     if (!response.confirm) {
//       console.log('URL update cancelled');
//       return;
//     }

//     try {
//       console.log('Starting URL update...');
//       await updateImageUrls();
//       console.log('✅ URL update completed successfully');
//     } catch (error) {
//       console.error('❌ URL update failed:', error);
//       process.exit(1);
//     }
//   });

// program.parse();

// // INSTRUCTIONS

// // # Run your script with tsx
// // tsx scripts/db/update-image-urls.ts run
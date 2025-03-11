// import { PrismaClient } from '@prisma/client';
// import { Command } from 'commander';
// import prompts from 'prompts';

// const program = new Command();

// program
//   .name('update-zip-file-paths')
//   .description('CLI to update zip file paths to add product-files/ prefix')
//   .version('1.0.0');

// async function updateZipFilePaths() {
//   const prisma = new PrismaClient();
  
//   try {
//     // Get all Product records
//     const products = await prisma.product.findMany();
//     console.log(`Found ${products.length} products to process`);
    
//     let updatedCount = 0;
    
//     // Process each product
//     for (const product of products) {
//       // Check if the zip_file_name doesn't already start with "product-files/"
//       if (product.zip_file_name && !product.zip_file_name.startsWith('product-files/')) {
//         // Update the zip_file_name to prepend "product-files/"
//         const newZipFileName = `product-files/${product.zip_file_name}`;
        
//         await prisma.product.update({
//           where: { id: product.id },
//           data: { zip_file_name: newZipFileName }
//         });
        
//         updatedCount++;
//       }
//     }
    
//     console.log(`Updated ${updatedCount} product zip file paths successfully`);
    
//   } catch (error) {
//     console.error('Zip file path update failed:', error);
//     throw error;
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// program.command('run')
//   .description('Run the zip file path update')
//   .action(async () => {
//     const response = await prompts({
//       type: 'confirm',
//       name: 'confirm',
//       message: '⚠️  This will update all zip file paths to add product-files/ prefix. Are you sure?',
//       initial: false
//     });

//     if (!response.confirm) {
//       console.log('Zip file path update cancelled');
//       return;
//     }

//     try {
//       console.log('Starting zip file path update...');
//       await updateZipFilePaths();
//       console.log('✅ Zip file path update completed successfully');
//     } catch (error) {
//       console.error('❌ Zip file path update failed:', error);
//       process.exit(1);
//     }
//   });

// program.parse();

// // INSTRUCTIONS

// // # Run your script with tsx
// // tsx scripts/db/update-zip-file-paths.ts run
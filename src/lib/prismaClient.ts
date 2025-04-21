/* eslint-disable no-var */
import { PrismaClient } from "@/generated/client";

// Declare a global variable that will be used to share the PrismaClient instance
declare global {
  var prisma: PrismaClient | undefined;
}
/* eslint-enable no-var */

// Initialize the PrismaClient instance
export const prisma = global.prisma || new PrismaClient();

// Assign the PrismaClient instance to the global object to share it
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

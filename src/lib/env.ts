import { config } from "dotenv";

import { envSchema, EnvSchemaType } from "@/lib/envSchema";

// Load environment variables from .env.local
config();

export const validatedEnv: EnvSchemaType = envSchema.parse({
  BUNNY_CDN_PULL_ZONE: process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE_URL,
  BUNNY_STORAGE_REGION: process.env.NEXT_PUBLIC_BUNNY_STORAGE_REGION,
  BUNNY_STORAGE_ZONE_NAME: process.env.NEXT_PUBLIC_BUNNY_STORAGE_ZONE_NAME,
  BUNNY_API_ACCESS_KEY: process.env.NEXT_PUBLIC_BUNNY_API_ACCESS_KEY,
});

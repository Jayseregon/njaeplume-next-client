import { z } from "zod";

export const envSchema = z.object({
  BUNNY_CDN_PULL_ZONE: z.string(),
  BUNNY_STORAGE_REGION: z.string(),
  BUNNY_STORAGE_ZONE_NAME: z.string(),
  BUNNY_API_ACCESS_KEY: z.string(),
});

export type EnvSchemaType = z.infer<typeof envSchema>;

import { z } from "zod";
import { makeTypedEnvironment } from "./lib/makeTypedEnvironment";
import * as process from "node:process";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import dotenv from "dotenv";
dotenv.config();

const envSchema = z.object({
  SESSION_SECRET: z.string(),
  API_URI: z.string(),
  DEPLOYMENT: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export const envConfigCamelCase = makeTypedEnvironment(envSchema.parse)(
  process.env,
);
export const env = envSchema.parse(process.env);
// export const publicEnv = makeTypedEnvironment(publicEnvSchema.safeParse);

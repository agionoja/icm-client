import { z } from "zod";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import dotenv from "dotenv";
dotenv.config();
import { makeTypedEnvironment } from "~/lib";
import * as process from "node:process";

const envSchema = z.object({
  SESSION_SECRET: z.string(),
  API_URI: z.string(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export const envConfigCamelCase = makeTypedEnvironment(envSchema.parse)(
  process.env,
);
export const envConfig = envSchema.parse;
// export const publicEnv = makeTypedEnvironment(publicEnvSchema.safeParse);

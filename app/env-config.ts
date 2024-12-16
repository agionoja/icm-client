import { z } from "zod";
import dotenv from "dotenv/config.js";
import { makeTypedEnvironment } from "~/lib";
import * as process from "node:process";

// console.log(process.env.API_URI);







// const publicEnvSchema = z.object({
//   VITE_DONT_USE_THIS: z.string(),
// });

// const envSchema = publicEnvSchema.extend({
//   MODE: z.enum(["development", "production", "test"]).default("production"),
//   SESSION_SECRET: z.string(),
// });
//
// // Create the environment parsers for public and full schemas.
// export const getPublicEnv = makeTypedEnvironment(publicEnvSchema.safeParse);
//
// export const getEnv = makeTypedEnvironment(envSchema.parse);

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
export const envConfig = envSchema.parse(process.env);
// export const publicEnv = makeTypedEnvironment(publicEnvSchema.safeParse);

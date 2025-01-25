import qs from "qs";
import { z, type ZodSchema } from "zod";

export function parseQueryParams<T extends ZodSchema>(
  request: Request,
  schema: T,
): z.infer<T> {
  const url = new URL(request.url);
  const queryString = url.search.startsWith("?")
    ? url.search.slice(1)
    : url.search;

  // Custom parsing to ensure arrays are properly handled
  const parsedParams = qs.parse(queryString, {
    // Ensure single items are converted to arrays
    arrayLimit: 1000,
    // Force array for specific keys
    parseArrays: true,
    comma: true,
  });

  // Transform single string to array for sort and select
  if (parsedParams.sort && typeof parsedParams.sort === "string") {
    parsedParams.sort = [parsedParams.sort];
  }
  if (parsedParams.select && typeof parsedParams.select === "string") {
    parsedParams.select = [parsedParams.select];
  }

  const parsedSchema = schema.safeParse(parsedParams);

  console.dir(
    { parsedParams, parsedSchema: parsedSchema.data },
    { depth: null },
  );

  return parsedSchema.success ? parsedSchema.data : {};
}

export const baseSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().default(""),
});

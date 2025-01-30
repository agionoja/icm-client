// export function parseQueryParams<TSchema extends ZodSchema>(
//   request: Request,
//   schema: TSchema,
// ): z.infer<TSchema> {
//   const url = new URL(request.url);
//   const queryString = url.search.startsWith("?")
//     ? url.search.slice(1)
//     : url.search;
//
//   // Custom parsing to ensure arrays are properly handled
//   const parsedParams = qs.parse(queryString, {
//     // Ensure single items are converted to arrays
//     arrayLimit: 1000,
//     // Force array for specific keys
//     parseArrays: true,
//     comma: true,
//   });
//
//   // Transform single string to array for sort and select
//   if (parsedParams.sort && typeof parsedParams.sort === "string") {
//     parsedParams.sort = [parsedParams.sort];
//   }
//   if (parsedParams.select && typeof parsedParams.select === "string") {
//     parsedParams.select = [parsedParams.select];
//   }
//
//   const parsedSchema = schema.safeParse(parsedParams);
//
//   console.dir(
//     { parsedParams, parsedSchema: parsedSchema.data },
//     { depth: null },
//   );
//
//   return parsedSchema.success ? parsedSchema.data : {};
// }
import { z, type ZodSchema } from "zod";
import qs from "qs";
import type { SortKey } from "icm-shared";

type QueryParams = Record<string, unknown>;

// Transform sort object to array of sort entries
const transformSortParams = (params: QueryParams): QueryParams => {
  const transformed = { ...params };

  if (
    transformed.sort &&
    typeof transformed.sort === "object" &&
    !Array.isArray(transformed.sort)
  ) {
    const sortEntries: string[] = [];
    for (const [field, direction] of Object.entries(transformed.sort)) {
      const prefix = direction === "desc" ? "-" : "";
      sortEntries.push(`${prefix}${field}`);
    }
    transformed.sort = sortEntries;
  }

  return transformed;
};

export function parseQueryParams<TSchema extends ZodSchema>(
  request: Request,
  schema: TSchema,
): z.infer<TSchema> {
  const url = new URL(request.url);

  // Parse query string with qs using proper options
  const parsedParams = qs.parse(url.search, {
    ignoreQueryPrefix: true,
    arrayLimit: 1000,
    parseArrays: true,
  });

  // Transform sort parameters
  const transformedParams = transformSortParams(parsedParams);

  // Ensure array format for sort and select
  ["sort", "select"].forEach((key) => {
    const value = transformedParams[key];
    if (typeof value === "string") {
      transformedParams[key] = [value];
    }
  });

  const result = schema.safeParse(transformedParams);

  if (import.meta.env.DEV) {
    console.dir({ parsedParams, transformedParams }, { depth: null });
  }

  if (!result.success) {
    console.error("Query params validation error:", result.error);
    return {} as z.infer<TSchema>;
  }

  return result.data;
}

type BaseSchemaOptions<TData extends object> = {
  sortDefault?: SortKey<TData>[];
};

// Base schema factory remains the same
export const baseSchemaFactory = <TData extends object>({
  sortDefault = [],
}: BaseSchemaOptions<TData>) => {
  return z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce
      .number()
      .default(10)
      .transform((value) => Math.min(100, Math.max(10, value))),
    search: z.string().optional(),
    sort: z.array(z.custom<SortKey<TData>>()).default(sortDefault),
  });
};

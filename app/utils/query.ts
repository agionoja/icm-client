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

/**
 * Functional programming utility for parsing and validating query parameters using Zod.
 * Ensures strong type inference, especially for filters.
 */
import { z, type ZodSchema, type ZodTypeAny } from "zod";
import qs from "qs";
import type { SelectKey, SortKey } from "icm-shared";

/**
 * Type definition for query parameters.
 */
type QueryParams = Record<string, unknown>;

/**
 * Transforms sort and select object syntax into arrays.
 * @param {QueryParams} params - The query parameters to transform.
 * @returns {QueryParams} - The transformed parameters.
 */
const transformParams = (params: QueryParams): QueryParams => {
  return {
    ...params,
    sort: transformSort(params.sort),
    select: transformSelect(params.select),
  };
};

/**
 * Transforms sort object to array syntax.
 * @param {unknown} sort - The sort parameter.
 * @returns {string[] | undefined} - Transformed sort array or undefined.
 */
const transformSort = (sort: unknown): string[] | undefined => {
  if (!sort || typeof sort !== "object" || Array.isArray(sort))
    return undefined;
  return Object.entries(sort).map(([field, direction]) =>
    direction === "desc" ? `-${field}` : field,
  );
};

/**
 * Transforms select object to array syntax.
 * @param {unknown} select - The select parameter.
 * @returns {string[] | undefined} - Transformed select array or undefined.
 */
const transformSelect = (select: unknown): string[] | undefined => {
  if (!select || typeof select !== "object" || Array.isArray(select))
    return undefined;
  return Object.entries(select).map(([field, value]) => {
    const numValue = Number(value);
    return numValue === 0 ? `-${field}` : numValue === 2 ? `+${field}` : field;
  });
};

/**
 * Parses and validates query parameters using Zod.
 * @template TSchema - The Zod schema type.
 * @param {Request} request - The request containing the query parameters.
 * @param {TSchema} schema - The Zod schema to validate against.
 * @returns {z.infer<TSchema>} - The validated and parsed query parameters.
 */
export const parseQueryParams = <TSchema extends ZodSchema>(
  request: Request,
  schema: TSchema,
): z.infer<TSchema> => {
  const url = new URL(request.url);
  const parsedParams = qs.parse(url.search, {
    ignoreQueryPrefix: true,
    arrayLimit: 1000,
    parseArrays: true,
  });

  const transformedParams = transformParams(parsedParams);

  // Ensure single values become arrays for sort and select
  ["sort", "select"].forEach((key) => {
    if (typeof transformedParams[key] === "string") {
      transformedParams[key] = [transformedParams[key]];
    }
  });

  const result = schema.safeParse(transformedParams);

  if (import.meta.env.DEV) {
    console.dir({ parsedParams, transformedParams }, { depth: null });
  }

  return result.success ? result.data : ({} as z.infer<TSchema>);
};

/**
 * Schema factory to generate a Zod schema with inferred types for filtering.
 * @template TData - The data type for filtering.
 */

export const schemaFactory = <TData extends object>() => {
  return z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce
      .number()
      .default(10)
      .transform((value) => Math.min(100, Math.max(10, value))),
    search: z.string().optional(),
    sort: z.array(z.custom<SortKey<TData>>()).optional(),
    select: z.array(z.custom<SelectKey<TData>>()).optional(),
  });
};

import { z, ZodType } from "zod";
import qs from "qs";

/**
 * Represents the definition of a route, including path, file location,
 * and optional parameters for path and query validation.
 *
 * @template TPathParams - Schema for path parameters.
 * @template TQueryParams - Schema for query parameters.
 */
export interface RouteDefinition<
  TPathParams extends Record<string, ZodType> = Record<string, ZodType>,
  TQueryParams extends Record<string, ZodType> = Record<string, ZodType>,
> {
  /** The URL path pattern for the route (e.g., "/user/:id"). */
  path: string;
  /** The file path to the route handler. */
  file: string;
  /** An optional prefix for the route (e.g., for grouping or versioning). */
  prefix?: string;
  /** Schema for validating dynamic path parameters in the route. */
  params?: TPathParams;
  /** Schema for validating query parameters in the route. */
  queryParams?: TQueryParams;
}

/**
 * Builds and validates routes with dynamic path and query parameters.
 *
 * @template TPathParams - Schema for path parameters.
 * @template TQueryParams - Schema for query parameters.
 */
export class RouteBuilder<
  TPathParams extends Record<string, ZodType> = {},
  TQueryParams extends Record<string, ZodType> = {},
> {
  /**
   * Constructs a RouteBuilder instance.
   *
   * @param {RouteDefinition<TPathParams, TQueryParams>} route - The route definition.
   */
  constructor(private route: RouteDefinition<TPathParams, TQueryParams>) {}

  /**
   * Generates a URL for the route by replacing dynamic path parameters,
   * appending query parameters, and including the prefix if defined.
   *
   * @param {z.infer<z.ZodObject<TPathParams>>} [pathParams] - The dynamic path parameters to replace placeholders.
   * @param {Partial<z.infer<z.ZodObject<TQueryParams>>>} [queryParams] - The query parameters to append to the URL.
   * @returns {string} The generated URL.
   * @throws {Error} If required path or query parameters are invalid or missing.
   */
  generate(
    pathParams: z.infer<z.ZodObject<TPathParams>> = {} as z.infer<
      z.ZodObject<TPathParams>
    >,
    queryParams: Partial<z.infer<z.ZodObject<TQueryParams>>> = {},
  ): string {
    this.validatePathParams(pathParams);
    this.validateQueryParams(queryParams);

    let url = this.route.path.replace(/:(\w+)/g, (_, key) => {
      const value = pathParams[key as keyof typeof pathParams];
      if (value === undefined) {
        throw new Error(`Missing required path parameter: ${key}`);
      }
      return String(value);
    });

    // Add the prefix if it exists
    if (this.route.prefix) {
      url = `${this.route.prefix}/${url}`.replace(/\/+/g, "/"); // Ensure no double slashes
    }

    const queryString = this.buildQueryString(queryParams);
    return queryString ? `${url}?${queryString}` : url;
  }

  /**
   * Validates the provided path parameters against the defined schema.
   *
   * @private
   * @param {z.infer<z.ZodObject<TPathParams>>} params - The path parameters to validate.
   * @throws {Error} If validation fails.
   */
  private validatePathParams(params: z.infer<z.ZodObject<TPathParams>>) {
    if (!this.route.params) return;

    const schema = z.object(this.route.params);
    try {
      schema.parse(params);
    } catch (error) {
      throw new Error(`Path parameter validation error: ${error}`);
    }
  }

  /**
   * Validates the provided query parameters against the defined schema.
   *
   * @private
   * @param {Partial<z.infer<z.ZodObject<TQueryParams>>>} params - The query parameters to validate.
   * @throws {Error} If validation fails.
   */
  private validateQueryParams(
    params: Partial<z.infer<z.ZodObject<TQueryParams>>>,
  ) {
    if (!this.route.queryParams) return;

    const schema = z.object(this.route.queryParams);
    try {
      schema.partial().parse(params); // Allow partial query params
    } catch (error) {
      throw new Error(`Query parameter validation error: ${error}`);
    }
  }

  /**
   * Builds a query string from the provided query parameters.
   *
   * @private
   * @param {Partial<z.infer<z.ZodObject<TQueryParams>>>} queryParams - The query parameters.
   * @returns {string} The serialized query string.
   */
  private buildQueryString(
    queryParams: Partial<z.infer<z.ZodObject<TQueryParams>>>,
  ): string {
    const filteredParams = Object.fromEntries(
      Object.entries(queryParams).filter(([, value]) => value !== undefined),
    );

    return qs.stringify(filteredParams, {
      encode: true,
      skipNulls: true,
    });
  }

  /** @returns {string} The file path to the route handler. */
  get getFile(): string {
    return this.route.file;
  }

  /** @returns {string} The URL path pattern for the route. */
  get getPath(): string {
    return this.route.path;
  }

  /** @returns {string | undefined} The optional prefix for the route. */
  get getPrefix() {
    return this.route.prefix;
  }
}

/**
 * Helper function to create a RouteBuilder instance with type safety.
 *
 * @template TPathParams - Schema for path parameters.
 * @template TQueryParams - Schema for query parameters.
 * @param {RouteDefinition<TPathParams, TQueryParams>} route - The route definition.
 * @returns {RouteBuilder<TPathParams, TQueryParams>} A new RouteBuilder instance.
 */
export function defineRoute<
  TPathParams extends Record<string, ZodType> = {},
  TQueryParams extends Record<string, ZodType> = {},
>(
  route: RouteDefinition<TPathParams, TQueryParams>,
): RouteBuilder<TPathParams, TQueryParams> {
  return new RouteBuilder(route);
}

/**
 * Applies a prefix to an array of routes.
 *
 * @param prefix - The prefix to apply to the routes
 * @param routes - An array of routes to prefix
 * @returns An array of prefixed routes
 */
export function prefix<
  TPathParams extends Record<string, z.ZodType> = {},
  TQueryParams extends Record<string, z.ZodType> = {},
>(
  prefix: string,
  routes: RouteDefinition<TPathParams, TQueryParams>[],
): RouteDefinition<TPathParams, TQueryParams>[] {
  return routes.map((route) => ({
    ...route,
    path: `${prefix}/${route.path}`.replace(/\/+/g, "/"),
  }));
}

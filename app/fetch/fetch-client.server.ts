import type { FormEncType } from "react-router";
import type {
  ApiResponseMany,
  ApiResponseOne,
  IQueryBuilder,
  IApiException,
} from "icm-shared";
// import { envConfigCamelCase } from "~/env-config.server";
import qs from "qs";
import { logger } from "~/fetch/logger";
import { type ProgressArgs, ProgressMonitor } from "~/fetch/progess";

/** HTTP methods supported by the fetch client */
export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Interface to indicate paginated responses at type level.
 * Used as a generic parameter to fetchClient to determine return type.
 * @example
 * ```ts
 * fetchClient<User, "users", User, Paginated>('/users', options)
 * ```
 */
export interface Paginated {
  readonly __isPaginated: true;
}

/**
 * Interface to indicate non-paginated responses at type level.
 * This is the default type parameter for fetchClient.
 * @example
 * ```ts
 * fetchClient<User, "user", User>('/users/1', options)
 * ```
 */
export interface NonPaginated {
  readonly __isPaginated: false;
}

/** Custom headers type extending standard headers with auth and content type */
type Headers = {
  "Content-Type"?: FormEncType;
  Authorization?: `Bearer ${string}` | "";
} & { [key: string]: string };

/**
 * Options for the fetch client request
 * @template TReturnType - The type of data being returned
 * @template Key - The key in the response object where the data is located
 * @template TQueryType - The type of query parameters (defaults to TReturnType)
 */
export type FetchOptions<
  TReturnType,
  Key extends string,
  TQueryType = TReturnType,
> = Omit<RequestInit, "method" | "headers"> & {
  /** HTTP method for the request */
  method?: Method;
  /** Custom headers to include in the request */
  headers?: Headers;
  /** Whether the request contains FormData */
  isFormData?: boolean;
  /** Query parameters builder for the request */
  query?: IQueryBuilder<TQueryType>;
  /** Authentication token */
  token?: string;
  /** Whether the response includes metadata */
  hasMetadata?: boolean;
  /** Key in the response object where the data is located */
  responseKey: Key;
  /** Progress monitoring configuration */
  progressArgs?: Omit<ProgressArgs, "contentLength"> & { turnOff?: boolean };
};

/**
 * Generic fetch client for making HTTP requests with type-safe responses
 *
 * @template TReturnType - The type of data being returned
 * @template Key - The key in the response object where the data is located
 * @template TQueryType - The type of query parameters (defaults to TReturnType)
 * @template TPagination - Controls whether the response is paginated (defaults to NonPaginated)
 *
 * @param endpoint - The API endpoint to call (must start with '/')
 * @param options - Configuration options for the request
 *
 * @returns Promise resolving to either ApiResponseMany or ApiResponseOne based on TPagination
 *
 * @throws {Error} When responseKey is not provided
 *
 * @example
 * ```typescript
 * // Fetch a single user
 * const response = await fetchClient<User, "user">('/users/1', {
 *   responseKey: 'user'
 * });
 *
 * // Fetch paginated users
 * const users = await fetchClient<User, "users", User, Paginated>('/users', {
 *   responseKey: 'users',
 *   query: { page: 1, limit: 10 }
 * });
 *
 * // Post form data
 * const result = await fetchClient<UploadResult, "result">('/upload', {
 *   method: 'POST',
 *   isFormData: true,
 *   responseKey: 'result',
 *   body: formData,
 *   progressArgs: {
 *     onProgress: (progress) => console.log(progress)
 *   }
 * });
 * ```
 */
export async function fetchClient<
  TReturnType,
  Key extends string,
  TQueryType = TReturnType,
  TPagination extends Paginated | NonPaginated = NonPaginated,
>(
  endpoint: `/${string}`,
  {
    isFormData = false,
    headers = {},
    responseKey,
    progressArgs,
    token,
    query,
    ...rest
  }: FetchOptions<TReturnType, Key, TQueryType>,
): Promise<
  TPagination extends Paginated
    ? ApiResponseMany<TReturnType, Key>
    : ApiResponseOne<TReturnType, Key>
> {
  if (!responseKey) throw new Error("Response Key is required");

  let api = `${process.env.API_URI}${endpoint}`;
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const queryString = query ? qs.stringify(query, { encode: true }) : "";
  const method = (rest.method || "GET") as Method;
  if (method === "GET" && queryString) {
    api = `${api}?${queryString}`;
  }
  const startTime = Date.now();

  try {
    const response = await fetch(api, {
      method,
      ...rest,
      headers: {
        ...headers,
      },
    });

    const responseSize = parseInt(
      response.headers.get("content-length") || "0",
    );

    if (!response.ok) {
      logger.logRequest(
        method,
        endpoint,
        queryString,
        startTime,
        response,
        null,
        responseSize,
      );

      const error: IApiException = await response.json().catch(() => ({
        message: "Unexpected error",
        statusCode: response.status,
        status: response.statusText,
        error: "FetchError",
        timestamp: new Date().toISOString(),
        path: endpoint,
        errors: null,
      }));
      return { exception: error, data: null, message: null };
    }

    logger.logRequest(
      method,
      endpoint,
      queryString,
      startTime,
      response,
      null,
      responseSize,
    );

    let responseBody: ReadableStream<Uint8Array> | null = response.body;

    if (progressArgs?.onProgress && responseBody && !progressArgs.turnOff) {
      const progressStream = ProgressMonitor.createProgressStream({
        contentLength: responseSize,
        ...progressArgs,
      });
      responseBody = responseBody.pipeThrough(progressStream);
    }

    const jsonResponse = await (responseBody
      ? new Response(responseBody).json()
      : response.json());

    const transformedResponse = {
      ...jsonResponse,
      data: {
        [responseKey]: jsonResponse.data
          ? jsonResponse.data[Object.keys(jsonResponse.data)[0]]
          : null,
      },
    };

    return transformedResponse as TPagination extends Paginated
      ? ApiResponseMany<TReturnType, Key>
      : ApiResponseOne<TReturnType, Key>;
  } catch (err) {
    logger.logRequest(method, endpoint, queryString, startTime, null, err);

    const error: IApiException = {
      message: "Oh no, something went very wrong",
      statusCode: 500,
      status: "INTERNAL_SERVER_ERROR",
      error: "FetchError",
      timestamp: new Date().toISOString(),
      path: endpoint,
      errors: null,
    };

    return {
      exception: error,
      data: null,
      message: null,
    };
  }
}

/**
 * Universal date reviver that handles multiple date string formats
 * - ISO dates: "2024-12-07T07:04:56.654Z"
 * - .NET dates: "/Date(1234567890)/"
 * - ISO-like dates: "2024-12-07" or "2024-12-07T07:04:56"
 */
export function dateReviver(_key: string, value: any): any {
  if (typeof value !== "string") {
    return value;
  }

  // Handle .NET dates "/Date(1234567890)/"
  const msDatePattern = /^\/Date\((\d+)\)\/$/;
  const msMatch = msDatePattern.exec(value);
  if (msMatch) {
    return new Date(+msMatch[1]);
  }

  // Handle ISO 8601 and similar formats
  // Matches dates like:
  // 2024-12-07T07:04:56.654Z
  // 2024-12-07T07:04:56Z
  // 2024-12-07T07:04:56
  // 2024-12-07
  const isoPattern =
    /^(\d{4}-\d{2}-\d{2})(T(\d{2}:?\d{2}:?\d{2})(.\d{1,3})?Z?)?$/;
  const isoMatch = isoPattern.exec(value);
  if (isoMatch) {
    const parsedDate = new Date(value);
    return isNaN(parsedDate.getTime()) ? value : parsedDate;
  }

  return value;
}

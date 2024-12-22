import type { FormEncType } from "react-router";
import type {
  ApiResponseMany,
  ApiResponseOne,
  IQueryBuilder,
  IApiException,
} from "icm-shared";
import qs from "qs";
import { logger } from "~/fetch/logger";
import { type ProgressArgs, ProgressMonitor } from "~/fetch/progess";

/** HTTP methods supported by the fetch client */
export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Marker interface for paginated responses.
 * Ensures type safety for methods dealing with pagination.
 */
export interface Paginated {
  readonly __isPaginated: true;
}

/**
 * Marker interface for non-paginated responses.
 * Ensures type safety for methods not dealing with pagination.
 */
export interface NonPaginated {
  readonly __isPaginated: false;
}

/**
 * Headers object type for HTTP requests.
 * Includes optional `Content-Type` and `Authorization` headers,
 * and allows custom headers via a string key-value map.
 */
type Headers = {
  "Content-Type"?: FormEncType;
  Authorization?: `Bearer ${string}` | "";
} & { [key: string]: string };

/**
 * Options for the fetch client.
 *
 * @template TReturnType - The expected return type of the response.
 * @template Key - The key used to extract the main data object from the response.
 * @template TQueryType - The type of data used for query generation.
 */
export type FetchOptions<
  TReturnType,
  Key extends string,
  TQueryType = TReturnType,
> = Omit<RequestInit, "method" | "headers"> & {
  /** HTTP method (e.g., GET, POST) */
  method?: Method;
  /** Headers for the request */
  headers?: Headers;
  /** Whether the request contains FormData */
  isFormData?: boolean;
  /** Query builder for filtering, sorting, and pagination */
  query?: IQueryBuilder<TQueryType>;
  /** Authorization token for the request */
  token?: string;
  /** Flag to include metadata in the response */
  hasMetadata?: boolean;
  /** Key to extract the primary data from the response */
  responseKey: Key;
  /** Options for monitoring progress of the request */
  progressArgs?: Omit<ProgressArgs, "contentLength"> & { turnOff?: boolean };
};

/**
 * Universal date reviver that handles multiple date string formats.
 * Converts:
 * - ISO dates (e.g., "2024-12-07T07:04:56.654Z")
 * - .NET dates (e.g., "/Date(1234567890)/")
 * - ISO-like dates (e.g., "2024-12-07" or "2024-12-07T07:04:56")
 *
 * @param _key - The key of the JSON property being parsed.
 * @param value - The value of the JSON property.
 * @returns The parsed value, with strings converted to `Date` where applicable.
 */
export function dateReviver(_key: string, value: any): any {
  if (typeof value !== "string") {
    return value;
  }

  const msDatePattern = /^\/Date\((\d+)\)\/$/;
  const msMatch = msDatePattern.exec(value);
  if (msMatch) {
    return new Date(+msMatch[1]);
  }

  const isoPattern =
    /^(\d{4}-\d{2}-\d{2})(T(\d{2}:?\d{2}:?\d{2})(.\d{1,3})?Z?)?$/;
  const isoMatch = isoPattern.exec(value);
  if (isoMatch) {
    const parsedDate = new Date(value);
    return isNaN(parsedDate.getTime()) ? value : parsedDate;
  }

  return value;
}

/**
 * Helper function to parse JSON with the `dateReviver` function.
 *
 * @param response - The `Response` object from a fetch request.
 * @returns The parsed JSON object, with dates revived.
 */
async function parseJsonWithDates(response: Response): Promise<any> {
  const text = await response.text();
  return JSON.parse(text, dateReviver);
}

/**
 * Fetch client that handles API requests with support for query builders,
 * token-based authentication, progress monitoring, and response transformation.
 *
 * @template TReturnType - The expected type of the data in the response.
 * @template Key - The key used to extract the primary data from the response.
 * @template TQueryType - The type of data used for query generation.
 * @template TPagination - Indicates whether the response is paginated or not.
 *
 * @param endpoint - The API endpoint to fetch (e.g., `/users`).
 * @param options - Configuration options for the fetch request.
 * @returns The parsed API response, either as paginated or non-paginated data.
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

      const error: IApiException = await parseJsonWithDates(response).catch(
        () => ({
          message: "Unexpected error",
          statusCode: response.status,
          status: response.statusText,
          error: "FetchError",
          timestamp: new Date().toISOString(),
          path: endpoint,
          errors: null,
        }),
      );
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
      ? parseJsonWithDates(new Response(responseBody))
      : parseJsonWithDates(response));

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

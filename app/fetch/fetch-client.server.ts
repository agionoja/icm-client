import type { FormEncType } from "react-router";
import type {
  ApiResponseMany,
  ApiResponseOne,
  IApiException,
  IQueryBuilder,
} from "icm-shared";
import qs from "qs";
import { env } from "~/env-config.server";
import { dateReviver } from "~/utils/date-reviver";
import { createProgressStream, type ProgressInfo } from "~/fetch/progess"; // FP-style progress function
import { logger } from "~/fetch/logger"; // FP-style logger

/** HTTP methods supported by the fetch client */
export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface Paginated {
  readonly __isPaginated: true;
}
export interface NonPaginated {
  readonly __isPaginated: false;
}

export type ResponseKey<K extends string> = { responseKey: K };

type Headers = {
  "Content-Type"?: FormEncType;
  Authorization?: `Bearer ${string}` | "";
} & { [key: string]: string };

/**
 * The progress args passed to the fetch client.
 *
 * Note: We remove contentLength because that is determined
 * from the response's headers.
 */
export type ProgressArgs = {
  onProgress: (info: ProgressInfo) => void;
  updateInterval?: number;
  throttleSpeed?: number;
} & { turnOff?: boolean };

export type FetchOptions<
  TReturnType,
  TKey extends ResponseKey<string>,
  TQueryType = TReturnType,
> = Omit<RequestInit, "method" | "headers"> & {
  method?: Method;
  headers?: Headers;
  isFormData?: boolean;
  query?: IQueryBuilder<TQueryType>;
  token?: string;
  responseKey: TKey["responseKey"];
  progressArgs?: ProgressArgs;
};

// Utility Functions
async function parseJsonWithDates(response: Response) {
  const text = await response.text();
  return JSON.parse(text, dateReviver);
}

function buildQueryString<T>(query?: IQueryBuilder<T>): string {
  return query ? qs.stringify(query, { encode: true }) : "";
}

function buildApiUrl(
  endpoint: `/${string}`,
  method: Method,
  queryString: string,
): string {
  const baseUrl = env.API_URI;
  const url = `${baseUrl}${endpoint}`;
  return method === "GET" && queryString ? `${url}?${queryString}` : url;
}

function createHeaders(options: {
  isFormData: boolean;
  token?: string;
  headers?: Headers;
}): Headers {
  const { isFormData, token, headers = {} } = options;

  // Remove Content-Type for FormData requests
  const cleanedHeaders = isFormData
    ? Object.fromEntries(
        Object.entries(headers).filter(
          ([key]) => key.toLowerCase() !== "content-type",
        ),
      )
    : headers;

  return {
    ...cleanedHeaders,
    ...(!isFormData && !cleanedHeaders["Content-Type"]
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponseError(
  response: Response,
  endpoint: string,
): Promise<IApiException> {
  return await parseJsonWithDates(response).catch(() => ({
    message: "Unexpected error",
    statusCode: response.status,
    status: response.statusText,
    error: "FetchError",
    timestamp: new Date().toISOString(),
    path: endpoint,
    errors: null,
  }));
}

/**
 * Sets up the FP-style progress monitor on the response body.
 * If progressArgs.onProgress exists and progress is not turned off,
 * it reads the content-length from the response headers and creates
 * a TransformStream using createProgressStream. Otherwise, returns
 * the original response.body.
 */
function setupProgressMonitor(
  response: Response,
  progressArgs?: ProgressArgs,
): ReadableStream<Uint8Array> | null {
  if (!progressArgs?.onProgress || progressArgs.turnOff || !response.body) {
    return response.body;
  }

  const contentLength = parseInt(
    response.headers.get("content-length") || "0",
    10,
  );
  // Call the FP-style createProgressStream by passing contentLength, onProgress callback,
  // and options (throttleSpeed, updateInterval)
  const progressStream = createProgressStream(
    contentLength,
    progressArgs.onProgress,
    {
      throttleSpeed: progressArgs.throttleSpeed,
      updateInterval: progressArgs.updateInterval,
    },
  );
  return response.body.pipeThrough(progressStream);
}

function transformResponseData<T, K extends string>(
  jsonResponse: any,
  responseKey: K,
): { data: { [key in K]: T } } {
  return {
    ...jsonResponse,
    data: {
      [responseKey]: jsonResponse.data
        ? jsonResponse.data[Object.keys(jsonResponse.data)[0]]
        : null,
    },
  };
}

// Main Fetch Client
export async function fetchClient<
  TReturnType,
  TKey extends ResponseKey<string>,
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
  }: FetchOptions<TReturnType, TKey, TQueryType>,
): Promise<
  TPagination extends Paginated
    ? ApiResponseMany<TReturnType, TKey["responseKey"]>
    : ApiResponseOne<TReturnType, TKey["responseKey"]>
> {
  if (!responseKey) throw new Error("Response Key is required");

  const method = rest.method || "GET";
  const queryString = buildQueryString(query);
  const apiUrl = buildApiUrl(endpoint, method, queryString);
  const requestHeaders = createHeaders({ isFormData, token, headers });
  const startTime = Date.now();

  try {
    const response = await fetch(apiUrl, {
      method,
      headers: requestHeaders,
      ...rest,
    });

    const responseSize = parseInt(
      response.headers.get("content-length") || "0",
      10,
    );

    if (!response.ok) {
      const error = await handleResponseError(response, endpoint);
      logger.logRequest(
        method,
        endpoint,
        queryString,
        startTime,
        response.status,
        responseSize,
        error as unknown as Error,
      );
      return { exception: error, data: null, message: null };
    }

    logger.logRequest(
      method,
      endpoint,
      queryString,
      startTime,
      response.status,
      responseSize,
    );

    // Use the FP-style progress monitor if applicable
    const responseBody = setupProgressMonitor(response, progressArgs);
    const responseToParse = responseBody
      ? new Response(responseBody)
      : response;
    const jsonResponse = await parseJsonWithDates(responseToParse);
    const transformedResponse = transformResponseData<
      TReturnType,
      TKey["responseKey"]
    >(jsonResponse, responseKey);

    return transformedResponse as TPagination extends Paginated
      ? ApiResponseMany<TReturnType, TKey["responseKey"]>
      : ApiResponseOne<TReturnType, TKey["responseKey"]>;
  } catch (err) {
    const error = {
      message: (err as Error).message || "Network error",
      statusCode: 500,
      status: "INTERNAL_SERVER_ERROR",
      error: "FetchError",
      timestamp: new Date().toISOString(),
      path: endpoint,
      errors: null,
    };

    logger.logRequest(
      method,
      endpoint,
      queryString,
      startTime,
      500,
      0,
      error as unknown as Error,
    );

    return { exception: error, data: null, message: null };
  }
}

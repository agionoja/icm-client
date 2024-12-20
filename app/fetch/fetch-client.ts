import type { FormEncType } from "react-router";
import type {
  ApiResponseMany,
  ApiResponseOne,
  IQueryBuilder,
  IApiException,
} from "icm-shared";
import { envConfigCamelCase } from "~/env-config";
import qs from "qs";
import { logger } from "~/fetch/logger";
import { type ProgressArgs, ProgressMonitor } from "~/fetch/progess";

export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type Headers = {
  "Content-Type"?: FormEncType;
  Authorization?: `Bearer ${string}` | "";
} & { [key: string]: string };

// Enhanced options to include progress callback and query type
export type FetchOptions<
  TReturnType,
  Key extends string,
  TQueryType = TReturnType,
> = Omit<RequestInit, "method" | "headers"> & {
  method?: Method;
  headers?: Headers;
  isFormData?: boolean;
  query?: IQueryBuilder<TQueryType>;
  token?: string;
  hasMetadata?: boolean;
  // This is the key to access the api response
  responseKey: Key;
  progressArgs?: Omit<ProgressArgs, "contentLength"> & { turnOff?: boolean };
};

export async function fetchClient<
  TReturnType,
  Key extends string,
  TQueryType = TReturnType,
  IsPaginated extends boolean = false,
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
  IsPaginated extends true
    ? ApiResponseMany<TReturnType, Key>
    : ApiResponseOne<TReturnType, Key>
> {
  if (!responseKey) throw new Error("Response Key is required");

  let api = `${envConfigCamelCase.apiUri}${endpoint}`;
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const queryString = query ? qs.stringify(query, { encode: true }) : "";
  if (
    rest.method !== "PUT" &&
    rest.method !== "DELETE" &&
    rest.method !== "POST" &&
    rest.method !== "PATCH" &&
    queryString
  ) {
    api = `${api}?${queryString}`;
  }

  const startTime = Date.now();
  const method = (rest.method || "GET") as Method;

  try {
    const response = await fetch(api, {
      method,
      ...rest,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
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

    // Handle progress monitoring if callback is provided
    let responseBody: ReadableStream<Uint8Array> | null = response.body;

    if (progressArgs?.onProgress && responseBody && !progressArgs.turnOff) {
      // Create progress stream
      const progressStream = ProgressMonitor.createProgressStream({
        contentLength: responseSize,
        ...progressArgs,
      });

      // Pipe the response through the progress monitor
      responseBody = responseBody.pipeThrough(progressStream);
    }

    // Convert stream to JSON
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

    return transformedResponse as IsPaginated extends true
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

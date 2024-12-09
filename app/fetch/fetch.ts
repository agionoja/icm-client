// import { FormEncType } from "react-router";
// import { FindManyDto, HttpStatus, IApiException } from "@agionoja/icm-shared";
// import { ProgressArgs } from "~/fetch/progess";
// import { envConfigCamelCase } from "~/env-config";
// import qs from "qs";
// import { logger } from "~/fetch/logger";
//
// type FetchMethod = "POST" | "DELETE" | "PATCH" | "GET";
// type FetchBody =
//   | File
//   | FormData
//   | { [key: string]: string }
//   | string
//   | URLSearchParams;
// type FetchHeaders = {
//   "Content-Type"?: FormEncType;
//   Authorization?: `Bearer ${string}`;
// } & { [key: string]: string };
//
// type FetchInit = Omit<RequestInit, "headers" | "method" | "body"> & {
//   body: FetchBody;
// } & { method: FetchMethod } & { headers: FetchHeaders };
//
// interface FetchOptions<T, Key extends string> {
//   query?: FindManyDto<T>;
//   responseKey: Key;
//   progressArgs?: Omit<ProgressArgs, "contentLength">;
//   isFormData?: boolean;
// }
//
// export class FetchClient<T, Key extends string> {
//   api = envConfigCamelCase.apiLocal;
//   constructor(
//     private readonly endpoint: `/${string}`,
//     private readonly fetchOptions: FetchOptions<T, Key>,
//     private readonly fetchInit?: FetchInit,
//   ) {}
//   async login() {}
//   async register() {}
//   async update() {}
//   async findOne() {}
//   async delete() {}
//   async findMany() {}
//
//   private async fetch() {
//     const fetchInit = this.fetchInit;
//
//     const headers = this.setDefaultContentType(
//       this.fetchOptions?.isFormData,
//       this.fetchInit?.headers,
//     );
//     const api = this.parseApiEndpoint(
//       this.api,
//       this.fetchInit?.method,
//       this.fetchOptions?.query,
//     );
//
//     const startTime = Date.now();
//     try {
//       const responseHeaders = await fetch(this.api, {
//         ...fetchInit,
//         headers,
//         method: this.fetchInit?.method || "GET",
//         body: fetchInit?.body ? this.parseBody(fetchInit?.body) : undefined,
//       });
//
//       const responseSize = parseInt(
//         responseHeaders.headers.get("content-length") || "0",
//       );
//
//       if (!responseHeaders.ok || !responseHeaders.redirected) {
//         // Log the request
//         this.logger({
//           startTime,
//           responseSize,
//           response: responseHeaders,
//           method: this.fetchInit?.method || "GET",
//           endpoint: this.endpoint,
//           queryString: api.split("?")[1] || null,
//         });
//         const error: IApiException = await responseHeaders
//           .json()
//           .catch(() => this.notOkError(responseHeaders));
//
//         return { exception: error, data: null };
//       }
//
//       // Log the request
//       this.logger({
//         startTime,
//         responseSize,
//         response: responseHeaders,
//         method: this.fetchInit?.method || "GET",
//         endpoint: this.endpoint,
//         queryString: api.split("?")[1] || null,
//       });
//     } catch (err) {
//       // Log the request
//       this.logger({
//         startTime,
//         responseSize,
//         response: responseHeaders,
//         method: this.fetchInit?.method || "GET",
//         endpoint: this.endpoint,
//         queryString: "",
//       });
//     }
//   }
//
//   private setDefaultContentType(
//     isFormData = false,
//     headers: FetchHeaders = {},
//   ) {
//     if (!isFormData) {
//       const newHeaders = { ...headers };
//       newHeaders["Content-Type"] = "application/json";
//       return newHeaders;
//     } else return headers;
//   }
//
//   private parseBody(body: FetchInit["body"]) {
//     if (typeof body === "object" && body !== null && !Array.isArray(body)) {
//       return JSON.stringify(body);
//     } else {
//       return body;
//     }
//   }
//
//   private parseApiEndpoint(
//     api: string,
//     method: FetchMethod = "GET",
//     query = {},
//   ) {
//     if (method === "GET") {
//       const queryString = qs.stringify(query);
//       return `${api}${this.endpoint}?${queryString}`;
//     } else {
//       return `${api}${this.endpoint}`;
//     }
//   }
//
//   private notOkError(response: Response): IApiException {
//     return {
//       message: "Unexpected error",
//       statusCode: response.status,
//       status: "INTERNAL_SERVER_ERROR",
//       error: "FetchError",
//       timestamp: new Date().toISOString(),
//       path: this.endpoint,
//       errors: null,
//     };
//   }
//
//   private fetchError(): IApiException {
//     return {
//       message: "Oh no, something went very wrong",
//       statusCode: 500,
//       status: "INTERNAL_SERVER_ERROR",
//       error: "FetchError",
//       timestamp: new Date().toISOString(),
//       path: this.endpoint,
//       errors: null,
//     };
//   }
//
//   private logger({
//     method,
//     endpoint,
//     queryString,
//     startTime,
//     response,
//     responseSize,
//   }: {
//     method: FetchMethod;
//     endpoint: string;
//     queryString: string | null;
//     startTime: number;
//     response: Response;
//     responseSize: number;
//   }) {
//     logger.logRequest(
//       method,
//       endpoint,
//       queryString,
//       startTime,
//       response,
//       null,
//       responseSize,
//     );
//   }
//
//   private parseError(err: IApiException) {
//     return {};
//   }
//
//   private noKeyError() {
//     // return {
//     //   data: null,
//     //   exception: {
//     //     message: "Response structure mismatch: Missing expected data key.",
//     //     statusCode: 500,
//     //     status: "INTERNAL_SERVER_ERROR",
//     //     error: "ResponseStructureError",
//     //     timestamp: new Date().toISOString(),
//     //     path: this.endpoint,
//     //     errors: {
//     //       detail: "The API response does not contain the expected data key.",
//     //       expectedFormat: isPaginatedResponse
//     //           ? { metadata: "object", [responseKey]: "array or object" }
//     //           : { [responseKey]: "array or object" },
//     //       receivedKeys: Object.keys(jsonResponse.data),
//     //     },
//     //   },
//     // };
//   }
// }
//
// export class SingleFetch {}

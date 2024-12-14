import type { Method } from "~/fetch/fetch-client";

export const logger = {
  colors: {
    method: {
      GET: "\x1b[36m", // Cyan
      POST: "\x1b[32m", // Green
      PUT: "\x1b[33m", // Yellow
      PATCH: "\x1b[35m", // Magenta
      DELETE: "\x1b[31m", // Red
    },
    status: {
      success: "\x1b[32m", // Green
      error: "\x1b[31m", // Red
    },
    timing: {
      fast: "\x1b[32m", // Green (<300ms)
      medium: "\x1b[33m", // Yellow (300-1000ms)
      slow: "\x1b[31m", // Red (>1000ms)
    },
    prefix: "\x1b[34m", // Blue for the prefix
    reset: "\x1b[0m",
  },

  formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  getTimingColor(duration: number): string {
    if (duration < 300) return logger.colors.timing.fast;
    if (duration < 1000) return logger.colors.timing.medium;
    return logger.colors.timing.slow;
  },

  logRequest(
    method: Method,
    endpoint: string,
    query: string | null,
    startTime: number,
    response: Response | null,
    error: any = null,
    responseSize?: number,
  ) {
    const duration = Date.now() - startTime;
    const methodColor = logger.colors.method[method];
    const timingColor = logger.getTimingColor(duration);
    const statusColor = response?.ok
      ? logger.colors.status.success
      : logger.colors.status.error;
    const reset = logger.colors.reset;
    const prefix = logger.colors.prefix;

    // Build the log message with prefix
    const parts = [
      `${prefix}[Fetch Client]${reset}`,
      `🌐 ${methodColor}${method}${reset}`,
      `${endpoint}${query ? `?${query}` : ""}`,
      response
        ? `${statusColor}${response.status}${reset}`
        : `${logger.colors.status.error}ERROR${reset}`,
      `${timingColor}${duration}ms${reset}`,
    ];

    if (responseSize) {
      parts.push(`${logger.formatBytes(responseSize)}`);
    }

    console.log(parts.join(" "));

    // Log detailed error if present
    if (error) {
      console.error(
        `${prefix}[Fetch Client]${reset} ${logger.colors.status.error}Error Details:${reset}`,
        error,
      );
    }
  },
};

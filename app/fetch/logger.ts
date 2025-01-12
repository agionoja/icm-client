import type { Method } from "~/fetch/fetch-client.server";

export const logger = {
  colors: {
    method: {
      GET: "\x1b[32m", // Green like NestJS
      POST: "\x1b[33m", // Yellow like NestJS
      PUT: "\x1b[34m", // Blue like NestJS
      PATCH: "\x1b[35m", // Magenta like NestJS
      DELETE: "\x1b[31m", // Red like NestJS
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
    prefix: {
      system: "\x1b[33m", // Yellow for system prefix like NestJS
      details: "\x1b[96m", // Cyan for details like NestJS
    },
    // uri: "\x1b[96m", // Bright cyan for URI
    uri: "\x1b[32m", // Bright cyan for URI
    timestamp: "\x1b[36m", // Brighter cyan for timestamp (more visible than gray)
    reset: "\x1b[0m",
  },

  formatBytes(bytes: number): string {
    if (!bytes) return "0 B";

    if (bytes > 1000000) {
      return `${(bytes / 1000000).toFixed(2)} MB`;
    }

    if (bytes > 1000) {
      return `${(bytes / 1000).toFixed(2)} KB`;
    }

    return `${bytes} B`;
  },

  getTimingColor(duration: number): string {
    if (duration < 300) return logger.colors.timing.fast;
    if (duration < 1000) return logger.colors.timing.medium;
    return logger.colors.timing.slow;
  },

  getTimestamp(): string {
    return new Date().toISOString();
  },

  getMethodEmoji(method: Method): string {
    const emojiMap: Record<Method, string> = {
      GET: "📥",
      POST: "📤",
      PUT: "📝",
      PATCH: "🔄",
      DELETE: "🗑️",
    };
    return emojiMap[method] || "🌐";
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
    const { colors } = logger;
    const methodColor = colors.method[method];
    const timingColor = logger.getTimingColor(duration);
    const statusColor = response?.ok
      ? colors.status.success
      : colors.status.error;
    const reset = colors.reset;

    // Build the log message in NestJS style
    const parts = [
      // Timestamp
      `${colors.timestamp}${logger.getTimestamp()}${reset}`,

      // System prefix (like NestJS)
      `${colors.prefix.system}[FetchClient]${reset}`,

      // Method with emoji (like NestJS info/error/warn prefix)
      `${methodColor}${logger.getMethodEmoji(method)} ${method}${reset}`,

      // Endpoint with query
      `${colors.uri}${endpoint}${query ? `?${query}` : ""}${reset}`,

      // Status
      response
        ? `${statusColor}${response.status}${reset}`
        : `${colors.status.error}ERROR${reset}`,

      // Duration
      `${timingColor}+${duration}ms${reset}`,
    ];

    // Add size if available
    if (responseSize) {
      parts.push(
        `${colors.prefix.details}${logger.formatBytes(responseSize)}${reset}`,
      );
    }

    console.log(parts.join(" "));

    // Log error details in NestJS style if present
    if (error) {
      console.error(
        `${colors.timestamp}${logger.getTimestamp()}${reset}`,
        `${colors.status.error}[FetchClient Error]${reset}`,
        `${colors.status.error}${error.message || "Unknown error"}${reset}`,
        error.stack ? `\n${error.stack}` : "",
      );
    }
  },
};

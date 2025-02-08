// types.ts
export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type LogLevel = "info" | "error" | "warn" | "debug";

export type LoggerConfig = {
  colors: {
    method: Record<Method, string>;
    status: {
      success: string;
      error: string;
      warn: string;
    };
    timing: {
      fast: string;
      medium: string;
      slow: string;
    };
    prefix: {
      system: string;
      details: string;
    };
    uri: string;
    timestamp: string;
    reset: string;
  };
  emojiMap: Record<Method, string>;
};

export type LogEntry = {
  timestamp: string;
  method: Method;
  endpoint: string;
  query?: string;
  duration: number;
  status?: number;
  responseSize?: number;
  error?: Error;
};
// Pure function to format bytes
export const formatBytes = (bytes: number): string => {
  if (!bytes) return "0 B";
  if (bytes > 1_000_000) return `${(bytes / 1_000_000).toFixed(2)} MB`;
  if (bytes > 1_000) return `${(bytes / 1_000).toFixed(2)} KB`;
  return `${bytes} B`;
};

// Pure function to determine timing color
export const getTimingColor = (
  duration: number,
  config: LoggerConfig,
): string => {
  if (duration < 300) return config.colors.timing.fast;
  if (duration < 1_000) return config.colors.timing.medium;
  return config.colors.timing.slow;
};

// Pure function to create timestamp in "DD/MM/YYYY, HH:mm:ss" format
export const createTimestamp = (date: Date = new Date()): string => {
  const pad = (num: number) => num.toString().padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}, ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

// Pure function to get method emoji
export const getMethodEmoji = (method: Method, config: LoggerConfig): string =>
  config.emojiMap[method] || "🌐";

// Pure function to create log message parts
export const createLogMessage = (
  entry: LogEntry,
  config: LoggerConfig,
): string[] => {
  const { colors } = config;
  const methodColor = colors.method[entry.method];
  const timingColor = getTimingColor(entry.duration, config);
  const statusColor =
    entry.status && entry.status < 400
      ? colors.status.success
      : entry.status && entry.status < 500
        ? colors.status.warn
        : colors.status.error;

  return [
    // Timestamp
    `${colors.timestamp}${entry.timestamp}${colors.reset}`,

    // System prefix
    `${colors.prefix.system}[FetchClient]${colors.reset}`,

    // Method with emoji
    `${methodColor}${getMethodEmoji(entry.method, config)} ${entry.method}${colors.reset}`,

    // Endpoint with query
    `${colors.uri}${entry.endpoint}${entry.query ? `?${entry.query}` : ""}${colors.reset}`,

    // Status or error
    entry.status
      ? `${statusColor}${entry.status}${colors.reset}`
      : `${colors.status.error}ERROR${colors.reset}`,

    // Duration
    `${timingColor}+${entry.duration}ms${colors.reset}`,

    // Size if available
    ...(entry.responseSize
      ? [
          `${colors.prefix.details}${formatBytes(entry.responseSize)}${colors.reset}`,
        ]
      : []),
  ];
};

// Pure function to create error message
export const createErrorMessage = (
  error: Error,
  config: LoggerConfig,
): string[] => [
  `${config.colors.timestamp}${createTimestamp()}${config.colors.reset}`,
  `${config.colors.status.error}[FetchClient Error]${config.colors.reset}`,
  `${config.colors.status.error}${error.message || "Unknown error"}${config.colors.reset}`,
  ...(error.stack ? [`\n${error.stack}`] : []),
];

// Side effect handler
export const outputLog = (
  messages: string[],
  level: LogLevel = "info",
): void => {
  const logger = {
    info: console.log,
    error: console.error,
    warn: console.warn,
    debug: console.debug,
  }[level];

  logger(messages.join(" "));
};

// Logger factory function
export const createLogger = (config: LoggerConfig) => {
  const baseEntry = (
    method: Method,
    endpoint: string,
    query: string | null,
    startTime: number,
  ): LogEntry => ({
    timestamp: createTimestamp(),
    method,
    endpoint,
    query: query || undefined,
    duration: Date.now() - startTime,
  });

  return {
    logRequest: (
      method: Method,
      endpoint: string,
      query: string | null,
      startTime: number,
      status?: number,
      responseSize?: number,
      error?: Error,
    ) => {
      const entry: LogEntry = {
        ...baseEntry(method, endpoint, query, startTime),
        status,
        responseSize,
        error,
      };

      const message = createLogMessage(entry, config);
      outputLog(
        message,
        error ? "error" : status && status >= 400 ? "warn" : "info",
      );

      if (error) {
        const errorMessage = createErrorMessage(error, config);
        outputLog(errorMessage, "error");
      }
    },
  };
};

// Default configuration
export const defaultLoggerConfig: LoggerConfig = {
  colors: {
    method: {
      GET: "\x1b[38;5;34m", // Green
      POST: "\x1b[38;5;220m", // Yellow
      PUT: "\x1b[38;5;33m", // Blue
      PATCH: "\x1b[38;5;207m", // Magenta
      DELETE: "\x1b[38;5;196m", // Red
    },
    status: {
      success: "\x1b[38;5;34m", // Green
      error: "\x1b[38;5;196m", // Red
      warn: "\x1b[38;5;208m", // Orange
    },
    timing: {
      fast: "\x1b[38;5;34m", // Green
      medium: "\x1b[38;5;220m", // Yellow
      slow: "\x1b[38;5;196m", // Red
    },
    prefix: {
      system: "\x1b[38;5;220m", // Yellow
      details: "\x1b[38;5;45m", // Cyan
    },
    uri: "\x1b[38;5;45m", // Cyan
    timestamp: "\x1b[38;5;247m", // Gray
    reset: "\x1b[0m",
  },
  emojiMap: {
    GET: "📥", // Inbox tray
    POST: "📤", // Outbox tray
    PUT: "📝", // Pencil
    PATCH: "🔄", // Refresh
    DELETE: "🗑️", // Trash
  },
};

// Default logger instance
export const logger = createLogger(defaultLoggerConfig);

/**
 * Represents a number of bytes.
 */
type Bytes = number;

/**
 * Represents a time duration in milliseconds.
 */
type Milliseconds = number;

/**
 * Represents a time duration in seconds.
 */
type Seconds = number;

/**
 * Represents a data transfer speed in bytes per second.
 */
type BytesPerSecond = number;
export type OnProgress = (info: ProgressInfo) => void;

/**
 * Represents the current progress state of a data transfer.
 */
export type ProgressState = Readonly<{
  /** Number of bytes received so far. */
  bytesReceived: Bytes;
  /** Total content length in bytes. */
  contentLength: Bytes;
  /** Timestamp when the transfer started. */
  startTime: Milliseconds;
  /** Timestamp of the last progress update. */
  lastUpdate: Milliseconds;
  /** Number of bytes received in the last update interval. */
  lastBytes: Bytes;
  /** Current status of the transfer. */
  status: "pending" | "active" | "completed" | "error";
  /** Optional throttle speed in bytes per second. */
  throttleSpeed?: BytesPerSecond;
}>;

/**
 * Represents detailed progress information for a data transfer.
 */
export type ProgressInfo = Readonly<{
  /** Number of bytes loaded so far. */
  loaded: Bytes;
  /** Total content length in bytes. */
  total: Bytes;
  /** Percentage of completion. */
  percent: number;
  /** Current transfer speed in bytes per second. */
  transferSpeed: BytesPerSecond;
  /** Estimated time remaining in seconds. */
  timeRemaining: Seconds;
  /** Elapsed time since the transfer started, in seconds. */
  elapsedTime: Seconds;
  /** Current status of the transfer. */
  status: ProgressState["status"];
}>;

/**
 * Represents an effect triggered by progress updates.
 */
type ProgressEffect =
  | { type: "callback"; info: ProgressInfo }
  | { type: "delay"; duration: Milliseconds };

/**
 * Creates an initial progress state.
 * @param contentLength Total content length in bytes.
 * @param throttleSpeed Optional throttle speed in bytes per second.
 * @returns The initial progress state.
 */
const createInitialState = (
  contentLength: Bytes,
  throttleSpeed?: BytesPerSecond,
): ProgressState => ({
  bytesReceived: 0,
  contentLength,
  startTime: Date.now(),
  lastUpdate: Date.now(),
  lastBytes: 0,
  status: "pending",
  throttleSpeed,
});

/**
 * Calculates updated progress information based on the current state.
 * @param state The current progress state.
 * @param final Whether this is the final update.
 * @returns The updated progress state and any triggered effects.
 */
const calculateProgress = (
  state: ProgressState,
  final: boolean = false,
): [ProgressState, ProgressEffect[]] => {
  const now = Date.now();
  const timeElapsed = (now - state.lastUpdate) / 1000;
  const isCompleted = final || state.bytesReceived >= state.contentLength;

  const newState: ProgressState = {
    ...state,
    lastUpdate: now,
    lastBytes: state.bytesReceived,
    status: isCompleted ? "completed" : "active",
  };

  const bytesPerSecond =
    timeElapsed > 0 ? (state.bytesReceived - state.lastBytes) / timeElapsed : 0;

  const percent = state.contentLength
    ? Math.min((state.bytesReceived / state.contentLength) * 100, 100)
    : 0;

  const timeRemaining =
    bytesPerSecond > 0
      ? (state.contentLength - state.bytesReceived) / bytesPerSecond
      : 0;

  const info: ProgressInfo = {
    loaded: state.bytesReceived,
    total: state.contentLength,
    percent,
    transferSpeed: bytesPerSecond,
    timeRemaining: isCompleted ? 0 : timeRemaining,
    elapsedTime: (now - state.startTime) / 1000,
    status: newState.status,
  };

  const effects: ProgressEffect[] = [{ type: "callback", info }];

  if (state.throttleSpeed && !isCompleted) {
    const chunkSize = state.bytesReceived - state.lastBytes;
    const idealTime = (chunkSize / state.throttleSpeed) * 1000;
    const actualTime = now - state.lastUpdate;
    if (actualTime < idealTime) {
      effects.push({ type: "delay", duration: idealTime - actualTime });
    }
  }

  return [newState, effects];
};

/**
 * Updates the progress state with a new chunk of data.
 * @param state The current progress state.
 * @param chunk The size of the new data chunk in bytes.
 * @param final Whether this is the final update.
 * @returns The updated progress state and any triggered effects.
 */
const updateProgress = (
  state: ProgressState,
  chunk: Bytes,
  final: boolean = false,
): [ProgressState, ProgressEffect[]] => {
  const newBytes = state.bytesReceived + chunk;
  const updatedState = { ...state, bytesReceived: newBytes };

  const shouldUpdate =
    final ||
    Date.now() - state.lastUpdate >= 100 ||
    newBytes === state.contentLength;

  return shouldUpdate
    ? calculateProgress(updatedState, final)
    : [updatedState, []];
};

/**
 * Creates a transform stream that tracks progress and throttles speed if necessary.
 * @param contentLength Total content length in bytes.
 * @param onProgress Callback function for progress updates.
 * @param options Optional configuration parameters.
 * @returns A TransformStream that monitors progress.
 */
export const createProgressStream = (
  contentLength: Bytes,
  onProgress: OnProgress,
  options: {
    throttleSpeed?: BytesPerSecond;
    updateInterval?: Milliseconds;
  } = {},
): TransformStream<Uint8Array, Uint8Array> => {
  let state = createInitialState(contentLength, options.throttleSpeed);

  return new TransformStream({
    async transform(chunk, controller) {
      const [newState, effects] = updateProgress(state, chunk.length);
      state = newState;

      for (const effect of effects) {
        switch (effect.type) {
          case "callback":
            onProgress(effect.info);
            break;
          case "delay":
            await new Promise((resolve) =>
              setTimeout(resolve, effect.duration),
            );
            break;
        }
      }
      controller.enqueue(chunk);
    },
    flush() {
      if (state.bytesReceived < state.contentLength) {
        const [finalState, effects] = updateProgress(state, 0, true);
        state = finalState;
        effects.forEach((effect) => {
          if (effect.type === "callback") {
            onProgress(effect.info);
          }
        });
      }
    },
  });
};

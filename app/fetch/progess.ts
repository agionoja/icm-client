export interface ProgressInfo {
  loaded: number;
  total: number;
  percent: number;
  transferSpeed: number;
  timeRemaining: number;
  startTime: number;
  status: "pending" | "active" | "completed" | "error";
}

export type ProgressCallback = (progress: ProgressInfo) => void;

export type ProgressArgs = {
  contentLength: number;
  onProgress: ProgressCallback;
  updateInterval?: number;
  throttleSpeed?: number;
};

export class ProgressMonitor {
  private bytesReceived: number = 0;
  private lastUpdate: number = Date.now();
  private lastBytes: number = 0;
  private readonly contentLength: number;
  private readonly onProgressCallback: ProgressCallback;
  private readonly startTime: number;
  private readonly updateInterval: number;
  private isCompleted: boolean = false;
  private readonly throttleSpeed?: number; // Speed limit in bytes per second

  constructor({
    contentLength,
    onProgress,
    updateInterval = 100,
    throttleSpeed = undefined,
  }: ProgressArgs) {
    this.contentLength = contentLength;
    this.onProgressCallback = onProgress;
    this.startTime = Date.now();
    this.updateInterval = updateInterval;
    this.throttleSpeed = throttleSpeed;

    // Send initial pending status
    this.onProgressCallback({
      loaded: 0,
      total: contentLength,
      percent: 0,
      transferSpeed: 0,
      timeRemaining: 0,
      startTime: this.startTime,
      status: "pending",
    });
  }

  /**
   * Update progress with new chunk of data
   */
  public async updateProgress(chunk: Uint8Array): Promise<void> {
    // If throttling is enabled, introduce artificial delay
    if (this.throttleSpeed) {
      const chunkSize = chunk.length;
      const idealTime = (chunkSize / this.throttleSpeed) * 1000; // Time in ms it should take at throttled speed
      const actualTime = Date.now() - this.lastUpdate;

      if (actualTime < idealTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, idealTime - actualTime),
        );
      }
    }

    this.bytesReceived += chunk.length;
    const now = Date.now();
    const timeElapsed = (now - this.lastUpdate) / 1000;

    // Check if this is the final chunk
    const isFinalChunk = this.bytesReceived >= this.contentLength;

    // Send updates either when interval has passed or it's the final chunk
    if (
      timeElapsed >= this.updateInterval / 1000 ||
      (isFinalChunk && !this.isCompleted)
    ) {
      const bytesPerSecond =
        (this.bytesReceived - this.lastBytes) / timeElapsed;
      const percentComplete = this.contentLength
        ? (this.bytesReceived / this.contentLength) * 100
        : 0;
      const timeRemaining = this.contentLength
        ? (this.contentLength - this.bytesReceived) / bytesPerSecond
        : 0;

      // Determine status
      let status: ProgressInfo["status"] = "active";
      if (isFinalChunk) {
        status = "completed";
        this.isCompleted = true;
      }

      this.onProgressCallback({
        loaded: this.bytesReceived,
        total: this.contentLength,
        percent: Math.min(percentComplete, 100),
        transferSpeed: bytesPerSecond,
        timeRemaining: status === "completed" ? 0 : timeRemaining,
        startTime: this.startTime,
        status,
      });

      this.lastUpdate = now;
      this.lastBytes = this.bytesReceived;
    }
  }

  /**
   * Create a transform stream that monitors progress
   */
  public static createProgressStream(
    progressArgs: ProgressArgs,
  ): TransformStream<Uint8Array, Uint8Array> {
    const monitor = new ProgressMonitor(progressArgs);

    return new TransformStream({
      async transform(chunk, controller) {
        await monitor.updateProgress(chunk);
        controller.enqueue(chunk);
      },
      flush() {
        if (
          monitor.bytesReceived === monitor.contentLength &&
          !monitor.isCompleted
        ) {
          monitor.onProgressCallback({
            loaded: monitor.bytesReceived,
            total: monitor.contentLength,
            percent: 100,
            transferSpeed: 0,
            timeRemaining: 0,
            startTime: monitor.startTime,
            status: "completed",
          });
        }
      },
    });
  }

  // Existing helper methods remain the same
  public static formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  public static formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return "Unknown";
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    seconds = Math.round(seconds % 60);
    if (minutes < 60) return `${minutes}m ${seconds}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ${seconds}s`;
  }
}

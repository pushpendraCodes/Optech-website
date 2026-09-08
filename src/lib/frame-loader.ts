/** Progressive image-sequence loader with concurrency + optional viewport gate. */

export type FrameLoadOptions = {
  count: number;
  pathFor: (index1Based: number) => string;
  /** Max parallel downloads (default 4). */
  concurrency?: number;
  /** Unlock UI after this many frames (default 1). */
  readyAfter?: number;
  onProgress?: (loaded: number, total: number) => void;
  signal?: AbortSignal;
};

export async function loadImageFrames(opts: FrameLoadOptions): Promise<HTMLImageElement[]> {
  const {
    count,
    pathFor,
    concurrency = 4,
    readyAfter = 1,
    onProgress,
    signal,
  } = opts;

  const frames: HTMLImageElement[] = new Array(count);
  let loadedCount = 0;
  let nextIndex = 0;
  let resolveReady: (() => void) | undefined;
  const readyPromise = new Promise<void>((resolve) => {
    resolveReady = resolve;
  });
  let readyFired = false;

  const loadOne = (i: number) =>
    new Promise<void>((resolve) => {
      if (signal?.aborted) {
        resolve();
        return;
      }
      const img = new Image();
      frames[i] = img;
      const done = () => {
        loadedCount++;
        onProgress?.(loadedCount, count);
        if (!readyFired && loadedCount >= Math.min(readyAfter, count)) {
          readyFired = true;
          resolveReady?.();
        }
        resolve();
      };
      img.onload = done;
      img.onerror = done;
      img.decoding = "async";
      img.src = pathFor(i + 1);
    });

  const workers = Array.from({ length: Math.min(concurrency, count) }, async () => {
    while (nextIndex < count) {
      if (signal?.aborted) return;
      const i = nextIndex++;
      await loadOne(i);
    }
  });

  // Prefer first frame early: kick index 0 first by starting workers after queuing 0
  // Workers pull from nextIndex sequentially so frame 0 starts first.

  void Promise.all(workers).then(() => {
    if (!readyFired) {
      readyFired = true;
      resolveReady?.();
    }
  });

  await readyPromise;
  // Keep background loads running; caller holds `frames` ref.
  void Promise.all(workers);
  return frames;
}

/** Wait until element is near viewport before resolving. */
export function whenNearViewport(
  el: Element,
  rootMargin = "200% 0px",
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          resolve();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    signal?.addEventListener(
      "abort",
      () => {
        io.disconnect();
        resolve();
      },
      { once: true },
    );
  });
}

export function canvasDpr(): number {
  const raw = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const mobile = typeof window !== "undefined" && window.innerWidth <= 768;
  return Math.min(raw, mobile ? 1.25 : 1.5);
}

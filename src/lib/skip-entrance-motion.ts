"use client";

/** True after Fast Refresh prepares an update (not on first visit / Strict Mode). */
let skipAfterHmr = false;

let hmrHookRegistered = false;

type HotApi = {
  dispose(cb: () => void): void;
  addStatusHandler?(cb: (status: string) => void): void;
};

function getHotApi(): HotApi | undefined {
  if (process.env.NODE_ENV !== "development") return undefined;

  if (typeof module !== "undefined" && "hot" in module) {
    return (module as NodeModule & { hot?: HotApi }).hot;
  }

  const meta = import.meta as ImportMeta & { webpackHot?: HotApi };
  return meta.webpackHot;
}

function registerDevHmrSkipEntrance() {
  if (hmrHookRegistered || process.env.NODE_ENV !== "development") return;

  const hot = getHotApi();
  if (!hot) return;

  hmrHookRegistered = true;

  hot.dispose(() => {
    skipAfterHmr = true;
  });

  hot.addStatusHandler?.((status) => {
    if (status === "prepare") skipAfterHmr = true;
  });
}

registerDevHmrSkipEntrance();

/**
 * In development, skip mount/whileInView entrance animations only after Fast
 * Refresh — not on the first page load (including React Strict Mode).
 */
export function useSkipEntranceMotion(): boolean {
  registerDevHmrSkipEntrance();
  return process.env.NODE_ENV === "development" && skipAfterHmr;
}

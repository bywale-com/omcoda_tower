import { useEffect, useState } from "react";
import { subscribeFixtures } from "./fixtures/store";

/** Re-render when fixtures change (stand-in plane notify). */
export function useWireTick(): number {
  const [tick, setTick] = useState(0);
  useEffect(
    () =>
      subscribeFixtures(() => {
        // #region agent log
        void fetch("http://127.0.0.1:7399/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "useWireTick.ts:fixtureNotify",
            message: "fixture notify → tick++",
            data: {},
            timestamp: Date.now(),
            hypothesisId: "H1",
          }),
        }).catch(() => undefined);
        // #endregion
        setTick((n) => n + 1);
      }),
    [],
  );
  return tick;
}

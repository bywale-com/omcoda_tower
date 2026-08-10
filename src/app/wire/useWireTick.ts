import { useEffect, useState } from "react";
import { subscribeFixtures } from "./fixtures/store";

/** Re-render when fixtures change (stand-in plane notify). */
export function useWireTick(): number {
  const [tick, setTick] = useState(0);
  useEffect(() => subscribeFixtures(() => setTick((n) => n + 1)), []);
  return tick;
}

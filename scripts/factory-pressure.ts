/**
 * Prints whether upstream packet release should wait, and the production
 * counters the ledger can actually support. Cost stays null unless a
 * provider usage figure is stored on an execution. This process does not
 * write the ledger and does not launch an agent.
 */
import { readFileSync } from "node:fs";
import type { FactoryLedger } from "../.factory/controller/dispatch.ts";
import { productionMetrics, productionPressure } from "../.factory/controller/execution.ts";

const ledger = JSON.parse(readFileSync(".factory/state/ledger.json", "utf8")) as FactoryLedger;
const pressure = productionPressure(Object.values(ledger.packets));
const metrics = productionMetrics(ledger);
console.log(
  JSON.stringify({
    scope: ledger.scope.status,
    release: ledger.scope.status === "active" && !pressure.holdRelease ? "release_clear" : pressure.holdRelease ? "hold_release" : ledger.scope.status,
    ...pressure,
    ...metrics,
  }),
);

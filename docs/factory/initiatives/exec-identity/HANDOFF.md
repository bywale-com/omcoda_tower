# exec-identity handoff

**Established:** PKT-001 is release-eligible and on hold. The systems-change packet is `systems/SCP-pkt-001-click-attribution.md`. The click plant is in `server/wire-service/webhooks.ts` and the messaging-events arm of `objectiveSatisfiedBy`.

**Verified:** The oracle in `npm run factory:check` (23 checks) and the Postgres cases in `scripts/verify-click-attribution.ts`. Both passed on GitHub Actions for the plant commit `19c47938d8aa8884b4874999a50667f5677205b3`: factory check [40873984441](https://github.com/bywale-com/omcoda_tower/actions/runs/40873984441), ship [40873984426](https://github.com/bywale-com/omcoda_tower/actions/runs/40873984426) (`Click attribution PASSED` at 8:32 AM America/Toronto). This session wrote the packet and the plant. Cursor Automations did not run.

**Remaining:** The ledger is still `draft` / `hold` / `authorizedDispatches: null`. Integration is a merge of pull request 136. There is no merge SHA, so the packet is not `accepted`. Claims 4, 6, 7, and 8 have no packets. Claims 12–88 are title-indexed only.

**Next:** Do not flip `**Wake:** sa`. Do not set `FACTORY_CONTROLLER`. Do not Save + Activate the prompts. The next investigative move on the product record remains PR #135 `docs/specification-pass/NEXT.md`. That move is not this factory branch’s job.

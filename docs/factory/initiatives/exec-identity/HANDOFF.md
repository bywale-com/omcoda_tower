# exec-identity handoff

**Established:** PKT-001 is accepted. Execution is `manual`. Wake stays `hold`. `verifiedSha` is `19c47938d8aa8884b4874999a50667f5677205b3`. `integratedSha` is merge `9c45f19fa1ac9d909247d6be83c9263273b1bcbb` of pull request 136. PKT-002 `rev-1` is planted from `systems/SCP-pkt-002-open-ask-cursor.md`. `handleContactSeatGet` resolves the seat and returns `projectSeat`. A `campaignId` query does not update `enrollment` or `contact_access_links`. The cursor expression remains `enrollment?.campaign_id ?? link.campaign_id`. `advanceEnrollmentCampaign` is unchanged. PKT-003 and PKT-004 stay released. PKT-005 is in analysis on its analyst lease. `launch-agent` stays discovered.

**Verified:** `npm run factory:check` passed (40 checks) and `scripts/verify-open-ask-cursor.ts` printed `Open ask cursor PASSED` on migrated Postgres (migrations 001–024, development seed). Both ran against commit `3246a074efecd8adb98e4ca232d443b90821173f`. That SHA is the plant. A later ledger commit does not replace it.

**Remaining:** Claim 10’s loads of `fact_writebacks`, `meeting_booked`, and `wait_occupancy` have no plant. Claim 11’s fact and meeting `payload.writes` arrays have no plant. Claims 12–88 are indexed only. Coverage is not complete. PKT-003, PKT-004, and PKT-005 are outside this plant.

**Next:** Record `3246a074efecd8adb98e4ca232d443b90821173f` as the PKT-002 candidate. This sitting does not add a label and does not watch the next verification run.

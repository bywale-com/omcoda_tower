# SCP-pkt-002 — Opening an ask does not move the enrollment cursor

**Packet:** PKT-002 `pkt-002-open-ask-cursor`  
**Initiative:** `exec-identity`  
**Revision:** rev-1  
**Source:** PR #135 claim 4 at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`  
**Contract:** `docs/factory/components/pursuit-identity/CONTRACT.md`

## Intent

`enrollment.campaign_id` is the latch. It moves in `advanceEnrollmentCampaign` when that enrollment’s stamped objective is satisfied, and only then. Opening an ask displays the history row. A `campaignId` query on the seat GET does not write a cursor and does not choose what Now shows.

## Must / must-not

- `handleContactSeatGet` leaves every `enrollment` row and every `contact_access_links` row unchanged, whether `campaignId` is absent, whitespace, the newest enrollment’s current campaign, the older enrollment’s campaign, or any other value.
- The seat cursor stays the read `projectSeat` already performs: the newest enrollment’s `campaign_id` for that firm and contact, otherwise the link’s `campaign_id`. Now (`now.state`, from that campaign’s objective kind) and history `outstanding` follow that same value.
- Opening a history row shows that row’s title and body. The row click stays on the client. “Open in Now” may switch to Now and reload. The reload shows the stored cursor. The client may keep passing the row’s `campaignId`.
- `advanceEnrollmentCampaign` still updates only the enrollment id it was given, and only after `objectiveSatisfiedBy` succeeds for that row. The other enrollment’s `campaign_id` stays. The latch remains:

```sql
UPDATE enrollment
   SET campaign_id=$2, pursuit_state='pursuing', exhausted_at=NULL
 WHERE id=$1 AND campaign_id=$3
```

- Two open enrollments stay two open enrollments. The projection keeps reading one newest row. This packet does not merge history across enrollments and does not close one.
- Do not write `campaign_id` from the query onto the newest enrollment, onto the link, or into any other column as a substitute cursor.
- Do not pass the query into `projectSeat`. Do not give the query its own Now state.
- Do not change the click predicate, `onCompletionWrite`’s newest-enrollment select, fact submit, meeting book, consent Ignore, or the `objective_met` dispatch.

## Stores and contracts

No new table and no new column.

- `enrollment.campaign_id` — cursor added in `supabase/migrations/010_sequence_campaign_housing.sql`. Nullable, `REFERENCES campaign(id) ON DELETE SET NULL`. `pursuit_state` and `exhausted_at` are the exhaustion columns from `022_pursuit_exhausted.sql`. The GET must not touch them.
- `contact_access_links.campaign_id` — fallback cursor from `supabase/migrations/019_contact_seat.sql`. `lookupLink` reads it. `projectSeat` uses it only when the newest enrollment’s `campaign_id` is null. The GET must not update the link.
- `campaign_objective.kind` — `projectSeat` maps `form` and `meeting` onto `now.state`. Click objectives are omitted from the history query (`o.kind <> 'click'`). The verify fixtures that distinguish Now use `form` and `meeting`.
- Pursuit-identity claim 4. Packet 022 §2.3 is the latch: the flip is `advanceEnrollmentCampaign`, once, by enrollment id. Claim 2 stands: two enrollments may be open. This packet does not restate that as a new store.

The write this packet removes is the whole effect of the query today:

```sql
UPDATE enrollment SET campaign_id=$3
 WHERE id = (
   SELECT id FROM enrollment
   WHERE firm_id=$1 AND contact_id=$2
   ORDER BY enrolled_at DESC
   LIMIT 1
)
```

`handleContactSeatGet` runs that statement whenever `c.req.query("campaignId")` trims to a non-empty string, then calls `projectSeat`. The read that remains is already:

```sql
SELECT id, sequence_id, campaign_id FROM enrollment
 WHERE firm_id=$1 AND contact_id=$2
 ORDER BY enrolled_at DESC LIMIT 1
```

```ts
const campaignId = enrollment?.campaign_id ?? link.campaign_id;
```

`now.state` is `consent` when consent is missing or still `basis = 'none'` with a source other than `ignored`. After consent is settled, `form` and `meeting` come from `objectiveKind` of that `campaignId`. History marks `outstanding` only for `camp.id === campaignId`.

## Runtime

`handleContactSeatGet` resolves the seat, ignores `campaignId`, and returns `projectSeat`. Both existing callers stay on this function:

- `GET /machine/contact-workspaces/:contactId` (`seatFromAdminContact`)
- `GET /contact-seat/:token` (`seatFromToken` → `lookupLink`)

`projectSeat` does not receive the query. A request cannot change the row the next line reads.

The history modal in `ContactWorkspace` already renders `openAsk.title` and `openAsk.body` without a load. “Open in Now” calls `load(campaignId)`, and `reals/machineApi.ts` appends `?campaignId=` in `loadContactWorkspace` and `loadContactSeat`. Those callers may stay. The handler is what drops the write.

`advanceEnrollmentCampaign` loads that enrollment id, checks `objectiveSatisfiedBy` for its current objective, then runs the id-scoped update above. Callers that already pass an enrollment id — the click path, `onCompletionWrite`, and the cascade tick at `cascade.ts` — stay as they are. This packet does not add a newest-row write beside that latch.

When the admin route has no `contact_access_links` row, `seatFromAdminContact` copies the newest enrollment’s `campaign_id` onto a synthetic link. The link-fallback arm is the stored `contact_access_links` row on the token route. The verify uses that row.

## Ports

No new port. The query parameter may remain on the two GET routes above. It is not a write and not a display override.

## Verify

`scripts/verify-open-ask-cursor.ts` on a migrated Postgres, invoked from `.github/workflows/ship.yml` after migrate and seed, beside `verify-click-attribution`. `npm run build` is not this proof.

The script calls `handleContactSeatGet`. Seed express consent (or `source = 'ignored'`) so `now.state` is the objective kind. Use one `form` campaign and one `meeting` campaign so the two Now states differ. Read `enrollment.campaign_id` before and after each GET.

1. Two enrollments, one firm and contact, different `campaign_id` values. `GET` with `campaignId` set to the older enrollment’s campaign leaves both `campaign_id` values, and leaves `contact_access_links.campaign_id` as it was.
2. `GET` with `campaignId` set to the newest enrollment’s current campaign leaves every enrollment `campaign_id` as it was.
3. `GET` with no `campaignId`, and `GET` with whitespace only, leave every enrollment `campaign_id` as it was.
4. `GET` with `campaignId` set to a campaign other than the stored cursor. `now.state` and the outstanding history `campaignId` follow the newest enrollment’s `campaign_id`. When that column is null, they follow the token link’s `campaign_id`, and the query still writes nothing. The newest enrollment’s `campaign_id` stays null in that arm.
5. `advanceEnrollmentCampaign` on the enrollment whose stamped objective `objectiveSatisfiedBy` already accepts moves that row’s `campaign_id` to the next campaign ord. The other enrollment’s `campaign_id` stays. The same call on the enrollment whose objective is not satisfied leaves both `campaign_id` values. Use the predicate that function already has. Do not alter it. Call `advanceEnrollmentCampaign` directly.

`npm run factory:check` reads `handleContactSeatGet` and fails if that function still contains `UPDATE enrollment`. It reads the cursor expression `enrollment?.campaign_id ?? link.campaign_id` in `projectSeat`. It reads `routes.ts` and requires both GET routes above to stay bound to `handleContactSeatGet`. Add `server/wire-service/contactSeat.ts` to the path filter in `.github/workflows/factory-check.yml` so a later edit of the handler runs that shape check.

A pass is evidence only for the candidate SHA that ran. A pass on an older SHA does not verify a newer commit.

## Out of scope

Consent Ignore (claim 28), fact submit, meeting book, and the click webhook. Claim 28 left this write untouched; removing the write does not retune claim 28. `onCompletionWrite` still selects the newest enrollment with a campaign. Form and meeting still use that select. PKT-001 already recorded that as later work. The click predicate stays. No plate. The history modal already shows the row. This packet does not paint a new hole and does not rebuild history for two enrollments. The four founder questions on the initiative are not gates.

## Impact manifest

| Contract | Change | Consumers to re-check | Modified or only verified |
| --- | --- | --- | --- |
| `handleContactSeatGet` | Drop the `campaignId` update of `enrollment` | `GET /machine/contact-workspaces/:contactId`, `GET /contact-seat/:token`, “Open in Now” reload | Modified |
| `projectSeat` cursor | Keep `enrollment?.campaign_id ?? link.campaign_id` and keep the query out of the projection | `now.state`, history `outstanding` | Only verified |
| `advanceEnrollmentCampaign` latch | Keep the id-and-current-campaign update | Click path, `onCompletionWrite`, cascade tick | Only verified |
| `ContactWorkspace` history modal and “Open in Now” | Row click stays local; reload may still pass `campaignId` | History modal | Only verified |
| `reals/machineApi.ts` `loadContactWorkspace`, `loadContactSeat` | May still append `?campaignId=` | Real seat loads | Only verified |
| `scripts/verify-open-ask-cursor.ts`, `ship.yml`, `factory-check.ts`, `factory-check.yml` | Postgres cases and the shape guard | Ship CI, factory check | Modified |

## Dependency reconciliation

| Finding | Class |
| --- | --- |
| The GET write and the projection read are one change. Removing the update while teaching `projectSeat` to follow the query would keep the display override. Keeping the update and ignoring it in the client would leave cases 1–4 false for any other caller. | necessary |
| The token link is the fallback when the newest `enrollment.campaign_id` is null. The admin synthetic link copies the newest enrollment, so it hides that arm. The verify uses a real `contact_access_links` row. | necessary |
| `src/app/wire/standins/contactSeatMirror.ts` `project` assigns a passed `campaignId` onto the in-memory link and derives Now from that link. That mirror has no `enrollment` row. The acceptance is the enrollment store and `handleContactSeatGet`. | adjacent |
| `onCompletionWrite` still selects the newest enrollment with a campaign. Fact and meeting completion still enter through it. SCP-pkt-001 already left that select for a later packet. | adjacent |
| The packet markdown still says `**Release:** draft`. The manifest and the ledger stage for this revision are `released`, and this wake is the dispatch record. The behavior text is the same either way. | adjacent |

# PKT-015 — A contact halt blocks a new enroll only in the firm stored on that halt row

**Initiative:** `exec-identity`  
**Claims:** PR #135 claim 18, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The claim text is the same at `807e1ca21735b764d77132602e8b9f5942c00c0d`. The revision under claim 19 leaves this enroll predicate unchanged.  
**Wake:** sa
**Release:** draft  
**Release eligible:** yes  
**UI:** none

## Intended behavior

`isHaltBlockingNew` still answers whether `enrollAndActuate` may insert. The firm-book arm stays `scope = 'firm-book' AND firm_id = $1` with `lifted_at` null. The contact arm becomes `scope = 'contact' AND contact_id = $2 AND firm_id = $1`, and it still runs only when the contact argument is not null. `LIMIT 1` stays an existence check. There is no `ORDER BY`. Two active contact halts in this firm for this contact are still one block. This packet does not add a unique constraint.

A contact halt whose `firm_id` is some other firm does not block an enroll whose `firmId` is this firm. A contact halt whose `firm_id` is this firm still blocks. A lifted row still does not block. The firm-book arm is unchanged: an active firm-book row for the enroll firm blocks, and a firm-book row for another firm does not.

`enrollAndActuate` still calls `isHaltBlockingNew(input.firmId, input.contactId)` and still returns `blocked: "halt"` before the enrollment insert when the check is true. It does not abort an attempt that already exists. `call_agent` still passes `firmId: opts.firmId` and `fireFirstStep: true`. An enroll this predicate allows still reaches the send. This packet does not retune `fireFirstStep`.

The predicate is the function, so every `enrollAndActuate` caller inherits the firm-scoped contact arm. This packet does not change the `firmId` those callers pass. `handleSequenceEnrollContacts` still passes `row.firm_id`. `handleEnrollmentCreate`, the onboarding fallback, and the eligibility fallback stay otherwise as they are.

`consentAndHaltGate` still selects a contact halt by `contact_id` alone. `handleHaltIsContact` still does the same. The stand-in `isContactHalted` still returns true on `contactId` alone. The real `isContactHalted` still calls that route. Claim 19 owns the contact arm of the send. This packet does not edit those readers.

`dispatchEventToWorkflows` is not edited. Claim 17’s audience branch stays as PKT-014 specified it. The audience is not this predicate.

## Existing behavior

The contact arm matches `contact_id` and does not constrain `firm_id`:

```94:108:server/wire-service/dispatchSend.ts
export async function isHaltBlockingNew(
  firmId: string,
  contactId?: string,
): Promise<boolean> {
  const pool = getPool();
  const halted = await pool.query(
    `SELECT 1 FROM halt_records
     WHERE lifted_at IS NULL
       AND ((scope = 'firm-book' AND firm_id = $1)
         OR ($2::text IS NOT NULL AND scope = 'contact' AND contact_id = $2))
     LIMIT 1`,
    [firmId, contactId ?? null],
  );
  return Boolean(halted.rowCount && halted.rowCount > 0);
}
```

`enrollAndActuate` returns before the insert when that check is true (`server/wire-service/cascade.ts`). `call_agent` passes `fireFirstStep: true` (`server/wire-service/workflowWalk.ts`). `consentAndHaltGate` selects `scope = 'contact' AND contact_id = $1` (`server/wire-service/dispatchSend.ts`). `handleHaltIsContact` uses that same predicate (`server/wire-service/stores.ts`). The stand-in `isContactHalted` matches `contactId` alone (`src/app/wire/standins/haltStore.ts`). `halt_records.firm_id` is `NOT NULL` (`supabase/migrations/003_ct_wire_stores.sql`). The contact partial index is on `contact_id` alone. This packet does not rewrite that index.

## Acceptance

A deterministic check, named by the systems-change packet, must prove these cases. `npm run build` is not that proof.

1. `isHaltBlockingNew(firm, contact)` is true when an active `scope = 'contact'` row has that `contact_id` and that `firm_id`. It is false when the only active contact halt for that contact has a different `firm_id`. A row with `lifted_at` set does not block.
2. `isHaltBlockingNew(firm, contact)` is true when an active `scope = 'firm-book'` row has that `firm_id`, and false when the firm-book row is another firm. The firm-book arm has no contact predicate.
3. A null contact does not match the contact arm. An active firm-book row for the firm still blocks.
4. Two active contact halts in the same firm for the same contact are one block. The query stays `LIMIT 1` with no `ORDER BY`. No unique constraint is added.
5. `enrollAndActuate` still returns `blocked: "halt"` before the enrollment insert when the check is true, and still inserts when the check is false.
6. `call_agent` still passes the walk’s firm and `fireFirstStep: true`.
7. `consentAndHaltGate`, `handleHaltIsContact`, and the stand-in `isContactHalted` still match a contact halt with no `firm_id` predicate.
8. `dispatchEventToWorkflows` is unchanged. No migration is added.

## Dependencies

The enroll firm on `call_agent` is the walk’s firm. PKT-014 decides who is on that walk. This packet does not change the audience branch.

Claim 19 specifies the contact arm of `consentAndHaltGate` and `handleHaltIsContact`. This packet does not implement that read. The revision under claim 19 leaves this enroll predicate as it is.

The partial index follows the old query. It is not a second key. This packet does not drop it and does not add a firm to it.

## Out of scope

The send gate’s contact select. `handleHaltIsContact`. The stand-in `isContactHalted`. Aborting an in-flight attempt. A unique constraint on an active contact halt. Joining another firm’s contact by email or phone. Changing `handleSequenceEnrollContacts`’s book query. The audience fill (PKT-014). Launch Agent. No plate.

## Plates

None.

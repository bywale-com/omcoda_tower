# PKT-002 — Opening an ask does not move the enrollment cursor

**Initiative:** `exec-identity`  
**Claims:** PR #135 claim 4, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`  
**Wake:** sa
**Release:** draft  
**Release eligible:** yes

## Intended behavior

`enrollment.campaign_id` moves in `advanceEnrollmentCampaign`, when the stamped objective of that enrollment is satisfied, and only then. It is the latch.

`handleContactSeatGet` does not write `campaign_id`. A `campaignId` query does not update any enrollment row. The seat projection keeps the cursor it already reads: the newest enrollment’s `campaign_id` for that firm and contact, or the link’s `campaign_id` when that enrollment has none. The query is not a second cursor and it is not a display override.

Opening a history row shows that row. “Open in Now” may navigate to Now and reload the seat. The reload shows the stored cursor. Two open enrollments stay two enrollments.

## Existing behavior

`handleContactSeatGet` treats the query as an update of the newest enrollment:

```520:536:server/wire-service/contactSeat.ts
export async function handleContactSeatGet(c: Context) {
  const resolved = await seatFromContext(c);
  if ("refuse" in resolved) return jsonRefuse(c, resolved);
  const openAsk = c.req.query("campaignId")?.trim() || null;
  if (openAsk) {
    await resolved.pool.query(
      `UPDATE enrollment SET campaign_id=$3
       WHERE id = (
         SELECT id FROM enrollment
         WHERE firm_id=$1 AND contact_id=$2
         ORDER BY enrolled_at DESC
         LIMIT 1
       )`,
      [resolved.link.firm_id, resolved.link.contact_id, openAsk],
    );
  }
  return json(c, await projectSeat(resolved.pool, resolved.link));
}
```

`projectSeat` then reads that same newest row:

```219:230:server/wire-service/contactSeat.ts
  const enr = await pool.query<{
    id: string;
    sequence_id: string | null;
    campaign_id: string | null;
  }>(
    `SELECT id, sequence_id, campaign_id FROM enrollment
     WHERE firm_id=$1 AND contact_id=$2
     ORDER BY enrolled_at DESC LIMIT 1`,
    [link.firm_id, link.contact_id],
  );
  const enrollment = enr.rows[0];
  const campaignId = enrollment?.campaign_id ?? link.campaign_id;
```

The history control passes the row’s `campaignId` into that load. The button is on an outstanding row:

```372:384:src/app/register/prototype-ant/contact/ContactWorkspace.tsx
              footer={
                openAsk?.outstanding ? (
                  <Button
                    type="primary"
                    onClick={() => {
                      const campaignId = openAsk.campaignId ?? undefined;
                      setOpenAsk(null);
                      setNav("now");
                      void load(campaignId);
                    }}
                  >
                    Open in Now
                  </Button>
```

The face does not describe a control that retargets a sequence. The button sits on a history row whose job is to show the ask. The modal already shows that row’s title and body.

The latch write that remains is the objective path:

```838:843:server/wire-service/campaignHousing.ts
  const flipped = await pool.query(
    `UPDATE enrollment
        SET campaign_id=$2, pursuit_state='pursuing', exhausted_at=NULL
      WHERE id=$1 AND campaign_id=$3
      RETURNING id`,
    [enrollmentId, next, currentCampaignId],
  );
```

## Acceptance

A deterministic check, named by the systems-change packet, must prove these cases. `npm run build` is not that proof.

1. Two enrollments for one firm and contact, different `campaign_id` values. `GET` with `campaignId` set to the older enrollment’s campaign changes zero enrollment rows. Both `campaign_id` values remain.
2. `GET` with `campaignId` set to the newest enrollment’s current campaign changes zero rows.
3. `GET` with no `campaignId` changes zero rows.
4. When the query names a campaign other than the stored cursor, the response’s Now state still follows the stored cursor: newest `enrollment.campaign_id`, otherwise the link’s `campaign_id`.
5. `advanceEnrollmentCampaign` still updates the enrollment whose stamped objective is satisfied, and does not update the other enrollment’s `campaign_id`.

## Dependencies

Claim 2 stands: a contact may have two open enrollments. This packet must not close one to make the display easy.

PKT-001 is the click latch on the message stamp. This packet does not change that match. The four founder questions on the initiative are not gates.

## Out of scope

Consent Ignore, fact submit, meeting book, and the click webhook. Claim 28 left this write untouched; this packet does that write’s removal and does not retune claim 28. No plate. The glass already shows the history row. This packet does not paint a new hole.

## Plates

None.

# 6. Engagement contact experience

Not a persona. Firm-branded. Free of payment to Om Coda.

## 6.1 Channel touchpoints (How trees)

| Surface | Behavior |
|---------|----------|
| **Opt-in message** | Firm-branded email/SMS. Consent link / Review request. Branding is the firm’s, not Om Coda’s. |
| **Consent request** | **Agree** (unlocks later nudges / deeper collection) or **Ignore** (no deeper). Either is valid. |
| **Nudge message / Nudge form** | One consolidated form of outstanding **self-reportable** fields. Submit writes facts → re-evaluate. Document-dependent fields never appear. |
| **Update facts** | Later life-change: thread reply or update link; same write-back path. |
| **Meeting invitation / Booking** | Book a time → slot picker → **Confirm booking**. Writes `meeting_booked`. |
| **Loop-closer form** | If outstanding self-reportable fields remain at booking, capture pending the meeting. |
| **Silence / Opt out** | On any touchpoint footer, Consent request, or List-Unsubscribe. Stops automatic outreach. Runners, send gates, and Book readiness honor it. |

## 6.2 Contact workspace seat (later packet; present on this SHA)

No-login, firm-branded workspace. Token family **`/c/<token>`**. Do not ship a 10-item flipper. Nav:

| Tab | Job |
|-----|-----|
| **Now** | Current ask: consent (Agree/Ignore), form (self-reportable fields + Submit), or meeting (slot + Confirm booking) |
| **History** | Asks that prompted outreach; outstanding vs done; open outstanding in Now |
| **Upload** | Contact puts information into the firm (“any type, or a kind”) |

Persistent **Opt out**. Opting out of the workspace can refuse further workspace use (`workspace_opted_out`).

This densifies Seed’s “touchpoints only” silence without a founder close on a full authenticated portal. **UNRESOLVED:** whether this workspace is the V1 contact desk, or still “delivery-only touchpoints” with workspace as an access-link shell.

## 6.3 Access

Magic/direct access links for consultants are `/a/<token>`. Contact seat tokens are `/c/<token>` (`contact_access_links`). Links can be invalidated on silence / consume / opt-out.

## 6.4 What the contact never sees

- Om Coda operator chrome
- Configuration libraries
- Eligibility matrix internals (they may see firm-facing forms and booking, not the open-box rule editor)
- Other contacts in the firm book

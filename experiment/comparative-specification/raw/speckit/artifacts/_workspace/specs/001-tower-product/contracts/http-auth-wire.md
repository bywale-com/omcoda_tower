# Contract: Auth and Wire HTTP

Product-facing services already mounted. This is a specification of intended ports, not new API design. Paths exist under `/auth` and `/wire` (Vite also proxies `/api/*`).

## Auth (`server/auth-service`)

| Method | Path | Intent |
|--------|------|--------|
| GET | `/auth/health` | Liveness |
| POST | `/auth/otp/send` | Request code; unprovisioned → generic success, no code |
| POST | `/auth/otp/verify` | Session; returns firm id for active firm |
| POST | `/auth/otp/abandon` | Drop challenge |
| GET | `/auth/session` | Current session |
| POST | `/auth/logout` | Clear session |
| POST | `/auth/access/issue` | Mint direct access link |
| POST | `/auth/access/redeem` | One-time redeem → session cookie → Ant desk |
| GET/POST | `/auth/register/*` | House register lock/status (not firm product) |

Errors MUST NOT enumerate whether an email is provisioned.

## Wire send and suppression

| Method | Path | Intent |
|--------|------|--------|
| GET | `/wire/health` | Liveness |
| POST | `/wire/send/cem` | Email (Resend when live) |
| POST | `/wire/send/sms` | SMS (Twilio when live) |
| POST | `/wire/webhooks/resend` | Messaging events; hard-bounce silence |
| POST/GET | `/wire/halt*` | Halt commit/lift/list/contact/firm-book |
| POST/GET | `/wire/consent*` | Consent set/silence/get |
| POST/GET | `/wire/oauth*` | CRM grant/revoke/get |
| POST/GET | `/wire/audit*` | Operator audit append/list |
| GET/POST | `/wire/pool*` | Sending domain allocate/verify/chips |
| GET | `/wire/store/:collection` | Primary store (legacy bags) |

Send MUST no-op or reject when halt/consent/silence forbids. Probe without `contactId` may skip consent/halt (ops probe only).

## Machine

| Method | Path | Intent |
|--------|------|--------|
| GET | `/wire/machine/health` | Machine liveness |
| GET/POST | `/wire/machine/tick` | Time path (cascade) |
| CRUD-ish | `/wire/machine/workflows*` | List/create/activate/pause/runs |
| POST | `/wire/machine/enrollments` | Enroll (Agents mission-now vs Automations event — product split is in spec, not a second endpoint family) |
| POST | `/wire/machine/reference` | Publish reference (faceless eligibility trigger) |
| POST/GET | `/wire/machine/audit-runs*` | Audit module |
| POST | `/wire/machine/contact-import` | Import batch |
| GET | `/wire/machine/event-test-contract` | Write-set shape for trigger test data |
| GET | `/wire/machine/board` | Board detections |
| GET | `/wire/machine/templates` | Sequence templates |
| POST | `/wire/hook/:webhookId` | Webhook listen (not an action) |

## Intended ignition (Run vs Launch)

These are product contracts on existing walk, not new routes unless already present:

- **Launch**: activate/arm workflow so future events dispatch. MUST NOT also `startManualRun`.
- **Run**: walk `workflowWalk` now with trigger test-data / payload writes; stop when `configured === false` or `untilNodeId`.
- **Test data**: fills trigger output from existing writes or specimen (`event_test_data`); MUST NOT INSERT the live event as a side effect of the control.

Live vs stand-in: Meta, escrow fulfillment, enrich, Postmaster, warmup, list-unsubscribe remain stand-in.

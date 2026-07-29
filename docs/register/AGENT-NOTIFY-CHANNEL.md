# Agent notify channel — Tower

Outbound SMTP for long agent tasks. Reuses Tally scanner infrastructure on the same machine.

---

## Send email

From `Apps/tally/scanner/` (requires `scanner/.env` with SMTP secrets — not in git):

```powershell
cd "C:\Users\Admin\Documents\Wale Omotayo\Apps\tally\scanner"
python -c @"
from tally_scanner.batch_notify import send_email
ok = send_email(
    subject='[Tower Agent] <topic>',
    body='''Started: …\nWill email when done.'''
)
print('sent' if ok else 'not-sent')
"@
```

**Subject prefix:** `[Tower Agent]`

**Pattern:** kickoff email at start, done email when finished. User acks in chat — do not poll inbox.

---

## Env vars (in `tally/scanner/.env`)

| Var | Purpose |
|-----|---------|
| `BATCH_NOTIFY_EMAIL` | Recipient |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Outbound SMTP |

Optional: `BATCH_NOTIFY_EVERY` for batch progress (LinkedIn scanner default).

---

## Implementation

- `tally/scanner/tally_scanner/batch_notify.py` — `send_email(subject=..., body=...)`

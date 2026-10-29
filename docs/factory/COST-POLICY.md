# Cost policy

Cursor Automations start cloud agents and are billed as cloud-agent usage. Automation runs use the model’s maximum context window. There is no automation-specific context-window control. A prompt gate that stops after a few seconds has already paid for the boot. Travis measured that on packet 009: 18 boots, of which 15 were pull-request no-ops (`docs/register/AUTOMATION-PACKET-CHAIN.md` in `bywale-com/travis`).

## What this factory does about that

- GitHub Actions decides. Cursor boots only from a label, and only after activation.
- This repository’s dispatch workflow has no pull-request trigger and no schedule.
- The label actuator is not wired, so a label cannot be added by the workflow today.
- Checkpoints do not end the run.
- Repair returns to the Engineer seat once. The same failure fingerprint does not start another repair without a new justification.
- External and infrastructure failures do not start an Engineer.
- `budgetUsd: null` means no hard limit is claimed. A prompt sentence is not a budget.

## Illustrative envelope

Not an authorization. Not a price quote.

| Stage | Illustrative USD |
| --- | --- |
| Investigation and packet generation | 12 |
| Systems analysis | 5 |
| Engineering | 9 |
| Diagnostic reserve | 4 |
| Total | 30 |

CI minutes are separate. `factory-check` installs dependencies and runs a Node script. It does not start a model.

## What to measure later

After real authorized runs, record cost per verified packet and cost per completed initiative, including investigation allocated across the packets that initiative released, plus rework. Do not treat the 60-minute cap as an economic optimum until those numbers exist.

The comparison that produced the cap is hypothetical: six short runs at $1.50 startup plus $18 reasoning ($27) against one sustained run at $1.50 startup plus $21 reasoning ($22.50). Reverse the reasoning cost and the short runs win. The factory therefore records the policy and does not freeze it as a finding.

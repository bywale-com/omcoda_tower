# Cost policy

Cursor Automations start cloud agents and are billed as cloud-agent usage. Automation runs use the model’s maximum context window. There is no automation-specific context-window control. A prompt gate that stops after a few seconds has already paid for the boot. Travis measured that on packet 009: 18 boots, of which 15 were pull-request no-ops (`docs/register/AUTOMATION-PACKET-CHAIN.md` in `bywale-com/travis`).

## What this factory does about that

- GitHub Actions decides. Cursor boots only from a label, and only after activation.
- The dispatch workflow’s pull-request job runs the deterministic controller and exits on `actuator disarmed` until the arming flags are set. It has no schedule. It does not boot a model.
- The label actuator is connected and disarmed. Apply adds a label only when the spend-limit confirmation, the saved-automation confirmation, the controller, the label arm, and the wake token are all present, and the ledger’s `authorizedDispatches` is a positive count. None of that is set.
- Checkpoints do not end the run.
- Repair returns to the Engineer seat once. The same failure fingerprint does not start another repair without a new justification.
- External and infrastructure failures do not start an Engineer.
- `budgetUsd` is illustrative. A null or zero dollar figure does not authorize a wake, and a large dollar figure does not either.
- `authorizedDispatches: null` on the ledger is not unlimited. An active controller refuses wakes until that count is a fixed positive number of runs. It is null in this change.
- No timer enforces the 10–15 minute checkpoint or the 60-minute cap. Those are instructions in the Architect prompt.

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

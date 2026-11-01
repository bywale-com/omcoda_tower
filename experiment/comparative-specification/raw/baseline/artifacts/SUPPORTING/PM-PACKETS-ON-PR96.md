# PM packets living on origin pull/96 (not all merged as docs on main)

Inspected 2026-10-19 from `refs/tmp/pr96`. These are **product-face packets** for Automations/Agents/Contact chrome. Several were later cut into main via engineer PRs (If/Switch, form class, contact workspace, wait occupancy, add tag, etc.). They specify plate interiors; they do not recut Seed/World.

| Packet | One-line |
|--------|----------|
| PLATE-READ | Five buckets when reading a locked plate: Copy / Do not build / Implied / Completes / Out of scope |
| TRIGGER-SELECT (A26) | Named event list; Global/Local axes; `⋯` Switch = change kind |
| NODE-INTERIOR | Shared vs kind-specific interior |
| NODE-PLACE (A27–A28) | Options · wire + |
| GET (A22–A23) | Retrieve data node |
| INPUT-LOOK (A29) | How input looks |
| MAPPED-BOX (A31–A32) | Value in the box; close Input / resize |
| RULE-OUTPUT (A20) | Rule output rows |
| RULE-OUTCOMES (A21) | Outcomes compare / chips |
| IF-SWITCH | If = two wires; Switch = many paths + fallback. Paths are wires. Palette Switch ≠ ⋯ Switch |
| IN-APP-ACTION | Module affordances as the action inventory |
| ADD-TAG (A35) | Ascribe tag parameters |
| AUDIT-FIELD (A34) | Audit mark on Contacts — hardcoded field, not an Action |
| FORM-CLASS (A40) | Form class occupies the form |
| TEST | Provide test data **on the trigger** (no Test tab) |
| RUN | Execute now vs arm the event; canvas Save · Run · Launch |
| SHELL-CHROME | Consultant ▾ · Operator · Contact ▾ |
| CONTACT-WORKSPACE | Seat · Now · History |
| CONTACT-UPLOAD | Put in · kind · Files · search |
| CONTACT-UPLOADED-EVENT (A41–A44) | Upload as event |
| WORKSPACE-UNTIL-OPT-OUT | Workspace persists until opt out |
| WAIT-NOTE / APPROVER | Occupancy notes; Approve now / later |

These packets refine §8 and §6. They do not replace the Agents 15:43 flagship.

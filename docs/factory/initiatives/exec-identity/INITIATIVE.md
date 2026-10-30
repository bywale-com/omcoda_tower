# exec-identity — which execution a result belongs to

**Module:** Agents and Automations  
**Entry:** Operator → Configuration libraries → Agents and Automations. One execution’s result must stay distinguishable from another’s.  
**Obligation:** The identity rules locked on PR #135. Neighboring capabilities are recorded, not absorbed.  
**Investigation:** investigating  
**Source:** PR #135 at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. Read-only.

## Packets

| Id | Wake | Stage | Required |
| --- | --- | --- | --- |
| pkt-001-click-attribution | hold | draft | no |
| pkt-002-open-ask-cursor | sa | released | yes |
| pkt-003-resume-same-run | sa | released | yes |
| pkt-004-firing-handle | sa | released | yes |
| pkt-005-audit-row-grain | sa | released | yes |
| pkt-006-id-keyed-loads | sa | released | yes |
| pkt-007-fact-writes | sa | released | yes |
| pkt-008-meeting-writes | sa | released | yes |
| pkt-009-eligibility-writes | sa | released | yes |
| pkt-010-campaign-failure-writes | sa | released | yes |
| pkt-011-halt-records-writes | sa | released | yes |
| pkt-012-consent-opt-out-writes | sa | released | yes |

`required` is no until the packet is released. A held draft does not block the initiative, and it does not complete it. PKT-001 stays held. The released packets do not close the initiative.

## Founder decisions

Listed on the manifest and in [PR-135-MAP.md](../../PR-135-MAP.md). None of them gate PKT-001.

## Not this initiative

`launch-agent` is discovered only.

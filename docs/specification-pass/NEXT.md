# Next

## Established

Claims 1–60 stand in `docs/specification-pass/SPECIFICATION.md`. Claim 58 is what `sequence_ready.ready` stores. Claim 59 is the founder kill-switch lift. Claim 60 is `any_pathway_pass`.

Claim 60: the column is the OR of this evaluation’s enabled pathway entries on `result.pathways`. The trigger fields already on `result` stay. An enabled family is a `rule_eligibility_pathway` row for this firm, or a platform row, whose `set_value` is not `any_pathway_pass` and whose `enabled` is true. On the seed that is CEC and FSW. PNP is off. There is no FST row. The motion expression reads that boolean: `reactivation` or `nudge`. Precedence is `mp-1` or `mp-2` with the motion. The rule node’s missing-fact pass, the pack’s pathway-and-draw pass, and the pack’s work-permit reactivation signal are not the column. One firing payload still cannot carry two contacts’ motions. The per-family `pass` is the founder question below. The live insert is still the constant `true`.

## Still worth investigating

A missing-fact detection is a `missing_fact_signals` row from the rule node. This firing’s `signals` row is one `eligibility_determination`. Seed §5.8 says every detection, including missing-data, is recorded as a signal. Whether that missing-fact row is also a `signals` insert is the next read.

A halt still does not decide Engine 2’s “one client, one motion,” and it does not decide the attempt engine’s live-override. Claim 20 postponed that abort. Claim 59 does not nullify the attempt. Claim 54 keeps one firing to one sequence and does not add a unique enrollment constraint.

## Founder question

Launch day stays the ask `docs/register/SYSTEMS-GOAL.md` already left open, and it still says not to fill it. The choice is who is placed on `camp.optin.day`: only contacts who were `waitlisted`, or the book that is already in the opt-in sequence. What changes is which contacts an enrollment cursor is allowed to move onto that campaign. Nothing in this pass writes `waitlisted`. An attempt already on class `optin` uses purpose `opt-in` while the cursor sits there. That is claim 45. It is not a decision about who is placed there.

Repeat compression stays the question `docs/register/system-map/BUILD-system-map-v3-templates-and-binding.md` section C already marked named-silent. The choice is whether a later reactivation of a contact who already walked the days-1–3 nurture sends those two emails again, or walks a shorter cell. What changes is the cells that repeat enrollment’s cursor advances through. The first calendar is claim 51. The build said not to invent the repeat.

A `deferred` event’s hold stays open. The choice is whether the next email to that same address waits, and for how long, or whether the row is only a record and the due cell still sends. What changes is whether one temporary delay holds that address’s later mail. `deliv-23` wants the backoff inside a provider window. The payload does not name the receiving server and does not name a retry time, so a full inbox and a transient receiving server are the same event. One delay does not pause the firm. That part is claim 56. Parsing the recipient domain was not chosen, because a custom domain is not the receiving server and one full inbox would then hold every recipient at that domain.

What makes one enabled family’s `pass` true stays open. The choice is which encoder fills it. The client pack’s current assertion would store `reactivation` whenever CEC or FSW clears the constants already in `pack.immigration.criteria` (hours, CLB, TEER), including on a later cascade that sees the same assertion, and would store `nudge` when neither family clears. The SME note in `docs/sme/pass2/01-immigration-pathway-eligibility.md` elig-04 would store `reactivation` only for a material change — a minimum newly met, a cutoff newly crossed, a nomination or offer or certificate newly held, or a time-critical ops loss — and would keep a stable pass and a pure missing self-reportable off that motion. The seed clauses are null. Treating that emptiness as “no assertion” would store `nudge` for every contact. Treating `epath-any.enabled` as the pass would store `reactivation` for every contact, which is the live constant claim 60 refuses. What changes is who claim 52 enrolls and who claim 54 enrolls. Seed §5.7 settles the OR. Seed §5.8 names the worthy predicate a silence. The pack, the SME note, and the empty clauses are three fillings, and the motion expression does not take a second flag.

## Next move

Start at the missing-fact signal. Seed §5.8 records every detection, including missing-data, as a signal. The rule node writes `missing_fact_signals`. The cascade writes one `signals` row of kind `eligibility_determination`. Read those two inserts and what the form already lists before deciding they are the same row. Leave the four founder questions recorded. Claim 60 stands.

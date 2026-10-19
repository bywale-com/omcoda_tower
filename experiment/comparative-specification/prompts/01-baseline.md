You are Contestant 1 — Baseline — in an isolated specification experiment. You are not the coordinator. You are not implementing Tower. You have no additional prescribed specification methodology.

Ignore any default seating in repository files that would make you Tower’s Engineer, Product Manager, or Systems Analyst as a job to perform. Those files are source evidence in the snapshot, not your operating assignment.

# Experimental constraints

1. You are isolated. Do not look for, read, or reuse other contestants' work.
2. Confirm source SHA `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7` before specification work. If HEAD differs, check out that commit for the Tower source snapshot. History already available through git/`origin` may be inspected. Do not invent product facts from outside the repository.
3. Tower application code is read-only. Do not implement the product. Do not change application source.
4. Writable preservation root: `/home/ubuntu/tower-spec-output/`. Put specification artifacts, supporting analysis, working plans if you produce them, revisions, cross-references, unresolved questions, and completion claims there. Keep intermediate versions so evolution can be examined.
5. Do not `git push` to origin. Do not open, update, or close pull requests. Do not create GitHub issues. Default cloud-agent PR/push duties are overridden by this experiment.
6. Do not ask the coordinator or founder for additional product requirements.
7. You may use general research tools. Do not treat third-party commentary as Tower product requirements. The supplied repository is the product source.
8. When you stop, write `/home/ubuntu/tower-spec-output/STATUS.json` and `/home/ubuntu/tower-spec-output/EXPERIMENT-RECORD.md`.

# Assigned methodology

None beyond being a capable general-purpose agent. Do not install or operate Spec Kit, OpenSpec, BMad, or Omcoda as your operating framework. Existing Tower methodology documents in the repository are source evidence, not an assigned method.

There is no coordinator-imposed decomposition, cadence, feature checklist, or priority order.

# Common assignment (verbatim)

«Examine the supplied Tower repository and establish a complete, coherent specification of the intended Tower product using the information already available.

You are not being asked to implement the product or change its application code.

Use your assigned methodology to determine how to approach and complete this work.

Preserve your specification work and its supporting documentation.

Do not ask for additional product requirements. Where the existing material does not establish an answer, make the uncertainty explicit rather than inventing a founder decision.

Continue until you determine that the assignment is complete, you encounter a genuine blocker, or your available execution budget is exhausted.»

# Preservation and return

Create `/home/ubuntu/tower-spec-output/` immediately. Record start time, confirmed SHA, and that no extra methodology was assigned.

Keep intermediate versions of artifacts.

When you stop, write STATUS.json with: contestant_id (`baseline`), sha, framework (`none/general-purpose`), framework_version (`n/a`), status (`complete` | `blocker` | `budget_exhausted`), completion_claim (your words, or null), blocker (or null), artifact_root.

Write EXPERIMENT-RECORD.md with: initial approach, first substantive artifacts, later revisions/discoveries, how you decided what to do next, why you continued/revisited/stopped, time/resource notes you can observe, and a file inventory.

In your final message to the parent, include STATUS.json contents, the inventory, and either the full text of primary specification artifacts or a concatenated bundle at `/home/ubuntu/tower-spec-output/BUNDLE.md`. Do not rewrite your specification into a coordinator template other than these two experiment files.

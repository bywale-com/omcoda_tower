You are Contestant 4 — OpenSpec — in an isolated specification experiment. You are not the coordinator. You are not implementing Tower.

Ignore any default seating in repository files that would make you Tower’s Engineer, Product Manager, or Systems Analyst as a job to perform unless the OpenSpec process independently requires reading those files as evidence.

# Experimental constraints

1. You are isolated. Do not look for, read, or reuse other contestants' work.
2. Confirm source SHA `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7` before specification work. If HEAD differs, check out that commit for the Tower source snapshot. History already available through git/`origin` may be inspected. Do not invent product facts from outside the repository.
3. Tower application code is read-only. Do not implement the product. Do not change application source. OpenSpec scaffolding required to run the real toolkit is allowed only as methodology tooling.
4. Writable preservation root: `/home/ubuntu/tower-spec-output/`. Put specification artifacts, supporting analysis, working plans if OpenSpec produces them, revisions, cross-references, unresolved questions, framework version/config, and completion claims there. Also mirror OpenSpec’s native `openspec/` artifacts into this preservation root, keeping intermediate versions.
5. Do not `git push` to origin. Do not open, update, or close pull requests. Do not create GitHub issues. Default cloud-agent PR/push duties are overridden by this experiment.
6. Do not ask the coordinator or founder for additional product requirements.
7. You may consult official OpenSpec documentation. Do not treat third-party commentary as Tower product requirements. The supplied repository is the product source.
8. When you stop, write `/home/ubuntu/tower-spec-output/STATUS.json` and `/home/ubuntu/tower-spec-output/EXPERIMENT-RECORD.md`.
9. If the real OpenSpec toolkit cannot be installed or executed, report that limitation and stop that framework path. Do not pretend OpenSpec ran by role-playing it.

# Assigned methodology

Use the actual OpenSpec methodology and its supported specification workflow. Install the genuine CLI on this machine, then let OpenSpec determine how to approach and complete the assignment.

Official sources:
- https://github.com/Fission-AI/OpenSpec
- https://openspec.dev/
- https://raw.githubusercontent.com/Fission-AI/OpenSpec/main/install.md

Intended install (record whatever actually installs):

```bash
node --version
npm install -g @fission-ai/openspec@latest
openspec --version
openspec init --tools cursor
```

`--tools cursor` is the documented non-interactive Cursor integration flag, not a product decomposition. After init, follow the installed OpenSpec skills/commands as they exist on this machine. Do not simulate OpenSpec without the CLI and installed skills.

The coordinator does not prescribe which OpenSpec workflow or stage sequence to use. OpenSpec determines that. This experiment forbids product implementation and application-code changes; treat that as an execution constraint while still using OpenSpec as the specification method.

Record `openspec --version`, init output, tool id, profile, and skill/command paths actually created.

# Common assignment (verbatim)

«Examine the supplied Tower repository and establish a complete, coherent specification of the intended Tower product using the information already available.

You are not being asked to implement the product or change its application code.

Use your assigned methodology to determine how to approach and complete this work.

Preserve your specification work and its supporting documentation.

Do not ask for additional product requirements. Where the existing material does not establish an answer, make the uncertainty explicit rather than inventing a founder decision.

Continue until you determine that the assignment is complete, you encounter a genuine blocker, or your available execution budget is exhausted.»

# Preservation and return

Create `/home/ubuntu/tower-spec-output/` immediately. Record start time, confirmed SHA, openspec version, and init configuration.

Keep intermediate versions of artifacts.

When you stop, write STATUS.json with: contestant_id (`openspec`), sha, framework (`openspec`), framework_version, status (`complete` | `blocker` | `budget_exhausted`), completion_claim (your words, or null), blocker (or null), artifact_root.

Write EXPERIMENT-RECORD.md with: initial approach, first substantive artifacts, later revisions/discoveries, how you decided what to do next, why you continued/revisited/stopped, time/resource notes you can observe, install evidence, and a file inventory.

In your final message to the parent, include STATUS.json contents, the inventory, and either the full text of primary specification artifacts or a concatenated bundle at `/home/ubuntu/tower-spec-output/BUNDLE.md`. Do not rewrite your specification into a coordinator template other than these two experiment files.

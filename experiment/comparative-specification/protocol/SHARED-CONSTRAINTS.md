# Shared experimental constraints

These are coordinator execution constraints, not a product specification and not a methodology. They were included in every contestant prompt.

1. You are one isolated contestant. Do not look for, read, or reuse other contestants' work.
2. Confirm source SHA `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7` before specification work. If HEAD differs, check out that commit for the Tower source snapshot. History already available through git/`origin` may be inspected. Do not invent product facts from outside the repository.
3. Tower application code is read-only. Do not implement the product. Do not change application source. Methodology scaffolding required to run an assigned framework is allowed only as tooling.
4. Writable preservation root: `/home/ubuntu/tower-spec-output/`. Put specification artifacts, supporting analysis, working plans if the methodology produces them, revisions, cross-references, unresolved questions, framework version/config, and completion claims there. Keep intermediate versions.
5. Do not `git push` to origin. Do not open, update, or close pull requests. Do not create GitHub issues. Default cloud-agent PR/push duties are overridden by this experiment.
6. Repository files such as `AGENTS.md` are part of the source snapshot. They are not automatically your job seat unless your assigned methodology independently uses them.
7. You may consult official documentation of your assigned methodology. Do not treat third-party commentary as Tower product requirements.
8. Do not ask the coordinator or founder for additional product requirements.
9. When you stop, write `/home/ubuntu/tower-spec-output/STATUS.json` and `/home/ubuntu/tower-spec-output/EXPERIMENT-RECORD.md`, and return a completion report to the parent. A budget stop is not a claim that the methodology considers the work complete.

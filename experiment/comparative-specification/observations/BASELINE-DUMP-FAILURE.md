# Coordinator checkpoint — Baseline VM output missing

Preservation incident, not a methodology score.

[Baseline spec contestant](bc-1afeb59a-6ec2-5eff-8f49-a771bc53008a) was resumed only to copy `/home/ubuntu/tower-spec-output`. The VM reported that directory missing. No PR. Diff metadata still empty.

Likely cause: contestant output was written outside the git worktree (`/home/ubuntu/…`). The follow-up resume did not keep that filesystem. This is an execution limitation for cloud-subagent preservation.

## Recovery (untouched reconstruction)

Platform `search_replace` results still contained applied unified diffs. Coordinator reconstructed the written files from those diffs into:

`/cursor/stores/self/tower-spec-experiment/raw/baseline/artifacts/`

21 files created in the diffs; 3 later edits (`SPEC/02-ACTORS-AND-DESKS.md`, `SPEC/07-AGENTS.md`, `SPEC/05-OPERATOR-DESK.md`). No hunk mismatches.

`BUNDLE.md` and `revisions/` were originally produced by shell `cp`/`echo`, not diffs. Those were rebuilt after the fact from the reconstructed `SPEC/` tree (v1 snapshot taken at the first revision command; v2 from the final spec). Marked as coordinator reconstruction, not a second contestant pass.

Dump follow-up transcript saved at `raw/baseline/platform/dump-followup-transcript.json`.

Omcoda artifacts were reconstructed the same way from its original transcript as a precaution, in case its dump hits the same empty home directory.

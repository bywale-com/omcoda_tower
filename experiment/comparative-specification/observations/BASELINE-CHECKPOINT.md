# Coordinator checkpoint — Baseline stopped

Observation only. No quality judgment. Other contestants were not contacted.

| Field | Value |
| --- | --- |
| Lane | 1 Baseline |
| Agent | [Baseline spec contestant](bc-1afeb59a-6ec2-5eff-8f49-a771bc53008a) |
| URL | https://cursor.com/agents/bc-1afeb59a-6ec2-5eff-8f49-a771bc53008a |
| Platform status after stop | IDLE |
| CreatedAtMs | 1792428378083 |
| UpdatedAtMs | 1792428713807 |
| Elapsed | 335.7 s (~5 min 36 s) |
| Reported SHA | `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7` (claimed match to HEAD) |
| Framework | none/general-purpose |
| Self-status | `complete` |
| Blocker | null |
| PR / git push | none recorded (`prUrl` null; `linesAdded` null) |
| Branch | null |
| Model field in listing | `originalModelName` null (uncontrolled; intended inherit) |
| Environment build | `bld-20261019-7931bd05-bcbc-4c3b-8d64-3614b0865425` |
| Egress | unrestricted |

## Reported artifact inventory (contestant’s words)

```
/home/ubuntu/tower-spec-output/
 00-START.md
 01-APPROACH.md
 SOURCE-MAP.md
 STATUS.json
 EXPERIMENT-RECORD.md
 BUNDLE.md
 SPEC/ (14 primary chapters)
 SUPPORTING/ AS-BUILT-VS-INTENDED.md, PM-PACKETS-ON-PR96.md
 revisions/ v1-2026-10-19T16, v2-after-seat-and-guidelines
```

## Tool-record summary from transcript (not a spec rewrite)

Transcript stored at `raw/baseline/platform/transcript.json` (781,676 bytes, 273 messages: 1 user, 154 assistant, 118 tool).

Tool counts: `read_file` 76, `search_replace` 24, `run_terminal_cmd` 8, `grep` 6, `glob_file_search` 3, `get_mcp_tools` 1.

Platform transcript **does not include** `search_replace` / write bodies. Coordinator therefore requested a preservation-only dump from the still-idle VM. That follow-up is archival, not a new specification assignment.

Shell activity visible in the transcript includes: SHA confirm; repo/docs listing; `git ls-remote` of pull refs; fetch of `origin pull/96/head`; later copy of `SPEC/` into `revisions/v1-…` and `revisions/v2-after-seat-and-guidelines`.

## Completion claim

Preserved verbatim in `raw/baseline/STATUS.json`. Coordinator does not adopt it as an evaluation result.

## Other lanes at this checkpoint

Still RUNNING: Omcoda, Spec Kit, OpenSpec, BMad. No founder roundup queued.

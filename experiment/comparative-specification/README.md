# Comparative specification experiment — reading copy

Pinned Tower snapshot: `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7`.

This directory is the coordinator archive. It is **not** a Tower product change. It is **not** a scored ranking.

The recovery incident (resume VMs lost `/home/ubuntu` and `/workspace` working files) is a **harness** failure. Reconstructed files come from original-run `search_replace` diffs. Judge the methods from those artifacts, not from the failed dumps.

## Start here

1. Coordinator observation report (no winner): [`report/EXPERIMENT-REPORT.md`](report/EXPERIMENT-REPORT.md)
2. The five specifications, in their native shapes (do not expect a common template):

| Lane | Start reading | Concatenated bundle |
|------|---------------|---------------------|
| Baseline | [`raw/baseline/artifacts/SPEC/00-HOW-TO-READ.md`](raw/baseline/artifacts/SPEC/00-HOW-TO-READ.md) | [`raw/baseline/artifacts/BUNDLE.md`](raw/baseline/artifacts/BUNDLE.md) |
| Omcoda | [`raw/omcoda/artifacts/SPEC/TOWER-INTENDED-PRODUCT.md`](raw/omcoda/artifacts/SPEC/TOWER-INTENDED-PRODUCT.md) | [`raw/omcoda/artifacts/BUNDLE.md`](raw/omcoda/artifacts/BUNDLE.md) |
| GitHub Spec Kit | [`raw/speckit/artifacts/_workspace/specs/001-tower-product/spec.md`](raw/speckit/artifacts/_workspace/specs/001-tower-product/spec.md) | [`raw/speckit/artifacts/BUNDLE.md`](raw/speckit/artifacts/BUNDLE.md) |
| OpenSpec | [`raw/openspec/artifacts/_workspace/openspec/changes/specify-intended-tower-product/proposal.md`](raw/openspec/artifacts/_workspace/openspec/changes/specify-intended-tower-product/proposal.md) | [`raw/openspec/artifacts/BUNDLE.md`](raw/openspec/artifacts/BUNDLE.md) |
| BMad Method | [`raw/bmad/artifacts/_workspace/_bmad-output/specs/spec-tower/SPEC.md`](raw/bmad/artifacts/_workspace/_bmad-output/specs/spec-tower/SPEC.md) | [`raw/bmad/artifacts/BUNDLE.md`](raw/bmad/artifacts/BUNDLE.md) |

Each lane also has `STATUS.json`, `EXPERIMENT-RECORD.md` (how it chose what to do next and why it stopped), and `RECONSTRUCTION.md` (what the coordinator rebuilt vs what the contestant wrote).

## Layout

```
experiment/comparative-specification/
  README.md                 this file
  protocol/                 SHA, environment, frameworks, shared constraints, prompts
  prompts/                  exact contestant prompts
  observations/             coordinator checkpoints (not scores)
  report/EXPERIMENT-REPORT.md
  raw/<lane>/
    platform/               transcripts, events, diff-metadata
    artifacts/              recovered specification trees
    STATUS.json
```

OpenSpec capability specs live next to the proposal:

`raw/openspec/artifacts/_workspace/openspec/changes/specify-intended-tower-product/specs/*/spec.md`

BMad PRD / UX / architecture companions:

`raw/bmad/artifacts/_workspace/_bmad-output/planning-artifacts/`

## What this archive is not

- Not a claim that more files means a better specification.
- Not a claim that a contestant’s `status: complete` is an evaluation result.
- Not Tower application code.

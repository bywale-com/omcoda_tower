# Framework versions and configuration intended at launch

Contestants must install and record the versions they actually obtained. Coordinator does not simulate a framework.

## 1. Baseline

- No additional prescribed specification methodology.
- No Spec Kit / OpenSpec / BMad / Omcoda operating assignment.
- Tower methodology documents remain readable as source evidence only.

## 2. Omcoda

- Operating framework: Omcoda Seed, World, How Analysis, systems, capability, and related methodology as documented in the pinned snapshot.
- No external package install.
- Configuration: the methodology files at SHA `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7`.
- Contestant records the actual document paths used.

## 3. GitHub Spec Kit

- Official project: https://github.com/github/spec-kit
- Docs: https://github.github.io/spec-kit/
- Intended CLI pin: `specify-cli` from `git+https://github.com/github/spec-kit.git@v1.2.1` (release 2026-10-16, tag `v1.2.1`)
- Install: `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v1.2.1`
- Existing-project init: `specify init --here --force --integration cursor-agent`
- Integration key: `cursor-agent` (Cursor)
- Contestant records `specify version` and init output.
- Contestant follows installed Spec Kit skills/process. Coordinator does not prescribe constitution → specify → plan sequence.

## 4. OpenSpec

- Official project: https://github.com/Fission-AI/OpenSpec
- Docs: https://openspec.dev/
- Intended package: `@fission-ai/openspec@latest` then record exact version (npm listed 1.14.3 at lookup)
- Install: `npm install -g @fission-ai/openspec@latest`
- Init: `openspec init --tools cursor`
- Contestant records `openspec --version` and init output.
- Contestant follows installed OpenSpec skills/process. Coordinator does not prescribe explore → propose → apply sequence.

## 5. BMad Method

- Official project: https://github.com/bmad-code-org/BMAD-METHOD
- Intended line: stable npm package `bmad-method@6.12.4` (npm 2026-10-14)
- Official docs currently also describe a v7 preview-alpha skills route. Contestant is assigned the stable BMad Method installer unless that installer cannot run, in which case the limitation is reported rather than silently switching.
- Install discovery: `npx bmad-method@6.12.4 --list-tools`
- Intended non-interactive install:
  `npx bmad-method@6.12.4 install --yes --action install --modules bmm --tools <cursor-tool-id>`
- Output folder: framework-native plus a preservation mirror at `/home/ubuntu/tower-spec-output/`
- Contestant records installer version, module IDs, tool ID, and configured output paths.
- Contestant follows installed BMad workflows. Coordinator does not prescribe which BMad workflow to run.

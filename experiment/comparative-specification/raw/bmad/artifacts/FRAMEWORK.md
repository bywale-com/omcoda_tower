# BMad Method — install evidence

- **package:** `bmad-method@6.12.4` (`npx bmad-method@6.12.4 --version` → 6.12.4)
- **modules:** `core` 6.12.4, `bmm` 6.12.4
- **tool ID:** `cursor` (from `bmad install --list-tools`; skills → `.agents/skills`)
- **note:** top-level `--list-tools` is invalid; the flag is on `install`
- **project root install:** `/workspace/_bmad`
- **output folder:** `_bmad-output` (planning-artifacts, specs)
- **user_name:** Contestant 5
- **project_name:** Tower
- **project_knowledge:** docs
- **user_skill_level:** expert (config.user.toml)
- **uv:** 0.13.1 (required for skill Python scripts; installed during this run)
- **node:** v22.23.3
- **skills installed:** 29 under `/workspace/.agents/skills`
- **did not switch** to v7 preview-alpha `npx skills add` path
- **installer log:** `install-evidence/bmad-install.log`
- **native output mirrored to:** `/home/ubuntu/tower-spec-output/bmad-native/_bmad-output`

Install command used:

```bash
npx --yes bmad-method@6.12.4 install --yes --action install --modules bmm --tools cursor \
  --user-name "Contestant 5" --communication-language English \
  --document-output-language English --output-folder _bmad-output \
  --set core.project_name=Tower --set bmm.project_knowledge=docs \
  --set bmm.user_skill_level=expert
```

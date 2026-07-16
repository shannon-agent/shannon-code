# ⚠️ ARCHIVED — This repo has been consolidated into the Shannon Agent monorepo

**This repository is no longer maintained.** All development has moved to:

👉 **https://github.com/diff-lab-com/shannon-agent**

## What happened

`shannon-code` (Rust engine + CLI) has been merged into the
[shannon-agent](https://github.com/diff-lab-com/shannon-agent) monorepo
alongside `shannon-desktop` and `shannon-gateway`. The three products are now
individually shippable from a single repository with one shared engine and one
shared wire protocol (`shannon-api-protocol`).

| Old location | New location |
|---|---|
| `shannon-code/crates/*` | `crates/*` in the monorepo |
| `shannon-code/Cargo.toml` | root `Cargo.toml` (Cargo workspace) |
| CLI entry (`shannon` binary) | `cargo install --git https://github.com/diff-lab-com/shannon-agent.git shannon-cli` |

## For users

The binary, behavior, and CLI interface are unchanged. Install with:

```bash
cargo install --git https://github.com/diff-lab-com/shannon-agent.git shannon-cli
```

Or download prebuilt binaries from
[GitHub Releases](https://github.com/diff-lab-com/shannon-agent/releases).

## For contributors

- Open issues and PRs on https://github.com/diff-lab-com/shannon-agent
- The full history of this repo is preserved as git commits inside the monorepo
  (merged via `git subtree` in Phase 1 of the consolidation).
- This repo is now read-only.

## Reference

- Migration runbook: `MIGRATION.md` at the monorepo root
- License: Apache-2.0 (unchanged)
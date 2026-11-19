---
audience: maintainer
read-when: considering splitting the repo
---

# No repo split

Decided 2026-11-19. A snapshot: not updated as the repo changes.

## Decision

All products stay in this repo. The split plan — the Rust crate first, further repos after — is dropped.

- plan documents, and the repo shape they started from: tag `pre-nosplit`
- the plan's removal: complete at tag `nosplit-done`

## The dropped plan

- repos:
  - `zshref`: the crate, with its CLI and MCP server binaries; extracted first
  - `zshref-mcp`: a thin storefront for the MCP server — npx packaging, registry presence; code staying in `zshref`
  - the SPA: its own repo, possibly publishing its NLP layer as a package
  - this repo: the TS lib, plus the extension for convenience
- order: lib release → `zshref` → `zshref-mcp` → the SPA; trusted-publishing grants re-pointed along the way
- data: the crate pins one lexicon release and vendors its assets; the dual-mode build script — in-tree artifacts in the monorepo, vendored ones otherwise — landed in preparation
- shared conventions (`AGENTS.md`, maintainer docs, skills, lint scripts): duplicated per repo, or kept in a maintenance directory here, the working directory for cross-repo agent work; unresolved
- Homebrew: a tap inside `zshref`, a dedicated tap repo, or the general tap; undecided
- the extension registering the MCP server: deferred until `zshref-mcp` had its own repo
- open when dropped:
  - a `zshref-mcp` repo at all
  - where the CLI-probing skill lives
  - history carried over or a fresh start
  - tag prefix
  - what triggers a lexicon pin bump: a manual PR or a polling job

## Alternatives weighed

- the full split, as planned
- extracting only the crate
- a read-only mirror repo of the crate: sync machinery and a second issue tracker for no technical gain

## Reasons

- _time_: a split costs time to do, then slows every change crossing repos; the priority is first stable releases of all products
- _shared conventions_: one set governs all products; a split duplicates it or needs sync machinery
- _steering_: cross-repo rules and release ordering had no home
- _maintenance posture_ (principles doc): one repo is the easier structure to re-understand
- _small build win_: extraction removes the make bridge, the build script's monorepo arm and CI path filters; build stamps and upstream-readiness checks stay, serving the workspace links
- _atomic cross-language changes_: a resolver change, its Rust mirror and the conformance fixture land in one commit and one CI run; split: a lib release, then a pin bump in another repo
- _reversible_: the packaged crate is self-contained, CI tests it standalone, and `git filter-repo` extracts the crate any time

## Consequences

- _provenance_: vendoring packs the in-tree lexicon, possibly unreleased; every product release embeds a released one
  - zshref: the release checks its vendored data against that lexicon release's assets
  - the extension and the site: same rule
- _distribution_: every channel publishes from this repo; no trusted-publishing grant moves
  - MCP Registry: listed via its monorepo subfolder field
  - Homebrew: the formula joins the general tap and builds both binaries
  - post-extraction URLs (`github.com/carlwr/zshref`): re-pointed here
- _landing pages_: registry pages link the repo root, so the root README routes by product; registry metadata links product directories
- _one Releases page_: titles name the product; "Latest" set explicitly
- _shared toolchain_: one lockfile, Node floor and CI for all products; accepted
- _building the crate from a clone_: needs the Node toolchain; installing from crates.io does not
- _the extension registering the MCP server_: after `zshref-mcp`'s first stable release
- _NLP package_: still possible within this repo

## Revisit when

- a product draws contributors of its own
- one product's dependencies or CI burden the others

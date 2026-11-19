---
audience: maintainer
read-when: orienting on repo layout, product dependency arrows, release streams
---

# Repo shape

Single source of truth for the layout, the product dependency arrow set and the release streams.

## Layout

```
.
├── packages/
│   ├── zsh-lexicon          TS lib: lexicon, resolvers, rendering; emits the release assets
│   ├── vscode-better-zsh    VS Code extension
│   └── zsh-lexicon-web      SPA; all NLP; index built at build time
└── zshref-rs/               Rust crate: `zshref` CLI + `zshref-mcp` bins; not a pnpm member
```

The crate ships as `zshref`; `zshref-rs/` is its directory here.

## Dependencies

An arrow reads "consumes, pinned by version"; its label is the mechanism:

```
                         zsh-lexicon
          ┌───────────────────┼────────────────────────┐
   workspace link      workspace link           release assets
    (built dist/)       (built dist/)    (lexicon JSON, resolver fixture)
          ▼                   ▼                        ▼
  vscode-better-zsh    zsh-lexicon-web             zshref-rs
                       ┌──────┴──────┐
                       ▼             ▼
               HuggingFace Hub    jsDelivr
             (model, at runtime) (ORT .wasm, at runtime)
```

- workspace link: pnpm `workspace:*` onto the upstream's built `dist/`; freshness: `scripts/build/README.md`
- release assets: zsh-lexicon's release tarballs, packed and vendored by `make vendor` — `zshref-rs/docs/data-sync.md`
- `zsh-lexicon-web` consumes `zsh-lexicon` at build time only — the index build; the browser bundle is `zsh-lexicon`-free (`packages/zsh-lexicon-web/AGENTS.md`)
- zsh-lexicon is the only producer; the in-repo consumers are leaves with no consumer of their own

Invariants — what the shape was chosen for, and the constraint on any change to it (principles: `docs/principles.md` §"Cross-project structure"):

- one root of truth; every edge a pinned version of a standard mechanism
- leaves have no consumers: no freshness oracles, no fingerprints
- one behaviour mirror — the resolvers — owned by `zshref-rs`, checked against a fixture co-released with the lexicon
- one language crossing, one direction — TS → Rust — carried by data; the mirror above is its only behaviour component

The shape before the 2026 reorg, and why it changed: the tag `pre-reorg` (its `.reorg-work/`).

## Names

Settled public names:

- this repo `zsh-lexicon`
- TS lib `@carlwr/zsh-lexicon`
  - alphas up to `0.1.0-alpha.2` published as `@carlwr/zsh-core`, tagged `zsh-core-v*`
- CLI `zshref`; MCP server `zshref-mcp`
  - MCP Registry: `io.github.carlwr/zshref-mcp`
- SPA `zsh-lexicon-web`
- extension `better-zsh`, displayed "Better Zsh"
  - pnpm package name: the extension ID's, so stays `better-zsh`

## Releases

- one tag stream per `release-*.yml` workflow; its prefix: the `on:` trigger
  - one crate, so `zshref` and `zshref-mcp` share a version and a tag
- "Latest" on the Releases page is zshref's: every other stable `gh release create` passes `--latest=false`
- every product release embeds a released lexicon; release workflows check it: `scripts/check-released-lexicon`

## One repo

All products stay in this repo; why: `docs/decisions/no-repo-split.md`.

## Detail scope

A leaf's specifics live under its own directory. Root maintainer docs point at them; they don't restate the detail.

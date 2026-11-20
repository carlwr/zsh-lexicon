// The deployed-ids list against the lexicon. A committed input: no gate.

import { loadLexicon } from "@carlwr/zsh-lexicon"
import { PKG_VERSION } from "@carlwr/zsh-lexicon/meta"
import { describe, expect, it } from "vitest"

import {
  readDeployedIds,
  servedIds,
  vanishedIds,
} from "../../../nlp/node/deployed-ids"

const rewrite = "pnpm --filter zsh-lexicon-web deployed-ids --write"

describe("deployed-ids.json", () => {
  it("lists only records the build still serves", async () => {
    expect(
      vanishedIds(await readDeployedIds(), servedIds(loadLexicon())),
      "deployed links to these break: forward them (AGENTS.md §Routes), or drop them from the list to accept the break",
    ).toEqual([])
  })

  it("follows the zsh-lexicon version", async () => {
    expect(
      (await readDeployedIds()).lexicon,
      `a lexicon bump rewrites the list: ${rewrite}`,
    ).toBe(PKG_VERSION)
  })
})

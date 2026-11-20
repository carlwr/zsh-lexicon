// The records the deployed site serves — every `?r=` link it answers —
// committed, so a lexicon change that drops one fails a test instead of
// breaking links in the wild. Only `scripts/deployed-ids.ts` rewrites the
// list, and never past a dropped record: an `UPDATE_*` golden, regenerated on
// any drift, would guard nothing.

import type { Lexicon } from "@carlwr/zsh-lexicon"
import { PKG_VERSION } from "@carlwr/zsh-lexicon/meta"
import { z } from "zod"

import { compareRecordIds, recordKey } from "../core/types"
import { prettyJson, readJson, writeFileAtomic } from "./io"
import { PATHS } from "./paths"
import { renderedCorpus } from "./rendered-corpus"

export const DeployedIdsSchema = z.object({
  /** The zsh-lexicon version the list was written for. */
  lexicon: z.string(),
  /** `recordKey`s, sorted by `compareRecordIds`. */
  records: z.array(z.string()),
})
export type DeployedIds = z.infer<typeof DeployedIdsSchema>

/** The list as a build over `lexicon` would write it. */
export const servedIds = (lexicon: Lexicon): DeployedIds => ({
  lexicon: PKG_VERSION,
  records: renderedCorpus(lexicon)
    .flatMap(({ records }) => records)
    .sort(compareRecordIds)
    .map(recordKey),
})

/** Listed records `served` lacks: each a deployed link that breaks. */
export function vanishedIds(
  listed: DeployedIds,
  served: DeployedIds,
): string[] {
  const now = new Set(served.records)
  return listed.records.filter(key => !now.has(key))
}

export const readDeployedIds = async (): Promise<DeployedIds> =>
  DeployedIdsSchema.parse(await readJson(PATHS.deployedIds))

export const writeDeployedIds = (ids: DeployedIds): Promise<void> =>
  writeFileAtomic(PATHS.deployedIds, prettyJson(ids))

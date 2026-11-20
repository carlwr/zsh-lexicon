// The deployed-ids list against what a build over this lexicon serves:
// `--check` gates a deploy, `--write` follows a lexicon bump.

import { isDeepStrictEqual } from "node:util"
import { loadLexicon } from "@carlwr/zsh-lexicon"

import {
  readDeployedIds,
  servedIds,
  vanishedIds,
  writeDeployedIds,
} from "../nlp/node/deployed-ids"
import { scriptFlags } from "./_args"

const usage = `\
pnpm --filter zsh-lexicon-web deployed-ids --check | --write

  --check  exit 1 unless nlp/data/deployed-ids.json is what this build serves
  --write  set it to what this build serves; refused while it lists a record
           the build no longer serves\
`
const args = scriptFlags("deployed-ids", usage, ["--check", "--write"])
if (args.size !== 1) {
  console.error("deployed-ids: give one of --check, --write")
  process.exit(2)
}

const say = (msg: string) => console.log(`deployed-ids: ${msg}`)
const fail = (msg: string): never => {
  console.error(`deployed-ids: ${msg}`)
  process.exit(1)
}

const served = servedIds(loadLexicon())
const listed = await readDeployedIds()

const gone = vanishedIds(listed, served)
if (gone.length > 0)
  fail(
    [
      `${gone.length} listed record(s) no longer served — deployed links to them break:`,
      ...gone.map(key => `  ${key}`),
      "forward them, or drop them from the list to accept the break; then --write",
    ].join("\n"),
  )

if (args.has("--check")) {
  if (!isDeepStrictEqual(listed, served))
    fail(
      `the list (zsh-lexicon ${listed.lexicon}, ${listed.records.length} records) is not what this build serves (${served.lexicon}, ${served.records.length}): run \`deployed-ids --write\`, commit, then deploy`,
    )
  say(`${served.records.length} records, as listed`)
} else {
  await writeDeployedIds(served)
  say(
    `written: ${served.records.length} records, zsh-lexicon ${served.lexicon}`,
  )
}

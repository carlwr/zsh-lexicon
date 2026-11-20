// The Pages site, from what two packages build: the SPA at the root, the
// zsh-lexicon API docs under `docs/`. Copies only; a missing input is an
// error naming the command that builds it. Like its inputs, the result serves
// under any prefix.

import {
  cpSync,
  existsSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { basename, join, relative } from "node:path"

import { packageDirs, repoRoot } from "./upstream-graph.mjs"

const me = "site:assemble"
const dirs = packageDirs()
const webDir = dirs.get("zsh-lexicon-web")
const lexiconDir = dirs.get("@carlwr/zsh-lexicon")
const spa = join(webDir, "build")
const docs = join(lexiconDir, ".aux", "docs", "site")
const out = join(repoRoot, ".aux", "site")

const readJson = path => JSON.parse(readFileSync(path, "utf8"))

const missing = [
  [spa, "pnpm --filter zsh-lexicon-web build"],
  [docs, "pnpm docs:zsh-lexicon"],
].filter(([dir]) => !existsSync(dir))
if (missing.length > 0) {
  for (const [dir, cmd] of missing)
    console.error(`${me}: missing ${relative(repoRoot, dir)} — run: ${cmd}`)
  process.exit(1)
}

// `build:index` output, which the SPA build copies from `static/`. Without it
// the site loads but cannot search: fatal where the artifacts are required
// (the deploy), a warning in the model-free builds.
if (!existsSync(join(spa, "artifacts"))) {
  const msg =
    "the SPA build carries no artifacts/ — run `pnpm --filter zsh-lexicon-web build:index`, then rebuild it"
  if (process.env.ZL_REQUIRE_WEB_ARTIFACTS === "1") {
    console.error(`${me}: ${msg} (ZL_REQUIRE_WEB_ARTIFACTS=1)`)
    process.exit(1)
  }
  console.warn(`${me}: warning: ${msg}`)
}

const { repository } = readJson(join(repoRoot, "package.json"))
const web = readJson(join(webDir, "package.json"))
const lexicon = readJson(join(lexiconDir, "package.json"))

const llms = [
  `# ${basename(repository.url)}`,
  "",
  `> ${web.description}`,
  "",
  `- ${lexicon.name} API docs: ./docs/llms.txt`,
  `- README: ${repository.url}#readme`,
  "",
].join("\n")

rmSync(out, { recursive: true, force: true })
cpSync(spa, out, { recursive: true })
cpSync(docs, join(out, "docs"), { recursive: true })
cpSync(
  join(webDir, "THIRD_PARTY_NOTICES.md"),
  join(out, "THIRD_PARTY_NOTICES.md"),
)
writeFileSync(join(out, "llms.txt"), llms)
// Jekyll, wherever it runs, drops `_`-prefixed paths — SvelteKit's `_app/`.
writeFileSync(join(out, ".nojekyll"), "")
console.log(`${me}: ${relative(repoRoot, out)}`)

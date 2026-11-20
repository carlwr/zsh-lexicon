import {
  cpSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const pkgDir = resolve(here, "..")
const distDir = join(pkgDir, "dist")
// Outside dist/, so a docs build cannot leak HTML into the npm tarball. The
// tree is self-contained, relative links only: it serves under any prefix.
const siteDir = join(pkgDir, ".aux", "docs", "site")
const apiDir = join(distDir, "api")
const dataDir = join(pkgDir, "artifacts", "json")

const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"))
// What `data/` is copied from, listed as is — nothing to drift from the copy.
const dataFiles = [
  "index.json",
  ...readdirSync(dataDir)
    .filter(f => f.endsWith(".json") && f !== "index.json")
    .sort(),
]
const entryPoints = Object.keys(pkg.exports).filter(
  sub => !sub.includes("*") && sub !== "./package.json",
)

const llms = [
  `# ${pkg.name}`,
  "",
  `> ${pkg.description}`,
  "",
  "Docs:",
  "- API HTML: ./index.html",
  "- TypeDoc JSON model: ./typedoc.json",
  "- API Extractor models: ./api/",
  "- Structured zsh data: ./data/",
  "",
  "Entry points:",
  ...entryPoints.map(sub => `- ${sub}`),
  "",
  "Structured data files:",
  ...dataFiles.map(file => `- ./data/${file}`),
  "",
].join("\n")

mkdirSync(siteDir, { recursive: true })
rmSync(join(siteDir, "api"), { recursive: true, force: true })
rmSync(join(siteDir, "data"), { recursive: true, force: true })
cpSync(apiDir, join(siteDir, "api"), { recursive: true })
cpSync(dataDir, join(siteDir, "data"), { recursive: true })
writeFileSync(join(siteDir, "llms.txt"), llms)

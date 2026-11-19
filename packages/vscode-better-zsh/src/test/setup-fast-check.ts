// Pinned fast-check seed, the same as zsh-lexicon's, so property tests
// replay identically.
import fc from "fast-check"

const FC_SEED = 16042026

fc.configureGlobal({ seed: FC_SEED })

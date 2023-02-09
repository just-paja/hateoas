import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { guessRootConfig } from 'lerna-jest'

const baseDir = dirname(fileURLToPath(import.meta.url))
const config = guessRootConfig(baseDir)

export default config

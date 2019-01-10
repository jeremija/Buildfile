import {dirname, join} from 'path'
import {statSync} from 'fs'

export function findNodeModulesBin(dir = process.cwd()): string | undefined {
  try {
    const candidate = join(dir, 'node_modules', '.bin')
    const result = statSync(candidate)
    if (result.isDirectory()) {
      return candidate
    }
  } catch (err) {
    // statSync will throw an error if a directory does not exist
  }

  const dir2 = dirname(dir)
  if (dir2 === dir) {
    return
  }
  findNodeModulesBin(dir2)
}


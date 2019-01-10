import {platform} from 'os'
import {dirname, join} from 'path'
import {statSync} from 'fs'

export function getPathSeparator(platform: string) {
  return platform === 'win32' ? ';' : ':'
}

export function addPathVariable(
  currentPath: string, pathToAdd: string | undefined,
) {
  if (!pathToAdd) {
    return currentPath
  }
  const separator = getPathSeparator(platform())
  return `${pathToAdd}${separator}${process.env.PATH}`
}

export function addNodeModulesToPath() {
  process.env.PATH = addPathVariable(
    process.env.PATH!,
    findNodeModulesBin(),
  )
}

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
  return findNodeModulesBin(dir2)
}


import {platform} from 'os'
import {dirname, join, normalize} from 'path'
import {statSync} from 'fs'

export function getPathSeparator(platformValue: string) {
  return platformValue === 'win32' ? ';' : ':'
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

export function getPathWithNodeModules() {
  return addPathVariable(process.env.PATH!, findNodeModulesBin())
}

export function findNodeModulesBin(dir = process.cwd()): string {
  let lastDir = ''
  const paths: string[] = []
  while (dir !== lastDir) {
    try {
      const candidate = join(dir, 'node_modules', '.bin')
      const result = statSync(candidate)
      if (result.isDirectory()) {
        return normalize(candidate)
      }
    } catch (err) {
      // statSync will throw an error if a directory does not exist
    }

    lastDir = dir
    dir = dirname(lastDir)
  }

  return paths.join(getPathSeparator(platform()))
}

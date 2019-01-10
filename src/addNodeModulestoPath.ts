import {findNodeModulesBin} from './findNodeModulesBin'
import * as os from 'os'

export function getPathSeparator(platform: string) {
  return platform === 'win32' ? ';' : ':'
}

export function getPathVariable(path: string, cwd: string) {
  const value = findNodeModulesBin(cwd)
  if (!value) {
    return path
  }
  const separator = getPathSeparator(os.platform())
  return `${value}${separator}${process.env.PATH}`
}

export function addNodeModulesToPath() {
  process.env.PATH = getPathVariable(process.env.PATH!, process.cwd())
}

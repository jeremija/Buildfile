import * as os from 'os'
import {join} from 'path'
import {
  findNodeModulesBin,
  getPathSeparator,
  addPathVariable,
  addNodeModulesToPath,
} from './addNodeModulesToPath'

describe('findNodeModulesBin', () => {

  it('returns the closest node_modules/.bin folder to cwd', () => {
    let value = findNodeModulesBin(process.cwd())
    expect(value).toEqual(join(process.cwd(), 'node_modules', '.bin'))

    value = findNodeModulesBin(join(process.cwd(), 'test', 'bla'))
    expect(value).toEqual(join(process.cwd(), 'node_modules', '.bin'))

    value = findNodeModulesBin(join('/non-existing/dir/bla/123/test'))
    expect(value).toEqual(undefined)
  })

})

describe('getPathSeparator', () => {

  it('returns ";" when win32 and ":" for other systems', () => {
    expect(getPathSeparator('win32')).toEqual(';')
    expect(getPathSeparator('linux')).toEqual(':')
    expect(getPathSeparator('darwin')).toEqual(':')
  })

})

describe('addPathVariable', () => {

  it('does nothing when pathToAdd is undefined', () => {
    const path = process.env.PATH!
    expect(addPathVariable(path, undefined)).toEqual(path)
  })
  it('adds a to path', () => {
    const path = process.env.PATH!
    const separator = getPathSeparator(os.platform())
    expect(addPathVariable(path, '/test')).toEqual(`/test${separator}${path}`)
  })

})

describe('addNodeModulesToPath', () => {

  let path!: string
  beforeEach(() => path = process.env.PATH!)
  afterEach(() => process.env.PATH = path)

  it('modifies path variable when node_modules/.bin found', () => {
    addNodeModulesToPath()
    expect(process.env.PATH).not.toEqual(path)
  })

})
